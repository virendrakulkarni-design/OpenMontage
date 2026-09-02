import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// Deterministic pseudo-random for film grain
// ---------------------------------------------------------------------------
function grainNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CinematicOverlayProps {
  /** Show anamorphic letterbox bars (top/bottom) */
  letterbox?: boolean;
  /** Letterbox bar height as percentage of frame height (default: 5) */
  letterboxPercent?: number;
  /** Show film grain noise overlay */
  filmGrain?: boolean;
  /** Film grain opacity (default: 0.04) */
  grainOpacity?: number;
  /** Show warm light leak from corners */
  lightLeak?: boolean;
  /** Light leak color (default: warm gold) */
  lightLeakColor?: string;
  /** Show edge vignette darkening */
  vignette?: boolean;
  /** Vignette strength (default: 0.5) */
  vignetteStrength?: number;
}

// ---------------------------------------------------------------------------
// Film Grain Generator — generates a grid of noise dots
// ---------------------------------------------------------------------------

const FilmGrainLayer: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();

  // Generate a grid of semi-random opacity dots that change each frame
  // Using SVG for deterministic rendering across frames
  const gridSize = 12;
  const cols = Math.ceil(1080 / gridSize);
  const rows = Math.ceil(1920 / gridSize);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay" }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1080 1920"
        preserveAspectRatio="none"
      >
        {Array.from({ length: Math.min(rows * cols, 2000) }, (_, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const noiseSeed = idx * 1.618 + frame * 0.1;
          const noiseVal = grainNoise(noiseSeed);

          // Only render ~30% of cells for performance
          if (noiseVal < 0.7) return null;

          const grainAlpha = (noiseVal - 0.7) * 3.33 * opacity;

          return (
            <rect
              key={idx}
              x={col * gridSize}
              y={row * gridSize}
              width={gridSize}
              height={gridSize}
              fill={noiseVal > 0.85 ? "#FFFFFF" : "#000000"}
              opacity={grainAlpha}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Letterbox Bars — animated anamorphic widescreen bars
// ---------------------------------------------------------------------------

const LetterboxBars: React.FC<{ heightPercent: number }> = ({
  heightPercent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate bars sliding in from edges
  const slideIn = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barHeight = `${heightPercent * slideIn}%`;

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: "#000000",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: "#000000",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Light Leak — warm golden glow from corners with pulse
// ---------------------------------------------------------------------------

const LightLeak: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 0.08 + Math.sin((frame / fps) * 0.5) * 0.04;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Top-right warm glow */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}${Math.round(pulse * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      {/* Bottom-left subtle glow */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}${Math.round(pulse * 0.5 * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(35px)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Main Cinematic Overlay
// ---------------------------------------------------------------------------

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  letterbox = true,
  letterboxPercent = 4.5,
  filmGrain = true,
  grainOpacity = 0.035,
  lightLeak = true,
  lightLeakColor = "#FFB347",
  vignette = true,
  vignetteStrength = 0.5,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 48 }}>
      {/* Film grain noise */}
      {filmGrain && <FilmGrainLayer opacity={grainOpacity} />}

      {/* Warm light leak */}
      {lightLeak && <LightLeak color={lightLeakColor} />}

      {/* Edge vignette */}
      {vignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, ${vignetteStrength * 0.6}) 85%, rgba(0, 0, 0, ${vignetteStrength}) 100%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Letterbox bars (topmost layer) */}
      {letterbox && <LetterboxBars heightPercent={letterboxPercent} />}
    </AbsoluteFill>
  );
};
