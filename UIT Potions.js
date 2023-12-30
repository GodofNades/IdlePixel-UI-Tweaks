// ==UserScript==
// @name         IdlePixel UIT - Potion Info
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

    const POTION_XP_MAP = {
        "stardust_potion": 75,
        "energy_potion": 50,
        "anti_disease_potion": 250,
        "tree_speed_potion": 525,
        "smelting_upgrade_potion": 550,
        "great_stardust_potion": 1925,
        "farming_speed_potion": 500,
        "rare_monster_potion": 2125,
        "super_stardust_potion": 4400,
        "gathering_unique_potion": 3000,
        "heat_potion": 2500,
        "bait_potion": 1000,
        "bone_potion": 1550,
        "furnace_speed_potion": 6000,
        "promethium_potion": 2000,
        "oil_potion": 5000,
        "super_rare_monster_potion": 6000,
        "ultra_stardust_potion": 12900,
        "magic_shiny_crystal_ball_potion": 7000,
        "birdhouse_potion": 800,
        "rocket_potion": 1500,
        "titanium_potion": 5000,
        "blue_orb_potion": 50000,
        "geode_potion": 9500,
        "magic_crystal_ball_potion": 12000,
        "stone_converter_potion": 4000,
        "rain_potion": 2500,
        "combat_loot_potion": 9500,
        "rotten_potion": 1250,
        "merchant_speed_potion": 50000,
        "green_orb_potion": 200000,
        "guardian_key_potion": 42500,
        "ancient_potion": 40000,
        "red_orb_potion": 500000,
        "cooks_dust_potion": 100000,
        "farm_dust_potion": 100000,
        "fighting_dust_potion": 100000,
        "tree_dust_potion": 100000,
        "infinite_oil_potion": 0
    }

    addTableCraftLabels() {
        // Invention Table
        const inventionTableRows = document.querySelectorAll('#invention-table tbody tr[data-tablette-required]');
        inventionTableRows.forEach(row => {
            const outputs = row.querySelectorAll('td:nth-child(4) item-invention-table');
            outputs.forEach(output => {
                output.textContent = Number(output.textContent).toLocaleString() + " (" + output.getAttribute("data-materials-item").replaceAll("_", " ") + ")";
            });
        });

        // Crafting Table
        const craftingTableRows = document.querySelectorAll('#crafting-table tbody tr[data-crafting-item]');
        craftingTableRows.forEach(row => {
            const outputs = row.querySelectorAll('td:nth-child(3) item-crafting-table');
            outputs.forEach(output => {
                output.textContent = Number(output.textContent).toLocaleString() + " (" + output.getAttribute("data-materials-item").replaceAll("_", " ") + ")";
            });
        });

        // Brewing Table
        const brewingTableRows = document.querySelectorAll('#brewing-table tbody tr[data-brewing-item]');
        brewingTableRows.forEach(row => {
            const outputs = row.querySelectorAll('td:nth-child(3) item-brewing-table');
            outputs.forEach(output => {
                output.textContent = output.textContent + " (" + output.getAttribute("data-materials-item").replaceAll("_", " ") + ")";
            });
        });
    }

    updateTableCraftLabels() {
        const brewingTable = document.querySelector("#brewing-table");
        if (brewingTable) {
            const rows = brewingTable.querySelectorAll("tbody tr[data-brewing-item]");
            rows.forEach(row => {
                const brewingXP = row.querySelector("td:nth-child(6)");
                if (brewingXP) {
                    const potionName = brewingXP.id.replace("_xp", "");
                    const potionXP = POTION_XP_MAP[potionName].toLocaleString() + " xp";
                    const potionOrig = document.createElement("span");
                    potionOrig.classList.add("font-small", "color-grey");
                    potionOrig.textContent = potionXP;
                    brewingXP.innerHTML = "";
                    brewingXP.appendChild(potionOrig);
                }
            });
        }
    }


    /* 	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel; */
})();