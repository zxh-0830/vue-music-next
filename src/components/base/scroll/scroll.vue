<template>
  <div ref="rootRef">
    <slot></slot>
  </div>
</template>

<script>
import { ref } from 'vue'
import useScroll from './use-scroll'
export default {
  name: 'scroll',
  setup() {
    const rootRef = ref(null)
    useScroll(rootRef)
  },
  data() {
    return {

    }
  },
  components: {

  }
}
</script>

<style scoped lang="scss">

</style>
