const soundtrack = document.querySelector("[data-soundtrack]");
const startOverlay = document.querySelector("[data-start-overlay]");
const startButton = document.querySelector("[data-start-button]");
const playToggle = document.querySelector("[data-play-toggle]");
const restartButton = document.querySelector("[data-restart]");
const progressFill = document.querySelector("[data-progress-fill]");
const sceneLabel = document.querySelector("[data-scene-label]");
const timecode = document.querySelector("[data-timecode]");
const audioLabel = document.querySelector("[data-audio-label]");
const stage = document.querySelector("[data-stage]");
const assemblyStage = document.querySelector(".scene--assembly .assembly-stage");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Synced to the local file measured via ffprobe. This is the actual source of truth in this repo.
const AUDIO_DURATION = 497.533979;

const PHASES = {
  opening: { start: 0, end: 80, scene: "opening", label: "Opening / build" },
  statement: { start: 80, end: 105, scene: "statement", label: "Statement / breath" },
  calibration: { start: 105, end: 255, scene: "calibration", label: "Calibration / sustained control" },
  rupture: { start: 255, end: 265, scene: "assembly", label: "Rupture / compression blackout" },
  assembly: { start: 265, end: 360, scene: "assembly", label: "Assembly / post-peak rebuild" },
  continuity: { start: 360, end: 390, scene: "continuity", label: "Continuity / controlled release" },
  closing: { start: 390, end: AUDIO_DURATION, scene: "closing", label: "Closing / final authority" },
};

const sceneNames = {
  opening: "Opening frame",
  statement: "Enterprise / precision",
  calibration: "Calibration / instrumentation",
  assembly: "Assembly / orchestration",
  continuity: "Continuity / automation",
  closing: "Closing signature",
};

const playback = {
  master: null,
  usingAudioSync: false,
  syncAttached: false,
  sync: null,
};

if (prefersReducedMotion) {
  setupReducedMotion();
} else {
  initializeReel();
}

function setupReducedMotion() {
  if (startOverlay) {
    startOverlay.hidden = true;
  }
  if (playToggle) {
    playToggle.disabled = true;
  }
  updateTimecode(0);
}

function initializeReel() {
  ensureStageHelpers();

  const master = buildTimeline();
  playback.master = master;

  updateScene(getSceneForTime(0));
  updatePlaybackUI(false);
  updateProgressUI(0);
  updateTimecode(0);

  startButton?.addEventListener("click", () => startReel(master));
  playToggle?.addEventListener("click", () => togglePlayback(master));
  restartButton?.addEventListener("click", () => restartReel(master));

  soundtrack?.addEventListener("loadedmetadata", () => {
    if (audioLabel) {
      audioLabel.textContent = `Soundtrack ${formatDuration(AUDIO_DURATION)}`;
    }
  });

  soundtrack?.addEventListener("ended", () => stopPlaybackAtEnd(master));
  soundtrack?.addEventListener("pause", () => {
    if (playback.usingAudioSync && soundtrack.currentTime < AUDIO_DURATION) {
      updatePlaybackUI(false);
    }
  });
  soundtrack?.addEventListener("error", () => {
    if (audioLabel) {
      audioLabel.textContent = "Soundtrack unavailable";
    }
  });
}

function ensureStageHelpers() {
  if (stage && !stage.querySelector(".rupture-overlay")) {
    const ruptureOverlay = document.createElement("div");
    ruptureOverlay.className = "rupture-overlay";
    stage.appendChild(ruptureOverlay);
  }

  if (assemblyStage && !assemblyStage.querySelector(".assembly-cursor")) {
    const cursor = document.createElement("div");
    cursor.className = "assembly-cursor";
    assemblyStage.appendChild(cursor);
  }
}

function buildTimeline() {
  const scenes = gsap.utils.toArray(".scene");
  const ruptureOverlay = document.querySelector(".rupture-overlay");
  const assemblyCursor = document.querySelector(".assembly-cursor");

  gsap.set(scenes, { autoAlpha: 0 });
  gsap.set(".scene--opening", { autoAlpha: 1, visibility: "visible" });
  gsap.set(".hero-title__line, .scene-title__line, .closing-title span", { yPercent: 110 });
  gsap.set(".hero-statement, .statement-panel, .marker-card, .closing-body, .closing-caption", {
    autoAlpha: 0,
    y: 30,
  });
  gsap.set(".scene--calibration .eyebrow", { autoAlpha: 0, y: 20 });
  gsap.set(".instrument-panel, .media-plate--portrait", { autoAlpha: 0, y: 36 });
  gsap.set(".instrument-panel__meter span", { scaleY: 0.12 });
  gsap.set(".signal", { scaleX: 0.08, autoAlpha: 0, transformOrigin: "left center" });
  gsap.set(".board-readout", { autoAlpha: 0, y: 22 });
  gsap.set(".scene--calibration .calibration-board", { autoAlpha: 0, x: 24, scale: 0.985 });
  gsap.set(".assembly-module", { autoAlpha: 0, y: 92, scale: 0.9 });
  gsap.set(".chain-node", { autoAlpha: 0, y: 28 });
  gsap.set(".chain-link", { autoAlpha: 0, y: 28, scaleX: 0.08 });
  gsap.set(".closing-panel", { autoAlpha: 0, scale: 0.975, y: 18 });
  gsap.set(".stage-vignette", { opacity: 1 });
  gsap.set(".stage-grid", { opacity: 0.24 });
  gsap.set(ruptureOverlay, { autoAlpha: 0, scale: 1.18 });
  gsap.set(assemblyCursor, { autoAlpha: 0, scale: 0.35, xPercent: -50, yPercent: -50 });

  const master = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.inOut" },
    onUpdate: () => {
      updateProgressUI(master.time());
      updateTimecode(master.time());
      updateScene(getSceneForTime(master.time()));
    },
    onComplete: () => {
      updatePlaybackUI(false);
    },
  });

  const p = (phaseName, ratio) => {
    const phase = PHASES[phaseName];
    return phase.start + (phase.end - phase.start) * ratio;
  };

  const showScene = (sceneName, atTime) => {
    master.set(`.scene--${sceneName}`, { autoAlpha: 1, visibility: "visible" }, atTime);
  };

  const hideScene = (sceneName, atTime, duration = 1.4) => {
    master.to(`.scene--${sceneName}`, { autoAlpha: 0, duration }, atTime);
  };

  showScene("opening", PHASES.opening.start);
  master
    .from(".scene--opening .scene__header", { autoAlpha: 0, y: -18, duration: 2.8 }, p("opening", 0.015))
    .to(
      ".scene--opening .hero-title__line",
      { yPercent: 0, duration: 9, stagger: 0.8, ease: "power4.out" },
      p("opening", 0.035)
    )
    .to(".scene--opening .instrument-panel", { autoAlpha: 1, y: 0, duration: 5.5 }, p("opening", 0.1))
    .to(".scene--opening .media-plate--portrait", { autoAlpha: 1, y: 0, duration: 6.2 }, p("opening", 0.14))
    .to(".scene--opening .hero-statement", { autoAlpha: 1, y: 0, duration: 5.5 }, p("opening", 0.18))
    .to(
      ".scene--opening .instrument-panel__meter span",
      { scaleY: 1, duration: 4.4, stagger: 0.35, ease: "back.out(1.3)" },
      p("opening", 0.16)
    )
    .to(".scene--opening .title-cluster", { y: -16, duration: 14, ease: "sine.inOut" }, p("opening", 0.28))
    .to(".scene--opening .title-cluster", { y: 0, duration: 14, ease: "sine.inOut" }, p("opening", 0.46))
    .to(".scene--opening .hero-right", { y: -14, duration: 10, ease: "sine.inOut" }, p("opening", 0.38))
    .to(".scene--opening .hero-right", { y: 0, duration: 12, ease: "sine.inOut" }, p("opening", 0.56))
    .to(".scene--opening .instrument-panel", { borderColor: "rgba(201, 168, 106, 0.34)", duration: 3.2 }, p("opening", 0.6))
    .to(".scene--opening .instrument-panel", { borderColor: "rgba(242, 238, 231, 0.12)", duration: 4 }, p("opening", 0.68))
    .to(".scene--opening .title-cluster", { y: -8, duration: 7, ease: "power2.out" }, p("opening", 0.82))
    .to(".scene--opening .title-cluster", { y: 0, duration: 7, ease: "power2.inOut" }, p("opening", 0.9));

  hideScene("opening", 77.8, 1.9);

  showScene("statement", PHASES.statement.start);
  master
    .from(".scene--statement .scene__header", { autoAlpha: 0, y: -18, duration: 1.5 }, p("statement", 0.04))
    .fromTo(
      ".scene--statement .statement-panel",
      { autoAlpha: 0, y: 40, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 4.5, ease: "power3.out" },
      p("statement", 0.08)
    )
    .fromTo(
      ".scene--statement .marker-card",
      { autoAlpha: 0, y: 42, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 3.2, stagger: 1.2, ease: "back.out(1.08)" },
      p("statement", 0.26)
    )
    .to(".scene--statement .statement-panel", { borderColor: "rgba(201, 168, 106, 0.36)", duration: 1.8 }, p("statement", 0.46))
    .to(".scene--statement .statement-panel", { borderColor: "rgba(242, 238, 231, 0.12)", duration: 2.2 }, p("statement", 0.54))
    .to(".scene--statement .marker-card:nth-child(1)", { y: -8, duration: 0.8 }, p("statement", 0.6))
    .to(".scene--statement .marker-card:nth-child(1)", { y: 0, duration: 1.2 }, p("statement", 0.632))
    .to(".scene--statement .marker-card:nth-child(2)", { y: -8, duration: 0.8 }, p("statement", 0.7))
    .to(".scene--statement .marker-card:nth-child(2)", { y: 0, duration: 1.2 }, p("statement", 0.732))
    .to(".scene--statement .marker-card:nth-child(3)", { y: -8, duration: 0.8 }, p("statement", 0.8))
    .to(".scene--statement .marker-card:nth-child(3)", { y: 0, duration: 1.2 }, p("statement", 0.832));

  hideScene("statement", 103.2, 1.4);

  showScene("calibration", PHASES.calibration.start);
  master
    .from(".scene--calibration .scene__header", { autoAlpha: 0, y: -18, duration: 1.8 }, p("calibration", 0.015))
    .to(
      ".scene--calibration .scene-title__line",
      { yPercent: 0, duration: 7.5, stagger: 0.55, ease: "power4.out" },
      p("calibration", 0.035)
    )
    .to(".scene--calibration .eyebrow", { autoAlpha: 1, y: 0, duration: 3.8 }, p("calibration", 0.07))
    .to(".scene--calibration .calibration-board", { autoAlpha: 1, x: 0, scale: 1, duration: 4.8 }, p("calibration", 0.09))
    .to(".scene--calibration .signal--wide", { autoAlpha: 1, scaleX: 1, duration: 3.2 }, p("calibration", 0.12))
    .to(".scene--calibration .signal--mid", { autoAlpha: 1, scaleX: 1, duration: 2.8 }, p("calibration", 0.14))
    .to(".scene--calibration .signal--narrow", { autoAlpha: 1, scaleX: 1, duration: 2.4 }, p("calibration", 0.16))
    .to(".scene--calibration .board-readout", { autoAlpha: 1, y: 0, duration: 2.6, stagger: 0.6 }, p("calibration", 0.17));

  const calibrationPulses = [0.24, 0.31, 0.39, 0.48, 0.57, 0.66, 0.74, 0.81];
  calibrationPulses.forEach((ratio, index) => {
    master
      .to(".scene--calibration .signal--mid", { scaleX: 0.62, duration: 0.7 }, p("calibration", ratio))
      .to(".scene--calibration .signal--mid", { scaleX: 1, duration: 1.2 }, p("calibration", ratio) + 0.7)
      .to(".scene--calibration .signal--narrow", { scaleX: 0.4 + (index % 3) * 0.08, duration: 0.55 }, p("calibration", ratio) + 1.25)
      .to(".scene--calibration .signal--narrow", { scaleX: 1, duration: 1 }, p("calibration", ratio) + 1.8)
      .to(".scene--calibration .calibration-board", { y: -8, duration: 0.8 }, p("calibration", ratio) + 2.2)
      .to(".scene--calibration .calibration-board", { y: 0, duration: 1.4 }, p("calibration", ratio) + 3.0);
  });

  master
    .to(".scene--calibration .signal", { opacity: 0.84, duration: 1.1, stagger: 0.15 }, p("calibration", 0.72))
    .to(".scene--calibration .signal", { opacity: 1, duration: 1.4, stagger: 0.15 }, p("calibration", 0.75))
    .to(".stage-grid", { opacity: 0.38, duration: 10 }, p("calibration", 0.72))
    .to(".stage-vignette", { opacity: 1.08, duration: 13 }, p("calibration", 0.76));

  master
    .to(".scene--calibration .scene__content > *", { scale: 0.88, y: 16, autoAlpha: 0.35, duration: 2.1, ease: "power2.in" }, 255)
    .to(".stage-grid", { opacity: 0.72, scale: 1.05, duration: 1.4 }, 256)
    .to(".stage-vignette", { opacity: 1.35, duration: 1.2 }, 256)
    .to(ruptureOverlay, { autoAlpha: 1, scale: 1, duration: 1.5, ease: "power2.out" }, 257.2)
    .to(".reel-stage", { scale: 0.982, filter: "brightness(0.68)", duration: 1.3, ease: "power2.in" }, 257.6)
    .to(".reel-stage", { scale: 1, filter: "brightness(1)", duration: 1.9, ease: "power2.out" }, 261.6)
    .to(ruptureOverlay, { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" }, 262.8)
    .to(".stage-grid", { opacity: 0.3, scale: 1, duration: 1.6 }, 262.8)
    .to(".stage-vignette", { opacity: 1, duration: 1.8 }, 263.2);

  hideScene("calibration", 263.8, 0.8);

  showScene("assembly", PHASES.assembly.start);
  master
    .from(".scene--assembly .scene__header", { autoAlpha: 0, y: -20, duration: 1.7 }, 266.2)
    .fromTo(
      ".scene--assembly .assembly-stage",
      { clipPath: "inset(20% 16% 22% 16% round 30px)", scale: 0.94 },
      { clipPath: "inset(0% 0% 0% 0% round 30px)", scale: 1, duration: 4.4, ease: "power3.out" },
      266.8
    )
    .to(".scene--assembly .assembly-stage__grid", { opacity: 0.5, duration: 4.6 }, 267.6)
    .set(".assembly-cursor", { x: "22%", y: "26%" }, 270.2)
    .to(".assembly-cursor", { autoAlpha: 1, scale: 1, duration: 0.75 }, 270.4)
    .to(".scene--assembly .assembly-module--a", { autoAlpha: 1, y: 0, scale: 1, duration: 2.2, ease: "back.out(1.35)" }, 271.2)
    .to(".scene--assembly .assembly-module--a", { borderColor: "rgba(201, 168, 106, 0.46)", boxShadow: "0 0 34px rgba(201, 168, 106, 0.16)", duration: 1.1 }, 273.6)
    .to(".assembly-cursor", { x: "76%", y: "31%", duration: 1.5, ease: "power3.inOut" }, 275.8)
    .to(".scene--assembly .assembly-module--b", { autoAlpha: 1, y: 0, scale: 1, duration: 2.2, ease: "back.out(1.35)" }, 277.6)
    .to(".scene--assembly .assembly-module--b", { borderColor: "rgba(201, 168, 106, 0.46)", boxShadow: "0 0 34px rgba(201, 168, 106, 0.16)", duration: 1.1 }, 279.9)
    .to(".assembly-cursor", { x: "37%", y: "76%", duration: 1.6, ease: "power3.inOut" }, 282.2)
    .to(".scene--assembly .assembly-module--c", { autoAlpha: 1, y: 0, scale: 1, duration: 2.2, ease: "back.out(1.35)" }, 284.1)
    .to(".scene--assembly .assembly-module--c", { borderColor: "rgba(201, 168, 106, 0.46)", boxShadow: "0 0 34px rgba(201, 168, 106, 0.16)", duration: 1.1 }, 286.4)
    .to(".assembly-cursor", { x: "82%", y: "79%", duration: 1.8, ease: "power3.inOut" }, 288.8)
    .to(".scene--assembly .assembly-module--d", { autoAlpha: 1, y: 0, scale: 1, duration: 2.6, ease: "back.out(1.55)" }, 291.1)
    .to(".scene--assembly .assembly-module--d", { borderColor: "rgba(201, 168, 106, 0.52)", boxShadow: "0 0 40px rgba(201, 168, 106, 0.18)", duration: 1.2 }, 293.8)
    .to(".assembly-cursor", { scale: 1.35, duration: 0.8 }, 294.6)
    .to(".assembly-cursor", { scale: 0.7, autoAlpha: 0, duration: 1 }, 295.5)
    .to(".scene--assembly .assembly-module--a", { xPercent: 10, yPercent: 9, duration: 5.5, ease: "power2.out" }, 299)
    .to(".scene--assembly .assembly-module--b", { xPercent: -12, yPercent: 12, duration: 5.5, ease: "power2.out" }, 301)
    .to(".scene--assembly .assembly-module--c", { xPercent: 13, yPercent: -10, duration: 5.5, ease: "power2.out" }, 303)
    .to(".scene--assembly .assembly-module--d", { xPercent: -13, yPercent: -14, duration: 5.9, ease: "power2.out" }, 305)
    .to(".scene--assembly .assembly-module", { boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)", duration: 4.4, stagger: 0.45 }, 311)
    .to(".scene--assembly .assembly-stage__grid", { opacity: 0.58, duration: 8 }, 318)
    .to(".scene--assembly .assembly-stage", { filter: "brightness(1.05)", duration: 5.5 }, 327)
    .to(".scene--assembly .assembly-stage", { filter: "brightness(0.98)", duration: 9 }, 332);

  hideScene("assembly", 357.5, 2);

  showScene("continuity", PHASES.continuity.start);
  master
    .from(".scene--continuity .scene__header", { autoAlpha: 0, y: -18, duration: 1.4 }, 361)
    .to(
      ".scene--continuity .scene-title__line",
      { yPercent: 0, duration: 4.2, stagger: 0.35, ease: "power4.out" },
      362
    )
    .fromTo(".scene--continuity .eyebrow", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 2.4 }, 363.4)
    .to(".scene--continuity .chain-node:nth-of-type(1)", { autoAlpha: 1, y: 0, duration: 2.1, ease: "back.out(1.12)" }, 365.2)
    .to(".scene--continuity .chain-link:nth-of-type(2)", { autoAlpha: 1, y: 0, scaleX: 1, duration: 1.2 }, 367.4)
    .to(".scene--continuity .chain-node:nth-of-type(3)", { autoAlpha: 1, y: 0, duration: 2.1, ease: "back.out(1.12)" }, 368.8)
    .to(".scene--continuity .chain-link:nth-of-type(4)", { autoAlpha: 1, y: 0, scaleX: 1, duration: 1.2 }, 371.4)
    .to(".scene--continuity .chain-node:nth-of-type(5)", { autoAlpha: 1, y: 0, duration: 2.3, ease: "back.out(1.12)" }, 372.8)
    .to(".scene--continuity .chain-track", { xPercent: -3, duration: 5 }, 377)
    .to(".scene--continuity .chain-track", { xPercent: 0, duration: 7 }, 382)
    .to(".scene--continuity .chain-node:last-child", { borderColor: "rgba(201, 168, 106, 0.46)", duration: 1.2 }, 384.5)
    .to(".scene--continuity .chain-node:last-child", { borderColor: "rgba(242, 238, 231, 0.12)", duration: 2.2 }, 386);

  hideScene("continuity", 388.6, 1);

  showScene("closing", PHASES.closing.start);
  master
    .from(".scene--closing .scene__header", { autoAlpha: 0, y: -18, duration: 1.6 }, 391.2)
    .to(".scene--closing .closing-panel", { autoAlpha: 1, scale: 1, y: 0, duration: 5.2 }, 392.4)
    .to(
      ".scene--closing .closing-title span",
      { yPercent: 0, duration: 7.2, stagger: 0.65, ease: "power4.out" },
      394.8
    )
    .to(".scene--closing .closing-body", { autoAlpha: 1, y: 0, duration: 4.5 }, 401)
    .to(".scene--closing .closing-caption", { autoAlpha: 1, y: 0, duration: 4 }, 404.2)
    .to(".scene--closing", { filter: "brightness(1.08)", duration: 8.5 }, 414)
    .to(".scene--closing", { filter: "brightness(0.95)", duration: 12 }, 423.5)
    .to(".stage-vignette", { opacity: 1.18, duration: 22 }, 430)
    .to(".scene--closing .closing-panel", { y: -8, duration: 8.5, ease: "sine.inOut" }, 438)
    .to(".scene--closing .closing-panel", { y: 0, duration: 9.5, ease: "sine.inOut" }, 447.5)
    .to(".scene--closing .closing-panel", { scale: 1.015, duration: 12, ease: "sine.inOut" }, 458)
    .to(".scene--closing .closing-panel", { scale: 1, duration: 14, ease: "sine.inOut" }, 470)
    .to(".reel-stage", { filter: "brightness(0.9)", duration: 8 }, 486)
    .to(".reel-stage", { filter: "brightness(1)", duration: 6.3 }, 491);

  master.call(() => {}, null, AUDIO_DURATION);

  return master;
}

async function startReel(master) {
  startOverlay?.setAttribute("hidden", "hidden");

  if (soundtrack) {
    soundtrack.currentTime = 0;
    try {
      await soundtrack.play();
      playback.usingAudioSync = true;
      attachAudioSync(master);
      updatePlaybackUI(true);
      if (audioLabel) {
        audioLabel.textContent = `Soundtrack synced ${formatDuration(AUDIO_DURATION)}`;
      }
      return;
    } catch (error) {
      playback.usingAudioSync = false;
      detachAudioSync();
      if (audioLabel) {
        audioLabel.textContent = "Soundtrack blocked";
      }
    }
  }

  master.restart(true);
  updatePlaybackUI(true);
}

function togglePlayback(master) {
  if (playback.usingAudioSync && soundtrack) {
    if (soundtrack.paused) {
      soundtrack.play().catch(() => {
        if (audioLabel) {
          audioLabel.textContent = "Soundtrack blocked";
        }
      });
      updatePlaybackUI(true);
    } else {
      soundtrack.pause();
      updatePlaybackUI(false);
    }
    return;
  }

  if (!master.isActive() && master.progress() === 0) {
    startReel(master);
    return;
  }

  if (master.paused()) {
    master.play();
    updatePlaybackUI(true);
  } else {
    master.pause();
    updatePlaybackUI(false);
  }
}

function restartReel(master) {
  soundtrack?.pause();
  if (soundtrack) {
    soundtrack.currentTime = 0;
  }

  detachAudioSync();
  playback.usingAudioSync = false;
  master.pause(0);
  master.time(0, false);
  updateProgressUI(0);
  updateTimecode(0);
  updateScene(getSceneForTime(0));
  updatePlaybackUI(false);
  startReel(master);
}

function attachAudioSync(master) {
  if (playback.syncAttached) {
    return;
  }

  const sync = () => {
    if (!playback.usingAudioSync || !soundtrack) {
      return;
    }

    const clamped = Math.max(0, Math.min(soundtrack.currentTime, AUDIO_DURATION));
    master.pause();
    master.time(clamped, false);
    updateProgressUI(clamped);
    updateTimecode(clamped);
    updateScene(getSceneForTime(clamped));

    if (clamped >= AUDIO_DURATION) {
      stopPlaybackAtEnd(master);
    }
  };

  playback.sync = sync;
  playback.syncAttached = true;
  gsap.ticker.add(sync);
}

function detachAudioSync() {
  if (!playback.syncAttached || !playback.sync) {
    return;
  }

  gsap.ticker.remove(playback.sync);
  playback.syncAttached = false;
}

function stopPlaybackAtEnd(master) {
  soundtrack?.pause();
  if (soundtrack) {
    soundtrack.currentTime = AUDIO_DURATION;
  }
  playback.usingAudioSync = false;
  detachAudioSync();
  master.pause(AUDIO_DURATION);
  master.time(AUDIO_DURATION, false);
  updateProgressUI(AUDIO_DURATION);
  updateTimecode(AUDIO_DURATION);
  updateScene(getSceneForTime(AUDIO_DURATION));
  updatePlaybackUI(false);
}

function getSceneForTime(time) {
  const clamped = Math.max(0, Math.min(time, AUDIO_DURATION));

  if (clamped < PHASES.statement.start) {
    return "opening";
  }
  if (clamped < PHASES.calibration.start) {
    return "statement";
  }
  if (clamped < PHASES.assembly.start) {
    return "calibration";
  }
  if (clamped < PHASES.continuity.start) {
    return "assembly";
  }
  if (clamped < PHASES.closing.start) {
    return "continuity";
  }
  return "closing";
}

function updatePlaybackUI(isPlaying) {
  if (playToggle) {
    playToggle.textContent = isPlaying ? "Pause" : "Play";
  }
}

function updateScene(sceneName) {
  if (sceneLabel) {
    sceneLabel.textContent = sceneNames[sceneName] || sceneName;
  }
}

function updateProgressUI(currentSeconds) {
  if (!progressFill) {
    return;
  }

  const progress = (Math.max(0, Math.min(currentSeconds, AUDIO_DURATION)) / AUDIO_DURATION) * 100;
  progressFill.style.width = `${progress}%`;
}

function updateTimecode(currentSeconds) {
  if (!timecode) {
    return;
  }

  timecode.textContent = formatDuration(Math.max(0, Math.min(currentSeconds, AUDIO_DURATION)));
}

function formatDuration(value) {
  const totalMilliseconds = Math.round(value * 1000);
  const minutes = String(Math.floor(totalMilliseconds / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((totalMilliseconds % 60000) / 1000)).padStart(2, "0");
  const milliseconds = String(totalMilliseconds % 1000).padStart(3, "0");
  return `${minutes}:${seconds}.${milliseconds}`;
}
