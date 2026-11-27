import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalInput from '@/components/sal-ui/SalInput.vue'

describe('SalButton', () => {
  it('renders slot content and applies variant and size classes', () => {
    const wrapper = mount(SalButton, {
      props: {
        variant: 'danger',
        size: 'lg'
      },
      slots: {
        default: 'Eliminar'
      }
    })

    const button = wrapper.get('button')
    expect(button.text()).toBe('Eliminar')
    expect(button.classes()).toContain('sal-button--danger')
    expect(button.classes()).toContain('sal-button--lg')
    expect(button.attributes('type')).toBe('button')
  })

  it('respects disabled prop', () => {
    const wrapper = mount(SalButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Aceptar'
      }
    })

    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('is-disabled')
  })
})

describe('SalCard', () => {
  it('renders default, header, and footer slots', () => {
    const wrapper = mount(SalCard, {
      props: {
        variant: 'parchment',
        selected: true
      },
      slots: {
        header: 'Título',
        default: 'Contenido',
        footer: 'Pie'
      }
    })

    expect(wrapper.text()).toContain('Título')
    expect(wrapper.text()).toContain('Contenido')
    expect(wrapper.text()).toContain('Pie')
    expect(wrapper.classes()).toContain('sal-card--parchment')
    expect(wrapper.classes()).toContain('is-selected')
  })
})

describe('SalBadge', () => {
  it('renders badge text with tone and size', () => {
    const wrapper = mount(SalBadge, {
      props: {
        tone: 'danger',
        size: 'sm'
      },
      slots: {
        default: 'Gato Negro'
      }
    })

    expect(wrapper.text()).toBe('Gato Negro')
    expect(wrapper.classes()).toContain('sal-badge--danger')
    expect(wrapper.classes()).toContain('sal-badge--sm')
  })
})

describe('SalInput', () => {
  it('supports v-model via defineModel and renders label and error', async () => {
    const wrapper = mount(SalInput, {
      props: {
        modelValue: 'Tituba',
        label: 'Nombre',
        placeholder: 'Jugador',
        error: 'Requerido'
      }
    })

    const input = wrapper.get('input')
    const label = wrapper.get('label')
    const error = wrapper.get('[role="alert"]')

    expect(label.text()).toBe('Nombre')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(error.text()).toBe('Requerido')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect((input.element as HTMLInputElement).value).toBe('Tituba')

    await input.setValue('Sarah Good')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Sarah Good']])
  })
})

describe('SalModal', () => {
  it('supports v-model:open via defineModel and closes on close button', async () => {
    const wrapper = mount(SalModal, {
      props: {
        open: true,
        title: 'El Alba',
        'onUpdate:open': (value: boolean) => {
          void wrapper.setProps({ open: value })
        }
      },
      slots: {
        default: '<p>Despierten brujas</p>'
      }
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('El Alba')
    expect(wrapper.text()).toContain('Despierten brujas')

    await wrapper.get('button[aria-label="Cerrar"]').trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('does not close on backdrop or render close button when closable is false', async () => {
    const wrapper = mount(SalModal, {
      props: {
        open: true,
        closable: false,
        title: 'Secreto'
      },
      slots: {
        default: '<p>Oculto</p>'
      }
    })

    expect(wrapper.find('button[aria-label="Cerrar"]').exists()).toBe(false)

    await wrapper.get('.sal-modal__backdrop').trigger('click')
    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })
})
