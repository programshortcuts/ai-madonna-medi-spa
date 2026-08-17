// change-styles.js
export function initChangeStyles(){
    // const themes = ["default","v2","v3"];
    const themes = ["default","v3"];
    
    let currentThemeIndex = 0;
    const versionTextEl = document.querySelector('#versionTitle')
    const themeLink = document.getElementById("themeStylesheet");
    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes.includes(savedTheme)) {
        currentThemeIndex = themes.indexOf(savedTheme);
        themeLink.href = `css/themes/${savedTheme}/main-${savedTheme}.css`;
    }
    if(savedTheme == 'default'){
        versionTextEl.innerText = ''
    } else {

        versionTextEl.innerText = savedTheme
    }

    // Logo click → switch FULL CSS
    const logo = document.getElementById("madonnaShilouetteLogo");

    if (logo) {
        logo.style.cursor = "pointer";

        logo.addEventListener("click", () => {
            window.open(e.target.getAttribute('data-href'))
        });
        logo.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase()
            if(key === 'enter'){
                console.log()

                window.open(e.target.getAttribute('data-href'))
            }
        });
    }
}