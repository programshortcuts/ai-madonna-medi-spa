// Controls only the expandable sections on medical-spa-services.html.
// The preview is kept as the closed state; the existing .content is the open state.
export function initDropDownMedServ() {
    const container = document.querySelector('.page-container.med-spa-serv-container');
    if (!container) return;

    container.querySelectorAll('.service-section').forEach((section) => {
        if (section.dataset.sectionToggleReady === 'true') return;

        const title = section.querySelector('.section-title');
        const content = section.querySelector('.content');
        const preview = content?.querySelector(':scope > .section-preview');
        const details = content?.querySelector('.section-details');

        if (!title || !content || !preview || !details) return;

        // A preview cannot remain visible while its parent .content is hidden.
        // Moving this existing node one level up preserves its current order and media,
        // while allowing preview/content to be the required inverse states.
        section.insertBefore(preview, content);

        const setExpanded = (expanded) => {
            content.classList.toggle('hide', !expanded);
            preview.classList.toggle('hide', expanded);
            details.classList.toggle('hide', !expanded);
            title.setAttribute('aria-expanded', String(expanded));
        };

        const toggleSection = () => setExpanded(content.classList.contains('hide'));

        setExpanded(false);

        // A native button emits click for mouse, touch, and Enter activation.
        // Space is handled explicitly so it has the same immediate behavior.
        title.addEventListener('click', toggleSection);
        title.addEventListener('keydown', (event) => {
            if (event.key !== ' ') return;
            event.preventDefault();
            toggleSection();
        });

        section.dataset.sectionToggleReady = 'true';
    });
}
