// ==UserScript==
// @name         IdlePixel SlapChop - Styles
// @namespace    godofnades.idlepixel
// @version      0.1.1
// @description  Split off of IdlePixel Slapchop for all style information.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	function initSlapchopStyles() {
		var style = document.createElement("style");
		style.id = "styles-slapchop";
		style.innerHTML = `
        #slapchop-quickfight, #slapchop-quickpreset {
            position: relative;
        }

        #slapchop-quickpreset > .slapchop-quickpreset-buttons {
            display: flex;
            flex-direction: row;
            justify-content: start;
        }

        #slapchop-quickpreset > .slapchop-quickpreset-buttons > div {
            display: flex;
            flex-direction: column;
            justify-content: start;
        }

        #slapchop-quickpreset > .slapchop-quickpreset-buttons > div > button {
            margin: 0.125em;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone {
            width: 150px;
            max-width: 150px;
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: center;
            position: relative;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone.blood button {
            font-weight: 550;
            background-color: rgb(136, 8, 8) !important;
            color: rgb(255,255,255);
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone.blood button:disabled {
            color: rgba(255,255,255,0.3);
            background-color: rgba(136, 8, 8, 0.3) !important;
        }
        
        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > * {
            width: 100%;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container {
            width: 100%;
            color: white;
            text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;
            text-align: left;
            position: relative;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container > .slapchop-quickfight-progress-value {
            position: relative;
            z-index: 5;
            margin-left: 4px;
            font-weight: bold;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container.slapchop-quickfight-fightpoints {
            background-color: rgba(255, 216, 0, 0.5);
            border: 1px solid rgb(255, 216, 0);
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container.slapchop-quickfight-fightpoints .slapchop-quickfight-progress {
            background-color: #ffd800;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container.slapchop-quickfight-energy {
            background-color: rgba(215, 0, 71, 0.5);
            border: 1px solid rgb(215, 0, 71);
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container.slapchop-quickfight-energy .slapchop-quickfight-progress {
            background-color: #d70047;
        }

        #slapchop-quickfight > .slapchop-quickfight-buttons .slapchop-quickfight-zone > .slapchop-quickfight-progress-container > .slapchop-quickfight-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0; /* will be overwritten inline */
            z-index: 3;
        }

        #slapchop-quicklamp > .slapchop-quickfight-buttons .slapchop-quickfight-zone {
            width: 150px;
            max-width: 150px;
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: center;
            position: relative;
        }

        #brewing-table .slapchop-quickbrew-button {
            border: 1px solid rgba(124, 218, 255, 0.86);
            background-color: rgba(124, 218, 255, 0.1);
            padding: 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0.5em auto 0.125em auto;
            max-width: 100px;
        }

        #brewing-table .slapchop-quickbrew-button:hover {
            background-color: rgba(69, 177, 216, 0.5);
        }

        #crafting-table .slapchop-rocketfuelmax-button {
            border: 1px solid rgba(124, 218, 255, 0.86);
            background-color: rgba(124, 218, 255, 0.1);
            padding: 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0.5em auto 0.125em auto;
            max-width: 150px;
        }

        #crafting-table .slapchop-rocketfuelmax-button:hover {
            background-color: rgba(69, 177, 216, 0.5);
        }

        #crafting-table .slapchop-rocketfuelsingle-button {
        border: 1px solid rgba(124, 218, 255, 0.86);
            background-color: rgba(124, 218, 255, 0.1);
            padding: 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0.5em auto 0.125em auto;
            max-width: 150px;
        }

        #crafting-table .slapchop-rocketfuelsingle-button:hover {
          background-color: rgba(69, 177, 216, 0.5);
        }

        #quick-lamp-zone {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }

        #lamp-zone-all {
            display: inline-flex;
        }

        #melee-lamp-zone {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: center;
            position: relative;
        }

        #archery-lamp-zone {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: center;
            position: relative;
            padding-left: 20px;
        }

        #magic-lamp-zone {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: center;
            position: relative;
            padding-left: 20px;
        }

        .fighting-monster-loot-potion {
            background-color: rgba(32, 36, 33, 0.67);
            border-color: rgb(255, 255, 255) rgb(255, 255, 255) rgb(255, 255, 255) rgb(255, 255, 255);
            color: rgb(232, 230, 227);
            border: 1px solid black;
            border-top-color: black;
            border-top-style: solid;
            border-top-width: 1px;
            border-right-color: black;
            border-bottom-color: black;
            border-bottom-style: solid;
            border-bottom-width: 1px;
            border-left-color: black;
            border-left-style: solid;
            border-left-width: 1px;
            padding: 10px;
            color: white;
            border-bottom-right-radius: 5px;
            border-top-right-radius: 5px;
            margin-right: -3px;
            margin-top: 20px;
        }

        .fighting-monster-rain-potion {
            background-color: rgba(38, 115, 153, 0.67);
            border-color: rgb(33, 207, 247);
            color: rgb(232, 230, 227);
            border: 1px solid black;
            border-top-color: black;
            border-top-style: solid;
            border-top-width: 1px;
            border-right-color: black;
            border-bottom-color: black;
            border-bottom-style: solid;
            border-bottom-width: 1px;
            border-left-color: black;
            border-left-style: solid;
            border-left-width: 1px;
            padding: 10px;
            color: white;
            border-bottom-right-radius: 5px;
            border-top-right-radius: 5px;
            margin-right: -3px;
            margin-top: 20px;
        }

        .lumberjack-rain-pot-woodcutting {
            width:100px;
            height:100px;
            display: inline-block;
            border:1px solid rgb(66, 66, 66);background: rgb(8,115,0);
            background: linear-gradient(0deg, rgba(8,115,0,1) 6%, rgba(55,45,253,1) 25%, rgba(55,45,253,1) 50%, rgba(101,101,101,1) 75%, rgba(52,52,52,1) 100%);
            border-radius: 5pt;
            color:white;
          }

        #rare_monster_potion-brew {
            padding: 3px; 
            width: 50px;
        }

        #rare_monster_potion-use {
            padding: 3px; 
            width: 50px;
        }

        #super_rare_monster_potion-brew {
            padding: 3px; 
            width: 50px;
        }

        #super_rare_monster_potion-use {
            padding: 3px; 
            width: 50px;
        }

        #combat_loot_potion-label {
            color: white;
        }

        #rain_potion-in-combat-label {
            color: white;
        }

        #rain_potion-brew {
            padding: 3px; 
            width: 50px;
        }

        #rain_potion-use {
            padding: 3px; 
            width: 50px;
        }

        .itembox-fight-center {
            margin-top: 0.55rem;
            text-align: center;
        }
        
        .center-flex {
            display: flex;
            justify-content: center;
            text-align: center;
        }      
        </style>
        `;
		document.head.appendChild(style);
	}

	window.initSlapchopStyles = initSlapchopStyles;
})();
