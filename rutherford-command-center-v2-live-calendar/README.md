# The Rutherfords — Family Command Center v2.0 Live Calendar Edition

## What this build adds

- Microsoft sign-in using the registered Azure/Entra application
- Outlook calendar discovery
- Calendar selection inside Dashboard Settings
- Automatic selection of `Your family` when it is found
- Live Month, Week, Today, and footer widgets
- Recurring events expanded through Microsoft Graph calendarView
- Automatic refresh every five minutes
- Refresh Now and Sign Out controls
- Existing family-name color rules retained
- Sample events remain visible only until Microsoft is connected

## Upload

Upload every file in this folder directly to the root of the GitHub repository, including:

- `msal-browser.min.js`
- all SVG files
- `index.html`
- `styles.css`
- `app.js`
- `README.md`

## First connection

1. Wait for GitHub Pages deployment.
2. Open the live dashboard and hard-refresh.
3. Open the gear.
4. Select **Connect Microsoft**.
5. Sign in with the Outlook account used by Artful Agenda.
6. Approve `User.Read` and `Calendars.Read` if Microsoft asks.
7. The app will discover calendars and select **Your family** automatically.
8. Check or uncheck other calendars as desired.

The app requests read-only calendar permission. It cannot create, edit, or delete Outlook events.
