# The Rutherfords — Family Command Center v2.2 Silk TV Layout

Why v2.1 looked unchanged:
Amazon Silk reported a smaller CSS viewport, so the large-screen media query never activated.

This build fixes that by detecting Silk/Fire TV in JavaScript and forcing a dedicated `.fire-tv` layout.

Changes:
- Month title remains fully visible
- Month footer is fully visible
- “This Week” is smaller
- Weekly footer is fully visible
- “Today” no longer overlaps events
- Today footer is fully visible
- Live Microsoft calendar connection remains unchanged

Use GitHub Desktop:
1. Extract this ZIP outside the repository folder.
2. Copy all files inside into the local `family-command-center` folder.
3. Replace existing files.
4. Commit: `Force Silk TV layout`
5. Push origin.
6. On Fire TV, open the site with `?v=9`.
