# Rutherford Family Command Center — Starter Version

This is the first visual prototype. It rotates automatically through:

1. Monthly calendar
2. Weekly calendar
3. Today's schedule

The current events are samples. The next phase will connect the display to the Outlook family calendar.

## Files

- `index.html` — the webpage structure
- `styles.css` — colors, fonts, spacing, and layout
- `app.js` — sample events, calendar building, clock, and slide rotation

## Upload to GitHub

1. Create a new repository named `family-command-center`.
2. Choose **Public** for this prototype.
3. Open the new repository.
4. Select **Add file → Upload files**.
5. Upload `index.html`, `styles.css`, and `app.js`.
6. Commit the changes.

## Turn on GitHub Pages

1. Open the repository's **Settings**.
2. Select **Pages** in the left menu.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder.
5. Save.
6. GitHub will display the website address after deployment finishes.

## Important privacy note

Do not paste an Outlook ICS link, password, Microsoft token, API key, or other private credential into these files. This starter repository is public and contains only sample events.

## Change the colors

Open `styles.css` and find this section near the top:

```css
--sophia: #8aa35b;
--grayson: #527da8;
--bailey: #d75a91;
--cardin: #9a6ab0;
--general: #303030;
```

Replace the six-digit color codes later when you choose the final palette.

## Change the rotation speed

Open `app.js` and find:

```javascript
}, 20000);
```

`20000` means 20 seconds.
