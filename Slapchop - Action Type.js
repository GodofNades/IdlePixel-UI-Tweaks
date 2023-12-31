// ==UserScript==
// @name         IdlePixel SlapChop - Action Type
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for Action Types (Primary or Alt).
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

    
    function isPrimaryActionSlapchop(event) {
        const prop = IdlePixelPlus.plugins.slapchop.getConfig("primaryActionKey") || "none";
        if(prop=="none") {
            return !(event.altKey || event.ctrlKey || event.shiftKey);
        }
        else {
            return event[prop];
        }
    }

    function isAltActionSlapchop(event) {
        const prop = IdlePixelPlus.plugins.slapchop.getConfig("altActionKey") || "altKey";
        return event[prop];
    }

	window.isPrimaryActionSlapchop = isPrimaryActionSlapchop;
	window.isAltActionSlapchop = isAltActionSlapchop;
})();