<template>
  <div class="player">
    <div
      class="normal-player"
      v-show="fullScreen"
    >
      <div class="background">
        <img :src="currentSong.pic">
      </div>
      <div class="top">
        <div
          class="back"
          @click="goBack"
        >
          <i class="icon-back"></i>
        </div>
        <h1 class="title">{{ currentSong.name }}</h1>
        <h2 class="subtitle">{{ currentSong.singer}}</h2>
      </div>
      <div
        class="middle"
        @touchstart.prevent="onMiddleTouchStart"
        @touchmove.prevent="onMiddleTouchMove"
        @touchend.prevent="onMiddleTouchEnd"
      >
        <div
          class="middle-l"
          :style="middleLStyle"
        >
          <div class="cd-wrapper">
            <div
              ref="cdRef"
              class="cd"
              >
              <img
                ref="cdImageRef"
                class="image"
                :class="cdCls"
                :src="currentSong.pic">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <scroll
          class="middle-r"
          ref="lyricScrollRef"
          :style="middleRStyle"
        >
          <div class="lyric-wrapper">
            <div v-if="currentLyric" ref="lyricListRef">
              <p
                class="text"
                :class="{'current': currentLineNum === index}"
                v-for="(line, index) in currentLyric.lines"
                :key="line.num"
              >
                {{line.txt}}
              </p>
            </div>
            <div class="pure-music" v-show="pureMusicLyric">
              <p>{{pureMusicLyric}}</p>
            </div>
          </div>
        </scroll>
      </div>
      <div class="bottom">
        <div class="progress-wrapper">
          <span class="time time-l">{{ formatTime(currentTime)}}</span>
          <div class="progress-bar-wrapper">
            <progress-bar
              :progress="progress"
              @progress-changing="onProgressChanging"
              @progress-changed="onProgressChanged"
            ></progress-bar>
          </div>
          <span class="time time-r">{{ formatTime(currentSong.duration) }}</span>
        </div>
        <div class="operators">
          <div class="icon i-left">
            <i @click="changeMode" :class="modeIcon"></i>
          </div>
          <div class="icon i-left" :class="disableCls">
            <i @click="prev" class="icon-prev"></i>
          </div>
          <div class="icon i-center" :class="disableCls">
            <i @click="togglePlay" :class="playIcon" ></i>
          </div>
          <div class="icon i-right" :class="disableCls">
            <i @click="next" class="icon-next"></i>
          </div>
          <div class="icon i-right">
            <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
          </div>
        </div>
      </div>
    </div>
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCD from './use-cd'
import useLyric from './use-lyric'
import useMiddleInteractive from './use-middle-interactive'
import progressBar from './progress-bar.vue'
import { formatTime } from '@/assets/js/util'
import { PLAY_MODE } from '@/assets/js/constant.js'
import Scroll from '@/components/base/scroll/scroll.vue'

export default {
  components: {
    progressBar,
    Scroll
},
  name: 'player',
  setup() {
    const audioRef = ref(null)
    const songReady = ref(false)
    const currentTime = ref(0)
    let progressChanging = false

    const store = useStore()
    const fullScreen = computed(() => store.state.fullScreen)
    const currentSong = computed(() => store.getters.currentSong)
    const playing = computed(() => store.state.playing)
    const playIcon = computed(() => {
      return playing.value ? 'icon-pause' : 'icon-play'
    })
    const currentIndex = computed(() => store.state.currentIndex)
    const playlist = computed(() => store.state.playlist)
    const disableCls = computed(() => {
      return songReady.value ? '' : 'disable'
    })
    const progress = computed(() => {
      return currentTime.value / currentSong.value.duration
    })
    const playMode = computed(() => store.state.playMode)

    const { modeIcon, changeMode } = useMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()
    const { cdCls, cdRef, cdImageRef } = useCD()
    const { currentLyric, currentLineNum, playLyric, pureMusicLyric, playingLyric, stopLyric, lyricScrollRef, lyricListRef } = useLyric({ songReady, currentTime })
    const { currentShow, middleLStyle, middleRStyle, onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd } = useMiddleInteractive()
    watch(currentSong, (newSong) => {
      if (!newSong.id || !newSong.url) {
        return
      }
      currentTime.value = 0
      songReady.value = false
      const audioEl = audioRef.value
      audioEl.src = newSong.url
      audioEl.play()
    })
    watch(playing, (newPlaying) => {
      if (!songReady.value) {
        return
      }
      const audioEl = audioRef.value
      if (newPlaying) {
        audioEl.play()
        playLyric()
      } else {
        audioEl.pause()
        stopLyric()
      }
    })

    function goBack() {
      store.commit('setFullScreen', false)
    }
    function togglePlay() {
      if (!songReady.value) {
        return
      }
      store.commit('setPlayingState', !playing.value)
    }
    function pause() {
      store.commit('setPlayingState', false)
    }
    function prev() {
      const list = playlist.value
      let index = currentIndex.value - 1
      if (!songReady.value || !list.length) {
        return
      }
      if (list.length === 1) {
        loop()
      } else {
        if (index === -1) {
          index = list.length - 1
        }
        store.commit('setCurrentIndex', index)
        if (!playing.value) {
          store.commit('setPlayingState', true)
        }
      }
    }
    function next() {
      const list = playlist.value
      let index = currentIndex.value + 1
      if (!songReady.value || !list.length) {
        return
      }
      if (list.length === 1) {
        loop()
      } else {
        if (index === list.length) {
          index = 0
        }
        store.commit('setCurrentIndex', index)
        if (!playing.value) {
          store.commit('setPlayingState', true)
        }
      }
    }
    function loop() {
      const audioEl = audioRef.value
      audioEl.currentTime = 0
      audioEl.play()
      store.commit('setPlayingState', true)
    }
    // canplay 事件回调，说明当前音乐已缓冲， 可播放
    function ready() {
      if (songReady.value) {
        return
      }
      songReady.value = true
      playLyric()
    }
    function error() {
      songReady.value = true
    }
    function updateTime(e) {
      if (!progressChanging) {
        currentTime.value = e.target.currentTime
      }
    }
    function onProgressChanging(progress) {
      progressChanging = true
      currentTime.value = currentSong.value.duration * progress
      playLyric()
      stopLyric()
    }

    function onProgressChanged(progress) {
      progressChanging = false
      audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
      if (!playing.value) {
          store.commit('setPlayingState', true)
      }
      playLyric()
    }
    function end() {
      currentTime.value = 0
      if (playMode.value === PLAY_MODE.loop) {
        loop()
      } else {
        next()
      }
    }

    return {
      audioRef,
      fullScreen,
      currentSong,
      currentTime,
      progress,
      playIcon,
      disableCls,
      goBack,
      togglePlay,
      pause,
      prev,
      next,
      ready,
      error,
      updateTime,
      formatTime,
      onProgressChanging,
      onProgressChanged,
      end,
      // usemode
      modeIcon,
      changeMode,
      // useFavorite
      getFavoriteIcon,
      toggleFavorite,
      // useCD
      cdCls,
      cdRef,
      cdImageRef,
      // useLyric
      currentLineNum,
      currentLyric,
      pureMusicLyric,
      playingLyric,
      lyricScrollRef,
      lyricListRef,
      // useMiddleInteractive
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd
    }
  }
}
</script>

<style scoped lang="scss">
  .player {
    .normal-player{
      position:fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);

        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position:absolute;
          top: 0;
          left: 6px;
          z-index: 50;
        }
        .icon-back {
          display:block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
        .title {
          width:70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom:170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display:inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          // box-sizing: border-box;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            box-sizing: border-box;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            img {
              position:absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255,255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite;
            }
          }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
            .pure-music {
              padding-top: 50%;
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 40px;
            line-height: 30px;
            width: 40px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left;
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
    }
  }
</style>
