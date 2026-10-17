export const chartSurfacePlugin = {
  id: 'greenloopSurface',
  beforeDraw(chart, _args, options) {
    const { ctx, width, height } = chart
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = options.color
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  },
}

export function getChartFontSize(textSize) {
  return {
    small: 11,
    normal: 12,
    large: 14,
    'extra-large': 16,
  }[textSize] || 12
}
