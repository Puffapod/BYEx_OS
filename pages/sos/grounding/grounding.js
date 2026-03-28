const STEPS = [
  { label: '看到5件东西', tint: 'tint-sun' },
  { label: '触摸4件东西', tint: 'tint-sand' },
  { label: '听到3种声音', tint: 'tint-lilac' },
  { label: '闻到2个气味', tint: 'tint-rose' },
  { label: '尝到1种味道', tint: 'tint-peach' }
]

function freshSteps() {
  return STEPS.map(s => ({ ...s, checked: false }))
}

Page({
  data: {
    steps: freshSteps(),
    allDone: false,
    isComplete: false,
    bgClass: ''
  },

  _timer: null,

  onUnload() {
    this._clearTimer()
  },

  // ---------- 公共方法 ----------

  /** 用户点击"完成" */
  onFinish() {
    if (this.data.allDone) return
    this.setData({ allDone: true })
    this._runCheckSequence(0)
  },

  /** 再来一次 */
  restart() {
    this._clearTimer()
    this.setData({
      steps: freshSteps(),
      allDone: false,
      isComplete: false,
      bgClass: ''
    })
  },

  /** 下一步 — 占位 */
  goNext() {
    wx.showToast({ title: '即将开放', icon: 'none' })
  },

  /** 返回 */
  goBack() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/index/index' }) })
  },

  // ---------- 打勾动画序列 ----------

  _runCheckSequence(index) {
    if (index >= this.data.steps.length) {
      // 全部勾完，短暂停顿后进入完成态
      this._timer = setTimeout(() => {
        this.setData({
          isComplete: true,
          bgClass: 'bg-blush'
        })
      }, 600)
      return
    }

    const key = `steps[${index}].checked`
    this.setData({ [key]: true })
    wx.vibrateShort({ type: 'medium' })

    this._timer = setTimeout(() => {
      this._runCheckSequence(index + 1)
    }, 500)
  },

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }
})
