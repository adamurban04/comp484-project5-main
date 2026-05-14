// Grab UI nodes once so game logic can stay cleaner.
const ui = {
  instructions: document.getElementById("instructions"),
  currentLocation: document.getElementById("current-location"),
  round: document.getElementById("round"),
  score: document.getElementById("score"),
  feedbackMessage: document.getElementById("feedback-message"),
  restartButton: document.getElementById("restart-button"),
  soundToggle: document.getElementById("sound-toggle"),
  overlayToggle: document.getElementById("overlay-toggle"),
  timer: document.getElementById("timer"),
  accuracy: document.getElementById("accuracy"),
  hudOverlay: document.getElementById("hud-overlay"),
};

// Core map and game constants.
const CSUN_CENTER = { lat: 34.2401, lng: -118.529 };
const MAP_ZOOM = 16;
const ROUND_LOCK_MS = 900;
const COUNTDOWN_VALUES = [3, 2, 1];
const GOOGLE_MAPS_API_KEY = window.APP_CONFIG?.googleMapsApiKey || "";
const DEFAULT_INSTRUCTIONS_HTML =
  'Double-click the <span class="instruction-yellow">yellow</span> area where you think the shown location is. Correct area turns <span class="instruction-green">green</span>, wrong answer turns <span class="instruction-red">red</span>.';

// Per-building overlay settings.
const BUILDING_OVERLAY_OPACITY = 0.74;
const BUILDING_OVERLAY_DEFAULT_VISIBLE = false;

// Keep map dark and minimal to match page style.
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#111a22" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#15212b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304555" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#3c596e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4f6d84" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a121a" }] },
  { featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
];

const FEEDBACK_CLASSES = ["feedback-info", "feedback-success", "feedback-error"];

const AUDIO_SOURCES = {
  bgm: "assets/music/background-music.mp3",
  correct: "assets/sfx/correct.mp3",
  wrong: "assets/sfx/wrong.mp3",
};

// Locations use traced polygon paths and keep overlay bounds (have to be rectangular).
const LOCATION_BOUNDS = [
  {
    name: "Jacaranda Hall",
    overlayImage: "assets/buildings/JD.png",
    bounds: {
      north: 34.241840507590226,
      south: 34.24106001386821,
      east: -118.52768869839703,
      west: -118.52972717724835,
    },
    path: [
      { lat: 34.241076, lng: -118.52974 },
      { lat: 34.241059, lng: -118.529311 },
      { lat: 34.24113, lng: -118.529311 },
      { lat: 34.24113, lng: -118.528818 },
      { lat: 34.241076, lng: -118.528796 },
      { lat: 34.241076, lng: -118.527745 },
      { lat: 34.241821, lng: -118.527745 },
      { lat: 34.241839, lng: -118.529376 },
      { lat: 34.241751, lng: -118.529569 },
      { lat: 34.241573, lng: -118.529719 },
      { lat: 34.24152, lng: -118.52974 },
    ],
  },
  {
    name: "University Library",
    overlayImage: "assets/buildings/UL.png",
    bounds: {
      north: 34.240385945284515,
      south: 34.239623176956485,
      east: -118.52865429364239,
      west: -118.53007050000225,
    },
    path: [
      { lat: 34.239657, lng: -118.52974 },
      { lat: 34.239675, lng: -118.528989 },
      { lat: 34.239817, lng: -118.528989 },
      { lat: 34.239817, lng: -118.52871 },
      { lat: 34.240314, lng: -118.52871 },
      { lat: 34.240331, lng: -118.529998 },
      { lat: 34.239835, lng: -118.530019 },
      { lat: 34.239817, lng: -118.529762 },
    ],
  },
  {
    name: "Student Recreation Center",
    overlayImage: "assets/buildings/SRC.png",
    bounds: {
      north: 34.24086488930697,
      south: 34.23942804906472,
      east: -118.52472753964459,
      west: -118.52528543911968,
    },
    path: [
      { lat: 34.23948, lng: -118.52517 },
      { lat: 34.23948, lng: -118.524848 },
      { lat: 34.239586, lng: -118.524848 },
      { lat: 34.239586, lng: -118.524784 },
      { lat: 34.240686, lng: -118.524784 },
      { lat: 34.240686, lng: -118.524848 },
      { lat: 34.240828, lng: -118.524848 },
      { lat: 34.240828, lng: -118.525148 },
      { lat: 34.240757, lng: -118.52517 },
      { lat: 34.240722, lng: -118.525256 },
      { lat: 34.239604, lng: -118.525256 },
      { lat: 34.239586, lng: -118.525191 },
    ],
  },
  {
    name: "Campus Store Complex",
    overlayImage: "assets/buildings/CSC.png",
    bounds: {
      north: 34.23776057408883,
      south: 34.237033260829385,
      east: -118.52747412167584,
      west: -118.52858992062603,
    },
    path: [
      { lat: 34.237067, lng: -118.528496 },
      { lat: 34.23705, lng: -118.52753 },
      { lat: 34.237121, lng: -118.527509 },
      { lat: 34.237138, lng: -118.527595 },
      { lat: 34.237263, lng: -118.527595 },
      { lat: 34.23728, lng: -118.527573 },
      { lat: 34.237529, lng: -118.527573 },
      { lat: 34.237529, lng: -118.527616 },
      { lat: 34.237688, lng: -118.527637 },
      { lat: 34.237706, lng: -118.52826 },
      { lat: 34.237724, lng: -118.528281 },
      { lat: 34.237724, lng: -118.528496 },
      { lat: 34.237617, lng: -118.528474 },
      { lat: 34.237511, lng: -118.528367 },
      { lat: 34.237493, lng: -118.528496 },
      { lat: 34.237404, lng: -118.52841 },
      { lat: 34.237387, lng: -118.528453 },
      { lat: 34.237369, lng: -118.528582 },
      { lat: 34.237245, lng: -118.528603 },
      { lat: 34.237263, lng: -118.528496 },
    ],
  },
  {
    name: "Grand Salon (Professor Location)",
    overlayImage: "assets/buildings/GS.png",
    bounds: {
      north: 34.239445787982675,
      south: 34.23921518175789,
      east: -118.52665873013531,
      west: -118.52685184918438,
    },
  },
];

function rectangleToPath(bounds) {
  return [
    { lat: bounds.north, lng: bounds.west },
    { lat: bounds.north, lng: bounds.east },
    { lat: bounds.south, lng: bounds.east },
    { lat: bounds.south, lng: bounds.west },
  ];
}

function cloneBounds(bounds) {
  return {
    north: bounds.north,
    south: bounds.south,
    east: bounds.east,
    west: bounds.west,
  };
}

function buildSeedPath(location) {
  if (Array.isArray(location.path) && location.path.length >= 3) {
    return location.path.map((point) => ({ lat: point.lat, lng: point.lng }));
  }
  return rectangleToPath(location.bounds);
}

// Build the live location objects used by gameplay.
function seedLocations() {
  return LOCATION_BOUNDS.map((location) => {
    const seededPath = buildSeedPath(location);
    return {
      name: location.name,
      path: seededPath,
      overlayImage: location.overlayImage,
      // Overlay image bounds stay fixed so tracing polygons never shifts images.
      overlayBounds: cloneBounds(location.bounds || pathBounds(seededPath)),
      checkPolygon: null,
    };
  });
}

const gameState = {
  score: 0,
  currentRound: 0,
  totalRounds: LOCATION_BOUNDS.length,
  locations: seedLocations(),
  elapsedSeconds: 0,
  isLocked: true,
  isComplete: false,
  isCalibrationMode: false,
  isMuted: false,
  hasStartedMusic: false,
  isOverlayVisible: BUILDING_OVERLAY_DEFAULT_VISIBLE,
};

let map;
let buildingOverlays = [];
let resultOverlay = null;
let previewOverlays = [];
let roundLabelMarkers = [];
let calibrationSession = null;
let gameTimerId = null;
let countdownIntervalId = null;
let HtmlMapOverlayClass = null;

const audio = {
  bgm: new Audio(AUDIO_SOURCES.bgm),
  correct: new Audio(AUDIO_SOURCES.correct),
  wrong: new Audio(AUDIO_SOURCES.wrong),
};

audio.bgm.loop = true;
audio.bgm.volume = 0.35;
audio.correct.volume = 0.65;
audio.wrong.volume = 0.65;
audio.bgm.preload = "auto";
audio.correct.preload = "auto";
audio.wrong.preload = "auto";

// Centralized message + color state for the feedback line.
function setFeedback(message, type = "info") {
  ui.feedbackMessage.textContent = message;
  ui.feedbackMessage.classList.remove(...FEEDBACK_CLASSES);
  ui.feedbackMessage.classList.add(`feedback-${type}`);
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Keep the UI accuracy value synced with current score.
function updateAccuracy() {
  const accuracy = Math.round((gameState.score / gameState.totalRounds) * 100);
  ui.accuracy.textContent = `${accuracy}%`;
}

// Keep timer text formatting in one place.
function updateTimerDisplay() {
  ui.timer.textContent = formatSeconds(gameState.elapsedSeconds);
}

// Stop active timer loop if one is running.
function stopGameTimer() {
  if (!gameTimerId) {
    return;
  }
  clearInterval(gameTimerId);
  gameTimerId = null;
}

// Start the in-game timer once rounds begin.
function startGameTimer() {
  stopGameTimer();
  gameTimerId = setInterval(() => {
    gameState.elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

// Reset timer state at game start/restart.
function resetGameTimer() {
  gameState.elapsedSeconds = 0;
  updateTimerDisplay();
}

// Draw countdown/game-over HUD.
function showHud(primaryText, mode = "hud-countdown", subline = "") {
  ui.hudOverlay.className = `hud-overlay ${mode}`;
  ui.hudOverlay.innerHTML = subline
    ? `${primaryText}<span class="hud-subline">${subline}</span>`
    : primaryText;

  ui.hudOverlay.classList.remove("flash");
  void ui.hudOverlay.offsetWidth;
  ui.hudOverlay.classList.add("flash");
}

// Remove HUD text layer from map.
function hideHud() {
  ui.hudOverlay.className = "hud-overlay hidden";
  ui.hudOverlay.textContent = "";
}

// Prevent stacked countdown intervals.
function clearCountdown() {
  if (!countdownIntervalId) {
    return;
  }
  clearInterval(countdownIntervalId);
  countdownIntervalId = null;
}

// Short intro sequence shown before gameplay accepts clicks.
function runIntroCountdown(onDone) {
  clearCountdown();
  let index = 0;

  showHud(String(COUNTDOWN_VALUES[index]), "hud-countdown");

  countdownIntervalId = setInterval(() => {
    index += 1;

    if (index < COUNTDOWN_VALUES.length) {
      showHud(String(COUNTDOWN_VALUES[index]), "hud-countdown");
      return;
    }

    clearCountdown();
    showHud("GO", "hud-countdown");

    setTimeout(() => {
      hideHud();
      onDone();
    }, 420);
  }, 650);
}

// Keep mute button icon and accessibility text in sync.
function updateSoundToggleUi() {
  ui.soundToggle.classList.toggle("muted", gameState.isMuted);
  ui.soundToggle.setAttribute("aria-label", gameState.isMuted ? "Unmute music and sound effects" : "Mute music and sound effects");
  ui.soundToggle.setAttribute("title", gameState.isMuted ? "Unmute sound" : "Mute sound");
}

// Apply current mute state to all audio clips.
function applyMuteState() {
  audio.bgm.muted = gameState.isMuted;
  audio.correct.muted = gameState.isMuted;
  audio.wrong.muted = gameState.isMuted;
  updateSoundToggleUi();
}

// Try to start background music once browser interaction rules allow it.
function tryStartBackgroundMusic() {
  if (gameState.hasStartedMusic || gameState.isMuted) {
    return;
  }

  audio.bgm
    .play()
    .then(() => {
      gameState.hasStartedMusic = true;
    })
    .catch(() => {
      // Browser autoplay restrictions can block this until user interaction.
    });
}

// Toggle all project sounds (music + sfx) together.
function toggleSound() {
  gameState.isMuted = !gameState.isMuted;
  applyMuteState();

  if (!gameState.isMuted) {
    tryStartBackgroundMusic();
  }
}

// Play result sound per guess outcome.
function playOutcomeSound(wasCorrect) {
  const clip = wasCorrect ? audio.correct : audio.wrong;
  clip.currentTime = 0;
  clip.play().catch(() => {
    // Ignore blocked/failed audio play attempts.
  });
}

// Keep overlay toggle visual state and tooltip text in sync.
function updateOverlayToggleUi() {
  ui.overlayToggle.classList.toggle("is-active", gameState.isOverlayVisible);
  ui.overlayToggle.setAttribute("aria-label", gameState.isOverlayVisible ? "Hide building overlays" : "Show building overlays");
  ui.overlayToggle.setAttribute("title", gameState.isOverlayVisible ? "Hide building overlays" : "Show building overlays");
}

// Convert any polygon path into top/bottom/left/right bounds.
function pathBounds(path) {
  const lats = path.map((point) => point.lat);
  const lngs = path.map((point) => point.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

// Create building ground overlays once after map initializes.
function ensureBuildingOverlays() {
  if (!map || buildingOverlays.length > 0) {
    return;
  }

  buildingOverlays = gameState.locations.map((location) => {
    const overlayBounds = location.overlayBounds || pathBounds(location.path);
    return new google.maps.GroundOverlay(location.overlayImage, overlayBounds, {
      opacity: BUILDING_OVERLAY_OPACITY,
      // Keep map click/double-click events going through the image layer.
      clickable: false,
    });
  });
}

// Show or hide all building overlays together.
function setBuildingOverlaysVisible(visible) {
  gameState.isOverlayVisible = visible;
  updateOverlayToggleUi();

  if (!map) {
    return;
  }

  ensureBuildingOverlays();
  buildingOverlays.forEach((overlay) => overlay.setMap(visible ? map : null));
}

// User button handler for building overlay visibility.
function toggleBuildingOverlays() {
  setBuildingOverlaysVisible(!gameState.isOverlayVisible);
}

// Small custom HTML map label class for location name markers.
function getHtmlMapOverlayClass() {
  if (HtmlMapOverlayClass) {
    return HtmlMapOverlayClass;
  }

  HtmlMapOverlayClass = class extends google.maps.OverlayView {
    constructor(position, className, text = "", title = "") {
      super();
      this.position = new google.maps.LatLng(position.lat, position.lng);
      this.className = className;
      this.text = text;
      this.title = title;
      this.element = null;
    }

    onAdd() {
      const div = document.createElement("div");
      div.className = this.className;

      if (this.text) {
        div.textContent = this.text;
      }
      if (this.title) {
        div.title = this.title;
      }

      this.element = div;
      // floatPane keeps labels above map overlays and frame edges.
      this.getPanes().floatPane.appendChild(div);
    }

    draw() {
      if (!this.element) {
        return;
      }

      const projection = this.getProjection();
      if (!projection) {
        return;
      }

      const point = projection.fromLatLngToDivPixel(this.position);
      if (!point) {
        return;
      }

      this.element.style.left = `${point.x}px`;
      this.element.style.top = `${point.y}px`;
    }

    onRemove() {
      if (this.element?.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
    }
  };

  return HtmlMapOverlayClass;
}

// Compute center point used for label placement.
function getPathCenter(path) {
  const bounds = pathBounds(path);
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
}

// Initialize geometry polygons used by containsLocation checks.
function initializeLocationGeometry() {
  gameState.locations.forEach((location) => {
    location.checkPolygon = new google.maps.Polygon({
      paths: location.path,
    });
  });
}

// Helper kept for future polygon edits.
function updateLocationGeometry(location) {
  if (!location.checkPolygon) {
    location.checkPolygon = new google.maps.Polygon({ paths: location.path });
    return;
  }
  location.checkPolygon.setPaths(location.path);
}

// Ensure only one current green/red result fill stays on map.
function clearResultOverlay() {
  if (!resultOverlay) {
    return;
  }
  resultOverlay.setMap(null);
  resultOverlay = null;
}

// Draw result fill (green or red) for the active location.
function showResultOverlay(path, isCorrect) {
  resultOverlay = new google.maps.Polygon({
    paths: path,
    strokeColor: isCorrect ? "#6f9e80" : "#a26b70",
    strokeOpacity: 1,
    strokeWeight: 3,
    fillColor: isCorrect ? "#6f9e80" : "#a26b70",
    fillOpacity: 0.45,
    zIndex: 3,
    clickable: false,
    map,
  });
}

// Remove all baseline yellow-outline polygons from previous draw pass.
function clearPreviewOverlays() {
  previewOverlays.forEach((overlay) => overlay.setMap(null));
  previewOverlays = [];
}

// Draw baseline yellow outlines for all answerable locations.
function drawPreviewOverlays() {
  clearPreviewOverlays();

  previewOverlays = gameState.locations.map((location) => {
    return new google.maps.Polygon({
      paths: location.path,
      strokeColor: "#c9a56b",
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: "#c9a56b",
      fillOpacity: 0,
      zIndex: 1,
      clickable: false,
      map,
    });
  });
}

// Remove text labels added from previous guesses.
function clearRoundLabels() {
  roundLabelMarkers.forEach((marker) => marker.setMap(null));
  roundLabelMarkers = [];
}

// Show building name label on the correct target area after each guess.
function showRoundLocationLabel(location, wasCorrect) {
  const HtmlMapOverlay = getHtmlMapOverlayClass();
  const marker = new HtmlMapOverlay(
    getPathCenter(location.path),
    `map-location-label ${wasCorrect ? "map-location-label-correct" : "map-location-label-wrong"}`,
    location.name
  );

  marker.setMap(map);
  roundLabelMarkers.push(marker);
}

// Pulse effect around click point.
function playClickPulse(latLng, wasCorrect) {
  const pulse = new google.maps.Circle({
    map,
    center: latLng,
    radius: 6,
    strokeColor: wasCorrect ? "#6f9e80" : "#a26b70",
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillOpacity: 0,
    clickable: false,
    zIndex: 4,
  });

  let radius = 6;
  let opacity = 0.9;
  let ticks = 0;

  const pulseId = setInterval(() => {
    ticks += 1;
    radius += 4;
    opacity -= 0.12;
    pulse.setRadius(radius);
    pulse.setOptions({ strokeOpacity: Math.max(opacity, 0) });

    if (ticks >= 7) {
      clearInterval(pulseId);
      pulse.setMap(null);
    }
  }, 45);
}

// GEOMETRY Library check used for click correctness.
function isInsideLocation(latLng, location) {
  if (google.maps.geometry?.poly?.containsLocation && location.checkPolygon) {
    return google.maps.geometry.poly.containsLocation(latLng, location.checkPolygon);
  }

  // Fallback if library fails to load.
  const bounds = pathBounds(location.path);
  return latLng.lat() <= bounds.north && latLng.lat() >= bounds.south && latLng.lng() <= bounds.east && latLng.lng() >= bounds.west;
}

// Update the active "Current location" prompt text.
function updatePrompt() {
  if (gameState.isComplete || gameState.currentRound >= gameState.totalRounds) {
    return;
  }

  const activeLocation = gameState.locations[gameState.currentRound];
  ui.currentLocation.textContent = activeLocation.name;
  ui.currentLocation.title = activeLocation.name;
  ui.round.textContent = String(gameState.currentRound + 1);
}

// End-of-game UI state and summary HUD.
function finalizeGame() {
  gameState.isComplete = true;
  gameState.isLocked = true;
  stopGameTimer();

  ui.currentLocation.textContent = "All locations completed";
  ui.currentLocation.title = "All locations completed";
  ui.round.textContent = String(gameState.totalRounds);
  ui.instructions.innerHTML = "Game over. Press Restart Game to run another round.";
  setFeedback(`Finished! You got ${gameState.score} out of ${gameState.totalRounds} correct.`, "success");
  ui.restartButton.disabled = false;
  showHud("GAME OVER", "hud-game-over", `Final score: ${gameState.score}/${gameState.totalRounds}`);
}

// Main double-click game handler: evaluate answer and advance round.
function handleGuess(event) {
  if (gameState.isCalibrationMode || gameState.isComplete || gameState.isLocked) {
    return;
  }

  tryStartBackgroundMusic();

  const activeLocation = gameState.locations[gameState.currentRound];
  const wasCorrect = isInsideLocation(event.latLng, activeLocation);

  playClickPulse(event.latLng, wasCorrect);
  clearResultOverlay();
  showResultOverlay(activeLocation.path, wasCorrect);
  showRoundLocationLabel(activeLocation, wasCorrect);
  playOutcomeSound(wasCorrect);

  if (wasCorrect) {
    gameState.score += 1;
  }

  ui.score.textContent = String(gameState.score);
  updateAccuracy();
  setFeedback(
    wasCorrect
      ? `Correct! ${activeLocation.name} is highlighted in green.`
      : `Not quite. ${activeLocation.name} is highlighted in red.`,
    wasCorrect ? "success" : "error"
  );

  gameState.currentRound += 1;

  if (gameState.currentRound >= gameState.totalRounds) {
    finalizeGame();
    return;
  }

  gameState.isLocked = true;
  setTimeout(() => {
    gameState.isLocked = false;
    updatePrompt();
  }, ROUND_LOCK_MS);
}

// Reset everything needed for a clean new 5-round run.
function startNewGameSession() {
  if (gameState.isCalibrationMode) {
    stopPolygonWizard();
  }

  gameState.score = 0;
  gameState.currentRound = 0;
  gameState.isComplete = false;
  gameState.isLocked = true;

  stopGameTimer();
  resetGameTimer();
  clearResultOverlay();
  clearRoundLabels();
  drawPreviewOverlays();
  hideHud();

  ui.score.textContent = "0";
  ui.round.textContent = "0";
  ui.currentLocation.textContent = "Stand by...";
  ui.currentLocation.title = "Stand by...";
  updateAccuracy();
  ui.restartButton.disabled = true;

  ui.instructions.innerHTML = DEFAULT_INSTRUCTIONS_HTML;
  setFeedback("Starting...", "info");

  runIntroCountdown(() => {
    gameState.isLocked = false;
    updatePrompt();
    startGameTimer();
    tryStartBackgroundMusic();
    setFeedback("Round 1 ready. Double-click your answer.", "info");
  });
}

// Remove temporary wizard overlays/listeners and restore normal map state.
function cleanupPolygonWizardArtifacts() {
  if (!calibrationSession) {
    return;
  }

  if (calibrationSession.previewPolygon) {
    calibrationSession.previewPolygon.setMap(null);
  }
  if (calibrationSession.previewPathLine) {
    calibrationSession.previewPathLine.setMap(null);
  }
  if (calibrationSession.addPointListener) {
    google.maps.event.removeListener(calibrationSession.addPointListener);
  }
  if (calibrationSession.finishLocationListener) {
    google.maps.event.removeListener(calibrationSession.finishLocationListener);
  }
  if (calibrationSession.keydownHandler) {
    document.removeEventListener("keydown", calibrationSession.keydownHandler);
  }
}

// Draw temporary path/polygon for a building.
function drawPolygonWizardPreview() {
  if (!calibrationSession) {
    return;
  }

  const activePath = calibrationSession.activePath;
  if (calibrationSession.previewPolygon) {
    calibrationSession.previewPolygon.setMap(null);
    calibrationSession.previewPolygon = null;
  }
  if (calibrationSession.previewPathLine) {
    calibrationSession.previewPathLine.setMap(null);
    calibrationSession.previewPathLine = null;
  }

  if (activePath.length >= 3) {
    calibrationSession.previewPolygon = new google.maps.Polygon({
      map,
      paths: activePath,
      strokeColor: "#f6cc3f",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#f6cc3f",
      fillOpacity: 0.16,
      clickable: false,
      zIndex: 9990,
    });
    return;
  }

  if (activePath.length >= 2) {
    calibrationSession.previewPathLine = new google.maps.Polyline({
      map,
      path: activePath,
      strokeColor: "#f6cc3f",
      strokeOpacity: 1,
      strokeWeight: 2,
      clickable: false,
      zIndex: 9990,
    });
  }
}

// Print paths as copy/paste code so traced polygons can be saved permanently.
function logPolygonWizardResults(message) {
  if (!calibrationSession) {
    return;
  }

  const generatedCode = calibrationSession.locations
    .map((location) => {
      const bounds = location.overlayBounds || pathBounds(location.path);
      const polygonLines = location.path
        .map((point) => `      { lat: ${point.lat.toFixed(6)}, lng: ${point.lng.toFixed(6)} },`)
        .join("\n");
      return (
        `  {\n` +
        `    name: "${location.name}",\n` +
        `    overlayImage: "${location.overlayImage}",\n` +
        `    bounds: {\n` +
        `      north: ${bounds.north.toFixed(15)},\n` +
        `      south: ${bounds.south.toFixed(15)},\n` +
        `      east: ${bounds.east.toFixed(15)},\n` +
        `      west: ${bounds.west.toFixed(15)},\n` +
        `    },\n` +
        `    path: [\n${polygonLines}\n    ],\n` +
        `  },`
      );
    })
    .join("\n");

  const exportCode = `const LOCATION_BOUNDS = [\n${generatedCode}\n];`;
  window.latestPolygonExport = exportCode;

  // Keep output obvious and reusable even if console scrolls.
  if (message) {
    console.log(message);
  }
  console.log("Copy/paste this into LOCATION_BOUNDS:");
  console.log(exportCode);
}

// Save one finished building polygon and switch wizard to the next location.
function finalizePolygonWizardLocation() {
  if (!calibrationSession) {
    return;
  }

  const activePath = calibrationSession.activePath;
  if (activePath.length < 3) {
    setFeedback("Need at least 3 points. Keep clicking around the building first.", "error");
    return;
  }

  const location = calibrationSession.locations[calibrationSession.locationIndex];
  const normalizedPath = activePath.map((point) => ({ lat: point.lat, lng: point.lng }));
  location.path = normalizedPath;
  updateLocationGeometry(location);

  calibrationSession.locationIndex += 1;
  calibrationSession.activePath = [];
  drawPolygonWizardPreview();
  drawPreviewOverlays();
  logPolygonWizardResults(`Saved polygon for ${location.name}.`);

  if (calibrationSession.locationIndex >= calibrationSession.locations.length) {
    logPolygonWizardResults("Polygon wizard finished.");
    stopPolygonWizard("Polygon wizard complete. Traced shapes are now active.", "success");
    return;
  }

  const nextLocation = calibrationSession.locations[calibrationSession.locationIndex];
  setFeedback(`Tracing ${nextLocation.name}. Click corners, then right-click (or press Enter) to save.`, "info");
}

// Remove the latest clicked point during tracing.
function undoPolygonWizardPoint() {
  if (!calibrationSession || calibrationSession.activePath.length === 0) {
    return;
  }

  calibrationSession.activePath.pop();
  drawPolygonWizardPreview();
  setFeedback("Removed last point.", "info");
}

// Start click-to-trace wizard for true building polygons.
function startPolygonWizard() {
  if (!map) {
    setFeedback("Map is not ready yet. Wait for it to load, then try again.", "error");
    return;
  }
  if (gameState.isCalibrationMode) {
    setFeedback("Polygon wizard is already running.", "info");
    return;
  }

  clearResultOverlay();
  clearRoundLabels();
  stopGameTimer();
  clearInterval(countdownIntervalId);
  countdownIntervalId = null;
  hideHud();
  gameState.isCalibrationMode = true;
  gameState.isLocked = true;
  setBuildingOverlaysVisible(true);

  const keydownHandler = (event) => {
    if (!calibrationSession) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      finalizePolygonWizardLocation();
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      undoPolygonWizardPoint();
    }
  };

  calibrationSession = {
    locations: gameState.locations,
    locationIndex: 0,
    activePath: [],
    previewPolygon: null,
    previewPathLine: null,
    keydownHandler,
    addPointListener: map.addListener("click", (event) => {
      const clickedPoint = event.latLng.toJSON();
      calibrationSession.activePath.push(clickedPoint);
      drawPolygonWizardPreview();
      setFeedback(
        `Point ${calibrationSession.activePath.length} added for ${
          calibrationSession.locations[calibrationSession.locationIndex].name
        }.`,
        "info"
      );
    }),
    finishLocationListener: map.addListener("rightclick", (event) => {
      if (event && typeof event.stop === "function") {
        event.stop();
      }
      finalizePolygonWizardLocation();
    }),
  };
  document.addEventListener("keydown", keydownHandler);

  const firstLocation = calibrationSession.locations[0];
  setFeedback(`Tracing ${firstLocation.name}. Click corners, then right-click (or press Enter) to save.`, "info");
  ui.instructions.innerHTML =
    "Polygon wizard mode: click around each building to trace the true shape, then right-click (or Enter) to save each one.";
}

// Stop wizard mode and hand control back to normal game flow.
function stopPolygonWizard(message = "Polygon wizard stopped.", feedbackType = "info") {
  cleanupPolygonWizardArtifacts();
  calibrationSession = null;
  gameState.isCalibrationMode = false;
  gameState.isLocked = false;

  ui.instructions.innerHTML = DEFAULT_INSTRUCTIONS_HTML;
  updatePrompt();
  setFeedback(message, feedbackType);
}

window.startPolygonWizard = startPolygonWizard;
window.stopPolygonWizard = stopPolygonWizard;
window.undoPolygonPoint = undoPolygonWizardPoint;
window.finishPolygonLocation = finalizePolygonWizardLocation;
window.printPolygonExport = () => console.log(window.latestPolygonExport || "No polygon export yet.");
window.startBoundsWizard = startPolygonWizard;

// Map bootstrap callback used by Google Maps API loader.
window.initMap = function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CSUN_CENTER,
    zoom: MAP_ZOOM,
    minZoom: MAP_ZOOM,
    maxZoom: MAP_ZOOM,
    disableDefaultUI: true,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    keyboardShortcuts: false,
    gestureHandling: "none",
    styles: MAP_STYLES,
    draggableCursor: "crosshair",
    draggingCursor: "crosshair",
  });

  initializeLocationGeometry();
  map.addListener("dblclick", handleGuess);

  ensureBuildingOverlays();
  setBuildingOverlaysVisible(gameState.isOverlayVisible);
  applyMuteState();
  drawPreviewOverlays();
  startNewGameSession();
};

// Inject Google Maps script with Geometry Library enabled.
function loadGoogleMapsApi() {
  if (!GOOGLE_MAPS_API_KEY) {
    setFeedback("Map API key is missing. Add it in config.local.js (window.APP_CONFIG.googleMapsApiKey).", "error");
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry&callback=initMap&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    setFeedback("Failed to load Google Maps API.", "error");
  };
  document.head.appendChild(script);
}

// Wire UI events once at startup.
ui.restartButton.addEventListener("click", startNewGameSession);
ui.soundToggle.addEventListener("click", toggleSound);
ui.overlayToggle.addEventListener("click", toggleBuildingOverlays);
document.addEventListener("pointerdown", tryStartBackgroundMusic, { once: true });

updateTimerDisplay();
updateAccuracy();
updateSoundToggleUi();
updateOverlayToggleUi();
loadGoogleMapsApi();
