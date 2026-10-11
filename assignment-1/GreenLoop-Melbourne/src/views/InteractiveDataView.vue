<script setup>
import InteractiveDataTable from '../components/InteractiveDataTable.vue'
import { recyclingItems } from '../data/recyclingItems'
import { resources } from '../data/resources'

const recyclingRows = recyclingItems.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  recyclable: item.recyclable ? 'Yes' : 'Special disposal',
  location: item.location?.locationName || 'Not available',
  suburb: item.location?.suburb || 'Not available',
  distanceKm: item.location?.distanceKm ?? null,
}))

const recyclingColumns = [
  { key: 'name', label: 'Item', searchable: true, sortable: true },
  { key: 'category', label: 'Category', searchable: true, sortable: true },
  { key: 'recyclable', label: 'Recycling option', searchable: true, sortable: true },
  { key: 'location', label: 'Nearest location', searchable: true, sortable: true },
  { key: 'suburb', label: 'Suburb', searchable: true, sortable: true },
  {
    key: 'distanceKm',
    label: 'Approx. distance',
    searchable: false,
    sortable: true,
    format: (value) => (value === null ? 'Not available' : `${value.toFixed(1)} km`),
  },
]

const resourceColumns = [
  { key: 'title', label: 'Resource', searchable: true, sortable: true },
  { key: 'category', label: 'Category', searchable: true, sortable: true },
  { key: 'type', label: 'Type', searchable: true, sortable: true },
  { key: 'description', label: 'Description', searchable: true, sortable: true },
]
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1>Interactive Data</h1>
          <p class="lead">
            Explore GreenLoop recycling and waste-reduction information using searchable,
            sortable tables.
          </p>
        </div>
      </div>

      <div class="d-grid gap-5 mt-4">
        <InteractiveDataTable
          table-id="recycling-data"
          title="Recycling and Location Data"
          description="Compare common items with their recycling category and nearest example drop-off location."
          :rows="recyclingRows"
          :columns="recyclingColumns"
        />

        <InteractiveDataTable
          table-id="resource-data"
          title="Waste Reduction Resources"
          description="Browse the practical GreenLoop guides, tips and checklists already available in the application."
          :rows="resources"
          :columns="resourceColumns"
        />
      </div>
    </div>
  </section>
</template>
