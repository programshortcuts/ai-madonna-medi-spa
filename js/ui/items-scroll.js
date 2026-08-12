// items-scroll.js
// items-scroll.js

export function initItemsScroll() {
    const containers = document.querySelectorAll('.items-container');
    if (!containers.length) return;

    const isSortMode = (container) =>
        container.classList.contains('sort');

    const scrollToItem = (item) => {
        const container = item.closest('.items-container');
        if (!container) return;

        const vertical = isSortMode(container);

        if (vertical) {
            const containerHeight = container.clientHeight;
            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;

            const target =
                itemTop - containerHeight / 2 + itemHeight / 2;

            container.scrollTo({
                top: target,
                behavior: 'smooth'
            });

        } else {
            const containerWidth = container.clientWidth;
            const itemWidth = item.offsetWidth;

            const target =
                item.offsetLeft - containerWidth / 2 + itemWidth / 2;

            container.scrollTo({
                left: target,
                behavior: 'smooth'
            });
        }
    };

    const getItems = (container) =>
        Array.from(container.querySelectorAll('.item'));

    const focusItem = (item) => {
        item.focus();
        scrollToItem(item);
    };

    // =========================
    // KEYBOARD NAVIGATION
    // =========================
    const onKeyDown = (e) => {
        const current = e.currentTarget;
        const container = current.closest('.items-container');
        if (!container) return;

        const items = getItems(container);
        const index = items.indexOf(current);

        const vertical = isSortMode(container);
        let nextIndex = null;

        if (!vertical) {
            if (e.key === 'ArrowRight') nextIndex = index + 1;
            if (e.key === 'ArrowLeft') nextIndex = index - 1;
        }

        if (vertical) {
            const cols = Math.max(
                1,
                Math.floor(container.clientWidth / current.offsetWidth)
            );

            if (e.key === 'ArrowRight') nextIndex = index + 1;
            if (e.key === 'ArrowLeft') nextIndex = index - 1;
            if (e.key === 'ArrowDown') nextIndex = index + cols;
            if (e.key === 'ArrowUp') nextIndex = index - cols;
        }

        if (e.key === 'Enter') {
            current.classList.toggle('clicked-item');
            scrollToItem(current);
            return;
        }

        if (nextIndex !== null && items[nextIndex]) {
            e.preventDefault();
            focusItem(items[nextIndex]);
        }
    };

    // =========================
    // CLICK + FOCUS
    // =========================
    const onClick = (e) => {
        const item = e.currentTarget;
        item.classList.toggle('clicked-item');
        scrollToItem(item);
    };

    const onFocus = (e) => {
        scrollToItem(e.currentTarget);
    };

    const onBlur = (e) => {
        e.currentTarget.classList.remove('clicked-item');
    };

    // =========================
    // BIND ITEMS
    // =========================
    const allItems = document.querySelectorAll('.item');

    allItems.forEach(item => {
        item.addEventListener('click', onClick);
        item.addEventListener('keydown', onKeyDown);
        item.addEventListener('focus', onFocus);
        item.addEventListener('blur', onBlur);
    });
}