const {initializeApp} = require("firebase-admin/app")
const {getFirestore, Timestamp} = require("firebase-admin/firestore")
const {setGlobalOptions} = require("firebase-functions/v2")
const {onCall, HttpsError} = require("firebase-functions/v2/https")
const {defineSecret} = require("firebase-functions/params")
const logger = require("firebase-functions/logger")
const sendgrid = require("@sendgrid/mail")
const {validateEmailRequest} = require("./emailHelpers")
const {getSendGridDiagnostics} = require("./sendgridDiagnostics")

initializeApp()
setGlobalOptions({region: "australia-southeast1", maxInstances: 10})

const sendgridApiKey = defineSecret("SENDGRID_API_KEY")
const sendgridFromEmail = defineSecret("SENDGRID_FROM_EMAIL")
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_SENDS = 5

async function enforceRateLimit(uid) {
  const database = getFirestore()
  const rateLimitReference = database.collection("emailRateLimits").doc(uid)
  const now = Date.now()

  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateLimitReference)
    const existing = snapshot.data()
    const windowStartedAt = existing?.windowStartedAt?.toMillis?.() ?? 0
    const currentCount = existing?.count ?? 0
    const windowExpired = now - windowStartedAt >= RATE_LIMIT_WINDOW_MS

    if (!windowExpired && currentCount >= RATE_LIMIT_MAX_SENDS) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many emails have been requested. Please try again later.",
      )
    }

    transaction.set(rateLimitReference, {
      count: windowExpired ? 1 : currentCount + 1,
      windowStartedAt: Timestamp.fromMillis(windowExpired ? now : windowStartedAt),
      expiresAt: Timestamp.fromMillis(now + RATE_LIMIT_WINDOW_MS),
    })
  })
}

exports.sendRecyclingEmail = onCall(
  {
    secrets: [sendgridApiKey, sendgridFromEmail],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to send an email.")
    }

    let validatedRequest
    try {
      validatedRequest = validateEmailRequest(request.data)
    } catch (error) {
      const messages = {
        PAYLOAD_TOO_LARGE: "The email request is too large.",
        INVALID_RECIPIENT: "Enter a valid recipient email address.",
        MESSAGE_TOO_LONG: "The optional message is too long.",
        INVALID_SELECTION: "Select valid recycling information to share.",
        INVALID_ATTACHMENT: "The CSV attachment did not match the selected recycling information.",
        ATTACHMENT_TOO_LARGE: "The CSV attachment is too large.",
      }
      throw new HttpsError("invalid-argument", messages[error.message] || "Invalid email request.")
    }

    await enforceRateLimit(request.auth.uid)

    const {recipient, message, selectedItems, verifiedCsv} = validatedRequest
    const emailText = [
      message || "A GreenLoop Melbourne user has shared recycling information with you.",
      "",
      `The attached CSV contains ${selectedItems.length} selected recycling ${selectedItems.length === 1 ? "item" : "items"}.`,
    ].join("\n")

    try {
      sendgrid.setApiKey(sendgridApiKey.value())
      await sendgrid.send({
        to: recipient,
        from: sendgridFromEmail.value(),
        subject: "GreenLoop Melbourne recycling information",
        text: emailText,
        attachments: [
          {
            content: Buffer.from(verifiedCsv, "utf8").toString("base64"),
            filename: "greenloop-recycling-information.csv",
            type: "text/csv",
            disposition: "attachment",
          },
        ],
      })
    } catch (error) {
      logger.error("SendGrid email request failed", getSendGridDiagnostics(error))
      throw new HttpsError("internal", "The email could not be sent. Please try again later.")
    }

    logger.info("Recycling email sent", {
      selectedItemCount: selectedItems.length,
    })
    return {success: true, sharedItemCount: selectedItems.length}
  },
)
