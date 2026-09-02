// video-controls.js

const CONTROL_HIDE_DELAY = 2500;
let outsidePointerListenerBound = false;

export function initAllVideos(root = document) {
    bindOutsidePointerListener();
    root.querySelectorAll('.service-section').forEach(bindVideoControls);
}

function bindOutsidePointerListener() {
    if (outsidePointerListenerBound) return;

    // Preserve the existing click-away behavior without registering a duplicate
    // listener every time a page fragment is injected.
    document.addEventListener('pointerdown', (event) => {
        if (!event.target.closest('video')) {
            hideAllVideoControls();
        }
    });

    outsidePointerListenerBound = true;
}

function hideAllVideoControls(root = document) {
    root.querySelectorAll('video').forEach((video) => {
        video.controls = false;
    });
}

function bindVideoControls(section) {
    section.tabIndex = 0;
    getSectionVideos(section).forEach(bindVideo);

    bindSectionDetailsPlayPause(section);

    // Keyboard events remain scoped to their service section. The focused
    // element determines the video rather than the section's first video.
    if (section.dataset.videoKeyboardBound === 'true') return;
    section.dataset.videoKeyboardBound = 'true';

    section.addEventListener('keydown', (event) => {
        if (event.target.closest('.vid-cntrl-btns, .playbtn, .fwdBtn, .rwdBtn')) {
            return;
        }

        const control = event.target.closest('[data-video-target]');
        const video = getTargetVideo(section, control);

        if (!video || shouldLeaveKeyboardEventAlone(event.target, control)) {
            return;
        }

        if (event.key === ' ' || event.code === 'Space') {
            event.preventDefault();
            togglePlay(video);
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            seekVideo(video, -5);
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            seekVideo(video, 5);
        }
    });
}

function bindSectionDetailsPlayPause(section) {
    const details = section.querySelector('.section-details');

    if (!details || details.dataset.videoPlayPauseBound === 'true') {
        return;
    }

    details.dataset.videoPlayPauseBound = 'true';

    const getDetailsVideo = () => {
        const videos = getSectionVideos(section);

        // Preserve the existing single-video behavior.
        if (videos.length === 1) {
            return videos[0];
        }

        // If this section has multiple videos, use the existing
        // data-video-target relationship when available.
        const targetId = details.dataset.videoTarget;

        if (targetId) {
            return videos.find(
                (video) => video.dataset.videoId === targetId
            ) || null;
        }

        return null;
    };

    details.addEventListener('click', (event) => {
        // Clicking More Info should continue doing exactly what it
        // currently does and should NOT toggle the video.
        if (event.target.closest('.more-info-link')) {
            return;
        }

        const video = getDetailsVideo();

        if (video) {
            togglePlay(video);
        }
    });

    details.addEventListener('keydown', (event) => {
        // Do not interfere with the More Info link.
        if (event.target.closest('.more-info-link')) {
            return;
        }

        console.log('here')
        if (event.key === 'Enter' || event.code === 'Space') {
            event.preventDefault();

            const video = getDetailsVideo();

            if (video) {
                togglePlay(video);
            }
        }
    });
}
function getSectionVideos(section) {
    // A nested service section owns its own videos.
    return [...section.querySelectorAll('video')].filter(
        (video) => video.closest('.service-section') === section
    );
}

function bindVideo(video) {
    if (video.dataset.videoControlsBound === 'true') return;
    video.dataset.videoControlsBound = 'true';
    video.controls = false;

    const showControls = () => {
        video.controls = true;
        clearTimeout(video.hideControlsTimer);

        video.hideControlsTimer = setTimeout(() => {
            if (!video.paused) {
                video.controls = false;
            }
        }, CONTROL_HIDE_DELAY);
    };

    video.addEventListener('click', showControls);
    video.addEventListener('pointerenter', showControls);
    video.addEventListener('play', showControls);
    video.addEventListener('play', () => pauseAllVideos(document, video));
    video.addEventListener('ended', () => resetVideoToPoster(video));
}

function getTargetVideo(section, control) {
    const videos = getSectionVideos(section);
    const targetId = control?.dataset.videoTarget;

    if (targetId) {
        return videos.find((video) => video.dataset.videoId === targetId) || null;
    }

    // Existing single-video sections remain keyboard controllable without
    // additional markup. Multiple-video sections must opt into an explicit ID.
    return videos.length === 1 ? videos[0] : null;
}

function shouldLeaveKeyboardEventAlone(element, explicitTarget) {
    if (explicitTarget) return false;

    return Boolean(element.closest(
        'button, a, input, select, textarea, [contenteditable="true"]'
    ));
}

function seekVideo(video, seconds) {
    const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
}

function togglePlay(video) {
    if (video.paused) {
        video.play().catch((error) => console.log(error));
    } else {
        video.pause();
    }
}

function resetVideoToPoster(video) {
    if (!video) return;

    try {
        video.pause();
        video.currentTime = 0;
    } catch (error) {
        console.warn(error);
    }
}

export function pauseAllVideos(root = document, keepVideo = null) {
    root.querySelectorAll('video').forEach((video) => {
        if (video !== keepVideo) {
            resetVideoToPoster(video);
        }
    });
}
