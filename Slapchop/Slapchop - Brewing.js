// ==UserScript==
// @name         IdlePixel SlapChop - Brewing
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Brewing Code.
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

	let POTIONS = Object.keys(Brewing.POTION_TIMERS);
	const POTIONSNOTIMER = [
		"cooks_dust_potion",
		"fighting_dust_potion",
		"tree_dust_potion",
		"farm_dust_potion",
	];

	POTIONS.push(...POTIONSNOTIMER);

	function canBrew(potion) {
		let ingredients = Brewing.get_ingredients(potion);
		for (let i = 0; i < ingredients.length; i += 2) {
			if (
				IdlePixelPlus.getVarOrDefault(ingredients[i], 0, "int") <
				ingredients[i + 1]
			)
				return false;
		}
		return true;
	}

	function quickPotion(potion, alt) {
		let n = IdlePixelPlus.getVarOrDefault(potion, 0, "int");
		//console.log(potion);
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (!alt && !singleOverride && n > 1) {
			n = 1;
		}
		if (n > 0) {
			if (potion == "combat_loot_potion" && var_combat_loot_potion_timer == 0) {
				websocket.send(`BREWING_DRINK_COMBAT_LOOT_POTION`);
			} else if (potion == "rotten_potion" && var_rotten_potion_timer == 0) {
				websocket.send(`BREWING_DRINK_ROTTEN_POTION`);
			} else if (
				potion == "merchant_speed_potion" &&
				var_merchant_speed_potion_timer == 0
			) {
				websocket.send(`BREWING_DRINK_MERCHANT_SPEED_POTION`);
			} else {
				IdlePixelPlus.sendMessage(`DRINK=${potion}`);
			}
		}
	}

	function initQuickPotions() {
		window.POTIONS.forEach((item) => {
			const itemBox = document.querySelector(`[data-item="${item}"]`);
			itemBox.oncontextmenu = "";

			if (itemBox) {
				itemBox.addEventListener("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickPotionRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							window.quickPotion(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			}
		});

		const combatLootPotion = document.querySelector(
			'[data-item="combat_loot_potion"]'
		);
		combatLootPotion.oncontextmenu = "";

		if (combatLootPotion) {
			combatLootPotion.addEventListener("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickPotionRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickPotion("combat_loot_potion", !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		}

		const merchantSpeedPotion = document.querySelector(
			'[data-item="merchant_speed_potion"]'
		);
		merchantSpeedPotion.oncontextmenu = "";

		if (merchantSpeedPotion) {
			merchantSpeedPotion.addEventListener("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickPotionRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						this.quickPotion("merchant_speed_potion", !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		}

		const rottenPotion = document.querySelector('[data-item="rotten_potion"]');
		rottenPotion.oncontextmenu = "";

		if (rottenPotion) {
			rottenPotion.addEventListener("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickPotionRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickPotion("rotten_potion", !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		}
	}

	function quickBrew(potion) {
		IdlePixelPlus.sendMessage(`BREW=${potion}~1`);
	}

	function initQuickBrew() {
		$("#brewing-table tbody tr[data-brewing-item]").each(function () {
			const el = $(this);
			const potion = el.attr("data-brewing-item");
			if (!potion) {
				return;
			}
			el.find("td:nth-child(4)").append(`
            <div class="slapchop-quickbrew-button"
                onclick="event.stopPropagation(); window.quickBrew('${potion}')"">Quick Brew 1</div>
            `);
		});
	}

	window.initQuickPotions = initQuickPotions;
	window.initQuickBrew = initQuickBrew;
	window.canBrew = canBrew;
	window.quickPotion = quickPotion;
	window.quickBrew = quickBrew;
	window.POTIONS = POTIONS;
})();
