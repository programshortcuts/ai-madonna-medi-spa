// video-controls.js -web-dev-simp-repo
/* =========================
   VIDEO CONTROLS (CLEAN SYSTEM)
========================= */

export function initAllVideos(root = document) {
    const sections = root.querySelectorAll('.service-section');


    // Hide controls when interacting anywhere except videos
    document.addEventListener("pointerdown", (e) => {

        if (e.target.closest("video")) {
            return;
        }

        hideAllVideoControls();

    });

    sections.forEach(bindVideoControls);
}

function hideAllVideoControls() {
    document.querySelectorAll("video").forEach(video => {
        video.controls = false;
        // if (!video.paused) {
        // }
    });
}
function bindVideoControls(step) {
    step.tabIndex = 0;

    const vid = step.querySelector('video');

    if (!vid) return;

    vid.controls = false;

    const showControls = () => {
        vid.controls = true;

        clearTimeout(vid.hideControlsTimer);

        vid.hideControlsTimer = setTimeout(() => {
            if (!vid.paused) {
                vid.controls = false;
            }
        }, 2500);
    };


    vid.addEventListener("click", showControls);
    vid.addEventListener("pointerenter", showControls);
    // vid.addEventListener("pointermove", showControls);
    vid.addEventListener("play", showControls);

    // prevent double binding
    if (step.dataset.videoBound === 'true') return;
    step.dataset.videoBound = 'true';

    const playBtn = step.querySelector('.playbtn');
    const fwdBtn = step.querySelector('.fwdBtn');
    const rwdBtn = step.querySelector('.rwdBtn');

    vid.addEventListener('ended', () => {
        resetVideoToPoster(vid);
    });

    vid.addEventListener('play', () => {
        pauseAllVideos(document, vid);
    });

    /* =========================
       PLAY / PAUSE
    ========================= */

    /* =========================
       KEYBOARD CONTROLS (STEP ONLY)
    ========================= */
    step.addEventListener('keydown', (e) => {

        if (
            e.target.closest('.vid-cntrl-btns, .playbtn, .fwdBtn, .rwdBtn')
        ) {
            return;
        }

        const key = e.key.toLowerCase();

        // SPACE = play / pause
        if (key === ' ') {
            e.preventDefault();

            togglePlay(vid);
            return;
        }


        // LEFT ARROW = rewind
        if (e.key === "ArrowLeft") {
            e.preventDefault();

            vid.currentTime = Math.max(
                0,
                vid.currentTime - 5
            );

            return;
        }


        // RIGHT ARROW = fast forward
        if (e.key === "ArrowRight") {
            e.preventDefault();

            vid.currentTime = Math.min(
                vid.duration || Infinity,
                vid.currentTime + 5
            );

            return;
        }
    });
}

/* =========================
   HELPERS
========================= */

function togglePlay(vid) {
    if (vid.paused) {
        vid.play().catch(err => console.log(err));
    } else {
        vid.pause();
    }
}


function resetVideoToPoster(vid) {
    if (!vid) return;

    try {
        vid.pause();
        vid.currentTime = 0;
    } catch (error) {
        console.warn(error);
    }
}
// function ensurePosterAtStart(vid, btn) {
//     if (!vid || vid.dataset.posterResetting === 'true') return;

//     if (vid.paused && vid.currentTime <= 0.05 && !vid.ended) {
//         vid.dataset.posterResetting = 'true';
//         resetVideoToPoster(vid);

//         setTimeout(() => {
//             delete vid.dataset.posterResetting;
//         }, 100);
//     }
// }

/* =========================
   GLOBAL SAFETY PAUSE
========================= */

export function pauseAllVideos(root = document, keepVideo = null) {
    const vids = root.querySelectorAll('video');

    vids.forEach((vid) => {
        if (vid === keepVideo) {
            return;
        }

        resetVideoToPoster(vid);

        const step = vid.closest('.section');
        const btn = step?.querySelector('.playbtn');

    });
}