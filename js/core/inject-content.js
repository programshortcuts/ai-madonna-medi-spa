// inject-content.js
import { initAllVideos } from "../video/video-controls.js";
// 🔥 Ensure correct default page
export const DEFAULT_PAGE = "pages/home/home.html";
// export const DEFAULT_PAGE  = "pages/medical-spa-services/medical-spa-services.html";
// export const DEFAULT_PAGE  = "pages/medical-spa-services/services/bio-hormone-replace/women-bio-hormones/women-bio-hormones.html";
// export const DEFAULT_PAGE = "pages/contact/contact.html";
// export const DEFAULT_PAGE = "pages/medical-spa-services/services/glp-1/glp-1.html";
// export const DEFAULT_PAGE = "pages/products/products.html";
// export const DEFAULT_PAGE = "pages/bookings/bookings.html";
// inject-content.js
import { initZoomItems } from "../ui/zoom-items.js";
import { onPageReady } from "./page-lifecycle.js";
import { isSafePath } from "./security-utils.js";
import { initItemsScroll } from "../ui/items-scroll.js";
import { initProductsController } from "../ui/products-controller.js";
import { initBgSlider } from "../visuals/change-background.js";
import { initDropDown } from "../ui/drop-down.js";
import {initDropDownMedServ} from "../ui/drop-down-med-serv.js";

export const mainLandingPage = document.querySelector('.main-landing-page');
export const pageWrapper = document.querySelector('.page-wrapper');

if (!mainLandingPage) {
    throw new Error("Missing .main-landing-page in index.html");
}
const pageCache = new Map();
let lastClickedLink = null;
function centerElementInScrollContainer(element) {
    if (!element || !pageWrapper) return;

    const scrollContainer = pageWrapper;
    const containerHeight = scrollContainer.clientHeight || window.innerHeight;
    const elementRect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const offsetTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
    const targetScrollTop = Math.max(0, offsetTop - (containerHeight / 2) + (elementRect.height / 2));

    scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
    });
}
/* -----------------------------
   GLOBAL FORM SAFETY
----------------------------- */
document.addEventListener("submit", (e) => {
    if (e.target.id === "contact-form") {
        e.preventDefault();
        mainLandingPage.textContent = "Form submission blocked";
    }
});
/* -----------------------------
   INIT ENTRY POINT
----------------------------- */
export function initInjectContentListeners() {
    // ✅ FIX: ensure DOM is ready before first injection
    requestAnimationFrame(() => {
        if (!history.state) {

            history.replaceState(
                { href: DEFAULT_PAGE },
                "",
                `#${DEFAULT_PAGE}`
            );
        
            injectPage(DEFAULT_PAGE);
        
        }

        injectPage(DEFAULT_PAGE);

    });
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-link]');
            
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === 'undefined') {
            console.warn('Blocked bad href:', href);
            return;
        }
        e.preventDefault();

        if (history.state?.href !== href) {

            history.pushState(
                { href },
                "",
                `#${href}`
            );
        
        }
            
        injectPage(href);
        window.scrollTo(0, 0);
        mainLandingPage.scrollTo(0, 0);
        if (link === lastClickedLink) {
            mainLandingPage.focus();
            if (pageWrapper?.classList.contains('expand')) {
                pageWrapper.classList.remove('expand');
            }
            lastClickedLink = null;
            return;
        }
        lastClickedLink = link;
        
    });
    window.addEventListener("popstate", (e) => {

        if (e.state?.href) {

            injectPage(e.state.href);

        } else {

            injectPage(DEFAULT_PAGE);

        }

    });
}
/* ----------------------------- PAGE INJECTION CORE
----------------------------- */
export async function injectPage(href) {
    if (!href) return;
    if (!isSafePath(href)) {
        console.warn('Blocked unsafe path:', href);
        return;
    }
    let html;
    try {
        if (pageCache.has(href)) {
            html = pageCache.get(href);
        } else {
            const res = await fetch(href);

            if (!res.ok) {
                throw new Error(`Failed to fetch ${href} (${res.status})`);
            }

            html = await res.text();
            pageCache.set(href, html);
        }

    } catch (err) {
        console.error(err);
        mainLandingPage.textContent = `Failed to load page: ${href}`;
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 🔥 Remove broken attributes
    doc.querySelectorAll("[src], [href], [action]").forEach(el => {
        ["src", "href", "action"].forEach(attr => {
            const val = el.getAttribute(attr);
            if (val === "undefined") {
                el.removeAttribute(attr);
            }
        });
    });

    // 🔥 Remove external scripts + styles from injected page
    doc.querySelectorAll('link, script').forEach(el => el.remove());

    const newContent = doc.querySelector(".page-container");

    if (!newContent) {
        console.error("Missing .page-container in:", href);
        mainLandingPage.textContent = `Invalid page structure: ${href}`;
        return;
    }

    // -----------------------------
    // INJECT
    // -----------------------------
    mainLandingPage.innerHTML = DOMPurify.sanitize(newContent.outerHTML, {
        ALLOWED_TAGS: [
            'video',
            'form', 'input', 'textarea', 'label',
            'div', 'p', 'span', 'ul', 'ol', 'li',
            'pre', 'code',
            'img',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'a','nav', 'section', 'article', 'header', 'footer',
            'iframe', 'button', 'canvas',
            'svg', 'path', 'circle', 'g'
        ],
        ALLOWED_ATTR: [
            'autoplay','loop','controls','playsinline',
            'src', 'href', 'class', 'id', 'alt', 'tabindex',
            'allow', 'allowfullscreen', 'frameborder',
            'width', 'height', 'viewBox', 'fill', 'd', 'cx', 'cy', 'r',
            'type', 'name', 'value', 'for', 'required', 'action', 'method',

            'min',
            'max',
            'step',

            'data-auto-focus',
            'data-nav-target',
            'data-link',
            'aria-expanded',
            'aria-controls'
        ]
    });
    
    requestAnimationFrame(() => {
        const firstSection = mainLandingPage.querySelector(".sections-containers");
        
        if (firstSection) {
            firstSection.scrollIntoView({
                block: "start",
                behavior: "instant"
            });
        }
        initAllVideos(mainLandingPage)
    });

    // -----------------------------
    // AUTO FOCUS
    // -----------------------------
    const autoFocusEl = mainLandingPage.querySelector('[data-auto-focus]');

    if (autoFocusEl) {
        requestAnimationFrame(() => {
            window.setTimeout(() => {
                autoFocusEl.focus({ preventScroll: true });
                centerElementInScrollContainer(autoFocusEl);
            }, 50);
        });
    } else {
        requestAnimationFrame(() => {
            pageWrapper.scrollTop = 0;
        });
    }
    onPageReady();
    // -----------------------------
    // INIT UI MODULES
    // -----------------------------
    initProductsController();
    initItemsScroll();
    initZoomItems();
    // initDropDownMedServ()
    initDropDown()
    // OPTIONAL PAGE-SPECIFIC INIT
    if (href.includes("bookings")) {
        // initBookingForm(); // keep commented if not imported
    }
}