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

	const LOGS = Object.keys(Cooking.LOG_HEAT_MAP);

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

		initQuickFoundry() {
			let html = `
            <div id="slapchop-quickfoundry" class="slapchop-quickfight">
              <h5>Quick Foundry:</h5>
              <div class="slapchop-quicksmelt-buttons">
            `;
			LOGS.forEach((log) => {
				if (log != "dense_logs") {
					html += `
                  <button id="slapchop-quickfoundry-${log}" type="button" onclick="IdlePixelPlus.plugins.slapchop.quickFoundry('${log}')">
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

		updateQuickFoundry() {
			const foundryBusy =
				IdlePixelPlus.getVarOrDefault("foundry_amount", 0, "int") != 0;
			LOGS.forEach((log) => {
				if (log != "dense_logs") {
					const max = this.maxFoundry(log);
					$(`[data-slap="max-foundry-${log}"]`).text(max);
					if (!foundryBusy && max > 0) {
						$(`#slapchop-quickfoundry-${log}`).prop("disabled", false);
					} else {
						$(`#slapchop-quickfoundry-${log}`).prop("disabled", true);
					}
				}
			});
		}

		quickFoundry(log) {
			if (foundryToggle) {
				foundryToggle = false;
				const max = this.maxFoundry(log);
				if (max > 0) {
					IdlePixelPlus.sendMessage(`FOUNDRY=${log}~${max}`);
				}
				setTimeout(function () {
					foundryToggle = true;
				}, 1000);
			}
		}

		maxFoundry(log) {
			if (
				IdlePixelPlus.getVarOrDefault("charcoal_foundry_crafted", "0") != "1"
			) {
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
		
		quickBurn(item, alt) {
			let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
			singleOverride =
				IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
			if (alt || singleOverride) {
				n--;
			}
			if (n > 0) {
				IdlePixelPlus.sendMessage(`ADD_HEAT=${item}~${n}`);
			}
		}

		initQuickBurn() {
			LOGS.forEach((item) => {
				$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
					if (
						IdlePixelPlus.plugins.slapchop.getConfig(
							"quickBurnRightClickEnabled"
						)
					) {
						const primary = window.isPrimaryActionSlapchop(event);
						const alt = window.isAltActionSlapchop(event);
						if (primary || alt) {
							this.quickBurn(item, !primary);
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

		initQuickChop() {
			$("#panel-woodcutting itembox").first().before(`
	        <itembox id="slapchop-lumberjack" class="shadow hover" data-item="slapchop_lumberjack" onclick="IdlePixelPlus.plugins.slapchop.quickChop()">
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

		quickChop() {
			for (let i = 1; i <= 5; i++) {
				let status = IdlePixelPlus.getVarOrDefault("tree_stage_" + i, 0, "int");
				let treeType = IdlePixelPlus.getVarOrDefault("tree_" + i, "none");
				let sdCut = IdlePixelPlus.plugins.slapchop.getConfig(
					"quickChopSDTreesEnabled"
				);
				let regCut = IdlePixelPlus.plugins.slapchop.getConfig(
					"quickChopRegTreesEnabled"
				);
				if (
					(status == 4 && treeType != "stardust_tree" && treeType != "tree") ||
					(status == 4 && treeType == "stardust_tree" && sdCut) ||
					(status == 4 && treeType == "tree" && regCut)
				) {
					IdlePixelPlus.sendMessage("CHOP_TREE=" + i);
				}
			}
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
						`IdlePixelPlus.plugins.slapchop.quickChop(); switch_panels('panel-woodcutting')`
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
			// To be Coded Still
			// Brewing
			window.initQuickPotions();
			window.initQuickBrew();
			// Woodcutting
			this.initQuickFoundry();
			this.initQuickBurn();
			this.initQuickChop();
			this.updateQuickFoundry();
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
					`IdlePixelPlus.plugins.slapchop.quickChop(); switch_panels('panel-woodcutting')`
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
						this.updateQuickFoundry();
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
