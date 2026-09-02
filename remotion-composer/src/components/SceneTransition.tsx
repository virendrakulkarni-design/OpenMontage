import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// Scene Transition Types
// ---------------------------------------------------------------------------

export type TransitionType =
  | "none"
  | "crossfade"
  | "zoom-wipe"
  | "slide-left"
  | "slide-right"
  | "iris-wipe"
  | "flash";

export interface SceneTransitionProps {
  /** Transition type for the entrance of this scene */
  transitionIn?: TransitionType;
  /** Transition type for the exit of this scene */
  transitionOut?: TransitionType;
  /** Duration of the transition in frames (default: 12) */
  transitionDuration?: number;
  /** The scene content to wrap */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Deterministic easing functions
// ---------------------------------------------------------------------------

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ---------------------------------------------------------------------------
// Scene Transition Component
// ---------------------------------------------------------------------------

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  transitionIn = "crossfade",
  transitionOut = "crossfade",
  transitionDuration = 12,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate transition progress (0 to 1)
  const inProgress = interpolate(frame, [0, transitionDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outStart = Math.max(0, durationInFrames - transitionDuration);
  const outProgress = interpolate(frame, [outStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Apply entrance transition
  const inStyle = getTransitionInStyle(transitionIn, inProgress);
  // Apply exit transition
  const outStyle = getTransitionOutStyle(transitionOut, outProgress);

  // Merge styles: entrance during first N frames, exit during last N frames
  const isInTransition = frame < transitionDuration;
  const isOutTransition = frame >= outStart;

  let compositeStyle: React.CSSProperties = {};

  if (isInTransition && transitionIn !== "none") {
    compositeStyle = inStyle;
  } else if (isOutTransition && transitionOut !== "none") {
    compositeStyle = outStyle;
  }

  // Flash overlay for "flash" transition
  const showFlashIn = transitionIn === "flash" && isInTransition;
  const showFlashOut = transitionOut === "flash" && isOutTransition;
  const flashOpacity = showFlashIn
    ? interpolate(inProgress, [0, 0.3, 1], [1, 0.8, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : showFlashOut
    ? interpolate(outProgress, [0, 0.7, 1], [0, 0.2, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Iris wipe clip-path
  const irisIn = transitionIn === "iris-wipe" && isInTransition;
  const irisOut = transitionOut === "iris-wipe" && isOutTransition;
  let clipPath: string | undefined;

  if (irisIn) {
    const radius = easeOutCubic(inProgress) * 150;
    clipPath = `circle(${radius}% at 50% 50%)`;
  } else if (irisOut) {
    const radius = (1 - easeOutCubic(outProgress)) * 150;
    clipPath = `circle(${radius}% at 50% 50%)`;
  }

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...compositeStyle,
          ...(clipPath ? { clipPath, WebkitClipPath: clipPath } : {}),
        }}
      >
        {children}
      </div>

      {/* Flash overlay */}
      {(showFlashIn || showFlashOut) && flashOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: flashOpacity,
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Transition Style Generators
// ---------------------------------------------------------------------------

function getTransitionInStyle(
  type: TransitionType,
  progress: number
): React.CSSProperties {
  const eased = easeOutCubic(progress);

  switch (type) {
    case "crossfade":
      return { opacity: eased };

    case "zoom-wipe":
      return {
        opacity: eased,
        transform: `scale(${interpolate(eased, [0, 1], [0.92, 1])})`,
        transformOrigin: "center center",
      };

    case "slide-left":
      return {
        transform: `translateX(${interpolate(eased, [0, 1], [100, 0])}%)`,
      };

    case "slide-right":
      return {
        transform: `translateX(${interpolate(eased, [0, 1], [-100, 0])}%)`,
      };

    case "iris-wipe":
    case "flash":
      return { opacity: eased };

    case "none":
    default:
      return {};
  }
}

function getTransitionOutStyle(
  type: TransitionType,
  progress: number
): React.CSSProperties {
  const eased = easeOutCubic(progress);

  switch (type) {
    case "crossfade":
      return { opacity: 1 - eased };

    case "zoom-wipe":
      return {
        opacity: 1 - eased,
        transform: `scale(${interpolate(eased, [0, 1], [1, 1.08])})`,
        transformOrigin: "center center",
      };

    case "slide-left":
      return {
        transform: `translateX(${interpolate(eased, [0, 1], [0, -100])}%)`,
      };

    case "slide-right":
      return {
        transform: `translateX(${interpolate(eased, [0, 1], [0, 100])}%)`,
      };

    case "iris-wipe":
    case "flash":
      return { opacity: 1 - eased };

    case "none":
    default:
      return {};
  }
}
