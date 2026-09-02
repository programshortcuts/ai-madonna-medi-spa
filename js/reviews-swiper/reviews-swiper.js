// js/reviews-swiper/swiper.js

let reviewsSwiper = null;

export function initReviewsSwiper() {
    const el = document.querySelector('.reviews-swiper');

    if (!el || typeof Swiper === 'undefined') return;

    const slides = el.querySelectorAll('.swiper-slide');

    // The medical-spa-services page is injected dynamically.
    // Don't initialize until the review slides actually exist.
    if (slides.length < 2) {
        return;
    }

    if (reviewsSwiper) {
        reviewsSwiper.destroy(true, true);
        reviewsSwiper = null;
    }

    reviewsSwiper = new Swiper(el, {
        slidesPerView: 1,
        slidesPerGroup: 1,

        loop: true,

        speed: 1000,

        grabCursor: true,
        allowTouchMove: true,
        threshold: 10,

        autoplay: {
            delay: 2200,
            disableOnInteraction: false
        }
    });
}