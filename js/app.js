// app.js
import { initAllVideos } from "./video/video-controls.js";
import { initFocusScroll } from "./nav/focus-scroll.js";
import { initChangeStyles } from "./ui/change-styles.js";
import { initInjectContentListeners } from "./core/inject-content.js";
import { initToggleNav } from "./ui/toggle-nav.js";
import { initKeydboardNav } from "./nav/keyboard-nav.js";
import { initDropDown } from "./ui/drop-down.js";
import { initDropDownMedServ } from "./ui/drop-down-med-serv.js";
// import { initFilterSortItems } from "./ui/filter-sort-items.js";
// import { initMedicalSpaAnimation } from "./visuals/animation.js";

let animationCleanup = null;

addEventListener('DOMContentLoaded', initMain)
function initMain(){

    const pageWrapper = document.querySelector('.page-wrapper')
    initToggleNav()
    initKeydboardNav({
        pageWrapper
    });
    initFocusScroll()
    initInjectContentListeners()
    document.querySelectorAll("*").forEach(el => {
        
            [...el.attributes].forEach(attr => {
                if (attr.name.startsWith("on")) {
                    console.log("INLINE EVENT:", el, attr);
                }
            });
        });    
        
    initAllVideos(document)
}
function setupGlobalListeners(){
    initDropDown()
    // initDropDownMedServ()
    // initFilterSortItems()
    initChangeStyles()
}
setupGlobalListeners()
