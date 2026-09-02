// toggle-nav.js
import { mainLandingPage } from "../core/inject-content.js"
import { pageWrapper } from "../core/inject-content.js"
let navInitialized = false
 const ACTIVITY_EVENTS_NAV = [
    'click',
    'pointerdown',   // mouse + touch + pen
    'keydown',
    'focusin',
    'scroll',
    'wheel',
    'touchstart'
];

export function initToggleNav() {
    if (navInitialized) return
    navInitialized = true
    const sideNavBtn = document.querySelector('#sideNavBtn')
    const imgSmoke = document.querySelector('#madonnaShilouetteLogo')
    const mobileNav = document.querySelector('.mobile-header-nav');

    
    sideNavBtn.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase()
        if(key == 'enter'){
            expandToggle()
        }
    });
    sideNavBtn.addEventListener('click', (e) => {
        // const mobileHeaderNavUl = document.querySelector('.mobile-header-nav > ul') 
        expandToggle()

    });
    mobileNav.addEventListener('click', (e) => {
        // const mobileHeaderNavUl = document.querySelector('.mobile-header-nav > ul') 
        if(e.target.tagName != 'A'){

            // expandToggle()
        }

    });
    function expandToggle(){
        pageWrapper.classList.toggle('expand')   
    }
    mainLandingPage.addEventListener('focus', (e) => {
        // console.log('here')
        if(pageWrapper.classList.contains('expand')){
            pageWrapper.classList.remove('expand')
        }
    });
    ACTIVITY_EVENTS_NAV.forEach(type => {
        document.addEventListener(type, closeNavIfOutside, {
            capture: true,
            passive: true
        });
    });

    document.addEventListener('click', closeNavIfOutside);
    document.addEventListener('keydown', e => {
        // console.log(e.target);
        // if(e.target == sideNavBtn){ 
        //     expandToggle()
        //     return
        // }
        // if(e.target.tagName != 'A' ){
        //     expandToggle()
        //     return
        // }
    });
    document.addEventListener('focusin', e => {
        // console.log(e.target);
        // if(e.target == sideNavBtn){ 
        //     expandToggle()
        //     return
        // }
        // if(e.target.tagName != 'A' ){
        //     expandToggle()
        //     return
        // }
        
    });
}
function closeNavIfOutside(e) {
    if (!pageWrapper.classList.contains('expand')) return;

    const mobileNav = document.querySelector('.mobile-header-nav');

    // Don't close if click/key originated from the menu button
    if (e.target.closest('#sideNavBtn')) return;

    if (!mobileNav?.contains(e.target)) {
        pageWrapper.classList.remove('expand');
    }
}