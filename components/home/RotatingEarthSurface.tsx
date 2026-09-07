"use client";

import { useEffect, useRef } from "react";

const ROTATION_DURATION_MS = 18_000;
const MAX_RENDER_SIZE = 560;
const STRIP_WIDTH = 2;

export function RotatingEarthSurface({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.userAgent.includes("jsdom")) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const image = new window.Image();
    image.decoding = "async";

    let animationFrame = 0;
    let lastFrame = 0;
    let renderSize = 0;
    let reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const syncCanvasSize = () => {
      const nextSize = Math.min(
        MAX_RENDER_SIZE,
        Math.max(
          280,
          Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 1.25)),
        ),
      );

      if (nextSize !== renderSize) {
        renderSize = nextSize;
        canvas.width = nextSize;
        canvas.height = nextSize;
      }
    };

    const draw = (timestamp: number) => {
      syncCanvasSize();
      const size = renderSize;
      const center = size / 2;
      const radius = size * 0.455;
      const sourceCenterX = image.naturalWidth / 2;
      const sourceCenterY = image.naturalHeight / 2;
      const sourceRadius = image.naturalWidth * 0.455;
      const rotation = reduceMotion
        ? 0
        : ((timestamp % ROTATION_DURATION_MS) / ROTATION_DURATION_MS) *
          Math.PI *
          2;

      context.clearRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
      context.save();
      context.beginPath();
      context.arc(center, center, radius, 0, Math.PI * 2);
      context.clip();

      for (let offsetX = -radius; offsetX <= radius; offsetX += STRIP_WIDTH) {
        const normalizedX = Math.max(-1, Math.min(1, offsetX / radius));
        const destinationHalfHeight = Math.sqrt(1 - normalizedX ** 2) * radius;
        const longitude = Math.asin(normalizedX) + rotation;
        const sourceNormalizedX = Math.sin(longitude) * 0.75;
        const sourceHalfHeight =
          Math.sqrt(Math.max(0, 1 - sourceNormalizedX ** 2)) * sourceRadius;
        const sourceX = sourceCenterX + sourceNormalizedX * sourceRadius;

        context.drawImage(
          image,
          sourceX - 1,
          sourceCenterY - sourceHalfHeight,
          2,
          sourceHalfHeight * 2,
          center + offsetX,
          center - destinationHalfHeight,
          STRIP_WIDTH + 1,
          destinationHalfHeight * 2,
        );
      }

      context.restore();
      canvas.dataset.ready = "true";
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrame >= 1000 / 30 || reduceMotion) {
        draw(timestamp);
        lastFrame = timestamp;
      }
      if (!reduceMotion) animationFrame = requestAnimationFrame(animate);
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      if (document.hidden) return;
      animationFrame = requestAnimationFrame(animate);
    };

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      start();
    };
    const handleVisibilityChange = () => {
      if (image.complete) start();
    };
    const resizeObserver = new ResizeObserver(() => {
      renderSize = 0;
    });

    image.addEventListener("load", start);
    image.src = src;
    motionPreference.addEventListener("change", handleMotionPreference);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(animationFrame);
      image.removeEventListener("load", start);
      motionPreference.removeEventListener("change", handleMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
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
