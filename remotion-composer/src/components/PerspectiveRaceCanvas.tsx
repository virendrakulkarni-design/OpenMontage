import React from "react";
import {
  PerspectiveStageCanvas,
  type PerspectiveStageCanvasProps,
} from "./PerspectiveStageCanvas";

export type RaceScenario = "sprint" | "river" | "uphill" | "downhill";

export interface PerspectiveRaceCanvasProps {
  scenario: RaceScenario | string;
  speedMultiplier?: number;
  showFinishArch?: boolean;
}

/**
 * Backward-compatibility wrapper delegating to universal PerspectiveStageCanvas.
 */
export const PerspectiveRaceCanvas: React.FC<PerspectiveRaceCanvasProps> = ({
  scenario,
  speedMultiplier = 1,
  showFinishArch = false,
}) => {
  return (
    <PerspectiveStageCanvas
      scenario={scenario}
      speedMultiplier={speedMultiplier}
      landmark={showFinishArch ? { showArch: true } : undefined}
    />
  );
};
