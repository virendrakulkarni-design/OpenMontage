---
name: quality-auditor
description: Automated quality review and verification loop skill. Audits visual appeal, perspective consistency, subtitle timing, file sizes, frame rates, and visual artifacts to guarantee broadcast standards.
license: MIT
---

# Quality Auditor Skill

The **Quality Auditor** runs rigorous pre-render and post-render verification loops to guarantee that no flawed or amateurish video reaches the user.

## Verification Checklist

### Pre-Render Verification
1. **TypeScript Integrity**: `npx tsc --noEmit` must return exit code 0.
2. **Asset Resolution**: All referenced backgrounds, character textures, and audio files exist in `public/` or bundle directories.
3. **Pacing Audit**: No cut exceeds 7.5 seconds without a camera angle or character state change.
4. **Contrast Audit**: Text color contrast vs background must meet minimum WCAG $4.5:1$ ratio (using darkened scrims or frosted cards).

### Post-Render Verification
1. **File Existence & Weight**: Output MP4 must exist and exceed minimum threshold ($>5\text{MB}$ for 20s vertical HD).
2. **Aspect Ratio Compliance**: Vertical 9:16 ($1080 \times 1920$) or Widescreen 16:9 ($1920 \times 1080$).
3. **Motion Check**: Visual frame progression must show dynamic parallax movement, continuous speed lines, and character breathing.
4. **Cinematic Grading**: Letterbox bars, film grain, and subtle vignettes are correctly composited.

## Automated Verification Script

Run the verification harness after every batch render:

```powershell
python scripts/verify_renders.py
```
