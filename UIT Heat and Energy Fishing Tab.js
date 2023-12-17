// ==UserScript==
// @name         IdlePixel UIT - Heat and Energy - Fishing
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel UI Tweaks for only showing the Heat and Energy in the fishing tab.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// ==/UserScript==

(function () {
  "use strict";

  const FISH_ENERGY_MAP = {
    // Normal Raw Fish
    shrimp: 25,
    anchovy: 100,
    sardine: 200,
    crab: 500,
    piranha: 1000,
    salmon: 100,
    trout: 300,
    pike: 1000,
    eel: 3000,
    rainbow_fish: 30000,
    tuna: 500,
    swordfish: 3000,
    manta_ray: 9000,
    shark: 20000,
    whale: 40000,

    // Shiny Raw Fish
    shrimp_shiny: 125,
    anchovy_shiny: 500,
    sardine_shiny: 1000,
    crab_shiny: 2500,
    piranha_shiny: 5000,
    salmon_shiny: 500,
    trout_shiny: 1500,
    pike_shiny: 5000,
    eel_shiny: 15000,
    rainbow_fish_shiny: 150000,
    tuna_shiny: 2500,
    swordfish_shiny: 15000,
    manta_ray_shiny: 45000,
    shark_shiny: 100000,
    whale_shiny: 200000,

    // Mega Shiny Raw Fish
    shrimp_mega_shiny: 625,
    anchovy_mega_shiny: 2500,
    sardine_mega_shiny: 5000,
    crab_mega_shiny: 12500,
    piranha_mega_shiny: 25000,
    salmon_mega_shiny: 2500,
    trout_mega_shiny: 7500,
    pike_mega_shiny: 25000,
    eel_mega_shiny: 75000,
    rainbow_fish_mega_shiny: 750000,
    tuna_mega_shiny: 12500,
    swordfish_mega_shiny: 75000,
    manta_ray_mega_shiny: 225000,
    shark_mega_shiny: 500000,
    whale_mega_shiny: 1000000,

    // Misc Fish
    small_stardust_fish: 1000,
    medium_stardust_fish: 2500,
    large_stardust_fish: 5000,
    angler_fish: 100000,
  };

  const FISH_HEAT_MAP = {
    // Normal Raw Fish
    shrimp: 10,
    anchovy: 20,
    sardine: 40,
    crab: 75,
    piranha: 120,
    salmon: 20,
    trout: 40,
    pike: 110,
    eel: 280,
    rainbow_fish: 840,
    tuna: 75,
    swordfish: 220,
    manta_ray: 1200,
    shark: 3000,
    whale: 5000,

    //Shiny Raw Fish
    shrimp_shiny: 10,
    anchovy_shiny: 20,
    sardine_shiny: 40,
    crab_shiny: 75,
    piranha_shiny: 120,
    salmon_shiny: 20,
    trout_shiny: 40,
    pike_shiny: 110,
    eel_shiny: 280,
    rainbow_fish_shiny: 840,
    tuna_shiny: 75,
    swordfish_shiny: 220,
    manta_ray_shiny: 1200,
    shark_shiny: 3000,
    whale_shiny: 5000,

    //Mega Shiny Raw Fish
    shrimp_mega_shiny: 10,
    anchovy_mega_shiny: 20,
    sardine_mega_shiny: 40,
    crab_mega_shiny: 75,
    piranha_mega_shiny: 120,
    salmon_mega_shiny: 20,
    trout_mega_shiny: 40,
    pike_mega_shiny: 110,
    eel_mega_shiny: 280,
    rainbow_fish_mega_shiny: 840,
    tuna_mega_shiny: 75,
    swordfish_mega_shiny: 220,
    manta_ray_mega_shiny: 1200,
    shark_mega_shiny: 3000,
    whale_mega_shiny: 5000,

    // Misc Fish
    small_stardust_fish: 300,
    medium_stardust_fish: 600,
    large_stardust_fish: 2000,
    angler_fish: 10000,
  };

  function calcFishEnergy() {
    const fishRawEnergy = Object.keys(FISH_ENERGY_MAP);
    const fishHeat = Object.keys(FISH_HEAT_MAP);
    const fishCookedEnergy = Object.keys(FISH_ENERGY_MAP);
    let totalRawEnergy = 0;
    let totalHeat = 0;
    let totalCookedEnergy = 0;
    let oilGainTimer;
    const collectorModeFish = this.getConfig("minusOneHeatInFishingTab");

    fishRawEnergy.forEach((fish) => {
      let currentRawFish = Items.getItem("raw_" + fish);
      let currentCookedFish = Items.getItem("cooked_" + fish);

      if (currentRawFish > 0 && collectorModeFish) {
        currentRawFish--;
      }
      if (currentCookedFish > 0 && collectorModeFish) {
        currentCookedFish--;
      }
      const currentRawEnergy = currentRawFish * FISH_ENERGY_MAP[fish];
      const currentHeat = currentRawFish * FISH_HEAT_MAP[fish];
      const currentCookedEnergy = currentCookedFish * FISH_ENERGY_MAP[fish];
      totalRawEnergy += currentRawEnergy;
      totalHeat += currentHeat;
      totalCookedEnergy += currentCookedEnergy;
    });

    document.getElementById("raw-fish-energy-number").textContent =
      totalRawEnergy.toLocaleString();
    document.getElementById("fish-heat-required-number").textContent =
      totalHeat.toLocaleString();
    document.getElementById("cooked-fish-energy-number").textContent =
      totalCookedEnergy.toLocaleString();
  }

  function initFishEnergy() {
    const panelFishing = document.querySelector("#panel-fishing");
    const progressBar = panelFishing.querySelector(".progress-bar");

    const hrElement = document.createElement("hr");
    progressBar.insertAdjacentElement("afterend", hrElement);

    const containerDiv = document.createElement("div");
    containerDiv.style.display = "flex";
    containerDiv.style.flexDirection = "column";

    const h5Element = document.createElement("h5");
    h5Element.textContent = "Fish Energy";

    const buttonElement = document.createElement("button");
    buttonElement.textContent = "Show";
    buttonElement.id = "fish_energy-visibility-button";
    buttonElement.addEventListener("click", show_hide);
    h5Element.appendChild(buttonElement);

    const innerDiv = document.createElement("div");
    innerDiv.id = "fishing-calculator-div";

    const rawFishEnergySpan = document.createElement("span");
    rawFishEnergySpan.textContent = "Total Raw Fish Energy: ";

    const rawFishEnergyNumberSpan = document.createElement("span");
    rawFishEnergyNumberSpan.textContent = "0";
    rawFishEnergyNumberSpan.id = "raw-fish-energy-number";
    rawFishEnergySpan.appendChild(rawFishEnergyNumberSpan);

    const br1Element = document.createElement("br");

    const heatToCookAllSpan = document.createElement("span");
    heatToCookAllSpan.textContent = "Heat To Cook All: ";

    const fishHeatRequiredNumberSpan = document.createElement("span");
    fishHeatRequiredNumberSpan.textContent = "0";
    fishHeatRequiredNumberSpan.id = "fish-heat-required-number";
    heatToCookAllSpan.appendChild(fishHeatRequiredNumberSpan);

    const br2Element = document.createElement("br");

    const totalCookedFishEnergySpan = document.createElement("span");
    totalCookedFishEnergySpan.textContent = "Total Cooked Fish Energy: ";

    const cookedFishEnergyNumberSpan = document.createElement("span");
    cookedFishEnergyNumberSpan.textContent = "0";
    cookedFishEnergyNumberSpan.id = "cooked-fish-energy-number";
    totalCookedFishEnergySpan.appendChild(cookedFishEnergyNumberSpan);

    innerDiv.appendChild(rawFishEnergySpan);
    innerDiv.appendChild(br1Element);
    innerDiv.appendChild(heatToCookAllSpan);
    innerDiv.appendChild(br2Element);
    innerDiv.appendChild(totalCookedFishEnergySpan);

    containerDiv.appendChild(h5Element);
    containerDiv.appendChild(innerDiv);

    hrElement.insertAdjacentElement("afterend", containerDiv);

    function show_hide() {
      const button = document.querySelector("#fish_energy-visibility-button");
      const div = document.querySelector("#fishing-calculator-div");

      if (button.textContent === "Hide") {
        div.style.display = "none";
        button.textContent = "Show";
      } else {
        div.style.display = "block";
        button.textContent = "Hide";
      }
    }
    calcFishEnergy();
    document.querySelector("#fishing-calculator-div").style.display = "none";
  }

  function toggleFishingTab(toggle) {
    const heatInFishingTab = toggle;
    const heatFishingTab = document.getElementById("heat-fishing-tab");
    if (heatInFishingTab) {
      heatFishingTab.style.display = "block";
      heatFishingTab.setAttribute("data-item", "heat");
    } else {
      heatFishingTab.style.display = "none";
      heatFishingTab.removeAttribute("data-item");
    }
  }

  function heatBoxFishingPanel() {
    console.log("heatBox is firing")
    const fishingNetItembox = document.querySelector(
      'itembox[data-item="fishing_net"]'
    );
    if (fishingNetItembox) {
      const heatFishingTab = document.createElement("itembox");
      heatFishingTab.id = "heat-fishing-tab";
      heatFishingTab.dataset.item = "heat";
      heatFishingTab.classList.add("shadow", "hover");
      heatFishingTab.setAttribute("data-bs-toggle", "tooltip");

      heatFishingTab.innerHTML = `
    <div class="center mt-1">
        <img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/heat.png" width="50px" height="50px">
    </div>
    <div class="center mt-2">
        <item-display data-format="number" data-key="heat"></item-display>
    </div>
`;

      fishingNetItembox.before(heatFishingTab);
    }
  }
});
