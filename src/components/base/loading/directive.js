import { createApp } from 'vue'
import Loading from './loading.vue'
import { addClass, removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative'

const loadingDirective = {
  mounted(el, binding) {
    const app = createApp(Loading)
    const instance = app.mount(document.createElement('div'))
    el.instance = instance
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
    if (typeof title !== 'undefined') {
      el.instance.setTitle(title)
    }
    if (binding.value !== binding.oldValue) {
      binding.value ? append(el) : remove(el)
    }
  }
}

function remove(el) {
  removeClass(el, relativeCls)
  el.removeChild(el.instance.$el)
}

function append(el) {
  // 获取指定元素的 CSS 样式
   const style = getComputedStyle(el)
   if (!['absolute', 'fixed', 'relative'].includes(style.position)) {
    addClass(el, relativeCls)
   }
  el.appendChild(el.instance.$el)
}

export default loadingDirective
