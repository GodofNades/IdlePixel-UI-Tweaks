// ==UserScript==
// @name         IdlePixel SlapChop - Gathering Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Gathering Code.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	const LOOT_BAGS = $(`itembox[data-item^="gathering_loot_bag_"]`)
		.toArray()
		.map((el) => el.getAttribute("data-item"));

	function quickGather(bag, alt) {
		let n = IdlePixelPlus.getVarOrDefault(bag, 0, "int");
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(
				`OPEN_GATHERING_LOOT=${bag.replace("gathering_loot_bag_", "")}~${n}`
			);
		}
	}

	function initQuickGather() {
		LOOT_BAGS.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickGatherRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickGather(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	window.initQuickGather = initQuickGather;
	window.quickGather = quickGather;
    window.LOOT_BAGS = LOOT_BAGS;
})();
