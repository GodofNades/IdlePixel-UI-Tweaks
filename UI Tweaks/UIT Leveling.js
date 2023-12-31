// ==UserScript==
// @name         IdlePixel UIT - Leveling
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

    const LEVELS = function(){
        let result = [];
        result[1] = 0;
        for(let lv = 2; lv <= 100; lv++) {
            result[lv] = Math.ceil(Math.pow(lv, 3+(lv/200)));
        }
        return result;
    }();
    
    function xpToLevel(xp) {
        if(xp <= 0) {
            return 1;
        }
        if(xp >= LEVELS[100]) {
            return 100;
        }
        let lower = 1;
        let upper = 100;
        while(lower <= upper) {
            let mid = Math.floor((lower + upper) / 2);
            let midXP = LEVELS[mid];
            let midPlus1XP = LEVELS[mid+1];
            if(xp < midXP) {
                upper = mid;
                continue;
            }
            if(xp > midPlus1XP) {
                lower=mid+1;
                continue;
            }
            if(mid<100 && xp == LEVELS[mid+1]) {
                return mid+1;
            }
            return mid;
        }
    }

    extendedLevelsUpdate() {
        let overallLevel = 0;

        const xpMining = IdlePixelPlus.getVarOrDefault("mining_xp", 0, "int");
        const extendedLevelMining = this.calculateExtendedLevel(xpMining);

        const xpCrafting = IdlePixelPlus.getVarOrDefault("crafting_xp", 0, "int");
        const extendedLevelCrafting = this.calculateExtendedLevel(xpCrafting);

        const xpGathering = IdlePixelPlus.getVarOrDefault("gathering_xp", 0, "int");
        const extendedLevelGathering = this.calculateExtendedLevel(xpGathering);

        const xpFarming = IdlePixelPlus.getVarOrDefault("farming_xp", 0, "int");
        const extendedLevelFarming = this.calculateExtendedLevel(xpFarming);

        const xpBrewing = IdlePixelPlus.getVarOrDefault("brewing_xp", 0, "int");
        const extendedLevelBrewing = this.calculateExtendedLevel(xpBrewing);

        const xpWoodcutting = IdlePixelPlus.getVarOrDefault("woodcutting_xp", 0, "int");
        const extendedLevelWoodcutting = this.calculateExtendedLevel(xpWoodcutting);

        const xpCooking = IdlePixelPlus.getVarOrDefault("cooking_xp", 0, "int");
        const extendedLevelCooking = this.calculateExtendedLevel(xpCooking);

        const xpFishing = IdlePixelPlus.getVarOrDefault("fishing_xp", 0, "int");
        const extendedLevelFishing = this.calculateExtendedLevel(xpFishing);

        const xpInvention = IdlePixelPlus.getVarOrDefault("invention_xp", 0, "int");
        const extendedLevelInvention = this.calculateExtendedLevel(xpInvention);

        const xpMelee = IdlePixelPlus.getVarOrDefault("melee_xp", 0, "int");
        const extendedLevelMelee = this.calculateExtendedLevel(xpMelee);

        const xpArchery = IdlePixelPlus.getVarOrDefault("archery_xp", 0, "int");
        const extendedLevelArchery = this.calculateExtendedLevel(xpArchery);

        const xpMagic = IdlePixelPlus.getVarOrDefault("magic_xp", 0, "int");
        const extendedLevelMagic = this.calculateExtendedLevel(xpMagic);

        overallLevel = extendedLevelMining + extendedLevelCrafting + extendedLevelGathering + extendedLevelFarming + extendedLevelBrewing + extendedLevelWoodcutting + extendedLevelCooking + extendedLevelFishing + extendedLevelInvention + extendedLevelMelee + extendedLevelArchery + extendedLevelMagic;

        // Build new levels in place.
        this.updateExtendedLevel("mining", extendedLevelMining);
        this.updateExtendedLevel("crafting", extendedLevelCrafting);
        this.updateExtendedLevel("gathering", extendedLevelGathering);
        this.updateExtendedLevel("farming", extendedLevelFarming);
        this.updateExtendedLevel("brewing", extendedLevelBrewing);
        this.updateExtendedLevel("woodcutting", extendedLevelWoodcutting);
        this.updateExtendedLevel("cooking", extendedLevelCooking);
        this.updateExtendedLevel("fishing", extendedLevelFishing);
        this.updateExtendedLevel("invention", extendedLevelInvention);
        this.updateExtendedLevel("melee", extendedLevelMelee);
        this.updateExtendedLevel("archery", extendedLevelArchery);
        this.updateExtendedLevel("magic", extendedLevelMagic);

        this.updateOverallLevel(overallLevel);

        // Hide original level elements
        this.hideOriginalLevels();
    }

    calculateExtendedLevel(xp) {
        let extendedLevel = 0;
        while (Math.pow(extendedLevel, (3 + (extendedLevel / 200))) < xp) {
            extendedLevel++;
        }
        if(extendedLevel == 0) {
            return 1;
        }
        return extendedLevel - 1;
    }

    updateExtendedLevel(skill, extendedLevel) {
        const skillElement = document.querySelector(`#overallLevelExtended-${skill}`);
        const colorStyle = extendedLevel >= 100 ? "color:cyan" : "";
        skillElement.textContent = `(LEVEL ${Math.max(extendedLevel, 1)})`;
        skillElement.setAttribute("style", colorStyle);
    }

    updateOverallLevel(overallLevel) {
        const totalElement = document.querySelector("#overallLevelExtended-total");
        if (overallLevel >= 100) {
            totalElement.textContent = ` (${overallLevel})`;
            totalElement.style.color = "cyan";
            /*if(document.querySelector("#top-bar > a:nth-child(4) > item-display")) {
                document.querySelector("#top-bar > a:nth-child(4) > item-display").style.display = "none";
            } else {
                document.querySelector("#top-bar > a:nth-child(5) > item-display").style.display = "none";
            }*/
        } else {
            totalElement.textContent = "";
            totalElement.style.display = "none";
        }
    }

    hideOriginalLevels() {
        const skills = [
            "mining", "crafting", "gathering", "farming", "brewing", "woodcutting", "cooking",
            "fishing", "invention", "melee", "archery", "magic"
        ];

        skills.forEach(skill => {
            const skillElement = document.querySelector(`#menu-bar-${skill}-level`);
            if (skillElement) {
                skillElement.style.display = "none";
            }
        });
    }


	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();