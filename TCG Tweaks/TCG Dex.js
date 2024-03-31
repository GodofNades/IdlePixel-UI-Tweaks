// ==UserScript==
// @name         IdlePixel TCG Dex
// @namespace    godofnades.idlepixel
// @version      0.1.7
// @description  Organizational script for the Criptoe Trading Card Game
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @license      MIT
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @downloadURL  https://update.greasyfork.org/scripts/489559/IdlePixel%20TCG%20Dex.user.js
// @updateURL    https://update.greasyfork.org/scripts/489559/IdlePixel%20TCG%20Dex.meta.js
// ==/UserScript==

(function () {
    "use strict";

    let playername = "";
    window.TCG_IMAGE_URL_BASE =
        document
        .querySelector("itembox[data-item=copper] img")
        .src.replace(/\/[^/]+.png$/, "") + "/";
    let onLoginLoaded = false;

    let categoriesTCG = [];
    let currentCards = [];
    let overallCardCounts = {};
    let duplicateToSend = {};

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
                        label: `${i}. ${properTitles}`,
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
            let cardCounts = {};

            categoriesTCG.forEach((category) => {
                cardCounts[category.desc] = {
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
                    cardCounts[category.desc].uniHolo++;
                    cardCounts[category.desc].uniNormal++;
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
                        cardCounts[category[1].description_title].possHolo++;
                        cardCounts[category[1].description_title].ttlHolo++;
                        overallCardCounts.overallHolo++;
                        if (!uniHoloSetOverall.has(card.id)) {
                            uniHoloSetOverall.add(card.id);
                            overallCardCounts.overallUniHolo++;
                            cardCounts[category[1].description_title].possUniHolo++;
                        }
                    } else {
                        cardCounts[category[1].description_title].possNormal++;
                        cardCounts[category[1].description_title].ttlNormal++;
                        overallCardCounts.overallNormal++;
                        if (!uniNormalSetOverall.has(card.id)) {
                            uniNormalSetOverall.add(card.id);
                            overallCardCounts.overallUniNormal++;
                            cardCounts[category[1].description_title].possUniNormal++;
                        }
                    }
                }
            });
            return cardCounts;
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

        fetchAllCardsFromDB(db, objectStoreName, callback) {
            const transaction = db.transaction([objectStoreName], "readonly");
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.getAll();

            request.onerror = (event) => {
                console.error("Error fetching cards from DB:", event.target.error);
            };

            request.onsuccess = () => {
                const cards = request.result;
                const cardOccurrences = new Map();

                cards.forEach((card) => {
                    const key = `${card.id}-${card.holo}`;
                    if (cardOccurrences.has(key)) {
                        cardOccurrences.get(key).push(card);
                    } else {
                        cardOccurrences.set(key, [card]);
                    }
                });

                if (typeof callback === "function") {
                    callback(cards);
                }
            };
        }


        identifyAndRemoveAbsentCards(db, objectStoreName, currentCards) {
            IdlePixelPlus.plugins.tcgDex.fetchAllCardsFromDB(
                db,
                objectStoreName,
                (dbCards) => {
                    const currentCardsKeySet = new Set(
                        currentCards.map((card) =>
                                         JSON.stringify([card.id, card.cardNum, card.holo.toString()])
                                        )
                    );

                    dbCards.forEach((dbCard) => {
                        const dbCardKey = JSON.stringify([
                            dbCard.id,
                            dbCard.cardNum,
                            dbCard.holo.toString(),
                        ]);
                        if (!currentCardsKeySet.has(dbCardKey)) {
                            IdlePixelPlus.plugins.tcgDex.removeCardFromDB(
                                db,
                                objectStoreName,
                                [dbCard.id, dbCard.cardNum, dbCard.holo]
                            );
                        }
                    });
                }
            );
        }

        removeCardFromDB(db, objectStoreName, cardKey) {
            const transaction = db.transaction([objectStoreName], "readwrite");
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.delete(cardKey);
            request.onerror = (event) => {
                console.error("Error removing card from DB:", event.target.error);
            };
            request.onsuccess = () => {
                console.log(`Card removed from DB: ${cardKey}`);
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

        checkForAndHandleDuplicates() {
            const sendTo = IdlePixelPlus.plugins.tcgDex.getConfig("sendTo");
            const enableSend = IdlePixelPlus.plugins.tcgDex.getConfig("enableSend");
            this.fetchAllCardsFromDB(this.db, 'current_cards', (cards) => {
                const cardOccurrences = new Map();
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
                            console.log(`Handling duplicate for ${key}:`, duplicate);

                            if (enableSend && sendTo) {
                                websocket.send(`GIVE_TCG_CARD=${sendTo}~${duplicate.cardNum}`);
                            }
                        }
                    }
                });
            });
        }

        onLogin() {
            CToe.loadCards = function () {};
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

                let cardSort = [];
                currentCards = [];
                let order = 1;
                let newCards = [];

                Object.keys(CardData.data).forEach((key) => {
                    cardSort.push({ id: key, order: order++, holo: true });
                    cardSort.push({ id: key, order: order++, holo: false });
                });

                for (let i = 0; i < parts.length; i += 3) {
                    const cardNum = parts[i];
                    const cardKey = parts[i + 1];
                    const isHolo = parts[i + 2] === "true";

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
                            let timeBefore = new Date(now.getTime() - 15 * 60 * 1000);

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

                IdlePixelPlus.plugins.tcgDex.identifyAndRemoveAbsentCards(
                    this.db,
                    `current_cards`,
                    currentCards
                );

                document.getElementById("tcg-area-context").innerHTML = "";
                if (joinedString == "NONE") return;
                var dataArray = joinedString.split("~");
                var html = "";
                for (var i = 0; i < dataArray.length; ) {
                    var id = dataArray[i++];
                    var var_name = dataArray[i++];
                    var holo = dataArray[i++] == "true";

                    html += CardData.getCardHTML(id, var_name, holo);
                }
                document.getElementById("tcg-area-context").innerHTML = html;

                const pendingTCGContainer = document.getElementById("tcg-area-context");
                const cardOverallStatsLabel = document.createElement("span");
                const ttlOverallCardsLabel = document.createElement("span");
                ttlOverallCardsLabel.id = "ttl-overall-cards-label";
                ttlOverallCardsLabel.style.marginLeft = "60px";
                const uniOverallHoloLabel = document.createElement("span");
                uniOverallHoloLabel.id = "uni-overall-holo-label";
                const ttlOverallHoloLabel = document.createElement("span");
                ttlOverallHoloLabel.id = "ttl-overall-holo-label";
                const uniOverallNormalLabel = document.createElement("span");
                uniOverallNormalLabel.id = "uni-overall-normal-label";
                const ttlOverallNormalLabel = document.createElement("span");
                ttlOverallNormalLabel.id = "ttl-overall-normal-label";

                cardOverallStatsLabel.appendChild(ttlOverallCardsLabel);
                cardOverallStatsLabel.appendChild(uniOverallHoloLabel);
                cardOverallStatsLabel.appendChild(ttlOverallHoloLabel);
                cardOverallStatsLabel.appendChild(uniOverallNormalLabel);
                cardOverallStatsLabel.appendChild(ttlOverallNormalLabel);
                pendingTCGContainer.appendChild(cardOverallStatsLabel);
                pendingTCGContainer.appendChild(document.createElement("br"));
                pendingTCGContainer.appendChild(document.createElement("br"));

                const categoryNewDiv = document.createElement("div");
                categoryNewDiv.id = `pendingNewContainer`;

                const categoryNewDivInner = document.createElement("div");
                categoryNewDivInner.id = `pendingNewContainerInner`;
                categoryNewDivInner.style.display =
                    IdlePixelPlus.plugins.tcgDex.getTcgSetting("new") ? "" : "none";
                const toggleButtonNew = document.createElement("button");
                toggleButtonNew.textContent =
                    IdlePixelPlus.plugins.tcgDex.getTcgSetting("new") ? " ↥ " : " ↧ ";
                toggleButtonNew.style.width = "50px";
                toggleButtonNew.style.marginRight = "10px";
                toggleButtonNew.addEventListener("click", () => {
                    const isVisible = categoryNewDivInner.style.display !== "none";
                    categoryNewDivInner.style.display = isVisible ? "none" : "";
                    toggleButtonNew.textContent = isVisible ? " ↧ " : " ↥ ";
                    IdlePixelPlus.plugins.tcgDex.updateTcgSettings("new", !isVisible);
                });

                const newCardTimer =
                      IdlePixelPlus.plugins.tcgDex.getConfig("newCardTimer");

                const labelSpanNew = document.createElement("span");
                labelSpanNew.textContent = `New Cards (Last ${newCardTimer} Mins)`;

                categoryNewDiv.appendChild(toggleButtonNew);
                categoryNewDiv.appendChild(labelSpanNew);
                categoryNewDiv.appendChild(document.createElement("br"));
                categoryNewDiv.appendChild(document.createElement("br"));
                categoryNewDiv.appendChild(categoryNewDivInner);
                document.getElementById("tcg-area-context").appendChild(categoryNewDiv);

                categoriesTCG.forEach((category) => {
                    const categoryDiv = document.createElement("div");
                    categoryDiv.id = `pending${category.desc}Container`;

                    const categoryDivInner = document.createElement("div");
                    categoryDivInner.id = `pending${category.desc}ContainerInner`;
                    categoryDivInner.style.display =
                        IdlePixelPlus.plugins.tcgDex.getTcgSetting(category.desc)
                        ? ""
                    : "none";

                    const toggleButton = document.createElement("button");
                    toggleButton.textContent = IdlePixelPlus.plugins.tcgDex.getTcgSetting(
                        category.desc
                    )
                        ? " ↥ "
                    : " ↧ ";
                    toggleButton.style.width = "50px";
                    toggleButton.style.marginRight = "10px";
                    toggleButton.addEventListener("click", () => {
                        const isVisible = categoryDivInner.style.display !== "none";
                        categoryDivInner.style.display = isVisible ? "none" : "";
                        toggleButton.textContent = isVisible ? " ↧ " : " ↥ ";
                        IdlePixelPlus.plugins.tcgDex.updateTcgSettings(
                            category.desc,
                            !isVisible
                        );
                    });

                    categoryDiv.innerHTML = `
                      <div id="tcgLabel" style="font-size: 1.25em"></div>
                        `;

                    categoryDiv.appendChild(toggleButton);
                    const labelSpan = document.createElement("span");
                    labelSpan.textContent = category.label;
                    categoryDiv.appendChild(toggleButton);
                    categoryDiv.appendChild(labelSpan);

                    const cardStatsLabel = document.createElement("span");
                    const ttlCardsLabel = document.createElement("span");
                    ttlCardsLabel.id = "ttl-cards-label";
                    ttlCardsLabel.style.marginLeft = "60px";
                    const uniHoloLabel = document.createElement("span");
                    uniHoloLabel.id = "uni-holo-label";
                    const ttlHoloLabel = document.createElement("span");
                    ttlHoloLabel.id = "ttl-holo-label";
                    const uniNormalLabel = document.createElement("span");
                    uniNormalLabel.id = "uni-normal-label";
                    const ttlNormalLabel = document.createElement("span");
                    ttlNormalLabel.id = "ttl-normal-label";

                    cardStatsLabel.appendChild(ttlCardsLabel);
                    cardStatsLabel.appendChild(uniHoloLabel);
                    cardStatsLabel.appendChild(ttlHoloLabel);
                    cardStatsLabel.appendChild(uniNormalLabel);
                    cardStatsLabel.appendChild(ttlNormalLabel);
                    categoryDiv.appendChild(document.createElement("br"));
                    categoryDiv.appendChild(cardStatsLabel);
                    categoryDiv.appendChild(document.createElement("br"));
                    categoryDiv.appendChild(categoryDivInner);
                    document.getElementById("tcg-area-context").appendChild(categoryDiv);
                });

                const cardCounts = this.calculateCardCounts();
                categoriesTCG.forEach((category) => {
                    const counts = cardCounts[category.desc];
                    document.querySelector(
                        `#pending${category.desc}Container #ttl-cards-label`
					).textContent = `Total Cards (${
						counts.possHolo + counts.possNormal
                })`;
                    document.querySelector(
                        `#pending${category.desc}Container #uni-holo-label`
					).textContent = ` => Holo: [ Unique: (${counts.possUniHolo}/${counts.uniHolo})`;
                    document.querySelector(
                        `#pending${category.desc}Container #ttl-holo-label`
					).textContent = ` || Total: (${counts.ttlHolo}) ]`;
                    document.querySelector(
                        `#pending${category.desc}Container #uni-normal-label`
					).textContent = ` Normal: [ Unique: (${counts.possUniNormal}/${counts.uniNormal})`;
                    document.querySelector(
                        `#pending${category.desc}Container #ttl-normal-label`
					).textContent = ` || Total: (${counts.ttlNormal}) ]`;
                });

                document.getElementById(
                    `ttl-overall-cards-label`
				).textContent = `Total Cards (${
					overallCardCounts.overallHolo + overallCardCounts.overallNormal
            })`;
                document.getElementById(
                    `uni-overall-holo-label`
				).textContent = ` => Holo: [ Unique: (${overallCardCounts.overallUniHolo}/${overallCardCounts.overallTTL})`;
                document.getElementById(
                    `ttl-overall-holo-label`
				).textContent = ` || Total: (${overallCardCounts.overallHolo}) ]`;
                document.getElementById(
                    `uni-overall-normal-label`
				).textContent = ` Normal: [ Unique: (${overallCardCounts.overallUniNormal}/${overallCardCounts.overallTTL})`;
                document.getElementById(
                    `ttl-overall-normal-label`
				).textContent = ` || Total: (${overallCardCounts.overallNormal}) ]`;

                document.querySelectorAll(".tcg-card").forEach((card) => {
                    categoriesTCG.forEach((category) => {
                        if (card.textContent.includes(category.id)) {
                            document
                                .getElementById(`pending${category.desc}ContainerInner`)
                                .appendChild(card);
                        }
                    });
                });

                setTimeout(() => {
                    newCards.sort((a, b) => b.received_datetime - a.received_datetime);

                    const newCardsJoinedString = newCards
                    .map((card) => `${card.cardNum}~${card.id}~${card.holo}`)
                    .join("~");

                    document.getElementById("pendingNewContainerInner").innerHTML = "";
                    if (newCardsJoinedString == "") return;
                    var dataArrayNew = newCardsJoinedString.split("~");
                    var htmlNew = "";
                    for (var ix = 0; ix < dataArrayNew.length; ) {
                        var idNew = dataArrayNew[ix++];
                        var var_nameNew = dataArrayNew[ix++];
                        var holoNew = dataArrayNew[ix++] == "true";

                        htmlNew += CardData.getCardHTML(idNew, var_nameNew, holoNew);
                    }
                    document.getElementById("pendingNewContainerInner").innerHTML =
                        htmlNew;
                }, 2000);

                this.checkForAndHandleDuplicates();
            }
        }
    }

    const plugin = new tcgDex();
    IdlePixelPlus.registerPlugin(plugin);
})();
