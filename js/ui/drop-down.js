// drop-down.js (delegator)
import { initDropDownHome } from "./drop-down-home.js";
import { initDropDownMedServ } from "./drop-down-med-serv.js";

// Keep a single entry point for other modules that call initDropDown()
export function initDropDown() {
    // Initialize page-specific dropdown handlers. Each initializer will early return if it's not the right page.
    initDropDownHome();
    initDropDownMedServ();
}

