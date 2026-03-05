import { useEffect, useRef } from 'react';
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  Points,
  Color,
} from 'three';

interface TerminalBackgroundProps {
  enabled?: boolean;
}

const PARTICLE_COUNT = 300;
const AMBER_COLOR = 0xffb000;

export default function TerminalBackground({ enabled = true }: TerminalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Create particle geometry — positions are initial/seed values only
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const opacities = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;     // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;  // z
      opacities[i] = Math.random() * 0.5 + 0.1;
      seeds[i] = Math.random(); // unique per-particle seed for variation
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('alpha', new BufferAttribute(opacities, 1));
    geometry.setAttribute('seed', new BufferAttribute(seeds, 1));

    // All drift logic happens on the GPU — no per-frame JS loops
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new Color(AMBER_COLOR) },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float alpha;
        attribute float seed;
        uniform float uTime;
        varying float vAlpha;

        void main() {
          vAlpha = alpha;

          // Drift speed varies per particle based on alpha (brighter = faster)
          float speed = 0.15 * (0.5 + alpha);

          // Wrap Y position using mod — particle respawns at top when it falls below bottom
          float range = 100.0;
          float y = position.y - speed * uTime;
          y = mod(y + range * 0.5, range) - range * 0.5;

          // Slight horizontal drift using seed for organic movement
          float x = position.x + sin(uTime * 0.3 + seed * 6.28) * 2.0;

          vec3 pos = vec3(x, y, position.z);
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 2.0 * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float fade = 1.0 - (dist * 2.0);
          gl_FragColor = vec4(uColor, vAlpha * fade * 0.6);
        }
      `,
    });

    const points = new Points(geometry, material);
    scene.add(points);

    let time = 0;

    const animate = () => {
      time += 0.016;
      material.uniforms.uTime.value = time;
      // No buffer uploads — just one uniform update per frame
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Hide canvas on WebGL context loss to prevent opaque black overlay
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animFrameRef.current);
      if (canvas) canvas.style.visibility = 'hidden';
    };
    const handleContextRestored = () => {
      cancelAnimationFrame(animFrameRef.current);
      if (canvas) canvas.style.visibility = 'visible';
      animate();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    />
  );
}
