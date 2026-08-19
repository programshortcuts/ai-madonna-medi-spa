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
// ============================================================
// GLOBAL ELEMENTS
// ============================================================

export const mainLandingPage = document.querySelector(".main-landing-page");
export const pageWrapper = document.querySelector(".page-wrapper");

if (!mainLandingPage) {
    throw new Error("Missing .main-landing-page in index.html");
}

if (!pageWrapper) {
    throw new Error("Missing .page-wrapper in index.html");
}

// ============================================================
// PAGE CACHE
// ============================================================

const pageCache = new Map();

// Used by your existing navigation behavior.
let lastClickedLink = null;

// ============================================================
// SCROLL HELPERS
// ============================================================

/**
 * Get the actual scroll position of the site's main scroll container.
 */
function getPageScrollTop() {
    if (!pageWrapper) return 0;
    return pageWrapper.scrollTop;
}

/**
 * Set the site's main scroll position.
 *
 * Using .page-wrapper instead of window is important because
 * .page-wrapper is the actual scrolling container on this site.
 */
function setPageScrollTop(position = 0, behavior = "instant") {
    if (!pageWrapper) return;

    const top = Math.max(0, Number(position) || 0);

    pageWrapper.scrollTo({
        top,
        behavior
    });
}

/**
 * Scroll the current page to the very top.
 */
function scrollPageToTop() {
    setPageScrollTop(0, "instant");
}

/**
 * Center an element inside the site's scroll container.
 */
function centerElementInScrollContainer(element) {
    if (!element || !pageWrapper) return;

    const scrollContainer = pageWrapper;

    const containerHeight =
        scrollContainer.clientHeight || window.innerHeight;

    const elementRect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    const offsetTop =
        elementRect.top -
        containerRect.top +
        scrollContainer.scrollTop;

    const targetScrollTop = Math.max(
        0,
        offsetTop -
            containerHeight / 2 +
            elementRect.height / 2
    );

    scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
    });
}

// ============================================================
// GLOBAL FORM SAFETY
// ============================================================

document.addEventListener("submit", (e) => {
    if (e.target.id === "contact-form") {
        e.preventDefault();
        mainLandingPage.textContent = "Form submission blocked";
    }
});

// ============================================================
// HISTORY HELPERS
// ============================================================

/**
 * Determine whether a clicked link belongs to the mobile header
 * navigation.
 *
 * Mobile-header-nav links intentionally always open their
 * destination at the top.
 */
function isMobileHeaderNavLink(link) {
    return Boolean(link?.closest(".mobile-header-nav"));
}

/**
 * Save the current scroll position into the CURRENT history entry.
 *
 * This happens BEFORE pushState() creates the next page's entry.
 */
function saveCurrentHistoryScrollPosition() {
    const currentState = history.state;

    if (!currentState?.href) {
        return;
    }

    const scrollTop = getPageScrollTop();

    history.replaceState(
        {
            ...currentState,
            scrollTop
        },
        "",
        window.location.href
    );
}

/**
 * Create a new history entry for a page.
 *
 * The new page starts with scrollTop = 0 unless the entry is
 * later restored through browser Back/Forward navigation.
 */
function pushPageHistory(href) {
    history.pushState(
        {
            href,
            scrollTop: 0
        },
        "",
        `#${href}`
    );
}

/**
 * Replace the current history entry.
 */
function replacePageHistory(href, scrollTop = 0) {
    history.replaceState(
        {
            href,
            scrollTop
        },
        "",
        `#${href}`
    );
}

// ============================================================
// INIT ENTRY POINT
// ============================================================

export function initInjectContentListeners() {

    // --------------------------------------------------------
    // INITIAL PAGE
    // --------------------------------------------------------

    requestAnimationFrame(() => {

        if (!history.state?.href) {

            replacePageHistory(DEFAULT_PAGE, 0);

            injectPage(DEFAULT_PAGE, {
                restoreScroll: false,
                forceTop: true
            });

            return;
        }

        /*
         * If the browser loaded/reloaded the site with an existing
         * history entry, load that page rather than blindly loading
         * the default page.
         */
        injectPage(history.state.href, {
            restoreScroll: false,
            forceTop: true
        });
    });

    // --------------------------------------------------------
    // DATA-LINK CLICK HANDLER
    // --------------------------------------------------------

    document.addEventListener("click", (e) => {

        const link = e.target.closest("a[data-link]");

        if (!link) return;

        const href = link.getAttribute("href");

        if (
            !href ||
            href === "#" ||
            href === "undefined"
        ) {
            console.warn("Blocked bad href:", href);
            return;
        }

        /*
         * External links should not be handled by the SPA
         * navigation system.
         */
        if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("tel:") ||
            href.startsWith("mailto:")
        ) {
            return;
        }

        e.preventDefault();

        // ----------------------------------------------------
        // DETERMINE NAVIGATION TYPE
        // ----------------------------------------------------

        const mobileNavLink = isMobileHeaderNavLink(link);

        const currentHref = history.state?.href;

        // ----------------------------------------------------
        // SAME PAGE
        // ----------------------------------------------------

        if (currentHref === href) {

            /*
             * If the user clicks a mobile navigation link for
             * the page they are ALREADY on, simply return to
             * the top.
             *
             * Do NOT create another history entry.
             */
            if (mobileNavLink) {
                scrollPageToTop();

                if (pageWrapper?.classList.contains("expand")) {
                    pageWrapper.classList.remove("expand");
                }

                lastClickedLink = link;

                return;
            }

            /*
             * Preserve your existing behavior for clicking the
             * same content link twice.
             */
            if (link === lastClickedLink) {

                mainLandingPage.focus();

                if (pageWrapper?.classList.contains("expand")) {
                    pageWrapper.classList.remove("expand");
                }

                lastClickedLink = null;

                return;
            }
        }

        // ----------------------------------------------------
        // SAVE CURRENT PAGE POSITION
        // ----------------------------------------------------

        /*
         * Before leaving the current page, save EXACTLY where
         * the user currently is.
         *
         * Example:
         *
         * Home scrollTop = 1842
         * User clicks Botox
         *
         * Home's history entry becomes:
         *
         * {
         *     href: "pages/home/home.html",
         *     scrollTop: 1842
         * }
         */
        saveCurrentHistoryScrollPosition();

        // ----------------------------------------------------
        // CREATE NEW HISTORY ENTRY
        // ----------------------------------------------------

        pushPageHistory(href);

        // ----------------------------------------------------
        // LOAD NEW PAGE
        // ----------------------------------------------------

        injectPage(href, {
            restoreScroll: false,
            forceTop: true
        });

        // ----------------------------------------------------
        // MOBILE NAV STATE
        // ----------------------------------------------------

        if (mobileNavLink) {

            /*
             * Mobile navigation always means:
             *
             * "Take me to this page from the top."
             */
            scrollPageToTop();

            if (pageWrapper?.classList.contains("expand")) {
                pageWrapper.classList.remove("expand");
            }
        }

        lastClickedLink = link;
    });

    // --------------------------------------------------------
    // BROWSER BACK / FORWARD
    // --------------------------------------------------------

    window.addEventListener("popstate", (e) => {

        const state = e.state;

        if (state?.href) {

            /*
             * Browser Back/Forward navigation.
             *
             * We load the page first, then restore the exact
             * scroll position stored in that history entry.
             */
            injectPage(state.href, {
                restoreScroll: true,
                scrollTop: state.scrollTop ?? 0,
                forceTop: false
            });

        } else {

            /*
             * No usable history state means return to Home.
             */
            replacePageHistory(DEFAULT_PAGE, 0);

            injectPage(DEFAULT_PAGE, {
                restoreScroll: false,
                forceTop: true
            });
        }
    });
}

// ============================================================
// PAGE INJECTION CORE
// ============================================================

export async function injectPage(
    href,
    {
        restoreScroll = false,
        scrollTop = 0,
        forceTop = false
    } = {}
) {

    if (!href) return;

    if (!isSafePath(href)) {
        console.warn("Blocked unsafe path:", href);
        return;
    }

    let html;

    // --------------------------------------------------------
    // FETCH / CACHE
    // --------------------------------------------------------

    try {

        if (pageCache.has(href)) {

            html = pageCache.get(href);

        } else {

            const res = await fetch(href);

            if (!res.ok) {
                throw new Error(
                    `Failed to fetch ${href} (${res.status})`
                );
            }

            html = await res.text();

            pageCache.set(href, html);
        }

    } catch (err) {

        console.error(err);

        mainLandingPage.textContent =
            `Failed to load page: ${href}`;

        return;
    }

    // --------------------------------------------------------
    // PARSE HTML
    // --------------------------------------------------------

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // --------------------------------------------------------
    // REMOVE BROKEN ATTRIBUTES
    // --------------------------------------------------------

    doc.querySelectorAll("[src], [href], [action]").forEach((el) => {

        ["src", "href", "action"].forEach((attr) => {

            const val = el.getAttribute(attr);

            if (val === "undefined") {
                el.removeAttribute(attr);
            }
        });
    });

    // --------------------------------------------------------
    // REMOVE EXTERNAL SCRIPTS / STYLES
    // --------------------------------------------------------

    doc.querySelectorAll("link, script").forEach((el) => {
        el.remove();
    });

    // --------------------------------------------------------
    // FIND PAGE CONTAINER
    // --------------------------------------------------------

    const newContent = doc.querySelector(".page-container");

    if (!newContent) {

        console.error(
            "Missing .page-container in:",
            href
        );

        mainLandingPage.textContent =
            `Invalid page structure: ${href}`;

        return;
    }

    // --------------------------------------------------------
    // INJECT SANITIZED CONTENT
    // --------------------------------------------------------

    mainLandingPage.innerHTML = DOMPurify.sanitize(
        newContent.outerHTML,
        {
            ALLOWED_TAGS: [
                "video",

                "form",
                "input",
                "textarea",
                "label",

                "div",
                "p",
                "span",

                "ul",
                "ol",
                "li",

                "pre",
                "code",

                "img",

                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",

                "a",
                "nav",
                "section",
                "article",
                "header",
                "footer",

                "iframe",
                "button",
                "canvas",

                "svg",
                "path",
                "circle",
                "g"
            ],

            ALLOWED_ATTR: [
                "autoplay",
                "loop",
                "controls",
                "playsinline",

                "src",
                "href",

                "class",
                "id",
                "alt",
                "tabindex",

                "allow",
                "allowfullscreen",
                "frameborder",

                "width",
                "height",

                "viewBox",
                "fill",
                "d",
                "cx",
                "cy",
                "r",

                "type",
                "name",
                "value",
                "for",

                "required",

                "action",
                "method",

                "min",
                "max",
                "step",

                "data-href",
                "data-auto-focus",
                "data-nav-target",
                "data-link",

                "aria-expanded",
                "aria-controls"
            ]
        }
    );

    // --------------------------------------------------------
    // POST-INJECTION INITIALIZATION
    // --------------------------------------------------------

    requestAnimationFrame(() => {

        const firstSection =
            mainLandingPage.querySelector(
                ".sections-containers"
            );

        if (firstSection) {

            /*
             * This is only the page's internal section behavior.
             * We do NOT use this to control browser history
             * restoration.
             */
            firstSection.scrollIntoView({
                block: "start",
                behavior: "instant"
            });
        }

        initAllVideos(mainLandingPage);
    });

    // --------------------------------------------------------
    // AUTO FOCUS
    // --------------------------------------------------------

    const autoFocusEl =
        mainLandingPage.querySelector(
            "[data-auto-focus]"
        );

    if (autoFocusEl) {

        requestAnimationFrame(() => {

            window.setTimeout(() => {

                autoFocusEl.focus({
                    preventScroll: true
                });

                /*
                 * Auto-focus pages intentionally center their
                 * target element.
                 */
                centerElementInScrollContainer(
                    autoFocusEl
                );

            }, 50);
        });

    } else {

        /*
         * IMPORTANT:
         *
         * We previously ALWAYS did:
         *
         * pageWrapper.scrollTop = 0;
         *
         * That prevented browser Back from restoring the
         * previous location.
         *
         * Now we only do it when the navigation specifically
         * requests a fresh page at the top.
         */
        requestAnimationFrame(() => {

            if (restoreScroll) {

                /*
                 * Wait another frame so the newly injected
                 * content has its correct height before restoring
                 * the scroll position.
                 */
                requestAnimationFrame(() => {

                    setPageScrollTop(
                        scrollTop,
                        "instant"
                    );
                });

            } else if (forceTop) {

                setPageScrollTop(
                    0,
                    "instant"
                );
            }
        });
    }

    // --------------------------------------------------------
    // PAGE LIFECYCLE
    // --------------------------------------------------------

    onPageReady();

    // --------------------------------------------------------
    // UI MODULES
    // --------------------------------------------------------

    initProductsController();
    initItemsScroll();
    initZoomItems();

    // initDropDownMedServ();

    initDropDown();

    // --------------------------------------------------------
    // OPTIONAL PAGE-SPECIFIC INIT
    // --------------------------------------------------------

    if (href.includes("bookings")) {
        // initBookingForm();
    }
}