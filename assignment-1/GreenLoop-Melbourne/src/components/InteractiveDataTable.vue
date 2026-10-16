<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { FileText } from '@lucide/vue'
import { createCsvContent, downloadCsv } from '../utils/csv'

const props = defineProps({
  tableId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  limitations: {
    type: String,
    default: 'This export contains GreenLoop educational application data and should not be treated as a complete or real-time representation of Melbourne services or outcomes.',
  },
})

const rowsPerPage = 10
const globalSearch = ref('')
const columnSearches = reactive(
  Object.fromEntries(props.columns.filter((column) => column.searchable).map((column) => [column.key, ''])),
)
const sortKey = ref('')
const sortDirection = ref('ascending')
const currentPage = ref(1)
const sortAnnouncement = ref('No column sorting applied.')
const isExportingPdf = ref(false)
const pdfExportError = ref('')

function displayValue(row, column) {
  const value = row[column.key]
  return column.format ? column.format(value, row) : value
}

function normalise(value) {
  return String(value ?? '').toLocaleLowerCase()
}

const filteredRows = computed(() => {
  const globalQuery = normalise(globalSearch.value.trim())

  return props.rows.filter((row) => {
    const matchesGlobal =
      !globalQuery ||
      props.columns.some((column) => normalise(displayValue(row, column)).includes(globalQuery))

    const matchesColumns = props.columns
      .filter((column) => column.searchable)
      .every((column) => {
        const query = normalise(columnSearches[column.key].trim())
        return !query || normalise(displayValue(row, column)).includes(query)
      })

    return matchesGlobal && matchesColumns
  })
})

const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value

  return [...filteredRows.value].sort((firstRow, secondRow) => {
    const firstValue = firstRow[sortKey.value]
    const secondValue = secondRow[sortKey.value]
    let comparison = 0

    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
      comparison = firstValue - secondValue
    } else {
      comparison = String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    }

    return sortDirection.value === 'ascending' ? comparison : -comparison
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / rowsPerPage)))
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return sortedRows.value.slice(start, start + rowsPerPage)
})
const activeConditions = computed(() => {
  const conditions = []
  if (globalSearch.value.trim()) conditions.push(`All columns contain “${globalSearch.value.trim()}”`)
  props.columns
    .filter((column) => column.searchable && columnSearches[column.key].trim())
    .forEach((column) => conditions.push(`${column.label} contains “${columnSearches[column.key].trim()}”`))
  return conditions
})
const sortDescription = computed(() => {
  if (!sortKey.value) return 'Original dataset order'
  const column = props.columns.find(({ key }) => key === sortKey.value)
  return `${column?.label || sortKey.value}, ${sortDirection.value}`
})

watch(
  [globalSearch, () => props.columns.map((column) => columnSearches[column.key])],
  () => {
    currentPage.value = 1
  },
)

function sortBy(column) {
  if (!column.sortable) return

  if (sortKey.value === column.key) {
    sortDirection.value = sortDirection.value === 'ascending' ? 'descending' : 'ascending'
  } else {
    sortKey.value = column.key
    sortDirection.value = 'ascending'
  }

  currentPage.value = 1
  sortAnnouncement.value = `${column.label} sorted ${sortDirection.value}.`
}

function ariaSort(column) {
  return sortKey.value === column.key ? sortDirection.value : 'none'
}

function clearSearches() {
  globalSearch.value = ''
  Object.keys(columnSearches).forEach((key) => {
    columnSearches[key] = ''
  })
}

function exportCsv() {
  const csvContent = createCsvContent(props.columns, sortedRows.value, displayValue)
  downloadCsv(`${props.tableId}.csv`, csvContent)
}

async function exportPdf() {
  isExportingPdf.value = true
  pdfExportError.value = ''
  try {
    const { downloadInteractiveDataPdf } = await import('../utils/interactiveDataPdf')
    downloadInteractiveDataPdf(
      {
        title: `${props.title} — GreenLoop Melbourne`,
        columns: props.columns,
        rows: sortedRows.value,
        getValue: displayValue,
        activeConditions: activeConditions.value,
        sortDescription: sortDescription.value,
        totalAvailable: props.rows.length,
        limitations: props.limitations,
      },
      `${props.tableId}.pdf`,
    )
  } catch (error) {
    pdfExportError.value = 'The PDF could not be generated. Please try again or use the CSV export.'
    if (import.meta.env.DEV) console.error(`${props.tableId} PDF export failed`, error)
  } finally {
    isExportingPdf.value = false
  }
}
</script>

<template>
  <section class="card border-0 shadow-sm" :aria-labelledby="`${tableId}-heading`">
    <div class="card-body p-3 p-md-4">
      <div class="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div>
          <h2 :id="`${tableId}-heading`" class="h4 mb-1">{{ title }}</h2>
          <p class="text-secondary mb-0">{{ description }}</p>
        </div>
        <div class="table-global-search">
          <label class="form-label fw-semibold" :for="`${tableId}-global-search`">
            Search all columns
          </label>
          <input
            :id="`${tableId}-global-search`"
            v-model="globalSearch"
            class="form-control"
            type="search"
            :placeholder="`Search ${title.toLowerCase()}`"
          />
        </div>
      </div>

      <fieldset class="border rounded-3 p-3 mb-4">
        <legend class="float-none w-auto px-2 fs-6 fw-semibold mb-0">Filter individual columns</legend>
        <div class="row g-3">
          <div
            v-for="column in columns.filter((item) => item.searchable)"
            :key="column.key"
            class="col-12 col-sm-6 col-lg-4"
          >
            <label class="form-label" :for="`${tableId}-${column.key}-search`">
              {{ column.label }}
            </label>
            <input
              :id="`${tableId}-${column.key}-search`"
              v-model="columnSearches[column.key]"
              class="form-control form-control-sm"
              type="search"
              :placeholder="`Filter by ${column.label.toLowerCase()}`"
            />
          </div>
        </div>
        <button class="btn btn-sm btn-outline-secondary mt-3" type="button" @click="clearSearches">
          Clear searches
        </button>
      </fieldset>

      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <p class="small text-secondary mb-0" role="status" aria-live="polite">
          {{ sortedRows.length }} {{ sortedRows.length === 1 ? 'record' : 'records' }} found
        </p>
        <p class="visually-hidden" role="status" aria-live="polite">{{ sortAnnouncement }}</p>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <p class="small text-secondary mb-0">Maximum 10 rows per page</p>
          <button
            class="btn btn-sm btn-success"
            type="button"
            :disabled="sortedRows.length === 0"
            @click="exportCsv"
          >
            Export CSV
          </button>
          <button
            class="btn btn-sm btn-outline-success pdf-export-button"
            type="button"
            :disabled="isExportingPdf"
            :aria-busy="isExportingPdf"
            @click="exportPdf"
          >
            <FileText :size="16" aria-hidden="true" />
            {{ isExportingPdf ? 'Creating PDF…' : 'Export PDF' }}
          </button>
        </div>
      </div>

      <p v-if="pdfExportError" class="alert alert-danger py-2" role="alert">
        {{ pdfExportError }}
      </p>

      <div
        class="table-responsive border rounded-3"
        role="region"
        tabindex="0"
        :aria-label="`${title} table; scroll horizontally when needed`"
      >
        <table class="table table-hover align-middle mb-0">
          <caption class="visually-hidden">{{ title }} with sortable and searchable columns</caption>
          <thead class="table-success">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                :aria-sort="column.sortable ? ariaSort(column) : undefined"
              >
                <button
                  v-if="column.sortable"
                  class="sort-button"
                  type="button"
                  :aria-label="`${column.label}: sort ${sortKey === column.key && sortDirection === 'ascending' ? 'descending' : 'ascending'}`"
                  @click="sortBy(column)"
                >
                  {{ column.label }}
                  <span aria-hidden="true">
                    {{ sortKey === column.key ? (sortDirection === 'ascending' ? '▲' : '▼') : '↕' }}
                  </span>
                </button>
                <span v-else>{{ column.label }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id">
              <td v-for="column in columns" :key="column.key">
                {{ displayValue(row, column) }}
              </td>
            </tr>
            <tr v-if="paginatedRows.length === 0">
              <td :colspan="columns.length" class="text-center text-secondary py-4">
                No records match the current searches.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3" :aria-label="`${title} pagination`">
        <span class="small text-secondary" role="status" aria-live="polite">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <div class="btn-group" role="group" aria-label="Pagination controls">
          <button
            class="btn btn-sm btn-outline-success"
            type="button"
            :disabled="currentPage === 1"
            @click="currentPage -= 1"
          >
            Previous
          </button>
          <button
            class="btn btn-sm btn-outline-success"
            type="button"
            :disabled="currentPage === totalPages"
            @click="currentPage += 1"
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.table-global-search {
  width: min(100%, 22rem);
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  color: inherit;
  font: inherit;
  font-weight: 600;
  background: transparent;
}

.sort-button:hover,
.sort-button:focus-visible {
  color: #146c43;
  text-decoration: underline;
}

th,
td {
  min-width: 8rem;
}

.pdf-export-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
</style>
