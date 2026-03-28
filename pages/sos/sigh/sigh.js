// 呼吸阶段时长配置 (ms)
const PHASE_DURATIONS = {
  inhale1: 3000,
  hold1: 500,
  inhale2: 500,
  hold2: 500,
  exhale: 8000
}

// 每个阶段对应的提示文字
const PHASE_PROMPTS = {
  idle: '准备好了就点击开始',
  inhale1: '吸满气',
  hold1: '吸满气',
  inhale2: '再吸一口',
  hold2: '再吸一口',
  exhale: '慢慢呼气'
}

// 呼吸阶段顺序
const PHASE_SEQUENCE = ['inhale1', 'hold1', 'inhale2', 'hold2', 'exhale']

Page({
  data: {
    phase: 'idle',       // 当前阶段
    round: 0,            // 当前轮次
    totalRounds: 3,      // 总轮次
    promptText: PHASE_PROMPTS.idle,
    isActive: false,      // 是否正在进行
    isComplete: false,    // 是否已完成
    bgClass: ''           // 背景过渡 class
  },

  _timer: null,

  onUnload() {
    this._clearTimer()
  },

  // ---------- 公共方法 ----------

  /** 点击开始按钮 */
  start() {
    this.setData({
      isActive: true,
      isComplete: false,
      round: 1,
      phase: 'idle',
      bgClass: ''
    })
    this._runPhase(0)
  },

  /** 再来一次 */
  restart() {
    this._clearTimer()
    this.start()
  },

  /** 下一步 — 占位 */
  goNext() {
    wx.showToast({ title: '即将开放', icon: 'none' })
  },

  /** 返回 — 占位 */
  goBack() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/index/index' }) })
  },

  // ---------- 状态机核心 ----------

  /**
   * 执行第 phaseIndex 个阶段
   * @param {number} phaseIndex 阶段索引 (0-4)
   */
  _runPhase(phaseIndex) {
    const phase = PHASE_SEQUENCE[phaseIndex]
    const duration = PHASE_DURATIONS[phase]

    this.setData({
      phase,
      promptText: PHASE_PROMPTS[phase]
    })

    // 触觉反馈
    this._triggerHaptic(phase)

    this._timer = setTimeout(() => {
      const nextIndex = phaseIndex + 1

      if (nextIndex < PHASE_SEQUENCE.length) {
        // 当前轮内还有后续阶段
        this._runPhase(nextIndex)
      } else {
        // 一轮结束
        const nextRound = this.data.round + 1
        if (nextRound <= this.data.totalRounds) {
          this.setData({ round: nextRound })
          this._runPhase(0)
        } else {
          // 全部完成
          this._complete()
        }
      }
    }, duration)
  },

  /** 触发对应阶段的震动 */
  _triggerHaptic(phase) {
    if (phase === 'inhale1' || phase === 'inhale2') {
      wx.vibrateShort({ type: 'medium' })
    } else if (phase === 'exhale') {
      wx.vibrateLong()
    }
  },

  /** 完成所有轮次 */
  _complete() {
    this.setData({
      phase: 'complete',
      isActive: false,
      isComplete: true,
      promptText: '',
      bgClass: 'bg-blush'
    })
  },

  /** 清除定时器 */
  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }
})
