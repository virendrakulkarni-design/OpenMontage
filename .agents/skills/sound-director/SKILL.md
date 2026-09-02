---
name: sound-director
description: Master audio direction, TTS voice synthesis, voice cloning, phoneme subtitle synchronization, foley SFX placement, and background score ducking skill.
license: MIT
---

# Sound Director Skill

The **Sound Director** orchestrates speech, voice cloning, music, and sound effects to create an emotionally resonant, polished soundscape.

## Audio Stacking Order

A professional video audio mix is composed of 4 layered tracks:

```
[Track 1: Dialogue & Narration (Top Priority - Normalised to -14 LUFS)]
[Track 2: Foley & Comic SFX (Punctuation - Peaks at -10 dB)]
[Track 3: Musical Score (Atmosphere - Base Volume -20 dB)]
[Track 4: Ambient Room Tone / Environmental Audio (Subtle - Base Volume -28 dB)]
```

## Voice Casting & TTS Pipeline Matrix

| Provider | Best Suited For | Word-Level Timing | Voice Cloning |
|---|---|---|---|
| **Chatterbox TTS** | Free local execution, zero API costs | WhisperX integration | 10-60s reference audio |
| **ElevenLabs** | Studio-grade emotional inflection, distinct character voices | Timestamped alignment API | Instant voice clone |
| **Edge TTS** | Fast, reliable baseline narration (free) | SubRip / VTT timestamps | Pre-trained library |

## Subtitle Synchronization Protocol (MoneyPrinterTurbo Standard)

1. **Word-by-Word Timing**: Every word entry must contain `startMs` and `endMs`.
2. **Page Grouping**: Group 4–6 words per caption page for mobile readability.
3. **Pacing Rules**: Spoken English averages $130 - 160$ words per minute ($2.1 - 2.6$ words/sec). Punctuation triggers natural pauses ($250 - 450\text{ms}$).
4. **Active Word Glow**: While spoken, word scales by $1.12\times$ and emits neon glow with animated underline wipe.

## Music Ducking Protocol

When narration or dialogue begins:
- Music automatically ducks from base volume ($0.15$) to ($0.04$) over $300\text{ms}$.
- When dialogue ends, music swells back to ($0.15$) over $600\text{ms}$.
