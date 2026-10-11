const {recyclingItems} = require("./recyclingData")

const MAX_MESSAGE_LENGTH = 1000
const MAX_REQUEST_BYTES = 16 * 1024
const MAX_ATTACHMENT_BYTES = 100 * 1024
const MAX_SELECTED_ITEMS = 20

const csvColumns = [
  {key: "name", label: "Item"},
  {key: "category", label: "Category"},
  {key: "recyclable", label: "Recycling Option"},
  {key: "disposal", label: "Disposal Guidance"},
  {key: "description", label: "Description"},
  {key: "location", label: "Nearest Location"},
  {key: "suburb", label: "Suburb"},
  {key: "distance", label: "Approx. Distance"},
]

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function createRecyclingCsv(items) {
  const headers = csvColumns.map((column) => escapeCsvValue(column.label)).join(",")
  const rows = items.map((item) =>
    csvColumns.map((column) => escapeCsvValue(item[column.key])).join(","),
  )

  return `\uFEFF${[headers, ...rows].join("\r\n")}`
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

function validateEmailRequest(data) {
  const requestBytes = Buffer.byteLength(JSON.stringify(data ?? {}), "utf8")
  if (requestBytes > MAX_REQUEST_BYTES) {
    throw new Error("PAYLOAD_TOO_LARGE")
  }

  const recipient = typeof data?.recipient === "string" ? data.recipient.trim().toLowerCase() : ""
  const message = typeof data?.message === "string" ? data.message.trim() : ""
  const itemIds = Array.isArray(data?.itemIds) ? [...new Set(data.itemIds)] : []

  if (!isValidEmail(recipient)) throw new Error("INVALID_RECIPIENT")
  if (message.length > MAX_MESSAGE_LENGTH) throw new Error("MESSAGE_TOO_LONG")
  if (itemIds.length === 0 || itemIds.length > MAX_SELECTED_ITEMS) {
    throw new Error("INVALID_SELECTION")
  }
  if (!itemIds.every((itemId) => Number.isInteger(itemId))) {
    throw new Error("INVALID_SELECTION")
  }

  const selectedItems = itemIds.map((itemId) => recyclingItems.find((item) => item.id === itemId))
  if (selectedItems.some((item) => !item)) throw new Error("INVALID_SELECTION")

  const verifiedCsv = createRecyclingCsv(selectedItems)
  if (data.csvContent !== verifiedCsv) throw new Error("INVALID_ATTACHMENT")
  if (Buffer.byteLength(verifiedCsv, "utf8") > MAX_ATTACHMENT_BYTES) {
    throw new Error("ATTACHMENT_TOO_LARGE")
  }

  return {recipient, message, selectedItems, verifiedCsv}
}

module.exports = {
  MAX_ATTACHMENT_BYTES,
  MAX_MESSAGE_LENGTH,
  MAX_REQUEST_BYTES,
  createRecyclingCsv,
  escapeCsvValue,
  isValidEmail,
  validateEmailRequest,
}
