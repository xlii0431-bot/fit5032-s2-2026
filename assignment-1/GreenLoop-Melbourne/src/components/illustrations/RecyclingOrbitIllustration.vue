<template>
  <svg class="gl-illustration recycling-orbit-illustration" viewBox="0 0 320 320" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="orbit-surface" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--gl-illustration-soft)" />
        <stop offset="1" stop-color="var(--gl-illustration-surface)" />
      </linearGradient>
      <marker id="recycle-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 8 4 0 8Z" fill="var(--gl-illustration-accent)" />
      </marker>
    </defs>
    <circle cx="160" cy="160" r="142" fill="none" stroke="var(--gl-illustration-line)" stroke-width="2" />
    <circle cx="160" cy="160" r="111" fill="none" stroke="var(--gl-illustration-line)" stroke-width="2" stroke-dasharray="5 9" />
    <circle cx="160" cy="160" r="69" fill="url(#orbit-surface)" stroke="var(--gl-illustration-line-strong)" stroke-width="3" />

    <g class="illustration-breathe" fill="none" stroke="var(--gl-illustration-accent)" stroke-width="10" stroke-linecap="round" marker-end="url(#recycle-arrow)">
      <path d="M132 130c15-22 42-28 64-13" />
      <path d="M204 145c10 24-2 50-27 60" />
      <path d="M156 207c-26-4-43-25-40-51" />
    </g>

    <g class="illustration-orbit">
      <g transform="translate(145 25)">
        <path d="M8 9h14l3 8v30c0 5-4 9-9 9h-2c-5 0-9-4-9-9V17Z" fill="var(--gl-illustration-blue)" stroke="var(--gl-illustration-ink)" stroke-width="2" />
        <path d="M10 2h10v8H10Z" fill="var(--gl-illustration-surface)" stroke="var(--gl-illustration-ink)" stroke-width="2" />
        <path d="M8 29h17" stroke="var(--gl-illustration-surface)" stroke-width="3" />
      </g>
      <g transform="translate(254 151) rotate(8)">
        <rect x="0" y="0" width="42" height="53" rx="4" fill="var(--gl-illustration-paper)" stroke="var(--gl-illustration-ink)" stroke-width="2" />
        <path d="M9 13h24M9 23h20M9 33h24" stroke="var(--gl-illustration-ink)" stroke-width="2" opacity=".65" />
      </g>
      <g transform="translate(30 197) rotate(-8)">
        <path d="M5 8c0-5 32-5 32 0v43c0 6-32 6-32 0Z" fill="var(--gl-illustration-can)" stroke="var(--gl-illustration-ink)" stroke-width="2" />
        <ellipse cx="21" cy="8" rx="16" ry="5" fill="var(--gl-illustration-surface)" stroke="var(--gl-illustration-ink)" stroke-width="2" />
        <path d="M11 29h20" stroke="var(--gl-illustration-ink)" stroke-width="2" opacity=".6" />
      </g>
    </g>
    <g class="illustration-leaf" transform="translate(232 64) rotate(28)">
      <path d="M0 24C3 5 20 0 35 2c-1 18-12 32-35 22Z" fill="var(--gl-illustration-leaf)" />
      <path d="M3 23 29 7" stroke="var(--gl-illustration-ink)" stroke-width="2" fill="none" />
    </g>
  </svg>
</template>
