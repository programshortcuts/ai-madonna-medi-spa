// drop-down-med-spa-serv.js
//
// Controls the expandable sections on medical-spa-services.html.
//
// CONTENT
// ------------------------------------------------------------
// .content.show = visible
// .content.hide = hidden
//
// .section-title
// - Click / Enter / Space toggles its own .content.
// - Opening one section closes every other .content.
//
// .service-section
// - Clicking the section opens its .content if it is closed.
// - Enter / Space on the section does the same.
//
// DETAILS
// ------------------------------------------------------------
// .section-preview
// - Only the actual .section-preview element toggles details.
// - Clicking children inside .section-preview does NOT toggle details.
//
// .more-info-btn
// - Toggles .section-details.
//
// .section-details
// - Visible  -> .more-info-buttons hidden
// - Hidden   -> .more-info-buttons visible
//

export function initDropDownMedServ() {
    const container = document.querySelector(
        '.page-container.med-spa-serv-container'
    );

    if (!container) return;

    // ------------------------------------------------------------
    // Get all service sections once.
    // ------------------------------------------------------------

    const sections = container.querySelectorAll('.service-section');

    sections.forEach((section) => {

        // Prevent duplicate initialization.
        if (section.dataset.sectionToggleReady === 'true') {
            return;
        }

        const title = section.querySelector(':scope > .section-title');
        const content = section.querySelector(':scope > .content');

        if (!title || !content) {
            return;
        }

        const preview = content.querySelector(
            ':scope > .section-preview'
        );

        const details = content.querySelector(
            ':scope > .section-details'
        );

        const moreInfoButtons = content.querySelector(
            ':scope .more-info-buttons'
        );

        // --------------------------------------------------------
        // CONTENT
        // --------------------------------------------------------

        const isContentVisible = () => {
            return content.classList.contains('show');
        };

        const setContentVisible = (visible) => {

            content.classList.toggle('show', visible);
            content.classList.toggle('hide', !visible);

            title.setAttribute(
                'aria-expanded',
                String(visible)
            );
        };

        // --------------------------------------------------------
        // Close every OTHER section.
        // --------------------------------------------------------

        const closeOtherSections = () => {

            sections.forEach((otherSection) => {

                if (otherSection === section) {
                    return;
                }

                const otherContent = otherSection.querySelector(
                    ':scope > .content'
                );

                const otherTitle = otherSection.querySelector(
                    ':scope > .section-title'
                );

                if (!otherContent) {
                    return;
                }

                otherContent.classList.remove('show');
                otherContent.classList.add('hide');

                if (otherTitle) {
                    otherTitle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                }
            });
        };

        // --------------------------------------------------------
        // Open this section.
        //
        // This ALWAYS closes all other sections first.
        // --------------------------------------------------------

        const openSection = () => {

            closeOtherSections();

            setContentVisible(true);
        };

        // --------------------------------------------------------
        // Toggle this section.
        // --------------------------------------------------------

        const toggleContent = () => {

            if (isContentVisible()) {

                // Already open -> close it.
                setContentVisible(false);

            } else {

                // Closed -> close all others and open this one.
                openSection();
            }
        };

        // --------------------------------------------------------
        // DETAILS
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

            if (moreInfoButtons) {

                moreInfoButtons.classList.toggle(
                    'hide',
                    visible
                );
            }

            if (preview) {

                preview.setAttribute(
                    'aria-expanded',
                    String(visible)
                );
            }
        };

        const toggleDetails = () => {

            setDetailsVisible(
                !isDetailsVisible()
            );
        };

        // --------------------------------------------------------
        // INITIAL CONTENT STATE
        //
        // IMPORTANT:
        //
        // We DO NOT force content closed here.
        //
        // If HTML says:
        //
        //     <div class="content show">
        //
        // it stays open.
        // --------------------------------------------------------

        const initiallyVisible =
            content.classList.contains('show');

        setContentVisible(initiallyVisible);

        // --------------------------------------------------------
        // INITIAL DETAILS STATE
        //
        // Details are closed unless they do not have .hide.
        //
        // We make the normal initial state:
        //
        // .section-details.hide
        // .more-info-buttons visible
        // --------------------------------------------------------

        if (details) {

            const detailsInitiallyVisible =
                !details.classList.contains('hide');

            setDetailsVisible(
                detailsInitiallyVisible
            );
        }

        // --------------------------------------------------------
        // .section-title
        // --------------------------------------------------------

        title.addEventListener('click', (event) => {

            event.stopPropagation();

            toggleContent();
        });

        title.addEventListener('keydown', (event) => {

            if (
                event.key !== 'Enter' &&
                event.key !== ' '
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            toggleContent();
        });

        // --------------------------------------------------------
        // .service-section
        //
        // Clicking the section itself opens it if closed.
        //
        // We don't want this handler to interfere with:
        // - .section-title
        // - .section-preview
        // - .more-info-btn
        // --------------------------------------------------------

        section.addEventListener('click', (event) => {

            // Title handles itself.
            if (
                event.target.closest('.section-title')
            ) {
                return;
            }

            // Preview handles itself.
            if (
                preview &&
                event.target.closest('.section-preview')
            ) {
                return;
            }

            // More-info button handles itself.
            if (
                event.target.closest('.more-info-btn')
            ) {
                return;
            }

            // Only open if currently closed.
            if (!isContentVisible()) {

                openSection();
            }
        });

        // --------------------------------------------------------
        // .service-section keyboard activation
        //
        // Only fires when the actual section element itself
        // has focus.
        // --------------------------------------------------------

        section.addEventListener('keydown', (event) => {

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

            if (!isContentVisible()) {

                openSection();
            }
        });

        // --------------------------------------------------------
        // .section-preview
        //
        // IMPORTANT:
        //
        // event.target MUST equal preview.
        //
        // Therefore:
        //
        // Clicking the actual .section-preview:
        //     toggles details
        //
        // Clicking a paragraph:
        //     does nothing
        //
        // Clicking an image:
        //     does nothing
        //
        // Clicking a video:
        //     does nothing
        // --------------------------------------------------------

        if (preview) {

            preview.addEventListener('click', (event) => {

                if (event.target !== preview) {
                    return;
                }

                event.stopPropagation();

                toggleDetails();
            });

            preview.addEventListener('keydown', (event) => {

                if (event.target !== preview) {
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

                toggleDetails();
            });
        }

        // --------------------------------------------------------
        // .more-info-btn
        // --------------------------------------------------------

        if (details) {

            content
                .querySelectorAll('.more-info-btn')
                .forEach((button) => {

                    button.addEventListener(
                        'click',
                        (event) => {

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
                });
        }

        // --------------------------------------------------------
        // Mark section as initialized.
        // --------------------------------------------------------

        section.dataset.sectionToggleReady = 'true';
    });
}