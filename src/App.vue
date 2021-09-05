<template>
  <m-header></m-header>
  <tab></tab>
  <router-view></router-view>
  <player></player>
</template>

<script>
import Header from '@/components/header/header'
import Tab from '@/components/tab/tab'
import Player from '@/components/player/player'
// import VConsole from 'vconsole'
// eslint-disable-next-line no-unused-vars
// const vConsole = new VConsole()
export default {
  components: {
    MHeader: Header,
    Tab,
    Player
  }
}
</script>

<style lang="scss">

</style>
