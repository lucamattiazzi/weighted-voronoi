/// <reference lib="webworker" />

import { Delaunay } from "d3-delaunay"
import { nelderMead } from "fmin"
import { getCellSize } from "../lib/utils"
import { MinimizerPayload } from "../types"

type ErrorFunction = (cellCoords: number[]) => number

export function computeErrorCurry(expectedRatio: number[], width: number, height: number): ErrorFunction {
  const canvasArea = width * height
  return (voronoiPoints: number[]) => {
    for (let i = 0; i < voronoiPoints.length; i += 2) {
      const x = voronoiPoints[i]
      const y = voronoiPoints[i + 1]
      if (x > width || x < 0 || y > height || y < 0) return Infinity
    }
    const delaunay = new Delaunay(voronoiPoints)
    const newVoronoi = delaunay.voronoi([0, 0, width, height])
    const cells = [...newVoronoi.cellPolygons()]
    const ratios = cells.map(c => getCellSize(c) / canvasArea)
    const errors = ratios.map((r, i) => Math.abs(r - expectedRatio[i]) / Math.max(r, expectedRatio[i]))
    const totalError = errors.reduce((acc, e) => acc + e ** 2, 0) / errors.length
    return Math.sqrt(totalError)
  }
}

function findAndSendDestinations(payload: MinimizerPayload) {
  const { destinations, values, width, height } = payload as MinimizerPayload
  const errorFunction = computeErrorCurry(values, width, height)
  const start = performance.now()
  const minimized = nelderMead(errorFunction, destinations)
  const elapsed = performance.now() - start
  console.log(`${elapsed.toFixed(0)}ms - error: ${minimized.fx.toFixed(4)}`)
  const results = { destinations: Float64Array.from(minimized.x), error: minimized.fx, elapsed }
  postMessage(results)
}

addEventListener("message", (event) => {
  findAndSendDestinations(event.data)
})

export function findDestinations(positions: Float64Array, values: Float64Array) {
  console.log(positions)
  console.log(values)
}