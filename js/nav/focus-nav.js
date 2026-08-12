// focus-nav.js
export function focusNav({e,target}){
    
    const slide = target.el.closest('.swiper-slide');

    if (slide) {
        // Element is inside a Swiper slide — let Swiper handle centering
        const swiperEl = slide.closest('.swiper');
        const swiper = swiperEl?.swiper;

        if (swiper) {
            const targetIndex = swiper.slides.indexOf(slide);
            if (targetIndex !== -1) {
                // Focus without triggering browser scroll
                target.el.focus({ preventScroll: true });
                // Move Swiper to the slide and let it center
                swiper.slideTo(targetIndex, 300);
                swiper.update();
            }
        } else {
            // No Swiper instance — fall back to normal scroll
            target.el.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
                // inline: 'start'
            });
        }
    } else {
        // Not inside a Swiper slide — use normal scroll
        target.el.focus();

        if (target.el.classList.contains('service-title')) {
            target.el.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
                // inline: 'center'
            });
        } else {
            target.el.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }
}