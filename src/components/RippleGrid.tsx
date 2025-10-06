import { useRef, useEffect, useState, useCallback } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";

type Props = {
  enableRainbow?: boolean;
  gridColor?: string;
  rippleIntensity?: number;
  gridSize?: number;
  gridThickness?: number;
  fadeDistance?: number;
  vignetteStrength?: number;
  glowIntensity?: number;
  opacity?: number;
  gridRotation?: number;
  mouseInteraction?: boolean;
  mouseInteractionRadius?: number;
};

const RippleGrid: React.FC<Props> = ({
  enableRainbow = false,
  gridColor = "#ffffff",
  rippleIntensity = 0.05,
  gridSize = 10.0,
  gridThickness = 15.0,
  fadeDistance = 1.5,
  vignetteStrength = 2.0,
  glowIntensity = 0.1,
  opacity = 1.0,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);
  const uniformsRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null); // Fix: Add null initial value
  const isInitializingRef = useRef(false);
  const mountedRef = useRef(true);

  // Force unique key for every render
  const [renderKey, setRenderKey] = useState(0);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null; // Fix: Set to null instead of undefined
    }

    if (rendererRef.current) {
      try {
        const gl = rendererRef.current.gl;
        if (gl) {
          const loseContext = gl.getExtension("WEBGL_lose_context");
          if (loseContext) {
            loseContext.loseContext();
          }
        }
      } catch (error) {
        console.warn("Error losing WebGL context:", error);
      }
      rendererRef.current = null;
    }

    if (containerRef.current) {
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) {
        try {
          containerRef.current.removeChild(canvas);
        } catch (error) {
          // Canvas might already be removed
        }
      }
    }

    uniformsRef.current = null;
    isInitializingRef.current = false;
  }, []);

  // Initialize WebGL
  const initializeWebGL = useCallback(() => {
    if (
      !containerRef.current ||
      isInitializingRef.current ||
      !mountedRef.current
    )
      return;

    isInitializingRef.current = true;

    // Clean up any existing instances
    cleanup();

    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      if (!mountedRef.current || !containerRef.current) return;

      try {
        const hexToRgb = (hex: string): [number, number, number] => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? [
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255,
              ]
            : [1, 1, 1];
        };

        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio, 2),
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
        });

        rendererRef.current = renderer;
        const gl = renderer.gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        const canvas = gl.canvas as HTMLCanvasElement;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";

        containerRef.current.appendChild(canvas);

        const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

        const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

        const uniforms = {
          iTime: { value: 0 },
          iResolution: { value: [1, 1] },
          enableRainbow: { value: enableRainbow },
          gridColor: { value: hexToRgb(gridColor) },
          rippleIntensity: { value: rippleIntensity },
          gridSize: { value: gridSize },
          gridThickness: { value: gridThickness },
          fadeDistance: { value: fadeDistance },
          vignetteStrength: { value: vignetteStrength },
          glowIntensity: { value: glowIntensity },
          opacity: { value: opacity },
          gridRotation: { value: gridRotation },
          mouseInteraction: { value: mouseInteraction },
          mousePosition: { value: [0.5, 0.5] },
          mouseInfluence: { value: 0 },
          mouseInteractionRadius: { value: mouseInteractionRadius },
        };

        uniformsRef.current = uniforms;

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
          vertex: vert,
          fragment: frag,
          uniforms,
        });
        const mesh = new Mesh(gl, { geometry, program });

        const resize = () => {
          if (!containerRef.current || !mountedRef.current) return;
          const { clientWidth: w, clientHeight: h } = containerRef.current;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            uniforms.iResolution.value = [w, h];
          }
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!mouseInteraction || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          targetMouseRef.current = { x, y };
        };

        const handleMouseEnter = () => {
          if (!mouseInteraction) return;
          mouseInfluenceRef.current = 1.0;
        };

        const handleMouseLeave = () => {
          if (!mouseInteraction) return;
          mouseInfluenceRef.current = 0.0;
        };

        window.addEventListener("resize", resize);
        if (mouseInteraction && containerRef.current) {
          containerRef.current.addEventListener("mousemove", handleMouseMove);
          containerRef.current.addEventListener("mouseenter", handleMouseEnter);
          containerRef.current.addEventListener("mouseleave", handleMouseLeave);
        }

        // Initial resize
        resize();

        const render = (t: number) => {
          if (!renderer || !mesh || !uniforms || !mountedRef.current) return;

          try {
            uniforms.iTime.value = t * 0.001;

            const lerpFactor = 0.1;
            mousePositionRef.current.x +=
              (targetMouseRef.current.x - mousePositionRef.current.x) *
              lerpFactor;
            mousePositionRef.current.y +=
              (targetMouseRef.current.y - mousePositionRef.current.y) *
              lerpFactor;

            const currentInfluence = uniforms.mouseInfluence.value;
            const targetInfluence = mouseInfluenceRef.current;
            uniforms.mouseInfluence.value +=
              (targetInfluence - currentInfluence) * 0.05;

            uniforms.mousePosition.value = [
              mousePositionRef.current.x,
              mousePositionRef.current.y,
            ];

            gl.clear(gl.COLOR_BUFFER_BIT);
            renderer.render({ scene: mesh });

            if (mountedRef.current) {
              animationFrameRef.current = requestAnimationFrame(render);
            }
          } catch (error) {
            console.warn("WebGL render error:", error);
          }
        };

        // Start render loop
        animationFrameRef.current = requestAnimationFrame(render);
        isInitializingRef.current = false;
      } catch (error) {
        console.error("Error initializing WebGL:", error);
        isInitializingRef.current = false;
      }
    }, 10);
  }, [
    enableRainbow,
    gridColor,
    rippleIntensity,
    gridSize,
    gridThickness,
    fadeDistance,
    vignetteStrength,
    glowIntensity,
    opacity,
    gridRotation,
    mouseInteraction,
    mouseInteractionRadius,
    cleanup,
  ]);

  // Initialize on mount and whenever render key changes
  useEffect(() => {
    mountedRef.current = true;
    initializeWebGL();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [renderKey, initializeWebGL, cleanup]);

  // Force re-render on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setRenderKey((prev) => prev + 1);
      }
    };

    const handleFocus = () => {
      setRenderKey((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Force re-render on resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        setRenderKey((prev) => prev + 1);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ minHeight: "100px" }}
    />
  );
};

export default RippleGrid;
