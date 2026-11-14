import React, { useEffect, useRef } from 'react';

interface Shard {
  // Bounding box in offscreen canvas
  x: number;
  y: number;
  w: number;
  h: number;
  // Irregular polygon vertices relative to (x, y)
  points: [number, number][];
  // Center
  cx: number;
  cy: number;
  // Physics parameters
  pStart: number;
  fallSpeed: number;
  driftX: number;
  rotSpeed: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  driftX: number;
  fallSpeed: number;
  pStart: number;
  opacity: number;
}

export default function CrumbleText(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Offscreen canvas to render pristine text and slice
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    let shards: Shard[] = [];
    let dustParticles: DustParticle[] = [];
    let textBounds = { x: 0, y: 0, w: 0, h: 0 };
    let dpr = 1;

    const initShatter = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const width = Math.max(rect.width, 320);

      // Font size calculation matching CSS clamp(4.5rem, 11vw, 9.8rem)
      const baseRem = 16;
      const minPx = 4.5 * baseRem;
      const maxPx = 9.8 * baseRem;
      const preferredPx = window.innerWidth * 0.11;
      const fontSizeCss = Math.min(maxPx, Math.max(minPx, preferredPx));
      const fontSize = fontSizeCss * dpr;

      // Tight DOM height so it doesn't push down following elements
      const textDomHeight = Math.ceil(fontSizeCss * 0.95);
      container.style.height = `${textDomHeight}px`;

      // Canvas height has extra headroom below for falling fragments without affecting layout
      const canvasDomHeight = textDomHeight + 400;

      canvas.width = width * dpr;
      canvas.height = canvasDomHeight * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${canvasDomHeight}px`;

      offscreen.width = width * dpr;
      offscreen.height = canvasDomHeight * dpr;

      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      offCtx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      const centerX = (width * dpr) / 2;
      const centerY = (textDomHeight * dpr) / 2; // Perfectly centered inside tight text bounds

      // Measure text
      const metrics = offCtx.measureText('Phasor');
      const textWidth = metrics.width;
      const textHeight = fontSize * 0.92;

      textBounds = {
        x: centerX - textWidth / 2 - 16 * dpr,
        y: centerY - textHeight / 2 - 8 * dpr,
        w: textWidth + 32 * dpr,
        h: textHeight + 16 * dpr,
      };

      // Draw pristine text in offscreen canvas
      offCtx.fillStyle = '#ffffff';
      offCtx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      offCtx.shadowBlur = 32 * dpr;
      offCtx.shadowOffsetY = 4 * dpr;
      offCtx.fillText('Phasor', centerX, centerY);

      // Reset shadow for clipping draws
      offCtx.shadowBlur = 0;
      offCtx.shadowOffsetY = 0;

      // Sample pixels to extract shards only where text exists
      const imgData = offCtx.getImageData(
        Math.floor(textBounds.x),
        Math.floor(textBounds.y),
        Math.ceil(textBounds.w),
        Math.ceil(textBounds.h)
      );

      const cols = 20;
      const rows = 8;
      const cellW = textBounds.w / cols;
      const cellH = textBounds.h / rows;

      shards = [];
      dustParticles = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = textBounds.x + c * cellW;
          const sy = textBounds.y + r * cellH;

          // Check if this cell contains non-transparent text pixels
          let hasPixels = false;
          const sampleX = Math.floor(c * cellW + cellW / 2);
          const sampleY = Math.floor(r * cellH + cellH / 2);
          const pixelIndex = (sampleY * Math.ceil(textBounds.w) + sampleX) * 4;

          if (imgData.data[pixelIndex + 3] > 25) {
            hasPixels = true;
          } else {
            // Check corners
            for (let dy = 0; dy <= cellH; dy += cellH / 2) {
              for (let dx = 0; dx <= cellW; dx += cellW / 2) {
                const px = Math.min(Math.ceil(textBounds.w) - 1, Math.max(0, Math.floor(c * cellW + dx)));
                const py = Math.min(Math.ceil(textBounds.h) - 1, Math.max(0, Math.floor(r * cellH + dy)));
                const idx = (py * Math.ceil(textBounds.w) + px) * 4;
                if (imgData.data[idx + 3] > 25) {
                  hasPixels = true;
                  break;
                }
              }
              if (hasPixels) break;
            }
          }

          if (!hasPixels) continue;

          // Create irregular polygon shard vertices with jitter
          const jx = (seed: number): number => ((Math.sin(seed * 99.7) * 0.45) * cellW * 0.4);
          const jy = (seed: number): number => ((Math.cos(seed * 43.3) * 0.45) * cellH * 0.4);

          const idx = r * cols + c;
          const points: [number, number][] = [
            [jx(idx + 1), jy(idx + 1)],
            [cellW + jx(idx + 2), jy(idx + 3)],
            [cellW + jx(idx + 4), cellH + jy(idx + 5)],
            [jx(idx + 6), cellH + jy(idx + 7)],
          ];

          // Staggered trigger: bottom shards crumble earlier than top shards
          const normalizedY = r / rows;
          const pStart = 0.04 + (1 - normalizedY) * 0.35 + ((idx % 7) / 7) * 0.08;

          // Physics characteristics
          const rotSpeed = ((idx % 2 === 0 ? 1 : -1) * (0.8 + (idx % 5) * 0.35));
          const driftX = ((idx % 3 - 1) * (40 + (idx % 4) * 30)) * dpr;
          const fallSpeed = (480 + (idx % 6) * 120) * dpr;

          shards.push({
            x: sx,
            y: sy,
            w: cellW,
            h: cellH,
            points,
            cx: sx + cellW / 2,
            cy: sy + cellH / 2,
            pStart,
            fallSpeed,
            driftX,
            rotSpeed,
          });

          // Add dust particles for crumbling texture
          if (idx % 3 === 0) {
            dustParticles.push({
              x: sx + cellW / 2 + jx(idx * 3),
              y: sy + cellH / 2 + jy(idx * 3),
              size: (1.5 + (idx % 3) * 1.5) * dpr,
              driftX: ((idx % 2 === 0 ? 1 : -1) * (30 + (idx % 5) * 20)) * dpr,
              fallSpeed: (600 + (idx % 4) * 150) * dpr,
              pStart: pStart * 0.85,
              opacity: 0.75 + (idx % 3) * 0.1,
            });
          }
        }
      }
    };

    // Render loop
    const render = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scroll threshold: crumbly action completes within first 380px of scroll
      const scrollY = scrollRef.current;
      const progress = Math.min(1, Math.max(0, scrollY / 380));

      if (progress === 0) {
        // Pristine intact text
        ctx.drawImage(offscreen, 0, 0);
      } else {
        // Draw crumbling shards
        for (let i = 0; i < shards.length; i++) {
          const shard = shards[i];

          if (progress < shard.pStart) {
            // Intact or slight micro-crack vibration
            const jitterProgress = progress / shard.pStart;
            const vibX = jitterProgress > 0.6 ? (Math.sin(i * 12.3 + scrollY * 0.1) * 0.8 * dpr) : 0;
            const vibY = jitterProgress > 0.6 ? (Math.cos(i * 7.1 + scrollY * 0.1) * 0.8 * dpr) : 0;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(shard.x + shard.points[0][0] + vibX, shard.y + shard.points[0][1] + vibY);
            for (let p = 1; p < shard.points.length; p++) {
              ctx.lineTo(shard.x + shard.points[p][0] + vibX, shard.y + shard.points[p][1] + vibY);
            }
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(offscreen, vibX, vibY);
            ctx.restore();
          } else {
            // Shard in falling / crumbling motion
            const localP = (progress - shard.pStart) / (1 - shard.pStart);
            const easeP = Math.pow(localP, 1.85); // gravity acceleration curve

            const curX = shard.cx + localP * shard.driftX;
            const curY = shard.cy + easeP * shard.fallSpeed;
            const curRot = localP * shard.rotSpeed;
            const curAlpha = Math.max(0, 1 - localP * 1.35);

            if (curAlpha > 0.01) {
              ctx.save();
              ctx.globalAlpha = curAlpha;
              ctx.translate(curX, curY);
              ctx.rotate(curRot);

              // Clip to shard polygon
              ctx.beginPath();
              ctx.moveTo(shard.points[0][0] - shard.w / 2, shard.points[0][1] - shard.h / 2);
              for (let p = 1; p < shard.points.length; p++) {
                ctx.lineTo(shard.points[p][0] - shard.w / 2, shard.points[p][1] - shard.h / 2);
              }
              ctx.closePath();
              ctx.clip();

              // Draw corresponding section from offscreen canvas
              ctx.drawImage(
                offscreen,
                -shard.cx,
                -shard.cy
              );

              ctx.restore();
            }
          }
        }

        // Render dust particles falling behind shards
        for (let j = 0; j < dustParticles.length; j++) {
          const dust = dustParticles[j];
          if (progress > dust.pStart) {
            const localP = (progress - dust.pStart) / (1 - dust.pStart);
            const easeP = Math.pow(localP, 1.6);
            const curX = dust.x + localP * dust.driftX + Math.sin(localP * 8 + j) * 8 * dpr;
            const curY = dust.y + easeP * dust.fallSpeed;
            const curAlpha = Math.max(0, dust.opacity * (1 - localP * 1.4));

            if (curAlpha > 0.01) {
              ctx.fillStyle = `rgba(255, 235, 235, ${curAlpha})`;
              ctx.beginPath();
              ctx.arc(curX, curY, dust.size * (1 - localP * 0.4), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    const handleScroll = (): void => {
      scrollRef.current = window.scrollY;
    };

    const handleResize = (): void => {
      initShatter();
    };

    initShatter();
    animFrameRef.current = requestAnimationFrame(render);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="crumble-text-container"
    >
      <canvas
        ref={canvasRef}
        className="crumble-canvas"
      />
      {/* Visually hidden heading for screen readers & SEO */}
      <h1 className="sr-only">Phasor</h1>
    </div>
  );
}
