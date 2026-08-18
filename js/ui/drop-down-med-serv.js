// drop-down-med-serv.js
/** Without stopPropagationImmediate for all keys. it will keep printing twice, figure this out later, it works fine */
import { pauseAllVideos } from "../video/video-controls.js";
const ACTIVITY_EVENTS_SERV_SECTIONS = [
    'click',
    'pointerdown',   // mouse + touch + pen
    'keydown',
    'focusin',
    'scroll',
    'wheel',
    'touchstart'
];
export function initDropDownMedServ() {
    const medSpaContainer = document.querySelector('.page-container.med-spa-serv-container');
    if (!medSpaContainer) return;
    const serviceSections = Array.from(medSpaContainer.querySelectorAll('.service-section'));
    const contents = medSpaContainer.querySelectorAll('.content')
    const allSectionDetails = Array.from(medSpaContainer.querySelectorAll('.section-details'));
    const moreInfoBtns = medSpaContainer.querySelectorAll('.more-info-btn')
    const sectionPreviews = document.querySelectorAll('.section-preview')
    hideAllDropSnips(sectionPreviews)
    moreInfoBtns.forEach(el => {
        el.addEventListener('keydown', e => {
            const key = e.key.toLowerCase()
            console.log('here');
            
            if(key == 'enter')   {
                const section  = e.target.closest('.service-section')
                console.log('here');
                // toggleSectionInteraction(section,e.target)  
                // section.focus()
                return
            }

        })
    })
    serviceSections.forEach((section) => {       
        section.tabIndex = 0;
        section.addEventListener('click', handleSectionClick);
        section.addEventListener('keydown', handleSectionKeydown);
        ACTIVITY_EVENTS_SERV_SECTIONS.forEach(type => {
            section.addEventListener(type, e => {
                const section = e.target.closest('.service-section')
                const sectionDetails = section.querySelector('.section-details')    
                const moreInfoBtn = section.querySelector('.more-info-btn')
                if(type == 'keydown'){
                    const key = e.key.toLowerCase()
                    
                    
                    if(key == 'enter'){
                        e.stopImmediatePropagation()
                    }
                    
            }
            if(!sectionDetails.classList.contains('hide')){
                moreInfoBtn?.classList.add('hide')
            } else {
                if(moreInfoBtn.classList.contains('hide')){
                    moreInfoBtn.classList.remove('hide')
                    
                    
                    
                }
            }
            return
                
            });
        });
    });
    
    function hideAllSectionDetails(){
        allSectionDetails.forEach(el => {
            if(!el.classList.contains('show')){

                el.classList.add('hide')
            }
            
        })
    }
    hideAllSectionDetails()
}
function handleSectionClick(e){
    const section = e.target.closest('.service-section')
    if(!section) return;
    toggleSectionInteraction(section, e.target);
}
function handleSectionKeydown(e){
    if (e.key !== "Enter") return;

    // Let native controls work normally
    if (e.target.matches("a, button, input, textarea")) {
        return;
    }

    const serviceSection = e.currentTarget;

    e.preventDefault();

    if (e.target === serviceSection) {
        toggleHide(serviceSection.querySelector(".section-details"));
        return;
    }

    toggleSectionInteraction(serviceSection, e.target);
    return

    
}
function toggleSectionInteraction(section, target){
    const content = section.querySelector('.content');
    const sectionDetails = section.querySelector('.section-details');


    if(!content || !sectionDetails) return;
    if(target.closest('.section-preview')){
        toggleHide(sectionDetails);
        return;
    }

    if(target.closest('.section-title.drop-down')){
        toggleHide(content);
    }
}
function toggleHide(el){
    el.classList.toggle('hide');
}
function hideAllDropSnips(els){
    els.forEach(el =>{
        if(!el.classList.contains('show')){

            el.classList.add('hide');
        }
    })
}