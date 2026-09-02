import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CustomCharacterRig } from "./CustomCharacterRig";

// ---------------------------------------------------------------------------
// Types for Story-Agnostic Character Rig
// ---------------------------------------------------------------------------

export type CharacterPose =
  | "running"
  | "walking"
  | "celebrating"
  | "panting"
  | "panicked"
  | "complaining"
  | "hiking"
  | "tumble"
  | "talking"
  | "idle";

export type CharacterArchetype =
  | "speedster"
  | "steady"
  | "hero"
  | "thinker"
  | "custom";

export interface CharacterStyling {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  accessory?: "headband" | "goggles" | "backpack" | "floaties" | "none";
}

export interface DynamicCharacterRigProps {
  /** Optional custom user-uploaded character image */
  imageSrc?: string;
  /** Character archetype for procedural vector rendering */
  archetype?: CharacterArchetype;
  /** Active animated pose */
  pose?: CharacterPose | string;
  /** Character scale multiplier */
  scale?: number;
  /** Flip horizontally */
  flip?: boolean;
  /** Custom colors and accessories */
  styling?: CharacterStyling;
  /** Custom label / jersey number */
  label?: string;
}

// ---------------------------------------------------------------------------
// Universal Procedural Character Rig
// ---------------------------------------------------------------------------

export const DynamicCharacterRig: React.FC<DynamicCharacterRigProps> = ({
  imageSrc,
  archetype = "speedster",
  pose = "idle",
  scale = 1,
  flip = false,
  styling = {},
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // If user provided a custom image, route to CustomCharacterRig
  if (imageSrc) {
    return (
      <CustomCharacterRig
        imageSrc={imageSrc}
        pose={pose as any}
        scale={scale}
        flip={flip}
      />
    );
  }

  // Procedural dynamic animation physics
  const runCycle = Math.sin((frame / fps) * Math.PI * 8);
  const walkCycle = Math.sin((frame / fps) * Math.PI * 4);
  const breathCycle = Math.sin((frame / fps) * Math.PI * 3);
  const celebrationBounce = Math.sin((frame / fps) * Math.PI * 6) * -22;

  // Resolve archetype color schemes
  const primary =
    styling.primaryColor ||
    (archetype === "steady" ? "#10B981" : archetype === "hero" ? "#3B82F6" : "#EA580C");
  const secondary =
    styling.secondaryColor ||
    (archetype === "steady" ? "#064E3B" : archetype === "hero" ? "#1E40AF" : "#9A3412");
  const accent =
    styling.accentColor ||
    (archetype === "steady" ? "#A3E635" : archetype === "hero" ? "#FACC15" : "#EF4444");

  // Dynamic transforms based on pose
  let bodyTilt = 0;
  let bodyYOffset = 0;
  let eyeExpr = "normal";
  let mouthShape = "smile";

  if (pose === "running") {
    bodyTilt = 18;
    bodyYOffset = Math.abs(runCycle) * -16;
    eyeExpr = "determined";
    mouthShape = "grin";
  } else if (pose === "celebrating") {
    bodyYOffset = celebrationBounce;
    eyeExpr = "happy";
    mouthShape = "open";
  } else if (pose === "panting") {
    bodyTilt = -14;
    bodyYOffset = breathCycle * 10 + 14;
    eyeExpr = "exhausted";
    mouthShape = "tongue_out";
  } else if (pose === "panicked") {
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 10) * 8;
    eyeExpr = "panic";
    mouthShape = "gasp";
  } else if (pose === "complaining") {
    bodyTilt = -8;
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 12) * 4;
    eyeExpr = "angry";
    mouthShape = "shout";
  } else if (pose === "walking" || pose === "hiking") {
    bodyYOffset = Math.abs(walkCycle) * -8;
  } else if (pose === "tumble") {
    const rollAngle = (frame * 32) % 360;
    return (
      <div
        style={{
          width: 220,
          height: 220,
          transform: `scale(${scale}) rotate(${rollAngle}deg)`,
          position: "relative",
          filter: "drop-shadow(0 16px 28px rgba(234, 88, 12, 0.6))",
        }}
      >
        <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <circle cx="100" cy="100" r="75" fill={primary} stroke={secondary} strokeWidth="6" />
          <circle cx="100" cy="100" r="60" fill={accent} opacity={0.8} />
          <polygon points="100,55 125,75 125,115 100,135 75,115 75,75" fill={secondary} />
          <polygon points="100,115 125,135 125,175 100,195 75,175 75,135" fill={primary} />
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 240,
        height: 290,
        transform: `scale(${scale}) scaleX(${flip ? -1 : 1}) rotate(${bodyTilt}deg) translateY(${bodyYOffset}px)`,
        transformOrigin: "bottom center",
        position: "relative",
        filter: "drop-shadow(0 14px 20px rgba(0,0,0,0.4))",
      }}
    >
      <svg viewBox="0 0 200 260" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <radialGradient id={`dyn-char-${primary}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="70%" stopColor={secondary} />
          </radialGradient>
        </defs>

        {/* Action Speed Streaks */}
        {pose === "running" && (
          <g opacity={0.85}>
            <line x1="-30" y1="130" x2="-90" y2="130" stroke={primary} strokeWidth="6" strokeLinecap="round" strokeDasharray="12 18" />
            <line x1="-20" y1="160" x2="-110" y2="160" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" strokeDasharray="16 22" />
          </g>
        )}

        {/* Sweat drops for panting */}
        {pose === "panting" && (
          <g transform={`translate(155, ${50 + breathCycle * 10})`}>
            <path d="M0,18 C-6,18 -10,12 0,0 C10,12 6,18 0,18 Z" fill="#38BDF8" opacity={0.9} />
          </g>
        )}

        {/* Legs Cycle */}
        {pose === "running" ? (
          <g>
            <path
              d={`M80,180 Q${50 + runCycle * 30},${220} ${35 - runCycle * 45},${240}`}
              stroke={primary}
              strokeWidth="16"
              strokeLinecap="round"
            />
            <ellipse cx={35 - runCycle * 45} cy="245" rx="18" ry="11" fill="#1E3A8A" />
            <path
              d={`M120,180 Q${150 - runCycle * 30},${220} ${165 + runCycle * 45},${240}`}
              stroke={primary}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <ellipse cx={165 + runCycle * 45} cy="245" rx="20" ry="12" fill="#1E3A8A" />
          </g>
        ) : (
          <g>
            <path d="M75,180 L70,240" stroke={primary} strokeWidth="16" strokeLinecap="round" />
            <ellipse cx="68" cy="244" rx="18" ry="11" fill="#1E3A8A" />
            <path d="M125,180 L130,240" stroke={primary} strokeWidth="16" strokeLinecap="round" />
            <ellipse cx="132" cy="244" rx="18" ry="11" fill="#1E3A8A" />
          </g>
        )}

        {/* Torso */}
        <ellipse cx="100" cy="155" rx="42" ry="48" fill={`url(#dyn-char-${primary})`} stroke={secondary} strokeWidth="3" />

        {/* Jersey / Costume */}
        <path d="M68,135 Q100,118 132,135 L126,188 Q100,198 74,188 Z" fill={accent} stroke="#000000" strokeWidth="2" />
        {label && (
          <text x="100" y="172" fill="#FFFFFF" fontSize="26" fontWeight="900" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">
            {label}
          </text>
        )}

        {/* Arms */}
        {pose === "celebrating" ? (
          <g>
            <path d="M65,140 Q40,85 28,55" stroke={primary} strokeWidth="14" strokeLinecap="round" />
            <circle cx="26" cy="50" r="12" fill="#FED7AA" />
            <path d="M135,140 Q160,85 172,55" stroke={primary} strokeWidth="14" strokeLinecap="round" />
            <circle cx="174" cy="50" r="12" fill="#FED7AA" />
          </g>
        ) : (
          <g>
            <path d={`M70,140 Q${40 + runCycle * 25},${155 - runCycle * 15} ${50 + runCycle * 30},165`} stroke={primary} strokeWidth="14" strokeLinecap="round" />
            <circle cx={50 + runCycle * 30} cy="165" r="10" fill="#FED7AA" />
            <path d={`M130,140 Q${160 - runCycle * 25},${155 + runCycle * 15} ${150 - runCycle * 30},165`} stroke={primary} strokeWidth="14" strokeLinecap="round" />
            <circle cx={150 - runCycle * 30} cy="165" r="10" fill="#FED7AA" />
          </g>
        )}

        {/* Head */}
        <circle cx="100" cy="85" r="38" fill={`url(#dyn-char-${primary})`} stroke={secondary} strokeWidth="3" />
        <ellipse cx="100" cy="98" rx="26" ry="18" fill="#FED7AA" />

        {/* Optional Accessory */}
        {styling.accessory === "headband" && (
          <path d="M64,70 Q100,58 136,70" stroke={accent} strokeWidth="9" strokeLinecap="round" fill="none" />
        )}
        {styling.accessory === "goggles" && (
          <g>
            <ellipse cx="85" cy="82" rx="10" ry="8" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
            <ellipse cx="115" cy="82" rx="10" ry="8" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
            <line x1="95" y1="82" x2="105" y2="82" stroke="#0369A1" strokeWidth="2.5" />
          </g>
        )}

        {/* Eyes */}
        {eyeExpr === "exhausted" ? (
          <g>
            <text x="86" y="90" fontSize="22" fontWeight="900" fill="#1E293B" textAnchor="middle">X</text>
            <text x="114" y="90" fontSize="22" fontWeight="900" fill="#1E293B" textAnchor="middle">X</text>
          </g>
        ) : eyeExpr === "happy" ? (
          <g>
            <path d="M78,85 Q88,74 98,85" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M102,85 Q112,74 122,85" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        ) : eyeExpr === "angry" ? (
          <g>
            <path d="M76,76 L96,86" stroke="#7F1D1D" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="88" cy="89" r="6" fill="#1E293B" />
            <path d="M124,76 L104,86" stroke="#7F1D1D" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="112" cy="89" r="6" fill="#1E293B" />
          </g>
        ) : (
          <g>
            <ellipse cx="86" cy="86" rx="8" ry="11" fill="#FFFFFF" stroke={secondary} strokeWidth="2" />
            <circle cx="88" cy="87" r="5" fill="#1E293B" />
            <circle cx="86" cy="84" r="2" fill="#FFFFFF" />
            <ellipse cx="114" cy="86" rx="8" ry="11" fill="#FFFFFF" stroke={secondary} strokeWidth="2" />
            <circle cx="116" cy="87" r="5" fill="#1E293B" />
            <circle cx="114" cy="84" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Nose */}
        <polygon points="95,96 105,96 100,103" fill="#F43F5E" />

        {/* Mouth */}
        {mouthShape === "tongue_out" ? (
          <g>
            <path d="M92,106 Q100,111 108,106" stroke="#1E293B" strokeWidth="3" fill="none" />
            <path d="M96,108 C96,120 104,120 104,108 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
          </g>
        ) : mouthShape === "open" || mouthShape === "shout" ? (
          <ellipse cx="100" cy="108" rx="10" ry="8" fill="#881337" stroke="#1E293B" strokeWidth="2" />
        ) : (
          <path d="M92,106 Q100,115 108,106" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
};
