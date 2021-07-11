import BScroll from '@better-scroll/core'
import { onMounted, onUnmounted, ref } from 'vue'
export default function useScroll(wrapperRef) {
  const scroll = ref(null)

  onMounted(() => {
    scroll.value = new BScroll(wrapperRef)
  })
  onUnmounted(() => {
    scroll.value.destroy()
  })
}