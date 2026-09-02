import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Deterministic pseudo-random based on seed index.
 * Produces the same value every frame for the same seed — required for Remotion.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export type ParticleType =
  | "fireflies"
  | "petals"
  | "sparkles"
  | "mist"
  | "light-rays"
  | "embers"
  | "snow"
  | "rain"
  | "confetti";

interface ParticleOverlayProps {
  type: ParticleType;
  count?: number;
  color?: string;
  intensity?: number;
}

// ---------------------------------------------------------------------------
// Fireflies — glowing dots on sine-wave paths with pulsing opacity
// ---------------------------------------------------------------------------

const Fireflies: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalFadeIn = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalFadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const baseX = seededRandom(i * 7 + 1) * 90 + 5;
        const baseY = seededRandom(i * 13 + 2) * 80 + 10;
        const speed = 0.4 + seededRandom(i * 3 + 5) * 1.2;
        const phase = seededRandom(i * 11 + 3) * Math.PI * 2;
        const size = 3 + seededRandom(i * 17 + 4) * 7;

        const t = (frame / fps) * speed;
        const xOffset = Math.sin(t + phase) * 25;
        const yOffset = Math.cos(t * 0.7 + phase) * 18;
        const glowPulse = 0.3 + (Math.sin(t * 2.5 + phase) * 0.35 + 0.35);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(${baseX}% + ${xOffset}px)`,
              top: `calc(${baseY}% + ${yOffset}px)`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: glowPulse * intensity * globalFadeIn * globalFadeOut,
              boxShadow: `0 0 ${size * 3}px ${size * 1.5}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Petals — elliptical shapes drifting diagonally with rotation
// ---------------------------------------------------------------------------

const Petals: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalFadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const startX = seededRandom(i * 7 + 1) * 110 - 5;
        const speed = 0.3 + seededRandom(i * 3 + 5) * 0.5;
        const phase = seededRandom(i * 11 + 3) * Math.PI * 2;
        const size = 5 + seededRandom(i * 17 + 4) * 9;
        const delay = seededRandom(i * 19 + 6) * durationInFrames * 0.6;

        const elapsed = Math.max(0, frame - delay);
        const t = (elapsed / fps) * speed;

        const x = startX + Math.sin(t * 1.3 + phase) * 12 + t * 8;
        const y = -5 + t * 35;
        const rotation = t * 50 + phase * 57.3;

        const fadeIn = interpolate(
          frame,
          [delay, delay + fps * 0.4],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (y > 110) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size * 0.55,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: fadeIn * globalFadeOut * intensity * 0.75,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Sparkles — brief cross-shaped flashes at staggered timings
// ---------------------------------------------------------------------------

const Sparkles: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const x = seededRandom(i * 7 + 1) * 90 + 5;
        const y = seededRandom(i * 13 + 2) * 85 + 5;
        const size = 6 + seededRandom(i * 17 + 4) * 10;

        const cycleLen = Math.round(fps * (1.2 + seededRandom(i * 23 + 8) * 2));
        const offset = Math.round(seededRandom(i * 29 + 9) * durationInFrames);
        const cycleFrame =
          ((frame - offset) % cycleLen + cycleLen) % cycleLen;

        const sparkleAlpha = interpolate(
          cycleFrame,
          [0, cycleLen * 0.15, cycleLen * 0.4, cycleLen],
          [0, 1, 0.2, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const sparkleScale = interpolate(
          cycleFrame,
          [0, cycleLen * 0.25, cycleLen],
          [0.3, 1, 0.6],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              opacity: sparkleAlpha * intensity,
              transform: `scale(${sparkleScale}) rotate(45deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: 2,
                top: "50%",
                marginTop: -1,
                backgroundColor: color,
                borderRadius: 1,
                boxShadow: `0 0 ${size * 0.8}px ${color}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 2,
                height: "100%",
                left: "50%",
                marginLeft: -1,
                backgroundColor: color,
                borderRadius: 1,
                boxShadow: `0 0 ${size * 0.8}px ${color}`,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Mist — translucent gradient layers drifting horizontally
// ---------------------------------------------------------------------------

const Mist: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const layers = Math.min(count, 5);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: layers }, (_, i) => {
        const baseY = 55 + seededRandom(i * 7 + 1) * 35;
        const speed = 0.8 + seededRandom(i * 13 + 2) * 1.2;
        const xDrift = ((frame / fps) * speed * 3) % 200 - 50;
        const pulse = 0.08 + Math.sin(frame / fps * 0.4 + i * 1.8) * 0.05;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${xDrift}%`,
              top: `${baseY}%`,
              width: "160%",
              height: "25%",
              background: `radial-gradient(ellipse at center, rgba(255,255,255,${pulse}) 0%, transparent 70%)`,
              opacity: intensity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Light Rays — angled gradient beams with gentle pulsing
// ---------------------------------------------------------------------------

const LightRays: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rays = Math.min(count, 5);

  const globalFadeIn = interpolate(frame, [0, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: rays }, (_, i) => {
        const angle = -35 + seededRandom(i * 7 + 1) * 25;
        const xPos = 15 + seededRandom(i * 13 + 2) * 65;
        const beamWidth = 4 + seededRandom(i * 17 + 3) * 8;
        const pulse =
          0.06 + Math.sin(frame / fps * 0.6 + i * 2.2) * 0.04;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${xPos}%`,
              top: "-10%",
              width: `${beamWidth}%`,
              height: "120%",
              background: `linear-gradient(180deg, rgba(255,255,240,${pulse}) 0%, transparent 80%)`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "top center",
              opacity: intensity * globalFadeIn,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// NEW: Embers — glowing particles rising upward with flickering
// ---------------------------------------------------------------------------

const Embers: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalFadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const baseX = seededRandom(i * 7 + 1) * 100;
        const speed = 0.5 + seededRandom(i * 3 + 5) * 1.0;
        const phase = seededRandom(i * 11 + 3) * Math.PI * 2;
        const size = 2 + seededRandom(i * 17 + 4) * 5;
        const delay = seededRandom(i * 19 + 6) * durationInFrames * 0.4;

        const elapsed = Math.max(0, frame - delay);
        const t = (elapsed / fps) * speed;

        // Rise upward with gentle horizontal sway
        const x = baseX + Math.sin(t * 2 + phase) * 15;
        const y = 105 - t * 28; // Rise from bottom
        const flickerPulse = 0.4 + Math.sin(t * 8 + phase) * 0.3 + 0.3;

        // Fade in and lifetime fade
        const fadeIn = interpolate(
          frame,
          [delay, delay + fps * 0.3],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const lifetimeFade = y < 0 ? 0 : interpolate(y, [0, 40, 105], [0, 1, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        if (y < -5 || y > 110) return null;

        // Color gradation: bright core → dimmer edge
        const emberColor = i % 3 === 0 ? "#FF6B2B" : i % 3 === 1 ? "#FF9F43" : color;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: emberColor,
              opacity: flickerPulse * fadeIn * lifetimeFade * intensity * globalFadeIn,
              boxShadow: `0 0 ${size * 4}px ${size * 2}px ${emberColor}88, 0 0 ${size * 1.5}px ${emberColor}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// NEW: Snow — white flakes drifting down with gentle rotation
// ---------------------------------------------------------------------------

const Snow: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalFadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const baseX = seededRandom(i * 7 + 1) * 110 - 5;
        const speed = 0.15 + seededRandom(i * 3 + 5) * 0.3;
        const phase = seededRandom(i * 11 + 3) * Math.PI * 2;
        const size = 3 + seededRandom(i * 17 + 4) * 6;
        const delay = seededRandom(i * 19 + 6) * durationInFrames * 0.5;

        const elapsed = Math.max(0, frame - delay);
        const t = (elapsed / fps) * speed;

        // Gentle drift with horizontal sway
        const x = baseX + Math.sin(t * 0.8 + phase) * 20;
        const y = -5 + t * 22;
        const rotation = t * 30 + phase * 57.3;

        const fadeIn = interpolate(
          frame,
          [delay, delay + fps * 0.3],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (y > 110) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color || "#FFFFFF",
              opacity: fadeIn * intensity * globalFadeIn * 0.7,
              transform: `rotate(${rotation}deg)`,
              boxShadow: `0 0 ${size * 2}px ${color || "#FFFFFF"}44`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// NEW: Rain — angled streaks falling rapidly
// ---------------------------------------------------------------------------

const Rain: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalFadeIn = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: count }, (_, i) => {
          const baseX = seededRandom(i * 7 + 1) * 120 - 10;
          const speed = 2.0 + seededRandom(i * 3 + 5) * 2.0;
          const length = 20 + seededRandom(i * 17 + 4) * 30;
          const angle = 12; // Slight wind angle

          const t = (frame / fps) * speed;
          const y = ((seededRandom(i * 19 + 6) * 100 + t * 80) % 130) - 15;
          const x = baseX - (y * Math.tan((angle * Math.PI) / 180));

          const xPx = (x / 100) * 1080;
          const yPx = (y / 100) * 1920;

          return (
            <line
              key={i}
              x1={xPx}
              y1={yPx}
              x2={xPx + Math.sin((angle * Math.PI) / 180) * length}
              y2={yPx + Math.cos((angle * Math.PI) / 180) * length}
              stroke={color || "#A0D2DB"}
              strokeWidth={1.5 + seededRandom(i * 23 + 8) * 1.5}
              strokeLinecap="round"
              opacity={intensity * globalFadeIn * (0.3 + seededRandom(i * 29 + 9) * 0.5)}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// NEW: Confetti — multi-colored squares tumbling from top
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF9FF3", "#54A0FF"];

const Confetti: React.FC<{
  count: number;
  color: string;
  intensity: number;
}> = ({ count, color, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalFadeIn = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalFadeOut = interpolate(
    frame,
    [durationInFrames - fps * 1, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const baseX = seededRandom(i * 7 + 1) * 110 - 5;
        const speed = 0.3 + seededRandom(i * 3 + 5) * 0.4;
        const phase = seededRandom(i * 11 + 3) * Math.PI * 2;
        const size = 6 + seededRandom(i * 17 + 4) * 8;
        const delay = seededRandom(i * 19 + 6) * fps * 0.8; // Staggered burst
        const confettiColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

        const elapsed = Math.max(0, frame - delay);
        const t = (elapsed / fps) * speed;

        // Tumbling fall with horizontal sway
        const x = baseX + Math.sin(t * 2.5 + phase) * 25;
        const y = -10 + t * 30;
        const rotateX = t * 120 + phase * 57.3;
        const rotateZ = t * 80 + phase * 30;

        const fadeIn = interpolate(
          frame,
          [delay, delay + fps * 0.15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (y > 110) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size * 0.6,
              backgroundColor: confettiColor,
              opacity: fadeIn * intensity * globalFadeIn * globalFadeOut * 0.85,
              transform: `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
              borderRadius: 1,
              boxShadow: `0 1px 3px rgba(0,0,0,0.2)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Main export — dispatches to the right particle renderer
// ---------------------------------------------------------------------------

export const ParticleOverlay: React.FC<ParticleOverlayProps> = ({
  type,
  count = 20,
  color = "#FFE082",
  intensity = 0.6,
}) => {
  switch (type) {
    case "fireflies":
      return <Fireflies count={count} color={color} intensity={intensity} />;
    case "petals":
      return <Petals count={count} color={color} intensity={intensity} />;
    case "sparkles":
      return <Sparkles count={count} color={color} intensity={intensity} />;
    case "mist":
      return <Mist count={count} color={color} intensity={intensity} />;
    case "light-rays":
      return <LightRays count={count} color={color} intensity={intensity} />;
    case "embers":
      return <Embers count={count} color={color} intensity={intensity} />;
    case "snow":
      return <Snow count={count} color={color} intensity={intensity} />;
    case "rain":
      return <Rain count={count} color={color} intensity={intensity} />;
    case "confetti":
      return <Confetti count={count} color={color} intensity={intensity} />;
    default:
      return null;
  }
};
