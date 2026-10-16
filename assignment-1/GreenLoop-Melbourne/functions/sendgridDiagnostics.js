const MAX_DIAGNOSTIC_MESSAGE_LENGTH = 300
const MAX_DIAGNOSTIC_ERRORS = 5

function sanitizeDiagnosticCode(value) {
  const safeCode = String(value ?? "sendgrid_error")
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .slice(0, 80)

  return safeCode || "sendgrid_error"
}

function sanitizeDiagnosticMessage(value) {
  if (typeof value !== "string") return "SendGrid rejected the request."

  const safeMessage = value
    .replace(/SG\.[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*/g, "[redacted-token]")
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [redacted-token]")
    .replace(/Authorization\s*[:=]\s*[^\s,;]+/gi, "Authorization: [redacted]")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted-email]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_DIAGNOSTIC_MESSAGE_LENGTH)

  return safeMessage || "SendGrid rejected the request."
}

function getSendGridDiagnostics(error) {
  const responseStatus = Number(error?.response?.statusCode)
  const providerStatus =
    Number.isInteger(responseStatus) && responseStatus >= 100 && responseStatus <= 599
      ? responseStatus
      : "unknown"
  const responseErrors = Array.isArray(error?.response?.body?.errors)
    ? error.response.body.errors
    : []
  const providerErrors = responseErrors.slice(0, MAX_DIAGNOSTIC_ERRORS).map((providerError) => ({
    code: sanitizeDiagnosticCode(providerError?.code || providerError?.field),
    message: sanitizeDiagnosticMessage(providerError?.message),
  }))

  return {providerStatus, providerErrors}
}

module.exports = {
  getSendGridDiagnostics,
  sanitizeDiagnosticCode,
  sanitizeDiagnosticMessage,
}
