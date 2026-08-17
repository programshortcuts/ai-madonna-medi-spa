// js/visuals/swiper.js
let reviewsSwiper = null;
let clickedServiceSlide = null
export function initReviewsSwiper() {
    const el = document.querySelector('.reviews-swiper');
    if (!el || typeof Swiper === 'undefined') return;
    
    if (reviewsSwiper) reviewsSwiper.destroy(true, true);

    reviewsSwiper = new Swiper(el, {
        slidesPerView: 1,
        loop: true,
        speed: 700,

        grabCursor: true,
        allowTouchMove: true,

        threshold: 10,

        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        }
    });

}
// FILE: js/visuals/swiper.js

