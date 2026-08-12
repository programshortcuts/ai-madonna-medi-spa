// products-controller.js

export function initProductsController() {
    const sections = document.querySelectorAll('.products-content');

    sections.forEach(section => {
        const container = section.querySelector('.items-container');
        const slider = section.querySelector('input[type="range"]');

        if (!container) return;

        // default state
        if (!container.dataset.view) {
            container.dataset.view = "horizontal";
        }

        // =========================
        // VIEW SWITCH (SORT BUTTON)
        // =========================
        const sortBtn = section.querySelector('.sort-btn');

        if (sortBtn) {
            sortBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const current = container.dataset.view || "horizontal";

                const next = current === "horizontal"
                    ? "grid"
                    : "horizontal";

                container.dataset.view = next;

                // reset scroll so layout change is visible
                container.scrollTo({ left: 0, top: 0, behavior: "smooth" });

                
            });
        }

        function toggleView(container) {
            const next =
                container.dataset.view === "horizontal"
                    ? "grid"
                    : "horizontal";

            container.dataset.view = next;

            // reset scroll when switching modes
            container.scrollTo({ left: 0, top: 0, behavior: "smooth" });
        }

        // =========================
        // ZOOM SLIDER (SCOPE SAFE)
        // =========================
        if (slider) {
            slider.addEventListener("input", () => {
                container.style.setProperty(
                    "--item-size",
                    `${slider.value}px`
                );
            });
        }

        // =========================
        // ITEM INTERACTIONS
        // =========================
        const items = container.querySelectorAll('.item');

        items.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('clicked-item');
                scrollToItem(container, item);
            });

            item.addEventListener('focus', () => {
                scrollToItem(container, item);
            });

            item.addEventListener('keydown', (e) => {
                handleKeyboard(container, item, e);
            });
        });

        // =========================
        // SCROLL TO ITEM
        // =========================
        function scrollToItem(container, item) {
            const isGrid = container.dataset.view === "grid";

            if (isGrid) {
                const h = container.clientHeight;
                const top = item.offsetTop;
                const itemH = item.offsetHeight;

                container.scrollTo({
                    top: top - h / 2 + itemH / 2,
                    behavior: "smooth"
                });
            } else {
                const w = container.clientWidth;
                const left = item.offsetLeft;
                const itemW = item.offsetWidth;

                container.scrollTo({
                    left: left - w / 2 + itemW / 2,
                    behavior: "smooth"
                });
            }
        }

        // =========================
        // KEYBOARD NAV
        // =========================
        function handleKeyboard(container, current, e) {
            const items = Array.from(container.querySelectorAll('.item'));
            const index = items.indexOf(current);

            let nextIndex = null;

            const isGrid = container.dataset.view === "grid";

            if (!isGrid) {
                if (e.key === "ArrowRight") nextIndex = index + 1;
                if (e.key === "ArrowLeft") nextIndex = index - 1;
            }

            if (isGrid) {
                const itemWidth = current.offsetWidth + 16;
                const perRow = Math.floor(container.clientWidth / itemWidth) || 1;

                if (e.key === "ArrowRight") nextIndex = index + 1;
                if (e.key === "ArrowLeft") nextIndex = index - 1;
                if (e.key === "ArrowDown") nextIndex = index + perRow;
                if (e.key === "ArrowUp") nextIndex = index - perRow;
            }

            if (nextIndex !== null && items[nextIndex]) {
                e.preventDefault();
                items[nextIndex].focus();
            }
        }

        // =========================
        // DRAG SCROLL (horizontal only)
        // =========================
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        container.addEventListener('mousedown', (e) => {
            if (container.dataset.view === "grid") return;
            if (e.target.closest('.item')) return;

            isDown = true;
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;

            e.preventDefault();

            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;

            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('mouseup', () => isDown = false);
        container.addEventListener('mouseleave', () => isDown = false);
    });
}