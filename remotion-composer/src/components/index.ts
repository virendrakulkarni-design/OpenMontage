// ---------------------------------------------------------------------------
// Universal Story & Animation Studio Components
// ---------------------------------------------------------------------------

export { DynamicStoryScene } from "./DynamicStoryScene";
export { PerspectiveStageCanvas } from "./PerspectiveStageCanvas";
export { DynamicCharacterRig } from "./DynamicCharacterRig";
export { CustomCharacterRig } from "./CustomCharacterRig";
export { SceneTransition } from "./SceneTransition";
export { CinematicOverlay } from "./CinematicOverlay";
export { CaptionOverlay } from "./CaptionOverlay";
export { ParticleOverlay } from "./ParticleOverlay";

// Legacy components (kept for backward compatibility with older projects)
export { CartoonRaceScene, HareCharacter, TortoiseCharacter } from "./CartoonRaceScene";
export { PerspectiveRaceCanvas } from "./PerspectiveRaceCanvas";

// Motion Graphics & Data Vis Components
export { TextCard } from "./TextCard";
export { StatCard } from "./StatCard";
export { ProgressBar } from "./ProgressBar";
export { CalloutBox } from "./CalloutBox";
export { ComparisonCard } from "./ComparisonCard";
export { BarChart, LineChart, PieChart, KPIGrid } from "./charts";
export { SectionTitle } from "./SectionTitle";
export { StatReveal } from "./StatReveal";
export { HeroTitle } from "./HeroTitle";
export { AnimeScene } from "./AnimeScene";
export { TerminalScene } from "./TerminalScene";
export { ScreenshotScene } from "./ScreenshotScene";
export { ProviderChip } from "./ProviderChip";

// Types
export type { DynamicStorySceneProps, StageActor } from "./DynamicStoryScene";
export type {
  PerspectiveStageCanvasProps,
  CameraKinematicMotion,
  TimeOfDayPreset,
  GroundOverlayType,
  ForegroundOccluderType,
  StageBadgeConfig,
  LandmarkArchConfig,
} from "./PerspectiveStageCanvas";
export type {
  DynamicCharacterRigProps,
  CharacterPose,
  CharacterArchetype,
  CharacterStyling,
} from "./DynamicCharacterRig";
export type { CustomCharacterRigProps, CustomCharacterPose } from "./CustomCharacterRig";
export type { TransitionType, SceneTransitionProps } from "./SceneTransition";
export type { CinematicOverlayProps } from "./CinematicOverlay";
export type { WordCaption } from "./CaptionOverlay";
export type { ParticleType } from "./ParticleOverlay";
export type { CameraMotion, AnimeSceneProps } from "./AnimeScene";
export type { TerminalStep } from "./TerminalScene";
export type { ScreenshotStep, Region, Point } from "./ScreenshotScene";
export type { CartoonRaceSceneProps, HarePose, TortoisePose, RaceScenario } from "./CartoonRaceScene";
export type { PerspectiveRaceCanvasProps } from "./PerspectiveRaceCanvas";
