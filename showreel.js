const soundtrack = document.querySelector("[data-soundtrack]");
const startOverlay = document.querySelector("[data-start-overlay]");
const startButton = document.querySelector("[data-start-button]");
const playToggle = document.querySelector("[data-play-toggle]");
const restartButton = document.querySelector("[data-restart]");
const progressFill = document.querySelector("[data-progress-fill]");
const sceneLabel = document.querySelector("[data-scene-label]");
const timecode = document.querySelector("[data-timecode]");
const audioLabel = document.querySelector("[data-audio-label]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sceneNames = {
  opening: "Opening frame",
  statement: "Enterprise / precision",
  calibration: "Calibration / instrumentation",
  assembly: "Assembly / orchestration",
  continuity: "Continuity / automation",
  closing: "Closing signature",
};

const sceneState = { current: "opening" };

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
}

function initializeReel() {
  const master = buildTimeline();

  updateScene("opening");
  updatePlaybackUI(false);
  updateTimecode(0, master.duration());

  startButton?.addEventListener("click", () => startReel(master));
  playToggle?.addEventListener("click", () => togglePlayback(master));
  restartButton?.addEventListener("click", () => restartReel(master));

  soundtrack?.addEventListener("ended", () => {
    master.pause(master.duration());
    updatePlaybackUI(false);
  });

  soundtrack?.addEventListener("error", () => {
    if (audioLabel) {
      audioLabel.textContent = "Soundtrack unavailable";
    }
  });
}

function buildTimeline() {
  const scenes = gsap.utils.toArray(".scene");
  gsap.set(scenes, { autoAlpha: 0 });
  gsap.set(".scene--opening", { autoAlpha: 1, visibility: "visible" });
  gsap.set(".hero-title__line, .scene-title__line, .closing-title span", { yPercent: 110 });
  gsap.set(
    ".hero-statement, .statement-panel, .marker-card, .calibration-copy .eyebrow, .closing-body, .closing-caption",
    { autoAlpha: 0, y: 24 }
  );
  gsap.set(".instrument-panel, .media-plate--portrait", { autoAlpha: 0, y: 30 });
  gsap.set(".instrument-panel__meter span", { scaleY: 0.15 });
  gsap.set(".signal", { scaleX: 0.08, autoAlpha: 0 });
  gsap.set(".board-readout", { autoAlpha: 0, y: 20 });
  gsap.set(".assembly-module", { autoAlpha: 0, y: 80, scale: 0.92 });
  gsap.set(".chain-node", { autoAlpha: 0, y: 22 });
  gsap.set(".chain-link", { autoAlpha: 0, y: 22, scaleX: 0.08 });
  gsap.set(".closing-panel", { autoAlpha: 0, scale: 0.98 });

  const master = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.inOut" },
    onUpdate: () => {
      const progress = master.progress() * 100;
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      updateTimecode(master.time(), master.duration());
    },
    onComplete: () => {
      updatePlaybackUI(false);
    },
  });

  const showScene = (sceneName) => {
    master.call(() => updateScene(sceneName));
    const selector = `.scene--${sceneName}`;
    master.set(selector, { autoAlpha: 1, visibility: "visible" });
  };

  const hideScene = (sceneName) => {
    master.to(`.scene--${sceneName}`, { autoAlpha: 0, duration: 0.8 }, "-=0.2");
  };

  showScene("opening");
  master
    .from(".scene--opening .scene__header", { autoAlpha: 0, y: -16, duration: 0.7 })
    .to(".scene--opening .hero-title__line", { yPercent: 0, duration: 1.2, stagger: 0.08 }, 0.1)
    .to(".scene--opening .hero-statement", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.45)
    .to(".scene--opening .instrument-panel", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.35)
    .to(".scene--opening .media-plate--portrait", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.55)
    .to(
      ".scene--opening .instrument-panel__meter span",
      { scaleY: 1, duration: 0.85, stagger: 0.05, ease: "power2.out" },
      0.55
    )
    .to(".scene--opening .hero-right", { y: -12, duration: 1.4, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.4)
    .to({}, { duration: 1.1 });

  hideScene("opening");

  showScene("statement");
  master
    .fromTo(".scene--statement .statement-panel", { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1 }, "+=0.05")
    .fromTo(".scene--statement .marker-card", { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, "-=0.55")
    .to(".scene--statement .statement-panel", { borderColor: "rgba(201, 168, 106, 0.34)", duration: 0.8 }, "-=0.45")
    .to({}, { duration: 0.9 });

  hideScene("statement");

  showScene("calibration");
  master
    .from(".scene--calibration .scene__header", { autoAlpha: 0, y: -18, duration: 0.7 }, "+=0.05")
    .to(".scene--calibration .scene-title__line", { yPercent: 0, duration: 1, stagger: 0.08 }, 0)
    .to(".scene--calibration .calibration-copy .eyebrow", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
    .fromTo(".scene--calibration .calibration-board", { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.9 }, 0.15)
    .to(".scene--calibration .signal", { autoAlpha: 1, scaleX: 1, duration: 0.9, stagger: 0.08, ease: "power2.out" }, 0.45)
    .to(".scene--calibration .board-readout", { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.8)
    .to(".scene--calibration .signal--mid", { scaleX: 0.72, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.55)
    .to(".scene--calibration .signal--narrow", { scaleX: 0.5, duration: 0.7, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.7)
    .to({}, { duration: 0.9 });

  hideScene("calibration");

  showScene("assembly");
  master
    .from(".scene--assembly .scene__header", { autoAlpha: 0, y: -18, duration: 0.7 }, "+=0.05")
    .fromTo(
      ".scene--assembly .assembly-stage",
      { clipPath: "inset(12% 8% 14% 8% round 30px)" },
      { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 1.1, ease: "power2.inOut" },
      0.08
    )
    .to(".scene--assembly .assembly-module", { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.15 }, 0.3)
    .to(".scene--assembly .assembly-module--a", { xPercent: 11, yPercent: 10, duration: 1 }, 1.2)
    .to(".scene--assembly .assembly-module--b", { xPercent: -12, yPercent: 14, duration: 1 }, 1.2)
    .to(".scene--assembly .assembly-module--c", { xPercent: 14, yPercent: -12, duration: 1 }, 1.38)
    .to(".scene--assembly .assembly-module--d", { xPercent: -14, yPercent: -16, duration: 1 }, 1.38)
    .to(".scene--assembly .assembly-module", { borderColor: "rgba(201, 168, 106, 0.42)", duration: 0.8, stagger: 0.08 }, 2.05)
    .to(".scene--assembly .assembly-stage__grid", { opacity: 0.46, duration: 0.8 }, 2.05)
    .to({}, { duration: 0.8 });

  hideScene("assembly");

  showScene("continuity");
  master
    .from(".scene--continuity .scene__header", { autoAlpha: 0, y: -18, duration: 0.7 }, "+=0.05")
    .to(".scene--continuity .scene-title__line", { yPercent: 0, duration: 1, stagger: 0.08 }, 0.05)
    .fromTo(".scene--continuity .eyebrow", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.2)
    .to(".scene--continuity .chain-node", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.18 }, 0.55)
    .to(".scene--continuity .chain-link", { autoAlpha: 1, y: 0, scaleX: 1, duration: 0.65, stagger: 0.16 }, 0.72)
    .to(".scene--continuity .chain-track", { xPercent: -2.5, duration: 1.1, ease: "sine.inOut" }, 1.7)
    .to(".scene--continuity .chain-track", { xPercent: 0, duration: 1.1, ease: "sine.inOut" }, 2.8)
    .to({}, { duration: 0.6 });

  hideScene("continuity");

  showScene("closing");
  master
    .from(".scene--closing .scene__header", { autoAlpha: 0, y: -18, duration: 0.7 }, "+=0.05")
    .to(".scene--closing .closing-panel", { autoAlpha: 1, scale: 1, duration: 0.9 }, 0.08)
    .to(".scene--closing .closing-title span", { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.18)
    .to(".scene--closing .closing-body", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.5)
    .to(".scene--closing .closing-caption", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.75)
    .to(".scene--closing", { filter: "brightness(1.08)", duration: 1.2 }, 1.5)
    .to(".scene--closing", { filter: "brightness(0.94)", duration: 1.2 }, 2.7)
    .to({}, { duration: 1.7 });

  return master;
}

async function startReel(master) {
  startOverlay?.setAttribute("hidden", "hidden");
  if (audioLabel) {
    audioLabel.textContent = "Soundtrack active";
  }

  if (soundtrack) {
    soundtrack.currentTime = 0;
    try {
      await soundtrack.play();
    } catch (error) {
      if (audioLabel) {
        audioLabel.textContent = "Soundtrack blocked";
      }
    }
  }

  master.restart(true);
  updatePlaybackUI(true);
}

function togglePlayback(master) {
  if (!master.isActive() && master.progress() === 0) {
    startReel(master);
    return;
  }

  if (master.paused()) {
    master.play();
    soundtrack?.play().catch(() => {
      if (audioLabel) {
        audioLabel.textContent = "Soundtrack blocked";
      }
    });
    updatePlaybackUI(true);
  } else {
    master.pause();
    soundtrack?.pause();
    updatePlaybackUI(false);
  }
}

function restartReel(master) {
  soundtrack?.pause();
  if (soundtrack) {
    soundtrack.currentTime = 0;
  }
  startReel(master);
}

function updatePlaybackUI(isPlaying) {
  if (playToggle) {
    playToggle.textContent = isPlaying ? "Pause" : "Play";
  }
}

function updateScene(sceneName) {
  sceneState.current = sceneName;
  if (sceneLabel) {
    sceneLabel.textContent = sceneNames[sceneName] || sceneName;
  }
}

function updateTimecode(currentSeconds, totalSeconds) {
  if (!timecode) {
    return;
  }

  const clamped = Math.max(0, Math.min(currentSeconds, totalSeconds));
  const minutes = String(Math.floor(clamped / 60)).padStart(2, "0");
  const seconds = String(Math.floor(clamped % 60)).padStart(2, "0");
  timecode.textContent = `${minutes}:${seconds}`;
}
