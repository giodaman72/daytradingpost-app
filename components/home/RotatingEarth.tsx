"use client";

import { useEffect, useRef, type ReactNode } from "react";

const VERTEX = `
attribute vec2 position;
varying vec2 point;
void main() {
  point = position * 1.12;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Ray/sphere projection keeps latitude fixed. Only longitude advances around Y.
const FRAGMENT = `
precision highp float;
varying vec2 point;
uniform sampler2D surface;
uniform float longitude;
void main() {
  float radius = length(point);
  if (radius > 1.0) {
    float halo = exp(-(radius - 1.0) * 45.0) * 0.38;
    gl_FragColor = vec4(0.12, 0.42, 0.85, halo);
    return;
  }
  vec3 normal = vec3(point, sqrt(max(0.0, 1.0 - dot(point, point))));
  vec2 uv = vec2(fract(0.5 + atan(normal.x, normal.z) / 6.2831853 + longitude),
                 0.5 - asin(normal.y) / 3.14159265);
  vec3 color = texture2D(surface, uv).rgb;
  float light = max(dot(normal, normalize(vec3(-0.65, 0.5, 1.0))), 0.0);
  color *= 0.16 + 0.94 * light;
  float rim = pow(1.0 - normal.z, 3.0);
  color += vec3(0.08, 0.28, 0.65) * rim * (0.3 + light);
  gl_FragColor = vec4(color, 1.0);
}`;

export function RotatingEarth({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    let frame = 0;
    let loaded = false;
    let disposed = false;
    let visible = true;
    let lastTime = 0;
    let longitude = -1 / 12;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new window.Image();

    const cleanup = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      image.onload = null;
      delete canvas.dataset.ready;
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };

    try {
      if (!program || !buffer || !texture)
        throw new Error("WebGL resources unavailable");
      for (const [type, source] of [
        [gl.VERTEX_SHADER, VERTEX],
        [gl.FRAGMENT_SHADER, FRAGMENT],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Shader unavailable");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error("Shader compilation failed");
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Shader linking failed");
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } catch {
      cleanup();
      return;
    }

    const angle = gl.getUniformLocation(program!, "longitude");
    const draw = () => {
      if (!loaded || disposed || gl.isContextLost()) return;
      const size = Math.min(
        960,
        Math.round(
          canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5),
        ),
      );
      if (!size) return;
      if (canvas.width !== size) canvas.width = canvas.height = size;
      gl.viewport(0, 0, size, size);
      gl.uniform1f(angle, longitude);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.dataset.ready = "true";
    };
    const animate = (time: number) => {
      if (disposed) return;
      if (lastTime)
        longitude = (longitude + Math.min(time - lastTime, 100) / 90000) % 1;
      lastTime = time;
      draw();
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (!loaded || disposed) return;
      draw();
      if (visible && !document.hidden && !reduced.matches)
        frame = requestAnimationFrame(animate);
    };
    image.onload = () => {
      if (disposed || gl.isContextLost()) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      loaded = true;
      sync();
    };
    image.src = "/images/earth-surface.jpg";
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    const lost = () => {
      cancelAnimationFrame(frame);
      loaded = false;
      delete canvas.dataset.ready;
    };
    canvas.addEventListener("webglcontextlost", lost);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      resize.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      cleanup();
    };
  }, []);

  return (
    <div className="reference-globe" aria-hidden="true">
      <canvas ref={canvasRef} className="reference-globe-canvas" />
      {children}
    </div>
  );
}
