// ==UserScript==
// @name         IdlePixel SlapChop - Woodcutting Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Woodcutting Code.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	let singleOverride;

	const IMAGE_URL_BASE = document
		.querySelector("itembox[data-item=copper] img")
		.src.replace(/\/[^/]+.png$/, "");

	const LOGS = Object.keys(Cooking.LOG_HEAT_MAP);

	function quickBurn(item, alt) {
		let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
		singleOverride = IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(`ADD_HEAT=${item}~${n}`);
		}
	}

	function initQuickBurn() {
		LOGS.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (IdlePixelPlus.plugins.slapchop.getConfig("quickBurnRightClickEnabled")) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickBurn(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function initQuickFoundry() {
		let html = `
        <div id="slapchop-quickfoundry" class="slapchop-quickfight">
          <h5>Quick Foundry:</h5>
          <div class="slapchop-quicksmelt-buttons">
        `;
		window.LOGS.forEach((log) => {
			if (log != "dense_logs") {
				html += `
              <button id="slapchop-quickfoundry-${log}" type="button" onclick="window.quickFoundry('${log}')">
                <img src="${IMAGE_URL_BASE}/${log}.png" class="img-20" />
                ${log
									.replace("_logs", "")
									.replace(/_/g, " ")
									.replace(/(^|\s)\w/g, (s) => s.toUpperCase())}
                (<span data-slap="max-foundry-${log}">?</span>)
              </button>
            `;
			}
		});
		html += `
          </div>
          <hr>
        </div>
        `;
		$("#panel-woodcutting hr").first().after(html);
	}

	function updateQuickFoundry() {
		const foundryBusy =
			IdlePixelPlus.getVarOrDefault("foundry_amount", 0, "int") != 0;
		LOGS.forEach((log) => {
			if (log != "dense_logs") {
				const max = window.maxFoundry(log);
				$(`[data-slap="max-foundry-${log}"]`).text(max);
				if (!foundryBusy && max > 0) {
					$(`#slapchop-quickfoundry-${log}`).prop("disabled", false);
				} else {
					$(`#slapchop-quickfoundry-${log}`).prop("disabled", true);
				}
			}
		});
	}

	function quickFoundry(log) {
		if (foundryToggle) {
			foundryToggle = false;
			const max = window.maxFoundry(log);
			if (max > 0) {
				IdlePixelPlus.sendMessage(`FOUNDRY=${log}~${max}`);
			}
			setTimeout(function () {
				foundryToggle = true;
			}, 1000);
		}
	}

	function maxFoundry(log) {
		if (IdlePixelPlus.getVarOrDefault("charcoal_foundry_crafted", "0") != "1") {
			return 0;
		}
		let max = IdlePixelPlus.getVarOrDefault(log, 0, "int");
		let foundryStorage = IdlePixelPlus.getVarOrDefault(
			"foundry_storage_crafted",
			0,
			"int"
		);

		if (max >= 1000 && foundryStorage == 1) {
			max = 1000;
		} else if (max > 100 && foundryStorage != 1) {
			max = 100;
		}

		let oilMax = Math.floor(
			IdlePixelPlus.getVarOrDefault("oil", 0, "int") / 10
		);
		if (max > oilMax) {
			max = oilMax;
		}
		return max;
	}

	function initQuickChop() {
		$("#panel-woodcutting itembox").first().before(`
        <itembox id="slapchop-lumberjack" class="shadow hover" data-item="slapchop_lumberjack" onclick="window.quickChop()">
            <div class="center mt-1"><img width="50" height="50" src="data:image/png;base64,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"></div>
            <div class="center mt-2">Chop</div>
        </itembox>
        `);
		$("#panel-woodcutting itembox").first().after(`
        <itembox id="slapchop-rain-pot" class="shadow hover" data-item="slapchop_rainpot" onclick="websocket.send(DRINK=rain_potion)">
            <div class="center mt-1"><img width="50" height="50" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/rain_potion.png" title="rain_potion"></div>
            <div class="center mt-2">Chop</div>
        </itembox>
        `);
	}

	function quickChop() {
		for (let i = 1; i <= 5; i++) {
			let status = IdlePixelPlus.getVarOrDefault("tree_stage_" + i, 0, "int");
			let treeType = IdlePixelPlus.getVarOrDefault("tree_" + i, "none");
			let sdCut = IdlePixelPlus.plugins.slapchop.getConfig("quickChopSDTreesEnabled");
			let regCut = IdlePixelPlus.plugins.slapchop.getConfig("quickChopRegTreesEnabled");
			if (
				(status == 4 && treeType != "stardust_tree" && treeType != "tree") ||
				(status == 4 && treeType == "stardust_tree" && sdCut) ||
				(status == 4 && treeType == "tree" && regCut)
			) {
				IdlePixelPlus.sendMessage("CHOP_TREE=" + i);
			}
		}
	}

	window.initQuickFoundry = initQuickFoundry;
	window.initQuickBurn = initQuickBurn;
	window.initQuickChop = initQuickChop;
	window.quickBurn = quickBurn;
	window.quickFoundry = quickFoundry;
	window.maxFoundry = maxFoundry;
	window.quickChop = quickChop;
	window.updateQuickFoundry = updateQuickFoundry;
	window.LOGS = LOGS;
})();
