// ==UserScript==
// @name         IdlePixel Loot Log Tweaks
// @namespace    godofnades.idlepixel
// @version      0.1.4
// @description  Moving the Loot Log into a container like IdlePixel Fixed had with 'Tab' as the button to open.
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @license      MIT
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// ==/UserScript==

(function () {
	"use strict";

    let lootLogRefreshTimer;

	class lootLogTweaks extends IdlePixelPlusPlugin {
		constructor() {
			super("lootlogtweaks", {
				about: {
					name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
					version: GM_info.script.version,
					author: GM_info.script.author,
					description: GM_info.script.description,
				},
				/*config: [
                    {
                        label: "------------------------------",
                        type: "label"
                    },
                    {
                        label: "General Stuff",
                        type: "label"
                    },
                    {
                        label: "------------------------------",
                        type: "label"
                    },
                    {
                        id: "font",
                        label: "Primary Font",
                        type: "select",
                        options: FONTS,
                        default: FONT_DEFAULT
                    }
                ]*/
			});
		}

		initStyles() {
			const css = `
              #modal-style-ll .drop-log-dt {
                color: cyan;
              }

              #close-button-ll {
                background-color: red;
                width: 30px;
                height: 30px;
                position: absolute;
                top: 10px;
                right: 10px;
                border-radius: 50%;
                cursor: pointer;
              }

              #inner-close-button {
                color: white;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                line-height: 30px;
              }

              #ll-panel-div-container {
                overflow:auto;
                padding: 0.5em;
              }

              #modal-style-ll {
                display: none;
              }

              #modal-style-ll-container {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 98vw;
                height: 100vh;
              }

              #ll-modal-base_window {
                position: absolute;
                top: 10vh;
                left: 25vw;
                width: 45vw;
                height: 85vh;
                text-align: center;
                border: 1px solid grey;
                background-color: rgb(0, 0, 0);
                border-radius:20px;
                padding: 20px;
                z-index: 10000;
                display: flex;
                align-items: center;
                flex-direction: column;
              }
            `;
			const styleSheet = document.createElement("style");
			styleSheet.innerHTML = css;
			document.head.appendChild(styleSheet);
		}

		createPanel() {
			let llModalHTML = `
              <div id="modal-style-ll"">
                <div id="modal-style-ll-container">
                  <div id="ll-modal-base_window" style="">
                    <div id="close-button-ll">
                      <p id="inner-close-button">X</p>
                    </div>
                    <br/>
                    <p id="activity-subheader" class="activity-subheader">Loot Log</p>
                    <hr>
                    <div id="ll-panel-div-container"">
                      <div id="ll-panel-div">
                      </div>
                    </div>
                  </div>
                  </br>
                </div>
              </div>
            `;

			const contentDiv = document.getElementById("content");
			const modalContainer = document.createElement("div");
			modalContainer.innerHTML = llModalHTML;
			contentDiv.appendChild(modalContainer);

			const onlineCount = document.querySelector(
				".top-bar .gold:not(#top-bar-admin-link)"
			);
			const linkElement = document.createElement("a");
			linkElement.href = "#";
			linkElement.className = "hover float-end link-no-decoration";
			linkElement.title = "Loot Log";
			linkElement.textContent = "Loot Log" + "\u00A0\u00A0\u00A0";

			onlineCount.insertAdjacentElement("beforebegin", linkElement);

			const modalStyleLL = document.getElementById("modal-style-ll");
			const closeButton = document.getElementById("close-button-ll");

			linkElement.addEventListener("click", function (event) {
				event.preventDefault();
				modalStyleLL.style.display = "block";
			});

			closeButton.addEventListener("click", function () {
				modalStyleLL.style.display = "none";
			});

			document.addEventListener("keydown", function (event) {
				var chatInput = document.getElementById("chat-area-input");
				var chat_focused = document.activeElement === chatInput;
				if (!chat_focused) {
					if (event.keyCode === 9) {
						if (modalStyleLL.style.display === "block") {
							modalStyleLL.style.display = "none";
						} else {
							modalStyleLL.style.display = "block";
						}
					}
				}
			});

			modalStyleLL.addEventListener("click", function (event) {
				const isClickInside = document
					.getElementById("al-modal-base_window")
					.contains(event.target);

				if (!isClickInside) {
					modalStyleLL.style.display = "none";
				}
			});

			document
				.getElementById("ll-modal-base_window")
				.addEventListener("click", function (event) {
					event.stopPropagation();
				});
		}

		refreshLootLog() {
			try {
				var logObj = new LogManager();
				logObj.refresh_panel();
			} catch (error) {
				console.log(error);
			}
		}

		copyContent() {
			const original = document.getElementById("panel-history-content");
			const mirror = document.getElementById("ll-panel-div");
			mirror.innerHTML = original.innerHTML;
		}

        refreshTimer() {
            this.lootLogRefreshTimer = setInterval(() => {
                this.refreshLootLog();
            }, 5000);
        }

		onLogin() {
			this.initStyles();
			this.createPanel();
            this.refreshTimer();
			this.copyContent();
			const observer = new MutationObserver(this.copyContent);
			const config = { childList: true, subtree: true };

			observer.observe(
				document.getElementById("panel-history-content"),
				config
			);
		}
	}

	const plugin = new lootLogTweaks();
	IdlePixelPlus.registerPlugin(plugin);
})();
