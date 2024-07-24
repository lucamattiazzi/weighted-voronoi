import { Delaunay } from "d3-delaunay"
import { clamp, flatten } from "lodash"
import { anglesMean, randomizeAngle } from "../lib/utils"
import { MinimizerPayload, MinimizerResults, Point } from "../types"
import MinimizerUrl from "../workers/minimizer?worker&url"

const EPSILON = 0.0001
const MIN_SPEED = 1
const FIRST_ANGLE_WEIGHT = 5
const MAX_ANGLE_VALUE = Math.PI / 8


export class VoronoiState {
  delauney: Delaunay<number[]>
  positions: Float64Array
  speeds: Float64Array
  angles: Float64Array
  values: number[]
  destinations: Float64Array
  width: number
  height: number
  minimizer: Worker

  constructor(points: [number, number][], values: number[], width: number, height: number) {
    this.values = values
    this.positions = Float64Array.from(flatten(points))
    this.angles = Float64Array.from(Array.from({ length: points.length }, () => 0))
    this.speeds = Float64Array.from(Array.from({ length: points.length }, () => 0))
    this.width = width
    this.height = height
    this.destinations = Float64Array.from(
      { length: this.positions.length },
      (_, i) => Math.random() * (i % 2 === 0 ? this.width : this.height)
    )
    this.delauney = new Delaunay(this.positions)
    this.minimizer = new Worker(MinimizerUrl, { type: "module" })
  }

  get voronoi() {
    return this.delauney.voronoi([0, 0, this.width, this.height])
  }

  get longestLine(): number {
    return Math.sqrt(this.width ** 2 + this.height ** 2)
  }

  get points(): Point[] {
    const points = []
    for (let i = 0; i < this.positions.length; i += 2) {
      points.push({
        x: this.positions[i],
        y: this.positions[i + 1],
        dx: this.destinations[i],
        dy: this.destinations[i + 1],
        value: this.values[i / 2],
        vx: this.speeds[i / 2] * Math.cos(this.angles[i / 2]),
        vy: this.speeds[i / 2] * Math.sin(this.angles[i / 2]),
        angle: this.angles[i / 2],
        speed: this.speeds[i / 2],
      })
    }
    return points
  }

  #updateVelocities = () => {
    for (let i = 0; i < this.positions.length; i += 2) {
      const [x, y] = [this.positions[i], this.positions[i + 1]]
      const [destX, destY] = [this.destinations[i], this.destinations[i + 1]]
      const [deltaX, deltaY] = [destX - x, destY - y]
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2) + EPSILON
      const oldAngle = this.angles[i / 2]

      // distance ratio, max angle change, and speed change from temperature are used to move points when they reach their destination
      // but they might not work for everyone.
      // a couple of constants will be used when creating the voronoi
      const distanceRatio = Math.log(this.longestLine / (distance + EPSILON))
      const maxAngleChange = distanceRatio * MAX_ANGLE_VALUE
      const speed = MIN_SPEED + Math.min(distanceRatio, MIN_SPEED / 2)

      const targetAngle = Math.atan2(deltaY, deltaX)
      const randomizedTargetAngle = randomizeAngle(targetAngle, maxAngleChange)
      const meanAngle = anglesMean(oldAngle, randomizedTargetAngle, FIRST_ANGLE_WEIGHT)

      this.angles[i / 2] = meanAngle
      this.speeds[i / 2] = speed
    }
  }

  #updatePositions = () => {
    for (let i = 0; i < this.positions.length; i += 2) {
      const [x, y] = [this.positions[i], this.positions[i + 1]]
      const angle = this.angles[i / 2]
      const speed = this.speeds[i / 2]
      const [deltaX, deltaY] = [Math.cos(angle) * speed, Math.sin(angle) * speed]
      this.positions[i] = clamp(x + deltaX, 0, this.width)
      this.positions[i + 1] = clamp(y + deltaY, 0, this.height)
    }
  }

  #computeNewDestionations = () => {
    const payload: MinimizerPayload = { destinations: this.destinations, values: this.values, width: this.width, height: this.height }
    this.minimizer.postMessage(payload)
  }

  update = () => {
    this.#updateVelocities()
    this.#updatePositions()
    this.voronoi.update()
  }

  prepare = () => {
    this.minimizer.onmessage = async (event) => {
      const { destinations } = event.data as MinimizerResults
      this.destinations = destinations
      this.#computeNewDestionations()
    }
    this.#computeNewDestionations()
  }
}

