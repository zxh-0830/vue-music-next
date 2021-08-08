import { createApp } from 'vue'
import { addClass, removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative'

export default function createLoadingLikeDirective(comp) {
  return {
    mounted(el, binding) {
      const app = createApp(comp)
      const instance = app.mount(document.createElement('div'))
      const name = comp.name
      if (!el[name]) {
        el[name] = {}
      }

      el[name].instance = instance
      const title = binding.arg
      if (typeof title !== 'undefined') {
        instance.setTitle(title)
      }

      if (binding.value) {
        append(el)
      }
    },

    updated(el, binding) {
      const title = binding.arg
      const name = comp.name
      if (typeof title !== 'undefined') {
        el[name].instance.setTitle(title)
      }
      if (binding.value !== binding.oldValue) {
        binding.value ? append(el) : remove(el)
      }
    }
  }

  function remove(el) {
    const name = comp.name
    removeClass(el, relativeCls)
    el.removeChild(el[name].instance.$el)
  }

  function append(el) {
    const name = comp.name
    // 获取指定元素的 CSS 样式
     const style = getComputedStyle(el)
     if (!['absolute', 'fixed', 'relative'].includes(style.position)) {
      addClass(el, relativeCls)
     }
    el.appendChild(el[name].instance.$el)
  }
}
