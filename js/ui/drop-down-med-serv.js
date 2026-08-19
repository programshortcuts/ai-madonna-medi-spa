// drop-down-med-spa-serv.js
//
// Controls the expandable sections on medical-spa-services.html.
//
// Behavior:
//
// 1. .section-title
//    - Toggles .content open/closed.
//
// 2. .service-section
//    - If .content is closed, clicking/pressing Enter on the section opens it.
//    - If .content is already open, nothing happens.
//
// 3. .section-preview
//    - Only clicking/activating the actual .section-preview element toggles
//      .section-details.
//    - Clicking children inside .section-preview does NOT trigger the toggle.
//
// 4. .more-info-btn
//    - Toggles .section-details exactly like .section-preview.
//
// 5. .section-details / .more-info-buttons
//    - When .section-details is visible, .more-info-buttons is hidden.
//    - When .section-details is hidden, .more-info-buttons is visible.
//

export function initDropDownMedServ() {
    const container = document.querySelector(
        '.page-container.med-spa-serv-container'
    );

    if (!container) return;

    container.querySelectorAll('.service-section').forEach((section) => {
        // Prevent duplicate initialization.
        if (section.dataset.sectionToggleReady === 'true') {
            return;
        }

        const title = section.querySelector('.section-title');
        const content = section.querySelector(':scope > .content');

        if (!title || !content) {
            return;
        }

        const preview = content.querySelector(':scope > .section-preview');
        const details = content.querySelector(':scope > .section-details');
        const moreInfoButtons = content.querySelector(
            ':scope > .more-info-buttons'
        );

        // ------------------------------------------------------------
        // Helpers
        // ------------------------------------------------------------

        const isContentHidden = () => {
            return content.classList.contains('hide');
        };

        const isDetailsHidden = () => {
            // If there is no details element, consider details hidden.
            if (!details) return true;

            return details.classList.contains('hide');
        };

        // ------------------------------------------------------------
        // CONTENT STATE
        // ------------------------------------------------------------

        const setContentVisible = (visible) => {
            content.classList.toggle('hide', !visible);

            title.setAttribute(
                'aria-expanded',
                String(visible)
            );
        };

        const toggleContent = () => {
            setContentVisible(isContentHidden());
        };

        // ------------------------------------------------------------
        // DETAILS STATE
        // ------------------------------------------------------------

        const setDetailsVisible = (visible) => {
            if (!details) return;

            details.classList.toggle('hide', !visible);

            if (moreInfoButtons) {
                moreInfoButtons.classList.toggle('hide', visible);
            }

            if (preview) {
                preview.setAttribute(
                    'aria-expanded',
                    String(visible)
                );
            }
        };

        const toggleDetails = () => {
            setDetailsVisible(isDetailsHidden());
        };

        // ------------------------------------------------------------
        // INITIAL STATE
        // ------------------------------------------------------------

        // Content starts closed.
        setContentVisible(false);

        // Details start closed.
        // Therefore .more-info-buttons are visible.
        setDetailsVisible(false);

        // ------------------------------------------------------------
        // .section-title
        // ------------------------------------------------------------

        title.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleContent();
        });

        title.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                toggleContent();
            }
        });

        // ------------------------------------------------------------
        // .service-section
        //
        // Clicking the section opens .content if it is closed.
        //
        // We intentionally do NOT use this as a general toggle.
        // Clicking the section while content is already open does nothing.
        // ------------------------------------------------------------

        section.addEventListener('click', (event) => {
            // If the click originated from the title, the title handler
            // already handled it.
            if (event.target.closest('.section-title')) {
                return;
            }

            // If the click originated from .section-preview or one of
            // its children, let the preview logic handle it.
            if (preview && event.target.closest('.section-preview')) {
                return;
            }

            // If the click originated from a more-info button, let its
            // own handler handle it.
            if (event.target.closest('.more-info-btn')) {
                return;
            }

            // Open content if it is currently closed.
            if (isContentHidden()) {
                setContentVisible(true);
            }
        });

        // ------------------------------------------------------------
        // .service-section keyboard activation
        //
        // Allows Enter/Space on the section itself to open .content.
        //
        // We only do this when the actual section receives the key event,
        // not one of its children.
        // ------------------------------------------------------------

        section.addEventListener('keydown', (event) => {
            if (event.target !== section) {
                return;
            }

            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();

            if (isContentHidden()) {
                setContentVisible(true);
            }
        });

        // ------------------------------------------------------------
        // .section-preview
        //
        // IMPORTANT:
        //
        // We only respond when the actual .section-preview DIV itself
        // receives the click.
        //
        // Clicking:
        //   <p>
        //   <img>
        //   <span>
        //   etc.
        //
        // inside the preview does NOT toggle details.
        // ------------------------------------------------------------

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

                if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                toggleDetails();
            });
        }

        // ------------------------------------------------------------
        // .more-info-btn
        // ------------------------------------------------------------

        if (details) {
            content.querySelectorAll('.more-info-btn').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    toggleDetails();
                });

                button.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    toggleDetails();
                });
            });
        }

        // ------------------------------------------------------------
        // Mark this section as initialized.
        // ------------------------------------------------------------

        section.dataset.sectionToggleReady = 'true';
    });
}