const test = require("node:test")
const assert = require("node:assert/strict")
const {
  getSendGridDiagnostics,
  sanitizeDiagnosticMessage,
} = require("../sendgridDiagnostics")

test("SendGrid diagnostics retain status and safe provider context", () => {
  const diagnostics = getSendGridDiagnostics({
    response: {
      statusCode: 403,
      body: {
        errors: [
          {
            field: "from.email",
            message: "The from address does not match a verified Sender Identity.",
          },
        ],
      },
    },
  })

  assert.deepEqual(diagnostics, {
    providerStatus: 403,
    providerErrors: [
      {
        code: "from.email",
        message: "The from address does not match a verified Sender Identity.",
      },
    ],
  })
})

test("diagnostics redact secrets and personal identifiers", () => {
  const unsafeMessage = [
    "Authorization: Bearer-token",
    "SG.example.secret",
    "resident@example.com",
    "192.0.2.10",
  ].join(" ")
  const safeMessage = sanitizeDiagnosticMessage(unsafeMessage)

  assert.doesNotMatch(safeMessage, /Bearer-token/)
  assert.doesNotMatch(safeMessage, /SG\.example\.secret/)
  assert.doesNotMatch(safeMessage, /resident@example\.com/)
  assert.doesNotMatch(safeMessage, /192\.0\.2\.10/)
  assert.match(safeMessage, /\[redacted-email\]/)
})

test("diagnostics do not inspect request bodies or arbitrary error messages", () => {
  const diagnostics = getSendGridDiagnostics({
    message: "recipient@example.com and private request content",
    request: {body: {personal: "private"}},
    response: {statusCode: 403},
  })

  assert.deepEqual(diagnostics, {providerStatus: 403, providerErrors: []})
})
