// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import '../src/assets/main.css'
import AccessibilityPreferences from '../src/components/AccessibilityPreferences.vue'
import GreenLoopGuide from '../src/components/GreenLoopGuide.vue'
import HomeView from '../src/views/HomeView.vue'
import RecyclingOrbitIllustration from '../src/components/illustrations/RecyclingOrbitIllustration.vue'
import WasteSortingIllustration from '../src/components/illustrations/WasteSortingIllustration.vue'
import EarthLeavesIllustration from '../src/components/illustrations/EarthLeavesIllustration.vue'
import LocationRouteIllustration from '../src/components/illustrations/LocationRouteIllustration.vue'
import AnalyticsGrowthIllustration from '../src/components/illustrations/AnalyticsGrowthIllustration.vue'
import DataFlowIllustration from '../src/components/illustrations/DataFlowIllustration.vue'
import FavouriteLeafIllustration from '../src/components/illustrations/FavouriteLeafIllustration.vue'
import OfflinePhoneIllustration from '../src/components/illustrations/OfflinePhoneIllustration.vue'
import EcoMailIllustration from '../src/components/illustrations/EcoMailIllustration.vue'
import GreenCityIllustration from '../src/components/illustrations/GreenCityIllustration.vue'
import CommunityGardenIllustration from '../src/components/illustrations/CommunityGardenIllustration.vue'
import EducationResourcesIllustration from '../src/components/illustrations/EducationResourcesIllustration.vue'
import { getChartFontSize } from '../src/utils/chartPreferences'
import {
  ACCESSIBILITY_PREFERENCES_KEY,
  initializeAccessibilityPreferences,
  resetAccessibilityPreferences,
  updateAccessibilityPreferences,
} from '../src/utils/accessibilityPreferences'

let wrapper
const mediaListeners = { motion: null, colorScheme: null }
const mediaState = { motion: true, dark: false }

function makeRouter() {
  const View = { template: '<div />' }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      '/', '/recycling-guide', '/locations', '/impact-calculator', '/favourites', '/analytics', '/offline-guide',
      '/resources', '/events', '/interactive-data', '/share-email',
    ].map((path) => ({ path, component: View })),
  })
}

beforeEach(() => {
  localStorage.clear()
  mediaState.motion = true
  mediaState.dark = false
  window.matchMedia = vi.fn((query) => ({
    get matches() { return query.includes('color-scheme') ? mediaState.dark : mediaState.motion },
    addEventListener: vi.fn((_event, callback) => {
      if (query.includes('color-scheme')) mediaListeners.colorScheme = callback
      else mediaListeners.motion = callback
    }),
    removeEventListener: vi.fn(),
  }))
  resetAccessibilityPreferences()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-reduce-motion')
  document.documentElement.removeAttribute('data-high-contrast')
  document.documentElement.removeAttribute('data-simplified-layout')
  document.documentElement.removeAttribute('data-text-size')
  document.documentElement.removeAttribute('data-color-scheme')
  document.documentElement.style.removeProperty('color-scheme')
})

describe('sensory-friendly preferences', () => {
  it('persists and applies explicit preferences to the application root', () => {
    initializeAccessibilityPreferences()
    updateAccessibilityPreferences({ motion: 'reduce', highContrast: true, simplifiedLayout: true })

    expect(JSON.parse(localStorage.getItem(ACCESSIBILITY_PREFERENCES_KEY))).toEqual({
      motion: 'reduce', highContrast: true, simplifiedLayout: true,
      textSize: 'normal', colorScheme: 'system',
    })
    expect(document.documentElement.dataset.reduceMotion).toBe('true')
    expect(document.documentElement.dataset.highContrast).toBe('true')
    expect(document.documentElement.dataset.simplifiedLayout).toBe('true')
  })

  it('provides labelled controls and closes with Escape while returning focus', async () => {
    wrapper = mount(AccessibilityPreferences, { attachTo: document.body })
    const trigger = wrapper.get('button.account-action')
    await trigger.trigger('click')

    expect(document.querySelector('[role="dialog"]')).toBeTruthy()
    expect(document.querySelector('label[for="high-contrast-preference"]')?.textContent).toContain('High contrast')
    document.querySelector('[role="dialog"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
  })

  it('makes application background inert while the modal is open and restores it on close', async () => {
    const appRoot = document.createElement('div')
    appRoot.id = 'app'
    document.body.appendChild(appRoot)
    wrapper = mount(AccessibilityPreferences, { attachTo: appRoot })
    await wrapper.get('button.account-action').trigger('click')
    expect(appRoot.inert).toBe(true)
    expect(appRoot.getAttribute('aria-hidden')).toBe('true')
    expect(document.activeElement.closest('[role="dialog"]')).toBeTruthy()
    document.querySelector('[aria-label="Close accessibility preferences"]').click()
    await wrapper.vm.$nextTick()
    expect(appRoot.inert).toBe(false)
    expect(appRoot.hasAttribute('aria-hidden')).toBe(false)
  })

  it('persists preferences, closes after Save and restores focus to the opener', async () => {
    wrapper = mount(AccessibilityPreferences, { attachTo: document.body })
    const trigger = wrapper.get('button.account-action')
    await trigger.trigger('click')

    document.querySelector('#motion-reduce').click()
    document.querySelector('#text-size-extra-large').click()
    document.querySelector('#colour-scheme-dark').click()
    document.querySelector('#high-contrast-preference').click()
    document.querySelector('#simplified-layout-preference').click()
    document.querySelector('.save-preferences').click()
    await wrapper.vm.$nextTick()

    expect(JSON.parse(localStorage.getItem(ACCESSIBILITY_PREFERENCES_KEY))).toEqual({
      motion: 'reduce', highContrast: true, simplifiedLayout: true,
      textSize: 'extra-large', colorScheme: 'dark',
    })
    expect(document.documentElement.dataset.reduceMotion).toBe('true')
    expect(document.documentElement.dataset.highContrast).toBe('true')
    expect(document.documentElement.dataset.simplifiedLayout).toBe('true')
    expect(document.documentElement.dataset.textSize).toBe('extra-large')
    expect(document.documentElement.dataset.colorScheme).toBe('dark')
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    expect(document.querySelector('[role="status"]').textContent).toContain('saved')
  })

  it('persists global text size and dark mode and applies both immediately', () => {
    updateAccessibilityPreferences({
      motion: 'allow',
      highContrast: false,
      simplifiedLayout: false,
      textSize: 'extra-large',
      colorScheme: 'dark',
    })

    expect(document.documentElement.dataset.textSize).toBe('extra-large')
    expect(document.documentElement.dataset.colorScheme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(JSON.parse(localStorage.getItem(ACCESSIBILITY_PREFERENCES_KEY))).toMatchObject({
      textSize: 'extra-large', colorScheme: 'dark',
    })
    expect(getChartFontSize('small')).toBe(11)
    expect(getChartFontSize('normal')).toBe(12)
    expect(getChartFontSize('large')).toBe(14)
    expect(getChartFontSize('extra-large')).toBe(16)
  })

  it('tracks the operating-system colour scheme when System is selected', () => {
    initializeAccessibilityPreferences()
    updateAccessibilityPreferences({
      motion: 'system', highContrast: false, simplifiedLayout: false,
      textSize: 'normal', colorScheme: 'system',
    })
    expect(document.documentElement.dataset.colorScheme).toBe('light')

    mediaState.dark = true
    mediaListeners.colorScheme?.({ matches: true })
    expect(document.documentElement.dataset.colorScheme).toBe('dark')
  })

  it('keeps the modal open when preferences are reset', async () => {
    wrapper = mount(AccessibilityPreferences, { attachTo: document.body })
    await wrapper.get('button.account-action').trigger('click')
    const resetButton = [...document.querySelectorAll('.preferences-dialog button')]
      .find((button) => button.textContent.includes('Reset'))
    resetButton.click()
    await wrapper.vm.$nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeTruthy()
    expect(localStorage.getItem(ACCESSIBILITY_PREFERENCES_KEY)).toBeNull()
    expect(document.querySelector('#text-size-normal').checked).toBe(true)
    expect(document.querySelector('#colour-scheme-system').checked).toBe(true)
  })

  it('removes only decorative homepage artwork while keeping content and actions visible', async () => {
    updateAccessibilityPreferences({ motion: 'reduce', highContrast: true, simplifiedLayout: true, textSize: 'extra-large', colorScheme: 'dark' })
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    wrapper = mount(HomeView, { attachTo: document.body, global: { plugins: [router] } })

    const css = readFileSync('src/assets/main.css', 'utf8')
    expect(css).toMatch(/data-simplified-layout="true"[^}]*\.hero-visual-column,[\s\S]*?display:\s*none\s*!important/)
    expect(document.documentElement.dataset.simplifiedLayout).toBe('true')
    expect(document.documentElement.dataset.textSize).toBe('extra-large')
    expect(document.documentElement.dataset.colorScheme).toBe('dark')
    expect(getComputedStyle(wrapper.get('.hero-primary').element).display).not.toBe('none')
    expect(wrapper.get('#home-heading').isVisible()).toBe(true)
    expect(wrapper.get('#workflow-heading').isVisible()).toBe(true)
    expect(wrapper.findAll('.workflow-card a')).toHaveLength(3)
    expect(wrapper.findAll('.home-feature-card a')).toHaveLength(7)
  })

  it('keeps preference and guide controls visible when all sensory settings are combined', async () => {
    updateAccessibilityPreferences({ motion: 'reduce', highContrast: true, simplifiedLayout: true, textSize: 'extra-large', colorScheme: 'dark' })
    wrapper = mount(AccessibilityPreferences, { attachTo: document.body })
    await wrapper.get('button.account-action').trigger('click')

    const preferenceControls = [...document.querySelectorAll('.preferences-dialog input, .preferences-dialog button')]
    expect(preferenceControls.length).toBeGreaterThan(6)
    preferenceControls.forEach((control) => {
      const style = getComputedStyle(control)
      expect(style.display).not.toBe('none')
      expect(style.visibility).not.toBe('hidden')
      expect(style.opacity).not.toBe('0')
    })

    wrapper.unmount()
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    wrapper = mount(GreenLoopGuide, { attachTo: document.body, global: { plugins: [router] } })
    const launcher = wrapper.get('.guide-launcher')
    expect(getComputedStyle(launcher.element).display).not.toBe('none')
    await launcher.trigger('click')
    expect(wrapper.findAll('.guide-topic')).toHaveLength(6)
    wrapper.findAll('.guide-topic').forEach((control) => expect(control.isVisible()).toBe(true))
  })
})

describe('GreenLoop Guide', () => {
  it('offers working links for every guided destination', async () => {
    const router = makeRouter()
    await router.push('/recycling-guide')
    await router.isReady()
    wrapper = mount(GreenLoopGuide, { attachTo: document.body, global: { plugins: [router] } })
    await wrapper.get('.guide-launcher').trigger('click')

    const questions = wrapper.findAll('.guide-topic')
    expect(questions).toHaveLength(6)
    const expectedRoutes = ['/recycling-guide', '/locations', '/impact-calculator', '/favourites', '/analytics', '/offline-guide']
    for (let index = 0; index < questions.length; index += 1) {
      await questions[index].trigger('click')
      expect(wrapper.get('.guide-answer a').attributes('href')).toBe(expectedRoutes[index])
    }
  })

  it('does not open automatically and supports Escape with focus restoration', async () => {
    const router = makeRouter()
    await router.push('/recycling-guide')
    await router.isReady()
    wrapper = mount(GreenLoopGuide, { attachTo: document.body, global: { plugins: [router] } })
    const launcher = wrapper.get('.guide-launcher')
    expect(wrapper.find('.guide-panel').exists()).toBe(false)

    await launcher.trigger('click')
    expect(wrapper.get('.guide-panel').attributes('role')).toBe('dialog')
    await wrapper.get('.guide-panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.guide-panel').exists()).toBe(false)
    expect(document.activeElement).toBe(launcher.element)
  })
})

describe('sensory-friendly sustainability illustrations', () => {
  it('uses decorative SVGs with gentle animation hooks', () => {
    wrapper = mount({
      components: {
        RecyclingOrbitIllustration,
        WasteSortingIllustration,
        EarthLeavesIllustration,
        LocationRouteIllustration,
        AnalyticsGrowthIllustration,
        DataFlowIllustration,
        FavouriteLeafIllustration,
        OfflinePhoneIllustration,
        EcoMailIllustration,
        GreenCityIllustration,
        CommunityGardenIllustration,
        EducationResourcesIllustration,
      },
      template: '<div><RecyclingOrbitIllustration/><WasteSortingIllustration/><EarthLeavesIllustration/><LocationRouteIllustration/><AnalyticsGrowthIllustration/><DataFlowIllustration/><FavouriteLeafIllustration/><OfflinePhoneIllustration/><EcoMailIllustration/><GreenCityIllustration/><CommunityGardenIllustration/><EducationResourcesIllustration/></div>',
    })

    const illustrations = wrapper.findAll('svg.gl-illustration')
    expect(illustrations).toHaveLength(12)
    illustrations.forEach((illustration) => {
      expect(illustration.attributes('aria-hidden')).toBe('true')
      expect(illustration.attributes('focusable')).toBe('false')
    })

    const css = readFileSync('src/assets/main.css', 'utf8')
    expect(css).toContain('animation: gl-orbit 12s linear infinite')
    expect(css).toContain('animation: gl-sort 12s ease-in-out infinite')
    expect(css).toContain('animation: gl-earth-drift 11s ease-in-out infinite')
    expect(css).toContain('animation: gl-pin-float 10s ease-in-out infinite')
    expect(css).toContain('animation: gl-bar-grow 10s ease-in-out infinite')
    expect(css).toContain('animation: gl-data-flow 12s ease-in-out infinite')
    expect(css).toContain('animation: gl-download 10s ease-in-out infinite')
    expect(css).toContain('animation: gl-plane 12s ease-in-out infinite')
    expect(css).toContain('animation: gl-water-drop 11s ease-in-out infinite')
    expect(css).toContain('animation: gl-page-turn 12s ease-in-out infinite')
  })

  it('places the extended illustrations only in suitable page introductions', () => {
    const pageIllustrations = {
      'src/views/AnalyticsView.vue': 'AnalyticsGrowthIllustration',
      'src/views/InteractiveDataView.vue': 'DataFlowIllustration',
      'src/views/FavouritesView.vue': 'FavouriteLeafIllustration',
      'src/views/OfflineGuideView.vue': 'OfflinePhoneIllustration',
      'src/views/ShareEmailView.vue': 'EcoMailIllustration',
      'src/views/AboutView.vue': 'GreenCityIllustration',
      'src/views/EventsView.vue': 'CommunityGardenIllustration',
      'src/views/ResourcesView.vue': 'EducationResourcesIllustration',
    }

    for (const [path, componentName] of Object.entries(pageIllustrations)) {
      const source = readFileSync(path, 'utf8')
      expect(source).toContain(`import ${componentName}`)
      expect(source).toContain(`<${componentName} class="page-intro-illustration`)
    }
  })

  it('switches illustration motion immediately and removes decoration in simplified mode', () => {
    wrapper = mount(RecyclingOrbitIllustration)
    updateAccessibilityPreferences({ motion: 'allow', highContrast: false, simplifiedLayout: false, textSize: 'normal', colorScheme: 'light' })
    expect(document.documentElement.dataset.reduceMotion).toBe('false')
    expect(wrapper.find('.illustration-orbit').exists()).toBe(true)

    updateAccessibilityPreferences({ motion: 'reduce', highContrast: true, simplifiedLayout: false, textSize: 'extra-large', colorScheme: 'dark' })
    expect(document.documentElement.dataset.reduceMotion).toBe('true')
    expect(wrapper.find('.illustration-orbit').exists()).toBe(true)

    updateAccessibilityPreferences({ motion: 'reduce', highContrast: true, simplifiedLayout: true, textSize: 'extra-large', colorScheme: 'dark' })
    expect(document.documentElement.dataset.simplifiedLayout).toBe('true')
    expect(readFileSync('src/assets/main.css', 'utf8')).toMatch(/data-simplified-layout="true"[^}]*\.gl-illustration[\s\S]*?display:\s*none/)
  })
})
