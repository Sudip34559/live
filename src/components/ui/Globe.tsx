import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let globe: any = null;

    if (canvasRef.current) {
      const canvas = canvasRef.current;

      // Set fixed size
      canvas.width = 1200;
      canvas.height = 1200;
      canvas.style.width = "600px";
      canvas.style.height = "600px";

      try {
        globe = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: 1200,
          height: 1200,
          phi: 0,
          theta: 0,
          dark: 1,
          diffuse: 1.2,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: [0.878, 0.906, 1],
          markerColor: [0.878, 0.906, 1],
          glowColor: [0.753, 0.667, 0.992],
          markers: [],
          onRender: (state: any) => {
            state.phi = phi;
            phi += 0.01;
          },
        });
      } catch (error) {
        console.error("Globe failed:", error);
      }
    }

    return () => {
      if (globe) {
        try {
          globe.destroy();
        } catch (e) {
          console.error("Destroy error:", e);
        }
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        maxWidth: "100%",
        aspectRatio: 1,
        display: "block",
      }}
    />
  );
};
