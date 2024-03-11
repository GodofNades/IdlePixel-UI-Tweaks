// ==UserScript==
// @name         IdlePixel TCG Dex
// @namespace    godofnades.idlepixel
// @version      0.1.1
// @description  Organizational script for the Criptoe Trading Card Game
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @license      MIT
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
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
                        "Enable TCG Card Buying Available Notification (Default: Enabled)",
                        type: "boolean",
                        default: true,
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

        calculateCardCounts() {
            let cardCounts = {};

            // Initialize counts
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
                overallNormal:0,
            }

            // Count unique cards in each category
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

            // Count possessed cards

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
                        "notification-tcf-timer-label"
                    ).innerText = ` Time to buy cards!`;
                }
            } else {
                document.getElementById("notification-tcg-timer").style.display =
                    "none";
            }
        }

        onLogin() {
            CToe.loadCards = function () {};
            playername = IdlePixelPlus.getVarOrDefault("username", "", "string");
            setTimeout(() => {
                categoriesTCG = this.getCategoryData();
                if (!localStorage.getItem(`${playername}.tcgSettings`)) {
                    const defaultSettings = categoriesTCG.reduce((settings, category) => {
                        settings[category.desc] = true; // Default state is true (visible)
                        return settings;
                    }, {});
                    localStorage.setItem(
                        `${playername}.tcgSettings`,
                        JSON.stringify(defaultSettings)
                    );
                }
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

        onPanelChanged(panelBefore, panelAfter) {
            //Insert Code Here
        }

        onMessageReceived(data) {
            if (data.startsWith("REFRESH_TCG")) {
                const parts = data.replace("REFRESH_TCG=", "").split("~");

                let cardSort = [];
                currentCards = [];
                let order = 1; // Start numbering at 1

                Object.keys(CardData.data).forEach((key) => {
                    cardSort.push({ id: key, order: order++, holo: true });
                    cardSort.push({ id: key, order: order++, holo: false });
                });

                // Iterate through parts in steps of 3
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

                const joinedString = currentCards
                .map((card) => `${card.cardNum}~${card.id}~${card.holo}`)
                .join("~");

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

                categoriesTCG.forEach((category) => {
                    const categoryDiv = document.createElement("div");
                    categoryDiv.id = `pending${category.desc}Container`;

                    const categoryDivInner = document.createElement("div");
                    categoryDivInner.id = `pending${category.desc}ContainerInner`;
                    // Set initial visibility based on localStorage
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
                    const cardStatsLabel = document.createElement("span");
                    //cardStatsLabel.style.justify = "right";
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
                    categoryDiv.appendChild(toggleButton);
                    categoryDiv.appendChild(labelSpan);
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

                document.getElementById(`ttl-overall-cards-label`).textContent = `Total Cards (${overallCardCounts.overallHolo + overallCardCounts.overallNormal})`;
                document.getElementById(`uni-overall-holo-label`).textContent = ` => Holo: [ Unique: (${overallCardCounts.overallUniHolo}/${overallCardCounts.overallTTL})`;
                document.getElementById(`ttl-overall-holo-label`).textContent = ` || Total: (${overallCardCounts.overallHolo}) ]`;
                document.getElementById(`uni-overall-normal-label`).textContent = ` Normal: [ Unique: (${overallCardCounts.overallUniNormal}/${overallCardCounts.overallTTL})`;
                document.getElementById(`ttl-overall-normal-label`).textContent = ` || Total: (${overallCardCounts.overallNormal}) ]`;

                console.log(overallCardCounts);

                document.querySelectorAll(".tcg-card").forEach((card) => {
                    categoriesTCG.forEach((category) => {
                        if (card.textContent.includes(category.id)) {
                            document
                                .getElementById(`pending${category.desc}ContainerInner`)
                                .appendChild(card);
                        }
                    });
                });
            }
        }
    }

    const plugin = new tcgDex();
    IdlePixelPlus.registerPlugin(plugin);
})();
