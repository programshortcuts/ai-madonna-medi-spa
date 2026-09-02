// drop-down-med-spa-serv.js
// Medical Spa Services expandable sections.
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
            ':scope > .section-title.drop-down'
        );

        const content = section.querySelector(
            ':scope > .content'
        );

        if (!title || !content) {
            return;
        }

        const details = content.querySelector(
            ':scope > .section-details'
        );

        const moreInfoButtons = content.querySelectorAll(
            '.more-info-btn'
        );

        // --------------------------------------------------------
        // SECTION REVEAL STATE
        //
        // Tracks whether this specific section has been opened
        // before during the current page visit.
        // --------------------------------------------------------

        let hasBeenRevealed =
            content.classList.contains('show');

        // --------------------------------------------------------
        // Keep activated title below fixed header
        // --------------------------------------------------------

        const scrollTitleIntoHeaderClearance = () => {

            const scrollContainer =
                document.querySelector(
                    '.page-wrapper'
                );

            const pageHeader =
                document.querySelector(
                    '.page-header'
                );

            if (!scrollContainer || !pageHeader) {
                return;
            }

            requestAnimationFrame(() => {

                title.focus({
                    preventScroll: true
                });

                const titleRect =
                    title.getBoundingClientRect();

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
                    ).matches
                        ? 'auto'
                        : 'smooth'
                });

            });
        };

        // --------------------------------------------------------
        // CONTENT STATE
        // --------------------------------------------------------

        const isContentVisible = () => {

            return content.classList.contains(
                'show'
            );
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

            return !details.classList.contains(
                'hide'
            );
        };

        const setDetailsVisible = (visible) => {

            if (!details) {
                return;
            }

            // ----------------------------------------------------
            // Show / hide section details
            // ----------------------------------------------------

            details.classList.toggle(
                'hide',
                !visible
            );

            // ----------------------------------------------------
            // Handle more-info buttons
            // ----------------------------------------------------

            moreInfoButtons.forEach((button) => {

                // ------------------------------------------------
                // OUR PROGRAMS BUTTON
                //
                // This button NEVER hides.
                // ------------------------------------------------

                if (
                    button.classList.contains(
                        'our-programs-btn'
                    )
                ) {

                    button.classList.remove(
                        'hide'
                    );

                    return;
                }

                // ------------------------------------------------
                // ALL OTHER MORE-INFO BUTTONS
                //
                // Details visible  -> button hides
                // Details hidden   -> button shows
                // ------------------------------------------------

                button.classList.toggle(
                    'hide',
                    visible
                );

            });
        };

        // --------------------------------------------------------
        // CLOSE OTHER SECTIONS
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

                // ------------------------------------------------
                // Close content
                // ------------------------------------------------

                if (otherContent) {

                    otherContent.classList.remove(
                        'show'
                    );

                    otherContent.classList.add(
                        'hide'
                    );
                }

                // ------------------------------------------------
                // Update title
                // ------------------------------------------------

                if (otherTitle) {

                    otherTitle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                }

                // ------------------------------------------------
                // Hide details
                // ------------------------------------------------

                if (otherDetails) {

                    otherDetails.classList.add(
                        'hide'
                    );
                }

                // ------------------------------------------------
                // Show more-info buttons
                //
                // This restores the normal button when a section
                // is closed because another section was opened.
                //
                // .our-programs-btn is also safe here because
                // removing "hide" keeps it visible.
                // ------------------------------------------------

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
        // TOGGLE WHOLE SECTION
        //
        // FIRST TIME:
        //
        //     section-title clicked
        //          ↓
        //     content opens
        //          ↓
        //     details stay hidden
        //          ↓
        //     more-info stays visible
        //
        // SUBSEQUENT TIMES:
        //
        //     section-title clicked
        //          ↓
        //     content opens
        //          ↓
        //     details show
        //          ↓
        //     normal more-info hides
        //
        // .our-programs-btn ALWAYS stays visible.
        // --------------------------------------------------------

        const toggleSection = () => {

            const currentlyVisible =
                isContentVisible();

            if (currentlyVisible) {

                // ----------------------------------------------
                // CLOSE
                // ----------------------------------------------

                setContentVisible(false);

                setDetailsVisible(false);

            } else {

                // ----------------------------------------------
                // OPEN
                // ----------------------------------------------

                closeOtherSections();

                setContentVisible(true);

                if (hasBeenRevealed) {

                    // ------------------------------------------
                    // SECTION HAS BEEN OPENED BEFORE
                    //
                    // Show details.
                    // Normal more-info buttons hide.
                    // our-programs-btn stays visible.
                    // ------------------------------------------

                    setDetailsVisible(true);

                } else {

                    // ------------------------------------------
                    // FIRST TIME THIS SECTION HAS BEEN OPENED
                    //
                    // Keep details hidden.
                    // Keep normal more-info buttons visible.
                    // ------------------------------------------

                    setDetailsVisible(false);

                    // Remember that this section has now
                    // been revealed.
                    hasBeenRevealed = true;
                }
            }
        };

        // --------------------------------------------------------
        // MORE INFO BUTTON TOGGLE
        //
        // Clicking a normal .more-info-btn continues to toggle
        // the section details.
        //
        // .our-programs-btn also triggers this behavior, but
        // remains visible because setDetailsVisible() protects it.
        // --------------------------------------------------------

        const toggleDetails = () => {

            if (!details) {
                return;
            }

            const currentlyVisible =
                isDetailsVisible();

            setDetailsVisible(
                !currentlyVisible
            );
        };

        // ========================================================
        // INITIAL STATE
        // ========================================================

        const initialContentVisible =
            content.classList.contains(
                'show'
            );

        const initialDetailsVisible =
            details?.classList.contains(
                'show'
            ) ?? false;

        setContentVisible(
            initialContentVisible
        );

        // --------------------------------------------------------
        // If content is initially open, treat it as already
        // revealed, but keep the details hidden initially.
        //
        // This preserves the first-view behavior.
        // --------------------------------------------------------

        // Preserve the HTML's initial .show state for section details.
setDetailsVisible(
    initialDetailsVisible
);

        // ========================================================
        // .section-title
        //
        // THIS IS THE SECTION TOGGLE.
        // ========================================================

        title.addEventListener(
            'click',
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                toggleSection();

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

                toggleSection();

                scrollTitleIntoHeaderClearance();

            }
        );

        // ========================================================
        // SECTION KEYBOARD TOGGLE
        // ========================================================

        section.addEventListener(
            'keydown',
            (event) => {

                if (
                    event.target !== section ||
                    event.key !== 'Enter'
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                title.click();

            }
        );

        // ========================================================
        // .more-info-btn
        // ========================================================

        moreInfoButtons.forEach(
            (button) => {

                // ------------------------------------------------
                // CLICK
                // ------------------------------------------------

                button.addEventListener(
                    'click',
                    (event) => {

                        event.preventDefault();
                        event.stopPropagation();

                        toggleDetails();

                    }
                );

                // ------------------------------------------------
                // KEYBOARD
                // ------------------------------------------------

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

        // --------------------------------------------------------
        // Mark initialized
        // --------------------------------------------------------

        section.dataset.sectionToggleReady =
            'true';

    });
}