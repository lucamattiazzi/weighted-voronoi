const MAX = 360
const PHI = (1 + Math.sqrt(5)) / 2

export function* hueGenerator(saturation: number = 50, lightness: number = 50) {
  let angle = 0
  while (true) {
    angle += PHI * MAX
    const hue = Math.round(angle % MAX)
    yield `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
}

