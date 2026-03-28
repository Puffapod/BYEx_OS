// 蝴蝶拍配置
const TAP_INTERVAL = 1200    // 每拍间隔 (ms)，50 BPM
const TAPS_PER_SET = 16      // 每组拍打次数
const TOTAL_SETS = 2          // 总组数
const BREATH_DURATION = 4000  // 呼吸间歇时长 (ms)

Page({
  data: {
    phase: 'idle',            // idle | tapping | breathing | complete
    activeSide: 'none',       // 'none' | 'left' | 'right'
    currentSideText: '',      // "左" / "右"
    tapCount: 0,
    setCount: 0,
    totalSets: TOTAL_SETS,
    isActive: false,
    isComplete: false,
    bgClass: ''
  },

  _interval: null,
  _timer: null,
  _isLeft: true,

  onUnload() {
    this._clearAll()
  },

  // ---------- 公共方法 ----------

  start() {
    this._isLeft = true
    this.setData({
      phase: 'tapping',
      isActive: true,
      isComplete: false,
      activeSide: 'none',
      currentSideText: '',
      tapCount: 0,
      setCount: 1,
      bgClass: ''
    })
    this._startTapping()
  },

  restart() {
    this._clearAll()
    this.start()
  },

  goNext() {
    wx.showToast({ title: '即将开放', icon: 'none' })
  },

  goBack() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/index/index' }) })
  },

  // ---------- 律动引擎 (setInterval) ----------

  _startTapping() {
    this._tick()
    this._interval = setInterval(() => {
      this._tick()
    }, TAP_INTERVAL)
  },

  _tick() {
    const side = this._isLeft ? 'left' : 'right'
    const text = this._isLeft ? '左' : '右'
    const tapCount = this.data.tapCount + 1

    this.setData({
      activeSide: side,
      currentSideText: text,
      tapCount
    })

    wx.vibrateShort({ type: 'medium' })
    this._isLeft = !this._isLeft

    // 当前组拍完
    if (tapCount >= TAPS_PER_SET) {
      this._clearInterval()
      if (this.data.setCount >= TOTAL_SETS) {
        // 让末拍动画自然结束后进入完成态
        this._timer = setTimeout(() => this._complete(), 800)
      } else {
        this._timer = setTimeout(() => this._startBreathing(), 800)
      }
    }
  },

  _startBreathing() {
    this.setData({
      phase: 'breathing',
      activeSide: 'none',
      currentSideText: ''
    })

    this._timer = setTimeout(() => {
      this._isLeft = true
      this.setData({
        phase: 'tapping',
        setCount: this.data.setCount + 1,
        tapCount: 0
      })
      this._startTapping()
    }, BREATH_DURATION)
  },

  _complete() {
    this.setData({
      phase: 'complete',
      activeSide: 'none',
      currentSideText: '',
      isActive: false,
      isComplete: true,
      bgClass: 'bg-blush'
    })
  },

  // ---------- 清理 ----------

  _clearInterval() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }
  },

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  },

  _clearAll() {
    this._clearInterval()
    this._clearTimer()
  }
})
