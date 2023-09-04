import { useEffect, useRef } from "react"
import { drawVoronoi } from "../lib/drawer"
import { VoronoiState } from "../lib/voronoiState"
const TOTAL_POINTS = 40

const POINTS = Array.from({ length: TOTAL_POINTS }, () => [Math.random() * window.innerWidth, Math.random() * window.innerHeight] as [number, number])
const EXPECTED_RATIOS = POINTS.map((_, i) => i * Math.random() * Math.random()).map((p, _, ratios) => p / ratios.reduce((a, b) => a + b, 0))

export function VoronoiComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const voronoiState = useRef<VoronoiState>(new VoronoiState(POINTS, EXPECTED_RATIOS, window.innerWidth * 2, window.innerHeight * 2))

  function loop() {
    const ctx = canvasRef.current!.getContext("2d")!
    voronoiState.current.update()
    drawVoronoi(voronoiState.current, ctx)
    window.requestAnimationFrame(loop)
  }

  useEffect(() => {
    if (!canvasRef.current) return
    voronoiState.current.prepare()
    loop()
  }, [])

  return (
    <>
      <canvas width={window.innerWidth * 2} height={window.innerHeight * 2} ref={canvasRef} style={{ width: window.innerWidth, height: window.innerHeight }}></canvas>
    </>
  )
}
