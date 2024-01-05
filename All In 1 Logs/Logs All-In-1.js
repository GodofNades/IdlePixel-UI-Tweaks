// ==UserScript==
// @name         IdlePixel Logs All-In-1
// @namespace    godofnades.idlepixel
// @version      0.1.3
// @description  Combines the installing of 'IdlePixel Activity Log Tweaks', 'IdlePixel Combat Damage Tracker' and IdlePixel Loot Log Tweaks' into a single script.
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @license
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @require      https://update.greasyfork.org/scripts/477085/IdlePixel%20Combat%20Damage%20Tracker.user.js?anticache=20220905
// @require      https://update.greasyfork.org/scripts/481582/IdlePixel%20Activity%20Log%20Tweaks.user.js?anticache=20220905
// @require      https://update.greasyfork.org/scripts/482718/IdlePixel%20Loot%20Log%20Tweaks.user.js?anticache=20220905
// ==/UserScript==

(function () {
	"use strict";

	class LogsAllIn1 extends IdlePixelPlusPlugin {
		constructor() {
			super("logsallin1", {
				about: {
					name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
					version: GM_info.script.version,
					author: GM_info.script.author,
					description: GM_info.script.description,
				},
			});
		}

		/*         <div class="dropdown float-end">
        <span class="dropdown-toggle float-end dropdown-button hover" data-bs-toggle="dropdown" aria-expanded="false">
            Options
        </span>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li><a class="dropdown-item" target="_blank"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/update.png" class="img-20" title="update"> Update Log</a></li>
            <li><a class="dropdown-item" target="_blank" href="https://idle-pixel.com/hiscores/"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/skills.png" class="img-20" title="skills"> Highscores</a></li>
            <li><a class="dropdown-item" target="_blank" href="http://data.idle-pixel.com/market/"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/player_market.png" class="img-20" title="player_market"> Market Graph</a></li>
            <li><a class="dropdown-item" target="_blank" href="https://idle-pixel.com/rules/"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/warning.png" class="img-20" title="warning"> Rules</a></li>
            <li><a class="dropdown-item" target="_blank" href="https://idle-pixel.wiki"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/scroll.png" class="img-20" title="scroll"> WIKI</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" target="_blank" href="https://discord.gg/79t3w4c"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/discord.png" class="img-20" title="discord"> Discord</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" target="_blank" href="https://idle-pixel.com/old-games/"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/diamond.png" class="img-20" title="diamond"> Legacy Games</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" onclick="switch_panels('panel-settings')" href="#"><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/settings_white.png" class="img-20" title="settings_white"> Account Settings</a></li>
            <li><a class="dropdown-item" href="/login/" style="text-align: right;"><span class="color-red">Logout</span></a></li>
        </ul>
    </div> */

		onLogin() {
			//Insert Code Here
		}

		onVariableSet(key, valueBefore, valueAfter) {
			//Insert Code Here
		}

		onConfigChange() {
			//Insert Code Here
		}

		onPanelChanged(panelBefore, panelAfter) {
			//Insert Code Here
		}
	}

	const plugin = new LogsAllIn1();
	IdlePixelPlus.registerPlugin(plugin);
})();
