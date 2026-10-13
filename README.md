# Japanese Quest v2.1.0

Mobile-friendly Japanese beginner learning website. Static HTML, CSS and JavaScript; suitable for GitHub Pages.

## Files
Upload all files in this folder directly to the repository root:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `icon.svg`
- `README.md`

## V2 features
- Visible app version (`v2.1.0`)
- Individual sound lessons
- Hiragana table grouped by rows, with later rows locked until the current row is mastered
- 90% mastery threshold and one-time 20 XP reward per sound
- Canvas handwriting question drawn directly on the website
- Handwriting assessment is self-confirmed after revealing the reference. It is entirely local and does not use AI, an API, or upload drawings.
- Unique completed-lesson count, XP, streak, mastery and progress stored in localStorage
- Mobile-friendly layout and GitHub Pages compatibility

## Publish
Upload the six files to the root of your GitHub repository. In Settings → Pages, choose Deploy from a branch, then select `main` and `/(root)`.

## Important note about handwriting
The browser canvas captures finger or mouse strokes. It does not automatically recognise Japanese characters in this version. To avoid needing an AI service or unfairly rejecting handwriting, the learner reveals the target character and confirms whether their drawing matches it. The drawing never leaves the device.

## V2.2.0 update
- Progression is now by vowel columns: a → i → u → e → o. Complete all unlocked sounds in one column before the next column opens.
- Handwriting remains self-assessed: reveal the target, compare your drawing, and confirm honestly. No AI or network recognition is used.

## V2.2.0 additions
- Gojūon-style hiragana chart with vowel columns, row labels, empty cells and separate ん tile.
- Column progression remains locked: master every sound in A before I, then U, E and O.
- Export/import portable `JQ-SAVE-1:` save codes from the Progress page. No account or server is used. Import replaces the current device save after confirmation.
