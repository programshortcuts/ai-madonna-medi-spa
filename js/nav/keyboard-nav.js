// letter-nav.js
import { letterNav } from "./letter-nav.js";
import { servicesSwiper } from "../visuals/swiper.js";
import { navMedSpaServ } from "./navMedSpaServ.js";
export function initKeydboardNav({ container = document } = {}) {
    let lastElClicked = null;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const index = Number(e.target.dataset.slide);
            if (!Number.isNaN(index)) {
                servicesSwiper.slideToLoop(index);
                if (e.target === lastElClicked) {
                    setTimeout(() => {
                        const activeSlide = document.querySelector(
                            '.services-swiper .swiper-slide-active'
                        );
                        activeSlide?.focus();
                    }, 50);
                }
            }

            lastElClicked = e.target;
        }
        
        letterNav({ container, e });

    });
    document.addEventListener('focusout', (e) => {
        lastElClicked = null
    })
    document.addEventListener('focusin', syncServiceFocusHighlight);
    document.addEventListener('focusout', () => {
        // small delay so focusin has time to re-apply if moving inside swiper
        setTimeout(syncServiceFocusHighlight, 0);
    });
}
function syncServiceFocusHighlight() {
    // clear all first
    document.querySelectorAll('.service-col-title.is-focused')
        .forEach(btn => btn.classList.remove('is-focused'));

    const active = document.activeElement;
    if (!active) return;

    // CASE 1: focus is on a service-column button
    const colBtn = active.closest('.service-col-title');
    if (colBtn) {
        colBtn.classList.add('is-focused');
        return;
    }

    // CASE 2: focus is inside a slide
    const slide = active.closest('.swiper-slide.service');
    if (!slide) return;

    const target = slide.dataset.navTarget;
    if (!target) return;

    const matchingBtn = document.querySelector(
        `.service-col-title[data-nav-target="${target.replace('-serv-home', '-col-home-link')}"]`
    );

    if (matchingBtn) {
        matchingBtn.classList.add('is-focused');
    }
}