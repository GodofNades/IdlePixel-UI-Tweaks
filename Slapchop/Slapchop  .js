// ==UserScript==
// @name         IdlePixel Slap Chop - GodofNades Fork
// @namespace    godofnades.idlepixel
// @version      3.0.1
// @description  Ain't nobody got time for that! Adds some QoL 1-click actions.
// @author       Original Author: Anwinity || Modded By: GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483500-idlepixel-slapchop-styles/code/IdlePixel%20SlapChop%20-%20Styles.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483502-idlepixel-slapchop-action-type/code/IdlePixel%20SlapChop%20-%20Action%20Type.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483548-idlepixel-slapchop-mining-crafting-code/code/IdlePixel%20SlapChop%20-%20MiningCrafting%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483546-idlepixel-slapchop-gathering-code/code/IdlePixel%20SlapChop%20-%20Gathering%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483549-idlepixel-slapchop-farming-code/code/IdlePixel%20SlapChop%20-%20Farming%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483553-idlepixel-slapchop-brewing/code/IdlePixel%20SlapChop%20-%20Brewing.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483555-idlepixel-slapchop-woodcutting-code/code/IdlePixel%20SlapChop%20-%20Woodcutting%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483568-idlepixel-slapchop-cooking-code/code/IdlePixel%20SlapChop%20-%20Cooking%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483569-idlepixel-slapchop-fishing-code/code/IdlePixel%20SlapChop%20-%20Fishing%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483570-idlepixel-slapchop-invention-code/code/IdlePixel%20SlapChop%20-%20Invention%20Code.js?anticache=20220905
// @require      https://greasyfork.org/scripts/483571-idlepixel-slapchop-combat-code/code/IdlePixel%20SlapChop%20-%20Combat%20Code.js?anticache=20220905
// ==/UserScript==

(function () {
	"use strict";
	var singleOverride;

	var foundryToggle = true;

	const IMAGE_URL_BASE = $("itembox[data-item=copper] img")
		.attr("src")
		.replace(/\/[^/]+.png$/, "");


	let loaded = false;

	let onLoginLoaded = false;

	class SlapChopPlugin extends IdlePixelPlusPlugin {
		constructor() {
			super("slapchop", {
				about: {
					name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
					version: GM_info.script.version,
					author: GM_info.script.author,
					description: GM_info.script.description,
				},
				config: [
					{
						label:
							"------------------------------------------------<br/>Key Binds<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "primaryActionKey",
						label: "Primary Action Key",
						type: "select",
						options: [
							{ value: "none", label: "None" },
							{ value: "altKey", label: "Alt" },
							{ value: "shiftKey", label: "Shift" },
							{ value: "ctrlKey", label: "Ctrl" },
						],
						default: "none",
					},
					{
						id: "altActionKey",
						label: "Alt Action Key",
						type: "select",
						options: [
							{ value: "altKey", label: "Alt" },
							{ value: "shiftKey", label: "Shift" },
							{ value: "ctrlKey", label: "Ctrl" },
						],
						default: "altKey",
					},
					{
						id: "autoSingleEnabled",
						label:
							"Enable the ability to use items without having to hold the 'ALT' key<br/>to keep a single item for slapchop commands.",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Brewing<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickBrewButtonEnabled",
						label: "Quick Brew (buttons): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickPotionRightClickEnabled",
						label: "Quick Potion (right-click, primary=1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Combat<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickCraftArrowRightClickEnabled",
						label:
							"Quick Craft Arrow (right-click feather, primary=max): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickExplosionEnabled",
						label:
							"Quick Detonation - Quickly use explosives in combat window (right-click): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickFightEnabled",
						label: "Quick Fight: Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickFightConfirm",
						label: "Quick Fight: Confirm",
						type: "boolean",
						default: false,
					},
					{
						id: "quickFightEnergyBar",
						label: "Quick Fight: Energy Bar",
						type: "boolean",
						default: true,
					},
					{
						id: "quickFightFPBar",
						label: "Quick Fight: FP Bar",
						type: "boolean",
						default: true,
					},
					{
						id: "quickNeedleRightClickEnabled",
						label:
							"Quick Needle (right-click, primary=max, alt=keep-1): Enabled",
						type: "boolean",
						default: false,
					},
					{
						id: "quickPresetsEnabled",
						label: "Quick Presets: Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Cooking/Eating<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickCookRightClickEnabled",
						label: "Quick Cook (right-click, primary=max, alt=keep-1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickEatRightClickEnabled",
						label: "Quick Eat (right-click, primary=max, alt=keep-1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Farming<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickBoneRightClickEnabled",
						label:
							"Quick Bonemeal (right-click, primary=max, alt=keep-1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickHarvestEnabled",
						label: "Quick Harvest (Bob): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickHarvestNotificationEnabled",
						label:
							"Harvest Farm plots when clicking on the notification: Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickPlantRightClickEnabled",
						label: "Quick Plant (right-click, primary=1, alt=max): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickPlantHarvestRightClickEnabled",
						label:
							"Quick Harvest And Plant (right-click, primary=1, alt=max): Enabled",
						type: "boolean",
						default: false,
					},
					{
						label:
							"------------------------------------------------<br/>Fishing<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickBaitRightClickEnabled",
						label: "Quick Bait (right-click): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickBoatRightClickEnabled",
						label: "Quick Boat (right-click): Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Foundry/Mining/Smelting<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickFoundryEnabled",
						label: "Quick Foundry (buttons): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickMiningRightClickEnabled",
						label: "Quick Geode / Prism Use (right-click, primary=1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickMineralRightClickEnabled",
						label:
							"Quick Mineral XP Conversion (right-click, primary=1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickSmeltEnabled",
						label: "Quick Smelt (buttons): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickSmeltRightClickEnabled",
						label: "Quick Smelt (right-click, primary=max): Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Gathering<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickGatherRightClickEnabled",
						label:
							"Quick Gather (right-click, primary=max, alt=keep-1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Invention<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickGrindRightClickEnabled",
						label: "Quick Blood Grind (right-click, primary=1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickCleanseRightClickEnabled",
						label:
							"Quick Cleanse Blood in Invention (right-click, primary=1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						label:
							"------------------------------------------------<br/>Woodcutting<br/>------------------------------------------------",
						type: "label",
					},
					{
						id: "quickBurnRightClickEnabled",
						label:
							"Quick Burn Logs (right-click, primary=max, alt=keep-1): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickChopEnabled",
						label: "Quick Chop (Lumberjack): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickChopRegTreesEnabled",
						label: "Quick Chop (Normal Trees Lumberjack): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickChopSDTreesEnabled",
						label: "Quick Chop (SD Trees Lumberjack): Enabled",
						type: "boolean",
						default: true,
					},
					{
						id: "quickTreeNotificationHarvestEnabled",
						label: "Harvest Trees when clicking on the notification: Enabled",
						type: "boolean",
						default: true,
					},
				],
			});
		}

		updateButtons() {
			let potions = ["rare_monster_potion", "super_rare_monster_potion"];
			potions.forEach((potion) => {
				let useButton = document.getElementById(`${potion}-use`);
				let brewButton = document.getElementById(`${potion}-brew`);
				IdlePixelPlus.getVarOrDefault(potion, 0, "int")
					? (useButton.style.color = "white")
					: (useButton.style.color = "red");
				window.canBrew(potion)
					? (brewButton.style.color = "white")
					: (brewButton.style.color = "red");
			});
			let combatLootPotionsAmount = document.getElementById(
				"combat_loot_potion-label"
			);
			combatLootPotionsAmount.textContent =
				IdlePixelPlus.getVarOrDefault("combat_loot_potion_timer", 0, "int") == 0
					? "Loot Potions: " +
					  IdlePixelPlus.getVarOrDefault("combat_loot_potion", 0, "int")
					: format_time(
							IdlePixelPlus.getVarOrDefault(
								"combat_loot_potion_timer",
								0,
								"int"
							)
					  );
			let rainPotionsAmount = document.getElementById(
				"rain_potion-in-combat-label"
			);
			rainPotionsAmount.textContent =
				IdlePixelPlus.getVarOrDefault("rain_potion_timer", 0, "int") == 0
					? "Rain Potions: " +
					  IdlePixelPlus.getVarOrDefault("rain_potion", 0, "int")
					: format_time(
							IdlePixelPlus.getVarOrDefault("rain_potion_timer", 0, "int")
					  );
		}

		onPanelChanged(panelBefore, panelAfter) {
			if (Globals.currentPanel == "panel-woodcutting") {
				let woodCuttingElite = Achievements.has_completed_set(
					"woodcutting",
					"elite"
				);
				if (woodCuttingElite) {
					$("#rain_pot-woodcutting").show();
				} else {
					$("#rain_pot-woodcutting").hide();
				}
				if (Globals.currentPanel == "panel-combat") {
					var lamps = IdlePixelPlus.getVarOrDefault("combat_xp_lamp", 0, "int");
					if (lamps == 0) {
						$("#quick-lamp-zone").hide();
					} else {
						$("#quick-lamp-zone").show();
					}
					window.updateQuickFight();
				}
			}
		}

		onConfigsChanged() {
			if (onLoginLoaded) {
				const slapchopQuickFight = document.querySelector(
					"#slapchop-quickfight"
				);
				const slapchopQuickFoundry = document.querySelector(
					"#slapchop-quickfoundry"
				);
				const slapchopQuickPreset = document.querySelector(
					"#slapchop-quickpreset"
				);
				const slapchopQuickFightFPBar = document.querySelectorAll(
					".slapchop-quickfight-fightpoints"
				);
				const slapchopQuickFightEnergyBar = document.querySelectorAll(
					".slapchop-quickfight-energy"
				);
				const slapchopQuickSmeltMining = document.getElementById(
					"slapchop-quicksmelt-mining"
				);
				const slapchopQuickSmeltCrafting = document.getElementById(
					"slapchop-quicksmelt-crafting"
				);
				const slapchopQuickBrewButton = document.querySelectorAll(
					".slapchop-quickbrew-button"
				);

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickFightEnabled")) {
					slapchopQuickFight.style.display = "block";
				} else {
					slapchopQuickFight.style.display = "none";
				}

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickFoundryEnabled")) {
					slapchopQuickFoundry.style.display = "block";
				} else {
					slapchopQuickFoundry.style.display = "none";
				}

				const presetsUnlocked = IdlePixelPlus.getVar("combat_presets") == "1";
				if (
					presetsUnlocked &&
					IdlePixelPlus.plugins.slapchop.getConfig("quickPresetsEnabled")
				) {
					slapchopQuickPreset.style.display = "block";
				} else {
					slapchopQuickPreset.style.display = "none";
				}

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickFightFPBar")) {
					slapchopQuickFightFPBar.forEach((bar) => {
						bar.style.display = "block";
					});
				} else {
					slapchopQuickFightFPBar.forEach((bar) => {
						bar.style.display = "none";
					});
				}

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickFightEnergyBar")) {
					slapchopQuickFightEnergyBar.forEach((bar) => {
						bar.style.display = "block";
					});
				} else {
					slapchopQuickFightEnergyBar.forEach((bar) => {
						bar.style.display = "none";
					});
				}

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickSmeltEnabled")) {
					slapchopQuickSmeltMining.style.display = "block";
					slapchopQuickSmeltCrafting.style.display = "block";
				} else {
					slapchopQuickSmeltMining.style.display = "none";
					slapchopQuickSmeltCrafting.style.display = "none";
				}

				if (
					IdlePixelPlus.plugins.slapchop.getConfig("quickBrewButtonEnabled")
				) {
					slapchopQuickBrewButton.forEach((button) => {
						button.style.display = "block";
					});
				} else {
					slapchopQuickBrewButton.forEach((button) => {
						button.style.display = "none";
					});
				}

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickHarvestEnabled")) {
					window.var_slapchop_bob = "1";
				} else {
					window.var_slapchop_bob = "0";
				}

				if (IdlePixelPlus.plugins.slapchop.getConfig("quickChopEnabled")) {
					window.var_slapchop_lumberjack = "1";
				} else {
					window.var_slapchop_lumberjack = "0";
				}

				const notificationTreesReady = document.getElementById(
					"notification-trees-ready"
				);
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickTreeNotificationHarvestEnabled"
					)
				) {
					notificationTreesReady.setAttribute(
						"onClick",
						`window.quickChop(); switch_panels('panel-woodcutting')`
					);
				} else {
					notificationTreesReady.setAttribute(
						"onClick",
						`switch_panels('panel-woodcutting')`
					);
				}
			}
		}

		onLogin() {
            window.slapchopUser = IdlePixelPlus.getVarOrDefault("username", "", "string");
			singleOverride =
				IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
			window.initSlapchopStyles();
			// Located in the Mining/Crafting js File
			window.initQuickSmelt();
			window.initQuickMineral();
			window.initQuickMining();
			window.updateQuickSmelt();
			window.initMiningPresets();
			window.initQuickRocketFuel();
			// Gathering
			window.initQuickGather();
			// Farming
			window.initQuickPlant();
			window.initQuickBones();
			window.initQuickHarvest();
			// Brewing
			window.initQuickPotions();
			window.initQuickBrew();
			// To be Coded Still
			// Woodcutting
			window.initQuickFoundry();
			window.initQuickBurn();
			window.initQuickChop();
			window.updateQuickFoundry();
			// Cooking
			window.initQuickCook();
			window.initQuickEat();
			// Fishing
			window.initQuickBoat();
			window.initQuickBait();
			// Invention
			window.initQuickGrind();
			window.initQuickCleanse();
			// Combat
			window.initQuickFight();
			window.initQuickNeedle();
			window.initQuickFeather2Arrow();
			window.initPresets();
			window.initPresetListener();
			window.initQuickExplode();
			window.initQuickLamps();
			window.updateQuickFight();

			if (
				IdlePixelPlus.plugins.slapchop.getConfig(
					"quickTreeNotificationHarvestEnabled"
				)
			) {
				$("#notification-trees-ready").attr(
					"onClick",
					`window.quickChop(); switch_panels('panel-woodcutting')`
				);
			} else {
				$("#notification-trees-ready").attr(
					"onClick",
					`switch_panels('panel-woodcutting')`
				);
			}

			if (
				IdlePixelPlus.plugins.slapchop.getConfig(
					"quickHarvestNotificationEnabled"
				)
			) {
				$("#notification-farming-ready").attr(
					"onClick",
					`window.quickHarvest(); switch_panels('panel-farming')`
				);
			} else {
				$("#notification-farming-ready").attr(
					"onClick",
					`switch_panels('panel-farming')`
				);
			}

			$("#game-panels-combat-items-area .itembox-fight").first().after(`
            <div id="rare-monster-pot-in-combat-tab" class="itembox-fight" data-tooltip="fight">
               <div class="itembox-fight-center"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/rare_monster_potion.png" title="fight"></div>
               <div class="center-flex">
                  <div id="rare_monster_potion-brew" class="hover" onclick="window.quickBrew('rare_monster_potion')">BREW</div>
                  <div id="rare_monster_potion-use" class="hover" onclick="Modals.clicks_rare_monster_potion()">USE</div>
               </div>
            </div>
      `);
			$("#rare-monster-pot-in-combat-tab").after(`
             <div id="super_rare-monster-pot-in-combat-tab" class="itembox-fight" data-tooltip="fight">
               <div class="itembox-fight-center"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/super_rare_monster_potion.png" title="fight"></div>
               <div class="center-flex">
                  <div id="super_rare_monster_potion-brew" class="hover" onclick="window.quickBrew('super_rare_monster_potion')">BREW</div>
                  <div id="super_rare_monster_potion-use" class="hover" onclick="Modals.clicks_super_rare_monster_potion()">USE</div>
               </div>
            </div>
`);
			$(".fight-left-border .td-combat-bottom-panel").after(`
            <div id="fighting-combat_loot_potion" onclick="websocket.send('BREWING_DRINK_COMBAT_LOOT_POTION')" class="fighting-monster-loot-potion hover shadow">
               <img src="https://idlepixel.s3.us-east-2.amazonaws.com/images/combat_loot_potion.png" title="combat_loot_potion_icon">
               <span id="combat_loot_potion-label">Loot Potions: 0</span>
            </div>`);
			$(".fight-left-border #fighting-combat_loot_potion").after(`
            <div id="fighting-rain_potion" onclick="websocket.send('DRINK=rain_potion')" class="fighting-monster-rain-potion hover shadow">
               <img src="https://idlepixel.s3.us-east-2.amazonaws.com/images/rain_potion.png" title="rain_potion_in_combat_icon">
               <span id="rain_potion-in-combat-label">Rain Potions: 0</span>
            </div>`);
			$("#slapchop-lumberjack").after(`
             <div id="rain_pot-woodcutting" class="lumberjack-rain-pot-woodcutting" data-tooltip="rain_pot">
               <div class="itembox-fight-center"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/rain_potion.png" title="rain_potion"></div>
               <div class="center-flex">
                  <div id="rain_potion-brew" class="hover" onclick="window.quickBrew('rain_potion')">BREW</div>
                  <div id="rain_potion-use" class="hover" onclick="websocket.send('DRINK=rain_potion')">USE</div>
               </div>
            </div>`);

			setTimeout(function () {
				onLoginLoaded = true;
				IdlePixelPlus.plugins.slapchop.onConfigsChanged();
			}, 5000);
			loaded = true;
		}

		onVariableSet(key, valueBefore, valueAfter) {
			if (onLoginLoaded) {
				if (Globals.currentPanel != "panel-combat-canvas") {
					if (Globals.currentPanel == "panel-combat") {
						if (key.includes("combat_xp_lamp")) {
							var lamps = IdlePixelPlus.getVarOrDefault(
								"combat_xp_lamp",
								0,
								"int"
							);
							if (lamps == 0) {
								$("#quick-lamp-zone").hide();
							} else {
								$("#quick-lamp-zone").show();
							}
						}
					}
					if (
						[
							"fight_points",
							"energy",
							"volcano_unlocked",
							"northern_field_unlocked",
							"blood_moon_active",
						].includes(key)
					) {
						window.updateQuickFight();
					}
				}

				if (
					Globals.currentPanel == "panel-mining" ||
					Globals.currentPanel == "panel-crafting"
				) {
					if (
						[
							window.SMELTABLES,
							"oil",
							"charcoal",
							"lava",
							"dragon_fire",
							"stone_furnace",
							"bronze_furnace",
							"iron_furnace",
							"silver_furnace",
							"gold_furnace",
							"promethium_furnace",
							"titanium_furnace",
							"ancient_furnace",
							"dragon_furnace",
						].includes(key)
					) {
						window.updateQuickSmelt();
						window.updateMaxCraftable();
					}
				}

				if (Globals.currentPanel == "panel-woodcutting") {
					if ([...LOGS, "oil", "foundry_amount"].includes(key)) {
						window.updateQuickFoundry();
					}
				}

				if (!loaded) {
					this.delay();
					return;
				}

				let variables = [
					"dotted_green_leaf",
					"strange_leaf",
					"red_mushroom",
					"rare_monster_potion",
					"super_rare_monster_potion",
					"combat_loot_potion",
					"combat_loot_potion_timer",
					"rain_potion",
					"rain_potion_timer",
				];
				if (variables.includes(key)) {
					this.updateButtons();
				}
			}
		}

		async delay() {
			await new Promise((resolve) => {
				const checkLoaded = () => {
					if (loaded) {
						resolve();
					} else {
						setTimeout(checkLoaded, 2000);
					}
				};

				checkLoaded();
			});

			this.updateButtons();
		}
	}

	const plugin = new SlapChopPlugin();
	IdlePixelPlus.registerPlugin(plugin);
})();
