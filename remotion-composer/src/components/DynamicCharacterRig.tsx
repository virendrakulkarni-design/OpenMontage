import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CustomCharacterRig } from "./CustomCharacterRig";

// ---------------------------------------------------------------------------
// Types for Upgraded Dimensional Character Rig
// ---------------------------------------------------------------------------

export type CharacterPose =
  | "running"
  | "walking"
  | "celebrating"
  | "panting"
  | "panicked"
  | "complaining"
  | "hiking"
  | "swimming"
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
  /** Environmental scenario context (for water splash, etc.) */
  isSubmergedInWater?: boolean;
}

// ---------------------------------------------------------------------------
// Upgraded 3D Cel-Shaded Dimensional Character Rig
// ---------------------------------------------------------------------------

export const DynamicCharacterRig: React.FC<DynamicCharacterRigProps> = ({
  imageSrc,
  archetype = "speedster",
  pose = "idle",
  scale = 1,
  flip = false,
  styling = {},
  label,
  isSubmergedInWater = false,
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
  const waterBob = Math.sin((frame / fps) * Math.PI * 3.5) * 8;

  // Resolve archetype color palettes with multi-stop gradients
  const isSpeedster = archetype === "speedster";
  const primary = styling.primaryColor || (isSpeedster ? "#F97316" : "#10B981");
  const secondary = styling.secondaryColor || (isSpeedster ? "#C2410C" : "#047857");
  const highlight = isSpeedster ? "#FED7AA" : "#D1FAE5";
  const rimGlow = isSpeedster ? "#FDE047" : "#6EE7B7";
  const accent = styling.accentColor || (isSpeedster ? "#EF4444" : "#0284C7");

  // Dynamic transforms based on pose
  let bodyTilt = 0;
  let bodyYOffset = isSubmergedInWater ? waterBob + 20 : 0;
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
  } else if (pose === "swimming") {
    bodyTilt = 12;
    bodyYOffset = waterBob + 25;
    eyeExpr = "determined";
    mouthShape = "smile";
  }

  const gradId = `char-grad-${isSpeedster ? "hare" : "tort"}`;

  return (
    <div
      style={{
        width: 250,
        height: 310,
        transform: `scale(${scale}) scaleX(${flip ? -1 : 1}) rotate(${bodyTilt}deg) translateY(${bodyYOffset}px)`,
        transformOrigin: "bottom center",
        position: "relative",
        filter: "drop-shadow(0 14px 22px rgba(15, 23, 42, 0.45))",
      }}
    >
      <svg viewBox="0 0 220 280" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          {/* Volumetric Spherical Shading */}
          <radialGradient id={`${gradId}-body`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="45%" stopColor={primary} />
            <stop offset="85%" stopColor={secondary} />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
          </radialGradient>

          {/* Shell 3D Bevel Gradient */}
          <linearGradient id={`${gradId}-shell`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Eye Iris Depth */}
          <radialGradient id={`${gradId}-iris`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          {/* High-speed motion blur line gradient */}
          <linearGradient id={`${gradId}-blur`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={rimGlow} stopOpacity="0.9" />
            <stop offset="100%" stopColor={primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Action Speed Streaks (for running) */}
        {pose === "running" && (
          <g>
            <line x1="-30" y1="130" x2="-120" y2="130" stroke={`url(#${gradId}-blur)`} strokeWidth="8" strokeLinecap="round" />
            <line x1="-20" y1="160" x2="-140" y2="160" stroke={`url(#${gradId}-blur)`} strokeWidth="10" strokeLinecap="round" />
            <line x1="-40" y1="190" x2="-90" y2="190" stroke={`url(#${gradId}-blur)`} strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* 1. Back Limb / Ear Layer */}
        {isSpeedster && (
          <g>
            {/* Long expressive ears with inner pink shading */}
            <path
              d={`M80,65 Q${60 + runCycle * 10},15 65,-25 Q82,-20 90,45 Z`}
              fill={`url(#${gradId}-body)`}
              stroke={secondary}
              strokeWidth="3"
            />
            <path d="M72,50 Q66,15 70,-12 Q78,-10 82,40 Z" fill="#FDA4AF" opacity={0.85} />
            <path
              d={`M120,65 Q${140 - runCycle * 10},15 135,-25 Q118,-20 110,45 Z`}
              fill={`url(#${gradId}-body)`}
              stroke={secondary}
              strokeWidth="3"
            />
            <path d="M128,50 Q134,15 130,-12 Q122,-10 118,40 Z" fill="#FDA4AF" opacity={0.85} />
          </g>
        )}

        {/* 2. Legs / Feet (Grounded or Swimming) */}
        {!isSubmergedInWater && (
          pose === "running" ? (
            <g>
              {/* Back leg stride */}
              <path
                d={`M80,185 Q${45 + runCycle * 35},220 ${25 - runCycle * 50},245`}
                stroke={primary}
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* High-performance running shoe */}
              <g transform={`translate(${25 - runCycle * 50}, 245)`}>
                <ellipse cx="0" cy="0" rx="20" ry="12" fill="#1E40AF" />
                <path d="M-18,6 L18,6" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <circle cx="-6" cy="-2" r="3" fill="#FACC15" />
              </g>

              {/* Forward leg stride */}
              <path
                d={`M120,185 Q${155 - runCycle * 35},220 ${175 + runCycle * 50},245`}
                stroke={primary}
                strokeWidth="20"
                strokeLinecap="round"
              />
              <g transform={`translate(${175 + runCycle * 50}, 245)`}>
                <ellipse cx="0" cy="0" rx="22" ry="13" fill="#1E40AF" />
                <path d="M-20,7 L20,7" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <circle cx="-6" cy="-2" r="3" fill="#FACC15" />
              </g>
            </g>
          ) : (
            <g>
              <path d="M75,185 L68,245" stroke={primary} strokeWidth="18" strokeLinecap="round" />
              <g transform="translate(66, 245)">
                <ellipse cx="0" cy="0" rx="19" ry="12" fill="#1E40AF" />
                <path d="M-16,6 L16,6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              </g>
              <path d="M125,185 L132,245" stroke={primary} strokeWidth="18" strokeLinecap="round" />
              <g transform="translate(134, 245)">
                <ellipse cx="0" cy="0" rx="19" ry="12" fill="#1E40AF" />
                <path d="M-16,6 L16,6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          )
        )}

        {/* 3. Main Torso / Shell */}
        {!isSpeedster ? (
          // Tortoise 3D Beveled Hexagonal Shell
          <g>
            <ellipse cx="100" cy="160" rx="55" ry="52" fill={`url(#${gradId}-shell)`} stroke="#064E3B" strokeWidth="5" />
            {/* Hexagonal Plates with 3D Bevels */}
            <polygon points="100,128 122,142 122,168 100,182 78,168 78,142" fill="#10B981" stroke="#047857" strokeWidth="3" />
            <polygon points="100,182 122,196 122,210 100,218 78,210 78,196" fill="#059669" stroke="#064E3B" strokeWidth="2.5" />
            <polygon points="122,142 145,152 145,178 122,168" fill="#34D399" opacity={0.8} />
            <polygon points="78,142 55,152 55,178 78,168" fill="#047857" opacity={0.8} />
          </g>
        ) : (
          // Hare Athletic Runner Torso with Jersey
          <g>
            <ellipse cx="100" cy="160" rx="44" ry="50" fill={`url(#${gradId}-body)`} stroke={secondary} strokeWidth="3" />
            {/* Pro Runner Jersey */}
            <path d="M66,138 Q100,122 134,138 L128,194 Q100,206 72,194 Z" fill={accent} stroke="#991B1B" strokeWidth="2.5" />
            {/* Racing Stripes */}
            <line x1="84" y1="134" x2="86" y2="198" stroke="#FDE047" strokeWidth="4" />
            <line x1="116" y1="134" x2="114" y2="198" stroke="#FDE047" strokeWidth="4" />
            {label && (
              <text x="100" y="174" fill="#FFFFFF" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">
                {label}
              </text>
            )}
          </g>
        )}

        {/* 4. Arms & Poses */}
        {pose === "celebrating" ? (
          <g>
            <path d="M62,145 Q35,80 22,48" stroke={primary} strokeWidth="16" strokeLinecap="round" />
            <circle cx="20" cy="42" r="14" fill="#FED7AA" stroke={secondary} strokeWidth="2" />
            <path d="M138,145 Q165,80 178,48" stroke={primary} strokeWidth="16" strokeLinecap="round" />
            <circle cx="180" cy="42" r="14" fill="#FED7AA" stroke={secondary} strokeWidth="2" />
          </g>
        ) : (
          <g>
            <path d={`M66,145 Q${35 + runCycle * 25},${160 - runCycle * 15} ${46 + runCycle * 30},170`} stroke={primary} strokeWidth="15" strokeLinecap="round" />
            <circle cx={46 + runCycle * 30} cy="170" r="11" fill="#FED7AA" />
            <path d={`M134,145 Q${165 - runCycle * 25},${160 + runCycle * 15} ${154 - runCycle * 30},170`} stroke={primary} strokeWidth="15" strokeLinecap="round" />
            <circle cx={154 - runCycle * 30} cy="170" r="11" fill="#FED7AA" />
          </g>
        )}

        {/* 5. Head with Volumetric Shading */}
        <circle cx="100" cy="85" r="42" fill={`url(#${gradId}-body)`} stroke={secondary} strokeWidth="3.5" />
        <ellipse cx="100" cy="98" rx="28" ry="20" fill="#FED7AA" opacity={0.95} />

        {/* Goggles / Accessories */}
        {isSpeedster ? (
          // Aerodynamic Runner Visor
          <g>
            <path d="M64,74 Q100,58 136,74 L132,86 Q100,74 68,86 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <line x1="74" y1="76" x2="126" y2="76" stroke="#38BDF8" strokeWidth="2" opacity={0.8} />
          </g>
        ) : (
          // Swimming / Mountaineering Goggles
          <g>
            <ellipse cx="82" cy="82" rx="14" ry="12" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <ellipse cx="118" cy="82" rx="14" ry="12" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <line x1="96" y1="82" x2="104" y2="82" stroke="#0F172A" strokeWidth="4" />
            <line x1="68" y1="82" x2="60" y2="84" stroke="#0F172A" strokeWidth="3" />
            <line x1="132" y1="82" x2="140" y2="84" stroke="#0F172A" strokeWidth="3" />
          </g>
        )}

        {/* Expressive Eyes with Specular Highlights */}
        {eyeExpr === "exhausted" ? (
          <g>
            <text x="84" y="92" fontSize="24" fontWeight="900" fill="#1E293B" textAnchor="middle">X</text>
            <text x="116" y="92" fontSize="24" fontWeight="900" fill="#1E293B" textAnchor="middle">X</text>
          </g>
        ) : eyeExpr === "happy" ? (
          <g>
            <path d="M74,84 Q84,70 94,84" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M106,84 Q116,70 126,84" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            {/* Left Eye */}
            <ellipse cx="83" cy="85" rx="11" ry="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="85" cy="86" r="7.5" fill={`url(#${gradId}-iris)`} />
            <circle cx="83" cy="82" r="3" fill="#FFFFFF" />
            <circle cx="87" cy="88" r="1.5" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="117" cy="85" rx="11" ry="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="115" cy="86" r="7.5" fill={`url(#${gradId}-iris)`} />
            <circle cx="113" cy="82" r="3" fill="#FFFFFF" />
            <circle cx="117" cy="88" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Nose */}
        <polygon points="96,98 104,98 100,105" fill="#F43F5E" />

        {/* Mouth */}
        {mouthShape === "open" || mouthShape === "shout" ? (
          <ellipse cx="100" cy="112" rx="11" ry="9" fill="#881337" stroke="#0F172A" strokeWidth="2.5" />
        ) : mouthShape === "tongue_out" ? (
          <g>
            <path d="M92,108 Q100,114 108,108" stroke="#0F172A" strokeWidth="3.5" fill="none" />
            <path d="M96,110 C96,122 104,122 104,110 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
          </g>
        ) : (
          <path d="M91,108 Q100,118 109,108" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}

        {/* Water Splash Mask & Droplets (When Submerged) */}
        {isSubmergedInWater && (
          <g>
            {/* Waterline Foam Cutout */}
            <path
              d="M10,210 Q60,195 110,210 T210,210 L220,280 L0,280 Z"
              fill="rgba(56, 189, 248, 0.45)"
              opacity={0.7}
            />
            <path
              d="M10,210 Q60,195 110,210 T210,210"
              stroke="#E0F2FE"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Water Splash Droplets */}
            <circle cx={40 + Math.sin(frame * 0.3) * 10} cy={195 - Math.abs(Math.sin(frame * 0.2)) * 25} r="5" fill="#BAE6FD" />
            <circle cx={170 + Math.cos(frame * 0.3) * 10} cy={195 - Math.abs(Math.cos(frame * 0.2)) * 25} r="6" fill="#BAE6FD" />
            <circle cx={100} cy={190 - Math.abs(Math.sin(frame * 0.4)) * 20} r="4" fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
};
