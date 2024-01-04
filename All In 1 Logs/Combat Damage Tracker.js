// ==UserScript==
// @name         IdlePixel Combat Damage Tracker
// @namespace    com.godofnades.idlepixel
// @version      1.2.6
// @description  IdlePixel Combat Damage Tracker for those that want to know how their weapons are doing
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// ==/UserScript==

(function () {
    "use strict";

    let combatActive = false;
    let hitCountPlayer = 0;
    let hitCountMonster = 0;
    let fightCount = 0;
    let monster = "None";
    let monsterImg = "None";
    let combatLog = [];
    let fightStart = new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        fractionalSecondDigits: 3,
        hour12: false,
    });
    let previousHitPlayer = new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        fractionalSecondDigits: 3,
        hour12: false,
    });
    let previousHitMonster = new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        fractionalSecondDigits: 3,
        hour12: false,
    });

    class CombatDamageTracker extends IdlePixelPlusPlugin {
        constructor() {
            super("combatdmgtracker", {
                about: {
                    name: `IdlePixel Combat Damage Tracker (ver: 1.2.6)`,
                    version: `1.2.6`,
                    author: `GodofNades`,
                    description: `IdlePixel Combat Damage Tracker for those that want to know how their weapons are doing`,
                },
                config: [
                    {
                        id: "textareaLines",
                        label: "Number of lines to display on Combat Damage Log. (Max 10000)",
                        type: "integer",
                        min: 1,
                        max: 10000,
                        default: 1000,
                    },
                ],
            });
        }

        initStyles() {
            const css = `
                div#dmg-table-div {
                  height: 600px;
                  width: fit-content;
                  overflow: auto;
                  display: block;
                  margin:auto;
                  background-color: black;
                }
                table#dmg-table-table {
                    border-collapse: separate;
                    border: 0;
                    border-spacing: 0;
                }
                td.dmg-table-cell {
                  /* Apply styles to table cells (td) and table header cells (th) here */
                  border: 1px solid #708090;
                  color: white;
                  text-align: center;
                  padding: 0.5em 1em;
                  /* Add any other styles you need */
                }
                td.dmg-table-cell-group {
                  /* Apply styles to table cells (td) and table header cells (th) here */
                  border: 1px solid #708090;
                  color: white;
                  text-align: center;
                  padding: 0.5em 1em;
                  /* Add any other styles you need */
                }
                td.dmg-table-cell.damage-table-crit {
                    color: #FF8000;
                }
                th.dmg-table-header {
                  border: 1px solid #708090;
                  background-color: black;
                  color: white;
                  text-align: center;
                  font-size: x-large;
                  padding: 0 1em;
                }
                tr.damage-table-header-row {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                tr.damage-table-monster-row {
                    background-color: #2c2c2c;
                }
                tr.damage-table-player-row {
                    background-color: #000;
                }
                tr.damage-table-grouping-row {
                    background-color: darkgreen;
                }
                img.damage-table-image {
                    height: 1em;
                    margin: 0 0.1em 0 0.5em;
                    vertical-align: baseline;
                }
                span.damage-table-stats {
                    white-space: nowrap;
                }
                p.damage-subheader {
                        -webkit-text-stroke: 1px #00f7ff;
                        font-size: 20pt;
                        font-weight: bold;
                        text-align: center;
                        background-color: #000;
                }
                p.damage-footer {
                        font-weight: bold;
                        text-align: center;
                        background-color: #000;
                        justify-content: center;
                }
                span.damage-footer-player {
                        font-size: 14pt;
                        font-weight: bold;
                        text-align: center;
                        color: white;
                        background-color: #000;
                }
                span.damage-footer-monster {
                        font-size: 14pt;
                        font-weight: bold;
                        text-align: center;
                        color: white;
                        background-color: #2c2c2c;
                }
                span.damage-footer-crit {
                        font-size: 14pt;
                        font-weight: bold;
                        text-align: center;
                        color: #FF8000;
                        background-color: #000;
              `;
            const styleSheet = document.createElement("style");
            styleSheet.innerHTML = css;
            document.head.appendChild(styleSheet);
        }

        createPanel() {
            let cdlModalHTML =  `
        <div id="modal-style-cdl" style="display: none">
            <div style="position: absolute; top: 0px; left: 0px; width: 98vw; height: 100vh;">
                <div id="cdl-modal-base_window" style="position: absolute; top: 10vh; left: 25vw; width: 50vw; height: 85vh; text-align: center; border: 1px solid grey; background-color: rgb(0, 0, 0); border-radius: 20px; padding: 20px; z-index: 10000;">
                    <div id="close-button" style="background-color: red; width: 30px; height: 30px; position: absolute; top: 10px; right: 10px; border-radius: 50%; cursor: pointer;">
                        <p style="color: white; font-size: 20px; font-weight: bold; text-align: center; line-height: 30px;">X</p>
                    </div>
                    <br/>
                    <p class="damage-subheader">Your Recent Combat Damage Log</p>
                    <div class="dmg-table" id="dmg-table-div">
                        <table id="dmg-table-table" style="column-count: 8">
                            <tbody>
                                <tr class ="damage-table-header-row">
                                    <th class="dmg-table-header">Hit Count</th>
                                    <th class="dmg-table-header">Player Stats</th>
                                    <th class="dmg-table-header">Monster Stats</th>
                                    <th class="dmg-table-header">Weapon</th>
                                    <th class="dmg-table-header">Damage</th>
                                    <th class="dmg-table-header">DPS</th>
                                    <th class="dmg-table-header">Delay</th>
                                    <th class="dmg-table-header">Time</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    </br>
                    <p class="damage-footer">
                        <span class="damage-footer-player">| Player attacks have a Black background. |</span>
                        <span class="damage-footer-monster">| Monster attacks have a Grey background. |</span>
                        <span class="damage-footer-crit">| Player critical hits have Orange text. |</span>
                    </p>
                    </br>
                </div>
            </div>
        </div>
    `;

            const contentDiv = document.getElementById('content');
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = cdlModalHTML;
            contentDiv.appendChild(modalContainer);

            const onlineCount = document.querySelector(".top-bar .gold:not(#top-bar-admin-link)");
            const linkElement = document.createElement('a');
            linkElement.href = '#';
            linkElement.className = 'hover float-end link-no-decoration';
            linkElement.title = 'Combat Damage Log';
            linkElement.textContent = 'Damage' + '\u00A0\u00A0\u00A0';

            onlineCount.insertAdjacentElement('beforebegin', linkElement);

            // Get the modal and the close button
            const modalStyleCdl = document.getElementById('modal-style-cdl');
            const closeButton = document.getElementById('close-button');

            // Open the modal when clicking on the linkElement
            linkElement.addEventListener('click', function (event) {
                event.preventDefault();
                modalStyleCdl.style.display = 'block';
            });

            // Close the modal when clicking on the red button
            closeButton.addEventListener('click', function () {
                modalStyleCdl.style.display = 'none';
            });

            modalStyleCdl.addEventListener('click', function(event) {
                // Check if the click happened outside the modal window
                const isClickInside = document.getElementById('cdl-modal-base_window').contains(event.target);

                if (!isClickInside) {
                    // If the click is outside, hide the modal
                    modalStyleCdl.style.display = 'none';
                }
            });
        }

        handleGroupingHeaders(key, valueBefore, valueAfter) {
            if(valueBefore != valueAfter) {
                const groupingRowID = `fight-${fightCount}-${valueBefore}`;
                const monsterAcc = IdlePixelPlus.getVarOrDefault("monster_accuracy", 0, "int");
                const monsterDef = IdlePixelPlus.getVarOrDefault("monster_defence", 0, "int");
                const monsterSpd = IdlePixelPlus.getVarOrDefault("monster_speed", 0, "int");
                const monsterDmg = IdlePixelPlus.getVarOrDefault("monster_attack", 0, "int");
                const monsterCurrentHP = IdlePixelPlus.getVarOrDefault("monster_hp", 0, "int");
                const monsterMaxHP = IdlePixelPlus.getVarOrDefault("monster_max_hp", 0, "int");
                const groupingRow = `<tr id="${groupingRowID}-head" class="damage-table-grouping-row">
    <td class="dmg-table-cell-group" colspan="8">
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/${monsterImg}.png"> ${monster}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/upgraded_heal_spell_icon.png"> ${monsterMaxHP}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/melee_damage_white.png">${monsterDmg}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/accuracy_white.png"> ${monsterAcc}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/defence_white.png">${monsterDef}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/speed_white.png">${monsterSpd}</span>
        <span class="damage-table-stats"> @ ${fightStart}</span>
    </td>
</tr>`;

                const matchingRows = document.querySelectorAll(`tr[id^="fight-${fightCount}-${valueBefore}"`);
                const firstRowMatch = matchingRows[0];
                const tempDiv = document.createElement('tbody');
                tempDiv.innerHTML = groupingRow;
                const groupingRowElement = tempDiv.firstElementChild;

                if(firstRowMatch) {
                    firstRowMatch.insertAdjacentElement('beforebegin', groupingRowElement);
                } else {
                    console.log("Combat too quick for Combat Damage Log to get the information");
                }

                groupingRowElement.addEventListener('click', () => {
                    matchingRows.forEach((row) => {
                        // Toggle the visibility of matching rows
                        row.style.display = (row.style.display === 'none' || row.style.display === '') ? 'table-row' : 'none';
                    });
                    groupingRowElement.style.backgroundColor = (groupingRowElement.style.backgroundColor === 'darkgreen' || groupingRowElement.style.backgroundColor === '') ? 'darkblue' : 'darkgreen';
                });

                const toggleSpans = groupingRowElement.querySelectorAll('.toggle-button');
                toggleSpans.forEach((span) => {
                    span.addEventListener('click', (event) => {
                        matchingRows.forEach((row) => {
                            // Toggle the visibility of matching rows
                            row.style.display = (row.style.display === 'none' || row.style.display === '') ? 'table-row' : 'none';
                        });
                        event.stopPropagation(); // Prevent click event from propagating to the groupingRow
                    });
                });

                matchingRows.forEach((row) => {
                    row.style.display = "none";
                })

                const combatLogInsert = [
                    {
                        type: "grouping",
                        monsterStats: {
                            monster: monster,
                            hpCurrent: monsterCurrentHP,
                            hpMax: monsterMaxHP,
                            damage: monsterDmg,
                            accuracy: monsterAcc,
                            defense: monsterDef,
                            speed: monsterSpd,
                        },
                        time: fightStart
                    }
                ]
                const combatLogStringify = JSON.stringify(combatLogInsert);
                combatLog.push(combatLogStringify);
                //console.log(combatLog);
                //this.saveData();
            }
        }

        onCombatStart() {
            combatActive = true;
            previousHitPlayer = new Date();
            previousHitMonster = new Date();
            hitCountPlayer = 0;
            hitCountMonster = 0;
            fightCount++;
            fightStart = new Date().toLocaleString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
            });
        }

        onCombatEnd() {
            combatActive = false;
            //this.handleGroupingHeaders();
            previousHitPlayer = null;
            previousHitMonster = null;
            hitCountPlayer = 0;
            hitCountMonster = 0;
        }

        onMessageReceived(data) {
            if (
                combatActive &&
                data.startsWith("HITSPLAT_ON_") &&
                !data.includes("heal_spell.png")
            ) {
                let [damage, weapon, text, hitType] = data
                .replaceAll("HITSPLAT_ON_MONSTER=", "")
                .replaceAll("HITSPLAT_ON_HERO=", "")
                .replaceAll("sword_icon", "basic attack")
                .replaceAll("images/", "")
                .replaceAll("ball", "")
                .replaceAll("_icon", "")
                .replaceAll("_spell", "")
                .replace(".png", "")
                .replaceAll("_", " ")
                .split("~");

                monster = IdlePixelPlus.getVarOrDefault("monster_name", "none")
                    .replaceAll("_", " ")
                    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());

                monsterImg = IdlePixelPlus.getVarOrDefault("monster_name", "none");

                if (monsterImg == ("guardian_two")) {
                    monsterImg+="_monster_idle_0"
                } else if (monsterImg == ("guardian_three")) {
                    monsterImg+="_monster_idle_0"
                } else if(!monsterImg.startsWith("robot")) {
                    monsterImg+="_icon";
                }

                let weaponImgParse = data
                .replaceAll("HITSPLAT_ON_MONSTER=", "")
                .replaceAll("HITSPLAT_ON_HERO=", "")
                .replaceAll("images/", "")
                .split("~");

                let weaponImg = weaponImgParse[1];

                let arrows = IdlePixelPlus.getVarOrDefault("arrows", "none")
                .replaceAll("_", " ")
                .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());

                let damageIcon = "melee";

                weapon = weapon.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());

                const bowNames = ["Wooden Bow", "Long Bow", "Haunted Bow", "Balista"];
                if (bowNames.includes(weapon)) {
                    weapon += ` (${arrows})`;
                    damageIcon = "arrow";
                }

                const timeStamp = new Date().toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    fractionalSecondDigits: 3,
                    hour12: false,
                });
                let hitDelay = "";
                if(data.includes("HITSPLAT_ON_MONSTER=")) {
                    hitDelay = (Date.parse(timeStamp) - Date.parse(previousHitPlayer)) / 1000;
                } else {
                    hitDelay = (Date.parse(timeStamp) - Date.parse(previousHitMonster)) / 1000;
                }
                const totalDmg = damage.split(", ").reduce((a, c) => (a += parseInt(c)), 0);

                const damageBreakdown = damage.split(", ").length > 1 ? `[${damage}]` : ``;

                let dps = Math.round((totalDmg / hitDelay) * 1000) / 1000;


                const ignoreHitTimer = ["Fire", "Reflect", "Cannon", "Poison"];
                if (!ignoreHitTimer.includes(weapon)) {
                    if(data.includes("HITSPLAT_ON_MONSTER=")) {
                        previousHitPlayer = timeStamp;
                    } else {
                        previousHitMonster = timeStamp;
                    }
                } else {
                    dps = "*";
                    hitDelay = "*";
                }

                const monsterAcc = IdlePixelPlus.getVarOrDefault("monster_accuracy", 0, "int");
                const monsterDef = IdlePixelPlus.getVarOrDefault("monster_defence", 0, "int");
                const monsterSpd = IdlePixelPlus.getVarOrDefault("monster_speed", 0, "int");
                const monsterDmg = IdlePixelPlus.getVarOrDefault("monster_attack", 0, "int");
                const monsterCurrentHP = IdlePixelPlus.getVarOrDefault("monster_hp", 0, "int");
                const monsterMaxHP = IdlePixelPlus.getVarOrDefault("monster_max_hp", 0, "int");

                const playerAcc = IdlePixelPlus.getVarOrDefault("accuracy", 0, "int");
                const playerDef = IdlePixelPlus.getVarOrDefault("defence", 0, "int");
                const playerSpd = IdlePixelPlus.getVarOrDefault("speed", 0, "int");
                const playerMeleeDmg = IdlePixelPlus.getVarOrDefault("melee_damage", 0, "int");
                const playerRangedDmg = IdlePixelPlus.getVarOrDefault("arrow_damage", 0, "int");
                const playerMagicDmg = IdlePixelPlus.getVarOrDefault("magic_bonus", 0, "int");
                const playerCurrentHP = IdlePixelPlus.getVarOrDefault("hp", 0, "int");
                const playerMaxHP = IdlePixelPlus.getVarOrDefault("max_hp", 0, "int");
                const playerCurrentMana = IdlePixelPlus.getVarOrDefault("mana", 0, "int");
                const playerMaxMana = IdlePixelPlus.getVarOrDefault("max_mana", 0, "int");

                let myTable = document.querySelector("#dmg-table-table");

                const crit = data.includes("rgba(255,128,0,0.6)");

                const heroIsAttacked = data.startsWith("HITSPLAT_ON_HERO=");


                const row = `<tr id="fight-${fightCount}-${monsterImg}" class="${heroIsAttacked ? "damage-table-monster-row" : "damage-table-player-row"}">
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">${++hitCountPlayer}</td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/upgraded_heal_spell_icon.png"> ${playerCurrentHP}/${playerMaxHP}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/mana.png"> ${playerCurrentMana}/${playerMaxMana}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/melee_damage_white.png">${playerMeleeDmg}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/arrow_damage_white.png">${playerRangedDmg}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/magic_damage_white.png">${playerMagicDmg}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/accuracy_white.png">${playerAcc}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/defence_white.png">${playerDef}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/speed_white.png">${playerSpd}</span>
    </td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/${monsterImg}.png"> ${monster}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/upgraded_heal_spell_icon.png"> ${monsterCurrentHP}/${monsterMaxHP}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/melee_damage_white.png">${monsterDmg}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/accuracy_white.png"> ${monsterAcc}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/defence_white.png">${monsterDef}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/speed_white.png">${monsterSpd}</span>
    </td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}"><img style="height: 1em;margin: 0 0.1em 0 0.5em;vertical-align: baseline;" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/${weaponImg}"> ${weapon}</td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">${totalDmg} ${damageBreakdown}</td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">${dps}</td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">${hitDelay}</td>
    <td class="dmg-table-cell${crit ? " damage-table-crit" : ""}">${timeStamp}</td>
</tr>`;

            const tableheaderrow = document.querySelector(".damage-table-header-row");
            tableheaderrow.insertAdjacentHTML("afterend", row);

            const combatLogInsert = [
                {
                    type: "normal",
                    hitCount: hitCountPlayer,
                    playerStats: {
                        hpCurrent: playerCurrentHP,
                        hpMax: playerMaxHP,
                        manaCurrent: playerCurrentMana,
                        manaMax: playerMaxMana,
                        melee: playerMeleeDmg,
                        ranged: playerRangedDmg,
                        magic: playerMagicDmg,
                        accuracy: playerAcc,
                        defense: playerDef,
                        speed: playerSpd,
                    },
                    monsterStats: {
                        monster: monster,
                        hpCurrent: monsterCurrentHP,
                        hpMax: monsterMaxHP,
                        damage: monsterDmg,
                        accuracy: monsterAcc,
                        defense: monsterDef,
                        speed: monsterSpd,
                    },
                    weapon: weapon,
                    weaponImg: weaponImg,
                    damage: totalDmg,
                    breakdown: damageBreakdown,
                    dps: dps,
                    delay: hitDelay,
                    time: timeStamp
                }
            ]
            const combatLogStringify = JSON.stringify(combatLogInsert);
            combatLog.push(combatLogStringify);
            //console.log(combatLog);
            //this.saveData();
        }
    }

    saveData() {
        this.saveCombatLogToLocalStorage(combatLog);
    }

    saveCombatLogToLocalStorage(combatLogData) {
        const dataString = JSON.stringify(combatLogData);
        localStorage.setItem('combatLogData', dataString);
    }

    loadCombatLogFromLocalStorage() {
        const dataString = localStorage.getItem('combatLogData');

        if (dataString) {
            const parsedLog = JSON.parse(dataString);

            if (Array.isArray(parsedLog)) {
                // Ensure that the parsed data is an array of objects
                return parsedLog;
            } else {
                console.error('Data in local storage is not an array:', parsedLog);
            }
        }

        return [];
    }

    hitDataLoad(data) {
        console.log("Hit Data: "+data);
    }

    groupingDataLoad(data) {
        const groupingRowID = "Temp";
        const monsterImg = data.monsterStats.monsterImg;
        const monster = data.monsterStats.monster;
        const monsterMaxHP = data.monsterStats.hpMax;
        const monsterDmg = data.monsterStats.damage;
        const monsterAcc = data.monsterStats.accuracy;
        const monsterDef = data.monsterStats.defense;
        const monsterSpd = data.monsterStats.speed;
        const fightStart = data.time;
        const groupingRow = `<tr id="${groupingRowID}-head" class="damage-table-grouping-row">
    <td class="dmg-table-cell-group" colspan="8">
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/${monsterImg}.png"> ${monster}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/upgraded_heal_spell_icon.png"> ${monsterMaxHP}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/melee_damage_white.png">${monsterDmg}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/accuracy_white.png"> ${monsterAcc}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/defence_white.png">${monsterDef}</span>
        <span class="damage-table-stats"><img class="damage-table-image" src="https://idlepixel.s3.us-east-2.amazonaws.com/images/speed_white.png">${monsterSpd}</span>
        <span class="damage-table-stats"> @ ${fightStart}</span>
    </td>
</tr>`;
            console.log(groupingRow)
            /*
                const matchingRows = document.querySelectorAll(`tr[id^="fight-${fightCount}-${valueBefore}"`);
                const firstRowMatch = matchingRows[0];
                const tempDiv = document.createElement('tbody');
                tempDiv.innerHTML = groupingRow;
                const groupingRowElement = tempDiv.firstElementChild;

                firstRowMatch.insertAdjacentElement('beforebegin', groupingRowElement);

                groupingRowElement.addEventListener('click', () => {
                    matchingRows.forEach((row) => {
                        // Toggle the visibility of matching rows
                        row.style.display = (row.style.display === 'none' || row.style.display === '') ? 'table-row' : 'none';
                    });
                    groupingRowElement.style.backgroundColor = (groupingRowElement.style.backgroundColor === 'darkgreen' || groupingRowElement.style.backgroundColor === '') ? 'darkblue' : 'darkgreen';
                });

                const toggleSpans = groupingRowElement.querySelectorAll('.toggle-button');
                toggleSpans.forEach((span) => {
                    span.addEventListener('click', (event) => {
                        matchingRows.forEach((row) => {
                            // Toggle the visibility of matching rows
                            row.style.display = (row.style.display === 'none' || row.style.display === '') ? 'table-row' : 'none';
                        });
                        event.stopPropagation(); // Prevent click event from propagating to the groupingRow
                    });
                });
                */
        }

    updateTableWithLoadedData() {
        const combatLogData = this.loadCombatLogFromLocalStorage();
        console.log(combatLogData);

        combatLogData.forEach((hitJSON) => {
            const data = JSON.parse(hitJSON);

            if (Array.isArray(data) && data.length > 0) {
                const firstObject = data[0];
                if ('type' in firstObject) {
                    const typeValue = firstObject.type;
                    if(typeValue == "normal") {
                        this.hitDataLoad(firstObject);
                    } else {
                        this.groupingDataLoad(firstObject);
                    }
                    console.log('Type:', typeValue);
                } else {
                    console.log('The "type" property is missing in the JSON object.');
                }
            } else {
                console.log('The JSON data is not in the expected format (array of objects).');
            }
        });
    }

    onLogin() {
        this.initStyles();
        this.createPanel();
        //this.updateTableWithLoadedData();
    }

    onVariableSet(key, valueBefore, valueAfter) {
        if(key.includes("monster_name")) {
            if(valueBefore != "none" && valueBefore) {
                this.handleGroupingHeaders(key, valueBefore, valueAfter);
            }
        }
    }
}

 const plugin = new CombatDamageTracker();
IdlePixelPlus.registerPlugin(plugin);
})();