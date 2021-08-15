import { PLAY_MODE, FAVORITE_KEY } from '@/assets/js/constant'
import { load } from '@/assets/js/array-store'
const state = {
  sequenceList: [],
  playlist: [],
  playing: false,
  playMode: PLAY_MODE.seqeuence,
  currentIndex: 0,
  fullSceen: false,
  favoriteList: load(FAVORITE_KEY)
}

export default state
