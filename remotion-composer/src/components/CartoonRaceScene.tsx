import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CustomCharacterRig } from "./CustomCharacterRig";
import { PerspectiveRaceCanvas } from "./PerspectiveRaceCanvas";
import { CinematicOverlay } from "./CinematicOverlay";
import { DynamicStoryScene } from "./DynamicStoryScene";

export type HarePose =
  | "running"
  | "celebrating"
  | "panting"
  | "panicked_swimming"
  | "furious_complaining"
  | "idle";

export type TortoisePose =
  | "walking"
  | "swimming"
  | "hiking"
  | "shell_ball"
  | "smirking_winner"
  | "idle";

export type RaceScenario = "sprint" | "river" | "uphill" | "downhill";

export interface CartoonRaceSceneProps {
  scenario: RaceScenario;
  sceneTitle: string;
  sceneSubtitle?: string;
  harePose: HarePose;
  tortoisePose: TortoisePose;
  hareXPercent?: number; // 0 to 100
  tortoiseXPercent?: number; // 0 to 100
  hareSpeech?: string;
  tortoiseSpeech?: string;
  hareImage?: string; // Optional user-uploaded custom character image
  tortoiseImage?: string; // Optional user-uploaded custom character image
  sfxText?: string;
  narratorText?: string;
  accentColor?: string;
  showFinishLine?: boolean;
  winner?: "hare" | "tortoise" | "none";
}

// ---------------------------------------------------------------------------
// 1. VOLUMETRIC CEL-SHADED HARE CHARACTER RIG
// ---------------------------------------------------------------------------
export const HareCharacter: React.FC<{
  pose: HarePose;
  scale?: number;
  flip?: boolean;
}> = ({ pose, scale = 1, flip = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic cycling physics
  const runCycle = Math.sin((frame / fps) * Math.PI * 8);
  const breathCycle = Math.sin((frame / fps) * Math.PI * 4);
  const earWiggle = Math.sin((frame / fps) * Math.PI * 6) * 12;

  let earRotationLeft = -15 + (pose === "running" ? -25 : earWiggle);
  let earRotationRight = 15 + (pose === "running" ? -20 : -earWiggle);
  let eyeExpression = "normal";
  let mouthShape = "smile";
  let bodyYOffset = 0;
  let bodyTilt = 0;

  if (pose === "running") {
    bodyTilt = 20;
    bodyYOffset = Math.abs(runCycle) * -16;
    eyeExpression = "determined";
    mouthShape = "grin";
  } else if (pose === "celebrating") {
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 6) * -22;
    earRotationLeft = -35 + Math.sin(frame * 0.2) * 10;
    earRotationRight = 35 - Math.sin(frame * 0.2) * 10;
    eyeExpression = "happy";
    mouthShape = "open";
  } else if (pose === "panting") {
    bodyTilt = -16;
    bodyYOffset = breathCycle * 10 + 16;
    earRotationLeft = -65;
    earRotationRight = 65;
    eyeExpression = "exhausted";
    mouthShape = "tongue_out";
  } else if (pose === "panicked_swimming") {
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 10) * 10;
    eyeExpression = "panic";
    mouthShape = "gasp";
  } else if (pose === "furious_complaining") {
    bodyTilt = -6;
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 12) * 5;
    eyeExpression = "angry";
    mouthShape = "shout";
    earRotationLeft = -40;
    earRotationRight = 40;
  }

  return (
    <div
      style={{
        width: 240,
        height: 300,
        transform: `scale(${scale}) scaleX(${flip ? -1 : 1}) rotate(${bodyTilt}deg) translateY(${bodyYOffset}px)`,
        transformOrigin: "bottom center",
        position: "relative",
        filter: "drop-shadow(0 14px 20px rgba(0,0,0,0.4))",
      }}
    >
      <svg viewBox="0 0 200 260" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          {/* Volumetric Gradients */}
          <radialGradient id="hare-body-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>
          <linearGradient id="jersey-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="70%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="shoe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>

        {/* Speed lines when running */}
        {pose === "running" && (
          <g opacity={0.85}>
            <line x1="-30" y1="120" x2="-90" y2="120" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 18" />
            <line x1="-20" y1="150" x2="-110" y2="150" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" strokeDasharray="16 22" />
            <line x1="-35" y1="180" x2="-85" y2="180" stroke="#FB923C" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* Angry comic mark */}
        {pose === "furious_complaining" && (
          <g transform="translate(145, 15)">
            <path d="M0,0 L24,24 M24,0 L0,24 M12,-5 L12,29 M-5,12 L29,12" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* Sweat drops for panting */}
        {pose === "panting" && (
          <g transform={`translate(155, ${50 + breathCycle * 10})`}>
            <path d="M0,18 C-6,18 -10,12 0,0 C10,12 6,18 0,18 Z" fill="#38BDF8" opacity={0.9} />
            <path d="M22,28 C16,28 14,22 22,10 C30,22 28,28 22,28 Z" fill="#38BDF8" opacity={0.8} />
          </g>
        )}

        {/* Floaties for swimming */}
        {pose === "panicked_swimming" && (
          <g>
            <ellipse cx="38" cy="150" rx="24" ry="16" fill="#FACC15" stroke="#CA8A04" strokeWidth="4" />
            <ellipse cx="162" cy="150" rx="24" ry="16" fill="#FACC15" stroke="#CA8A04" strokeWidth="4" />
          </g>
        )}

        {/* Left Ear */}
        <g transform={`translate(70, 60) rotate(${earRotationLeft}) translate(-70, -60)`}>
          <path d="M60,60 C38,-15 65,-30 76,60 Z" fill="url(#hare-body-grad)" stroke="#9A3412" strokeWidth="3" />
          <path d="M63,50 C48,10 65,-5 73,50 Z" fill="#FDA4AF" />
        </g>
        {/* Right Ear */}
        <g transform={`translate(130, 60) rotate(${earRotationRight}) translate(-130, -60)`}>
          <path d="M124,60 C135,-30 162,-15 140,60 Z" fill="url(#hare-body-grad)" stroke="#9A3412" strokeWidth="3" />
          <path d="M127,50 C135,-5 152,10 137,50 Z" fill="#FDA4AF" />
        </g>

        {/* Fluffy Tail */}
        <circle cx="35" cy="180" r="20" fill="#FFF7ED" stroke="#EA580C" strokeWidth="3" />

        {/* Legs / Running Cycle */}
        {pose === "running" ? (
          <g>
            <path
              d={`M80,180 Q${50 + runCycle * 30},${220} ${35 - runCycle * 45},${240}`}
              stroke="url(#hare-body-grad)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <ellipse cx={35 - runCycle * 45} cy="245" rx="20" ry="12" fill="url(#shoe-grad)" stroke="#1E3A8A" strokeWidth="2.5" />

            <path
              d={`M120,180 Q${150 - runCycle * 30},${220} ${165 + runCycle * 45},${240}`}
              stroke="url(#hare-body-grad)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <ellipse cx={165 + runCycle * 45} cy="245" rx="22" ry="13" fill="url(#shoe-grad)" stroke="#1E3A8A" strokeWidth="2.5" />
          </g>
        ) : (
          <g>
            <path d="M75,180 L70,240" stroke="url(#hare-body-grad)" strokeWidth="16" strokeLinecap="round" />
            <ellipse cx="65" cy="245" rx="20" ry="12" fill="url(#shoe-grad)" stroke="#1E3A8A" strokeWidth="2.5" />
            <path d="M125,180 L130,240" stroke="url(#hare-body-grad)" strokeWidth="16" strokeLinecap="round" />
            <ellipse cx="135" cy="245" rx="20" ry="12" fill="url(#shoe-grad)" stroke="#1E3A8A" strokeWidth="2.5" />
          </g>
        )}

        {/* Torso & Athletic Jersey */}
        <ellipse cx="100" cy="155" rx="44" ry="50" fill="url(#hare-body-grad)" stroke="#9A3412" strokeWidth="3.5" />
        <path d="M66,135 Q100,118 134,135 L128,188 Q100,198 72,188 Z" fill="url(#jersey-grad)" stroke="#7F1D1D" strokeWidth="2.5" />
        <text x="100" y="172" fill="#FFFFFF" fontSize="28" fontWeight="900" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">
          1
        </text>

        {/* Arms */}
        {pose === "celebrating" ? (
          <g>
            <path d="M65,140 Q40,85 28,55" stroke="url(#hare-body-grad)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="26" cy="50" r="12" fill="#FED7AA" />
            <path d="M135,140 Q160,85 172,55" stroke="url(#hare-body-grad)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="174" cy="50" r="12" fill="#FED7AA" />
          </g>
        ) : pose === "furious_complaining" ? (
          <g>
            <path d="M65,140 Q45,150 45,170" stroke="url(#hare-body-grad)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="45" cy="175" r="11" fill="#FED7AA" />
            <path d="M135,140 Q170,120 188,115" stroke="url(#hare-body-grad)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="190" cy="113" r="11" fill="#FED7AA" />
            <line x1="190" y1="113" x2="212" y2="103" stroke="#FED7AA" strokeWidth="7" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d={`M70,140 Q${40 + runCycle * 25},${155 - runCycle * 15} ${50 + runCycle * 30},165`} stroke="url(#hare-body-grad)" strokeWidth="14" strokeLinecap="round" />
            <circle cx={50 + runCycle * 30} cy="165" r="10" fill="#FED7AA" />
            <path d={`M130,140 Q${160 - runCycle * 25},${155 + runCycle * 15} ${150 - runCycle * 30},165`} stroke="url(#hare-body-grad)" strokeWidth="14" strokeLinecap="round" />
            <circle cx={150 - runCycle * 30} cy="165" r="10" fill="#FED7AA" />
          </g>
        )}

        {/* Head */}
        <circle cx="100" cy="85" r="40" fill="url(#hare-body-grad)" stroke="#9A3412" strokeWidth="3.5" />
        <ellipse cx="100" cy="98" rx="28" ry="19" fill="#FED7AA" />

        {/* Red Headband with Volumetric Highlights */}
        <path d="M62,70 Q100,58 138,70" stroke="#DC2626" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M62,70 Q100,58 138,70" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Eyes */}
        {eyeExpression === "exhausted" ? (
          <g>
            <text x="85" y="90" fontSize="24" fontWeight="900" fill="#1E293B" textAnchor="middle">X</text>
            <text x="115" y="90" fontSize="24" fontWeight="900" fill="#1E293B" textAnchor="middle">X</text>
          </g>
        ) : eyeExpression === "happy" ? (
          <g>
            <path d="M76,85 Q88,72 98,85" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M102,85 Q112,72 124,85" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
        ) : eyeExpression === "angry" ? (
          <g>
            <path d="M74,75 L96,85" stroke="#7F1D1D" strokeWidth="5" strokeLinecap="round" />
            <circle cx="87" cy="89" r="6.5" fill="#1E293B" />
            <path d="M126,75 L104,85" stroke="#7F1D1D" strokeWidth="5" strokeLinecap="round" />
            <circle cx="113" cy="89" r="6.5" fill="#1E293B" />
          </g>
        ) : (
          <g>
            <ellipse cx="86" cy="85" rx="9" ry="12" fill="#FFFFFF" stroke="#9A3412" strokeWidth="2" />
            <circle cx="88" cy="86" r="5.5" fill="#1E293B" />
            <circle cx="86" cy="83" r="2.5" fill="#FFFFFF" />
            <ellipse cx="114" cy="85" rx="9" ry="12" fill="#FFFFFF" stroke="#9A3412" strokeWidth="2" />
            <circle cx="116" cy="86" r="5.5" fill="#1E293B" />
            <circle cx="114" cy="83" r="2.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Pink Nose */}
        <polygon points="94,95 106,95 100,103" fill="#F43F5E" />

        {/* Mouth */}
        {mouthShape === "tongue_out" ? (
          <g>
            <path d="M92,105 Q100,110 108,105" stroke="#1E293B" strokeWidth="3.5" fill="none" />
            <path d="M95,108 C95,122 105,122 105,108 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
          </g>
        ) : mouthShape === "open" || mouthShape === "shout" ? (
          <ellipse cx="100" cy="108" rx="11" ry="9" fill="#881337" stroke="#1E293B" strokeWidth="2.5" />
        ) : (
          <path d="M90,105 Q100,116 110,105" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. VOLUMETRIC CEL-SHADED TORTOISE CHARACTER RIG
// ---------------------------------------------------------------------------
export const TortoiseCharacter: React.FC<{
  pose: TortoisePose;
  scale?: number;
  flip?: boolean;
}> = ({ pose, scale = 1, flip = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const walkCycle = Math.sin((frame / fps) * Math.PI * 4);
  const headBob = Math.sin((frame / fps) * Math.PI * 4) * 5;

  if (pose === "shell_ball") {
    const rollAngle = (frame * 32) % 360;
    return (
      <div
        style={{
          width: 220,
          height: 220,
          transform: `scale(${scale})`,
          position: "relative",
          filter: "drop-shadow(0 16px 28px rgba(234, 88, 12, 0.7))",
        }}
      >
        <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <radialGradient id="shell-ball-grad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>
          </defs>
          {/* Fire / Smoke speed streaks */}
          <g>
            <path d="M-40,100 Q-90,65 -130,90 Q-80,110 -120,135 Q-70,118 -35,105" fill="#F97316" opacity={0.85} />
            <path d="M-20,100 Q-60,80 -90,95 Q-50,108 -80,120 Q-30,105 -15,100" fill="#FACC15" opacity={0.95} />
          </g>

          {/* Rotating Volumetric Shell */}
          <g transform={`translate(100, 100) rotate(${rollAngle}) translate(-100, -100)`}>
            <circle cx="100" cy="100" r="78" fill="url(#shell-ball-grad)" stroke="#064E3B" strokeWidth="6" />
            <circle cx="100" cy="100" r="64" fill="#10B981" />
            <polygon points="100,60 125,75 125,105 100,120 75,105 75,75" fill="#34D399" stroke="#064E3B" strokeWidth="3" />
            <polygon points="100,120 125,135 125,165 100,180 75,165 75,135" fill="#047857" stroke="#064E3B" strokeWidth="2.5" />
            <polygon points="145,85 170,100 170,130 145,145 120,130 120,100" fill="#047857" stroke="#064E3B" strokeWidth="2.5" />
            <polygon points="55,85 80,100 80,130 55,145 30,130 30,100" fill="#047857" stroke="#064E3B" strokeWidth="2.5" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 230,
        height: 230,
        transform: `scale(${scale}) scaleX(${flip ? -1 : 1}) translateY(${headBob}px)`,
        transformOrigin: "bottom center",
        position: "relative",
        filter: "drop-shadow(0 14px 20px rgba(0,0,0,0.4))",
      }}
    >
      <svg viewBox="0 0 220 220" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <radialGradient id="tortoise-shell-grad" cx="45%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="45%" stopColor="#10B981" />
            <stop offset="85%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>
          <radialGradient id="tortoise-skin-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#A3E635" />
            <stop offset="70%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#4D7C0F" />
          </radialGradient>
        </defs>

        {/* Backpack for hiking */}
        {pose === "hiking" && (
          <g transform="translate(45, 95)">
            <rect x="0" y="0" width="32" height="42" rx="8" fill="#B45309" stroke="#78350F" strokeWidth="3" />
            <rect x="4" y="8" width="24" height="14" rx="3" fill="#D97706" />
          </g>
        )}

        {/* Volumetric Shell Body */}
        <ellipse cx="105" cy="125" rx="68" ry="52" fill="url(#tortoise-shell-grad)" stroke="#064E3B" strokeWidth="5" />
        <ellipse cx="105" cy="120" rx="58" ry="42" fill="#10B981" />

        {/* Hex Shell Plates */}
        <polygon points="105,95 125,105 125,125 105,135 85,125 85,105" fill="#34D399" stroke="#064E3B" strokeWidth="2.5" />
        <polygon points="140,110 155,120 155,135 140,145 125,135 125,120" fill="#047857" stroke="#064E3B" strokeWidth="2" />
        <polygon points="70,110 85,120 85,135 70,145 55,135 55,120" fill="#047857" stroke="#064E3B" strokeWidth="2" />

        {/* Legs */}
        {pose === "swimming" ? (
          <g>
            <path d="M60,150 Q38,175 22,160" stroke="url(#tortoise-skin-grad)" strokeWidth="18" strokeLinecap="round" />
            <path d="M150,150 Q175,175 192,160" stroke="url(#tortoise-skin-grad)" strokeWidth="18" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d={`M135,150 L${145 + walkCycle * 15},185`} stroke="url(#tortoise-skin-grad)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx={145 + walkCycle * 15} cy="188" rx="15" ry="8" fill="#4D7C0F" />
            <path d={`M75,150 L${65 - walkCycle * 15},185`} stroke="url(#tortoise-skin-grad)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx={65 - walkCycle * 15} cy="188" rx="15" ry="8" fill="#4D7C0F" />
          </g>
        )}

        {/* Hiking Stick */}
        {pose === "hiking" && (
          <g>
            <line x1="175" y1="75" x2="175" y2="190" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
            <path d="M140,130 Q160,115 175,115" stroke="url(#tortoise-skin-grad)" strokeWidth="14" strokeLinecap="round" />
          </g>
        )}

        {/* Head and Goggles */}
        <g transform={`translate(${headBob * 0.5}, 0)`}>
          <path d="M150,130 Q170,120 175,100" stroke="url(#tortoise-skin-grad)" strokeWidth="22" strokeLinecap="round" />
          <circle cx="178" cy="95" r="26" fill="url(#tortoise-skin-grad)" stroke="#4D7C0F" strokeWidth="3" />

          {/* Yellow Headband */}
          <path d="M158,85 Q178,77 198,85" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Snorkel or Goggles */}
          {pose === "swimming" ? (
            <g>
              <path d="M175,95 Q205,95 205,50 Q205,38 195,38" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="184" cy="95" rx="15" ry="12" fill="#38BDF8" opacity={0.75} stroke="#0284C7" strokeWidth="2.5" />
            </g>
          ) : (
            <g>
              <ellipse cx="172" cy="80" rx="8" ry="7" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
              <ellipse cx="187" cy="80" rx="8" ry="7" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
              <line x1="179" y1="80" x2="180" y2="80" stroke="#0369A1" strokeWidth="2.5" />
            </g>
          )}

          {/* Eye */}
          <circle cx="183" cy="94" r="6.5" fill="#FFFFFF" />
          <circle cx="185" cy="94" r="4" fill="#1E293B" />
          <circle cx="184" cy="92.5" r="1.5" fill="#FFFFFF" />

          {/* Smile */}
          <path d="M175,105 Q184,113 192,105" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. BACKWARD-COMPATIBILITY CARTOON RACE SCENE WRAPPER
// ---------------------------------------------------------------------------
export const CartoonRaceScene: React.FC<CartoonRaceSceneProps> = (props) => {
  return <DynamicStoryScene {...props} />;
};

