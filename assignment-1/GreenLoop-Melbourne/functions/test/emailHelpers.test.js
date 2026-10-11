const test = require("node:test")
const assert = require("node:assert/strict")
const {
  createRecyclingCsv,
  escapeCsvValue,
  validateEmailRequest,
} = require("../emailHelpers")
const {recyclingItems} = require("../recyclingData")

test("CSV output includes a UTF-8 BOM and safely escapes special characters", () => {
  assert.equal(escapeCsvValue('A, "quoted"\nvalue'), '"A, ""quoted""\nvalue"')
  assert.equal(createRecyclingCsv([recyclingItems[0]]).charCodeAt(0), 0xfeff)
})

test("valid requests return canonical selected items and CSV", () => {
  const selectedItems = [recyclingItems[0], recyclingItems[2]]
  const csvContent = createRecyclingCsv(selectedItems)
  const result = validateEmailRequest({
    recipient: "resident@example.com",
    message: "Please review these items.",
    itemIds: [1, 3],
    csvContent,
  })

  assert.equal(result.recipient, "resident@example.com")
  assert.deepEqual(result.selectedItems, selectedItems)
  assert.equal(result.verifiedCsv, csvContent)
})

test("invalid recipients, selections and modified attachments are rejected", () => {
  assert.throws(
    () => validateEmailRequest({recipient: "invalid", itemIds: [1], csvContent: ""}),
    /INVALID_RECIPIENT/,
  )
  assert.throws(
    () => validateEmailRequest({recipient: "a@example.com", itemIds: [999], csvContent: ""}),
    /INVALID_SELECTION/,
  )
  assert.throws(
    () => validateEmailRequest({recipient: "a@example.com", itemIds: [1], csvContent: "changed"}),
    /INVALID_ATTACHMENT/,
  )
})

test("message and request payload limits are enforced", () => {
  const csvContent = createRecyclingCsv([recyclingItems[0]])
  assert.throws(
    () => validateEmailRequest({
      recipient: "a@example.com",
      message: "x".repeat(1001),
      itemIds: [1],
      csvContent,
    }),
    /MESSAGE_TOO_LONG/,
  )
  assert.throws(
    () => validateEmailRequest({
      recipient: "a@example.com",
      message: "x".repeat(17000),
      itemIds: [1],
      csvContent,
    }),
    /PAYLOAD_TOO_LARGE/,
  )
})
