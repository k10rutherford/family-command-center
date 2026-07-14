# The Rutherfords — Family Command Center v2.5 True Desktop Scale

Important fix:
The prior desktop-match build tried to scale an element named `#app`, but the HTML did not contain that element. As a result, the dashboard stayed oversized and cropped.

This build:
- Adds the missing `#app` wrapper
- Scales the entire 1920×1080 desktop dashboard as one unit
- Centers it within the Fire TV screen
- Leaves safe margins for Silk and TV overscan
- Keeps the same proportions as the computer display
- Preserves the live Microsoft calendar connection

Use on Fire TV:
https://k10rutherford.github.io/family-command-center/?v=12&tv=1
