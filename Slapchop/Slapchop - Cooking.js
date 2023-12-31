// ==UserScript==
// @name         IdlePixel SlapChop - Cooking Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Cooking Code.
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

	const EDIBLES = Object.keys(Cooking.ENERGY_MAP).filter(
		(s) => !s.startsWith("raw_")
	);

	const COOKABLES = Object.keys(Cooking.FOOD_HEAT_REQ_MAP);

	function initQuickCook() {
		window.COOKABLES.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig("quickCookRightClickEnabled")
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickCook(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function maxCookable(food) {
		return Cooking.can_cook_how_many(food) || 0;
	}

	function quickCook(food, alt) {
		const max = this.maxCookable(food);
		let n = max;
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			const owned = IdlePixelPlus.getVarOrDefault(food, 0, "int");
			if (owned == max || singleOverride) {
				n--;
			}
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(`COOK=${food}~${n}`);
		}
	}

	function quickEat(food, alt) {
		let n = IdlePixelPlus.getVarOrDefault(food, 0, "int");
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(`CONSUME=${food}~${n}`);
		}
	}

	function initQuickEat() {
		window.EDIBLES.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig("quickEatRightClickEnabled")
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickEat(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	window.initQuickCook = initQuickCook;
	window.initQuickEat = initQuickEat;
	window.maxCookable = maxCookable;
	window.quickCook = quickCook;
	window.quickEat = quickEat;
	window.COOKABLES = COOKABLES;
	window.EDIBLES = EDIBLES;
})();
