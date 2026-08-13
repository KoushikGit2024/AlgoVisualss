import { useRef } from "react";
import { useHighwayAnimation } from "../hooks/useHighwayAnimation";

export default function HomeBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useHighwayAnimation(canvasRef);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.28] sm:opacity-[0.45]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Vignette — dark edges like a city map receding into darkness */}
      <div className="absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-(--bg) to-transparent" />
    </div>
  );
}
