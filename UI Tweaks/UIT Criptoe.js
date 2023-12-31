// ==UserScript==
// @name         IdlePixel UIT - Criptoe
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

    updateCrippledToeTimer() {
        var now = new Date(); // Create a new date object with the current date and time
        var hours = now.getUTCHours(); // Get the hours value in UTC
        var minutes = now.getUTCMinutes(); // Get the minutes value in UTC
        var seconds = now.getUTCSeconds(); // Get the seconds value in UTC

        // Pad the hours, minutes, and seconds with leading zeros if they are less than 10
        hours = hours.toString().padStart(2, '0');
        minutes = minutes.toString().padStart(2, '0');
        seconds = seconds.toString().padStart(2, '0');

        // Concatenate the hours, minutes, and seconds with colons

        const menuBarCrippledtoeRow = document.querySelector('#left-panel-criptoe_market-btn table tbody tr');

        // Find the cell that contains the text "CRIPTOE MARKET"
        const cells = menuBarCrippledtoeRow.getElementsByTagName('td');
        let criptoeMarketCell = null;
        for (let cell of cells) {
            if (cell.textContent.includes('CRIPTOE MARKET')) {
                criptoeMarketCell = cell;
                break;
            }
        }
        if (criptoeMarketCell) {
            criptoeMarketCell.innerHTML = `CRIPTOE MARKET <span style="color:cyan;">(${hours + ':' + minutes + ':' + seconds})<span>`
        }
    }
    
	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();