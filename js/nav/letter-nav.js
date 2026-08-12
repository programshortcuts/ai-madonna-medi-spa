// letter-nav.js
import { focusNav } from "./focus-nav.js";
function isActuallyVisible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
    ) return false;

    let parent = el.parentElement;
    while (parent) {
        const ps = getComputedStyle(parent);
        if (ps.display === 'none' || ps.visibility === 'hidden') {
            return false;
        }
        parent = parent.parentElement;
    }
    return true;
}
function getAlpha(el) {

    const dataVal =
        el.dataset.targetNav ||
        el.dataset.navTarget;

    if (dataVal) {
        return dataVal.trim()[0].toLowerCase();
    }

    const title =
        el.querySelector('.title-item')?.textContent ||
        el.textContent;

    return title.trim()[0]?.toLowerCase() || '';
}

function ensureFocusable(el) {
    if (el.matches('a, button, input, textarea, select')) return;
    if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
    }
}

function buildElements(container = document) {

    const raw = [
        ...container.querySelectorAll('[data-target-nav]'),
        ...container.querySelectorAll('[data-nav-target]'),
        ...container.querySelectorAll('.drop-down'),
        ...container.querySelectorAll('.item')
    ];

    const seen = new Set();

    return raw.filter(el => {
        if (!isActuallyVisible(el)) return false;
        if (seen.has(el)) return false;

        ensureFocusable(el);

        seen.add(el);

        return true;
    });
}
export function letterNav({ container, e }) {
    if (!container) return;
    const isSlider = e.target.matches('input.product-size-slider');

    if (
        !isSlider &&
        e.target.matches('input, textarea, [contenteditable="true"]')
    ) {
        if(e.key === 'enter') {
            
        }
        return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) return;
    // Re-query every keypress so injected content is always included
    const allEls = buildElements(container);
    const matches = allEls
        .map((el, i) => ({ el, i, alpha: getAlpha(el) }))
        .filter(x => x.alpha === key);

    if (!matches.length) return;
    const active = document.activeElement;
    const currentIndex = allEls.indexOf(active);
    // sort matches in DOM order
    const sorted = matches.sort((a, b) => a.i - b.i);
    let target = null;
    // find next
    const next = sorted.find(m => m.i > currentIndex);
    const prev = sorted.find(m => m.i <= currentIndex);
    if (e.shiftKey) {
        // reverse navigation
        const reversed = [...sorted].reverse();
        target =
            reversed.find(m => m.i < currentIndex) ||
            reversed[0]; // wrap
    } else {
        target =
            next ||
            sorted[0]; // wrap
    }
    if (!target?.el) return;
    focusNav({ e, target })

}