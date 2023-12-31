// ==UserScript==
// @name         IdlePixel UIT - Invention
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel UI Tweaks for only showing the Heat and Energy in the fishing tab.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    hideOrbsAndRing() {
        if (Globals.currentPanel === 'panel-invention') {
            const masterRing = IdlePixelPlus.getVarOrDefault("master_ring_assembled", 0, "int");
            const fishingOrb = IdlePixelPlus.getVarOrDefault("mega_shiny_glass_ball_fish_assembled", 0, "int");
            const leafOrb = IdlePixelPlus.getVarOrDefault("mega_shiny_glass_ball_leaf_assembled", 0, "int");
            const logsOrb = IdlePixelPlus.getVarOrDefault("mega_shiny_glass_ball_logs_assembled", 0, "int");
            const monstersOrb = IdlePixelPlus.getVarOrDefault("mega_shiny_glass_ball_monsters_assembled", 0, "int");
            const volcanoTab = IdlePixelPlus.getVarOrDefault("volcano_tablette_charged", 0, "int");
            const ancientTab = IdlePixelPlus.getVarOrDefault("ancient_tablette_charged", 0, "int");

            const selectors = {
                masterRing: "#invention-table > tbody [data-invention-item=master_ring]",
                fishOrb: "#invention-table > tbody [data-invention-item=mega_shiny_glass_ball_fish]",
                leafOrb: "#invention-table > tbody [data-invention-item=mega_shiny_glass_ball_leaf]",
                logsOrb: "#invention-table > tbody [data-invention-item=mega_shiny_glass_ball_logs]",
                monstersOrb: "#invention-table > tbody [data-invention-item=mega_shiny_glass_ball_monsters]",
            };

            const uiTweaksConfig = IdlePixelPlus.plugins['ui-tweaks'].getConfig("hideOrbRing");

            for (const orb in selectors) {
                if (selectors.hasOwnProperty(orb)) {
                    const element = document.querySelector(selectors[orb]);
                    if (uiTweaksConfig) {
                        if (orb === 'masterRing' && masterRing === 1) {
                            element.style.display = 'none';
                        } else if (orb === 'fishingOrb' && fishingOrb === 1) {
                            element.style.display = 'none';
                        } else if (orb === 'leafOrb' && leafOrb === 1) {
                            element.style.display = 'none';
                        } else if (orb === 'logsOrb' && logsOrb === 1) {
                            element.style.display = 'none';
                        } else if (orb === 'monstersOrb' && monstersOrb === 1) {
                            element.style.display = 'none';
                        } else {
                            element.style.display = '';
                        }
                    } else {
                        if ((orb !== 'masterRing' && volcanoTab === 1)) {
                            element.style.display = '';
                        } else if (orb === 'masterRing' && ancientTab === 1) {
                            element.style.display = '';
                        } else {
                            element.style.display = 'none';
                        }
                    }
                }
            }
        }
    }
    
	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();