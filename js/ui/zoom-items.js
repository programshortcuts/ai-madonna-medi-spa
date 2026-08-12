// zoom-items.js

export function initZoomItems() {
    
    const sliders = document.querySelectorAll('.product-size-slider');

    sliders.forEach(slider => {
        const container = slider.closest('.products-content');
        if (!container) return;

        const itemsContainer = container.querySelector('.items-container');
        if (!itemsContainer) return;

        slider.addEventListener("input", () => {
            // console.log(slider.value)
            itemsContainer.style.setProperty(
                "--item-size",
                `${slider.value}px`
            );
        });
        slider.addEventListener("change", () => {
            console.log(slider.value )
        });
    });
    document.addEventListener("keydown", (e) => {
        const btn = e.target.closest(".sort-btn");
        if (!btn) return;

        if (
            e.key !== "ArrowLeft" &&
            e.key !== "ArrowRight" &&
            e.key !== "ArrowUp" &&
            e.key !== "ArrowDown"
        ) {
            return;
        }

        e.preventDefault();

        const container = btn.closest(".products-content");
        const slider = container?.querySelector(".product-size-slider");

        if (!slider) return;

        const step = Number(slider.step) || 1;
        const min = Number(slider.min);
        const max = Number(slider.max);
        let value = Number(slider.value);

        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            value += step;
        } else {
            value -= step;
        }

        value = Math.max(min, Math.min(max, value));

        slider.value = value;

        // trigger your existing zoom-items.js logic
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        slider.dispatchEvent(new Event("change", { bubbles: true }));
    });
}