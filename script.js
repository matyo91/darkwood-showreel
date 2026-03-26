gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const soundtrack = document.querySelector("[data-soundtrack]");
const audioToggle = document.querySelector("[data-audio-toggle]");
const audioState = document.querySelector("[data-audio-state]");

function updateAudioState(isPlaying, label) {
  if (!audioToggle || !audioState) {
    return;
  }

  audioToggle.setAttribute("aria-pressed", String(isPlaying));
  audioState.textContent = label;
}

if (audioToggle && soundtrack) {
  updateAudioState(false, "Ready");

  audioToggle.addEventListener("click", async () => {
    const hasSource = soundtrack.getAttribute("src");

    if (!hasSource) {
      updateAudioState(false, "Add track");
      return;
    }

    if (soundtrack.paused) {
      try {
        await soundtrack.play();
        updateAudioState(true, "On");
      } catch (error) {
        updateAudioState(false, "Blocked");
      }
    } else {
      soundtrack.pause();
      updateAudioState(false, "Off");
    }
  });

  soundtrack.addEventListener("error", () => {
    updateAudioState(false, "Add track");
  });
}

if (prefersReducedMotion) {
  document.documentElement.classList.add("reduced-motion");
} else {
  runMotionSystem();
}

async function hydratePlaylistNote() {
  try {
    const response = await fetch("playlist_tracks.json");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const label = data?.name ? `Playlist: ${data.name}` : "Soundtrack";
    if (audioToggle) {
      audioToggle.title = label;
    }
  } catch (error) {
    // Static fallback is enough when the JSON is not available.
  }
}

hydratePlaylistNote();

function runMotionSystem() {
  const introTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

  introTimeline
    .from(".topbar", { y: -20, autoAlpha: 0, duration: 0.8 })
    .from(".hero__frame", { scale: 0.985, autoAlpha: 0, duration: 1.1 }, 0.1)
    .from(".title-line", { yPercent: 110, duration: 1.1, stagger: 0.1 }, 0.15)
    .from(".reveal-line", { y: 20, autoAlpha: 0, duration: 0.7 }, 0.3)
    .from(".reveal-copy", { y: 34, autoAlpha: 0, duration: 0.9 }, 0.45)
    .from(".instrument-panel", { y: 24, autoAlpha: 0, duration: 0.9 }, 0.35)
    .from(".slot-card", { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.55)
    .from(
      ".instrument-panel__meter span",
      { scaleY: 0.15, transformOrigin: "bottom center", duration: 0.9, stagger: 0.05 },
      0.5
    );

  gsap.to("[data-float]", {
    yPercent: -4,
    duration: 3.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: 0.4,
  });

  gsap.utils.toArray(".chapter").forEach((section) => {
    const title = section.querySelector(".reveal-up");
    const copy = section.querySelector(".reveal-copy");
    const fragments = section.querySelectorAll(".fragment");
    const nodes = section.querySelectorAll(".chain-node, .chain-link");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
      },
    });

    if (title) {
      tl.fromTo(title, { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0);
    }

    if (copy) {
      tl.fromTo(copy, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.15);
    }

    if (fragments.length) {
      tl.to(fragments, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12 }, 0.25);
    }

    if (nodes.length) {
      tl.to(nodes, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12 }, 0.2);
    }
  });

  const modules = gsap.utils.toArray("[data-module]");
  const assemblyTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".assembly",
      start: "top top",
      end: "+=1400",
      scrub: 0.8,
      pin: ".assembly__sticky",
    },
  });

  assemblyTimeline
    .fromTo(
      ".assembly-stage",
      { clipPath: "inset(14% 8% 18% 8% round 34px)" },
      { clipPath: "inset(0% 0% 0% 0% round 34px)", duration: 1.2, ease: "power2.inOut" }
    )
    .fromTo(
      modules,
      { y: 110, autoAlpha: 0, scale: 0.92 },
      { y: 0, autoAlpha: 1, scale: 1, stagger: 0.18, duration: 1 },
      0.18
    )
    .to(".assembly-module--a", { xPercent: 12, yPercent: 10, duration: 1 }, 1.4)
    .to(".assembly-module--b", { xPercent: -12, yPercent: 16, duration: 1 }, 1.4)
    .to(".assembly-module--c", { xPercent: 14, yPercent: -12, duration: 1 }, 1.6)
    .to(".assembly-module--d", { xPercent: -14, yPercent: -16, duration: 1 }, 1.6)
    .to(
      modules,
      {
        borderColor: "rgba(201, 168, 106, 0.44)",
        boxShadow: "0 20px 80px rgba(0, 0, 0, 0.28)",
        duration: 0.8,
        stagger: 0.08,
      },
      2.2
    )
    .to(".assembly-stage__grid", { opacity: 0.48, duration: 0.8 }, 2.2);

  gsap.timeline({
    scrollTrigger: {
      trigger: ".signature",
      start: "top 72%",
    },
  })
    .to(".signature__inner", { autoAlpha: 1, y: 0, duration: 0.8 })
    .from(".signature__title span", { yPercent: 110, duration: 1, stagger: 0.12 }, 0.1)
    .from(".signature__body, .signature__footer, .signature__kicker", { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.3);
}
