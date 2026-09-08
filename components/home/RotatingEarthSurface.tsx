"use client";

import { useEffect, useRef } from "react";

const ROTATION_DURATION_MS = 24_000;
const MAX_RENDER_SIZE = 440;
const TARGET_FPS = 24;

export function RotatingEarthSurface({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.userAgent.includes("jsdom")) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const texture = new window.Image();
    texture.decoding = "async";

    let animationFrame = 0;
    let lastFrame = 0;
    let renderSize = 0;
    let texturePixels: Uint8ClampedArray | undefined;
    let output: ImageData | undefined;
    let longitudeMap: Float32Array | undefined;
    let latitudeMap: Uint16Array | undefined;
    let lightMap: Uint8Array | undefined;

    const prepareTexture = () => {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = texture.naturalWidth;
      textureCanvas.height = texture.naturalHeight;
      const textureContext = textureCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!textureContext) return false;
      textureContext.drawImage(texture, 0, 0);
      texturePixels = textureContext.getImageData(
        0,
        0,
        textureCanvas.width,
        textureCanvas.height,
      ).data;
      return true;
    };

    const prepareSphere = () => {
      const nextSize = Math.min(
        MAX_RENDER_SIZE,
        Math.max(
          280,
          Math.round(
            canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.15),
          ),
        ),
      );
      if (nextSize === renderSize && output) return;

      renderSize = nextSize;
      canvas.width = nextSize;
      canvas.height = nextSize;
      output = context.createImageData(nextSize, nextSize);
      longitudeMap = new Float32Array(nextSize * nextSize);
      latitudeMap = new Uint16Array(nextSize * nextSize);
      lightMap = new Uint8Array(nextSize * nextSize);

      const center = nextSize / 2;
      const radius = nextSize * 0.465;
      for (let y = 0; y < nextSize; y += 1) {
        const normalizedY = (y + 0.5 - center) / radius;
        for (let x = 0; x < nextSize; x += 1) {
          const index = y * nextSize + x;
          const normalizedX = (x + 0.5 - center) / radius;
          const distanceSquared =
            normalizedX * normalizedX + normalizedY * normalizedY;
          if (distanceSquared > 1) continue;

          const depth = Math.sqrt(1 - distanceSquared);
          longitudeMap[index] = Math.atan2(normalizedX, depth);
          const latitude = Math.asin(-normalizedY);
          latitudeMap[index] = Math.min(
            texture.naturalHeight - 1,
            Math.max(
              0,
              Math.round(
                (latitude / Math.PI + 0.5) * (texture.naturalHeight - 1),
              ),
            ),
          );

          const rim = Math.min(1, depth * 3.5);
          const directional = Math.max(
            0.22,
            Math.min(1, 0.38 + depth * 0.6 - normalizedX * 0.12),
          );
          lightMap[index] = Math.round(255 * rim * directional);
        }
      }
    };

    const draw = (timestamp: number) => {
      prepareSphere();
      if (
        !texturePixels ||
        !output ||
        !longitudeMap ||
        !latitudeMap ||
        !lightMap
      )
        return;

      const rotation =
        ((timestamp % ROTATION_DURATION_MS) / ROTATION_DURATION_MS) *
        Math.PI *
        2;
      const pixels = output.data;
      const textureWidth = texture.naturalWidth;

      for (let index = 0; index < lightMap.length; index += 1) {
        const pixelIndex = index * 4;
        const light = lightMap[index];
        if (light === 0) {
          pixels[pixelIndex + 3] = 0;
          continue;
        }

        const longitude = longitudeMap[index] + rotation;
        const wrapped = (((longitude / (Math.PI * 2) + 0.5) % 1) + 1) % 1;
        const textureX = Math.min(
          textureWidth - 1,
          Math.floor(wrapped * textureWidth),
        );
        const textureIndex = (latitudeMap[index] * textureWidth + textureX) * 4;
        pixels[pixelIndex] = (texturePixels[textureIndex] * light) / 255;
        pixels[pixelIndex + 1] =
          (texturePixels[textureIndex + 1] * light) / 255;
        pixels[pixelIndex + 2] = Math.min(
          255,
          (texturePixels[textureIndex + 2] * light) / 255 + 7,
        );
        pixels[pixelIndex + 3] = 255;
      }

      context.clearRect(0, 0, renderSize, renderSize);
      context.putImageData(output, 0, 0);
      canvas.dataset.ready = "true";
      canvas.parentElement?.classList.add("is-rendered");
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrame >= 1000 / TARGET_FPS) {
        draw(timestamp);
        lastFrame = timestamp;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      if (document.hidden || !texturePixels) return;
      animationFrame = requestAnimationFrame(animate);
    };

    const handleLoad = () => {
      if (prepareTexture()) start();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) start();
    };
    const handleResize = () => {
      renderSize = 0;
    };
    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(handleResize) : undefined;

    texture.addEventListener("load", handleLoad);
    texture.src = src;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (resizeObserver) resizeObserver.observe(canvas);
    else window.addEventListener("resize", handleResize);
    if (texture.complete && texture.naturalWidth > 0) handleLoad();

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.parentElement?.classList.remove("is-rendered");
      texture.removeEventListener("load", handleLoad);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", handleResize);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className="session-earth-canvas"
      aria-hidden="true"
    />
  );
}
