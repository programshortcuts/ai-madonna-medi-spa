// drop-down-home.js
import { pauseAllVideos } from "../video/video-controls.js";
// import { servicesSwiper } from "../visuals/swiper.js";

export function initDropDownHome() {
    // Only initialize on the home page
    const homeContainer = document.querySelector('.page-container.home-page-container');
    if (!homeContainer) return;
    const slideContents = homeContainer.querySelectorAll('.swiper-slide .content')
    slideContents.forEach(el => {
        el.classList.add('hide')
    })
    let lastClickedDrop;

    const dropDowns = homeContainer.querySelectorAll('.drop-down');

    // Attach listeners to dropdowns (click) but scoped to home container
    dropDowns.forEach(el => {
        // Prevent stacking handlers
        el.removeEventListener('click', toggleContent);
        el.addEventListener('click', toggleContent);
    });

    function toggleContent(e) {
        e.preventDefault();
        if (e.type === 'click') {
            clickHandler(e);
            return;
        }
        if (e.type === 'keydown') {
            keydownHandler(e);
            return;
        }
        console.log(e.target);
        
    }

    function clickHandler(e) {
        const serviceSwiperDropDown = e.target.closest('.service-title.drop-down');

        if (serviceSwiperDropDown) {
            const service = serviceSwiperDropDown.closest('.service');
            if (!service) return;
            const downs = service.querySelector('.downs');
            if (!downs) return;

            // Toggle the downs content first
            downs.classList.toggle('hide');

            // Find the main "Our Services" section title to match its height when collapsing
            const sectionTitle = document.querySelector('button.section-title[data-nav-target="our-services"]') || document.querySelector('header#ourServiceHomePage .section-title');
            const titleHeight = sectionTitle ? Math.ceil(sectionTitle.getBoundingClientRect().height) : 0;

            // If the content was just hidden, collapse the service container to the section title height.
            // If the content is shown, clear the explicit height to allow natural sizing.
            if (downs.classList.contains('hide')) {
                // Apply explicit height so the slide collapses to the title height
                service.style.height = titleHeight ? `${titleHeight}px` : '';
            } else {
                // Remove explicit height so it returns to normal size
                service.style.height = '';
            }
            
            lastClickedDrop = e.target;
            return;
        }

        // If click reaches here, no known handler
    }

    function keydownHandler(e) {
        const key = e.key.toLowerCase();
        const serviceTitle = e.target.closest('.service-title.drop-down');
        if (serviceTitle && (key === 'enter' || key === ' ')) {
            const service = serviceTitle.closest('.service');
            if (!service) return;
            const currentDown = service.querySelector('.content.downs') || service.querySelector('.downs');
            if (!currentDown) return;

            // Hide other service contents
            homeContainer.querySelectorAll('.service .content.downs, .service .downs').forEach(el => {
                if (el !== currentDown) el.classList.add('hide');
            });

            currentDown.classList.toggle('hide');

            // Collapse or expand the service container to match the section title height when toggled via keyboard
            if (currentDown.classList.contains('hide')) {
                if (baseTitleHeight) service.style.height = `${baseTitleHeight}px`;
            } else {
                service.style.height = '';
            }

            lastClickedDrop = e.target;
        }
    }
}
