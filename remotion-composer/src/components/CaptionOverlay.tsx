import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Word-level caption for TikTok-style highlight display
export interface WordCaption {
  word: string;
  startMs: number;
  endMs: number;
  // Force a page break after this word (e.g. sentence or scene boundaries).
  // Useful for CJK captions where pages should align with clause boundaries.
  pageBreakAfter?: boolean;
}

type CaptionOverlayProps = {
  words: WordCaption[];
  // How many words to show at once in a "page"
  wordsPerPage?: number;
  fontSize?: number;
  color?: string;
  highlightColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  // Separator rendered between words. Space-delimited languages want the
  // default " "; CJK languages (no inter-word spacing) should pass "".
  wordSeparator?: string;
  // Visual style preset
  style?: "default" | "cinematic" | "karaoke" | "minimal";
};

interface CaptionPage {
  words: WordCaption[];
  startMs: number;
  endMs: number;
}

function buildPages(words: WordCaption[], wordsPerPage: number): CaptionPage[] {
  const pages: CaptionPage[] = [];
  let pageWords: WordCaption[] = [];
  const flush = () => {
    if (pageWords.length === 0) return;
    pages.push({
      words: pageWords,
      startMs: pageWords[0].startMs,
      endMs: pageWords[pageWords.length - 1].endMs,
    });
    pageWords = [];
  };
  for (const w of words) {
    pageWords.push(w);
    if (pageWords.length >= wordsPerPage || w.pageBreakAfter) flush();
  }
  flush();
  return pages;
}

// ---------------------------------------------------------------------------
// Cinematic Page Renderer — scale-pop, neon glow, underline wipe
// ---------------------------------------------------------------------------

const CinematicPageRenderer: React.FC<{
  page: CaptionPage;
  fontSize: number;
  color: string;
  highlightColor: string;
  backgroundColor: string;
  fontFamily: string;
  wordSeparator: string;
}> = ({ page, fontSize, color, highlightColor, backgroundColor, fontFamily, wordSeparator }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentMs = page.startMs + (frame / fps) * 1000;

  // Spring entrance for the entire page container
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Frosted glass backdrop entrance
  const backdropScale = interpolate(entrance, [0, 1], [0.85, 1]);
  const backdropOpacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 70,
      }}
    >
      {/* Frosted glass backdrop with animated gradient border */}
      <div
        style={{
          opacity: backdropOpacity,
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px) scale(${backdropScale})`,
          background: backgroundColor,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 18,
          padding: "18px 34px",
          maxWidth: "88%",
          textAlign: "center",
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
          border: `1.5px solid rgba(255, 255, 255, 0.1)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient shimmer along top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${highlightColor}88 ${
              interpolate(frame % (fps * 3), [0, fps * 3], [0, 100])
            }%, transparent 100%)`,
            opacity: 0.8,
          }}
        />

        <span
          style={{
            fontSize,
            fontWeight: 800,
            fontFamily,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            letterSpacing: "-0.01em",
          }}
        >
          {page.words.map((w, i) => {
            const isActive = w.startMs <= currentMs && w.endMs > currentMs;
            const isPast = w.endMs <= currentMs;
            const isFuture = w.startMs > currentMs;

            // Per-word staggered entrance spring
            const wordEntrance = spring({
              frame: frame - Math.round(i * 2),
              fps,
              config: { damping: 16, stiffness: 130 },
            });

            // Active word scale-pop spring
            const activePop = isActive
              ? spring({
                  frame: Math.round((currentMs - w.startMs) / (1000 / fps)),
                  fps,
                  config: { damping: 10, stiffness: 200, mass: 0.6 },
                })
              : 0;

            const wordScale = isActive ? interpolate(activePop, [0, 1], [1.0, 1.12]) : 1;

            // Underline wipe progress for active word
            const underlineWidth = isActive
              ? interpolate(
                  currentMs,
                  [w.startMs, w.endMs],
                  [0, 100],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )
              : isPast
              ? 100
              : 0;

            // Color states
            const wordColor = isActive
              ? highlightColor
              : isPast
              ? color
              : `${color}66`;

            // Neon glow for active word
            const glowShadow = isActive
              ? `0 0 8px ${highlightColor}99, 0 0 20px ${highlightColor}44, 0 0 40px ${highlightColor}22, 0 2px 4px rgba(0,0,0,0.6)`
              : isPast
              ? "0 2px 4px rgba(0,0,0,0.4)"
              : "0 2px 4px rgba(0,0,0,0.3)";

            return (
              <span
                key={`${w.startMs}-${i}`}
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  color: wordColor,
                  textShadow: glowShadow,
                  transform: `scale(${wordScale}) translateY(${interpolate(wordEntrance, [0, 1], [12, 0])}px)`,
                  opacity: interpolate(wordEntrance, [0, 1], [0, 1]),
                  position: "relative",
                  WebkitTextStroke: isActive ? `0.5px ${highlightColor}` : "none",
                  marginBottom: 4,
                }}
              >
                {w.word}
                {i < page.words.length - 1 ? wordSeparator : ""}

                {/* Animated underline wipe */}
                {(isActive || isPast) && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: 0,
                      width: `${underlineWidth}%`,
                      height: 3,
                      background: isActive
                        ? `linear-gradient(90deg, ${highlightColor}, ${highlightColor}88)`
                        : `${color}33`,
                      borderRadius: 2,
                      boxShadow: isActive ? `0 0 8px ${highlightColor}66` : "none",
                    }}
                  />
                )}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Classic Page Renderer (preserved for backward compatibility)
// ---------------------------------------------------------------------------

const ClassicPageRenderer: React.FC<{
  page: CaptionPage;
  fontSize: number;
  color: string;
  highlightColor: string;
  backgroundColor: string;
  fontFamily: string;
  wordSeparator: string;
}> = ({ page, fontSize, color, highlightColor, backgroundColor, fontFamily, wordSeparator }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentMs = page.startMs + (frame / fps) * 1000;

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
          backgroundColor,
          borderRadius: 12,
          padding: "14px 28px",
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            fontFamily,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {page.words.map((w, i) => {
            const isActive = w.startMs <= currentMs && w.endMs > currentMs;
            const isPast = w.endMs <= currentMs;
            return (
              <span
                key={`${w.startMs}-${i}`}
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  color: isActive ? highlightColor : isPast ? color : `${color}99`,
                  textShadow: isActive
                    ? `0 0 20px ${highlightColor}66, 0 2px 4px rgba(0,0,0,0.5)`
                    : "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {w.word}{i < page.words.length - 1 ? wordSeparator : ""}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  words,
  wordsPerPage = 6,
  fontSize = 42,
  color = "#F8FAFC",
  highlightColor = "#22D3EE",
  backgroundColor = "rgba(15, 23, 42, 0.75)",
  fontFamily = "Space Grotesk, Inter, system-ui, sans-serif",
  wordSeparator = " ",
  style = "cinematic",
}) => {
  const { fps } = useVideoConfig();
  const pages = buildPages(words, wordsPerPage);

  const PageComponent = style === "cinematic" || style === "karaoke"
    ? CinematicPageRenderer
    : ClassicPageRenderer;

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const fromFrame = Math.round((page.startMs / 1000) * fps);
        const nextStart = pages[i + 1]?.startMs ?? page.endMs + 500;
        const duration = Math.max(
          1,
          Math.round(((nextStart - page.startMs) / 1000) * fps)
        );

        return (
          <Sequence key={i} from={fromFrame} durationInFrames={duration}>
            <PageComponent
              page={page}
              fontSize={fontSize}
              color={color}
              highlightColor={highlightColor}
              backgroundColor={backgroundColor}
              fontFamily={fontFamily}
              wordSeparator={wordSeparator}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
