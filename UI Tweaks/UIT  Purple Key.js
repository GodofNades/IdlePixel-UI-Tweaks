// ==UserScript==
// @name         IdlePixel UIT - Purple Key
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

    let purpleKeyGo;
    const receivedFilter = ['OPEN_DIALOGUE=MESSAGE'];
    const currentTime = new Date();
    let startTime;
    let timeDiff;
    let purpleKeyTimer;

    function onPurpleKey(monster, rarity, timer) {
        if (purpleKeyGo) {
            const timeLeft = format_time(timer);
            const imageSrc = monster;
            const monsterName = imageSrc
            .replace(/_/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());

            const purpleKeyNotification = document.querySelector('#notification-purple_key');
            const imageElement = document.querySelector('#notification-purple_key-image');
            const imageTextElement = document.querySelector('#notification-purple_key-image-text');
            const rarityElement = document.querySelector('#notification-purple_key-rarity');
            const timeElement = document.querySelector('#notification-purple_key-time');

            imageElement.setAttribute("src", `https://d1xsc8x7nc5q8t.cloudfront.net/images/${imageSrc}_icon.png`);
            imageTextElement.innerText = `${monsterName} `;
            rarityElement.innerText = ` ${rarity}`;
            timeElement.innerText = ` ⏲️${timeLeft}`;

            if (rarity === "Very Rare") {
                purpleKeyNotification.style.backgroundColor = "DarkRed";
                [imageTextElement, rarityElement, timeElement].forEach(element => element.style.color = "white");
            } else {
                let textColor = "black";
                if (rarity === "Rare") {
                    purpleKeyNotification.style.backgroundColor = "orange";
                } else if (rarity === "Uncommon") {
                    purpleKeyNotification.style.backgroundColor = "gold";
                } else if (rarity === "Common") {
                    purpleKeyNotification.style.backgroundColor = "DarkGreen";
                    textColor = "white";
                }
                [imageTextElement, rarityElement, timeElement].forEach(element => element.style.color = textColor);
            }
            return;
        }

    }
    
	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();