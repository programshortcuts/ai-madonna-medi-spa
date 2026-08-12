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
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;

            const newTheme = themes[currentThemeIndex];
            themeLink.href = `css/themes/${newTheme}/main-${newTheme}.css`;
            localStorage.setItem("theme", newTheme);
            
            console.log("Switched to theme:", newTheme);
            versionTextEl.innerText = newTheme
        });
        logo.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase()
            if(key === 'enter'){
                currentThemeIndex = (currentThemeIndex + 1) % themes.length;
                
                const newTheme = themes[currentThemeIndex];
                
                themeLink.href = `css/themes/${newTheme}/main-${newTheme}.css`;
                localStorage.setItem("theme", newTheme);
                
                console.log("Switched to theme:", newTheme);
                if(newTheme == 'default'){

                    versionTextEl.innerText = ``
                }else{

                    versionTextEl.innerText = newTheme
                }
            }
        });
    }
}