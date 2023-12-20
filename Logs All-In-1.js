// ==UserScript==
// @name         IdlePixel Logs All-In-1
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Combines the installing of 'IdlePixel Activity Log Tweaks', 'IdlePixel Combat Damage Log' and IdlePixel Loot Log Tweaks' into a single script.
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @license
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @require      https://update.greasyfork.org/scripts/482718/IdlePixel%20Loot%20Log%20Tweaks.user.js?anticache=20220905
// ==/UserScript==

(function() {
    'use strict';

    class LogsAllIn1 extends IdlePixelPlusPlugin {
        constructor() {
            super("logsallin1", {
                about: {
                    name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
                    version: GM_info.script.version,
                    author: GM_info.script.author,
                    description: GM_info.script.description
                },
                /*config: [
                    {
                        label: "------------------------------",
                        type: "label"
                    },
                    {
                        label: "General Stuff",
                        type: "label"
                    },
                    {
                        label: "------------------------------",
                        type: "label"
                    },
                    {
                        id: "font",
                        label: "Primary Font",
                        type: "select",
                        options: FONTS,
                        default: FONT_DEFAULT
                    }
                ]*/
            });
        }

        onLogin() {
            //Insert Code Here
        };

        onVariableSet(key, valueBefore, valueAfter) {
            //Insert Code Here
        };

        onConfigChange() {
            //Insert Code Here
        };

        onPanelChanged(panelBefore, panelAfter) {
            //Insert Code Here
        }
    }

    const plugin = new LogsAllIn1();
    IdlePixelPlus.registerPlugin(plugin);
})();