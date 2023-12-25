// ==UserScript==
// @name         IdlePixel UIT - Rocket Info
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel UI Tweaks for only showing Rocket Information.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	//// In the onVariableSet
	function rocketOnVarSet() {
		if (
			["rocket_km", "rocket_status"].includes(key) ||
			key.includes("rocket_potion_timer") ||
			key.includes("rocket_fuel") ||
			key.includes("rocket_potion")
		) {
			const status = IdlePixelPlus.getVarOrDefault(
				"rocket_status",
				"none",
				"string"
			);
			const km = IdlePixelPlus.getVarOrDefault("rocket_km", 0, "int");
			var rocket_quest = IdlePixelPlus.getVarOrDefault(
				"junk_planet_quest",
				0,
				"int"
			);
			var rQComp;
			if (rocket_quest == -1) {
				rQComp = 2;
			} else {
				rQComp = 1;
			}
			const total = IdlePixelPlus.getVarOrDefault(
				"rocket_distance_required",
				0,
				"int"
			);
			const rocket_pot = IdlePixelPlus.getVarOrDefault(
				"rocket_potion_timer",
				0,
				"int"
			);
			const rocket_type = IdlePixelPlus.getVarOrDefault(
				"mega_rocket",
				0,
				"int"
			);
			const rocket_fuel = IdlePixelPlus.getVarOrDefault(
				"rocket_fuel",
				0,
				"int"
			);
			const rocket_pot_count = IdlePixelPlus.getVarOrDefault(
				"rocket_potion",
				0,
				"int"
			);
			const rocket_pot_timer = format_time(rocket_pot);
			const rocket_speed_moon = rocket_pot * 12 * rQComp;
			const rocket_speed_sun = rocket_pot * 2400 * rQComp;
			let pot_diff = "";
			let pot_diff_mega = "";
			let label = "";
			let label_side = "";
			let label_side_car_dist = "";
			let label_side_car_eta = "";
			if (status == "to_moon" || status == "from_moon") {
				const remaining =
					status == "to_moon" ? (total - km) / rQComp : km / rQComp;
				pot_diff = Math.round(remaining / 1.5) - rocket_pot * 8;
				let eta = "";
				if (rocket_pot > 0) {
					if (rocket_speed_moon <= remaining * rQComp) {
						eta = rocket_pot + pot_diff;
					} else {
						eta = Math.round(remaining / 12);
					}
				} else {
					eta = Math.round(remaining / 1.5);
				}
				label = format_time(eta);
				label_side = format_time(eta);
				if (
					this.getConfig("rocketETATimer") &&
					!this.getConfig("hideRocketKM")
				) {
					label = " - " + label;
					label_side_car_dist =
						km.toLocaleString() + "/" + total.toLocaleString();
					label_side_car_eta = label_side;
				}
			} else if (status == "to_sun" || status == "from_sun") {
				const remaining =
					status == "to_sun" ? (total - km) / rQComp : km / rQComp;
				pot_diff_mega = Math.round(remaining / 300) - rocket_pot * 8;
				let eta = "";
				if (rocket_pot > 0) {
					if (rocket_speed_sun <= remaining * rQComp) {
						eta = rocket_pot + pot_diff_mega;
					} else {
						eta = Math.round(remaining / 2400);
					}
				} else {
					eta = Math.round(remaining / 300);
				}
				label = format_time(eta);
				label_side = format_time(eta);
				if (
					this.getConfig("rocketETATimer") &&
					!this.getConfig("hideRocketKM")
				) {
					label = " - " + label;
					if (km == total) {
						label_side_car_dist = "LANDED";
					} else if (total == 0) {
						label_side_car_dist = "ROCKET IS CURRENTLY IDLE";
					} else {
						label_side_car_dist =
							km.toLocaleString() + "/" + total.toLocaleString();
						label_side_car_eta = label_side;
					}
				}
			}

			//rocket-type
			if (rocket_type == "1") {
				document.querySelector("#notification-mega_rocket-timer").textContent =
					label;
			} else {
				document.querySelector("#notification-rocket-timer").textContent =
					label;
			}

			document.querySelector("#current-rocket-travel-distances").textContent =
				label_side_car_dist;
			document.querySelector("#current-rocket-travel-times").textContent =
				label_side_car_eta;
			document.querySelector("#rocket-fuel-count").textContent = rocket_fuel;
			document.querySelector("#rocket-pot-count").textContent =
				rocket_pot_count;
			document.querySelector("#rocket-pot-timer").textContent =
				rocket_pot_timer;
		}
    }
		////////////////////////////////////// Rocket Info End

		////////////////////////////////////// Rocket Status Start

        function rocketStatusStart() {
		const megaRocketType = IdlePixelPlus.getVarOrDefault(
			"mega_rocket",
			0,
			"int"
		);
		const rocketStatus = IdlePixelPlus.getVarOrDefault("rocket_status", "");
		const rocketImage = document.querySelector("img#notification-rocket-image");
		const moonRocketImage = document.querySelector("img#moon-rocket-img");
		const sunRocketImage = document.querySelector("img#sun-rocket-img");
		const menuBarRocketMoon = document.querySelector("#menu-bar-rocket_moon");
		const menuBarRocketSun = document.querySelector("#menu-bar-rocket_sun");
		const rocketTypeImgReg = document.querySelector("img#rocket-type-img-reg");
		const rocketTypeImgMega = document.querySelector(
			"img#rocket-type-img-mega"
		);
		const rocketCurrentTravelLocationMoon = document.querySelector(
			"img#rocket-current-travel-location-moon"
		);
		const rocketCurrentTravelLocationSun = document.querySelector(
			"img#rocket-current-travel-location-sun"
		);
		const rocketTravelDistances = document.querySelector(
			"#current-rocket-travel-distances"
		);

		if (megaRocketType !== 1) {
			if (rocketStatus === "from_moon") {
				setTransform(rocketImage, "rotate(180deg)");
				setTransform(moonRocketImage, "rotate(180deg)");
				showElement(moonRocketImage);
				hideElement(document.querySelector("#moon-mega-rocket-img"));
				hideElement(sunRocketImage);
				hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
				hideElement(menuBarRocketSun.querySelector(".sun-landed"));
				setTransform(rocketTypeImgReg, "rotate(180deg)");
				showInlineBlockElement(rocketTypeImgReg);
				hideElement(rocketTypeImgMega);
				showElement(rocketCurrentTravelLocationMoon);
				hideElement(rocketCurrentTravelLocationSun);
			} else if (rocketStatus.includes("at_moon")) {
				hideElement(document.querySelector("#moon-mega-rocket-img"));
				hideElement(sunRocketImage);
				hideElement(moonRocketImage);
				showElement(menuBarRocketMoon.querySelector(".moon-landed"));
				hideElement(menuBarRocketSun.querySelector(".sun-landed"));
				showInlineBlockElement(rocketTypeImgReg);
				showElement(rocketCurrentTravelLocationMoon);
				hideElement(rocketCurrentTravelLocationSun);
			} else if (rocketStatus.includes("to_moon")) {
				clearTransform(rocketImage);
				clearTransform(moonRocketImage);
				hideElement(document.querySelector("#moon-mega-rocket-img"));
				hideElement(sunRocketImage);
				showElement(moonRocketImage);
				hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
				hideElement(menuBarRocketSun.querySelector(".sun-landed"));
				clearTransform(rocketTypeImgReg);
				showInlineBlockElement(rocketTypeImgReg);
				hideElement(rocketTypeImgMega);
				showElement(rocketCurrentTravelLocationMoon);
				hideElement(rocketCurrentTravelLocationSun);
			} else {
				hideElement(document.querySelector("#moon-mega-rocket-img"));
				hideElement(sunRocketImage);
				hideElement(moonRocketImage);
				hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
				hideElement(menuBarRocketSun.querySelector(".sun-landed"));
				hideElement(rocketTypeImgReg);
				hideElement(rocketTypeImgMega);
				hideElement(rocketCurrentTravelLocationMoon);
				hideElement(rocketCurrentTravelLocationSun);
				rocketTravelDistances.textContent = "ROCKET IS CURRENTLY IDLE";
			}
		} else {
			if (rocketStatus === "from_sun" || rocketStatus === "from_moon") {
				setTransform(
					document.querySelector("#notification-mega_rocket-image"),
					"rotate(180deg)"
				);
				if (rocketStatus === "from_sun") {
					setTransform(sunRocketImage, "rotate(180deg)");
					showElement(sunRocketImage);
					hideElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(moonRocketImage);
					hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
					hideElement(menuBarRocketSun.querySelector(".sun-landed"));
					setTransform(rocketTypeImgMega, "rotate(180deg)");
					hideElement(rocketTypeImgReg);
					showInlineBlockElement(rocketTypeImgMega);
					hideElement(rocketCurrentTravelLocationMoon);
					showElement(rocketCurrentTravelLocationSun);
				} else {
					setTransform(
						document.querySelector("#moon-mega-rocket-img"),
						"rotate(180deg)"
					);
					showElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(sunRocketImage);
					hideElement(moonRocketImage);
					hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
					hideElement(menuBarRocketSun.querySelector(".sun-landed"));
					setTransform(rocketTypeImgMega, "rotate(180deg)");
					hideElement(rocketTypeImgReg);
					showInlineBlockElement(rocketTypeImgMega);
					showElement(rocketCurrentTravelLocationMoon);
					hideElement(rocketCurrentTravelLocationSun);
				}
			} else {
				clearTransform(
					document.querySelector("#notification-mega_rocket-image")
				);
				clearTransform(rocketTypeImgMega);
				if (rocketStatus === "to_sun") {
					clearTransform(sunRocketImage);
					showElement(sunRocketImage);
					hideElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(moonRocketImage);
					hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
					hideElement(menuBarRocketSun.querySelector(".sun-landed"));
					hideElement(rocketTypeImgReg);
					showInlineBlockElement(rocketTypeImgMega);
					hideElement(rocketCurrentTravelLocationMoon);
					showElement(rocketCurrentTravelLocationSun);
				} else if (rocketStatus === "to_moon") {
					clearTransform(document.querySelector("#moon-mega-rocket-img"));
					showElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(sunRocketImage);
					hideElement(moonRocketImage);
					hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
					hideElement(menuBarRocketSun.querySelector(".sun-landed"));
					hideElement(rocketTypeImgReg);
					showInlineBlockElement(rocketTypeImgMega);
					showElement(rocketCurrentTravelLocationMoon);
					hideElement(rocketCurrentTravelLocationSun);
				} else if (rocketStatus === "none") {
					hideElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(sunRocketImage);
					hideElement(moonRocketImage);
					hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
					hideElement(menuBarRocketSun.querySelector(".sun-landed"));
					hideElement(rocketTypeImgReg);
					hideElement(rocketTypeImgMega);
					hideElement(rocketCurrentTravelLocationMoon);
					hideElement(rocketCurrentTravelLocationSun);
					rocketTravelDistances.textContent = "ROCKET IS CURRENTLY IDLE";
				} else if (valueAfter.includes("at_moon")) {
					hideElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(sunRocketImage);
					hideElement(moonRocketImage);
					showElement(menuBarRocketMoon.querySelector(".moon-landed"));
					hideElement(menuBarRocketSun.querySelector(".sun-landed"));
					hideElement(rocketTypeImgReg);
					showInlineBlockElement(rocketTypeImgMega);
					showElement(rocketCurrentTravelLocationMoon);
					hideElement(rocketCurrentTravelLocationSun);
				} else {
					hideElement(document.querySelector("#moon-mega-rocket-img"));
					hideElement(sunRocketImage);
					hideElement(moonRocketImage);
					hideElement(menuBarRocketMoon.querySelector(".moon-landed"));
					showElement(menuBarRocketSun.querySelector(".sun-landed"));
					hideElement(rocketTypeImgReg);
					showInlineBlockElement(rocketTypeImgMega);
					hideElement(rocketCurrentTravelLocationMoon);
					showElement(rocketCurrentTravelLocationSun);
				}
			}
		}
		//}

		const rocket_usable = IdlePixelPlus.getVarOrDefault(
			"rocket_usable",
			0,
			"int"
		);
		const rocket_travel_check = IdlePixelPlus.getVarOrDefault(
			"rocket_distance_required",
			0,
			"int"
		);
		const rocket_pot_timer_check = IdlePixelPlus.getVarOrDefault(
			"rocket_potion_timer",
			0,
			"int"
		);
		const rocket_check = IdlePixelPlus.getVarOrDefault("mega_rocket", 0, "int");
		if (this.getConfig("leftSideRocketInfoSection") && rocket_usable > 0) {
			showBlockElement(document.getElementById("current-rocket-info"));

			if (this.getConfig("leftSideRocketInfo")) {
				showBlockElement(document.getElementById("rocket-travel-info"));
				hideElement(document.getElementById("notification-mega_rocket"));
				hideElement(document.getElementById("notification-rocket"));
			} else if (rocket_travel_check > 0 && rocket_check == 1) {
				showBlockElement(document.getElementById("notification-mega_rocket"));
				hideElement(document.getElementById("rocket-travel-info"));
			} else if (rocket_travel_check > 0 && rocket_check == 0) {
				showInlineBlockElement(document.getElementById("notification-rocket"));
				hideElement(document.getElementById("rocket-travel-info"));
			} else {
				hideElement(document.getElementById("rocket-travel-info"));
			}

			if (this.getConfig("leftSideRocketFuel")) {
				showBlockElement(document.getElementById("current-rocket-fuel-info"));
			} else {
				hideElement(document.getElementById("current-rocket-fuel-info"));
			}

			if (this.getConfig("leftSideRocketPot")) {
				showBlockElement(document.getElementById("current-rocket-pot-info"));
				hideElement(
					document.getElementById("notification-potion-rocket_potion_timer")
				);
			} else if (rocket_pot_timer_check > 0) {
				showInlineBlockElement(
					document.getElementById("notification-potion-rocket_potion_timer")
				);
				hideElement(document.getElementById("current-rocket-pot-info"));
			} else {
				hideElement(document.getElementById("current-rocket-pot-info"));
			}
		} else {
			hideElement(document.getElementById("current-rocket-info"));
		}

		if (rocket_travel_check == 0) {
			document.getElementById("current-rocket-travel-distances").textContent =
				"Rocket is IDLE";
			setTransform(
				document.querySelector("img#rocket-type-img-mega"),
				"rotate(315deg)"
			);
			showBlockElement(document.querySelector("img#rocket-type-img-mega"));
		}

		if (key == "combat_loot_potion_active") {
			const loot_pot = IdlePixelPlus.getVarOrDefault(
				"combat_loot_potion_active",
				0,
				"int"
			);
			if (loot_pot == 0) {
				hideElement(document.getElementById("notification-loot_pot_avail"));
			} else {
				showInlineBlockElement(
					document.getElementById("notification-loot_pot_avail")
				);
			}
		}

		if (key == "moon_distance" || key == "sun_distance") {
			this.rocketInfoUpdate(key);
		}
	}
	//// End onVariableSet

	//// Start onLogin
	function rocketOnLogin() {
		// "Moon & Sun Distance Info
		const rocketInfoSideCar = document.createElement("div");
		rocketInfoSideCar.id = "rocket-info-side_car";
		rocketInfoSideCar.style.paddingLeft = "20px";
		rocketInfoSideCar.style.paddingTop = "10px";
		rocketInfoSideCar.style.paddingBottom = "10px";
		rocketInfoSideCar.innerHTML = `
  <span id="rocket-info-label">MOON & SUN DISTANCE</span>
  <br/>
  <style type="text/css">
    .span2 {
      display: inline-block;
      text-align: right;
      width: 100px;
    }
  </style>
  <span onClick="websocket.send(Modals.clicks_rocket())" id="menu-bar-rocket_moon">
    <img id="moon-img" class="img-20" src="https://idle-pixel.wiki/images/4/47/Moon.png">
    <span class="span2 rocket-dist_moon">0</span>
    <span style='margin-left:0.75em;' class="rocket-dist_moon-symbol">🔴</span>
    <img id="moon-rocket-img" class="img-20" src="${IMAGE_URL_BASE}/rocket.png">
    <img id="moon-mega-rocket-img" class="img-20" src="${IMAGE_URL_BASE}/mega_rocket.gif">
    <span class="moon-landed">LANDED</span>
    <br/>
  </span>
  <span onClick="websocket.send(Modals.clicks_rocket())" id="menu-bar-rocket_sun">
    <img id "sun-img" class="img-20" src="https://idle-pixel.wiki/images/6/61/Sun.png">
    <span class="span2 rocket-dist_sun">0</span>
    <span style='margin-left:0.75em;' class="rocket-dist_sun-symbol">🔴</span>
    <img id="sun-rocket-img" class="img-20" src="${IMAGE_URL_BASE}/mega_rocket.gif">
    <span class="sun-landed">LANDED</span>
    <br/>
  </span>
</div>
`;

		document
			.getElementById("game-menu-bar-skills")
			.insertAdjacentElement("beforebegin", rocketInfoSideCar);

		// "Current Rocket Info" side car
		const rocketInfoSideCarElement = document.getElementById(
			"rocket-info-side_car"
		);

		// Append HTML after #rocket-info-side_car
		const currentRocketInfo = document.createElement("div");
		currentRocketInfo.id = "current-rocket-info";
		currentRocketInfo.style.borderTop = "1px solid rgba(66, 66, 66, 1)";
		currentRocketInfo.style.borderBottom = "1px solid rgba(66, 66, 66, 1)";
		currentRocketInfo.style.paddingTop = "10px";
		currentRocketInfo.style.paddingBottom = "10px";
		currentRocketInfo.innerHTML = `
            <div style="padding-left: 20px;">
  <span id="current-rocket-info-label" style:>CURRENT ROCKET INFO</span>
  <br/>
  <div id="rocket-travel-info">
    <img id="rocket-current-travel-location-moon" class="img-20" src="https://idle-pixel.wiki/images/4/47/Moon.png">
    <img id="rocket-current-travel-location-sun" class="img-20" src="https://idle-pixel.wiki/images/6/61/Sun.png">
    <span id="current-rocket-travel-distances" style="padding-left: 20px;">Loading...</span>
    <br/>
    <img id="rocket-type-img-mega" class="img-20" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/mega_rocket.gif">
    <img id="rocket-type-img-reg" class="img-20" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/rocket.gif">
    <span id="current-rocket-travel-times" style="padding-left: 20px;">00:00:00</span>
    <br/>
  </div>
  <div onClick="switch_panels('panel-crafting')" id="current-rocket-fuel-info">
    <img id="rocket-rocket_fuel-img" class="img-20" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/rocket_fuel.png">
    <span style="padding-left: 20px;">Rocket Fuel - </span>
    <span id="rocket-fuel-count">0</span>
    <br/>
  </div>
  <div onClick="switch_panels('panel-brewing')" id="current-rocket-pot-info">
    <img id="rocket-rocket_potion-img" class="img-20" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/rocket_potion.png">
    <span style="padding-left: 20px;">Rocket Potion </span>
    (<span id="rocket-pot-count">0</span>)
    <span> - </span>
    <span id=rocket-pot-timer>0:00:00</span>
  </div>
</div>
</div>
`;
		rocketInfoSideCarElement.parentNode.insertBefore(
			currentRocketInfo,
			rocketInfoSideCarElement.nextSibling
		);

		const elementsToHide = [
			"moon-mega-rocket-img",
			"sun-rocket-img",
			"moon-rocket-img",
			"menu-bar-rocket_moon .moon-landed",
			"menu-bar-rocket_sun .sun-landed",
		];

		elementsToHide.forEach((elementId) => {
			const element = document.getElementById(elementId);
			if (element) {
				element.style.display = "none";
			}
		});

		const currentRocketInfoElement = document.getElementById(
			"current-rocket-info"
		);
		if (currentRocketInfoElement) {
			currentRocketInfoElement.style.display = "none";
		}

		document
			.querySelector("#notification-rocket-label")
			.insertAdjacentHTML(
				"afterend",
				'<span id="notification-rocket-timer" class="font-small color-white"></span>'
			);
		document
			.querySelector("#notification-mega_rocket-label")
			.insertAdjacentHTML(
				"afterend",
				'<span id="notification-mega_rocket-timer" class="font-small color-white"></span>'
			);
	}
	//// end onLogin

	//// onConfigsChanged Start

	function onConfigsChanged(rocketEtaTimer, hideRocketKM) {
		if (rocketETATimer) {
			document.getElementById("notification-rocket-timer").style.display =
				"inline-block";
			document.getElementById("notification-mega_rocket-timer").style.display =
				"inline-block";
		} else {
			document.getElementById("notification-rocket-timer").style.display =
				"none";
			document.getElementById("notification-mega_rocket-timer").style.display =
				"none";
		}

		if (hideRocketKM) {
			document.getElementById("notification-rocket-label").style.display =
				"none";
			document.getElementById("notification-mega_rocket-label").style.display =
				"none";
		} else {
			document.getElementById("notification-rocket-label").style.display =
				"inline-block";
			document.getElementById("notification-mega_rocket-label").style.display =
				"inline-block";
		}

		const rocket_usable = IdlePixelPlus.getVarOrDefault(
			"rocket_usable",
			0,
			"int"
		);
		const rocket_travel_check = IdlePixelPlus.getVarOrDefault(
			"rocket_distance_required",
			0,
			"int"
		);
		const rocket_pot_timer_check = IdlePixelPlus.getVarOrDefault(
			"rocket_potion_timer",
			0,
			"int"
		);
		const rocket_check = IdlePixelPlus.getVarOrDefault("mega_rocket", 0, "int");

		if (this.getConfig("leftSideRocketInfoSection") && rocket_usable > 0) {
			document.getElementById("current-rocket-info").style.display = "block";

			if (this.getConfig("leftSideRocketInfo")) {
				document.getElementById("rocket-travel-info").style.display = "block";
				document.getElementById("notification-mega_rocket").style.display =
					"none";
				document.getElementById("notification-rocket").style.display = "none";
			} else if (rocket_travel_check > 0 && rocket_check == 1) {
				document.getElementById("notification-mega_rocket").style.display =
					"block";
				document.getElementById("rocket-travel-info").style.display = "none";
			} else if (rocket_travel_check > 0 && rocket_check == 0) {
				document.getElementById("notification-rocket").style.display = "block";
				document.getElementById("rocket-travel-info").style.display = "none";
			} else {
				document.getElementById("rocket-travel-info").style.display = "none";
			}

			if (this.getConfig("leftSideRocketFuel")) {
				document.getElementById("current-rocket-fuel-info").style.display =
					"block";
			} else {
				document.getElementById("current-rocket-fuel-info").style.display =
					"none";
			}

			if (this.getConfig("leftSideRocketPot")) {
				document.getElementById("current-rocket-pot-info").style.display =
					"block";
				document.getElementById(
					"notification-potion-rocket_potion_timer"
				).style.display = "none";
			} else if (rocket_pot_timer_check > 0) {
				document.getElementById(
					"notification-potion-rocket_potion_timer"
				).style.display = "block";
				document.getElementById("current-rocket-pot-info").style.display =
					"none";
			} else {
				document.getElementById("current-rocket-pot-info").style.display =
					"none";
			}
		} else {
			document.getElementById("current-rocket-info").style.display = "none";
		}

		if (rocket_travel_check === 0) {
			document.getElementById("current-rocket-travel-distances").textContent =
				"Rocket is IDLE";
			document.querySelector("img#rocket-type-img-mega").style.transform =
				"rotate(315deg)";
			document.querySelector("img#rocket-type-img-mega").style.display =
				"inline-block";
		}
	}

	//// onConfigsChanged End
	window.calcFishEnergy = calcFishEnergy;
	window.initFishEnergy = initFishEnergy;
	window.toggleFishingTab = toggleFishingTab;
	window.heatBoxFishingPanel = heatBoxFishingPanel;
})();
