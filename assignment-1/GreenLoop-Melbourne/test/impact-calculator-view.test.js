// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ImpactCalculatorView from '../src/views/ImpactCalculatorView.vue'
import EarthLeavesIllustration from '../src/components/illustrations/EarthLeavesIllustration.vue'

let wrapper

function mountCalculator() {
  wrapper = shallowMount(ImpactCalculatorView)
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Environmental Impact Calculator view', () => {
  it('starts with the first supported material, 10 kg and a complete comparison', () => {
    mountCalculator()

    const select = wrapper.get('#impact-material')
    expect(select.element.value).toBe('mixed-recyclables')
    expect(wrapper.get('#impact-weight').element.value).toBe('10')
    expect(wrapper.findAll('optgroup')[0].attributes('label')).toContain('Supported materials')
    expect(wrapper.findAll('optgroup')[1].attributes('label')).toContain('Unsupported materials')
    expect(wrapper.findAll('.result-card')).toHaveLength(3)
    expect(wrapper.text()).toContain('-30.86')
    expect(wrapper.text()).toContain('0.33')
    expect(wrapper.text()).toContain('31.20')
    expect(wrapper.find('.impact-chart[role="img"]').exists()).toBe(true)
    expect(wrapper.findComponent(EarthLeavesIllustration).exists()).toBe(true)
  })

  it('updates all results for another supported WARM material', async () => {
    mountCalculator()
    await wrapper.get('#impact-material').setValue('glass')

    expect(wrapper.findAll('.result-card')).toHaveLength(3)
    expect(wrapper.text()).toContain('-3.09')
    expect(wrapper.text()).toContain('0.22')
    expect(wrapper.text()).toContain('3.31')
    expect(wrapper.find('.impact-chart[role="img"]').exists()).toBe(true)
  })

  it('keeps unsupported material selectable and explains why no estimate is shown', async () => {
    mountCalculator()
    await wrapper.get('#impact-material').setValue('unsupported-plastic')

    expect(wrapper.get('#impact-material').element.value).toBe('unsupported-plastic')
    expect(wrapper.text()).toContain('Estimate unavailable')
    expect(wrapper.text()).toContain('Select a material from the supported group')
    expect(wrapper.findAll('.result-card')).toHaveLength(0)
    expect(wrapper.find('.impact-chart').exists()).toBe(false)
  })
})
