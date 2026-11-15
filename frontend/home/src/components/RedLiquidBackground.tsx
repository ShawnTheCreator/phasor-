import React, { useEffect, useRef } from 'react';

export default function RedLiquidBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader: Red flowing liquid silk with chromatic fluted refractions
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Pseudo-random hash
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      // Smooth 2D noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = st;
        p.x *= aspect;

        float t = u_time * 0.28;

        // Domain warping for organic liquid flow
        vec2 q = vec2(
          noise(p * 1.5 + vec2(0.0, t * 0.35)),
          noise(p * 1.5 + vec2(t * 0.25, 0.0))
        );

        vec2 r = vec2(
          noise(p * 2.0 + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t),
          noise(p * 2.0 + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t)
        );

        // Vertical fluted liquid columns (like flowing red silk / ribbed liquid glass)
        float colX = p.x * 7.5;
        float fold = sin(colX + sin(p.y * 2.5 + t) * 1.6 + r.x * 2.4);
        fold += 0.45 * sin(colX * 2.0 - t * 0.5 + q.y * 1.8);

        // Mouse interactive wave ripple
        vec2 m = u_mouse / u_resolution.xy;
        m.x *= aspect;
        float dMouse = length(p - m);
        float mouseImpulse = exp(-dMouse * 3.2) * sin(dMouse * 18.0 - t * 4.0) * 0.35;
        fold += mouseImpulse;

        // Depth and specular curvature
        float depth = smoothstep(-1.1, 1.1, fold);
        float highlight = pow(clamp(depth, 0.0, 1.0), 3.8);
        float edgeRib = pow(abs(cos(fold * 2.2)), 5.0);

        // Palette:
        // Deep burgundy, rich blood red, fiery crimson, with iridescent rainbow caustics
        vec3 colDark = vec3(0.04, 0.008, 0.015);         // Deep dark wine velvet (#0a0204)
        vec3 colDeepRed = vec3(0.58, 0.04, 0.08);       // Rich blood crimson (#940a14)
        vec3 colBrightRed = vec3(0.96, 0.14, 0.18);     // Glowing scarlet highlight (#f5242e)
        vec3 colPrismaticCyan = vec3(0.25, 0.82, 0.92); // Iridescent caustic reflection
        vec3 colPrismaticGold = vec3(0.98, 0.82, 0.32); // Amber specular refraction

        vec3 color = mix(colDark, colDeepRed, depth);
        color = mix(color, colBrightRed, highlight * 0.85);

        // Right-side chromatic refraction / fluted glass shimmer
        float iridBand = sin(p.x * 12.0 + fold * 2.8 + t * 0.8);
        float iridMask = smoothstep(0.35, 0.95, st.x) * pow(abs(iridBand), 2.5);
        vec3 iridHue = mix(colPrismaticCyan, colPrismaticGold, sin(p.y * 4.0 + t) * 0.5 + 0.5);
        color += iridHue * iridMask * (edgeRib * 0.7 + 0.3);

        // Subtle specular glow on liquid peaks
        color += vec3(1.0, 0.85, 0.85) * pow(highlight, 4.5) * 0.4;

        // Subtle vignette at borders
        float vig = 1.0 - 0.35 * length(st - 0.5);
        color *= vig;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile helper
    const createShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link failed:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const onMouseMove = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = canvas.height - (e.clientY - rect.top);
    };

    window.addEventListener('mousemove', onMouseMove);

    const resize = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    let animationId: number;
    const startTime = performance.now();

    const render = (now: number): void => {
      const elapsed = (now - startTime) / 1000.0;

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="red-liquid-container" aria-hidden="true">
      <canvas ref={canvasRef} className="red-liquid-canvas" />
      {/* CSS fallback mesh for non-webgl environments */}
      <div className="red-liquid-fallback" />
      <div className="red-liquid-overlay-gradient" />
    </div>
  );
}
