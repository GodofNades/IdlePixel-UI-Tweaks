// ==UserScript==
// @name         IdlePixel UIT - UI Fixes
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

    condensedUI() {
        let leftbar = document.getElementById('menu-bar-buttons')

        let styleElement = document.getElementById('condensed-ui-tweaks');

        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }
        document.getElementById('menu-bar-buttons')
            .querySelectorAll('.font-small')
            .forEach(function(smallFont) {
            let classInfo = smallFont.className.replaceAll('font-small', 'font-medium');
            smallFont.className = classInfo;
        });

        var spans = document.querySelectorAll('#menu-bar-cooking-table-btn-wrapper span');

        var cookingSpan = Array.from(spans).find(span => span.textContent === "COOKING");

        if (cookingSpan) {
            cookingSpan.className = "font-medium color-white";
        }

        leftbar.querySelectorAll('img').forEach(function(img) {
            img.className = "w20";
        });

        const style = document.createElement('style');
        style.id = 'condensed-ui-tweaks';
        style.textContent = `
        <style id="condensed-ui-tweaks">
        .game-menu-bar-left-table-btn tr
        {
          background-color: transparent !important;
          border:0 !important;
          font-size:medium;
        }
        .hover-menu-bar-item:hover {
          background: #256061 !important;
          border:0 !important;
          filter:unset;
          font-size:medium;
        }
        .thin-progress-bar {
          background:#437b7c !important;
          border:0 !important;
          height:unset;
        }
        .thin-progress-bar-inner {
          background:#88e8ea !important;
        }
        .game-menu-bar-left-table-btn td{
          padding-left:20px !important;
          padding:unset;
          margin:0px;
          font-size:medium;
        }
        .game-menu-bar-left-table-btn {
          background-color: transparent !important;
        }
        .left-menu-item {
          margin-bottom:unset;
          font-size:medium;
        }
        .left-menu-item > img {
          margin-left: 20px;
          margin-right: 20px;
        }
        </style>
        `;

        document.head.appendChild(style);
        setTimeout(function() {
            document.getElementById("market-sidecar").parentNode.parentNode.style.paddingLeft = "20px";
            document.getElementById("market-sidecar").parentNode.parentNode.style.padding = "";
        }, 1000);
        document.getElementById("left-menu-bar-labels").style.paddingBottom = "10px !important";
    }

    defaultUI() {
        var styleElement = document.getElementById('condensed-ui-tweaks');

        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }
    }
    
	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();