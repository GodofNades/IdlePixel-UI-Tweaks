// ==UserScript==
// @name         IdlePixel UIT - Mining Stuff
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

    miningMachTimer() {
        const drillNotifications = this.getConfig("hideDrillNotifications");

        if (drillNotifications) {
            document.getElementById("notification-drill").style.display = "none";
            document.getElementById("notification-crusher").style.display = "none";
            document.getElementById("notification-giant_drill").style.display = "none";
            document.getElementById("notification-excavator").style.display = "none";
            document.getElementById("notification-giant_excavator").style.display = "none";
            document.getElementById("notification-massive_excavator").style.display = "none";
        } else {
            const drill = IdlePixelPlus.getVarOrDefault("drill_on", 0, "int");
            const crusher = IdlePixelPlus.getVarOrDefault("crusher_on", 0, "int");
            const giant_drill = IdlePixelPlus.getVarOrDefault("giant_drill_on", 0, "int");
            const excavator = IdlePixelPlus.getVarOrDefault("excavator_on", 0, "int");
            const giant_excavator = IdlePixelPlus.getVarOrDefault("giant_excavator_on", 0, "int");
            const massive_excavator = IdlePixelPlus.getVarOrDefault("massive_excavator_on", 0, "int");

            if (drill > 0) {
                document.getElementById("notification-drill").style.display = "inline-block";
            }
            if (crusher > 0) {
                document.getElementById("notification-crusher").style.display = "inline-block";
            }
            if (giant_drill > 0) {
                document.getElementById("notification-giant_drill").style.display = "inline-block";
            }
            if (excavator > 0) {
                document.getElementById("notification-excavator").style.display = "inline-block";
            }
            if (giant_excavator > 0) {
                document.getElementById("notification-giant_excavator").style.display = "inline-block";
            }
            if (massive_excavator > 0) {
                document.getElementById("notification-massive_excavator").style.display = "inline-block";
            }
        }
    }

    
	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();