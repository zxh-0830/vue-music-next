/**
 * 洗牌算法
 * @param {*} source
 */
export function shuffle(source) {
  const arr = source.slice()
  for (let i = 0; i < arr.length; i++) {
    const j = getRandomInt(i)
    swap(arr, i, j)
  }
  return arr
}

/**
 * 随机获取一个整数
 * @param {*} max
 * @returns
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1))
}

/**
 * 交换
 * @param {*} arr
 * @param {*} i
 * @param {*} j
 */
function swap(arr, i, j) {
  const t = arr[i]
  arr[i] = arr[j]
  arr[j] = t
}

/**
 * 格式化 时间
 * @param {*} time
 */
export function formatTime(time) {
  time = time | 0 // 或0 向下取整
  const minute = ((time / 60 | 0) + '').padStart(2, '0')
  const second = (time % 60 + '').padStart(2, '0')
  return `${minute}:${second}`
}
