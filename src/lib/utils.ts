import { Voronoi } from "d3-delaunay"
import { VoronoiCellData } from "../types"

export const randomVal = () => (0.5 - Math.random()) * 10

export function getCellSize(cell: [number, number][]): number {
  const surface = cell.reduce((acc, [xi, yi], i) => {
    const j = (i + 1) % cell.length
    const [xj, yj] = cell[j]
    return acc + xi * yj - xj * yi
  }, 0)
  return surface / 2
}

export function computeCellsData(voronoi: Voronoi<number[]>, canvasArea: number, expectedRatios: number[]): VoronoiCellData[] {
  const cells = [...voronoi.cellPolygons()]
  const ratios = cells.map(c => getCellSize(c) / canvasArea)
  const cellsData = ratios.map((ratio, idx) => ({ ratio, expectedRatio: expectedRatios[idx] }))
  return cellsData
}

export function changeValueWithRatio(originalValue: number, rangeRatio: number): number {
  const maxAbsoluteChange = originalValue * rangeRatio
  const change = 2 * (0.5 - Math.random()) * maxAbsoluteChange
  return originalValue + change
}

export function weightedMean(firstValue: number, secondValue: number, secondValueWeight: number): number {
  return firstValue * (1 - secondValueWeight) + secondValue * secondValueWeight
}

export function anglesMean(firstAngle: number, secondAngle: number, firstAngleWeight: number): number {
  return Math.atan2(firstAngleWeight * Math.sin(firstAngle) + Math.sin(secondAngle), firstAngleWeight * Math.cos(firstAngle) + Math.cos(secondAngle))
}

export function randomizeAngle(angle: number, maxAngleChange: number): number {
  const randomaAngle = 2 * (0.5 - Math.random()) * maxAngleChange
  return (angle + randomaAngle) % (Math.PI * 2)
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}