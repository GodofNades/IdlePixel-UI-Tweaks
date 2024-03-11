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

(function() {
    'use strict';

    let playername = "";
    window.TCG_IMAGE_URL_BASE =
        document
        .querySelector("itembox[data-item=copper] img")
        .src.replace(/\/[^/]+.png$/, "") + "/";
    let onLoginLoaded = false;

    const categoriesTCG = [
        { id: 'ORE', label: '1. Ore' },
        { id: 'BAR', label: '2. Bar' },
        { id: 'SEED', label: '3. Seed' },
        { id: 'WOOD', label: '4. Wood' },
        { id: 'LEAF', label: '5. Leaf' },
        { id: 'GEM', label: '6. Gem' },
        { id: 'FISH', label: '7. Fish' },
        { id: 'MONSTER', label: '8. Monster' },
        { id: 'GEAR', label: '9. Gear' },
        { id: 'LEGENDARY', label: '10. Legendary' }
    ];

    class tcgDex extends IdlePixelPlusPlugin {
        constructor() {
            super("tcgDex", {
                about: {
                    name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
                    version: GM_info.script.version,
                    author: GM_info.script.author,
                    description: GM_info.script.description
                },
                config: [
                    {
                        label:
                        "------------------------------------------------<br/>Notification<br/>------------------------------------------------",
                        type: "label",
                    },
                    {
                        id: "tcgNotification",
                        label: "Enable TCG Card Buying Available Notification (Default: Enabled)",
                        type: "boolean",
                        default: true
                    }
                ]
            });
        }

        updateTcgSettings(categoryId, state) {
            const settings = JSON.parse(localStorage.getItem(`${playername}.tcgSettings`));
            settings[categoryId] = state;
            localStorage.setItem(`${playername}.tcgSettings`, JSON.stringify(settings));
        }

        getTcgSetting(categoryId) {
            const settings = JSON.parse(localStorage.getItem(`${playername}.tcgSettings`));
            return settings[categoryId];
        }

        tcgBuyerNotifications() {
            let tcgTimerCheck = IdlePixelPlus.getVarOrDefault("tcg_timer", 0, "int");
            let tcgUnlocked = IdlePixelPlus.getVarOrDefault("tcg_active", 0, "int");
            const notifDiv = document.createElement("div");
            notifDiv.id = `notification-tcg-timer`;
            notifDiv.onclick = function () {
                websocket.send(switch_panels('panel-criptoe-tcg'));
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
        };

        updateTCGNotification() {
            let tcgTimerCheck = IdlePixelPlus.getVarOrDefault("tcg_timer", 0, "int");
            let tcgUnlocked = IdlePixelPlus.getVarOrDefault("tcg_active", 0, "int");
            if(this.getConfig("tcgNotification") && tcgUnlocked != 0) {
                document.getElementById("notification-tcg-timer").style.display = "inline-block";
                if(tcgTimerCheck > 0) {
                    let timerLabel = format_time(tcgTimerCheck);
                    document.getElementById("notification-tcg-timer-label").innerText = ` ${timerLabel}`;
                } else {
                    document.getElementById("notification-tcf-timer-label").innerText = ` Time to buy cards!`;
                }
            } else {
                document.getElementById("notification-tcg-timer").style.display = "none";
            }
        }

        onLogin() {
            CToe.loadCards=function() {};
            playername = IdlePixelPlus.getVarOrDefault("username", "", "string");
            if (!localStorage.getItem(`${playername}.tcgSettings`)) {
                const defaultSettings = categoriesTCG.reduce((settings, category) => {
                    settings[category.id] = true; // Default state is true (visible)
                    return settings;
                }, {});
                localStorage.setItem(`${playername}.tcgSettings`, JSON.stringify(defaultSettings));
            }
            this.tcgBuyerNotifications();
            this.updateTCGNotification();
            onLoginLoaded = true;
        };

        onVariableSet(key, valueBefore, valueAfter) {
            if(onLoginLoaded) {
                if(key.startsWith("tcg") && valueBefore != valueAfter) {
                    IdlePixelPlus.plugins.tcgDex.updateTCGNotification();
                }
            }
        };

        onConfigChange() {
            if(onLoginLoaded) {
                IdlePixelPlus.plugins.tcgDex.updateTCGNotification();
            }
        };

        onPanelChanged(panelBefore, panelAfter) {
            //Insert Code Here
        }

        onMessageReceived(data) {
            if (data.startsWith("REFRESH_TCG")) {
                const parts = data.replace("REFRESH_TCG=", "").split("~");

                let cardSort = [];
                let order = 1; // Start numbering at 1

                Object.keys(CardData.data).forEach(key => {
                    cardSort.push({ id: key, order: order++, holo: true });
                    cardSort.push({ id: key, order: order++, holo: false });
                });

                let currentCards = [];

                // Iterate through parts in steps of 3
                for (let i = 0; i < parts.length; i += 3) {
                    const cardNum = parts[i];
                    const cardKey = parts[i + 1];
                    const isHolo = parts[i + 2] === "true";

                    const matchingCard = cardSort.find(card => card.id === cardKey && card.holo === isHolo);

                    if (matchingCard) {
                        currentCards.push({
                            id: cardKey,
                            cardNum: cardNum,
                            holo: isHolo,
                            order: matchingCard.order
                        });
                    }
                }

                currentCards.sort((a, b) => a.order - b.order);

                const joinedString = currentCards.map(card => `${card.cardNum}~${card.id}~${card.holo}`).join("~");


                document.getElementById("tcg-area-context").innerHTML = "";
                if(joinedString == "NONE") return;
                var dataArray = joinedString.split("~");
                var html = "";
                for (var i = 0; i < dataArray.length;) {
                    var id = dataArray[i++];
                    var var_name = dataArray[i++];
                    var holo = dataArray[i++] == 'true';

                    html += CardData.getCardHTML(id, var_name, holo);
                }
                document.getElementById("tcg-area-context").innerHTML = html;

                const pendingTCGContainer = document.getElementById("tcg-area-context");

                categoriesTCG.forEach(category => {
                    const categoryDiv = document.createElement('div');
                    categoryDiv.id = `pending${category.id}Container`;

                    const categoryDivInner = document.createElement('div');
                    categoryDivInner.id = `pending${category.id}ContainerInner`;
                    // Set initial visibility based on localStorage
                    categoryDivInner.style.display = IdlePixelPlus.plugins.tcgDex.getTcgSetting(category.id) ? '' : 'none';

                    const toggleButton = document.createElement('button');
                    toggleButton.textContent = IdlePixelPlus.plugins.tcgDex.getTcgSetting(category.id) ? ' ↥ ' : ' ↧ ';
                    toggleButton.style.width = "50px";
                    toggleButton.style.marginRight = "10px";
                    toggleButton.addEventListener('click', () => {
                        const isVisible = categoryDivInner.style.display !== 'none';
                        categoryDivInner.style.display = isVisible ? 'none' : '';
                        toggleButton.textContent = isVisible ? ' ↧ ' : ' ↥ ';
                        IdlePixelPlus.plugins.tcgDex.updateTcgSettings(category.id, !isVisible);
                    });

                    categoryDiv.innerHTML = `
                      <div id="tcgLabel" style="font-size: 1.25em"></div>
                    `;

                    categoryDiv.appendChild(toggleButton);
                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = category.label;
                    categoryDiv.appendChild(toggleButton);
                    categoryDiv.appendChild(labelSpan);
                    categoryDiv.appendChild(document.createElement('br'));
                    categoryDiv.appendChild(categoryDivInner);
                    document.getElementById("tcg-area-context").appendChild(categoryDiv);
                });

                document.querySelectorAll(".tcg-card").forEach((card) => {
                    if(card.textContent.includes("ORE")) {
                        document.getElementById("pendingOREContainerInner").appendChild(card);
                    } else if (card.textContent.includes("BAR")) {
                        document.getElementById("pendingBARContainerInner").appendChild(card);
                    } else if (card.textContent.includes("SEED")) {
                        document.getElementById("pendingSEEDContainerInner").appendChild(card);
                    } else if (card.textContent.includes("WOOD")) {
                        document.getElementById("pendingWOODContainerInner").appendChild(card);
                    } else if (card.textContent.includes("LEAF")) {
                        document.getElementById("pendingLEAFContainerInner").appendChild(card);
                    } else if (card.textContent.includes("GEM")) {
                        document.getElementById("pendingGEMContainerInner").appendChild(card);
                    } else if (card.textContent.includes("FISH")) {
                        document.getElementById("pendingFISHContainerInner").appendChild(card);
                    } else if (card.textContent.includes("MONSTER")) {
                        document.getElementById("pendingMONSTERContainerInner").appendChild(card);
                    } else if (card.textContent.includes("GEAR")) {
                        document.getElementById("pendingGEARContainerInner").appendChild(card);
                    } else if (card.textContent.includes("LEGENDARY")) {
                        document.getElementById("pendingLEGENDARYContainerInner").appendChild(card);
                    }
                })
            }
        }

    }

    const plugin = new tcgDex();
    IdlePixelPlus.registerPlugin(plugin);
})();