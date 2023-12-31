// ==UserScript==
// @name         IdlePixel SlapChop - Fishing Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Fishing Code.
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

	const BOATS = $(`itembox[data-item$="_boat"], itembox[data-item$="_ship"]`)
		.toArray()
		.map((el) => el.getAttribute("data-item"));

	const BAITS = $(`itembox[data-item$="bait"]`)
		.toArray()
		.map((el) => el.getAttribute("data-item"));

	function quickBoat(item) {
		const n = IdlePixelPlus.getVar(`${item}_timer`);
		if (n == "1") {
			IdlePixelPlus.sendMessage(`BOAT_COLLECT=${item}`);
		} else {
			IdlePixelPlus.sendMessage(`BOAT_SEND=${item}`);
		}
	}

	function initQuickBoat() {
		window.BOATS.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig("quickBoatRightClickEnabled")
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickBoat(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function quickBait(item) {
		var baitUse = "THROW_" + item.toUpperCase();
		websocket.send(`${baitUse}`);
	}

	function initQuickBait() {
		window.BAITS.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig("quickBaitRightClickEnabled")
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickBait(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	window.initQuickBoat = initQuickBoat;
	window.initQuickBait = initQuickBait;
	window.quickBoat = quickBoat;
	window.quickBait = quickBait;
	window.BOATS = BOATS;
	window.BAITS = BAITS;
})();
