// ==UserScript==
// @name         IdlePixel SlapChop - Combat Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Combat Code.
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

	const EXPLOSIVES = ["bomb", "tnt", "large_tnt", "mega_bomb"];

	function loadPresets(buttonNum) {
		let loadout = window.localStorage.getItem("preset_" + buttonNum).split(",");
		IdlePixelPlus.sendMessage("UNEQUIP_ALL");
		let i = 0;
		while (i < loadout.length) {
			IdlePixelPlus.sendMessage("EQUIP=" + loadout[i]);
			i++;
		}
	}

	function savePresets(buttonNum) {
		let head = IdlePixelPlus.getVarOrDefault("head", null, "string");
		let body = IdlePixelPlus.getVarOrDefault("body", null, "string");
		let legs = IdlePixelPlus.getVarOrDefault("legs", null, "string");
		let boots = IdlePixelPlus.getVarOrDefault("boots", null, "string");
		let gloves = IdlePixelPlus.getVarOrDefault("gloves", null, "string");
		let amulet = IdlePixelPlus.getVarOrDefault("amulet", null, "string");
		let weapon = IdlePixelPlus.getVarOrDefault("weapon", null, "string");
		let shield = IdlePixelPlus.getVarOrDefault("shield", null, "string");
		let arrows = IdlePixelPlus.getVarOrDefault("arrows", null, "string");
		let equip =
			head +
			"," +
			body +
			"," +
			legs +
			"," +
			boots +
			"," +
			gloves +
			"," +
			amulet +
			"," +
			weapon +
			"," +
			shield +
			"," +
			arrows;
		let preset_call = "preset_" + buttonNum;
		let obj = {};
		obj[preset_call] = "{preset_" + buttonNum + ": " + equip + "}";
		let convert = JSON.stringify(obj[preset_call]);
		//console.log(convert);
		window.localStorage.setItem("preset_" + buttonNum, [
			head,
			body,
			legs,
			boots,
			gloves,
			amulet,
			weapon,
			shield,
			arrows,
		]);
	}

	async function initQuickFight() {
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
              <button type="button" onclick="window.quickFight('${
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
              <button onclick="window.savePresets(6)">Save 6</button>
              <button onclick="window.loadPresets(6)">Load 6</button>
            </div>
            <div>
              <button onclick="window.savePresets(7)">Save 7</button>
              <button onclick="window.loadPresets(7)">Load 7</button>
            </div>
            <div>
              <button onclick="window.savePresets(8)">Save 8</button>
              <button onclick="window.loadPresets(8)">Load 8</button>
            </div>
            <div>
              <button onclick="window.savePresets(9)">Save 9</button>
              <button onclick="window.loadPresets(9)">Load 9</button>
            </div>
            <div>
              <button onclick="window.savePresets(10)">Save 10</button>
              <button onclick="window.loadPresets(10)">Load 10</button>
            </div>
          </div>
          <hr>
        </div>
      `;
		$("#panel-combat hr").first().after(html);
	}

	function useLamps(typeLamp) {
		var lampCount = IdlePixelPlus.getVarOrDefault("combat_xp_lamp", 0, "int");
		for (let i = lampCount; i > 0; i--) {
			websocket.send("COMBAT_XP_LAMP=" + typeLamp);
		}
	}

	function initQuickLamps() {
		$("#game-panels-combat-items-area").before(`
        <div id="quick-lamp-zone">
          <h5>Quick Lamps:</h5>
          <div id="lamp-zone-all">
            <div id="melee-lamp-zone">
              <div id="melee-zone-label">Melee</div>
              <button id="lamp-melee-max" onClick=window.useLamps("melee")>Max</button>
           </div>
           <div id="archery-lamp-zone">
             <div id="archery-zone-label">Archery</div>
             <button id="lamp-archery-max" onClick=window.useLamps("archery")>Max</button>
           </div>
           <div id="magic-lamp-zone">
             <div id="magic-zone-label">Magic</div>
             <button id="lamp-magic-max" onClick=window.useLamps("magic")>Max</button>
           </div>
         </div>
         <hr>
       </div>
    `);
		var lamps = IdlePixelPlus.getVarOrDefault("combat_xp_lamp", 0, "int");
		if (lamps == 0) {
			$("#quick-lamp-zone").hide();
		} else {
			$("#quick-lamp-zone").show();
		}
	}

	function updateQuickFight() {
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

	function quickFight(zoneId) {
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

	function quickExplode(item) {
		IdlePixelPlus.sendMessage(`USE_${item.toUpperCase()}`);
	}

	function initQuickExplode() {
		$(`itembox[data-item="bomb"]`).on("contextmenu", (event) => {
			if (IdlePixelPlus.plugins.slapchop.getConfig("quickExplosionEnabled")) {
				const primary = window.isPrimaryActionSlapchop(event);
				const alt = window.isAltActionSlapchop(event);
				if (primary || alt) {
					window.quickExplode("bomb");
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
					window.quickExplode("tnt");
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
			return true;
		});
		$(`itembox[data-item="large_tnt"]`).on("contextmenu", (event) => {
			if (IdlePixelPlus.plugins.slapchop.getConfig("quickExplosionEnabled")) {
				const primary = window.isPrimaryActionSlapchop(event);
				const alt = window.isAltActionSlapchop(event);
				if (primary || alt) {
					window.quickExplode("large_tnt");
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
					window.quickExplode("mega_bomb");
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
			return true;
		});
	}

	function quickNeedle(item, alt) {
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

	function initQuickNeedle() {
		window.NEEDLEABLE.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickNeedleRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickNeedle(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function maxCraftableArrows(feather) {
		const data = window.FEATHER2ARROW[feather];
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

	function quickFeather2Arrow(item, alt) {
		let n = window.maxCraftableArrows(item);
		if (n > 0) {
			IdlePixelPlus.sendMessage(
				`CRAFT=${window.FEATHER2ARROW[item].craft}~${n}`
			);
		}
	}

	function initQuickFeather2Arrow() {
		Object.keys(window.FEATHER2ARROW).forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickCraftArrowRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickFeather2Arrow(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function initPresets() {
		$("#combat-presets-area").append(`
	          <br />
              <br />
              <img data-tooltip="Preset 6" id="in-combat-presets-icon-6" onclick="window.loadPresets(6)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 7" id="in-combat-presets-icon-7" onclick="window.loadPresets(7)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 8" id="in-combat-presets-icon-8" onclick="window.loadPresets(8)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 9" id="in-combat-presets-icon-9" onclick="window.loadPresets(9)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
              <img data-tooltip="Preset 10" id="in-combat-presets-icon-10" onclick="window.loadPresets(10)" class="combat-presets-combat-icon hover w30" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/melee.png" />
            `);
	}

	function initPresetListener() {
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

	window.initQuickFight = initQuickFight;
	window.initQuickNeedle = initQuickNeedle;
	window.initQuickFeather2Arrow = initQuickFeather2Arrow;
	window.initPresets = initPresets;
	window.initPresetListener = initPresetListener;
	window.initQuickExplode = initQuickExplode;
	window.initQuickLamps = initQuickLamps;
	window.updateQuickFight = updateQuickFight;
	window.loadPresets = loadPresets;
	window.savePresets = savePresets;
	window.useLamps = useLamps;
	window.quickFight = quickFight;
	window.quickExplode = quickExplode;
	window.quickNeedle = quickNeedle;
	window.maxCraftableArrows = maxCraftableArrows;
	window.quickFeather2Arrow = quickFeather2Arrow;
	window.NEEDLEABLE = NEEDLEABLE;
	window.FEATHER2ARROW = FEATHER2ARROW;
	window.EXPLOSIVES = EXPLOSIVES;
})();
