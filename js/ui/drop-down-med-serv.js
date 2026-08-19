// drop-down-med-spa-serv.js
// drop-down-med-spa-serv.js
//
// Medical Spa Services expandable sections.
//
// BEHAVIOR
// ------------------------------------------------------------
//
// .section-title
// - Toggles its .content open/closed.
// - ALWAYS hides .section-details.
// - NEVER opens .section-details.
//
// .service-section
// - Clicking the section itself toggles .content.
// - Clicking the section itself also toggles .section-details.
// - If .content is being opened, details are shown.
// - If .content is being closed, details are hidden.
//
// .service-section keyboard focus
// - Enter / Space behaves exactly like clicking the section.
//
// .more-info-btn
// - Toggles ONLY .section-details.
// - Does NOT change .content.
//
// INITIAL STATE
// ------------------------------------------------------------
//
// .section-details are ALWAYS hidden when initialized.
// .more-info-btn remains visible.
//
// ------------------------------------------------------------

export function initDropDownMedServ() {

    const container = document.querySelector(
        '.page-container.med-spa-serv-container'
    );

    if (!container) {
        return;
    }

    const sections = container.querySelectorAll(
        '.service-section'
    );

    sections.forEach((section) => {

        // --------------------------------------------------------
        // Prevent duplicate initialization
        // --------------------------------------------------------

        if (
            section.dataset.sectionToggleReady === 'true'
        ) {
            return;
        }

        // --------------------------------------------------------
        // Elements
        // --------------------------------------------------------

        const title = section.querySelector(
            ':scope > .section-title'
        );

        const content = section.querySelector(
            ':scope > .content'
        );

        if (!title || !content) {
            return;
        }

        const preview = content.querySelector(
            ':scope > .section-preview'
        );

        const details = content.querySelector(
            ':scope > .section-details'
        );

        const moreInfoButtons = content.querySelectorAll(
            '.more-info-btn'
        );

        // Keep an activated title visible below the fixed site header.
        const scrollTitleIntoHeaderClearance = () => {

            const scrollContainer = document.querySelector(
                '.page-wrapper'
            );

            const pageHeader = document.querySelector(
                '.page-header'
            );

            if (!scrollContainer || !pageHeader) {
                return;
            }

            requestAnimationFrame(() => {

                title.focus({ preventScroll: true });

                const titleRect = title.getBoundingClientRect();
                const containerRect =
                    scrollContainer.getBoundingClientRect();

                const targetTop = Math.max(
                    0,
                    titleRect.top -
                        containerRect.top +
                        scrollContainer.scrollTop -
                        pageHeader.getBoundingClientRect().height -
                        8
                );

                scrollContainer.scrollTo({
                    top: targetTop,
                    behavior: window.matchMedia(
                        '(prefers-reduced-motion: reduce)'
                    ).matches ? 'auto' : 'smooth'
                });
            });
        };

        // --------------------------------------------------------
        // CONTENT STATE
        // --------------------------------------------------------

        const isContentVisible = () => {
            return content.classList.contains('show');
        };

        const setContentVisible = (visible) => {

            content.classList.toggle(
                'show',
                visible
            );

            content.classList.toggle(
                'hide',
                !visible
            );

            title.setAttribute(
                'aria-expanded',
                String(visible)
            );
        };

        // --------------------------------------------------------
        // DETAILS STATE
        // --------------------------------------------------------

        const isDetailsVisible = () => {

            if (!details) {
                return false;
            }

            return !details.classList.contains('hide');
        };

        const setDetailsVisible = (visible) => {

            if (!details) {
                return;
            }

            details.classList.toggle(
                'hide',
                !visible
            );

            // More-info button is visible when details are hidden.
            moreInfoButtons.forEach((button) => {

                button.classList.toggle(
                    'hide',
                    visible
                );

            });
        };

        // --------------------------------------------------------
        // CLOSE OTHER SECTIONS
        //
        // When another section is opened:
        //
        // - its content closes
        // - its details close
        // - its more-info button becomes visible
        //
        // --------------------------------------------------------

        const closeOtherSections = () => {

            sections.forEach((otherSection) => {

                if (otherSection === section) {
                    return;
                }

                const otherContent =
                    otherSection.querySelector(
                        ':scope > .content'
                    );

                const otherTitle =
                    otherSection.querySelector(
                        ':scope > .section-title'
                    );

                const otherDetails =
                    otherContent?.querySelector(
                        ':scope > .section-details'
                    );

                const otherMoreInfoButtons =
                    otherContent?.querySelectorAll(
                        '.more-info-btn'
                    );

                // Close content
                if (otherContent) {

                    otherContent.classList.remove(
                        'show'
                    );

                    otherContent.classList.add(
                        'hide'
                    );
                }

                // Update title aria
                if (otherTitle) {

                    otherTitle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                }

                // Hide details
                if (otherDetails) {

                    otherDetails.classList.add(
                        'hide'
                    );
                }

                // Show more-info buttons
                otherMoreInfoButtons?.forEach(
                    (button) => {

                        button.classList.remove(
                            'hide'
                        );

                    }
                );
            });
        };

        // --------------------------------------------------------
        // TOGGLE CONTENT ONLY
        //
        // Used by .section-title.
        //
        // IMPORTANT:
        // Details are ALWAYS hidden here.
        //
        // --------------------------------------------------------

        const toggleContentFromTitle = () => {

            const currentlyVisible =
                isContentVisible();

            if (currentlyVisible) {

                // Closing content
                setContentVisible(false);

            } else {

                // Opening content
                closeOtherSections();
                setContentVisible(true);
            }

            // IMPORTANT:
            // Section title NEVER opens details.
            setDetailsVisible(false);
        };

        // --------------------------------------------------------
        // TOGGLE SECTION
        //
        // Used when the actual .service-section is clicked
        // or activated with Enter / Space.
        //
        // Content and details move together.
        //
        // --------------------------------------------------------

        const toggleWholeSection = () => {

            const currentlyVisible =
                isContentVisible();

            if (currentlyVisible) {

                // ----------------------------------------------
                // SECTION IS OPEN
                //
                // Close BOTH content and details.
                // ----------------------------------------------

                setContentVisible(false);
                setDetailsVisible(false);

            } else {

                // ----------------------------------------------
                // SECTION IS CLOSED
                //
                // Open content AND show details.
                // ----------------------------------------------

                closeOtherSections();

                setContentVisible(true);
                setDetailsVisible(true);
            }
        };

        // --------------------------------------------------------
        // MORE INFO
        //
        // This ONLY changes .section-details.
        //
        // It does NOT change .content.
        //
        // --------------------------------------------------------

        const toggleDetails = () => {

            const currentlyVisible =
                isDetailsVisible();

            setDetailsVisible(
                !currentlyVisible
            );
        };

        // ========================================================
        // INITIAL STATE
        // ========================================================

        // Preserve whatever content state the HTML provides.
        const initialContentVisible =
            content.classList.contains('show');

        setContentVisible(
            initialContentVisible
        );

        // IMPORTANT:
        // Details are ALWAYS hidden when the page first loads.
        setDetailsVisible(false);

        // ========================================================
        // .section-title
        // ========================================================

        title.addEventListener(
            'click',
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                toggleContentFromTitle();
                scrollTitleIntoHeaderClearance();
            }
        );

        title.addEventListener(
            'keydown',
            (event) => {

                if (
                    event.key !== 'Enter' &&
                    event.key !== ' '
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                toggleContentFromTitle();
                scrollTitleIntoHeaderClearance();
            }
        );

        // ========================================================
        // .service-section CLICK
        // ========================================================
        //
        // IMPORTANT:
        //
        // We only want this to happen when the SECTION itself
        // is clicked.
        //
        // Clicking children should NOT cause this handler to run.
        //
        // ========================================================

        section.addEventListener(
            'click',
            (event) => {

                // If the actual section itself was clicked:
                if (event.target !== section) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                toggleWholeSection();
            }
        );

        // ========================================================
        // .service-section KEYBOARD
        // ========================================================

        section.addEventListener(
            'keydown',
            (event) => {

                // Only respond when the section itself has focus.
                if (event.target !== section) {
                    return;
                }

                if (
                    event.key !== 'Enter' &&
                    event.key !== ' '
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                toggleWholeSection();
            }
        );

        // ========================================================
        // .more-info-btn
        // ========================================================

        moreInfoButtons.forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    (event) => {

                        event.preventDefault();
                        event.stopPropagation();

                        toggleDetails();
                    }
                );

                button.addEventListener(
                    'keydown',
                    (event) => {

                        if (
                            event.key !== 'Enter' &&
                            event.key !== ' '
                        ) {
                            return;
                        }

                        event.preventDefault();
                        event.stopPropagation();

                        toggleDetails();
                    }
                );

            }
        );

        // ========================================================
        // .section-preview
        //
        // IMPORTANT:
        //
        // We are NOT using .section-preview to toggle details
        // anymore.
        //
        // Details are controlled by:
        //
        // 1. .service-section
        // 2. .more-info-btn
        //
        // ========================================================

        // No preview click handler.

        // --------------------------------------------------------
        // Mark initialized
        // --------------------------------------------------------

        section.dataset.sectionToggleReady = 'true';
    });
}
