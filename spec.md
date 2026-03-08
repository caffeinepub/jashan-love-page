# Jashan Love Page

## Current State
No existing app. Starting fresh.

## Requested Changes (Diff)

### Add
- Full-screen love-themed landing page with light pink background
- Floating dark pink heart animations across the screen
- Floating photo elements of Jashan with soft animations
- Butterfly animations (1-2) at corners that slowly flap wings
- A beautiful centered love message text box with the provided text (in Punjabi/English mix)
- "Please scroll me" hint text below the message
- Scroll section with 3 photos of Jashan in cute frames with stickers
- Slow golden sparkle/sprinkle particles overlay
- A red rope/string connecting all 3 photo frames
- A final question: "Can u be my love forever?"
- Two buttons: "Yes" and "No"
  - "No" button: does nothing (or shrinks/fades)
  - "Yes" button: moves away when hovered/touched
  - After first dodge: "Really?" text appears, moves when touched again
  - Then "Think again." text slowly appears
  - Then "Yes?" slowly appears behind it
  - On final "Yes" click: popup saying "Thanks a lot, myy jann 🫶🏻"
  - Popup has a 10-second countdown timer
  - After timer ends: screen goes black with message "Return to DM 😚"

### Modify
- None

### Remove
- None

## Implementation Plan
1. Create React single-page app with scroll sections
2. Implement floating hearts animation (CSS keyframes + absolute positioned elements)
3. Implement butterfly SVG/emoji animations at corners
4. Implement floating photo placeholders with frame styling and sticker overlays
5. Center love message card with custom font
6. Scroll-triggered section with 3 photo frames, red rope SVG connecting them, golden sparkles
7. Interactive "Yes/No" game logic with state machine
8. Countdown popup modal and black screen ending
9. Add golden sparkle particle overlay using canvas or CSS
