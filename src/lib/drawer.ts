import { chunk } from "lodash"
import { hueGenerator } from "./hueGenerator"
import { computeCellsData } from "./utils"
import { VoronoiState } from "./voronoiState"

const POINT_RADIUS = 20
const DESTINATION_RADIUS = 10

export function drawVoronoi(voronoiState: VoronoiState, context: CanvasRenderingContext2D) {
  const [width, height] = [context.canvas.width, context.canvas.height]
  const cellsData = computeCellsData(voronoiState.voronoi, width * height, voronoiState.values)
  const destinations = chunk(voronoiState.destinations, 2)
  const positions = chunk(voronoiState.positions, 2)
  context.strokeStyle = "white"
  context.clearRect(0, 0, width, height)
  for (const idx in cellsData) {
    const i = Number(idx)
    const { ratio, expectedRatio } = cellsData[i]
    const diff = Math.abs(ratio - expectedRatio) / Math.max(ratio, expectedRatio)
    const red = Math.floor(255 * diff)
    const blue = Math.floor(255 * (1 - diff))
    context.fillStyle = `rgb(${red}, 0, ${blue})`
    context.beginPath()
    voronoiState.voronoi.renderCell(i, context)
    context.fill()
    context.stroke()
  }
  const hue = hueGenerator()
  for (const idx in cellsData) {
    const color = hue.next().value!
    context.fillStyle = color

    const [dx, dy] = destinations[idx]
    context.beginPath()
    context.arc(dx, dy, DESTINATION_RADIUS, 0, 2 * Math.PI)
    context.fill()
    const [px, py] = positions[idx]
    context.beginPath()
    context.arc(px, py, POINT_RADIUS, 0, 2 * Math.PI)
    context.fill()
  }

  context.beginPath()
  voronoiState.voronoi.renderBounds(context)
  context.stroke()
}
