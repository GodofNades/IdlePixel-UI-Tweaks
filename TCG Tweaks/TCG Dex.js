// ==UserScript==
// @name         IdlePixel TCG Dex
// @namespace    godofnades.idlepixel
// @version      0.1.10
// @description  Organizational script for the Criptoe Trading Card Game
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @license      MIT
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @downloadURL none
// ==/UserScript==

(function () {
    "use strict";

    // Load Font Awesome
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);

    let playername = "";
    window.TCG_IMAGE_URL_BASE =
        document
        .querySelector("itembox[data-item=copper] img")
        .src.replace(/\/[^/]+.png$/, "") + "/";
    let onLoginLoaded = false;
    let dupeSending = false;
    let newCardTimer;

    let categoriesTCG = [];
    let currentCards = [];
    let overallCardCounts = {};
    let duplicateToSend = {};
    const cardCounts = function() {
        return {
            calculateCardCounts: function () {
                let cardCount = {};

                categoriesTCG.forEach((category) => {
                    cardCount[category.desc] = {
                        uniHolo: 0,
                        ttlHolo: 0,
                        uniNormal: 0,
                        ttlNormal: 0,
                        possHolo: 0,
                        possNormal: 0,
                        possUniHolo: 0,
                        possUniNormal: 0,
                    };
                });

                overallCardCounts = {
                    overallUniHolo: 0,
                    overallHolo: 0,
                    overallTTL: 0,
                    overallUniNormal: 0,
                    overallNormal: 0,
                };

                Object.values(CardData.data).forEach((card) => {
                    const category = categoriesTCG.find(
                        (c) => c.id === `[${card.description_title}]`
				);
                    if (category) {
                        cardCount[category.desc].uniHolo++;
                        cardCount[category.desc].uniNormal++;
                        overallCardCounts.overallTTL++;
                    }
                });

                const uniHoloSetOverall = new Set();
                const uniNormalSetOverall = new Set();

                currentCards.forEach((card) => {
                    const category = Object.entries(CardData.data).find(
                        (c) => c[0] === card.id
                    );
                    if (category) {
                        if (card.holo) {
                            cardCount[category[1].description_title].possHolo++;
                            cardCount[category[1].description_title].ttlHolo++;
                            overallCardCounts.overallHolo++;
                            if (!uniHoloSetOverall.has(card.id)) {
                                uniHoloSetOverall.add(card.id);
                                overallCardCounts.overallUniHolo++;
                                cardCount[category[1].description_title].possUniHolo++;
                            }
                        } else {
                            cardCount[category[1].description_title].possNormal++;
                            cardCount[category[1].description_title].ttlNormal++;
                            overallCardCounts.overallNormal++;
                            if (!uniNormalSetOverall.has(card.id)) {
                                uniNormalSetOverall.add(card.id);
                                overallCardCounts.overallUniNormal++;
                                cardCount[category[1].description_title].possUniNormal++;
                            }
                        }
                    }
                });
                return cardCount;
            }
        }
    }

    window.cardCounts = cardCounts;

    const bgColorDexRows = {
        "ORE": "#734d26",
        "BAR": "#3d3d29",
        "SEED": "#1a3300",
        "WOOD": "#663300",
        "LEAF": "#669900",
        "GEM": "#990099",
        "FISH": "#3333cc",
        "MONSTER": "#000000",
        "GEAR": "#800000",
        "LEGENDARY": "#ffffff"
    }

    const textColorDexRows = {
        "ORE": "white",
        "BAR": "white",
        "SEED": "white",
        "WOOD": "white",
        "LEAF": "white",
        "GEM": "white",
        "FISH": "white",
        "MONSTER": "white",
        "GEAR": "white",
        "LEGENDARY": "black"
    }

    class tcgDex extends IdlePixelPlusPlugin {
        constructor() {
            super("tcgDex", {
                about: {
                    name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
                    version: GM_info.script.version,
                    author: GM_info.script.author,
                    description: GM_info.script.description,
                },
                config: [
                    {
                        label:
                        "------------------------------------------------<br/>Notification<br/>------------------------------------------------",
                        type: "label",
                    },
                    {
                        id: "tcgNotification",
                        label:
                        "Enable TCG Card Buying Available Notification<br/>(Default: Enabled)",
                        type: "boolean",
                        default: true,
                    },
                    {
                        id: "newCardTimer",
                        label:
                        "New Card Timer<br/>(How long do you want a card to show as new, in minutes.)",
                        type: "int",
                        default: 15,
                    },
                    {
                        id: "enableSend",
                        label: "Enable auto send of duplicate cards to the player in the next option.",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "sendTo",
                        label: "Player to send duplicate cards to automatically.",
                        type: "string",
                        default: null
                    },
                ],
            });
        }

        getCategoryData() {
            let uniqueDescriptionTitles = [];
            const descriptionTitlesSet = new Set();
            let i = 1;

            Object.values(CardData.data).forEach((card) => {
                const descriptionTitle = card["description_title"];
                const properTitles =
                      descriptionTitle.charAt(0).toUpperCase() +
                      descriptionTitle.slice(1).toLowerCase();

                if (!descriptionTitlesSet.has(descriptionTitle)) {
                    descriptionTitlesSet.add(descriptionTitle);

                    uniqueDescriptionTitles.push({
                        id: `[${descriptionTitle}]`,
                        desc: descriptionTitle,
                        label: `${properTitles}`,
                    });
                    i++;
                }
            });

            return uniqueDescriptionTitles;
        }

        ensureNewSettingExists() {
            const settings = JSON.parse(
                localStorage.getItem(`${playername}.tcgSettings`)
            );
            if (settings && typeof settings.new === "undefined") {
                settings.new = true;
                localStorage.setItem(
                    `${playername}.tcgSettings`,
                    JSON.stringify(settings)
                );
            }
        }

        calculateCardCounts() {
            let cardCount = {};

            categoriesTCG.forEach((category) => {
                cardCount[category.desc] = {
                    uniHolo: 0,
                    ttlHolo: 0,
                    uniNormal: 0,
                    ttlNormal: 0,
                    possHolo: 0,
                    possNormal: 0,
                    possUniHolo: 0,
                    possUniNormal: 0,
                };
            });

            overallCardCounts = {
                overallUniHolo: 0,
                overallHolo: 0,
                overallTTL: 0,
                overallUniNormal: 0,
                overallNormal: 0,
            };

            Object.values(CardData.data).forEach((card) => {
                const category = categoriesTCG.find(
                    (c) => c.id === `[${card.description_title}]`
				);
                    if (category) {
                        cardCount[category.desc].uniHolo++;
                        cardCount[category.desc].uniNormal++;
                        overallCardCounts.overallTTL++;
                    }
                });

                const uniHoloSetOverall = new Set();
                const uniNormalSetOverall = new Set();

                currentCards.forEach((card) => {
                    const category = Object.entries(CardData.data).find(
                        (c) => c[0] === card.id
                    );
                    if (category) {
                        if (card.holo) {
                            cardCount[category[1].description_title].possHolo++;
                            cardCount[category[1].description_title].ttlHolo++;
                            overallCardCounts.overallHolo++;
                            if (!uniHoloSetOverall.has(card.id)) {
                                uniHoloSetOverall.add(card.id);
                                overallCardCounts.overallUniHolo++;
                                cardCount[category[1].description_title].possUniHolo++;
                            }
                        } else {
                            cardCount[category[1].description_title].possNormal++;
                            cardCount[category[1].description_title].ttlNormal++;
                            overallCardCounts.overallNormal++;
                            if (!uniNormalSetOverall.has(card.id)) {
                                uniNormalSetOverall.add(card.id);
                                overallCardCounts.overallUniNormal++;
                                cardCount[category[1].description_title].possUniNormal++;
                            }
                        }
                    }
                });
                return cardCount;
            }

            initializeDatabase() {
                const dbName = `IdlePixel_TCG_DB.${playername}`;
                const version = 1;
                const request = indexedDB.open(dbName, version);

                request.onerror = (event) => {
                    console.error("Database error: ", event.target.error);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    const objectStoreName = `current_cards`;
                    if (!db.objectStoreNames.contains(objectStoreName)) {
                        const objectStore = db.createObjectStore(objectStoreName, {
                            keyPath: ["id", "cardNum", "holo"],
                        });
                    }
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                };
            }

            async identifyAndRemoveAbsentCards(db, objectStoreName, currentCards) {
                try {

                    const dbCards = await this.fetchAllCardsFromDB(db, objectStoreName);

                    const currentCardsKeySet = new Set(
                        currentCards.map((card) => JSON.stringify([card.id, card.cardNum, card.holo.toString()]))
                    );

                    dbCards.forEach((dbCard) => {
                        const dbCardKey = JSON.stringify([dbCard.id, dbCard.cardNum, dbCard.holo.toString()]);
                        if (!currentCardsKeySet.has(dbCardKey)) {
                            //console.log(`Card not found in current cards, removing: ${dbCardKey}`);
                            this.removeCardFromDB(db, objectStoreName, [dbCard.id, dbCard.cardNum, dbCard.holo]);
                        }
                    });
                } catch (error) {
                    console.error('Error in identifyAndRemoveAbsentCards:', error);
                }
            }

            removeCardFromDB(db, objectStoreName, cardKey) {
                const transaction = db.transaction([objectStoreName], "readwrite");
                const objectStore = transaction.objectStore(objectStoreName);
                const request = objectStore.delete(cardKey);
                request.onerror = (event) => {
                    console.error("Error removing card from DB:", event.target.error);
                };
                request.onsuccess = () => {
                    //console.log(`Card removed from DB: ${cardKey}`);
                };
            }

            updateTcgSettings(categoryId, state) {
                const settings = JSON.parse(
                    localStorage.getItem(`${playername}.tcgSettings`)
                );
                settings[categoryId] = state;
                localStorage.setItem(
                    `${playername}.tcgSettings`,
                    JSON.stringify(settings)
                );
            }

            getTcgSetting(categoryId) {
                const settings = JSON.parse(
                    localStorage.getItem(`${playername}.tcgSettings`)
                );
                return settings[categoryId];
            }

            tcgBuyerNotifications() {
                let tcgTimerCheck = IdlePixelPlus.getVarOrDefault("tcg_timer", 0, "int");
                let tcgUnlocked = IdlePixelPlus.getVarOrDefault("tcg_active", 0, "int");
                const notifDiv = document.createElement("div");
                notifDiv.id = `notification-tcg-timer`;
                notifDiv.onclick = function () {
                    websocket.send(switch_panels("panel-criptoe-tcg"));
                    websocket.send(Modals.open_buy_tcg());
                };
                notifDiv.className = "notification hover";
                notifDiv.style = "margin-right: 4px; margin-bottom: 4px; display: none";
                notifDiv.style.display = "inline-block";

                let elem = document.createElement("img");
                elem.setAttribute("src", `${TCG_IMAGE_URL_BASE}ash_50.png`);
                const notifIcon = elem;
                notifIcon.className = "w20";

                const notifDivLabel = document.createElement("span");
                notifDivLabel.id = `notification-tcg-timer-label`;
                notifDivLabel.innerText = " Loading...";
                notifDivLabel.className = "color-white";

                notifDiv.append(notifIcon, notifDivLabel);
                document.querySelector("#notifications-area").prepend(notifDiv);
                if (tcgUnlocked == 0 || !this.getConfig("tcgNotification")) {
                    document.querySelector("#notification-tcg-timer").style.display =
                        "none";
                }
            }

            updateTCGNotification() {
                let tcgTimerCheck = IdlePixelPlus.getVarOrDefault("tcg_timer", 0, "int");
                let tcgUnlocked = IdlePixelPlus.getVarOrDefault("tcg_active", 0, "int");
                if (this.getConfig("tcgNotification") && tcgUnlocked != 0) {
                    document.getElementById("notification-tcg-timer").style.display =
                        "inline-block";
                    if (tcgTimerCheck > 0) {
                        let timerLabel = format_time(tcgTimerCheck);
                        document.getElementById(
                            "notification-tcg-timer-label"
                        ).innerText = ` ${timerLabel}`;
                    } else {
                        document.getElementById(
                            "notification-tcg-timer-label"
                        ).innerText = ` Time to buy cards!`;
                    }
                } else {
                    document.getElementById("notification-tcg-timer").style.display =
                        "none";
                }
            }

            async checkForAndHandleDuplicates() {
                const sendTo = IdlePixelPlus.plugins.tcgDex.getConfig("sendTo");
                const enableSend = IdlePixelPlus.plugins.tcgDex.getConfig("enableSend");
                const cards = await this.fetchAllCardsFromDB(this.db, 'current_cards');
                const cardOccurrences = new Map();

                if(!dupeSending) {
                    dupeSending = true;
                    cards.forEach((card) => {
                        const key = `${card.id}-${card.holo}`;
                        if (cardOccurrences.has(key)) {
                            cardOccurrences.get(key).push(card);
                        } else {
                            cardOccurrences.set(key, [card]);
                        }
                    });

                    cardOccurrences.forEach((occurrences, key) => {
                        if (occurrences.length > 1) {
                            occurrences.sort((a, b) => b.cardNum - a.cardNum);

                            for (let i = 0; i < (occurrences.length - 1); i++) {
                                const duplicate = occurrences[i];
                                //console.log(`Handling duplicate for ${key}:`, duplicate);

                                if (enableSend && sendTo) {
                                    websocket.send(`GIVE_TCG_CARD=${sendTo}~${duplicate.cardNum}`);
                                }
                            }
                        }
                    });

                    // Identify and remove absent cards after handling duplicates
                    setTimeout(function() {
                        CardData.fetchData();
                        setTimeout(function() {
                            dupeSending = false;
                        }, 10000);
                    }, 20000);
                }
            }

            async fetchAllCardsFromDB(db, objectStoreName) {
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction([objectStoreName], "readonly");
                    const objectStore = transaction.objectStore(objectStoreName);
                    const request = objectStore.getAll();

                    request.onerror = (event) => {
                        console.error("Error fetching cards from DB:", event.target.error);
                        reject(event.target.error);
                    };

                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                });
            }

            cardStyling() {
                const style = document.createElement("style");
                style.id = "styles-tcg-dex";
                style.textContent = `
                .tcg-card-inner {
                  text-align: center;
                  margin: 5px 18px;
                  border: 2px solid black;
                  background-color: #FEFEFE;
                  box-shadow: 1px 1px 5px;
                  padding: 25px 25px;
                }

                .tcg-card {
                  width: 200px;
                  height: 300px;
                  display: inline-block;
                  border-radius: 10pt;
                  box-shadow: 1px 1px 5px;
                  margin: 5px;
                  color: black;
                }

                .tcg-card-title {
                  font-weight: bold;
                  font-size: 12pt;
                  margin-left: 18px;
                  margin-top: 4px;
                }

                .tcg-card-inner-text {
                  margin: 0px 18px;
                  border: 1px solid black;
                  border-radius: 5pt;
                  background-color: #FEFEFE;
                  padding: 5px 5px;
                  font-size: 8pt;
                  margin-top: 10px;
                  margin-bottom: 4px;
                }

                .tcg-card-rarity {
                  font-weight: bold;
                  font-size: 12pt;
                  margin-right: 4px;
                  text-align: right;
                  font-style: italic;
                }

                .tcg-card-type {
                  font-weight: bold;
                  font-size: 12pt;
                  margin-left: 4px;
                  text-align: left;
                }

                .tcg-category-text {
                  font-weight: bold;
                  font-size: 12px;
                  color: black;
                }

                .tcgDex-card-container-open {
                    margin-bottom: 20px;
                }

                .tcgDex-card-container-closed {
                    margin-bottom: 5px;
                }
            `;
            document.head.appendChild(style);
        }

            cardOverride = CardData.getCardHTML = function(id, var_name, holo) {

                let data = CardData.data[var_name];
                //console.log(data);
                //console.log(`ID: ${id}, ${var_name}, ${holo}`);
                let holo_style = "";
                let holo_title_style = "";
                let cardText = "";
                let isHoloText = "";
                let innerTextColor;
                let idHolo;
                let itemName;
                if(holo) holo_style = "holo";
                if(holo) holo_title_style = "shine";
                if(holo) {
                    cardText = `<span class='${holo_title_style}'>`
                    cardText += `𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴<br />`
                    cardText += `𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈<br />`
                    cardText += `𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴<br />`
                    cardText += `𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈`
                    cardText += `</span>`
                isHoloText = ` Holo`
                idHolo = "Holo"
            } else {
                cardText = `𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴<br />`
                    cardText += `𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈<br />`
                    cardText += `𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴<br />`
                    cardText += `𓄜𓈤𓈤𓊙𓐈𓀚𓁁𓂧𓃢𓃴𓄜𓈤𓈤𓊙𓐈`
                isHoloText = ` Normal`
                idHolo = "Normal"
                }
            let rarityChange = {
                common: "Common",
                uncommon: "Uncommon",
                rare: "Rare",
                very_rare: "Very Rare",
                legendary: "Legendary"
            }



            let html = `<div id='${var_name}_${idHolo}' onclick='Modals.open_tcg_give_card(null, \"${id}\")' style='${data['border_css']}${data['background_css']}; font-family: calibri;' class='tcg-card hover'>`
                html += `<div class='row' style="display: flex; width: 100%;">`
                html += `<div class='col' style="flex: 0 0 90%;padding-right: 0px; display: flex;">`
                html += `<div class='tcg-card-title'>${data.label.replaceAll('MOONSTONE', 'M. STONE').replaceAll('PROMETHIUM', 'PROM.')}</div>`
                html += `</div>`
                html += `<div class='col' style="flex: 0 0 10%;padding: 0px;display: flex;justify-content: center; margin-top:4px;">`
                html += `<span id='dupe-count' style="font-weight: bolder;"></span>`
                html += `</div>`
                html += `</div>`
                html += `<div class='tcg-card-inner ${holo_style}'>`
                html += `<img src='https://cdn.idle-pixel.com/images/${data['image']}' class='w50'>`
                html += `</div>`
                html += `<div class='tcg-card-inner-text'>`
                html += `<span class='tcg-category-text'>[${data['description_title']}]</span>`
                html += `<br />`
                html += `<br />`
                html += `<span class='color-red'>${cardText}</span>`
                html += `</div>`
                html += `<div class="row">`
                html += `<div class="col">`
                html += `<span class="tcg-card-type">${isHoloText}`
                html += `</span>`
                html += `</div>`
                html += `<div class="col" style="text-align: end">`
                html += `<span class="tcg-card-rarity">(${rarityChange[data['rarity']]})</span>`
                html += `</div>`
                html += `</div>`
                html += `</div>`
            return html;

        }

            totalHeaderBarInit() {
                const labelRowTotal = document.createElement("row");
                labelRowTotal.id ="total-header-row";
                labelRowTotal.style.display = "inline-flex";
                labelRowTotal.style.width = "100%";
                labelRowTotal.style.height = "30px";
                labelRowTotal.style.backgroundColor = "cyan";
                labelRowTotal.style.color = "black";
                labelRowTotal.style.fontWeight = "bolder";
                labelRowTotal.style.userSelect = "none";

                const buttonColTotal = document.createElement("div");
                buttonColTotal.id = "button-col";
                buttonColTotal.className = "col";
                buttonColTotal.style.flex = "0 0 5%";

                const catColTotal = document.createElement("div")
                catColTotal.id = "category-col";
                catColTotal.className = "col";
                catColTotal.style.flex = "0 0 35%";
                catColTotal.style.alignContent = "center";
                catColTotal.innerText = 'T = Total & U = Unique';

                const totColTotal = document.createElement("div");
                totColTotal.id = "total-col";
                totColTotal.className = "col";
                totColTotal.style.flex = "0 0 10%";
                totColTotal.style.alignContent = "center";
                totColTotal.style.paddingLeft = "5px";
                totColTotal.style.borderLeft = `1px solid black`;

                const holoColTotal = document.createElement("div");
                holoColTotal.id = "holo-col";
                holoColTotal.className = "col";
                holoColTotal.style.flex = "0 0 25%";
                holoColTotal.style.display = "inline-flex";
                holoColTotal.style.borderLeft = `1px solid black`;

                const holoLabelColTotal = document.createElement("div");
                holoLabelColTotal.innerText = "Holo:";
                holoLabelColTotal.style.paddingLeft = "5px";
                holoLabelColTotal.style.flex = "0 0 34%";
                holoLabelColTotal.style.alignContent = "center";

                holoColTotal.appendChild(holoLabelColTotal);

                const holoTTLColTotal = document.createElement("div");
                holoTTLColTotal.id = "holo-ttl-col";
                holoTTLColTotal.style.flex = "0 0 33%";
                holoTTLColTotal.style.alignContent = "center";

                holoColTotal.appendChild(holoTTLColTotal);

                const holoUniColTotal = document.createElement("div");
                holoUniColTotal.id = "holo-uni-col";
                holoUniColTotal.style.flex = "0 0 33%";
                holoUniColTotal.style.alignContent = "center";

                holoColTotal.appendChild(holoUniColTotal);

                const normColTotal = document.createElement("div");
                normColTotal.id = "normal-col";
                normColTotal.className = "col";
                normColTotal.style.flex = "0 0 25%";
                normColTotal.style.display = "inline-flex";
                normColTotal.style.alignContent = "center";
                normColTotal.style.borderLeft = `1px solid black`;

                const normLabelColTotal = document.createElement("div");
                normLabelColTotal.innerText = "Normal:";
                normLabelColTotal.style.paddingLeft = "5px";
                normLabelColTotal.style.flex = "0 0 34%";
                normLabelColTotal.style.alignContent = "center";

                normColTotal.appendChild(normLabelColTotal);

                const normTTLColTotal = document.createElement("div");
                normTTLColTotal.id = "norm-ttl-col";
                normTTLColTotal.style.flex = "0 0 33%";
                normTTLColTotal.style.alignContent = "center";

                normColTotal.appendChild(normTTLColTotal);

                const normUniColTotal = document.createElement("div");
                normUniColTotal.id = "norm-uni-col";
                normUniColTotal.style.flex = "0 0 33%";
                normUniColTotal.style.alignContent = "center";

                normColTotal.appendChild(normUniColTotal);

                labelRowTotal.appendChild(buttonColTotal);
                labelRowTotal.appendChild(catColTotal);
                labelRowTotal.appendChild(totColTotal);
                labelRowTotal.appendChild(holoColTotal);
                labelRowTotal.appendChild(normColTotal);

                const pendingTCGContainer = document.getElementById("tcg-area-context");

                const ttlOverallCardsLabel = document.createElement("span");
                ttlOverallCardsLabel.id = "ttl-overall-cards-label";
                const uniOverallHoloLabel = document.createElement("span");
                uniOverallHoloLabel.id = "uni-overall-holo-label";
                const ttlOverallHoloLabel = document.createElement("span");
                ttlOverallHoloLabel.id = "ttl-overall-holo-label";
                const uniOverallNormalLabel = document.createElement("span");
                uniOverallNormalLabel.id = "uni-overall-normal-label";
                const ttlOverallNormalLabel = document.createElement("span");
                ttlOverallNormalLabel.id = "ttl-overall-normal-label";

                totColTotal.appendChild(ttlOverallCardsLabel);
                holoTTLColTotal.appendChild(ttlOverallHoloLabel);
                holoUniColTotal.appendChild(uniOverallHoloLabel);
                normTTLColTotal.appendChild(ttlOverallNormalLabel);
                normUniColTotal.appendChild(uniOverallNormalLabel);
                pendingTCGContainer.appendChild(labelRowTotal);

                const counts = cardCounts().calculateCardCounts();
                document.querySelector(`#total-header-row #ttl-overall-cards-label`).textContent = `Total: ${overallCardCounts.overallHolo + overallCardCounts.overallNormal} `;
                document.querySelector(`#total-header-row #uni-overall-holo-label`).textContent = `U: ${overallCardCounts.overallUniHolo}/${overallCardCounts.overallTTL}`;
                document.querySelector(`#total-header-row #ttl-overall-holo-label`).textContent = `T: ${overallCardCounts.overallHolo}`;
                document.querySelector(`#total-header-row #uni-overall-normal-label`).textContent = `U: ${overallCardCounts.overallUniNormal}/${overallCardCounts.overallTTL}`;
                document.querySelector(`#total-header-row #ttl-overall-normal-label`).textContent = `T: ${overallCardCounts.overallNormal}`;
            }

            newCardsInit() {
                const categoryNewDiv = document.createElement("div");
                let loadNewVis = JSON.parse(localStorage.getItem(`${playername}.tcgSettings`))['new'];
                categoryNewDiv.id = `tcgDex-New_Card-Container`;
                categoryNewDiv.className = loadNewVis ? "tcgDex-card-container-open" : "tcgDex-card-container-closed";

                const categoryNewDivInner = document.createElement("div");
                categoryNewDivInner.id = `tcgDex-New_Card-Container-Inner`;
                categoryNewDivInner.style.display =
                    IdlePixelPlus.plugins.tcgDex.getTcgSetting("new") ? "" : "none";
                const toggleButtonNew = document.createElement("button");

                const labelSpanNew = document.createElement("span");
                labelSpanNew.textContent = `New Cards (Last ${newCardTimer} Mins)`;

                const labelRowNew = document.createElement("row");
                labelRowNew.style.display = "inline-flex";
                labelRowNew.style.width = "100%";
                labelRowNew.style.height = "30px";
                labelRowNew.style.backgroundColor = "gray";
                labelRowNew.style.color = "black";
                labelRowNew.style.fontWeight = "bolder";
                const buttonColNew = document.createElement("div");
                buttonColNew.id = "button-col";
                buttonColNew.className = "col";
                buttonColNew.style.flex = "0 0 5%";
                buttonColNew.style.alignContent = "center";
                buttonColNew.style.textAlign = "center";
                buttonColNew.innerHTML = IdlePixelPlus.plugins.tcgDex.getTcgSetting("new") ? "<i class='fas fa-eye'></i>" : "<i class='fas fa-eye-slash'></i>";
                const catColNew = document.createElement("div")
                catColNew.id = "category-col";
                catColNew.className = "col";
                catColNew.style.flex = "0 0 55%";
                catColNew.style.alignContent = "center";
                const totColNew = document.createElement("div");
                totColNew.id = "total-col";
                totColNew.className = "col";
                totColNew.style.flex = "0 0 10%";
                totColNew.style.alignContent = "center";
                const holoColNew = document.createElement("div");
                holoColNew.id = "holo-col";
                holoColNew.className = "col";
                holoColNew.style.flex = "0 0 15%";
                holoColNew.style.alignContent = "center";
                const normColNew = document.createElement("div");
                normColNew.id = "normal-col";
                normColNew.className = "col";
                normColNew.style.flex = "0 0 15%";
                normColNew.style.alignContent = "center";

                labelRowNew.appendChild(buttonColNew);
                labelRowNew.appendChild(catColNew);
                labelRowNew.appendChild(totColNew);
                labelRowNew.appendChild(holoColNew);
                labelRowNew.appendChild(normColNew);

                labelRowNew.addEventListener("click", () => {
                    const isVisible = categoryNewDivInner.style.display !== "none";
                    categoryNewDivInner.style.display = isVisible ? "none" : "";
                    buttonColNew.innerHTML = isVisible ? "<i class='fas fa-eye-slash'></i>" : "<i class='fas fa-eye'></i>";
                    categoryNewDiv.className = isVisible ? "tcgDex-card-container-closed" : "tcgDex-card-container-open";
                    IdlePixelPlus.plugins.tcgDex.updateTcgSettings("new", !isVisible);
                });

                catColNew.appendChild(labelSpanNew);
                categoryNewDiv.appendChild(labelRowNew);
                categoryNewDiv.appendChild(document.createElement("br"));
                categoryNewDiv.appendChild(categoryNewDivInner);
                document.getElementById("tcg-area-context").appendChild(categoryNewDiv);
            }

            cardByCategory() {
                categoriesTCG.forEach((category) => {
                    let loadVis = IdlePixelPlus.plugins.tcgDex.getTcgSetting(category.desc);
                    const categoryDiv = document.createElement("div");
                    let rowBGColor = bgColorDexRows[category.desc];
                    let rowTextColor = textColorDexRows[category.desc];

                    categoryDiv.id = `tcgDex-${category.desc}-Container`;
                    categoryDiv.className = loadVis ? "tcgDex-card-container-open" : "tcgDex-card-container-closed";

                    const categoryDivInner = document.createElement("div");
                    categoryDivInner.id = `tcgDex-${category.desc}-Container-Inner`;
                    categoryDivInner.style.display = IdlePixelPlus.plugins.tcgDex.getTcgSetting(category.desc) ? "" : "none";

                    const toggleButton = document.createElement("button");

                    categoryDiv.innerHTML = `<div id="tcgLabel" style="font-size: 1.25em"></div>`;

                    const labelRow = document.createElement("row");
                    labelRow.style.display = "inline-flex";
                    labelRow.style.width = "100%";
                    labelRow.style.height = "30px";
                    labelRow.style.backgroundColor = rowBGColor;
                    labelRow.style.color = rowTextColor;
                    labelRow.style.fontWeight = "bolder";
                    labelRow.style.userSelect = "none";

                    const buttonCol = document.createElement("div");
                    buttonCol.id = "button-col";
                    buttonCol.className = "col";
                    buttonCol.style.flex = "0 0 5%";
                    buttonCol.style.alignContent = "center";
                    buttonCol.style.textAlign = "center";
                    buttonCol.innerHTML = IdlePixelPlus.plugins.tcgDex.getTcgSetting(category.desc) ? "<i class='fas fa-eye'></i>" : "<i class='fas fa-eye-slash'></i>";

                    const catCol = document.createElement("div")
                    catCol.id = "category-col";
                    catCol.className = "col";
                    catCol.style.flex = "0 0 35%";
                    catCol.style.alignContent = "center";

                    const totCol = document.createElement("div");
                    totCol.id = "total-col";
                    totCol.className = "col";
                    totCol.style.flex = "0 0 10%";
                    totCol.style.alignContent = "center";
                    totCol.style.paddingLeft = "5px";
                    totCol.style.borderLeft = `1px solid ${rowTextColor}`;

                    const holoCol = document.createElement("div");
                    holoCol.id = "holo-col";
                    holoCol.className = "col";
                    holoCol.style.flex = "0 0 25%";
                    holoCol.style.display = "inline-flex";
                    holoCol.style.borderLeft = `1px solid ${rowTextColor}`;

                    const holoLabelCol = document.createElement("div");
                    holoLabelCol.innerText = "Holo:";
                    holoLabelCol.style.paddingLeft = "5px";
                    holoLabelCol.style.flex = "0 0 34%";
                    holoLabelCol.style.alignContent = "center";

                    holoCol.appendChild(holoLabelCol);

                    const holoTTLCol = document.createElement("div");
                    holoTTLCol.id = "holo-ttl-col";
                    holoTTLCol.style.flex = "0 0 33%";
                    holoTTLCol.style.alignContent = "center";

                    holoCol.appendChild(holoTTLCol);

                    const holoUniCol = document.createElement("div");
                    holoUniCol.id = "holo-uni-col";
                    holoUniCol.style.flex = "0 0 33%";
                    holoUniCol.style.alignContent = "center";

                    holoCol.appendChild(holoUniCol);

                    const normCol = document.createElement("div");
                    normCol.id = "normal-col";
                    normCol.className = "col";
                    normCol.style.flex = "0 0 25%";
                    normCol.style.display = "inline-flex";
                    normCol.style.borderLeft = `1px solid ${rowTextColor}`;

                    const normLabelCol = document.createElement("div");
                    normLabelCol.innerText = "Normal:";
                    normLabelCol.style.paddingLeft = "5px";
                    normLabelCol.style.flex = "0 0 34%";
                    normLabelCol.style.alignContent = "center";

                    normCol.appendChild(normLabelCol);

                    const normTTLCol = document.createElement("div");
                    normTTLCol.id = "norm-ttl-col";
                    normTTLCol.style.flex = "0 0 33%";
                    normTTLCol.style.alignContent = "center";

                    normCol.appendChild(normTTLCol);

                    const normUniCol = document.createElement("div");
                    normUniCol.id = "norm-uni-col";
                    normUniCol.style.flex = "0 0 33%";
                    normUniCol.style.alignContent = "center";

                    normCol.appendChild(normUniCol);

                    labelRow.appendChild(buttonCol);
                    labelRow.appendChild(catCol);
                    labelRow.appendChild(totCol);
                    labelRow.appendChild(holoCol);
                    labelRow.appendChild(normCol);

                    labelRow.addEventListener("click", () => {
                        const isVisible = categoryDivInner.style.display !== "none";
                        categoryDivInner.style.display = isVisible ? "none" : "";
                        buttonCol.innerHTML = isVisible ? "<i class='fas fa-eye-slash'></i>" : "<i class='fas fa-eye'></i>";
                        categoryDiv.className = isVisible ? "tcgDex-card-container-closed" : "tcgDex-card-container-open";
                        IdlePixelPlus.plugins.tcgDex.updateTcgSettings(
                            category.desc,
                            !isVisible
                        );
                    });

                    const catLabel = document.createElement("span");
                    catLabel.id = "labelSpan";
                    catLabel.textContent = category.label;
                    const ttlCardsLabel = document.createElement("span");
                    ttlCardsLabel.id = "ttl-cards-label";
                    const uniHoloLabel = document.createElement("span");
                    uniHoloLabel.id = "uni-holo-label";
                    const ttlHoloLabel = document.createElement("span");
                    ttlHoloLabel.id = "ttl-holo-label";
                    const uniNormalLabel = document.createElement("span");
                    uniNormalLabel.id = "uni-normal-label";
                    const ttlNormalLabel = document.createElement("span");
                    ttlNormalLabel.id = "ttl-normal-label";

                    catCol.appendChild(catLabel);
                    totCol.appendChild(ttlCardsLabel);
                    holoTTLCol.appendChild(ttlHoloLabel);
                    holoUniCol.appendChild(uniHoloLabel);
                    normTTLCol.appendChild(ttlNormalLabel);
                    normUniCol.appendChild(uniNormalLabel);
                    categoryDiv.appendChild(labelRow);
                    categoryDiv.appendChild(document.createElement("br"));
                    categoryDiv.appendChild(categoryDivInner);
                    if (category.desc !== "LEGENDARY") {
                        document.getElementById("tcg-area-context").appendChild(categoryDiv);
                    } else {
                        let newCardArea = document.getElementById("tcgDex-New_Card-Container");
                        newCardArea.insertAdjacentElement("afterEnd", categoryDiv);
                    }
                });

                categoriesTCG.forEach((category) => {
                    const counts = cardCounts().calculateCardCounts()[category.desc];
                    document.querySelector(`#tcgDex-${category.desc}-Container #ttl-cards-label`).textContent = `Total: ${counts.possHolo + counts.possNormal}`;
                    document.querySelector(`#tcgDex-${category.desc}-Container #uni-holo-label`).textContent = `U: ${counts.possUniHolo}/${counts.uniHolo}`;
                    document.querySelector(`#tcgDex-${category.desc}-Container #ttl-holo-label`).textContent = `T: ${counts.ttlHolo}`;
                    document.querySelector(`#tcgDex-${category.desc}-Container #uni-normal-label`).textContent = `U: ${counts.possUniNormal}/${counts.uniNormal}`;
                    document.querySelector(`#tcgDex-${category.desc}-Container #ttl-normal-label`).textContent = `T: ${counts.ttlNormal}`;
                });
            }

            onLogin() {
                CToe.loadCards = function () {};
                IdlePixelPlus.plugins['tcgDex'].cardStyling();
                this.cardOverride;
                if (!CardData.data) {
                    CardData.fetchData();
                }
                playername = IdlePixelPlus.getVarOrDefault("username", "", "string");
                setTimeout(() => {
                    categoriesTCG = this.getCategoryData();
                    if (!localStorage.getItem(`${playername}.tcgSettings`)) {
                        let defaultSettings = categoriesTCG.reduce((settings, category) => {
                            settings[category.desc] = true;
                            return settings;
                        }, {});
                        defaultSettings.new = true;
                        localStorage.setItem(
                            `${playername}.tcgSettings`,
                            JSON.stringify(defaultSettings)
                        );
                    } else {
                        IdlePixelPlus.plugins.tcgDex.ensureNewSettingExists();
                    }
                    this.initializeDatabase();
                    this.tcgBuyerNotifications();
                    this.updateTCGNotification();
                    onLoginLoaded = true;
                }, 1000);
            }

            onVariableSet(key, valueBefore, valueAfter) {
                if (onLoginLoaded) {
                    if (key.startsWith("tcg") && valueBefore != valueAfter) {
                        IdlePixelPlus.plugins.tcgDex.updateTCGNotification();
                    }
                }
            }

            onConfigChange() {
                if (onLoginLoaded) {
                    IdlePixelPlus.plugins.tcgDex.updateTCGNotification();
                }
            }

            onMessageReceived(data) {
                if (data.startsWith("REFRESH_TCG")) {
                    const parts = data.replace("REFRESH_TCG=", "").split("~");
                    newCardTimer = IdlePixelPlus.plugins.tcgDex.getConfig("newCardTimer");

                    let cardSort = [];
                    currentCards = [];
                    let order = 1;
                    let newCards = [];
                    let cardTypeCountDict = {};



                    Object.keys(CardData.data).forEach((key) => {
                        cardSort.push({ id: key, order: order++, holo: true });
                        cardSort.push({ id: key, order: order++, holo: false });
                    });

                    for (let i = 0; i < parts.length; i += 3) {
                        const cardNum = parts[i];
                        const cardKey = parts[i + 1];
                        const isHolo = parts[i + 2] === "true";
                        let idHolo = isHolo ? "Holo" : "Normal";
                        const countKey = `${cardKey}_${idHolo}`;

                        const matchingCard = cardSort.find(
                            (card) => card.id === cardKey && card.holo === isHolo
                        );

                        if (matchingCard) {
                            currentCards.push({
                                id: cardKey,
                                cardNum: cardNum,
                                holo: isHolo,
                                order: matchingCard.order,
                            });

                            // Increment the count for the countKey
                            if (cardTypeCountDict[countKey]) {
                                cardTypeCountDict[countKey]++;
                            } else {
                                cardTypeCountDict[countKey] = 1;
                            }
                        }
                    }

                    currentCards.sort((a, b) => a.order - b.order);

                    const objectStoreName = `current_cards`;
                    const transaction = this.db.transaction([objectStoreName], "readwrite");
                    const objectStore = transaction.objectStore(objectStoreName);

                    currentCards.forEach((card) => {
                        const key = [card.id, card.cardNum, card.holo.toString()];
                        const getRequest = objectStore.get(key);
                        getRequest.onsuccess = (event) => {
                            let result = event.target.result;
                            if (result) {
                                let now = new Date();
                                let timeBefore = new Date(now.getTime() - newCardTimer * 60 * 1000);

                                let receivedDateTime = new Date(result.received_datetime);
                                if (receivedDateTime > timeBefore) {
                                    newCards.push({
                                        cardNum: result.cardNum,
                                        id: result.id,
                                        holo: result.holo,
                                        received_datetime: receivedDateTime,
                                    });
                                }
                            } else {
                                const cardData = {
                                    id: card.id.toString(),
                                    cardNum: card.cardNum.toString(),
                                    holo: card.holo.toString(),
                                    received_datetime: new Date().toISOString(),
                                };
                                const addRequest = objectStore.add(cardData);
                                addRequest.onerror = (event) => {
                                    console.error("Error adding new card:", event.target.error);
                                };
                                addRequest.onsuccess = (event) => {};
                                newCards.push({
                                    cardNum: card.cardNum.toString(),
                                    id: card.id.toString(),
                                    holo: card.holo.toString(),
                                    received_datetime: new Date().toISOString(),
                                });
                            }
                        };
                        getRequest.onerror = (event) => {
                            console.error("Error fetching card record:", event.target.error);
                        };
                    });

                    const joinedString = currentCards
                    .map((card) => `${card.cardNum}~${card.id}~${card.holo}`)
                    .join("~");

                    this.identifyAndRemoveAbsentCards(
                        this.db,
                        `current_cards`,
                        currentCards
                    );

                    document.getElementById("tcg-area-context").innerHTML = "";
                    if (joinedString == "NONE") return;
                    var dataArray = joinedString.split("~");
                    var html = "";
                    for (var i = 0; i < dataArray.length;) {
                        var id = dataArray[i++];
                        var var_name = dataArray[i++];
                        var holo = dataArray[i++] == "true";

                        html += CardData.getCardHTML(id, var_name, holo);
                    }

                    document.getElementById("tcg-area-context").innerHTML = html;

                    IdlePixelPlus.plugins['tcgDex'].totalHeaderBarInit();
                    IdlePixelPlus.plugins['tcgDex'].newCardsInit();
                    IdlePixelPlus.plugins['tcgDex'].cardByCategory();

                    document.querySelectorAll(".tcg-card").forEach((card) => {
                        categoriesTCG.forEach((category) => {
                            if (card.textContent.includes(category.id)) {
                                document
                                    .getElementById(`tcgDex-${category.desc}-Container-Inner`)
                                    .appendChild(card);
                            }
                        });
                    });

                    setTimeout(() => {
                        newCards.sort((a, b) => b.received_datetime - a.received_datetime);

                        const newCardsJoinedString = newCards
                        .map((card) => `${card.cardNum}~${card.id}~${card.holo}`)
                        .join("~");

                        document.getElementById("tcgDex-New_Card-Container-Inner").innerHTML = "";
                        if (newCardsJoinedString == "") return;
                        var dataArrayNew = newCardsJoinedString.split("~");
                        var htmlNew = "";
                        for (var ix = 0; ix < dataArrayNew.length;) {
                            var idNew = dataArrayNew[ix++];
                            var var_nameNew = dataArrayNew[ix++];
                            var holoNew = dataArrayNew[ix++] == "true";

                            htmlNew += CardData.getCardHTML(idNew, var_nameNew, holoNew);
                        }
                        document.getElementById("tcgDex-New_Card-Container-Inner").innerHTML =
                            htmlNew;
                    }, 2000);

                    this.checkForAndHandleDuplicates();

                    // Convert the cardTypeCountDict to an array
                    let cardTypeCount = Object.keys(cardTypeCountDict).map((key) => ({
                        countKey: key,
                        count: cardTypeCountDict[key],
                    }));


                    const tcgAreaContextElements = document.querySelectorAll('#tcg-area-context > :not(#tcgDex-New_Card-Container) .tcg-card');

                    // Create a Set to keep track of unique countKeys displayed
                    const displayedCountKeys = new Set();

                    // Iterate through the fetched elements
                    tcgAreaContextElements.forEach(element => {
                        const countKey = element.id;

                        if (cardTypeCountDict[countKey] && !displayedCountKeys.has(countKey)) {
                            // Update the element with the dupe count
                            const dupeCountElement = element.querySelector('#dupe-count');
                            if (dupeCountElement) {
                                if(cardTypeCountDict[countKey] > 1) {
                                    dupeCountElement.textContent = `x${cardTypeCountDict[countKey]}`;
                                }
                            }
                            displayedCountKeys.add(countKey); // Mark this countKey as displayed
                        } else {
                            // Hide the element if it's a duplicate
                            element.style.display = 'none';
                        }
                    });

                }
            }


        }


    const plugin = new tcgDex();
    IdlePixelPlus.registerPlugin(plugin);
})();
