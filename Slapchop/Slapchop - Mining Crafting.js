// ==UserScript==
// @name         IdlePixel SlapChop - Mining/Crafting Code
// @namespace    godofnades.idlepixel
// @version      0.2.1
// @description  Split off of IdlePixel Slapchop for all Mining and Crafting Code.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	var singleOverride;

	const IMAGE_URL_BASE = document
		.querySelector("itembox[data-item=copper] img")
		.src.replace(/\/[^/]+.png$/, "");

	const SMELTABLES = [
		"copper",
		"iron",
		"silver",
		"gold",
		"promethium",
		"titanium",
		"ancient_ore",
		"dragon_ore",
	];

	const MINING = [
		"small_stardust_prism",
		"medium_stardust_prism",
		"large_stardust_prism",
		"huge_stardust_prism",
		"grey_geode",
		"blue_geode",
		"green_geode",
		"red_geode",
		"cyan_geode",
		"ancient_geode",
		"meteor",
	];

	const MINERAL = [
		"amber_mineral",
		"amethyst_mineral",
		"blood_crystal_mineral",
		"blue_marble_mineral",
		"clear_marble_mineral",
		"dense_marble_mineral",
		"fluorite_mineral",
		"frozen_mineral",
		"jade_mineral",
		"lime_quartz_mineral",
		"magnesium_mineral",
		"opal_mineral",
		"purple_quartz_mineral",
		"sea_crystal_mineral",
		"smooth_pearl_mineral",
		"sulfer_mineral",
		"tanzanite_mineral",
		"topaz_mineral",
	];

	const miningEquipment = [
		"drill",
		"crusher",
		"giant_drill",
		"excavator",
		"giant_excavator",
		"massive_excavator",
	];

	const IPP = IdlePixelPlus;

	const getVar = IdlePixelPlus.getVarOrDefault;

	var smelteryToggle = true;

	function maxSmeltable(ore) {
		const oilPerOre = Crafting.getOilPerBar(ore);
		const charcoalPerOre = Crafting.getCharcoalPerBar(ore);
		const lavaPerOre = Crafting.getLavaPerBar(ore);
		const plasmaPerOre = Crafting.getPlasmaPerBar(ore);

		const oil = IdlePixelPlus.getVarOrDefault("oil", 0, "int");
		const capacity = Furnace.getFurnaceCapacity();
		const oreCount = IdlePixelPlus.getVarOrDefault(ore, 0, "int");
		const maxSmeltFromOil = Math.floor(oil / oilPerOre);
		const dragonFire = IdlePixelPlus.getVarOrDefault("dragon_fire", 0, "int");
		let maxSmeltCount = Math.min(capacity, oreCount, maxSmeltFromOil);

		if (charcoalPerOre > 0) {
			const charcoal = IdlePixelPlus.getVarOrDefault("charcoal", 0, "int");
			const maxSmeltFromCharcoal = Math.floor(charcoal / charcoalPerOre);
			maxSmeltCount = Math.min(maxSmeltCount, maxSmeltFromCharcoal);
		}
		if (lavaPerOre > 0) {
			const lava = IdlePixelPlus.getVarOrDefault("lava", 0, "int");
			const maxSmeltFromLava = Math.floor(lava / lavaPerOre);
			maxSmeltCount = Math.min(maxSmeltCount, maxSmeltFromLava);
		}
		if (plasmaPerOre > 0) {
			const plasma = IdlePixelPlus.getVarOrDefault("plasma", 0, "int");
			const maxSmeltFromPlasma = Math.floor(plasma / plasmaPerOre);
			maxSmeltCount = Math.min(maxSmeltCount, maxSmeltFromPlasma);
		}
		if (ore == "dragon_ore") {
			maxSmeltCount = Math.min(maxSmeltCount, dragonFire);
		}
		if (ore == "copper") {
			maxSmeltCount = Math.min(capacity, oreCount);
		}
		return maxSmeltCount || 0;
	}

	function initQuickSmelt() {
		let htmlMining = `
        <div id="slapchop-quicksmelt-mining" class="slapchop-quicksmelt">
          <h5>Quick Smelt:</h5>
          <div class="slapchop-quicksmelt-buttons">
        `;
		SMELTABLES.forEach((ore) => {
			htmlMining += `
              <button type="button" onclick="window.quickSmelt('${ore}')">
                <img src="${IMAGE_URL_BASE}/${ore}.png" class="img-20" />
                ${ore
									.replace(/_/g, " ")
									.replace(/(^|\s)\w/g, (s) => s.toUpperCase())}
                (<span data-slap="max-smelt-${ore}">?</span>)
              </button>
            `;
		});
		htmlMining += `
          </div>
          <hr>
        </div>
        `;
		$("#panel-mining hr").first().after(htmlMining);

		let htmlCrafting = `
        <div id="slapchop-quicksmelt-crafting" class="slapchop-quicksmelt">
          <h5>Quick Smelt:</h5>
          <div class="slapchop-quicksmelt-buttons">
        `;
		SMELTABLES.forEach((ore) => {
			htmlCrafting += `
              <button type="button" onclick="window.quickSmelt('${ore}')">
                <img src="${IMAGE_URL_BASE}/${ore}.png" class="img-20" />
                ${ore
									.replace(/_/g, " ")
									.replace(/(^|\s)\w/g, (s) => s.toUpperCase())}
                (<span data-slap="max-smelt-${ore}">?</span>)
              </button>
            `;
		});
		htmlCrafting += `
          </div>
          <hr>
        </div>
        `;
		$("#panel-crafting hr").first().after(htmlCrafting);

		SMELTABLES.forEach((ore) => {
			$(`itembox[data-item="${ore}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickSmeltRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickSmelt(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function quickSmelt(ore) {
		if (smelteryToggle) {
			smelteryToggle = false;
			const current = IdlePixelPlus.getVarOrDefault("furnace_ore_type", "none");
			if (current == "none") {
				const max = window.maxSmeltable(ore);
				if (max > 0) {
					IdlePixelPlus.sendMessage(`SMELT=${ore}~${max}`);
				}
			}
			setTimeout(function () {
				smelteryToggle = true;
			}, 1000);
		}
	}

	function maxCraftable() {
		const oilPerFuel = 5000;
		const charcoalPerFuel = 20;
		const lavaPerFuel = 1;
		const oil = IdlePixelPlus.getVarOrDefault("oil", 0, "int");
		const maxFuelFromOil = Math.floor(oil / oilPerFuel);
		let maxFuelCount = Math.min(maxFuelFromOil);
		if (charcoalPerFuel > 0) {
			const charcoal = IdlePixelPlus.getVarOrDefault("charcoal", 0, "int");
			const maxCraftFromCharcoal = Math.floor(charcoal / charcoalPerFuel);
			maxFuelCount = Math.min(maxFuelCount, maxCraftFromCharcoal);
		}
		if (lavaPerFuel > 0) {
			const lava = IdlePixelPlus.getVarOrDefault("lava", 0, "int");
			const maxCraftFromLava = Math.floor(lava / lavaPerFuel);
			maxFuelCount = Math.min(maxFuelCount, maxCraftFromLava);
		}
		return maxFuelCount || 0;
	}

	function updateMaxCraftable() {
		const max = window.maxCraftable();
		const maxText = "Quick Craft Max (" + max + ")";
		const oilMax = 5000 * max;
		const oilText = "5,000 (" + oilMax.toLocaleString() + ") (oil)";
		const coalMax = 20 * max;
		const coalText = "20 (" + coalMax.toLocaleString() + ") (charcoal)";
		const lavaMax = 1 * max;
		const lavaText = "1 (" + lavaMax.toLocaleString() + ") (lava)";
		const label = document.querySelector(
			"#crafting-table tbody tr[data-crafting-item=rocket_fuel] td item-crafting-table[data-materials-item]"
		).dataset.materialsItem;

		const maxCraftableButton = document.querySelector(
			"#crafting-table .slapchop-rocketfuelmax-button"
		);
		const oilTableCell = document.querySelector(
			"#crafting-table tbody tr[data-crafting-item=rocket_fuel] td item-crafting-table[data-materials-item=oil]"
		);
		const coalTableCell = document.querySelector(
			"#crafting-table tbody tr[data-crafting-item=rocket_fuel] td item-crafting-table[data-materials-item=charcoal]"
		);
		const lavaTableCell = document.querySelector(
			"#crafting-table tbody tr[data-crafting-item=rocket_fuel] td item-crafting-table[data-materials-item=lava"
		);
		const singleCraftButton = document.querySelector(
			"#crafting-table .slapchop-rocketfuelsingle-button"
		);

		if (maxCraftableButton) {
			maxCraftableButton.textContent = maxText;
		}

		if (oilTableCell) {
			oilTableCell.textContent = oilText;
		}

		if (coalTableCell) {
			coalTableCell.textContent = coalText;
		}

		if (lavaTableCell) {
			lavaTableCell.textContent = lavaText;
		}

		if (singleCraftButton) {
			if (max === 0) {
				singleCraftButton.style.display = "none";
			} else {
				singleCraftButton.style.display = "block";
			}
		}
	}

	function updateQuickSmelt() {
		SMELTABLES.forEach((ore) => {
			const max = window.maxSmeltable(ore);
			const elements = document.querySelectorAll(
				`[data-slap="max-smelt-${ore}"]`
			);
			elements.forEach((element) => {
				element.textContent = max;
			});
		});
	}

	function initQuickMining() {
		MINING.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickMiningRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickMining(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function quickMining(item, alt) {
		let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			console.log("Inside the minus: " + singleOverride);
			n--;
		}
		if (n > 0) {
			if (item.includes("_stardust_prism")) {
				IdlePixelPlus.sendMessage(`SMASH_STARDUST_PRISM=${item}~${n}`);
			} else if (item.includes("_geode")) {
				IdlePixelPlus.sendMessage(`CRACK_GEODE=${item}~${n}`);
			} else if (item == "meteor") {
				websocket.send(`MINE_METEOR`);
			}
		}
	}

	function initQuickMineral() {
		MINERAL.forEach((item) => {
			$(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
				if (
					IdlePixelPlus.plugins.slapchop.getConfig(
						"quickMineralRightClickEnabled"
					)
				) {
					const primary = window.isPrimaryActionSlapchop(event);
					const alt = window.isAltActionSlapchop(event);
					if (primary || alt) {
						window.quickMineral(item, !primary);
						event.stopPropagation();
						event.preventDefault();
						return false;
					}
				}
				return true;
			});
		});
	}

	function quickMineral(item, alt) {
		let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
		singleOverride =
			IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
		if (alt || singleOverride) {
			n--;
		}
		if (n > 0) {
			IdlePixelPlus.sendMessage(`MINERAL_XP=${item}~${n}`);
		}
	}

	function initMiningPresets() {
		let html = `
        <div id="miningmachines-presets">
            <h5>Mining Machine Presets:</h5>
            <div id="slapchop-quickpreset">
                <div class="slapchop-quickpreset-buttons">
                    <div>
                        <button onclick="window.noMachines()">None</button>
                    </div>
                    <div>
                        <button onclick="window.miningPresetSave(2)">Save 2</button>
                        <button onclick="window.miningPresetLoad(2)">Load 2</button>
                    </div>
                    <div>
                        <button onclick="window.miningPresetSave(3)">Save 3</button>
                        <button onclick="window.miningPresetLoad(3)">Load 3</button>
                    </div>
                    <div>
                        <button onclick="window.miningPresetSave(4)">Save 4</button>
                        <button onclick="window.miningPresetLoad(4)">Load 4</button>
                    </div>
                    <div>
                        <button onclick="window.allMachines()">All</button>
                    </div>
                </div>
            </div>
            <hr>
        </div>
        `;
		document
			.querySelector("div.fresh-account-buy-pickaxe-text")
			.insertAdjacentHTML("beforebegin", html);
	}

	function miningPresetSave(presetNumber) {
		let presetData = {};
		let presetName = `Preset ${presetNumber}`;
		let username = getVar("username", "", "string");

		miningEquipment.forEach(function (machine) {
			let machineCount = `${machine}_on`;
			let ippMachineOnCount = getVar(machineCount, 0, "int");
			presetData[machine] = ippMachineOnCount;
		});

		let allPresets =
			JSON.parse(localStorage.getItem(`${username}.miningPresets`)) || {};

		allPresets[presetName] = presetData;

		localStorage.setItem(
			`${username}.miningPresets`,
			JSON.stringify(allPresets)
		);
	}

	function miningPresetLoad(presetNumber) {
		miningEquipment.forEach(function (machine) {
			let machineCount = `${machine}_on`;
			let ippMachineOnCount = getVar(machineCount, 0, "int");
			let ippMachineCrafted = IdlePixelPlus.getVarOrDefault(machine, 0, "int");
			let i = ippMachineOnCount;
			while (i > 0) {
				i--;
				websocket.send(`MACHINERY=${machine}~decrease`);
			}
		});

		let username = getVar("username", "", "string");
		let allPresets =
			JSON.parse(localStorage.getItem(`${username}.miningPresets`)) || {};
		let presetName = `Preset ${presetNumber}`;
		let presetData = allPresets[presetName];

		if (!presetData) {
			return;
		}

		miningEquipment.forEach(function (machine) {
			let machineCount = `${machine}_on`;
			let ippMachineOnCount = getVar(machineCount, 0, "int");
			let ippMachinePresetCount = presetData[machine] || 0;

			let i = 0;

			while (i < ippMachinePresetCount) {
				i++;
				websocket.send(`MACHINERY=${machine}~increase`);
			}
		});
	}

	function allMachines() {
		miningEquipment.forEach(function (machine) {
			let machineCount = `${machine}_on`;
			let ippMachineOnCount = getVar(machineCount, 0, "int");
			let ippMachineCrafted = getVar(machine, 0, "int");
			let i = ippMachineOnCount;
			while (i < ippMachineCrafted) {
				i++;
				websocket.send(`MACHINERY=${machine}~increase`);
			}
		});
	}

	function noMachines() {
		miningEquipment.forEach(function (machine) {
			let machineCount = `${machine}_on`;
			let ippMachineOnCount = getVar(machineCount, 0, "int");
			let ippMachineCrafted = IdlePixelPlus.getVarOrDefault(machine, 0, "int");
			let i = ippMachineOnCount;
			while (i > 0) {
				i--;
				websocket.send(`MACHINERY=${machine}~decrease`);
			}
		});
	}

	function quickCraft() {
		const max = window.maxCraftable();
		if (max > 0) {
			IdlePixelPlus.sendMessage(`CRAFT=rocket_fuel~${max}`);
		}
	}

	function quickCraftSingle() {
		IdlePixelPlus.sendMessage(`CRAFT=rocket_fuel~1`);
	}

	function initQuickRocketFuel() {
		$("#crafting-table tbody tr[data-crafting-item=rocket_fuel]").each(
			function () {
				const el = $(this);
				const craft = el.attr("data-crafting-item");
				if (!craft) {
					return;
				}
				el.find("td:nth-child(4)").append(`
            <div class="slapchop-rocketfuelsingle-button"
            onclick="event.stopPropagation(); window.quickCraftSingle()"">Quick Craft 1</div>
            <div class="slapchop-rocketfuelmax-button"
            onclick="event.stopPropagation(); window.quickCraft()"">Quick Craft Max</div>
            `);
			}
		);
	}


	window.initQuickMineral = initQuickMineral;
	window.initQuickMining = initQuickMining;
	window.initQuickSmelt = initQuickSmelt;
    window.initQuickRocketFuel = initQuickRocketFuel;
    window.initMiningPresets = initMiningPresets;
	window.maxSmeltable = maxSmeltable;
	window.quickSmelt = quickSmelt;
	window.maxCraftable = maxCraftable;
	window.updateMaxCraftable = updateMaxCraftable;
	window.updateQuickSmelt = updateQuickSmelt;
	window.quickMining = quickMining;
	window.quickMineral = quickMineral;
	window.quickCraft = quickCraft;
	window.quickCraftSingle = quickCraftSingle;
	window.allMachines = allMachines;
	window.noMachines = noMachines;
	window.miningPresetSave = miningPresetSave;
	window.miningPresetLoad = miningPresetLoad;
	window.SMELTABLES = SMELTABLES;
	window.MINING = MINING;
	window.MINERAL = MINERAL;
})();
