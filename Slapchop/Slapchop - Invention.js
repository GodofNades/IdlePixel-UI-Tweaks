// ==UserScript==
// @name         IdlePixel SlapChop - Invention Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Invention Code.
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

	const GRINDABLE = $(
		`#panel-invention itembox[data-item^="blood_"][onclick^="Invention.clicks_limb"]`
	)
		.toArray()
		.map((el) => el.getAttribute("data-item"));

	function initQuickGrind() {
		window.GRINDABLE.forEach((item) => {
			$(`#panel-invention itembox[data-item="${item}"]`).on(
				"contextmenu",
				(event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickGrindRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							window.quickGrind(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				}
			);
		});
	}

	function quickGrind(item, alt) {
		let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (!alt && !singleOverride && n > 1) {
			n = 1;
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(`GRIND=${item}~${n}`);
		}
	}

	function quickCleanse(item, alt) {
		let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(`CLEANSE_EVIL_BLOOD=${item}~${n}`);
		}
	}

	function initQuickCleanse() {
		$(`itembox[data-item="evil_blood"]`).on("contextmenu", (event) => {
			if (
				IdlePixelPlus.plugins.slapchop.getConfig(
					"quickCleanseRightClickEnabled"
				)
			) {
				const primary = window.isPrimaryActionSlapchop(event);
				const alt = window.isAltActionSlapchop(event);
				if (primary || alt) {
					window.quickCleanse("evil_blood", !primary);
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
			return true;
		});
	}

	window.initQuickGrind = initQuickGrind;
	window.initQuickCleanse = initQuickCleanse;
	window.quickGrind = quickGrind;
	window.quickCleanse = quickCleanse;
	window.GRINDABLE = GRINDABLE;
})();
