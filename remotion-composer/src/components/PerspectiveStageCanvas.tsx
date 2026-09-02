import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolveAsset } from "../lib/resolveAsset";
import { ParticleOverlay, type ParticleType } from "./ParticleOverlay";

// ---------------------------------------------------------------------------
// Types for Story-Agnostic 2.5D Perspective Canvas
// ---------------------------------------------------------------------------

export type CameraKinematicMotion =
  | "ken-burns"
  | "tracking"
  | "floating"
  | "crane-up"
  | "vertigo-down"
  | "sway"
  | "static";

export type TimeOfDayPreset =
  | "dawn"
  | "golden_hour"
  | "noon"
  | "dusk"
  | "neon_night"
  | "storm"
  | "void";

export type GroundOverlayType =
  | "speed-streaks"
  | "water-ripples"
  | "clouds"
  | "heat-shimmer"
  | "dust-cloud"
  | "none";

export type ForegroundOccluderType =
  | "grass"
  | "water-spray"
  | "debris"
  | "bokeh"
  | "vignette-frost"
  | "none";

export interface StageBadgeConfig {
  title: string;
  value: string;
  icon?: string;
  accentColor?: string;
  position?: "top-left" | "top-right";
}

export interface LandmarkArchConfig {
  text?: string;
  bannerColor?: string;
  showArch?: boolean;
}

export interface PerspectiveStageCanvasProps {
  /** Background plate image path or URL */
  background?: string;
  /** Camera kinematic movement */
  cameraMotion?: CameraKinematicMotion;
  /** Lighting atmosphere */
  timeOfDay?: TimeOfDayPreset | string;
  /** Weather particles */
  weather?: ParticleType | "none";
  /** Speed multiplier for continuous parallax scrolling */
  speedMultiplier?: number;
  /** Dynamic ground effect overlay */
  groundOverlay?: GroundOverlayType;
  /** Foreground blurred occluders for depth */
  foregroundOccluder?: ForegroundOccluderType;
  /** Optional HUD badge */
  hudBadge?: StageBadgeConfig;
  /** Optional landmark archway */
  landmark?: LandmarkArchConfig;
  /** Legacy scenario compatibility alias */
  scenario?: string;
}

// ---------------------------------------------------------------------------
// Preset Atmosphere Gradients
// ---------------------------------------------------------------------------

const TIME_OF_DAY_GRADIENTS: Record<TimeOfDayPreset, { tint: string; ambient: string }> = {
  dawn: {
    tint: "linear-gradient(to bottom, rgba(251, 146, 60, 0.12) 0%, rgba(99, 102, 241, 0.2) 100%)",
    ambient: "linear-gradient(180deg, rgba(254, 215, 170, 0.08) 0%, transparent 100%)",
  },
  golden_hour: {
    tint: "linear-gradient(to bottom, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.25) 100%)",
    ambient: "linear-gradient(180deg, rgba(255, 183, 77, 0.1) 0%, rgba(255, 111, 0, 0.05) 50%, transparent 100%)",
  },
  noon: {
    tint: "linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 0%, rgba(15, 23, 42, 0.15) 100%)",
    ambient: "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)",
  },
  dusk: {
    tint: "linear-gradient(to bottom, rgba(236, 72, 153, 0.16) 0%, rgba(30, 27, 75, 0.32) 100%)",
    ambient: "linear-gradient(180deg, rgba(236, 72, 153, 0.08) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)",
  },
  neon_night: {
    tint: "linear-gradient(to bottom, rgba(168, 85, 247, 0.18) 0%, rgba(2, 6, 23, 0.45) 100%)",
    ambient: "linear-gradient(180deg, rgba(34, 211, 238, 0.08) 0%, rgba(147, 51, 234, 0.06) 50%, transparent 100%)",
  },
  storm: {
    tint: "linear-gradient(to bottom, rgba(56, 189, 248, 0.14) 0%, rgba(3, 105, 161, 0.3) 100%)",
    ambient: "linear-gradient(180deg, rgba(71, 85, 105, 0.12) 0%, rgba(15, 23, 42, 0.1) 50%, transparent 100%)",
  },
  void: {
    tint: "linear-gradient(to bottom, rgba(2, 4, 8, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%)",
    ambient: "linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, transparent 100%)",
  },
};

// ---------------------------------------------------------------------------
// Dynamic Perspective Stage Canvas
// ---------------------------------------------------------------------------

export const PerspectiveStageCanvas: React.FC<PerspectiveStageCanvasProps> = ({
  background = "backgrounds/sprint_track.jpg",
  cameraMotion = "ken-burns",
  timeOfDay = "golden_hour",
  weather = "light-rays",
  speedMultiplier = 1,
  groundOverlay = "speed-streaks",
  foregroundOccluder = "grass",
  hudBadge,
  landmark,
  scenario,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Backward compatibility adapter for legacy scenario names
  let effectiveBg = background;
  let effectiveMotion = cameraMotion;
  let effectiveTime = timeOfDay;
  let effectiveWeather = weather;
  let effectiveGround = groundOverlay;
  let effectiveOccluder = foregroundOccluder;

  if (scenario === "sprint") {
    effectiveBg = "backgrounds/sprint_track.jpg";
    effectiveMotion = "tracking";
    effectiveTime = "golden_hour";
    effectiveWeather = "light-rays";
    effectiveGround = "speed-streaks";
    effectiveOccluder = "grass";
  } else if (scenario === "river") {
    effectiveBg = "backgrounds/river_rapids.jpg";
    effectiveMotion = "floating";
    effectiveTime = "storm";
    effectiveWeather = "mist";
    effectiveGround = "water-ripples";
    effectiveOccluder = "water-spray";
  } else if (scenario === "uphill") {
    effectiveBg = "backgrounds/mountain_uphill.jpg";
    effectiveMotion = "crane-up";
    effectiveTime = "dusk";
    effectiveWeather = "snow";
    effectiveGround = "clouds";
    effectiveOccluder = "vignette-frost";
  } else if (scenario === "downhill") {
    effectiveBg = "backgrounds/mountain_downhill.jpg";
    effectiveMotion = "vertigo-down";
    effectiveTime = "golden_hour";
    effectiveWeather = "embers";
    effectiveGround = "dust-cloud";
    effectiveOccluder = "debris";
  }

  // Camera progression
  const cameraProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Calculate Camera Kinematics
  let scale = 1.08;
  let translateX = 0;
  let translateY = 0;

  switch (effectiveMotion) {
    case "tracking":
      scale = interpolate(cameraProgress, [0, 1], [1.05, 1.18]);
      translateY = interpolate(cameraProgress, [0, 1], [10, -25]);
      translateX = Math.sin((frame / fps) * Math.PI * 1.5) * 6;
      break;
    case "floating":
      scale = interpolate(cameraProgress, [0, 1], [1.06, 1.14]);
      translateY = Math.sin((frame / fps) * Math.PI * 2) * 8;
      translateX = interpolate(cameraProgress, [0, 1], [-12, 12]);
      break;
    case "crane-up":
      scale = interpolate(cameraProgress, [0, 1], [1.04, 1.16]);
      translateY = interpolate(cameraProgress, [0, 1], [25, -35]);
      break;
    case "vertigo-down":
      scale = interpolate(cameraProgress, [0, 1], [1.14, 1.05]);
      translateY = interpolate(cameraProgress, [0, 1], [-30, 20]);
      translateX = Math.sin((frame / fps) * Math.PI * 3) * 8;
      break;
    case "sway":
      scale = 1.1;
      translateX = Math.sin((frame / fps) * Math.PI * 0.8) * 15;
      translateY = Math.cos((frame / fps) * Math.PI * 0.6) * 8;
      break;
    case "ken-burns":
    default:
      scale = interpolate(cameraProgress, [0, 1], [1.05, 1.15]);
      translateX = interpolate(cameraProgress, [0, 1], [-10, 10]);
      translateY = interpolate(cameraProgress, [0, 1], [-8, 8]);
      break;
  }

  // Resolve Atmosphere Gradients
  const atmosphere =
    effectiveTime in TIME_OF_DAY_GRADIENTS
      ? TIME_OF_DAY_GRADIENTS[effectiveTime as TimeOfDayPreset]
      : { tint: effectiveTime, ambient: "transparent" };

  // Speed streak stream loop
  const streamOffset = (frame * 24 * speedMultiplier) % 300;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0F172A" }}>
      {/* 1. Cinematic Environment Plate with Kinematic Camera */}
      <div
        style={{
          position: "absolute",
          inset: -60,
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={resolveAsset(effectiveBg)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "contrast(1.08) saturate(1.15) brightness(0.97)",
          }}
        />
      </div>

      {/* 2. Ambient Time-of-Day Lighting */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: atmosphere.ambient,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />

      {/* 3. Color Grading Tint Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: atmosphere.tint,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* 4. Ground Effects Layer */}
      {effectiveGround === "speed-streaks" && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.6,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (i * 380 + streamOffset * 2.5) % 1920;
            return (
              <g key={i}>
                <line
                  x1="80"
                  y1={y}
                  x2="160"
                  y2={y + 140}
                  stroke="#FDE68A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity={0.7}
                />
                <line
                  x1="1000"
                  y1={y + 80}
                  x2="920"
                  y2={y + 220}
                  stroke="#FDE68A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              </g>
            );
          })}
        </svg>
      )}

      {effectiveGround === "water-ripples" && (
        <svg
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "55%",
            pointerEvents: "none",
            opacity: 0.4,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 200 + ((i * 180 + frame * 8) % 800);
            return (
              <path
                key={i}
                d={`M0,${y} Q270,${y - 20} 540,${y} T1080,${y}`}
                stroke="#E0F2FE"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {effectiveGround === "clouds" && (
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            left: `${-100 + (frame * 1.5) % 400}px`,
            width: "120%",
            height: 260,
            background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            filter: "blur(25px)",
            pointerEvents: "none",
          }}
        />
      )}

      {effectiveGround === "dust-cloud" && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "18%",
            background: "linear-gradient(180deg, transparent 0%, rgba(180, 120, 60, 0.1) 40%, rgba(180, 120, 60, 0.22) 100%)",
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 5. Atmospheric Weather Particles */}
      {effectiveWeather && effectiveWeather !== "none" && (
        <ParticleOverlay
          type={effectiveWeather}
          color={
            effectiveWeather === "rain"
              ? "#A0D2DB"
              : effectiveWeather === "snow"
              ? "#F0F9FF"
              : effectiveWeather === "embers"
              ? "#FF8C42"
              : "#FEF08A"
          }
          count={effectiveWeather === "rain" ? 40 : 25}
          intensity={0.65}
        />
      )}

      {/* 6. Foreground Occluders for Layered Depth */}
      {effectiveOccluder === "grass" && (
        <>
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: -30,
              width: 220,
              height: 130,
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.12) 60%, transparent 100%)",
              filter: "blur(14px)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 26,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -15,
              right: -25,
              width: 200,
              height: 110,
              background: "linear-gradient(225deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.1) 60%, transparent 100%)",
              filter: "blur(14px)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 26,
            }}
          />
        </>
      )}

      {effectiveOccluder === "water-spray" && (
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: "5%",
            right: "5%",
            height: 90,
            background: "radial-gradient(ellipse at center bottom, rgba(186, 230, 253, 0.18) 0%, transparent 75%)",
            filter: "blur(12px)",
            pointerEvents: "none",
            zIndex: 26,
          }}
        />
      )}

      {effectiveOccluder === "debris" && (
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: -20,
            width: 180,
            height: 90,
            background: "radial-gradient(ellipse, rgba(120, 80, 40, 0.28) 0%, transparent 70%)",
            filter: "blur(10px)",
            pointerEvents: "none",
            zIndex: 26,
          }}
        />
      )}

      {/* 7. Customizable Stage HUD Badge */}
      {hudBadge && (
        <div
          style={{
            position: "absolute",
            top: 70,
            ...(hudBadge.position === "top-left" ? { left: 40 } : { right: 40 }),
            background: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(12px)",
            border: `2px solid ${hudBadge.accentColor || "#22D3EE"}`,
            padding: "12px 24px",
            borderRadius: 16,
            color: "#F8FAFC",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: hudBadge.accentColor || "#22D3EE",
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {hudBadge.title}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2 }}>
            {hudBadge.icon ? `${hudBadge.icon} ` : ""}
            {hudBadge.value}
          </div>
        </div>
      )}

      {/* 8. Optional Landmark / Finish Arch */}
      {landmark?.showArch && (
        <div
          style={{
            position: "absolute",
            top: "43%",
            left: "50%",
            transform: "translate(-50%, -50%) perspective(900px) rotateX(12deg)",
            width: 880,
            height: 380,
            zIndex: 12,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 880 380" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <rect x="30" y="30" width="35" height="350" fill="#334155" stroke="#0F172A" strokeWidth="4" />
            <rect x="815" y="30" width="35" height="350" fill="#334155" stroke="#0F172A" strokeWidth="4" />
            <rect
              x="25"
              y="30"
              width="830"
              height="85"
              fill={landmark.bannerColor || "#EF4444"}
              rx="8"
              stroke="#991B1B"
              strokeWidth="5"
            />
            <defs>
              <pattern id="landmark-check-pat" width="28" height="28" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="#FFFFFF" />
                <rect x="14" width="14" height="14" fill="#000000" />
                <rect y="14" width="14" height="14" fill="#000000" />
                <rect x="14" y="14" width="14" height="14" fill="#FFFFFF" />
              </pattern>
            </defs>
            <rect x="35" y="75" width="810" height="30" fill="url(#landmark-check-pat)" stroke="#000000" strokeWidth="2" />
            <text
              x="440"
              y="65"
              fill="#FFFFFF"
              fontSize="34"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="Space Grotesk, sans-serif"
              letterSpacing="4"
            >
              ★ {landmark.text || "FINISH LINE"} ★
            </text>
          </svg>
        </div>
      )}

      {/* 9. Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(15, 23, 42, 0.45) 80%, rgba(15, 23, 42, 0.85) 100%)",
          pointerEvents: "none",
          zIndex: 25,
        }}
      />
    </AbsoluteFill>
  );
};
