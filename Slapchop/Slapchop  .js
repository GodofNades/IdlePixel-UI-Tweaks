// ==UserScript==
// @name         IdlePixel Slap Chop - GodofNades Fork
// @namespace    godofnades.idlepixel
// @version      3.0
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
// ==/UserScript==

(function () {
	"use strict";
	var singleOverride;

	var foundryToggle = true;

	const IMAGE_URL_BASE = $("itembox[data-item=copper] img")
		.attr("src")
		.replace(/\/[^/]+.png$/, "");

	const EDIBLES = Object.keys(Cooking.ENERGY_MAP).filter(
		(s) => !s.startsWith("raw_")
	);

	const COOKABLES = Object.keys(Cooking.FOOD_HEAT_REQ_MAP);
	
	const BOATS = $(`itembox[data-item$="_boat"], itembox[data-item$="_ship"]`)
		.toArray()
		.map((el) => el.getAttribute("data-item"));

	const BAITS = $(`itembox[data-item$="bait"]`)
		.toArray()
		.map((el) => el.getAttribute("data-item"));

	const NEEDLEABLE = [
		"lizard_mask",
		"lizard_body",
		"lizard_legs",
		"lizard_boots",
		"lizard_gloves",
		"bat_mask",
		"bat_body",
		"bat_legs",
		"bat_boots",
		"bat_gloves",
		"bear_mask",
		"bear_body",
		"bear_legs",
		"bear_boots",
		"bear_gloves",
	];

	const GRINDABLE = $(
		`#panel-invention itembox[data-item^="blood_"][onclick^="Invention.clicks_limb"]`
	)
		.toArray()
		.map((el) => el.getAttribute("data-item"));


	const EXPLOSIVES = ["bomb", "tnt", "large_tnt", "mega_bomb"];
	
	let loaded = false;
	
	let onLoginLoaded = false;
	
	const FEATHER2ARROW = {
		feathers: {
			craft: "wooden_arrows",
			required: {
				feathers: 15,
				logs: 5,
				iron_bar: 5,
			},
		},
		fire_feathers: {
			craft: "fire_arrows",
			required: {
				fire_feathers: 15,
				oak_logs: 5,
				silver_bar: 5,
			},
		},
		ice_feathers: {
			craft: "ice_arrows",
			required: {
				ice_feathers: 15,
				willow_logs: 5,
				gold_bar: 5,
			},
		},
	};

	function loadPresets(buttonNum) {
		var loadout = window.localStorage.getItem("preset_" + buttonNum).split(",");
		IdlePixelPlus.sendMessage("UNEQUIP_ALL");
		let i = 0;
		while (i < loadout.length) {
			IdlePixelPlus.sendMessage("EQUIP=" + loadout[i]);
			i++;
		}
	}

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

		setItemBoxOverlay(items, enabled) {
			items.forEach((item) => {
				if (enabled) {
					$(`itembox[data-item=${item}]`).addClass("slapchop-overlay");
				} else {
					$(`itembox[data-item=${item}]`).removeClass("slapchop-overlay");
				}
			});
		}

		async initQuickFight() {
			let html = `
            <div id="slapchop-quickfight">
              <h5>Quick Fight:</h5>
              <div class="slapchop-quickfight-buttons">
            `;
			Object.values(IdlePixelPlus.info.combatZones).forEach((zone) => {
				html += `
                <div id="slapchop-quickfight-${
									zone.id
								}" class="slapchop-quickfight-zone m-1 ${
					zone.blood ? "blood" : ""
				}">
                  <button type="button" onclick="IdlePixelPlus.plugins.slapchop.quickFight('${
										zone.id
									}')">${zone.id
					.replace(/_/g, " ")
					.replace(/(^|\s)\w/g, (s) => s.toUpperCase())}</button>
                  <div class="slapchop-quickfight-fightpoints slapchop-quickfight-progress-container" title="Fight Points: ${zone.fightPointCost.toLocaleString()}">
                    <span class="slapchop-quickfight-progress-value">0</span>
                    <div class="slapchop-quickfight-progress"></div>
                  </div>
                  <div class="slapchop-quickfight-energy slapchop-quickfight-progress-container" title="Energy: ${zone.energyCost.toLocaleString()}">
                    <span class="slapchop-quickfight-progress-value">0</span>
                    <div class="slapchop-quickfight-progress"></div>
                  </div>
                </div>
                `;
			});
			html += `
              <div id="slapchop-quickfight-castle" class="slapchop-quickfight-zone m-1 castle">
                <button type="button" onclick="Castle.clicks_castle_entrance()">Faradox Castle</button>
                <div class="slapchop-quickfight-fightpoints slapchop-quickfight-progress-container" title="Fight Points: Castle}">
                    <span class="slapchop-quickfight-progress-value">No FP to Enter</span>
                    <div class="slapchop-quickfight-progress"></div>
                  </div>
                  <div class="slapchop-quickfight-energy slapchop-quickfight-progress-container" title="Energy: Castle}">
                    <span class="slapchop-quickfight-progress-value">No Energy to Enter</span>
                    <div class="slapchop-quickfight-progress"></div>
                  </div>
                </div>
                </div>
            `;
			html += `
              </div>
              <hr>
            </div>
            <div id="slapchop-quickpreset">
              <h5>Quick Presets:</h5>
              <div class="slapchop-quickpreset-buttons">
                <div>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_SAVE=1')">Save 1</button>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_LOAD=1~1')">Load 1</button>
                </div>
                <div>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_SAVE=2')">Save 2</button>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_LOAD=2~1')">Load 2</button>
                </div>
                <div>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_SAVE=3')">Save 3</button>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_LOAD=3~1')">Load 3</button>
                </div>
                <div>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_SAVE=4')">Save 4</button>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_LOAD=4~1')">Load 4</button>
                </div>
                <div>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_SAVE=5')">Save 5</button>
                  <button onclick="IdlePixelPlus.sendMessage('PRESET_LOAD=5~1')">Load 5</button>
                </div>
                <div>
                  <button onclick="savePresets(6)">Save 6</button>
                  <button onclick="loadPresets(6)">Load 6</button>
                </div>
                <div>
                  <button onclick="savePresets(7)">Save 7</button>
                  <button onclick="loadPresets(7)">Load 7</button>
                </div>
                <div>
                  <button onclick="savePresets(8)">Save 8</button>
                  <button onclick="loadPresets(8)">Load 8</button>
                </div>
                <div>
                  <button onclick="savePresets(9)">Save 9</button>
                  <button onclick="loadPresets(9)">Load 9</button>
                </div>
                <div>
                  <button onclick="savePresets(10)">Save 10</button>
                  <button onclick="loadPresets(10)">Load 10</button>
                </div>
              </div>
              <hr>
            </div>
            <script>
              function savePresets(buttonNum) {
                var head = IdlePixelPlus.getVarOrDefault("head", null, "string");
                var body = IdlePixelPlus.getVarOrDefault("body", null, "string");
                var legs = IdlePixelPlus.getVarOrDefault("legs", null, "string");
                var boots = IdlePixelPlus.getVarOrDefault("boots", null, "string");
                var gloves = IdlePixelPlus.getVarOrDefault("gloves", null, "string");
                var amulet = IdlePixelPlus.getVarOrDefault("amulet", null, "string");
                var weapon = IdlePixelPlus.getVarOrDefault("weapon", null, "string");
                var shield = IdlePixelPlus.getVarOrDefault("shield", null, "string");
                var arrows = IdlePixelPlus.getVarOrDefault("arrows", null, "string");
                var equip = head+","+body+","+legs+","+boots+","+gloves+","+amulet+","+weapon+","+shield+","+arrows;
                var preset_call = "preset_" + buttonNum;
                var obj = {};
                obj[preset_call] = "{preset_" + buttonNum +": "+equip+"}";
                var convert = JSON.stringify(obj[preset_call]);
                //console.log(convert);
                window.localStorage.setItem("preset_" + buttonNum, [head, body, legs, boots, gloves, amulet, weapon, shield, arrows]);
              }

              function loadPresets(buttonNum) {
                var loadout = window.localStorage.getItem("preset_" + buttonNum).split(",");
                //console.log(loadout[1]);
                IdlePixelPlus.sendMessage("UNEQUIP_ALL");
                let i = 0;
                while (i < loadout.length) {
                  IdlePixelPlus.sendMessage("EQUIP=" + loadout[i]);
                  i++;
                };
              }
            </script>
          `;
			$("#panel-combat hr").first().after(html);
		}

		initQuickLamps() {
			$("#game-panels-combat-items-area").before(`
            <div id="quick-lamp-zone">
              <h5>Quick Lamps:</h5>
              <div id="lamp-zone-all">
                <div id="melee-lamp-zone">
                  <div id="melee-zone-label">Melee</div>
                  <button id="lamp-melee-max" onClick=useLamps("melee")>Max</button>
               </div>
               <div id="archery-lamp-zone">
                 <div id="archery-zone-label">Archery</div>
                 <button id="lamp-archery-max" onClick=useLamps("archery")>Max</button>
               </div>
               <div id="magic-lamp-zone">
                 <div id="magic-zone-label">Magic</div>
                 <button id="lamp-magic-max" onClick=useLamps("magic")>Max</button>
               </div>
             </div>
             <hr>
           </div>
           <script>
             function useLamps(typeLamp) {
               var lampCount = IdlePixelPlus.getVarOrDefault("combat_xp_lamp", 0, "int");
               for (let i = lampCount; i > 0; i--) {
                 websocket.send("COMBAT_XP_LAMP="+typeLamp);
               }
             }
           </script>
        `);
			var lamps = IdlePixelPlus.getVarOrDefault("combat_xp_lamp", 0, "int");
			if (lamps == 0) {
				$("#quick-lamp-zone").hide();
			} else {
				$("#quick-lamp-zone").show();
			}
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

		updateQuickFight() {
			const fp = IdlePixelPlus.getVarOrDefault("fight_points", 0, "int");
			const energy = IdlePixelPlus.getVarOrDefault("energy", 0, "int");

			Object.values(IdlePixelPlus.info.combatZones).forEach((zone) => {
				let disabled = fp < zone.fightPointCost || energy < zone.energyCost;
				let fpPercent = (fp / zone.fightPointCost).toFixed(2).split(".");
				let energyPercent = (energy / zone.energyCost).toFixed(2).split(".");

				let fpLabel = `&times; ${fpPercent[0]} + ${fpPercent[1].replace(
					/^0/,
					""
				)}%`;
				let energyLabel = `&times; ${
					energyPercent[0]
				} + ${energyPercent[1].replace(/^0/, "")}%`;

				if (
					zone.id === "volcano" &&
					IdlePixelPlus.getVar("volcano_unlocked") !== "1"
				) {
					disabled = true;
				} else if (
					zone.id === "northern_field" &&
					IdlePixelPlus.getVar("northern_field_unlocked") !== "1"
				) {
					disabled = true;
				} else if (
					zone.id === "mansion" &&
					IdlePixelPlus.getVar("mansion_unlocked") !== "1"
				) {
					disabled = true;
				} else if (
					(zone.id === "blood_field" ||
						zone.id === "blood_forest" ||
						zone.id === "blood_cave" ||
						zone.id === "blood_volcano") &&
					IdlePixelPlus.getVar("blood_moon_active") !== "1"
				) {
					disabled = true;
				}

				const button = document.querySelector(
					`#slapchop-quickfight-${zone.id} button`
				);
				button.disabled = disabled;

				const fpProgress = document.querySelector(
					`#slapchop-quickfight-${zone.id} .slapchop-quickfight-fightpoints .slapchop-quickfight-progress`
				);
				const energyProgress = document.querySelector(
					`#slapchop-quickfight-${zone.id} .slapchop-quickfight-energy .slapchop-quickfight-progress`
				);
				const fpProgressValue = document.querySelector(
					`#slapchop-quickfight-${zone.id} .slapchop-quickfight-fightpoints .slapchop-quickfight-progress-value`
				);
				const energyProgressValue = document.querySelector(
					`#slapchop-quickfight-${zone.id} .slapchop-quickfight-energy .slapchop-quickfight-progress-value`
				);

				fpProgress.style.width = `${fpPercent}%`;
				energyProgress.style.width = `${energyPercent}%`;
				fpProgressValue.innerHTML = fpLabel;
				energyProgressValue.innerHTML = energyLabel;
			});
		}

		quickFight(zoneId) {
			const confirm =
				IdlePixelPlus.plugins.slapchop.getConfig("quickFightConfirm");
			if (confirm) {
				if (
					window.confirm(
						`FIGHT: ${zoneId
							.replace(/_/g, " ")
							.replace(/(^|\s)\w/g, (s) => s.toUpperCase())} ?`
					)
				) {
					if (zoneId.startsWith("blood_")) {
						Combat.modal_blood_area_last_selected = zoneId;
					} else {
						Combat.modal_area_last_selected = zoneId;
					}
					IdlePixelPlus.sendMessage(`START_FIGHT=${zoneId}`);
				}
			} else {
				if (zoneId.startsWith("blood_")) {
					Combat.modal_blood_area_last_selected = zoneId;
				} else {
					Combat.modal_area_last_selected = zoneId;
				}
				IdlePixelPlus.sendMessage(`START_FIGHT=${zoneId}`);
			}
		}

		initQuickCook() {
			COOKABLES.forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickCookRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickCook(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			});
		}

		maxCookable(food) {
			return Cooking.can_cook_how_many(food) || 0;
		}

		quickCook(food, alt) {
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

		quickEat(food, alt) {
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

		initQuickEat() {
			EDIBLES.forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickEatRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickEat(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			});
		}

		quickCleanse(item, alt) {
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

		initQuickCleanse() {
			$(`itembox[data-item="evil_blood"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickCleanseRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						this.quickCleanse("evil_blood", !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		}

		quickExplode(item) {
			IdlePixelPlus.sendMessage(`USE_${item.toUpperCase()}`);
		}

		initQuickExplode() {
			$(`itembox[data-item="bomb"]`).on("contextmenu", (event) => {
				if (IdlePixelPlus.plugins.slapchop.getConfig("quickExplosionEnabled")) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						this.quickExplode("bomb");
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
			$(`itembox[data-item="tnt"]`).on("contextmenu", (event) => {
				if (IdlePixelPlus.plugins.slapchop.getConfig("quickExplosionEnabled")) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						this.quickExplode("tnt");
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
			$(`itembox[data-item="mega_bomb"]`).on("contextmenu", (event) => {
				if (IdlePixelPlus.plugins.slapchop.getConfig("quickExplosionEnabled")) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						this.quickExplode("mega_bomb");
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		}

		quickBoat(item) {
			const n = IdlePixelPlus.getVar(`${item}_timer`);
			if (n == "1") {
				IdlePixelPlus.sendMessage(`BOAT_COLLECT=${item}`);
			} else {
				IdlePixelPlus.sendMessage(`BOAT_SEND=${item}`);
			}
		}

		initQuickBoat() {
			BOATS.forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickBoatRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickBoat(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			});
		}

		quickBait(item) {
			var baitUse = "THROW_" + item.toUpperCase();
			websocket.send(`${baitUse}`);
		}

		initQuickBait() {
			BAITS.forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickBaitRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickBait(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			});
		}

		quickNeedle(item, alt) {
			let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
			singleOverride =
				IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
			if (alt || singleOverride) {
				n--;
			}
			if (n > 0) {
				IdlePixelPlus.sendMessage(`USE_NEEDLE=${item}~${n}`);
			}
		}

		initQuickNeedle() {
			NEEDLEABLE.forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickNeedleRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickNeedle(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			});
		}

		maxCraftableArrows(feather) {
			const data = FEATHER2ARROW[feather];
			if (!data) return 0;

			let max = Number.MAX_SAFE_INTEGER;
			Object.keys(data.required).forEach((item) => {
				const needed = data.required[item];
				const owned = IdlePixelPlus.getVarOrDefault(item, 0, "int");
				const craftable = Math.floor(owned / needed);
				max = Math.min(max, craftable);
			});
			return max;
		}

		quickFeather2Arrow(item, alt) {
			let n = this.maxCraftableArrows(item);
			if (n > 0) {
				IdlePixelPlus.sendMessage(`CRAFT=${FEATHER2ARROW[item].craft}~${n}`);
			}
		}

		initQuickFeather2Arrow() {
			Object.keys(FEATHER2ARROW).forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickCraftArrowRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickFeather2Arrow(item, !primary);
							event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
					return true;
				});
			});
		}

		initPresets() {
			$("#combat-presets-area").append(`
	          <br />
              <br />
              <img data-tooltip="Preset 6<br /><br />Hot key not implemented" id="in-combat-presets-icon-6" onclick="loadPresets(6)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 7<br /><br />Hot key not implemented" id="in-combat-presets-icon-7" onclick="loadPresets(7)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 8<br /><br />Hot key not implemented" id="in-combat-presets-icon-8" onclick="loadPresets(8)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 9<br /><br />Hot key not implemented" id="in-combat-presets-icon-9" onclick="loadPresets(9)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 10<br /><br />Hot key not implemented" id="in-combat-presets-icon-10" onclick="loadPresets(10)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
            `);
		}

		initPresetListener() {
			document.addEventListener("keyup", (e) => {
				switch (e.keyCode) {
					case 54: //6
						var chat_focused_6 = $("#chat-area-input").is(":focus");
						if (
							Globals.currentPanel == "panel-combat-canvas" ||
							(Globals.currentPanel == "panel-combat" && !chat_focused_6)
						)
							loadPresets(6);
						break;
					case 55: //7
						var chat_focused_7 = $("#chat-area-input").is(":focus");
						if (
							Globals.currentPanel == "panel-combat-canvas" ||
							(Globals.currentPanel == "panel-combat" && !chat_focused_7)
						)
							loadPresets(7);
						break;
					case 56: //8
						var chat_focused_8 = $("#chat-area-input").is(":focus");
						if (
							Globals.currentPanel == "panel-combat-canvas" ||
							(Globals.currentPanel == "panel-combat" && !chat_focused_8)
						)
							loadPresets(8);
						break;
					case 57: //9
						var chat_focused_9 = $("#chat-area-input").is(":focus");
						if (
							Globals.currentPanel == "panel-combat-canvas" ||
							(Globals.currentPanel == "panel-combat" && !chat_focused_9)
						)
							loadPresets(9);
						break;
					case 48: //0
						var chat_focused_10 = $("#chat-area-input").is(":focus");
						if (
							Globals.currentPanel == "panel-combat-canvas" ||
							(Globals.currentPanel == "panel-combat" && !chat_focused_10)
						)
							loadPresets(10);
						break;
				}
			});
		}

		initQuickGrind() {
			GRINDABLE.forEach((item) => {
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
								this.quickGrind(item, !primary);
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

		quickGrind(item, alt) {
			//console.log("quickGrind", {item, alt});
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
					this.updateQuickFight();
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
			this.initQuickCook();
			this.initQuickEat();
			// Fishing
			this.initQuickBoat();
			this.initQuickBait();
			// Invention
			this.initQuickGrind();
			this.initQuickCleanse();
			// Combat
			this.initQuickFight();
			this.initQuickNeedle();
			this.initQuickFeather2Arrow();
			this.initPresets();
			this.initPresetListener();
			this.initQuickExplode();
			this.initQuickLamps();
			this.updateQuickFight();

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
						this.updateQuickFight();
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
