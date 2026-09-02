import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DynamicCharacterRig,
  type CharacterArchetype,
  type CharacterPose,
  type CharacterStyling,
} from "./DynamicCharacterRig";
import {
  PerspectiveStageCanvas,
  type PerspectiveStageCanvasProps,
} from "./PerspectiveStageCanvas";
import { CinematicOverlay } from "./CinematicOverlay";
import { ParticleOverlay } from "./ParticleOverlay";

// ---------------------------------------------------------------------------
// Stage Actor Definition
// ---------------------------------------------------------------------------

export interface StageActor {
  id: string;
  name?: string;
  imageSrc?: string;
  archetype?: CharacterArchetype;
  pose?: CharacterPose | string;
  xPercent?: number; // 0 - 100
  bottomPercent?: number; // 0 - 100
  scale?: number;
  flip?: boolean;
  speech?: string;
  speechBorderColor?: string;
  styling?: CharacterStyling;
  castShadow?: boolean;
}

// ---------------------------------------------------------------------------
// Dynamic Story Scene Props
// ---------------------------------------------------------------------------

export interface DynamicStorySceneProps {
  /** Scene header title */
  sceneTitle: string;
  /** Scene header subtitle */
  sceneSubtitle?: string;
  /** Primary accent color */
  accentColor?: string;
  /** Comic action SFX burst */
  sfxText?: string;
  /** Narrator or moral takeaway card at bottom */
  narratorText?: string;
  /** List of actors on stage */
  actors?: StageActor[];
  /** Environment configuration for 2.5D perspective ground plate */
  environment?: PerspectiveStageCanvasProps;

  // -------------------------------------------------------------------------
  // Legacy / Quick 2-Actor Aliases (Backwards Compatibility)
  // -------------------------------------------------------------------------
  scenario?: string;
  harePose?: any;
  tortoisePose?: any;
  hareXPercent?: number;
  tortoiseXPercent?: number;
  hareSpeech?: string;
  tortoiseSpeech?: string;
  hareImage?: string;
  tortoiseImage?: string;
  showFinishLine?: boolean;
  winner?: "hare" | "tortoise" | "none" | string;
}

// ---------------------------------------------------------------------------
// Main Dynamic Story Scene Component
// ---------------------------------------------------------------------------

export const DynamicStoryScene: React.FC<DynamicStorySceneProps> = ({
  sceneTitle,
  sceneSubtitle,
  accentColor = "#22D3EE",
  sfxText,
  narratorText,
  actors,
  environment,
  // Legacy aliases
  scenario,
  harePose,
  tortoisePose,
  hareXPercent,
  tortoiseXPercent,
  hareSpeech,
  tortoiseSpeech,
  hareImage,
  tortoiseImage,
  showFinishLine,
  winner = "none",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const sfxSpring = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 140 } });
  const speechSpring = spring({ frame: frame - 6, fps, config: { damping: 12 } });

  // Resolve active actors list
  const activeActors: StageActor[] = actors && actors.length > 0 ? actors : [];

  // If no explicit actors provided, adapt legacy props
  if (activeActors.length === 0) {
    if (harePose !== undefined || hareSpeech !== undefined || hareImage !== undefined) {
      let hareBottom = 26;
      let hareScale = 1.35;
      if (scenario === "sprint") {
        hareBottom = harePose === "celebrating" ? 22 : 25;
        hareScale = 1.45;
      } else if (scenario === "uphill") {
        hareBottom = 22;
        hareScale = 1.35;
      } else if (scenario === "downhill") {
        hareBottom = 42;
        hareScale = 1.1;
      }

      activeActors.push({
        id: "actor-hare",
        name: "Hare",
        imageSrc: hareImage,
        archetype: "speedster",
        pose: harePose || "running",
        xPercent: hareXPercent ?? 75,
        bottomPercent: hareBottom,
        scale: hareScale,
        speech: hareSpeech,
        speechBorderColor: "#F97316",
        castShadow: scenario !== "river",
      });
    }

    if (tortoisePose !== undefined || tortoiseSpeech !== undefined || tortoiseImage !== undefined) {
      let tortBottom = 26;
      let tortScale = 1.25;
      if (scenario === "sprint") {
        tortBottom = 32;
        tortScale = 1.15;
      } else if (scenario === "uphill") {
        tortBottom = 48;
        tortScale = 1.05;
      } else if (scenario === "downhill") {
        tortBottom = 18;
        tortScale = 1.4;
      }

      activeActors.push({
        id: "actor-tortoise",
        name: "Tortoise",
        imageSrc: tortoiseImage,
        archetype: "steady",
        pose: tortoisePose || "walking",
        xPercent: tortoiseXPercent ?? 25,
        bottomPercent: tortBottom,
        scale: tortScale,
        speech: tortoiseSpeech,
        speechBorderColor: "#10B981",
        castShadow: scenario !== "river",
      });
    }
  }

  // Environment configuration resolution
  const envProps: PerspectiveStageCanvasProps = environment || {
    scenario,
    landmark: showFinishLine ? { showArch: true } : undefined,
    speedMultiplier: 1.2,
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      {/* 1. Universal 2.5D Perspective Ground Canvas */}
      <PerspectiveStageCanvas {...envProps} />

      {/* 2. Top Scene Header Card */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          right: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [-40, 0])}px)`,
          zIndex: 40,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            border: `2px solid ${accentColor}`,
            padding: "16px 36px",
            borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
            maxWidth: "92%",
          }}
        >
          <div style={{ fontSize: 38, fontWeight: 900, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
            {sceneTitle}
          </div>
          {sceneSubtitle && (
            <div style={{ fontSize: 24, fontWeight: 600, color: accentColor, marginTop: 6 }}>
              {sceneSubtitle}
            </div>
          )}
        </div>
      </div>

      {/* 3. Comic SFX Action Burst */}
      {sfxText && (
        <div
          style={{
            position: "absolute",
            top: "26%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${sfxSpring}) rotate(-8deg)`,
            opacity: sfxSpring,
            zIndex: 45,
            backgroundColor: "#FACC15",
            color: "#0F172A",
            padding: "14px 42px",
            borderRadius: 24,
            fontSize: 54,
            fontWeight: 900,
            border: "4px solid #000000",
            boxShadow: "0 14px 0 #000000",
            textTransform: "uppercase",
          }}
        >
          💥 {sfxText}
        </div>
      )}

      {/* 4. Actors Layer with 3D Depth Sorting */}
      {activeActors.map((actor) => {
        const bottom = actor.bottomPercent ?? 26;
        const xPos = actor.xPercent ?? 50;
        const actorScale = actor.scale ?? 1.25;
        const zIndex = Math.round(100 - bottom);

        // Fallback to specialized rigs if legacy and no custom image
        const isLegacyHare = actor.id === "actor-hare" && !actor.imageSrc;
        const isLegacyTort = actor.id === "actor-tortoise" && !actor.imageSrc;

        return (
          <div
            key={actor.id}
            style={{
              position: "absolute",
              bottom: `${bottom}%`,
              left: `${xPos}%`,
              transform: "translateX(-50%)",
              zIndex,
            }}
          >
            {/* Ground Cast Shadow */}
            {actor.castShadow !== false && (
              <div
                style={{
                  position: "absolute",
                  bottom: -15,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 160 * actorScale,
                  height: 36 * actorScale,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)",
                  filter: "blur(4px)",
                  zIndex: 1,
                }}
              />
            )}

            {/* Comic Speech Bubble */}
            {actor.speech && (
              <div
                style={{
                  position: "absolute",
                  bottom: "105%",
                  left: "50%",
                  transform: `translateX(-50%) scale(${speechSpring})`,
                  backgroundColor: "#FFFFFF",
                  color: "#0F172A",
                  padding: "14px 24px",
                  borderRadius: 16,
                  fontSize: 22,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                  border: `3px solid ${actor.speechBorderColor || "#22D3EE"}`,
                  zIndex: 35,
                }}
              >
                {actor.name ? `${actor.name}: ` : ""}
                "{actor.speech}"
              </div>
            )}

            {/* Character Visual Rig */}
            <DynamicCharacterRig
              imageSrc={actor.imageSrc}
              archetype={actor.archetype}
              pose={actor.pose}
              scale={actorScale}
              flip={actor.flip}
              styling={actor.styling}
            />
          </div>
        );
      })}

      {/* 5. Bottom Narrator Takeaway Card */}
      {narratorText && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 40,
            right: 40,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            padding: "20px 32px",
            borderRadius: 20,
            color: "#F8FAFC",
            fontSize: 26,
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.4,
            boxShadow: "0 12px 35px rgba(0,0,0,0.7)",
            zIndex: 40,
          }}
        >
          {narratorText}
        </div>
      )}

      {/* 6. Celebration Confetti for Winner or High-Energy Scenes */}
      {winner && winner !== "none" && (
        <ParticleOverlay type="confetti" count={35} intensity={0.8} />
      )}

      {/* 7. Cinematic Letterbox & Film Grain */}
      <CinematicOverlay
        letterbox={true}
        letterboxPercent={4.5}
        filmGrain={true}
        grainOpacity={0.03}
        lightLeak={true}
        lightLeakColor={accentColor}
        vignette={false}
      />
    </AbsoluteFill>
  );
};
