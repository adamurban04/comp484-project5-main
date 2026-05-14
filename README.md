# CSUN Map Quiz (Google Maps JavaScript Project)

GitHub Pages: https://adamurban04.github.io/comp484-project5-main/ (API Key restricted to this website)

This project is a CSUN location-guessing web app built with HTML, CSS, and JavaScript using the Google Maps JavaScript API.

Players are prompted with a building name and must **double-click** where they think it is. After each guess, the app highlights the correct target area in **green** (correct guess) or **red** (incorrect guess), tracks score/accuracy, and reports the final score after 5 rounds.

---

## Core assignment requirements implemented

1. Prompt user to double-click a specified CSUN location.
2. Evaluate each double-click guess on the map.
3. Show correct guesses in green and incorrect guesses in red.
4. Run 5 total locations (4 selected + professor location).
5. Show total correct at the end.
6. Keep map panning and zooming disabled.

---

## Extra features added

1. Terminal UI theme with compact one-page layout.
2. 3-2-1 intro HUD animation before each round starts.
3. Timer and live accuracy percentage display.
4. Background music toggle and correct/wrong SFX.
5. In-map labels showing the guessed location target after each click.
6. Custom themed cursor.

---

## Special API features chosen for presentation

## 1) Geometry Library
**Reference:** https://developers.google.com/maps/documentation/javascript/geometry

This project uses `google.maps.geometry.poly.containsLocation()` to check if a user’s clicked point is inside the active building polygon.  

## 2) Ground Overlays
**Reference:** https://developers.google.com/maps/documentation/javascript/groundoverlays

This project uses per-building `GroundOverlay` images (toggleable) mapped to each location’s bounds.  

## Controls

- **Double-click map:** submit guess
- **Restart Game button:** reset and start new game
- **Sound button:** mute/unmute music + SFX
- **Overlay button:** show/hide building overlays
- **Console (`startPolygonWizard()`):** trace exact building polygons (right-click to save each, `undoPolygonPoint()` to remove last click)
