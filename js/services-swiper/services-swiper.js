// services-swipers/services-swipers.js
import { initDropDown } from "../ui/drop-down.js";
export let servicesSwiper = null;

export function initServicesSwiper() {
    initDropDown()
    const el = document.querySelector('.services-swiper');
    if (!el || typeof Swiper === 'undefined') return;
    const slides = el.querySelectorAll('.services-swiper .swiper-slide:not(.swiper-slide-duplicate)')
    slides.forEach(el => {
        el.addEventListener('focusin', e => {
            const swiperWrapper = el.closest('.swiper-wrapper')
            swiperWrapper.scrollIntoView({behavior:'instant', block:'nearest', inline: 'start'})
        })
    })
    if (servicesSwiper) servicesSwiper.destroy(true, true);
    let shouldFocusSlide = false;
    let initialLoad = true;
    servicesSwiper = new Swiper(el, {
        loop: true,
    
        speed: 500,
    
        centeredSlides: true,
        slidesPerView: 'auto',
        spaceBetween: 0,
    
        grabCursor: true,
        allowTouchMove: true,
    
        threshold: 5,
    
        freeMode: {
            enabled: true,
            momentum: true,
            momentumRatio: 0.8,
            momentumVelocityRatio: 0.8,
            momentumBounce: true,
            momentumBounceRatio: 0.5,
            sticky: true
        },
    
        keyboard: {
            enabled: true,
            onlyInViewport: true
        }
    });
    
    
    // ADD THIS HERE
    const serviceSlideCount =
        Math.max(
            ...Array.from(servicesSwiper.slides)
                .map(slide => Number(slide.dataset.swiperSlideIndex))
                .filter(Number.isFinite)
        ) + 1;
    
    

    let serviceSpin = {
        active: false,
        startX: 0,
        startTime: 0,
    
        // The slide that was active when the drag began.
        startRealIndex: 0,
    
        releaseIndex: 0,
        continuationPending: false,
        momentumTimer: null,
        momentumSteps: 0,
        momentumStepIndex: 0,
        momentumDirection: 4,
        momentumVelocity: 0,
        momentumRatio: 0,
        stepDurations: null,
        ignoreNextClick: false,
    };

    function clearServiceSpin() {
        if (serviceSpin.momentumTimer) {
            clearTimeout(serviceSpin.momentumTimer);
            serviceSpin.momentumTimer = null;
        }
        serviceSpin.active = false;
        serviceSpin.releaseIndex = 0;
        serviceSpin.continuationPending = false;
        serviceSpin.momentumSteps = 0;
        serviceSpin.momentumStepIndex = 0;
        serviceSpin.momentumVelocity = 0;
        serviceSpin.momentumRatio = 0;
        serviceSpin.stepDurations = null;
        serviceSpin.ignoreNextClick = false;
    }

    function stopServiceMotion() {
        if (!servicesSwiper) return;
        clearServiceSpin();

        if (servicesSwiper.animating) {
            try {
                const current = typeof servicesSwiper.realIndex === 'number'
                    ? servicesSwiper.realIndex
                    : servicesSwiper.activeIndex;
                if (servicesSwiper.slideToLoop) {
                    servicesSwiper.slideToLoop(current, 0);
                } else {
                    servicesSwiper.slideTo(current, 0);
                }
            } catch (e) {
                // ignore
            }
        }
    }

    function cancelServiceSpin() {
        stopServiceMotion();
        if (servicesSwiper && servicesSwiper.autoplay) {
            try { servicesSwiper.autoplay.stop(); } catch (e) {}
        }
    }

    function isInteractiveTarget(ev) {
        return ev && ev.target && ev.target.closest && ev.target.closest('button, a, input, textarea, select, [data-no-click]');
    }



function getMomentumStepsToStart(currentIndex, startIndex, direction) {

    if (!serviceSlideCount || serviceSlideCount <= 1) {
        return 0;
    }

    let steps;

    if (direction > 0) {

        // Moving forward:
        //
        // Start:   2
        // Current: 3
        //
        // 3 → 4 → 5 → 0 → 1 → 2
        //
        // Final slide is exactly the slide where we started.

        steps =
            (startIndex - currentIndex + serviceSlideCount)
            % serviceSlideCount;

    } else {

        // Moving backward:
        //
        // Start:   2
        // Current: 1
        //
        // 1 → 0 → 5 → 4 → 3 → 2
        //
        // Final slide is exactly the slide where we started.

        steps =
            (currentIndex - startIndex + serviceSlideCount)
            % serviceSlideCount;
    }

    /*
     * If we're already back on the starting slide,
     * make one complete loop instead of stopping immediately.
     *
     * This gives the wheel-like "keeps rolling" effect.
     */
    if (steps === 0) {
        steps = serviceSlideCount;
    }

    return steps;
}



    function handleServiceGestureStart(clientX, ev) {
        if (isInteractiveTarget(ev)) return false;
        if (!servicesSwiper) return false;

        serviceSpin.active = true;
        serviceSpin.startX = clientX;
        serviceSpin.startTime = (ev && ev.timeStamp) || Date.now();
        serviceSpin.startRealIndex = typeof servicesSwiper.realIndex === 'number'
            ? servicesSwiper.realIndex
            : servicesSwiper.activeIndex;

        stopServiceMotion();
        return true;
    }


function getMomentumDurations(steps, velocity, ratio) {

    /*
     * The normal Swiper drag remains completely untouched:
     *
     *     speed: 300
     *
     * These durations ONLY control the momentum AFTER
     * the user's release.
     *
     * The first continuation is close to normal speed,
     * then every slide progressively takes longer.
     */

    const durations = [];

    for (let i = 0; i < steps; i++) {

        /*
         * Gradual deceleration.
         *
         * 0 = 300ms
         * 1 = 400ms
         * 2 = 525ms
         * 3 = 675ms
         * 4 = 850ms
         * 5 = 1050ms
         * etc.
         *
         * This gives the "wheel losing energy" effect.
         */

        const duration =
            300 +
            Math.round(
                (i * i * 22) +
                (i * 70)
            );

        durations.push(duration);
    }

    return durations;
}




    
function runServiceMomentumStep() {
    if (!servicesSwiper) {
        clearServiceSpin();
        return;
    }

    if (serviceSpin.momentumStepIndex >= serviceSpin.momentumSteps) {
        clearServiceSpin();
        return;
    }

    const durations = serviceSpin.stepDurations ||
        getMomentumDurations(
            serviceSpin.momentumSteps,
            serviceSpin.momentumVelocity,
            serviceSpin.momentumRatio
        );

    const duration = durations[
        Math.min(
            durations.length - 1,
            serviceSpin.momentumStepIndex
        )
    ];

    /*
     * Read where Swiper is RIGHT NOW.
     *
     * This is critical because the normal drag determines
     * the actual starting point of the momentum.
     */
    const currentIndex =
        typeof servicesSwiper.realIndex === 'number'
            ? servicesSwiper.realIndex
            : servicesSwiper.activeIndex;

    const targetIndex =
        currentIndex + serviceSpin.momentumDirection;

    /*
     * Mark that this transition belongs to our
     * momentum sequence.
     */
    serviceSpin.continuationPending = true;

    serviceSpin.momentumStepIndex += 1;

    try {
        if (servicesSwiper.slideToLoop) {
            servicesSwiper.slideToLoop(
                targetIndex,
                duration
            );
        } else {
            servicesSwiper.slideTo(
                targetIndex,
                duration
            );
        }
    } catch (e) {
        clearServiceSpin();
    }
}


    
function handleServiceGestureEnd(clientX, ev) {

    if (!serviceSpin.active || !servicesSwiper) return;

    serviceSpin.active = false;

    const endTime =
        (ev && ev.timeStamp) || Date.now();

    const deltaX =
        clientX - serviceSpin.startX;

    const absDelta =
        Math.abs(deltaX);

    const width =
        el.clientWidth ||
        el.getBoundingClientRect().width ||
        1;

    const ratio =
        absDelta / width;

    const duration =
        Math.max(
            1,
            endTime - serviceSpin.startTime
        );

    /*
     * Ignore small clicks/taps.
     */
    const isLargeSwipe =
        ratio >= 0.20 &&
        duration > 80;

    if (!isLargeSwipe) {
        return;
    }

    /*
     * Direction of the user's swipe.
     */
    const direction =
        deltaX > 0 ? -1 : 1;

const velocity =
    absDelta / duration;

clearServiceSpin();

serviceSpin.active = true;

serviceSpin.momentumDirection =
    direction;

serviceSpin.momentumVelocity =
    velocity;

serviceSpin.momentumRatio =
    ratio;

/*
 * IMPORTANT:
const currentIndex =
    typeof servicesSwiper.realIndex === 'number'
        ? servicesSwiper.realIndex
        : servicesSwiper.activeIndex;

/*
 * Calculate the exact number of additional slides
 * required to return to the slide that was active
 * when the drag began.
 */
const momentumSteps = getMomentumStepsToStart(
    currentIndex,
    serviceSpin.startRealIndex,
    direction
);


serviceSpin.momentumDirection = direction;
serviceSpin.momentumVelocity = velocity;
serviceSpin.momentumRatio = ratio;

serviceSpin.momentumSteps = momentumSteps;
serviceSpin.momentumStepIndex = 0;

serviceSpin.stepDurations =
    getMomentumDurations(
        momentumSteps,
        velocity,
        ratio
    );

    /*
     * The normal Swiper drag is still animating.
     *
     * Wait until slideChangeTransitionEnd().
     *
     * At that exact moment runServiceMomentumStep()
     * reads servicesSwiper.realIndex and continues
     * from the slide Swiper actually landed on.
     */
    serviceSpin.continuationPending =
        !!servicesSwiper.animating;

    /*
     * Prevent the synthetic click generated by the drag
     * from being treated as a normal slide click.
     */
    serviceSpin.ignoreNextClick = true;

    /*
     * If Swiper isn't animating anymore, start the momentum
     * directly from the current slide.
     */
    if (!servicesSwiper.animating) {

        serviceSpin.continuationPending =
            false;

        serviceSpin.momentumTimer =
            setTimeout(
                () => runServiceMomentumStep(),
                30
            );
    }
}


function pointerDownHandler(ev) {
    stopServiceMotion();

    handleServiceGestureStart(ev.clientX, ev);

    if (ev.currentTarget.setPointerCapture) {
        try {
            ev.currentTarget.setPointerCapture(ev.pointerId);
        } catch (e) {}
    }
}

function pointerUpHandler(ev) {
    handleServiceGestureEnd(ev.clientX, ev);

    if (ev.currentTarget.releasePointerCapture) {
        try {
            ev.currentTarget.releasePointerCapture(ev.pointerId);
        } catch (e) {}
    }
}

    ///****** */

    el.addEventListener('pointerdown', pointerDownHandler);
    el.addEventListener('pointerup', pointerUpHandler);
    el.addEventListener('pointercancel', pointerUpHandler);

    // Allow clicking on slides to navigate directly to the clicked slide and then focus it.
    el.addEventListener('click', (e) => {
        if (serviceSpin.ignoreNextClick) {
            serviceSpin.ignoreNextClick = false;
        } else {
            cancelServiceSpin();
        }

        const target = e.target instanceof Element ? e.target : e.target.parentElement;
        const slide = target?.closest('.swiper-slide');
        if (!slide) return;

        const content = slide.querySelector('.content');
        const serviceTitleButton = target.closest('.service-title');
        const isTitleTextClick = !!target.closest('.title-text');

        servicesSwiper.autoplay.stop();

        const clickedIndex = Number(slide.dataset.swiperSlideIndex ?? servicesSwiper.slides.indexOf(slide));
        const activeSlideIndex = typeof servicesSwiper.realIndex === 'number'
            ? servicesSwiper.realIndex
            : servicesSwiper.activeIndex;

        // If the click originated from a nested interactive element (other than the service title), ignore it
        if (target.closest('button, a, [data-no-click]') && !serviceTitleButton) return;

        // If click was on the service-title button, do not toggle content here (drop-down.js manages it).
        if (serviceTitleButton) {
            if (!servicesSwiper.slides.includes(slide)) return;
            if (Number.isNaN(clickedIndex)) return;

            if (clickedIndex !== activeSlideIndex) {
                shouldFocusSlide = true;
                if (servicesSwiper.slideToLoop) {
                    servicesSwiper.slideToLoop(clickedIndex);
                } else {
                    servicesSwiper.slideTo(clickedIndex);
                }

                // After the slide transition, ensure the slide is focused and vertically centered
                setTimeout(() => {
                    const active = servicesSwiper.slides[servicesSwiper.activeIndex];
                    if (active) {
                        try { active.focus({ preventScroll: true }); } catch (e) {}
                        try { active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (e) {}
                    }
                }, 350);
            } else {
                try { slide.focus({ preventScroll: true }); } catch (e) {}
                try { slide.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (e) {}
            }

            return;
        }

        // Clicking the title-text (when not inside the button) or the slide background toggles content and ensures the slide becomes active
        if (isTitleTextClick || target === slide) {
            if (content) {
                content.classList.toggle('hide');
            }

            if (!servicesSwiper.slides.includes(slide)) return;
            if (Number.isNaN(clickedIndex)) return;

            if (clickedIndex !== activeSlideIndex) {
                shouldFocusSlide = true;
                if (servicesSwiper.slideToLoop) {
                    servicesSwiper.slideToLoop(clickedIndex);
                } else {
                    servicesSwiper.slideTo(clickedIndex);
                }

                // Focus and vertically center after transition
                setTimeout(() => {
                    const active = servicesSwiper.slides[servicesSwiper.activeIndex];
                    if (active) {
                        try { active.focus({ preventScroll: true }); } catch (e) {}
                        try { active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (e) {}
                    }
                }, 350);
            } else {
                try { slide.focus({ preventScroll: true }); } catch (e) {}
                try { slide.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (e) {}
            }

            return;
        }

        // Fallback: if click was on slide but not title (handled above), ensure we navigate to it
        if (!servicesSwiper.slides.includes(slide)) return;
        if (Number.isNaN(clickedIndex)) return;

        if (clickedIndex === activeSlideIndex) {
            try { slide.focus({ preventScroll: true }); } catch (e) {}
            try { slide.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (e) {}
            return;
        }

        shouldFocusSlide = true;
        if (servicesSwiper.slideToLoop) {
            servicesSwiper.slideToLoop(clickedIndex);
        } else {
            servicesSwiper.slideTo(clickedIndex);
        }
    });
   

    el.addEventListener('keydown', (e) => {
        // Stop autoplay for any keyboard interaction inside the services swiper
        servicesSwiper.autoplay.stop();
        const key = (e.key || '').toLowerCase();

        // If Arrow navigation (left/right) is used while focus is inside the swiper,
        // mark shouldFocusSlide so slideChangeTransitionEnd will focus the active slide.
        if (key === 'arrowleft' || key === 'arrowright') {
            if (el.contains(e.target)) {
                shouldFocusSlide = true;
            }
            return; // allow Swiper to handle the navigation
        }

        if (key === 'enter') {
            if(e.target === clickedServiceSlide) {
                const serviceTitle = e.target.querySelector('.service-title');
                serviceTitle.focus()
                serviceTitle.click()
                return
            }
            const slide = e.target.closest('.swiper-slide');

            if (!slide || !servicesSwiper.slides.includes(slide)) return;
            if(e.target == slide){
                slide.querySelector('.service-title').focus()
                return

            }
            // Don't navigate if the key event originated from a nested interactive element
            if (e.target.closest('button, a, [data-no-click]')) return;

            const clickedIndex = Number(slide.dataset.swiperSlideIndex ?? servicesSwiper.slides.indexOf(slide));
            const activeSlideIndex = typeof servicesSwiper.realIndex === 'number'
                ? servicesSwiper.realIndex
                : servicesSwiper.activeIndex;

            if (Number.isNaN(clickedIndex)) return;
            // if (clickedIndex === activeSlideIndex) {
            //     // Already active — ensure focus and vertical visibility
            //     try { slide.focus(); } catch (e) {}
            //     try {
            //         // slide.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            //     } catch (err) {
            //         // fallback: no-op
            //     }
            //     return;
            // }
            shouldFocusSlide = true;
            // Ensure vertical scroll to center the slide in viewport while letting Swiper manage horizontal centering
            try {
                slide.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            } catch (err) {
                // ignore
            }
            if (servicesSwiper.slideToLoop) {
                servicesSwiper.slideToLoop(clickedIndex);
            } else {
                servicesSwiper.slideTo(clickedIndex);
            }
            clickedServiceSlide = e.target;
        }
    });
    
    return servicesSwiper; // ✅ CRITICAL ADDITION
}
export function initServiceNavController(swiperInstance) {
    const buttons = document.querySelectorAll('.service-col-title');
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault()
            const index = Number(btn.dataset.slide);
            if (Number.isNaN(index)) return;

            // IMPORTANT:
            // Use loop-safe method when available
            if (swiperInstance.slideToLoop) {
                swiperInstance.slideToLoop(index);
            } else {
                swiperInstance.slideTo(index);
            }

            // After navigation, ensure the active slide is focused (no vertical centering on click)
            setTimeout(() => {
                const active = swiperInstance.slides?.[swiperInstance.activeIndex];
                if (active) {
                    try { active.focus({ preventScroll: true }); } catch (e) {}
                    // Intentionally do NOT call scrollIntoView here for click — keep view unchanged
                }
            }, 250);

            // 🚫 DO NOT:
            // - focus() (handled above with preventScroll)
            // - scrollIntoView() (handled intentionally elsewhere)
            // - activeElement manipulation
        });
        btn.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase()
            if (key == 'enter') {
                const index = Number(btn.dataset.slide);
                
                if (Number.isNaN(index)) return;

                // IMPORTANT:
                // Use loop-safe method when available
                if (swiperInstance.slideToLoop) {
                    swiperInstance.slideToLoop(index);
                } else {
                    swiperInstance.slideTo(index);
                }

                // After navigation, ensure the active slide is focused and vertically centered
                setTimeout(() => {
                    const active = swiperInstance.slides?.[swiperInstance.activeIndex];
                    if (active) {
                        try { active.focus({ preventScroll: true }); } catch (e) {}
                        try { active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (e) {}
                    }
                }, 350);

                // 🚫 DO NOT:
                // - focus()
                // - scrollIntoView()
                // - activeElement manipulation
            }
        });
    });
}


function syncServiceButton(swiper) {

    // Remove previous highlight
    document
        .querySelectorAll('.service-col-title')
        .forEach(btn => btn.classList.remove('is-focused'));

    
    // Current active slide
    const slide = swiper.slides[swiper.activeIndex];
    if (!slide) return;

    const target = slide.dataset.navTarget;
    if (!target) return;

    // Find matching button
    const btn = document.querySelector(
        `.service-col-title[data-nav-target="${target.replace('-serv-home', '-col-home-link')}"]`
    );

    btn?.classList.add('is-focused');
}