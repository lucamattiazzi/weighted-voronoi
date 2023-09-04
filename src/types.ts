export interface VoronoiCellData {
  expectedRatio: number
  ratio: number
  color?: string
}

export interface Point {
  x: number
  y: number
  dx: number
  dy: number
  value: number
  vx: number
  vy: number
  angle: number
  speed: number
}

export interface MinimizerPayload {
  destinations: Float64Array
  values: number[]
  width: number
  height: number
}

export interface MinimizerResults {
  destinations: Float64Array
  error: number
  elapsed: number
}