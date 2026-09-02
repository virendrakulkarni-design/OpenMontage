import React from "react";
import {
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolveAsset } from "../lib/resolveAsset";
import type { HarePose, TortoisePose } from "./CartoonRaceScene";

export type CustomCharacterPose = HarePose | TortoisePose | string;

export interface CustomCharacterRigProps {
  imageSrc: string;
  pose?: CustomCharacterPose;
  scale?: number;
  flip?: boolean;
  width?: number;
  height?: number;
}

export const CustomCharacterRig: React.FC<CustomCharacterRigProps> = ({
  imageSrc,
  pose = "running",
  scale = 1,
  flip = false,
  width = 240,
  height = 280,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cycling physics calculations
  const runCycle = Math.sin((frame / fps) * Math.PI * 8);
  const breathCycle = Math.sin((frame / fps) * Math.PI * 4);
  const swimShake = Math.sin((frame / fps) * Math.PI * 12) * 5;

  let bodyTilt = 0;
  let bodyYOffset = 0;
  let scaleX = 1;
  let scaleY = 1;
  let rotationDeg = 0;

  if (pose === "running") {
    bodyTilt = 18;
    bodyYOffset = Math.abs(runCycle) * -16;
    scaleX = 1 + Math.abs(runCycle) * 0.06;
    scaleY = 1 - Math.abs(runCycle) * 0.06;
  } else if (pose === "celebrating" || pose === "smirking_winner") {
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 6) * -22;
    scaleY = 1 + Math.sin((frame / fps) * Math.PI * 6) * 0.08;
  } else if (pose === "panting") {
    bodyTilt = -14;
    bodyYOffset = breathCycle * 10 + 15;
    scaleY = 1 + breathCycle * 0.08;
    scaleX = 1 - breathCycle * 0.04;
  } else if (pose === "panicked_swimming") {
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 8) * 12;
    bodyTilt = swimShake;
  } else if (pose === "shell_ball") {
    // 360-degree high-speed rotation
    rotationDeg = (frame * 28) % 360;
  } else if (pose === "furious_complaining") {
    bodyTilt = Math.sin((frame / fps) * Math.PI * 14) * 4;
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 14) * 6;
  } else if (pose === "hiking" || pose === "walking") {
    bodyYOffset = Math.sin((frame / fps) * Math.PI * 4) * -8;
    bodyTilt = 5;
  }

  const resolvedSrc = resolveAsset(imageSrc);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        transform: `scale(${scale}) scaleX(${flip ? -1 : 1})`,
        transformOrigin: "bottom center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Speed lines for running */}
      {pose === "running" && (
        <svg
          viewBox="0 0 300 200"
          style={{
            position: "absolute",
            left: -120,
            top: 20,
            width: 140,
            height: 180,
            overflow: "visible",
            zIndex: 1,
          }}
        >
          <line x1="120" y1="50" x2="0" y2="50" stroke="#F97316" strokeWidth="6" strokeLinecap="round" strokeDasharray="15 20" />
          <line x1="140" y1="90" x2="20" y2="90" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" strokeDasharray="20 25" />
          <line x1="110" y1="130" x2="-10" y2="130" stroke="#F97316" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 15" />
        </svg>
      )}

      {/* Comic Anger Vein 💢 for furious complaining */}
      {pose === "furious_complaining" && (
        <div
          style={{
            position: "absolute",
            top: -20,
            right: 0,
            zIndex: 10,
            fontSize: 42,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
          }}
        >
          💢
        </div>
      )}

      {/* Sweat drops for panting */}
      {pose === "panting" && (
        <svg
          viewBox="0 0 60 80"
          style={{
            position: "absolute",
            top: 0,
            right: -20,
            width: 50,
            height: 70,
            zIndex: 10,
          }}
        >
          <path d="M20,35 C12,35 8,25 20,5 C32,25 28,35 20,35 Z" fill="#38BDF8" opacity={0.85} />
          <path d="M40,55 C34,55 30,45 40,30 C50,45 46,55 40,55 Z" fill="#38BDF8" opacity={0.7} />
        </svg>
      )}

      {/* Safety Floaties for swimming panic */}
      {pose === "panicked_swimming" && (
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 12,
            display: "flex",
            gap: 120,
          }}
        >
          <div style={{ width: 44, height: 32, borderRadius: 16, background: "#FACC15", border: "3px solid #EAB308", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }} />
          <div style={{ width: 44, height: 32, borderRadius: 16, background: "#FACC15", border: "3px solid #EAB308", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }} />
        </div>
      )}

      {/* Main Uploaded Character Image with Animated Transform Matrix */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translateY(${bodyYOffset}px) rotate(${bodyTilt + rotationDeg}deg) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "bottom center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.4))",
          zIndex: 5,
        }}
      >
        <Img
          src={resolvedSrc}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};
