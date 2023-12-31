// ==UserScript==
// @name         IdlePixel SlapChop - Mining Equipment
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for Mining Machine Presets.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

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

	window.initMiningPresets = initMiningPresets;
	window.allMachines = allMachines;
	window.noMachines = noMachines;
	window.miningPresetSave = miningPresetSave;
	window.miningPresetLoad = miningPresetLoad;
})();
