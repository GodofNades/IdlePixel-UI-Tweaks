// ==UserScript==
// @name         IdlePixel UI Tweaks - GodofNades Fork
// @namespace    com.anwinity.idlepixel
// @version      2.8.6
// @description  Adds some options to change details about the IdlePixel user interface.
// @author       Original Author: Anwinity || Modded By: GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// ==/UserScript==

(function() {
    'use strict';



    let onLoginLoaded = false;


    let del = false;

    

    


    // will be overwritten if data available in IdlePixelPlus.info
    const SMELT_TIMES = {
        copper: 3 ,
        iron: 6,
        silver: 15,
        gold: 50,
        promethium: 100,
        titanium: 500,
        ancient_ore: 1800,
        dragon_ore: 3600
    };

    const copperItemBox = document.querySelector('itembox[data-item=copper] img');
    const IMAGE_URL_BASE = copperItemBox.getAttribute('src').replace(/\/[^/]+.png$/, '');

    const FONTS = [];
    const FONT_DEFAULT = "IdlePixel Default";
    const FONT_FAMILY_DEFAULT = "pixel, \"Courier New\", Courier, monospace";
    (async() => {
        const FONTS_CHECK = new Set([
            // Windows 10
            'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
            // macOS
            'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
            // other
            'Helvetica', 'Garamond',
        ].sort());
        await document.fonts.ready;
        for(const font of FONTS_CHECK.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                FONTS.push(font);
            }
        }
        FONTS.unshift("IdlePixel Default");
    })();

    const BG_COLORS = {
        "#chat-area .server_message": "",
        "body": 'rgb(200, 247, 248)',
        ".top-bar": getComputedStyle(document.querySelector(".top-bar")).backgroundColor,
        "#menu-bar": getComputedStyle(document.querySelector("#menu-bar")).backgroundColor,
        "#chat-area": getComputedStyle(document.querySelector("#chat-area")).backgroundColor,
        "#game-chat": getComputedStyle(document.querySelector("#game-chat")).backgroundColor,
        "#panels": getComputedStyle(document.querySelector("#panels")).backgroundColor,
    };

    const FONT_COLORS = {
        "#chat-area .server_message": "",
        "#chat-area": document.querySelector("#chat-area") ? getComputedStyle(document.querySelector("#chat-area")).color : "",
        "#chat-area .color-green": document.querySelector("#chat-area .color-green") ? getComputedStyle(document.querySelector("#chat-area .color-green")).color : "",
        "#chat-area .color-grey": document.querySelector("#chat-area .color-grey") ? getComputedStyle(document.querySelector("#chat-area .color-grey")).color : "",
        "#chat-area .chat-username": document.querySelector("#chat-area .chat-username") ? getComputedStyle(document.querySelector("#chat-area .chat-username")).color : "",
        "#panels": document.querySelector("#panels") ? getComputedStyle(document.querySelector("#panels")).color : "",
        "#panels .color-grey": document.querySelector("#panels .color-grey") ? getComputedStyle(document.querySelector("#panels .color-grey")).color : "",
        "#panels .font-large": document.querySelector("#panels .font-large") ? getComputedStyle(document.querySelector("#panels .font-large")).color : "",
        "#menu-bar-button .color-grey": document.querySelector("#panels .color-grey") ? getComputedStyle(document.querySelector("#panels .color-grey")).color : "",
    };

    const CHAT_UPDATE_FILTER = [
        "#chat-area",
        "#chat-area .color-green",
        "#chat-area .color-grey",
        "#chat-area .chat-username",
        "#chat-area .server_message"
    ];

    const PANEL_UPDATE_FILTER = [
        "#panels"
    ];

    let condensedLoaded = false;

    class UITweaksPlugin extends IdlePixelPlusPlugin {
        constructor() {
            super("ui-tweaks", {
                about: {
                    name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
                    version: GM_info.script.version,
                    author: GM_info.script.author,
                    description: GM_info.script.description
                },
                config: [
                    {
                        label: "------------------------------------------------<br/>Chat/Images<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "font",
                        label: "Primary Font",
                        type: "select",
                        options: FONTS,
                        default: FONT_DEFAULT
                    },
                    {
                        id: "sideChat",
                        label: "Side Chat",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "condensedUI",
                        label: "Enable Condensed UI and Left Bar Tweaks",
                        type: "boolean",
                        default: true
                    },
                    /*{
                        id: "pinChat",
                        label: "Pin Chat on Side (Only works if Side Chat is active. Thanks BanBan)",
                        type: "boolean",
                        default: false
                    },*/
                    {
                        id: "chatLimit",
                        label: "Chat Message Limit (&leq; 0 means no limit)",
                        type: "int",
                        min: -1,
                        max: 5000,
                        default: 0
                    },
                    {
                        id: "imageTitles",
                        label: "Image Mouseover",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "tableLabels",
                        label: "Turn on item component labels for crafting/brewing/invention<br/>May require restart to disable",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "lowerToast",
                        label: "Lower Toast (top-right popup)",
                        type: "boolean",
                        default: false
                    },
                    {
                        label: "------------------------------------------------<br/>Combat<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "fightPointsStats",
                        label: "Fight Points in Left Menu",
                        type: "boolean",
                        default: true
                    },
                    {
                        id:"combatInfoSideSelect",
                        label: "Choose which side you want to see the<br/>Fight Points / Rare Pot Duration / Loot Pot info on.<br/>Left (Player info) || Right (Enemy Info)",
                        type: "select",
                        default: "left",
                        options: [
                            {value:"left", label:"Left - Player Side"},
                            {value:"right", label:"Right - Enemy Side"}
                        ]
                    },
                    {
                        label: "------------------------------------------------<br/>Condensed Information<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "condenseWoodcuttingPatches",
                        label: "Condensed Woodcutting Patches",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "condenseFarmingPatches",
                        label: "Condensed Farming Patches",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "condenseGatheringBoxes",
                        label: "Condensed Gathering Boxes",
                        type: "boolean",
                        default: false
                    },
                    {
                        label: "------------------------------------------------<br/>Fishing<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "heatInFishingTab",
                        label: "Heat In Fishing Tab",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "minusOneHeatInFishingTab",
                        label: "Heat In Fishing Tab (Minus 1 for collectors)",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "hideAquarium",
                        label: "Hide the notification for Aquarium needing to be fed",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "hideBoat",
                        label: "Hide the notification for Boats (Timer and Collect)",
                        type: "boolean",
                        default: false
                    },
                    {
                        label: "------------------------------------------------<br/>Invention<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "hideOrbRing",
                        label: "Hide crafted glass orbs and master ring in invention",
                        type: "boolean",
                        default: false
                    },
                    {
                        label: "------------------------------------------------<br/>Misc<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "robotReady",
                        label: "Show Robot Ready",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "moveSDWatch",
                        label: "Move Stardust Watch notifications to left side pannel",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "showHeat",
                        label: "Show heat on left side pannel",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "showPurpleKeyNotification",
                        label: "Show quick button notification for purple key",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "hideCrystalBall",
                        label: "Hide the notification for crystal ball",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "merchantReady",
                        label: "Show Merchant Ready notification",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "mixerTimer",
                        label: "Show Brewing Mixer timer and charges available",
                        type: "boolean",
                        default: true
                    },
                    {
                        label: "------------------------------------------------<br/>Oil<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "oilSummaryMining",
                        label: "Oil Summary, Mining Panel",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "oilSummaryCrafting",
                        label: "Oil Summary, Crafting Panel",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "oilFullNotification",
                        label: "Oil Full",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "oilGainNotification",
                        label: "Oil Gain Timer",
                        type: "boolean",
                        default: true
                    },
                    {
                        label: "------------------------------------------------<br/>Rocket<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "rocketETATimer",
                        label: "Rocket Notification ETA",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "leftSideRocketInfoSection",
                        label: "Enable moving of rocket information to left side (hides notifications)",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "leftSideRocketInfo",
                        label: "Enable Rocket Distance/Travel Time on left side (hides rocket notification)",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "leftSideRocketFuel",
                        label: "Enable Rocket Fuel Info on left side.",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "leftSideRocketPot",
                        label: "Enable Rocket Pot Info on left side. (hides rocket pot notification)",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "hideRocketKM",
                        label: "Rocket Notification Hide KM",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "goodMoon",
                        label: "Good moon distance<br/>(Range: 250,000 - 450,000)<br/>Type entire number without ','",
                        type: "int",
                        default: 300000
                    },
                    {
                        id: "goodSun",
                        label: "Good sun distance<br/>(Range: 100,000,000 - 200,000,000)<br/>Type entire number without ','",
                        type: "int",
                        default: 130000000
                    },
                    {
                        label: "------------------------------------------------<br/>Smelting/Mining<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "miningMachineArrows",
                        label: "Mining Machine Arrows",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "smeltingNotificationTimer",
                        label: "Smelting Notification Timer",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "furnaceEmptyNotification",
                        label: "Furnace Empty Notification",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "hideDrillNotifications",
                        label: "Hide Active Mining Machine Notifications on top bar",
                        type: "boolean",
                        default: false
                    },
                    {
                        label: "------------------------------------------------<br/>BG Color Overrides<br/>------------------------------------------------",
                        type:"label"
                    },
                    {
                        id: "disableBGColorOverrides",
                        label: "Disable background color overrides (Check = disabled)<br/>Disable the BG Color Overrides if you are wanting to use<br/>the built in settings for the game for your colors<br/>REFRESH REQUIRED WHEN DISABLING THE BG COLORS<br/>",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-enabled-body",
                        label: "Main Background: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-body",
                        label: "Main Background: Color",
                        type: "color",
                        default: BG_COLORS["body"]
                    },
                    {
                        id: "color-enabled-panels",
                        label: "Panel Background: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-panels",
                        label: "Panel Background: Color",
                        type: "color",
                        default: BG_COLORS["#panels"]
                    },
                    {
                        id: "color-enabled-top-bar",
                        label: "Top Background: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-top-bar",
                        label: "Top Background: Color",
                        type: "color",
                        default: BG_COLORS[".top-bar"]
                    },
                    {
                        id: "color-enabled-menu-bar",
                        label: "Menu Background: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-menu-bar",
                        label: "Menu Background: Color",
                        type: "color",
                        default: BG_COLORS["#menu-bar"]
                    },
                    {
                        id: "color-enabled-chat-area",
                        label: "Inner Chat BG: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-chat-area",
                        label: "Inner Chat BG: Color",
                        type: "color",
                        default: BG_COLORS["#chat-area"]
                    },
                    {
                        id: "color-enabled-game-chat",
                        label: "Outer Chat BG: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-game-chat",
                        label: "Outer Chat BG: Color",
                        type: "color",
                        default: BG_COLORS["#game-chat"]
                    },
                    {
                        id: "color-enabled-chat-area-server_message",
                        label: "Server Message Tag: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "color-chat-area-server_message",
                        label: "Server Message Tag: Color",
                        type: "color",
                        default: BG_COLORS["#chat-area .server_message"]
                    },
                    {
                        label: "Text Color Overrides",
                        type: "label"
                    },
                    {
                        id: "font-color-enabled-chat-area",
                        label: "Chat Text: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-chat-area",
                        label: "Chat Text: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area"]
                    },
                    {
                        id: "font-color-enabled-chat-area-color-green",
                        label: "Chat Timestamp: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-chat-area-color-green",
                        label: "Chat Timestamp: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area .color-green"]
                    },
                    {
                        id: "font-color-enabled-chat-area-chat-username",
                        label: "Chat Username: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-chat-area-chat-username",
                        label: "Chat Username: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area .chat-username"]
                    },
                    {
                        id: "font-color-enabled-chat-area-color-grey",
                        label: "Chat Level: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-chat-area-color-grey",
                        label: "Chat Level: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area .color-grey"]
                    },
                    {
                        id: "font-color-enabled-chat-area-server_message",
                        label: "Server Message Tag: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-chat-area-server_message",
                        label: "Server Message Tag: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area .server_message"]
                    },
                    {
                        id: "serverMessageTextOverrideEnabled",
                        label: "Server Message Text: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "serverMessageTextOverrideColor",
                        label: "Server Message Text: Color",
                        type: "color",
                        default: "blue"
                    },
                    {
                        id: "chatBorderOverrideColorEnabled",
                        label: "Chat Border Color: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "chatBorderOverrideColor",
                        label: "Chat Border Color: Color",
                        type: "color",
                        default: "blue"
                    },
                    {
                        id: "font-color-enabled-panels",
                        label: "Panels 1: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-panels",
                        label: "Panels 1: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area"]
                    },
                    {
                        id: "font-color-enabled-panels-color-grey",
                        label: "Panels 2: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-panels-color-grey",
                        label: "Panels 2: Color",
                        type: "color",
                        default: FONT_COLORS["#chat-area .color-grey"]
                    },
                    {
                        id: "font-color-enabled-panels-font-large",
                        label: "Skill Level Color: Enabled",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "font-color-panels-font-large",
                        label: "Skill Level: Color",
                        type: "color",
                        default: FONT_COLORS["#panels .font-large"]
                    }
                ]
            });
        }

        
        oilTimerNotification() {
            const notifDiv = document.createElement('div');
            notifDiv.id = 'notification-oil_gain';
            notifDiv.className = 'notification hover';
            notifDiv.style.marginRight = '4px';
            notifDiv.style.marginBottom = '4px';
            notifDiv.style.display = 'none';

            const elem = document.createElement('img');
            elem.setAttribute('src', 'https://d1xsc8x7nc5q8t.cloudfront.net/images/oil.png');
            const notifIcon = elem;
            notifIcon.className = 'w20';

            const notifDivLabel = document.createElement('span');
            notifDivLabel.id = 'notification-oil_gain-label';
            notifDivLabel.innerText = ' Loading';
            notifDivLabel.className = 'color-white';

            notifDiv.appendChild(notifIcon);
            notifDiv.appendChild(notifDivLabel);

            const notificationFurnaceAvail = document.getElementById('notification-furnace_avail');
            if(notificationFurnaceAvail){
                notificationFurnaceAvail.parentNode.insertBefore(notifDiv, notificationFurnaceAvail);
                notifDiv.style.display = 'none';
            }
        }

        oilGain() {
            const notificationFurnaceAvail = document.getElementById('notification-furnace_avail');
            const oilDelta = IdlePixelPlus.getVarOrDefault("oil_delta", 0, "int");
            const oil = IdlePixelPlus.getVarOrDefault("oil", 0, "int");
            const oilMax = IdlePixelPlus.getVarOrDefault("max_oil", 0, "int");
            const notificationOilGain = document.getElementById("notification-oil_gain");
            const notificationOilGainLabel = document.getElementById("notification-oil_gain-label");

            if(notificationOilGainLabel) {
                if (this.getConfig("oilGainNotification")) {
                    if (oilDelta === 0) {
                        notificationOilGainLabel.textContent = ' Balanced';
                        notificationOilGain.style.display = 'inline-block';
                    } else if (oilDelta < 0) {
                        const oilNega = (oilMax - (oilMax - oil)) / (-oilDelta);
                        const oilNegETA = format_time(oilNega);
                        notificationOilGainLabel.textContent = ' ' + oilNegETA + ' Until Empty';
                        notificationOilGain.style.display = 'inline-block';
                    } else if (oilDelta > 0 && oil !== oilMax) {
                        const oilPosi = (oilMax - oil) / oilDelta;
                        const oilPosETA = format_time(oilPosi);
                        notificationOilGainLabel.textContent = ' ' + oilPosETA + ' Until Full';
                        notificationOilGain.style.display = 'inline-block';
                    } else if (oilDelta > 0 && oil === oilMax) {
                        notificationOilGain.style.display = 'none';
                    }
                } else {
                    notificationOilGain.style.display = 'none';
                }
            }
        }

        loot_pot_avail() {
            const notifDiv = document.createElement('div');
            notifDiv.id = `notification-loot_pot_avail`;
            notifDiv.className='notification hover';
            notifDiv.style='margin-right: 4px; margin-bottom: 4px; display: none';
            notifDiv.style.display = "inline-block";

            var elem = document.createElement("img");
            elem.setAttribute("src", "https://d1xsc8x7nc5q8t.cloudfront.net/images/combat_loot_potion.png");
            const notifIcon = elem;
            notifIcon.className = "w20";

            const notifDivLabel = document.createElement('span');
            notifDivLabel.id = `notification-loot_pot_avail-label`;
            notifDivLabel.innerText = ' Loot Pot Active';
            notifDivLabel.className = 'color-white'

            notifDiv.append(notifIcon, notifDivLabel)
            document.querySelector('#notifications-area').append(notifDiv)
        }

        fightPointsFull() {
            const max = IdlePixelPlus.getVarOrDefault("max_fight_points", 0, "int");
            const current = IdlePixelPlus.getVarOrDefault("fight_points", 0, "int");
            const remaining = max - current;
            const remaining_time = format_time(remaining);

            const fightPointsFullTimerMain = document.querySelector("#fight-points-full-id-menu");
            const fightPointsFullTimerMain_2 = document.querySelector("#fight-points-full-id-menu_2");
            const fightPointsFullTimerCombat = document.querySelector("#fight-points-full-id-combat");



            if (remaining === 0) {
                fightPointsFullTimerMain.textContent = "full";
                fightPointsFullTimerCombat.textContent = "full";
            } else {
                var masterRingEquip = IdlePixelPlus.getVarOrDefault("master_ring_equipped", 0, "int");
                if (masterRingEquip === 1) {
                    fightPointsFullTimerMain.textContent = format_time(remaining / 2);
                    fightPointsFullTimerMain_2.textContent = format_time(remaining / 2);
                    fightPointsFullTimerCombat.textContent = format_time(remaining / 2);
                } else {
                    fightPointsFullTimerMain.textContent = remaining_time;
                    fightPointsFullTimerMain_2.textContent = remaining_time;
                    fightPointsFullTimerCombat.textContent = remaining_time;
                }
            }
        }

        //////////////////////////////// updateColors Start ////////////////////////////////
        updateColors(filter) {
            const bgColorCheck = this.getConfig("disableBGColorOverrides");

            if (!bgColorCheck) {
                Object.keys(BG_COLORS).forEach(selector => {
                    if (!filter || filter.includes(selector)) {
                        const key = selector.replace(/[#\.]/g, '').replace(/-?\s+-?/, "-");
                        const enabled = this.getConfig(`color-enabled-${key}`);
                        const color = enabled ? this.getConfig(`color-${key}`) : BG_COLORS[selector];
                        const selected = document.querySelectorAll(selector);

                        for (const element of selected) {
                            element.style.backgroundColor = color;
                        }
                    }
                });

                Object.keys(FONT_COLORS).forEach(selector => {
                    if (!filter || filter.includes(selector)) {
                        const key = selector.replace(/[#\.]/g, '').replace(/-?\s+-?/, "-");
                        const enabled = this.getConfig(`font-color-enabled-${key}`);
                        const color = enabled ? this.getConfig(`font-color-${key}`) : FONT_COLORS[selector];
                        const selected = document.querySelectorAll(selector);

                        for (const element of selected) {
                            element.style.color = color;
                        }
                    }
                });

                const chatBorderOverrideColorEnabled = this.getConfig("chatBorderOverrideColorEnabled");
                const chatBorderOverrideColor = this.getConfig("chatBorderOverrideColor");
                if (chatBorderOverrideColorEnabled) {
                    const chatElements = document.querySelectorAll("#game-chat.chat.m-3");
                    for (const element of chatElements) {
                        element.style.borderColor = chatBorderOverrideColor;
                    }
                }

                const serverMessageTextOverrideEnabled = this.getConfig("serverMessageTextOverrideEnabled");
                const serverMessageTextOverrideColor = serverMessageTextOverrideEnabled ? this.getConfig("serverMessageTextOverrideColor") : "blue";
                const serverMessageElements = document.querySelectorAll("#chat-area .server_message");
                for (const element of serverMessageElements) {
                    element.parentElement.style.color = serverMessageTextOverrideColor;
                }
            }
            const bodyClassUpdate = document.getElementById('body').className.replaceAll('background-primary-gradient ', '');
            document.getElementById('body').className = bodyClassUpdate;
        }

        //////////////////////////////// updateColors end ////////////////////////////////




        //////////////////////////////// onConfigsChanged Start ////////////////////////////////
        onConfigsChanged() {
            if(onLoginLoaded) {
                this.fightPointsFull();
                this.miningMachTimer();

                document.body.style.fontFamily = '';
                const font = this.getConfig("font");
                if (font && font !== FONT_DEFAULT) {
                    const bodyStyle = document.body.getAttribute("style");
                    document.body.setAttribute("style", `${bodyStyle}; font-family: ${font} !important`);
                }

                const sideChat = this.getConfig("sideChat");
                if (sideChat) {
                    document.getElementById("content").classList.add("side-chat");
                } else {
                    document.getElementById("content").classList.remove("side-chat");
                }

                /*const pinChat = this.getConfig("pinChat");
                if (sideChat && pinChat) {
                    // Pin when both side chat and pin chat options are enabled
                    document.getElementById("game-chat").style.position = "sticky";
                    document.getElementById("game-chat").style.top = 0;
                } else {
                    // No existing position or top styles for game-chat element so safe to remove them if we've already added them
                    document.getElementById("game-chat").style.position = null;
                    document.getElementById("game-chat").style.top = null;
                }*/

                if (this.getConfig("fightPointsStats")) {
                    document.getElementById("menu-bar-fight-points").style.display = "inline-block";
                }
                if (this.getConfig("fightPointsStats")) {
                    document.getElementById("menu-bar-fight-points").style.display = "inline-block";
                    document.getElementById("menu-bar-fight-fight-points").style.display = "block";
                } else {
                    document.getElementById("menu-bar-fight-points").style.display = "none";
                    document.getElementById("menu-bar-fight-fight-points").style.display = "none";
                }

                //////
                const condenseWoodcuttingPatches = this.getConfig("condenseWoodcuttingPatches");
                if (condenseWoodcuttingPatches) {
                    const farmingPatchesArea = document.querySelector("#panel-woodcutting .farming-patches-area");
                    farmingPatchesArea.classList.add("condensed");
                    document.querySelectorAll("#panel-woodcutting .farming-patches-area img[id^='img-tree_shiny']").forEach(function (el) {
                        el.removeAttribute("width");
                        el.removeAttribute("height");
                    });
                } else {
                    const farmingPatchesArea = document.querySelector("#panel-woodcutting .farming-patches-area");
                    farmingPatchesArea.classList.remove("condensed");
                    document.querySelectorAll("#panel-woodcutting .farming-patches-area img[id^='img-tree_shiny']").forEach(function (el) {
                        el.setAttribute("width", el.getAttribute("original-width"));
                        el.setAttribute("height", el.getAttribute("original-height"));
                    });
                }

                const condenseFarmingPatches = this.getConfig("condenseFarmingPatches");
                if (condenseFarmingPatches) {
                    const farmingPatchesArea = document.querySelector("#panel-farming .farming-patches-area");
                    farmingPatchesArea.classList.add("condensed");
                    document.querySelectorAll("#panel-farming .farming-patches-area img[id^='img-farm_shiny']").forEach(function (el) {
                        el.removeAttribute("width");
                        el.removeAttribute("height");
                    });
                } else {
                    const farmingPatchesArea = document.querySelector("#panel-farming .farming-patches-area");
                    farmingPatchesArea.classList.remove("condensed");
                    document.querySelectorAll("#panel-farming .farming-patches-area img[id^='img-farm_shiny']").forEach(function (el) {
                        el.setAttribute("width", el.getAttribute("original-width"));
                        el.setAttribute("height", el.getAttribute("original-height"));
                    });
                }

                const condenseGatheringBoxes = this.getConfig("condenseGatheringBoxes");
                if (condenseGatheringBoxes) {
                    const gatheringBoxes = document.querySelectorAll("#panel-gathering .gathering-box");
                    gatheringBoxes.forEach(function (el) {
                        el.classList.add("condensed");
                    });
                } else {
                    const gatheringBoxes = document.querySelectorAll("#panel-gathering .gathering-box");
                    gatheringBoxes.forEach(function (el) {
                        el.classList.remove("condensed");
                    });
                }

                if (this.getConfig("imageTitles")) {
                    const images = document.querySelectorAll("img");
                    images.forEach(function (el) {
                        const src = el.getAttribute("src");
                        if (src && src !== "x") {
                            const title = src.replace(/.*\//, "").replace(/\.\w+$/, "");
                            el.setAttribute("title", title);
                        }
                    });
                } else {
                    const images = document.querySelectorAll("img");
                    images.forEach(function (el) {
                        el.removeAttribute("title");
                    });
                }

                if (this.getConfig("miningMachineArrows")) {
                    const panelMining = document.querySelector("#panel-mining");
                    panelMining.classList.add("add-arrow-controls");
                } else {
                    const panelMining = document.querySelector("#panel-mining");
                    panelMining.classList.remove("add-arrow-controls");
                }
                //////
                document.addEventListener("DOMContentLoaded", function() {
                    const toast = document.querySelector(".toast-container");
                    if (toast) {
                        if (this.getConfig("lowerToast")) {
                            toast.classList.remove("top-0");
                            toast.style.top = "45px";
                        } else {
                            toast.style.top = "";
                            toast.classList.add("top-0");
                        }
                    }
                });

                const oilSummaryMining = this.getConfig("oilSummaryMining");
                if (oilSummaryMining) {
                    document.getElementById("oil-summary-mining").style.display = "block";
                } else {
                    document.getElementById("oil-summary-mining").style.display = "none";
                }

                const oilSummaryCrafting = this.getConfig("oilSummaryCrafting");
                if (oilSummaryCrafting) {
                    document.getElementById("oil-summary-crafting").style.display = "block";
                } else {
                    document.getElementById("oil-summary-crafting").style.display = "none";
                }

                const smeltingNotificationTimer = this.getConfig("smeltingNotificationTimer");
                if (smeltingNotificationTimer) {
                    document.getElementById("notification-furnace-timer").style.display = "inline-block";
                } else {
                    document.getElementById("notification-furnace-timer").style.display = "none";
                }

                const rocketETATimer = this.getConfig("rocketETATimer");
                if (rocketETATimer) {
                    document.getElementById("notification-rocket-timer").style.display = "inline-block";
                    document.getElementById("notification-mega_rocket-timer").style.display = "inline-block";
                } else {
                    document.getElementById("notification-rocket-timer").style.display = "none";
                    document.getElementById("notification-mega_rocket-timer").style.display = "none";
                }

                const hideRocketKM = this.getConfig("hideRocketKM");
                if (hideRocketKM) {
                    document.getElementById("notification-rocket-label").style.display = "none";
                    document.getElementById("notification-mega_rocket-label").style.display = "none";
                } else {
                    document.getElementById("notification-rocket-label").style.display = "inline-block";
                    document.getElementById("notification-mega_rocket-label").style.display = "inline-block";
                }

                const heatInFishingTab = this.getConfig("heatInFishingTab");
                const heatFishingTab = document.getElementById("heat-fishing-tab");
                if (heatInFishingTab) {
                    heatFishingTab.style.display = "block";
                    heatFishingTab.setAttribute("data-item", "heat");
                } else {
                    heatFishingTab.style.display = "none";
                    heatFishingTab.removeAttribute("data-item");
                }

                const merchantReady = this.getConfig("merchantReady");
                const merchAvail = IdlePixelPlus.getVarOrDefault("merchant");
                const merchantAvailNotification = document.getElementById("notification-merchant_avail");
                if (merchAvail === 1) {
                    if (merchantReady) {
                        merchantAvailNotification.style.display = "inline-block";
                    } else {
                        merchantAvailNotification.style.display = "none";
                    }
                }

                const mixerTimer = this.getConfig("mixerTimer");
                const mixerAvail = IdlePixelPlus.getVarOrDefault("brewing_xp_mixer_crafted");
                const brewingMixerTimerNotification = document.getElementById("notification-brewing_mixer_timer");
                if (mixerAvail == 1) {
                    if (mixerTimer) {
                        brewingMixerTimerNotification.style.display = "inline-block";
                    } else {
                        brewingMixerTimerNotification.style.display = "none";
                    }
                }

                const robotReady = this.getConfig("robotReady");
                const robotAvail = IdlePixelPlus.getVarOrDefault("robot_crafted");
                const robotAvailNotification = document.getElementById("notification-robot_avail");
                if (robotReady && robotAvailNotification) {
                    if (robotReady) {
                        robotAvailNotification.style.display = "inline-block";
                    } else {
                        robotAvailNotification.style.display = "none";
                    }
                }

                const drillNotifications = this.getConfig("hideDrillNotifications");
                if (drillNotifications) {
                    this.miningMachTimer();
                }

                //////
                const sdWatchShow = this.getConfig("moveSDWatch");
                const sdWatchUnlocked = IdlePixelPlus.getVarOrDefault("stardust_watch_crafted", 0, "int");
                if (sdWatchShow && sdWatchUnlocked === 1) {
                    document.getElementById("notification-stardust_watch").style.display = "none";
                    document.getElementById("menu-bar-sd_watch").style.display = "block";
                } else if (!sdWatchShow && sdWatchUnlocked === 1) {
                    document.getElementById("notification-stardust_watch").style.display = "inline-block";
                    document.getElementById("menu-bar-sd_watch").style.display = "none";
                } else {
                    document.getElementById("notification-stardust_watch").style.display = "none";
                    document.getElementById("menu-bar-sd_watch").style.display = "none";
                }

                const showHeat = this.getConfig("showHeat");
                if (showHeat) {
                    document.getElementById("menu-bar-heat").style.display = "block";
                } else {
                    document.getElementById("menu-bar-heat").style.display = "none";
                }

                this.onVariableSet("oil", window.var_oil, window.var_oil);

                this.updateColors();

                const combatInfoPanel = this.getConfig("combatInfoSideSelect");
                if (combatInfoPanel === "left") {
                    document.getElementById("combat-info-fight_point-left").style.display = "block";
                    document.getElementById("combat-info-rare_pot-left").style.display = "block";
                    document.getElementById("combat-info-loot_pot-left").style.display = "block";
                    document.getElementById("combat-info-fight_point-right").style.display = "none";
                    document.getElementById("combat-info-rare_pot-right").style.display = "none";
                    document.getElementById("combat-info-loot_pot-right").style.display = "none";
                } else {
                    document.getElementById("combat-info-fight_point-left").style.display = "none";
                    document.getElementById("combat-info-rare_pot-left").style.display = "none";
                    document.getElementById("combat-info-loot_pot-left").style.display = "none";
                    document.getElementById("combat-info-fight_point-right").style.display = "block";
                    document.getElementById("combat-info-rare_pot-right").style.display = "block";
                    document.getElementById("combat-info-loot_pot-right").style.display = "block";
                }

                const showPurpleKey = this.getConfig("showPurpleKeyNotification");
                const purpleKeyUnlock = IdlePixelPlus.getVarOrDefault("guardian_purple_key_hint", 0, "int");
                if (showPurpleKey && purpleKeyUnlock === 1) {
                    document.getElementById("notification-purple_key").style.display = "inline-block";
                } else {
                    document.getElementById("notification-purple_key").style.display = "none";
                }

                const hideBoatNotifications = this.getConfig("hideBoat");
                const pirate_ship_timer = IdlePixelPlus.getVarOrDefault("pirate_ship_timer", 0, "int");
                const row_boat_timer = IdlePixelPlus.getVarOrDefault("row_boat_timer", 0, "int");
                const canoe_boat_timer = IdlePixelPlus.getVarOrDefault("canoe_boat_timer", 0, "int");
                const stardust_boat_timer = IdlePixelPlus.getVarOrDefault("stardust_boat_timer", 0, "int");
                if (hideBoatNotifications) {
                    document.getElementById("notification-row_boat").style.display = "none";
                    document.getElementById("notification-canoe_boat").style.display = "none";
                    document.getElementById("notification-stardust_boat").style.display = "none";
                    document.getElementById("notification-pirate_ship").style.display = "none";
                } else {
                    if (row_boat_timer > 0) {
                        document.getElementById("notification-row_boat").style.display = "inline-block";
                    }
                    if (canoe_boat_timer > 0) {
                        document.getElementById("notification-canoe_boat").style.display = "inline-block";
                    }
                    if (stardust_boat_timer > 0) {
                        document.getElementById("notification-stardust_boat").style.display = "inline-block";
                    }
                    if (pirate_ship_timer > 0) {
                        document.getElementById("notification-pirate_ship").style.display = "inline-block";
                    }
                }

                //////
                const rocket_usable = IdlePixelPlus.getVarOrDefault("rocket_usable", 0, "int");
                const rocket_travel_check = IdlePixelPlus.getVarOrDefault("rocket_distance_required", 0, "int");
                const rocket_pot_timer_check = IdlePixelPlus.getVarOrDefault("rocket_potion_timer", 0, "int");
                const rocket_check = IdlePixelPlus.getVarOrDefault("mega_rocket", 0, "int");

                if (this.getConfig("leftSideRocketInfoSection") && rocket_usable > 0) {
                    document.getElementById("current-rocket-info").style.display = "block";

                    if (this.getConfig("leftSideRocketInfo")) {
                        document.getElementById("rocket-travel-info").style.display = "block";
                        document.getElementById("notification-mega_rocket").style.display = "none";
                        document.getElementById("notification-rocket").style.display = "none";
                    } else if (rocket_travel_check > 0 && rocket_check == 1) {
                        document.getElementById("notification-mega_rocket").style.display = "block";
                        document.getElementById("rocket-travel-info").style.display = "none";
                    } else if (rocket_travel_check > 0 && rocket_check == 0) {
                        document.getElementById("notification-rocket").style.display = "block";
                        document.getElementById("rocket-travel-info").style.display = "none";
                    } else {
                        document.getElementById("rocket-travel-info").style.display = "none";
                    }

                    if (this.getConfig("leftSideRocketFuel")) {
                        document.getElementById("current-rocket-fuel-info").style.display = "block";
                    } else {
                        document.getElementById("current-rocket-fuel-info").style.display = "none";
                    }

                    if (this.getConfig("leftSideRocketPot")) {
                        document.getElementById("current-rocket-pot-info").style.display = "block";
                        document.getElementById("notification-potion-rocket_potion_timer").style.display = "none";
                    } else if (rocket_pot_timer_check > 0) {
                        document.getElementById("notification-potion-rocket_potion_timer").style.display = "block";
                        document.getElementById("current-rocket-pot-info").style.display = "none";
                    } else {
                        document.getElementById("current-rocket-pot-info").style.display = "none";
                    }
                } else {
                    document.getElementById("current-rocket-info").style.display = "none";
                }

                if (rocket_travel_check === 0) {
                    document.getElementById("current-rocket-travel-distances").textContent = "Rocket is IDLE";
                    document.querySelector("img#rocket-type-img-mega").style.transform = "rotate(315deg)";
                    document.querySelector("img#rocket-type-img-mega").style.display = "inline-block";
                }

                setTimeout(function () {
                    if(document.getElementById('notification-furnace_avail')) {
                        const furnaceOreTypeVar = IdlePixelPlus.getVarOrDefault("furnace_ore_amount_set", 0, "int");
                        const furnaceNotifVar = IdlePixelPlus.plugins['ui-tweaks'].getConfig("furnaceEmptyNotification");
                        if (furnaceOreTypeVar <= 0 && furnaceNotifVar) {
                            document.getElementById('notification-furnace_avail').style.display = "inline-block";
                        } else {
                            document.getElementById('notification-furnace_avail').style.display = "none";
                        }
                    }
                }, 500);

                const purpleKeyGo = this.getConfig("showPurpleKeyNotification");

                if(this.getConfig("condensedUI")) {
                    this.condensedUI();
                } else {
                    this.defaultUI();
                }
            }
        }
        //////////////////////////////// onConfigsChanged End ////////////////////////////////

        restructureTopBar() {
            let topRow = document.getElementById("top-menu-bar-labels").querySelector("tr");
            let topCell = document.getElementById("top-menu-bar-labels").querySelectorAll("td");
            let gearIcon = topCell[topCell.length - 1];
            console.log(gearIcon);

            topRow.style.justifyContent = "center";
            topRow.style.display = "flex";
            topCell.forEach((element) => { element.style = "padding-right:20px; padding-left: 20px; border:1px solid white"});
            gearIcon.style = "";
        }

        addCriptoeValues() {
            const wallet_1_text = document.getElementById("wallet_1_payout");
            const wallet_1_perct = document.getElementById("criptoe-wallet-1-percentage").innerText.replace(' %', '');
            const wallet_1 = IdlePixelPlus.getVarOrDefault("wallet1_invested", 0, "int");
            const wallet_1_payout = Math.floor(wallet_1 * (wallet_1_perct / 100 + 1));

            const wallet_2_text = document.getElementById("wallet_2_payout");
            const wallet_2_perct = document.getElementById("criptoe-wallet-2-percentage").innerText.replace(' %', '');
            const wallet_2 = IdlePixelPlus.getVarOrDefault("wallet1_invested", 0, "int");
            const wallet_2_payout = Math.floor(wallet_2 * (wallet_2_perct / 100 + 1));

            const wallet_3_text = document.getElementById("wallet_3_payout");
            const wallet_3_perct = document.getElementById("criptoe-wallet-3-percentage").innerText.replace(' %', '');
            const wallet_3 = IdlePixelPlus.getVarOrDefault("wallet3_invested", 0, "int");
            const wallet_3_payout = Math.floor(wallet_3 * (wallet_3_perct / 100 + 1));

            const wallet_4_text = document.getElementById("wallet_4_payout");
            const wallet_4_perct = document.getElementById("criptoe-wallet-4-percentage").innerText.replace(' %', '');
            const wallet_4 = IdlePixelPlus.getVarOrDefault("wallet4_invested", 0, "int");
            const wallet_4_payout = Math.floor(wallet_4 * (wallet_4_perct / 100 + 1));

            if(wallet_1 > 0) {
                if(wallet_1_perct > -100) {
                    wallet_1_text.innerText = ` ${wallet_1_payout.toLocaleString()}`;
                } else {
                    wallet_1_text.innerText = ` Full Loss`;
                }
            } else {
                wallet_1_text.innerText = ` No Investment`;
            }

            if(wallet_2 > 0) {
                if(wallet_2_perct > -100) {
                    wallet_2_text.innerText = ` ${wallet_2_payout.toLocaleString()}`;
                } else {
                    wallet_2_text.innerText = ` Full Loss`;
                }
            } else {
                wallet_2_text.innerText = ` No Investment`;
            }

            if(wallet_3 > 0) {
                if(wallet_3_perct > -100) {
                    wallet_3_text.innerText = ` ${wallet_3_payout.toLocaleString()}`;
                } else {
                    wallet_3_text.innerText = ` Full Loss`;
                }
            } else {
                wallet_3_text.innerText = ` No Investment`;
            }

            if(wallet_4 > 0) {
                if(wallet_4_perct > -100) {
                    wallet_4_text.innerText = ` ${wallet_4_payout.toLocaleString()}`;
                } else {
                    wallet_4_text.innerText = ` Full Loss`;
                }
            } else {
                wallet_4_text.innerText = ` No Investment`;
            }
        }


        //////////////////////////////// onLogin Start ////////////////////////////////
        onLogin() {
            document.getElementById("menu-bar").style.borderTop = "1px solid grey";
            document.getElementById("menu-bar").style.paddingTop = "10px";
            document.getElementById("left-menu-bar-labels").style.borderBottom = "1px solid rgba(66,66,66,1)";

            //// I hate it but it works Criptoe Payouts
            document.querySelector("#panel-criptoe-market > div.charts-content > div > table:nth-child(1) > tbody > tr > td:nth-child(1) > item-display").insertAdjacentHTML("afterend", `<br><b>Current Payout: </b><span id="wallet_1_payout"></span>`)
            document.querySelector("#panel-criptoe-market > div.charts-content > div > table:nth-child(3) > tbody > tr > td:nth-child(1) > item-display").insertAdjacentHTML("afterend", `<br><b>Current Payout: </b><span id="wallet_2_payout"></span>`)
            document.querySelector("#panel-criptoe-market > div.charts-content > div > table:nth-child(5) > tbody > tr > td:nth-child(1) > item-display").insertAdjacentHTML("afterend", `<br><b>Current Payout: </b><span id="wallet_3_payout"></span>`)
            document.querySelector("#panel-criptoe-market > div.charts-content > div > table:nth-child(7) > tbody > tr > td:nth-child(1) > item-display").insertAdjacentHTML("afterend", `<br><b>Current Payout: </b><span id="wallet_4_payout"></span>`)

            document.getElementById("left-panel-criptoe_market-btn").onclick = function() {
                if(Globals.currentpanel != 'criptoe-market') {
                    CToe.called = false;
                    CToe.fetch_chart_data();
                    switch_panels('panel-criptoe-market');
                    setTimeout(function() {
                        IdlePixelPlus.plugins['ui-tweaks'].addCriptoeValues();
                    }, 1000);
                } else {
                    CToe.called = false;
                    CToe.fetch_chart_data();
                    setTimeout(function() {
                        IdlePixelPlus.plugins['ui-tweaks'].addCriptoeValues();
                    }, 1000);
                }
            }

            function addLoadingSpanAfterElement(selector, id) {
                const element = document.querySelector(selector);
                const loadingSpan = document.createElement("span");
                loadingSpan.id = id;
                loadingSpan.textContent = "(Loading)";
                loadingSpan.className = "color-silver";
                element.insertAdjacentElement('afterend', loadingSpan);
            }
            if(document.querySelector("#top-bar > a:nth-child(4) > item-display")) {
                addLoadingSpanAfterElement("#top-bar > a:nth-child(4) > item-display", "overallLevelExtended-total");
            } else {
                addLoadingSpanAfterElement("#top-bar > a:nth-child(5) > item-display", "overallLevelExtended-total");
            }
            addLoadingSpanAfterElement("#menu-bar-mining-level", "overallLevelExtended-mining");
            addLoadingSpanAfterElement("#menu-bar-crafting-level", "overallLevelExtended-crafting");
            addLoadingSpanAfterElement("#menu-bar-gathering-level", "overallLevelExtended-gathering");
            addLoadingSpanAfterElement("#menu-bar-farming-level", "overallLevelExtended-farming");
            addLoadingSpanAfterElement("#menu-bar-brewing-level", "overallLevelExtended-brewing");
            addLoadingSpanAfterElement("#menu-bar-woodcutting-level", "overallLevelExtended-woodcutting");
            addLoadingSpanAfterElement("#menu-bar-cooking-level", "overallLevelExtended-cooking");
            addLoadingSpanAfterElement("#menu-bar-fishing-level", "overallLevelExtended-fishing");
            addLoadingSpanAfterElement("#menu-bar-invention-level", "overallLevelExtended-invention");
            addLoadingSpanAfterElement("#menu-bar-melee-level", "overallLevelExtended-melee");
            addLoadingSpanAfterElement("#menu-bar-archery-level", "overallLevelExtended-archery");
            addLoadingSpanAfterElement("#menu-bar-magic-level", "overallLevelExtended-magic");


            this.updateColors();

            var loot_pot = IdlePixelPlus.getVarOrDefault("combat_loot_potion_active", 0, "int");
            var merchantTiming = IdlePixelPlus.getVarOrDefault("merchant_timer", 0, "int");
            var merchantUnlocked = IdlePixelPlus.getVarOrDefault("merchant", 0, "int");
            let robotTiming = IdlePixelPlus.getVarOrDefault("robot_wave_timer", 0, "int");
            var robotUnlocked = IdlePixelPlus.getVarOrDefault("robot_crafted", 0, "int");
            const tableLabel = this.getConfig("tableLabels");
            this.loot_pot_avail();
            if(tableLabel) {
                this.addTableCraftLabels();
            }

            const addBrewerNotifications = (timer, charges) => {
                var mixerUnlocked = IdlePixelPlus.getVarOrDefault("brewing_xp_mixer_crafted");
                const notifDiv = document.createElement('div');
                notifDiv.id = `notification-brewing_mixer_timer`;
                notifDiv.onclick = function () {
                    websocket.send(switch_panels('panel-brewing'));
                    websocket.send(Modals.clicks_brewing_xp_mixer());
                }
                notifDiv.className='notification hover';
                notifDiv.style='margin-bottom: 4px; display: none';
                notifDiv.style.display = "inline-block";

                var elem = document.createElement("img");
                elem.setAttribute("src", "https://d1xsc8x7nc5q8t.cloudfront.net/images/brewing_xp_mixer.png");
                const notifIcon = elem;
                notifIcon.className = 'w20';

                const notifDivLabel = document.createElement('span');
                notifDivLabel.id = `notification-brewing_mixer_timer-label`;
                notifDivLabel.innerText = " " + timer + " (" +charges+"/5)";
                notifDivLabel.className = 'color-white'

                notifDiv.append(notifIcon, notifDivLabel)
                document.querySelector('#notifications-area').prepend(notifDiv)
                if(mixerUnlocked == 0) {
                    document.querySelector('#brewing_mixer_timer').style.display = "none";
                }
            }

            const brewingTimer = () => {
                var mixerUnlocked = IdlePixelPlus.getVarOrDefault("brewing_xp_mixer_crafted");
                if(mixerUnlocked == 1) {
                    let playerTimer = IdlePixelPlus.getVarOrDefault("playtime", 0, "int");
                    let chargesUsed = IdlePixelPlus.getVarOrDefault("brewing_xp_mixer_used", 0, "int");
                    let chargesLeft = 5 - chargesUsed;
                    let playTimeMod = (1 - ((playerTimer / (86400)) - Math.floor(playerTimer / (86400))));
                    let etaTimerBrew = format_time(playTimeMod*86400);

                    const runBrewingTimer = setInterval(function() {
                        playerTimer = IdlePixelPlus.getVarOrDefault("playtime", 0, "int");
                        chargesUsed = IdlePixelPlus.getVarOrDefault("brewing_xp_mixer_used", 0, "int");
                        chargesLeft = 5 - chargesUsed;
                        playTimeMod = (1 - ((playerTimer / (86400)) - Math.floor(playerTimer / (86400))));
                        etaTimerBrew = format_time(playTimeMod*86400);
                        const brewingLabel = document.querySelector('#notification-brewing_mixer_timer-label')
                        brewingLabel.innerText = ` ${etaTimerBrew} (${chargesLeft}/5)`;
                    }, 1000);

                    addBrewerNotifications(etaTimerBrew, chargesLeft);
                }
            }

            const addMerchantNotifications = () => {
                var merchantTimerCheck = IdlePixelPlus.getVarOrDefault("merchant_timer", 0, "int");
                var merchantUnlocked = IdlePixelPlus.getVarOrDefault("merchant", 0, "int");
                const notifDiv = document.createElement('div');
                notifDiv.id = `notification-merchant_avail`;
                notifDiv.onclick = function () {
                    websocket.send(switch_panels('panel-shop'));
                }
                notifDiv.className='notification hover';
                notifDiv.style='margin-right: 4px; margin-bottom: 4px; display: none';
                notifDiv.style.display = "inline-block";

                var elem = document.createElement("img");
                elem.setAttribute("src", "https://d1xsc8x7nc5q8t.cloudfront.net/images/merchant.png");
                const notifIcon = elem;
                notifIcon.className = "w20";

                const notifDivLabel = document.createElement('span');
                notifDivLabel.id = `notification-merchant_avail-label`;
                notifDivLabel.innerText = ' Merchant Ready';
                notifDivLabel.className = 'color-white'

                notifDiv.append(notifIcon, notifDivLabel)
                document.querySelector('#notifications-area').prepend(notifDiv)
                if(merchantTimerCheck > 0 || merchantUnlocked == 0) {
                    document.querySelector('#notification-merchant_avail').style.display = "none";
                }
            }

            const merchantTimer = () => {
                var merchantUnlocked = IdlePixelPlus.getVarOrDefault("merchant", 0, "int");
                if(merchantUnlocked == 1) {
                    let merchantTiming = IdlePixelPlus.getVarOrDefault("merchant_timer", 0, "int");
                    let etaTimerMerch = format_time(merchantTiming);
                    const runMerchantTimer = setInterval(function() {
                        merchantTiming = IdlePixelPlus.getVarOrDefault("merchant_timer", 0, "int");
                        etaTimerMerch = format_time(merchantTiming);
                        const merchantLabel = document.querySelector('#notification-merchant_avail-label')
                        if(merchantTiming == 0) {
                            merchantLabel.innerText = ` Merchant Ready`;
                            document.querySelector("#notification-merchant_avail").style.display = 'inline-block';
                        }
                        else {
                            document.querySelector("#notification-merchant_avail").style.display = 'none';
                        }
                    }, 1000);

                    addMerchantNotifications(etaTimerMerch);
                }
            }

            const addFurnaceNotification = () => {
                if(IdlePixelPlus.getVarOrDefault("stone_furnace_crafted", 0, "int") == 1) {
                    var furnaceOreType = IdlePixelPlus.getVarOrDefault("furnace_ore_type", "none", "string");
                    var dragFur = IdlePixelPlus.getVarOrDefault("dragon_furnace", 0, "int");
                    var ancFur = IdlePixelPlus.getVarOrDefault("ancient_furnace_crafted", 0, "int");
                    var titFur = IdlePixelPlus.getVarOrDefault("titanium_furnace_crafted", 0, "int");
                    var promFur = IdlePixelPlus.getVarOrDefault("promethium_furnace_crafted", 0, "int");
                    var goldFur = IdlePixelPlus.getVarOrDefault("gold_furnace_crafted", 0, "int");
                    var silvFur = IdlePixelPlus.getVarOrDefault("silver_furnace_crafted", 0, "int");
                    var ironFur = IdlePixelPlus.getVarOrDefault("iron_furnace_crafted", 0, "int");
                    var bronzeFur = IdlePixelPlus.getVarOrDefault("bronze_furnace_crafted", 0, "int");
                    var stoneFur = IdlePixelPlus.getVarOrDefault("stone_furnace_crafted", 0, "int");
                    var furnImg;

                    if(dragFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/dragon_furnace.png";
                    } else if(ancFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/ancient_furnace.png";
                    } else if(titFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/titanium_furnace.png";
                    } else if(promFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/promethium_furnace.png";
                    } else if(goldFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/gold_furnace.png";
                    } else if(silvFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/silver_furnace.png";
                    } else if(ironFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/iron_furnace.png";
                    } else if(bronzeFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/bronze_furnace.png";
                    }  else if(stoneFur == 1) {
                        furnImg = "https://d1xsc8x7nc5q8t.cloudfront.net/images/stone_furnace.png";
                    } else {
                        document.querySelector('#notification-furnace_avail').style.display = 'none';
                    }

                    const notifDiv = document.createElement('div');
                    notifDiv.id = `notification-furnace_avail`;
                    notifDiv.onclick = function () {
                        websocket.send(switch_panels('panel-crafting'));
                    }
                    notifDiv.className='notification hover';
                    notifDiv.style='margin-right: 4px; margin-bottom: 4px; display: none';
                    notifDiv.style.display = "inline-block";

                    var elem = document.createElement("img");
                    elem.setAttribute("src", furnImg);
                    const notifIcon = elem;
                    notifIcon.className = "w20";

                    const notifDivLabel = document.createElement('span');
                    notifDivLabel.id = `notification-furnace_avail-label`;
                    notifDivLabel.innerText = ' Furnace Empty';
                    notifDivLabel.className = 'color-white'

                    notifDiv.append(notifIcon, notifDivLabel)
                    document.querySelector('#notifications-area').prepend(notifDiv)
                    var furnaceNotif = this.getConfig("furnaceEmptyNotification");
                    if(furnaceOreType != "none" || !furnaceNotif) {
                        document.querySelector('#notification-furnace_avail').style.display = 'none';
                    }
                }
            }

            const addRobotNotifications = () => {
                var robotTimerCheck = IdlePixelPlus.getVarOrDefault("robot_wave_timer", 0, "int");
                var robotUnlocked = IdlePixelPlus.getVarOrDefault("robot_crafted", 0, "int");
                const notifDiv = document.createElement('div');
                notifDiv.id = `notification-robot_avail`;
                notifDiv.onclick = function () {
                    websocket.send(Modals.open_robot_waves());
                }
                notifDiv.className='notification hover';
                notifDiv.style='margin-right: 4px; margin-bottom: 4px; display: none';
                notifDiv.style.display = "inline-block";

                var elem = document.createElement("img");
                elem.setAttribute("src", "https://d1xsc8x7nc5q8t.cloudfront.net/images/robot.png");
                const notifIcon = elem;
                notifIcon.className = "w20";

                const notifDivLabel = document.createElement('span');
                notifDivLabel.id = `notification-robot_avail-label`;
                notifDivLabel.innerText = ' Waves Ready';
                notifDivLabel.className = 'color-white'

                notifDiv.append(notifIcon, notifDivLabel)
                document.querySelector('#notifications-area').prepend(notifDiv)
                if(robotTimerCheck > 0 || robotUnlocked == 0) {
                    document.querySelector('#notification-robot_avail').style.display = 'none';
                }
            }

            const robotTimer = () => {
                let robotNotification = false;
                var robotUnlocked = IdlePixelPlus.getVarOrDefault("robot_crafted", 0, "int");
                var thisScript = "";
                if(robotUnlocked == 1) {
                    let robotTiming = IdlePixelPlus.getVarOrDefault("robot_wave_timer", 0, "int");
                    let etaTimerRobot = format_time(robotTiming);
                    const runRobotTimer = setInterval(function() {
                        robotNotification =  IdlePixelPlus.plugins['ui-tweaks'].getConfig("robotReady");
                        robotTiming = IdlePixelPlus.getVarOrDefault("robot_wave_timer", 0, "int");
                        etaTimerRobot = format_time(robotTiming);
                        const robotLabel = document.querySelector('#notification-robot_avail-label')
                        if(robotTiming == 0 && robotNotification) {
                            //console.log(robotNotification);
                            robotLabel.innerText = ` Waves Ready`;
                            document.querySelector("#notification-robot_avail").style.display = 'inline-block';
                        }
                        else {
                            document.querySelector("#notification-robot_avail").style.display = 'none';
                        }
                    }, 1000);

                    addRobotNotifications(etaTimerRobot);
                }
            }

            brewingTimer();
            merchantTimer();
            robotTimer();
            addFurnaceNotification();

            const lootPotAvail = document.querySelector("#notification-loot_pot_avail");
            if (loot_pot == 0) {
                lootPotAvail.style.display = "none";
            } else {
                lootPotAvail.style.display = "inline-block";
            }

            const merchantAvail = document.querySelector("#notification-merchant_avail");
            if(merchantAvail) {
                if (merchantTiming > 0 || merchantUnlocked == 0) {
                    merchantAvail.style.display = "none";
                } else {
                    merchantAvail.style.display = "inline-block";
                }
            }

            const robotAvail = document.querySelector("#notification-robot_avail");
            if(robotAvail) {
                if (robotTiming > 0 || robotUnlocked == 0) {
                    robotAvail.style.display = "none";
                } else {
                    robotAvail.style.display = "inline-block";
                }
            }


            const addPurpleKeyNotifications = () => {
                var purpleKeyUnlocked = IdlePixelPlus.getVarOrDefault("guardian_purple_key_hint", 0, "int");
                const notifDiv = document.createElement('div');
                notifDiv.id = `notification-purple_key`;
                notifDiv.onclick = function () {
                    websocket.send('CASTLE_MISC=guardian_purple_key_hint');
                }
                notifDiv.className='notification hover';
                notifDiv.style='margin-right: 4px; margin-bottom: 4px; display: none';
                notifDiv.style.display = "inline-block";

                var elem = document.createElement("img");
                elem.setAttribute("src", "");
                const notifIcon = elem;
                notifIcon.className = "w20";
                notifIcon.id = `notification-purple_key-image`;
                notifIcon.innerText = '';

                const notifDivImgText = document.createElement('span');
                notifDivImgText.id = `notification-purple_key-image-text`;
                notifDivImgText.innerText = '';
                notifDivImgText.className = 'color-white'

                var elemKey = document.createElement("img");
                elemKey.setAttribute("src", "https://d1xsc8x7nc5q8t.cloudfront.net/images/purple_gaurdian_key.png");
                const notifDivRarityKey = elemKey;
                notifDivRarityKey.className = "w20";
                notifDivRarityKey.id = `notification-purple_key-rarity-img`;
                notifDivRarityKey.style = `transform: rotate(-45deg)`;


                const notifDivRarity = document.createElement('span');
                notifDivRarity.id = `notification-purple_key-rarity`;
                notifDivRarity.innerText = 'Purple Key Info Loading';
                notifDivRarity.className = 'color-white'

                const notifDivTime = document.createElement('span');
                notifDivTime.id = `notification-purple_key-time`;
                notifDivTime.innerText = '';
                notifDivTime.className = 'color-white'

                notifDiv.append(notifIcon, notifDivImgText, notifDivRarityKey, notifDivRarity, notifDivTime)
                document.querySelector('#notifications-area').prepend(notifDiv)
                if(purpleKeyUnlocked == 0) {
                    document.querySelector('#notification-purple_key').style.display = 'none';
                } else {
                    document.querySelector('#notification-purple_key').style.display = 'inline-block';
                }
            };

            addPurpleKeyNotifications();

            this.miningMachTimer();
            // fix chat
            purpleKeyGo = this.getConfig("showPurpleKeyNotification");

            this.onConfigsChanged();

            const style = document.createElement('style');
            style.id = 'styles-ui-tweaks';
            style.textContent = `
            <style id="styles-ui-tweaks">
            #chat-top {
              display: flex;
              flex-direction: row;
              justify-content: left;
            }
            #chat-top > button {
              margin-left: 2px;
              margin-right: 2px;
              white-space: nowrap;
            }
            #content.side-chat {
              display: grid;
              column-gap: 0;
              row-gap: 0;
              grid-template-columns: 2fr minmax(300px, 1fr);
              grid-template-rows: 1fr;
            }
            #content.side-chat #game-chat {
              max-height: calc(100vh - 32px);
            }
            #content.side-chat #game-chat > :first-child {
              display: grid;
              column-gap: 0;
              row-gap: 0;
              grid-template-columns: 1fr;
              grid-template-rows: auto 1fr auto;
              height: calc(100% - 16px);
            }
            #content.side-chat #chat-area {
              height: auto !important;
            }
    	    .farming-patches-area.condensed {
	    	  display: flex;
		      flex-direction: row;
    		  justify-items: flex-start;
    		  width: fit-content;
    	    }
    	    .farming-patches-area.condensed > span {
    		  width: 100px;
    		  max-height: 200px;
    		  border: 1px solid green;
    	    }
    	    .farming-patches-area.condensed img {
    		  width: 100px;
    	    }
	    	#panel-gathering .gathering-box.condensed {
		      height: 240px;
		      position: relative;
              margin: 4px auto;
              padding-left: 4px;
              padding-right: 4px;
		    }
		    #panel-gathering .gathering-box.condensed img.gathering-area-image {
		      position: absolute;
		      top: 10px;
		      left: 10px;
		      width: 68px;
		      height: 68px;
		    }
		    #panel-gathering .gathering-box.condensed br:nth-child(2),
		    #panel-gathering .gathering-box.condensed br:nth-child(3)
		    {
		      display: none;
		    }
            #panel-mining.add-arrow-controls itembox {
              position: relative;
            }
            #panel-mining:not(.add-arrow-controls) itembox .arrow-controls {
              display: none !important;
            }
            itembox .arrow-controls {
              position: absolute;
              top: 0px;
              right: 2px;
              height: 100%;
              padding: 2px;
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              align-items: center;
            }
            itembox .arrow {
              border: solid white;
              border-width: 0 4px 4px 0;
              display: inline-block;
              padding: 6px;
              cursor: pointer;
              opacity: 0.85;
            }
            itembox .arrow:hover {
              opacity: 1;
              border-color: yellow;
            }
            itembox .arrow.up {
              transform: rotate(-135deg);
              -webkit-transform: rotate(-135deg);
              margin-top: 3px;
            }
            itembox .arrow.down {
              transform: rotate(45deg);
              -webkit-transform: rotate(45deg);
              margin-bottom: 3px;
            }
            </style>
            `;

            document.head.appendChild(style);

            //Left menu energy info
            const menuBarEnergy = document.getElementById('menu-bar-energy');
            const menuBarFightPoints = document.createElement('span');
            menuBarFightPoints.id = 'menu-bar-fight-points'
            menuBarFightPoints.innerHTML = `
              (<span class="fight-points-full-timmer" id="fight-points-full-id-menu"></span>)
            `;

            const menuBarFightPoints_2 = document.createElement('span');
            menuBarFightPoints_2.id = 'menu-bar-fight-points'
            menuBarFightPoints_2.innerHTML = `
              (<span class="fight-points-full-timmer" id="fight-points-full-id-menu_2"></span>)
            `;

            document.getElementById('menu-bar-fp').insertAdjacentElement("beforeend", menuBarFightPoints);
            document.getElementById('menu-bar-fp-2').insertAdjacentElement("beforeend", menuBarFightPoints_2);

            const menuBarCrystals = document.getElementById('menu-bar-crystals');

            // "Moon & Sun Distance Info
            const rocketInfoSideCar = document.createElement('div');
            rocketInfoSideCar.id = 'rocket-info-side_car';
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

            document.getElementById("game-menu-bar-skills").insertAdjacentElement("beforebegin", rocketInfoSideCar);


            // "Current Rocket Info" side car
            const rocketInfoSideCarElement = document.getElementById('rocket-info-side_car');

            // Append HTML after #rocket-info-side_car
            const currentRocketInfo = document.createElement('div');
            currentRocketInfo.id = 'current-rocket-info'
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
            rocketInfoSideCarElement.parentNode.insertBefore(currentRocketInfo, rocketInfoSideCarElement.nextSibling);

            const elementsToHide = [
                'moon-mega-rocket-img',
                'sun-rocket-img',
                'moon-rocket-img',
                'menu-bar-rocket_moon .moon-landed',
                'menu-bar-rocket_sun .sun-landed'
            ];

            elementsToHide.forEach((elementId) => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.style.display = 'none';
                }
            });

            const currentRocketInfoElement = document.getElementById('current-rocket-info');
            if (currentRocketInfoElement) {
                currentRocketInfoElement.style.display = 'none';
            }

            // SD Watch Left Side

            const sdWatchElement = document.createElement('span');
            sdWatchElement.innerHTML = `<br>
  <span onClick="websocket.send(Modals.clicks_stardust_watch())" id="menu-bar-sd_watch" style="margin-left: 20px;">
    <img id="sd-watch-img" class="img-20" src="${IMAGE_URL_BASE}/stardust_watch.png">
    <span class="sd-watch-text" style="padding-left: 20px;">Watch Charges</span>
    (<span class="sd-watch-charges">0</span>)
  </span>
`;
            const sdWatchElement2 = document.createElement('td');
            sdWatchElement2.innerHTML = `
            <div class="top-bar-2-item">
  <span onClick="websocket.send(Modals.clicks_stardust_watch())" id="menu-bar-sd_watch_2">
    <img id="sd-watch-img" class="img-20" src="${IMAGE_URL_BASE}/stardust_watch.png">
    <span class="sd-watch-text">Watch Charges</span>
    (<span class="sd-watch-charges_2">0</span>)
  </span>
  </div>
`;

            document.getElementById('menu-bar-crystals').insertAdjacentElement("beforebegin", sdWatchElement);
            document.getElementById('menu-bar-crystals-2').parentNode.insertAdjacentElement("beforebegin", sdWatchElement2);


            // Left Menu Heat
            /*const menuBarHeat = document.createElement('span');
            menuBarHeat.id = 'menu-bar-heat';
            menuBarHeat.innerHTML = `<img id="sd-heat-img" class="img-20" src="${IMAGE_URL_BASE}/heat.png"><span class="sd-heat-level">0</span>`;
            menuBarHeat.addEventListener('click', function () {
                websocket.send(Modals.clicks_oven());
            });

            // Left Menu Energy
            menuBarFightPoints.parentNode.insertBefore(menuBarHeat, menuBarFightPoints);
            menuBarFightPoints.insertAdjacentHTML('beforebegin', '<br/>');
*/
            const energyItemDisplay = document.querySelector('#menu-bar-hero item-display[data-key="energy"]');

            const menuBarFightPointsCombat = document.createElement('span');
            menuBarFightPointsCombat.id = 'menu-bar-fight-fight-points'
            menuBarFightPointsCombat.innerHTML = `<img id="menu-bar-fight-points-img" class="img-20" src="${IMAGE_URL_BASE}/fight_points.png"><item-display data-format="number" data-key="fight_points"> 0</item-display>(<span class="fight-points-full-timmer" id="fight-points-full-id-combat"></span>)`;

            energyItemDisplay.parentElement.insertBefore(menuBarFightPointsCombat, energyItemDisplay.nextSibling);

            // Find all item-display elements
            const itemDisplayElements = document.querySelectorAll('item-display');

            // Loop through the elements and filter based on text content
            itemDisplayElements.forEach(el => {
                const dataKey = el.getAttribute('data-key');
                if (dataKey && dataKey.endsWith('_xp')) {
                    const parent = el.parentElement;
                    const uiTweaksXpNext = document.createElement('span');
                    uiTweaksXpNext.className = 'ui-tweaks-xp-next';
                    uiTweaksXpNext.innerHTML = '&nbsp;&nbsp;Next Level: ';
                    const itemDisplayNext = document.createElement('item-display');
                    itemDisplayNext.setAttribute('data-format', 'number');
                    itemDisplayNext.setAttribute('data-key', `ipp_${dataKey}_next`);
                    uiTweaksXpNext.appendChild(itemDisplayNext);
                    parent.appendChild(uiTweaksXpNext);
                }
            });

            // machine arrows
            const machineryList = ["drill", "crusher", "giant_drill", "excavator", "giant_excavator", "massive_excavator"];

            machineryList.forEach(machine => {
                const itemBox = document.querySelector(`itembox[data-item=${machine}]`);
                if (itemBox) {
                    const arrowControlsDiv = document.createElement('div');
                    arrowControlsDiv.className = 'arrow-controls';
                    arrowControlsDiv.onclick = function(event) {
                        event.stopPropagation();
                    };

                    const arrowUpDiv = document.createElement('div');
                    arrowUpDiv.className = 'arrow up';
                    arrowUpDiv.onclick = function(event) {
                        event.stopPropagation();
                        IdlePixelPlus.sendMessage(`MACHINERY=${machine}~increase`);
                    };

                    const itemDisplay = document.createElement('item-display');
                    itemDisplay.setAttribute('data-format', 'number');
                    itemDisplay.setAttribute('data-key', `${machine}_on`);
                    itemDisplay.innerHTML = '1';

                    const arrowDownDiv = document.createElement('div');
                    arrowDownDiv.className = 'arrow down';
                    arrowDownDiv.onclick = function(event) {
                        event.stopPropagation();
                        IdlePixelPlus.sendMessage(`MACHINERY=${machine}~decrease`);
                    };

                    arrowControlsDiv.appendChild(arrowUpDiv);
                    arrowControlsDiv.appendChild(itemDisplay);
                    arrowControlsDiv.appendChild(arrowDownDiv);

                    itemBox.appendChild(arrowControlsDiv);
                }
            });

            // custom notifications
            const notificationsArea = document.getElementById('notifications-area');

            if (notificationsArea) {
                const notificationOilFull = document.createElement('div');
                notificationOilFull.id = 'ui-tweaks-notification-oil-full';
                notificationOilFull.style.display = 'none';
                notificationOilFull.classList.add('notification', 'hover');
                notificationOilFull.onclick = function() {
                    switch_panels('panel-mining');
                };

                notificationOilFull.innerHTML = `
        <img src="${IMAGE_URL_BASE}/oil.png" class="w20">
        <span class="font-small color-yellow">Oil Full</span>
    `;

                notificationsArea.appendChild(notificationOilFull);
            }

            const panelMining = document.querySelector('#panel-mining .progress-bar');
            const panelCrafting = document.querySelector('#panel-crafting .progress-bar');

            if (panelMining) {
                const oilSummaryMining = document.createElement('div');
                oilSummaryMining.id = 'oil-summary-mining';
                oilSummaryMining.style.marginTop = '0.5em';

                const oilLabel = document.createElement('strong');
                oilLabel.textContent = 'Oil: ';

                const oilDisplay = document.createElement('item-display');
                oilDisplay.setAttribute('data-format', 'number');
                oilDisplay.setAttribute('data-key', 'oil');

                const maxOilDisplay = document.createElement('item-display');
                maxOilDisplay.setAttribute('data-format', 'number');
                maxOilDisplay.setAttribute('data-key', 'max_oil');

                const inLabel = document.createElement('strong');
                inLabel.textContent = 'In: ';

                const inDisplay = document.createElement('item-display');
                inDisplay.setAttribute('data-format', 'number');
                inDisplay.setAttribute('data-key', 'oil_in');

                const outLabel = document.createElement('strong');
                outLabel.textContent = 'Out: ';

                const outDisplay = document.createElement('item-display');
                outDisplay.setAttribute('data-format', 'number');
                outDisplay.setAttribute('data-key', 'oil_out');

                const deltaLabel = document.createElement('strong');
                deltaLabel.textContent = 'Delta: ';

                const deltaDisplay = document.createElement('item-display');
                deltaDisplay.setAttribute('data-format', 'number');
                deltaDisplay.setAttribute('data-key', 'oil_delta');

                oilSummaryMining.appendChild(oilLabel);
                oilSummaryMining.appendChild(oilDisplay);
                oilSummaryMining.appendChild(document.createTextNode(' / '));
                oilSummaryMining.appendChild(maxOilDisplay);
                oilSummaryMining.appendChild(document.createElement('br'));
                oilSummaryMining.appendChild(inLabel);
                oilSummaryMining.appendChild(document.createTextNode('+'));
                oilSummaryMining.appendChild(inDisplay);
                oilSummaryMining.appendChild(document.createTextNode('\u00A0\u00A0\u00A0'));
                oilSummaryMining.appendChild(outLabel);
                oilSummaryMining.appendChild(document.createTextNode('-'));
                oilSummaryMining.appendChild(outDisplay);
                oilSummaryMining.appendChild(document.createElement('br'));
                oilSummaryMining.appendChild(deltaLabel);
                oilSummaryMining.appendChild(deltaDisplay);

                panelMining.parentNode.insertBefore(oilSummaryMining, panelMining.nextSibling);
            }

            if (panelCrafting) {
                const oilSummaryCrafting = document.createElement('div');
                oilSummaryCrafting.id = 'oil-summary-crafting';
                oilSummaryCrafting.style.marginTop = '0.5em';

                const oilLabel = document.createElement('strong');
                oilLabel.textContent = 'Oil: ';

                const oilDisplay = document.createElement('item-display');
                oilDisplay.setAttribute('data-format', 'number');
                oilDisplay.setAttribute('data-key', 'oil');

                const maxOilDisplay = document.createElement('item-display');
                maxOilDisplay.setAttribute('data-format', 'number');
                maxOilDisplay.setAttribute('data-key', 'max_oil');

                const inLabel = document.createElement('strong');
                inLabel.textContent = 'In: ';

                const inDisplay = document.createElement('item-display');
                inDisplay.setAttribute('data-format', 'number');
                inDisplay.setAttribute('data-key', 'oil_in');

                const outLabel = document.createElement('strong');
                outLabel.textContent = 'Out: ';

                const outDisplay = document.createElement('item-display');
                outDisplay.setAttribute('data-format', 'number');
                outDisplay.setAttribute('data-key', 'oil_out');

                const deltaLabel = document.createElement('strong');
                deltaLabel.textContent = 'Delta: ';

                const deltaDisplay = document.createElement('item-display');
                deltaDisplay.setAttribute('data-format', 'number');
                deltaDisplay.setAttribute('data-key', 'oil_delta');

                oilSummaryCrafting.appendChild(oilLabel);
                oilSummaryCrafting.appendChild(oilDisplay);
                oilSummaryCrafting.appendChild(document.createTextNode(' / '));
                oilSummaryCrafting.appendChild(maxOilDisplay);
                oilSummaryCrafting.appendChild(document.createElement('br'));
                oilSummaryCrafting.appendChild(inLabel);
                oilSummaryCrafting.appendChild(document.createTextNode('+'));
                oilSummaryCrafting.appendChild(inDisplay);
                oilSummaryCrafting.appendChild(document.createTextNode('\u00A0\u00A0\u00A0'));
                oilSummaryCrafting.appendChild(outLabel);
                oilSummaryCrafting.appendChild(document.createTextNode('-'));
                oilSummaryCrafting.appendChild(outDisplay);
                oilSummaryCrafting.appendChild(document.createElement('br'));
                oilSummaryCrafting.appendChild(deltaLabel);
                oilSummaryCrafting.appendChild(deltaDisplay);

                panelCrafting.parentNode.insertBefore(oilSummaryCrafting, panelCrafting.nextSibling);
            }

            document.querySelector("#notification-furnace-label").insertAdjacentHTML('afterend', '<span id="notification-furnace-timer" class="font-small color-white"></span>');
            document.querySelector("#notification-rocket-label").insertAdjacentHTML('afterend', '<span id="notification-rocket-timer" class="font-small color-white"></span>');
            document.querySelector("#notification-mega_rocket-label").insertAdjacentHTML('afterend', '<span id="notification-mega_rocket-timer" class="font-small color-white"></span>');

            const fishingNetItembox = document.querySelector('itembox[data-item="fishing_net"]');
            if (fishingNetItembox) {
                const heatFishingTab = document.createElement('itembox');
                heatFishingTab.id = 'heat-fishing-tab';
                heatFishingTab.dataset.item = 'heat';
                heatFishingTab.classList.add('shadow', 'hover');
                heatFishingTab.setAttribute('data-bs-toggle', 'tooltip');

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

            // clear chat button
            var chatAutoScrollButton = document.getElementById("chat-auto-scroll-button");
            var chatClearButton = document.createElement("button");
            chatClearButton.id = "chat-clear-button";
            chatClearButton.textContent = "CLEAR";
            chatClearButton.style.color = "green";
            chatClearButton.onclick = function() {
                IdlePixelPlus.plugins['ui-tweaks'].clearChat();
            };

            chatAutoScrollButton.insertAdjacentElement('afterend', chatClearButton);

            // reorganize chat location
            const self = this;
            const chat = document.querySelector("#game-chat > :first-child");
            const chatTop = document.createElement('div');
            chatTop.id = "chat-top";
            const chatArea = document.querySelector("#chat-area");
            const chatBottom = document.querySelector("#game-chat > :first-child > :last-child");

            while (chat.firstChild) {
                chatTop.appendChild(chat.firstChild);
            }

            chat.appendChild(chatTop);
            chat.appendChild(chatArea);
            chat.appendChild(chatBottom);

            // override for service messages
            const original_yell_to_chat_box = Chat.yell_to_chat_box;
            Chat.yell_to_chat_box = function() {
                original_yell_to_chat_box.apply(Chat, arguments);
                self.updateColors();
            }

            var currentFP = IdlePixelPlus.getVarOrDefault("fight_points", 0, "int").toLocaleString();
            var rarePotTimer = IdlePixelPlus.getVarOrDefault("rare_monster_potion_timer", 0, "int");
            var rarePotPlusTimer = IdlePixelPlus.getVarOrDefault("super_rare_monster_potion_timer", 0, "int");
            var rarePotInfo = "";

            if (rarePotTimer > 0) {
                rarePotInfo = rarePotTimer;
            } else if (rarePotPlusTimer > 0) {
                rarePotInfo = rarePotPlusTimer;
            } else {
                rarePotInfo = "Inactive";
            }

            var combatLootPotActive = IdlePixelPlus.getVarOrDefault("combat_loot_potion_active", 0, "int");
            var combatLootPotTimer = IdlePixelPlus.getVarOrDefault("combat_loot_potion_timer", 0, "int");
            var combatLootPotInfo = "";

            if (combatLootPotActive == 1) {
                combatLootPotInfo = "Active";
            } else {
                combatLootPotInfo = "Inactive";
            }

            function createCombatStatEntry(id, imgSrc, imgTitle, text, value) {
                const entry = document.createElement("div");
                entry.className = "td-combat-stat-entry";
                entry.id = id;

                let content;

                if(id == "combat-info-loot_pot-right" || id == "combat-info-loot_pot-left" ) {
                    content = `
                <br>
        <img class="img-15" src="${imgSrc}" title="${imgTitle}">
        <span style="color:white">${text}:</span>
        <span id="${id}-lp">${value}</span>
    `;
                } else if (id == "combat-info-fight_point-right" || id == "combat-info-fight_point-left") {
                    content = `
        <img class="img-15" src="${imgSrc}" title="${imgTitle}">
        <span style="color:white">${text}:</span>
        <span id="${id}-fp">${value}</span>
    `;
                } else {
                    content = `
        <img class="img-15" src="${imgSrc}" title="${imgTitle}">
        <span style="color:white">${text}:</span>
        <span id="${id}-rp">${value}</span>
    `;
                }


                entry.innerHTML = content;
                return entry;
            }

            function insertAfter(newNode, referenceNode) {
                referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            }


            var lastChildInPanel = document.querySelector("#panel-combat-canvas > center > table > tbody > tr:nth-child(2) > td.fight-left-border > div.td-combat-bottom-panel.shadow > div:last-child");
            insertAfter(createCombatStatEntry("combat-info-fight_point-right", "https://d1xsc8x7nc5q8t.cloudfront.net/images/fight_points.png", "fight_points_white-right", "FP", currentFP), lastChildInPanel);
            insertAfter(createCombatStatEntry("combat-info-rare_pot-right", "https://d1xsc8x7nc5q8t.cloudfront.net/images/rare_monster_potion.png", "rare_potion_white-right", "Rare Pot", rarePotInfo), lastChildInPanel);
            insertAfter(createCombatStatEntry("combat-info-loot_pot-right", "https://d1xsc8x7nc5q8t.cloudfront.net/images/combat_loot_potion.png", "combat_loot_potion_white-right", "Loot Pot", combatLootPotInfo), lastChildInPanel);

            var idleHeroArrowsArea = document.querySelector("#menu-bar-idle-hero-arrows-area-2");
            insertAfter(createCombatStatEntry("combat-info-fight_point-left", "https://d1xsc8x7nc5q8t.cloudfront.net/images/fight_points.png", "fight_points_white-left", "FP", currentFP), idleHeroArrowsArea);
            insertAfter(createCombatStatEntry("combat-info-rare_pot-left", "https://d1xsc8x7nc5q8t.cloudfront.net/images/rare_monster_potion.png", "rare_potion_white-left", "Rare Pot", rarePotInfo), idleHeroArrowsArea);
            insertAfter(createCombatStatEntry("combat-info-loot_pot-left", "https://d1xsc8x7nc5q8t.cloudfront.net/images/combat_loot_potion.png", "combat_loot_potion_white-left", "Loot Pot", combatLootPotInfo), idleHeroArrowsArea);

            // Fishing Energy/Heat Info
            const panelFishing = document.querySelector("#panel-fishing");
            const progressBar = panelFishing.querySelector(".progress-bar");

            const hrElement = document.createElement("hr");
            progressBar.insertAdjacentElement('afterend', hrElement);

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

            hrElement.insertAdjacentElement('afterend', containerDiv);

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
            this.calcFishEnergy();
            document.querySelector("#fishing-calculator-div").style.display = "none";

            this.oilTimerNotification();
            setTimeout(function() {
                onLoginLoaded = true;
                const rocket_fuel = IdlePixelPlus.getVarOrDefault("rocket_fuel", 0, "int");
                const rocket_pot_count = IdlePixelPlus.getVarOrDefault("rocket_potion", 0, "int");
                document.querySelector("#rocket-fuel-count").textContent = rocket_fuel;
                document.querySelector("#rocket-pot-count").textContent = rocket_pot_count;
                IdlePixelPlus.plugins['ui-tweaks'].onConfigsChanged();
            }, 20);

            var existingElement = document.getElementById('menu-bar-idlepixelplus-icon').parentNode;

            var newContainer = document.createElement('div');
            newContainer.setAttribute('onclick', "IdlePixelPlus.setPanel('idlepixelplus')");
            newContainer.className = 'hover hover-menu-bar-item left-menu-item';

            // Create the inner table structure
            var table = document.createElement('table');
            table.className = 'game-menu-bar-left-table-btn left-menu-item-other';
            table.style.width = '100%';

            var tbody = document.createElement('tbody');
            var tr = document.createElement('tr');
            var td1 = document.createElement('td');
            td1.style.width = '30px';

            // Assuming there's only one image in the existing element
            var img = existingElement.querySelector('img');
            img.className = 'w30';
            td1.appendChild(img);

            var td2 = document.createElement('td');
            // The text node for 'PLUGINS'
            var textNode = document.createTextNode('PLUGINS');
            td2.appendChild(textNode);

            // Append everything together
            tr.appendChild(td1);
            tr.appendChild(td2);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            newContainer.appendChild(table);

            existingElement.parentNode.replaceChild(newContainer, existingElement);

            if(this.getConfig("condensedUI")) {
                this.condensedUI();
            } else {
                this.defaultUI();
            }

            this.restructureTopBar();
        }
        //////////////////////////////// onLogin End ////////////////////////////////




        clearChat() {
            const chatArea = document.getElementById('chat-area');
            while (chatArea.firstChild) {
                chatArea.removeChild(chatArea.firstChild);
            }
        }

        limitChat() {
            const chatArea = document.getElementById('chat-area');
            const chatLength = chatArea.innerHTML.length;
            const limit = this.getConfig("chatLimit");

            if (limit > 0 || chatLength > 190000) {
                const children = chatArea.children;

                if (limit > 0) {
                    if (children.length > limit) {
                        const toDelete = children.length - limit;

                        for (let i = 0; i < toDelete; i++) {
                            try {
                                chatArea.removeChild(children[i]);
                            } catch (err) {
                                console.error("Error cleaning up chat", err);
                            }
                        }

                        if (Chat._auto_scroll) {
                            chatArea.scrollTop = chatArea.scrollHeight;
                        }
                    }
                }

                if (chatLength > 190000) {
                    for (let i = 0; i < 3; i++) {
                        try {
                            chatArea.removeChild(children[i]);
                        } catch (err) {
                            console.error("Error cleaning up chat", err);
                        }
                    }
                }
            }
        }


        onPanelChanged(panelBefore, panelAfter) {
            this.updateTableCraftLabels();
            this.hideOrbsAndRing();

            if (panelBefore !== panelAfter && panelAfter === "idlepixelplus") {
                const options = document.querySelectorAll("#idlepixelplus-config-ui-tweaks-font option");
                if (options) {
                    options.forEach(function (el) {
                        const value = el.getAttribute("value");
                        if (value === "IdlePixel Default") {
                            el.style.fontFamily = FONT_FAMILY_DEFAULT;
                        } else {
                            el.style.fontFamily = value;
                        }
                    });
                }
            }

            if (["farming", "woodcutting", "combat"].includes(panelAfter) && this.getConfig("imageTitles")) {
                const images = document.querySelectorAll(`#panel-${panelAfter} img`);
                if (images) {
                    images.forEach(function (el) {
                        let src = el.getAttribute("src");
                        if (src && src !== "x") {
                            src = src.replace(/.*\//, "").replace(/\.\w+$/, "");
                            el.setAttribute("title", src);
                        }
                    });
                }
            }

            if (Globals.currentPanel === "panel-fishing") {
                this.calcFishEnergy();
            }
        }


        //////////////////////////////// onVariableSet Start ////////////////////////////////
        onVariableSet(key, valueBefore, valueAfter) {
            if(onLoginLoaded) {
                //console.log(new Date() + " " + document.readyState);
                if (Globals.currentPanel != "panel-combat-canvas") {
                    if(key.endsWith("_on")) {
                        setTimeout(function() {
                            IdlePixelPlus.plugins['ui-tweaks'].miningMachTimer();
                        }, 100);
                    }

                    if(Globals.currentPanel == "panel-brewing") {
                        this.updateTableCraftLabels();
                    }

                    if(key == "oil") {
                        this.oilGain();
                    }

                    if(key.endsWith("_xp")) {
                        const varName = `var_ipp_${key}_next`;
                        const xp = parseInt(valueAfter||'0');
                        const level = xpToLevel(xp);
                        const xpAtNext = LEVELS[level+1];
                        const next = level>=100 ? 0 : xpAtNext-xp;
                        window[varName] = `${next}`;
                    }

                    if(["oil", "max_oil"].includes(key)) {
                        const oil = IdlePixelPlus.getVar("oil");
                        const maxOil = IdlePixelPlus.getVar("max_oil");
                        if(oil && oil==maxOil && this.getConfig("oilFullNotification")) {
                            document.querySelector("#ui-tweaks-notification-oil-full").style.display = '';
                        }
                        else {
                            document.querySelector("#ui-tweaks-notification-oil-full").style.display = 'none'
                        }
                    }

                    if(["oil_in", "oil_out"].includes(key)) {
                        const oilIn = IdlePixelPlus.getVarOrDefault("oil_in", 0, "int");
                        const oilOut = IdlePixelPlus.getVarOrDefault("oil_out", 0, "int");
                        window.var_oil_delta = `${oilIn-oilOut}`;
                    }

                    this.fightPointsFull();

                    if(["furnace_ore_type", "furnace_countdown", "furnace_ore_amount_at"].includes(key)) {
                        const el = document.querySelector("#notification-furnace-timer");
                        const ore = IdlePixelPlus.getVarOrDefault("furnace_ore_type", "none");
                        if(ore == "none") {
                            el.textContent = "";
                            return;
                        }
                        const timerRemaining = IdlePixelPlus.getVarOrDefault("furnace_countdown", 0, "int");
                        const timePerOre = SMELT_TIMES[ore] - 1;
                        const startAmount = IdlePixelPlus.getVarOrDefault("furnace_ore_amount_set", 0, "int");
                        const doneAmount = IdlePixelPlus.getVarOrDefault("furnace_ore_amount_at", 0, "int");
                        const remaining = startAmount - doneAmount - 1;
                        const totalTime = (remaining*timePerOre) + timerRemaining;
                        el.textContent = (" - " + format_time(totalTime));
                    }

                    ////////////////////////////////////// Rocket Info Start

                    if(["rocket_km", "rocket_status"].includes(key) || key.includes("rocket_potion_timer") || key.includes("rocket_fuel") || key.includes("rocket_potion")) {
                        const status = IdlePixelPlus.getVarOrDefault("rocket_status", "none", "string");
                        const km = IdlePixelPlus.getVarOrDefault("rocket_km", 0, "int");
                        var rocket_quest = IdlePixelPlus.getVarOrDefault("junk_planet_quest", 0, "int");
                        var rQComp;
                        if(rocket_quest == -1) {
                            rQComp = 2
                        }
                        else {
                            rQComp = 1
                        }
                        const total = IdlePixelPlus.getVarOrDefault("rocket_distance_required", 0, "int");
                        const rocket_pot = IdlePixelPlus.getVarOrDefault("rocket_potion_timer", 0, "int");
                        const rocket_type = IdlePixelPlus.getVarOrDefault("mega_rocket", 0, "int");
                        const rocket_fuel = IdlePixelPlus.getVarOrDefault("rocket_fuel", 0, "int");
                        const rocket_pot_count = IdlePixelPlus.getVarOrDefault("rocket_potion", 0, "int");
                        const rocket_pot_timer = format_time(rocket_pot);
                        const rocket_speed_moon = rocket_pot * 12 * rQComp;
                        const rocket_speed_sun = rocket_pot * 2400 * rQComp;
                        let pot_diff = "";
                        let pot_diff_mega = "";
                        let label = "";
                        let label_side = "";
                        let label_side_car_dist = "";
                        let label_side_car_eta = "";
                        if(status=="to_moon" || status=="from_moon") {
                            const remaining = status=="to_moon" ? (total-km) / rQComp : km / rQComp;
                            pot_diff = Math.round(remaining / 1.5) - (rocket_pot * 8);
                            let eta = "";
                            if (rocket_pot > 0) {
                                if (rocket_speed_moon <= remaining * rQComp) {
                                    eta = rocket_pot + pot_diff;
                                }
                                else {
                                    eta = Math.round(remaining / 12);
                                }
                            }
                            else {
                                eta = Math.round(remaining / 1.5);
                            }
                            label = format_time(eta);
                            label_side = format_time(eta);
                            if(this.getConfig("rocketETATimer") && !this.getConfig("hideRocketKM")) {
                                label = " - " + label;
                                label_side_car_dist = km.toLocaleString() + "/" + total.toLocaleString();
                                label_side_car_eta = label_side;
                            }
                        }
                        else if(status=="to_sun" || status=="from_sun") {
                            const remaining = status=="to_sun" ? (total-km) / rQComp: km / rQComp;
                            pot_diff_mega = Math.round(remaining / 300) - (rocket_pot * 8);
                            let eta = "";
                            if (rocket_pot > 0) {
                                if (rocket_speed_sun <= (remaining * rQComp)) {
                                    eta = rocket_pot + pot_diff_mega;
                                }
                                else {
                                    eta = Math.round(remaining / 2400);
                                }
                            }
                            else {
                                eta = Math.round(remaining / 300);
                            }
                            label = format_time(eta);
                            label_side = format_time(eta);
                            if(this.getConfig("rocketETATimer") && !this.getConfig("hideRocketKM")) {
                                label = " - " + label;
                                if(km == total) {
                                    label_side_car_dist = "LANDED";
                                } else if(total == 0) {
                                    label_side_car_dist = "ROCKET IS CURRENTLY IDLE";
                                } else {
                                    label_side_car_dist = km.toLocaleString() + "/" + total.toLocaleString();
                                    label_side_car_eta = label_side;
                                }
                            }
                        }

                        //rocket-type
                        if(rocket_type == "1") {
                            document.querySelector("#notification-mega_rocket-timer").textContent = label;
                        }
                        else {
                            document.querySelector("#notification-rocket-timer").textContent = label;
                        }

                        document.querySelector("#current-rocket-travel-distances").textContent = label_side_car_dist;
                        document.querySelector("#current-rocket-travel-times").textContent = label_side_car_eta;
                        document.querySelector("#rocket-fuel-count").textContent = rocket_fuel;
                        document.querySelector("#rocket-pot-count").textContent = rocket_pot_count;
                        document.querySelector("#rocket-pot-timer").textContent = rocket_pot_timer;
                    }
                    ////////////////////////////////////// Rocket Info End

                    ////////////////////////////////////// Rocket Status Start

                    const megaRocketType = IdlePixelPlus.getVarOrDefault("mega_rocket", 0, "int");
                    const rocketStatus = IdlePixelPlus.getVarOrDefault("rocket_status", "");
                    const rocketImage = document.querySelector("img#notification-rocket-image");
                    const moonRocketImage = document.querySelector("img#moon-rocket-img");
                    const sunRocketImage = document.querySelector("img#sun-rocket-img");
                    const menuBarRocketMoon = document.querySelector("#menu-bar-rocket_moon");
                    const menuBarRocketSun = document.querySelector("#menu-bar-rocket_sun");
                    const rocketTypeImgReg = document.querySelector("img#rocket-type-img-reg");
                    const rocketTypeImgMega = document.querySelector("img#rocket-type-img-mega");
                    const rocketCurrentTravelLocationMoon = document.querySelector("img#rocket-current-travel-location-moon");
                    const rocketCurrentTravelLocationSun = document.querySelector("img#rocket-current-travel-location-sun");
                    const rocketTravelDistances = document.querySelector("#current-rocket-travel-distances");

                    //if (key === "rocket_status") {
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
                            setTransform(document.querySelector("#notification-mega_rocket-image"), "rotate(180deg)");
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
                                setTransform(document.querySelector("#moon-mega-rocket-img"), "rotate(180deg)");
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
                            clearTransform(document.querySelector("#notification-mega_rocket-image"));
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

                    const rocket_usable = IdlePixelPlus.getVarOrDefault("rocket_usable", 0, "int");
                    const rocket_travel_check = IdlePixelPlus.getVarOrDefault("rocket_distance_required", 0, "int");
                    const rocket_pot_timer_check = IdlePixelPlus.getVarOrDefault("rocket_potion_timer", 0, "int");
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
                            hideElement(document.getElementById("notification-potion-rocket_potion_timer"));
                        } else if (rocket_pot_timer_check > 0) {
                            showInlineBlockElement(document.getElementById("notification-potion-rocket_potion_timer"));
                            hideElement(document.getElementById("current-rocket-pot-info"));
                        } else {
                            hideElement(document.getElementById("current-rocket-pot-info"));
                        }
                    } else {
                        hideElement(document.getElementById("current-rocket-info"));
                    }

                    if (rocket_travel_check == 0) {
                        document.getElementById("current-rocket-travel-distances").textContent = "Rocket is IDLE";
                        setTransform(document.querySelector("img#rocket-type-img-mega"), "rotate(315deg)");
                        showBlockElement(document.querySelector("img#rocket-type-img-mega"));
                    }

                    if (key == "combat_loot_potion_active") {
                        const loot_pot = IdlePixelPlus.getVarOrDefault("combat_loot_potion_active", 0, "int");
                        if (loot_pot == 0) {
                            hideElement(document.getElementById("notification-loot_pot_avail"));
                        } else {
                            showInlineBlockElement(document.getElementById("notification-loot_pot_avail"));
                        }
                    }

                    ////////// SD Watch Notification
                    const sdWatchCrafted = IdlePixelPlus.getVarOrDefault("stardust_watch_crafted", 0, "int");
                    const sdWatchCharges = IdlePixelPlus.getVarOrDefault("stardust_watch_charges", 0, "int");
                    if (this.getConfig("moveSDWatch") && sdWatchCrafted === 1) {
                        hideElement(document.getElementById("notification-stardust_watch"));
                        document.querySelector("#menu-bar-sd_watch .sd-watch-charges").textContent = sdWatchCharges;
                        document.querySelector("#menu-bar-sd_watch_2 .sd-watch-charges_2").textContent = sdWatchCharges;
                    } else if (!this.getConfig("moveSDWatch") && sdWatchCharges > 0) {
                        showElement(document.getElementById("notification-stardust_watch"));
                    } else {
                        hideElement(document.getElementById("notification-stardust_watch"));
                        hideElement(document.getElementById("menu-bar-sd_watch"));
                    }


                    if(key.startsWith("gathering_working_gathering_loot_bag_")) {
                        var today = new Date();
                        var time = today.getHours().toLocaleString('en-US', {
                            minimumIntegerDigits: 2,
                            useGrouping: false
                        }) + ":" + today.getMinutes().toLocaleString('en-US', {
                            minimumIntegerDigits: 2,
                            useGrouping: false
                        }) + ":" + today.getSeconds().toLocaleString('en-US', {
                            minimumIntegerDigits: 2,
                            useGrouping: false
                        });
                        var location = key.replace("gathering_working_gathering_loot_bag_", "");
                        var bagCount = IdlePixelPlus.getVarOrDefault(key, 0, "int").toLocaleString();
                    }

                    if(key.includes("raw_") || key.includes("cooked_")) {
                        if(Globals.currentPanel == "panel-fishing") {
                            this.calcFishEnergy();
                        }
                    }

                    if(key.endsWith("_xp")) {
                        this.extendedLevelsUpdate();
                    }

                    if(key == 'moon_distance' || key == 'sun_distance') {
                        this.rocketInfoUpdate(key);
                    }

                    const hideBoatNotifications = this.getConfig("hideBoat");
                    const pirate_ship_timer = IdlePixelPlus.getVarOrDefault("pirate_ship_timer", 0, "int");
                    const row_boat_timer = IdlePixelPlus.getVarOrDefault("row_boat_timer", 0, "int");
                    const canoe_boat_timer = IdlePixelPlus.getVarOrDefault("canoe_boat_timer", 0, "int");
                    const stardust_boat_timer = IdlePixelPlus.getVarOrDefault("stardust_boat_timer", 0, "int");
                    const submarine_boat_timer = IdlePixelPlus.getVarOrDefault("submarine_boat_timer", 0, "int");
                    if (hideBoatNotifications) {
                        hideElement(document.getElementById("notification-row_boat"));
                        hideElement(document.getElementById("notification-canoe_boat"));
                        hideElement(document.getElementById("notification-stardust_boat"));
                        hideElement(document.getElementById("notification-pirate_ship"));
                        hideElement(document.getElementById("notification-submarine_boat"));
                    } else {
                        if (row_boat_timer > 0) {
                            showElement(document.getElementById("notification-row_boat"));
                        }
                        if (canoe_boat_timer > 0) {
                            showElement(document.getElementById("notification-canoe_boat"));
                        }
                        if (stardust_boat_timer > 0) {
                            showElement(document.getElementById("notification-stardust_boat"));
                        }
                        if (pirate_ship_timer > 0) {
                            showElement(document.getElementById("notification-pirate_ship"));
                        }
                        if (submarine_boat_timer > 0) {
                            showElement(document.getElementById("notification-submarine_boat"));
                        }
                    }

                    if (key === "furnace_ore_amount_set") {
                        setTimeout(function () {
                            var furnaceOreTypeVar = IdlePixelPlus.getVarOrDefault("furnace_ore_amount_set", 0, "int");
                            var furnaceNotifVar = IdlePixelPlus.plugins['ui-tweaks'].getConfig("furnaceEmptyNotification");

                            if (furnaceOreTypeVar <= 0 && furnaceNotifVar) {
                                document.getElementById('notification-furnace_avail').style.display = "inline-block";
                            } else {
                                hideElement(document.getElementById('notification-furnace_avail'));
                            }
                        }, 500);
                    }

                    if(key.startsWith("nades_purple_key")) {
                        let purpKeyMonst = IdlePixelPlus.getVarOrDefault("nades_purple_key_monster", "", "string");
                        let purpKeyRarity = IdlePixelPlus.getVarOrDefault("nades_purple_key_rarity", "", "string");
                        let purpKeyTimer = IdlePixelPlus.getVarOrDefault("nades_purple_key_timer", 0, "int");

                        onPurpleKey(purpKeyMonst, purpKeyRarity, purpKeyTimer);
                    }

                    if(key === "playtime") {
                        this.updateCrippledToeTimer();
                    }

                }
                ////////// Allowed to Run while in combat
                ////////// Current FP with Timer (Left Sidecar)
                if (Globals.currentPanel == "panel-combat-canvas") {
                    var currentFP = IdlePixelPlus.getVarOrDefault("fight_points", 0, "int").toLocaleString();
                    var rarePotTimer = IdlePixelPlus.getVarOrDefault("rare_monster_potion_timer", 0, "int");
                    var rarePotPlusTimer = IdlePixelPlus.getVarOrDefault("super_rare_monster_potion_timer", 0, "int");
                    var rarePotInfo = "";

                    if (rarePotTimer > 0) {
                        rarePotInfo = rarePotTimer;
                    } else if (rarePotPlusTimer > 0) {
                        rarePotInfo = format_time(rarePotPlusTimer);
                    } else {
                        rarePotInfo = "Inactive";
                    }

                    var combatLootPotActive = IdlePixelPlus.getVarOrDefault("combat_loot_potion_active", 0, "int");
                    var combatLootPotInfo = combatLootPotActive ? "Active" : "Inactive";

                    document.getElementById("combat-info-fight_point-right-fp").textContent = " " + currentFP;
                    document.getElementById("combat-info-fight_point-left-fp").textContent = " " + currentFP;
                    document.getElementById("combat-info-rare_pot-right-rp").textContent = " " + rarePotInfo;
                    document.getElementById("combat-info-rare_pot-left-rp").textContent = " " + rarePotInfo;
                    document.getElementById("combat-info-loot_pot-right-lp").textContent = " " + combatLootPotInfo;
                    document.getElementById("combat-info-loot_pot-left-lp").textContent = " " + combatLootPotInfo;
                }


                function setTransform(element, transformValue) {
                    element.style.transform = transformValue;
                }

                function clearTransform(element) {
                    element.style.transform = "";
                }

                function showInlineBlockElement(element) {
                    element.style.display = "inline-block";
                }

                function showBlockElement(element) {
                    element.style.display = "block";
                }

                function showElement(element) {
                    element.style.display = "";
                }

                function showFlexElement(element) {
                    element.style.display = "block";
                }

                function hideElement(element) {
                    element.style.display = "none";
                }

            }
        }
        //////////////////////////////// onVariableSet end ////////////////////////////////

        rocketInfoUpdate(variable) {
            if (variable == 'moon_distance') {
                var distanceMoon = Number(var_moon_distance);
                document.getElementById("menu-bar-rocket_moon").querySelector(".rocket-dist_moon").textContent = distanceMoon.toLocaleString();
                var goodMoon = Number(this.getConfig("goodMoon"));
                var rocketDistMoonSymbol = document.getElementById("menu-bar-rocket_moon").querySelector(".rocket-dist_moon-symbol");
                rocketDistMoonSymbol.textContent = goodMoon >= distanceMoon ? "🟢" : "🔴";
            } else if (variable == 'sun_distance') {
                var distanceSun = Number(var_sun_distance);
                document.getElementById("menu-bar-rocket_sun").querySelector(".rocket-dist_sun").textContent = distanceSun.toLocaleString();
                var goodSun = Number(this.getConfig("goodSun"));
                var rocketDistSunSymbol = document.getElementById("menu-bar-rocket_sun").querySelector(".rocket-dist_sun-symbol");
                rocketDistSunSymbol.textContent = goodSun >= distanceSun ? "🟢" : "🔴";
            }
        }

        onChat(data) {
            this.updateColors(CHAT_UPDATE_FILTER);
            this.limitChat();
        }

        onCombatEnd() {
            this.updateColors(PANEL_UPDATE_FILTER);
            this.updateColors();
        }
    }


    const elementsWithWidth = document.querySelectorAll('[width]');
    elementsWithWidth.forEach(function(el) {
        el.setAttribute('original-width', el.getAttribute('width'));
    });

    const elementsWithHeight = document.querySelectorAll('[height]');
    elementsWithHeight.forEach(function(el) {
        el.setAttribute('original-height', el.getAttribute('height'));
    });

    const plugin = new UITweaksPlugin();
    IdlePixelPlus.registerPlugin(plugin);

})();