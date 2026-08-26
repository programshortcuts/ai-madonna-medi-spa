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

        if (section.dataset.sectionToggleReady === 'true') {
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

        const details = content.querySelector(
            ':scope > .section-details'
        );

        const moreInfoButtons = content.querySelectorAll(
            '.more-info-btn'
        );

        // --------------------------------------------------------
        // Keep activated title below fixed header
        // --------------------------------------------------------

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

                // Update title
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
        // TOGGLE WHOLE SECTION
        //
        // .section-title now does EVERYTHING that the old
        // .service-section did.
        //
        // Closed:
        //     content  -> show
        //     details  -> show
        //
        // Open:
        //     content  -> hide
        //     details  -> hide
        //
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
                setDetailsVisible(true);
            }
        };

        // --------------------------------------------------------
        // MORE INFO
        //
        // This ONLY controls .section-details.
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
            content.classList.contains('show');

        setContentVisible(
            initialContentVisible
        );

        // Details start hidden.
        setDetailsVisible(false);

        // ========================================================
        // .section-title
        //
        // THIS IS NOW THE ONLY SECTION TOGGLE.
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

        // --------------------------------------------------------
        // Mark initialized
        // --------------------------------------------------------

        section.dataset.sectionToggleReady = 'true';
    });
}
