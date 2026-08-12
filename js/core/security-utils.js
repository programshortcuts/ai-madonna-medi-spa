// security-utils.js

export function isSafePath(href) {
    return typeof href === "string" &&
        href.startsWith("pages/") &&
        !href.includes("..") &&
        !href.startsWith("javascript:");
}