export function initBgSlider() {
    const container = document.querySelector('.bg-slider');
    if (!container) return;

    const slides = Array.from(container.querySelectorAll('.bg-slide'));
    if (!slides.length) return;

    const images = [
        'imgs/home-page-header/nature-bg.png',
        'imgs/home-page-header/woman-man.png',
        'imgs/home-page-header/lady-med-spa.png',
    ];

    slides.forEach((slide, index) => {
        slide.style.backgroundImage = `url(${images[index % images.length]})`;
    });

    let current = 0;
    slides.forEach((slide, index) => slide.classList.toggle('active', index === current));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.clearInterval(container.backgroundSliderTimer);
    container.backgroundSliderTimer = window.setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 3400);
}
