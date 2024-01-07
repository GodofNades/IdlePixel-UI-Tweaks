// ==UserScript==
// @name         IdlePixel Activity Log Tweaks
// @namespace    godofnades.idlepixel
// @version      0.7.16
// @description  Adds a new activity log to the top next to player count and introduces a new Activity Log modal.
// @author       GodofNades
// @match        *://idle-pixel.com/login/play*
// @grant        none
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @license      MIT
// ==/UserScript==

(function () {
	"use strict";

	let player, storeName, activityLog;
	const dbName = "ActivityLogDB";

	function initDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(dbName, 1);
			request.onerror = (event) => reject(event.target.error);
			request.onsuccess = (event) => resolve(event.target.result);
			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
			};
		});
	}

	async function saveNewData(newData) {
		const db = await initDB();
		const transaction = db.transaction([storeName], "readwrite");
		const store = transaction.objectStore(storeName);
		store.add({newData});
	}

	class UITweaksPlugin extends IdlePixelPlusPlugin {
		constructor() {
			super("actlogtweaks", {
				about: {
					name: `IdlePixel Activity Log Tweaks (ver: 0.7.16)`,
					version: `0.7.16`,
					author: `GodofNades`,
					description: `Adds a new activity log to the top next to player count and introduces a new Activity Log modal.`,
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
			this.activeFilters = new Set([
				"Achievement",
				"Brewing",
				"Combat",
				"Cooking",
				"Crafting",
				"Criptoe",
				"Economy",
				"Farming",
				"Fishing",
				"Gems",
				"Geodes",
				"New Loot",
				"SD Watch",
				"Woodcutting",
				"XP",
			]);
		}

		initStyles() {
			const css = `
          div#al-table-div {
            height: 100%;
            width: 100%;
            overflow-y: scroll;
            max-height: 100%;
            display: block;
            margin:auto;
            border: 1px solid #708090; /* Border around the outside of the table */
          }

          table#al-table-table {
            border-collapse: collapse; /* Changed to collapse for combined borders */
            width: 100%;
            background-color: #000; /* Table background */
          }

          th.al-table-header {
            border: 1px solid #708090; /* Border for th */
            color: white;
            text-align: center;
            padding: 0.5em 1em;
            background-color: black;
          }

          td.al-table-cell {
            border: 1px solid #708090; /* Border for td */
            color: white;
            text-align: center;
            padding: 0.5em 1em;
          }

          th.al-table-header:nth-child(2), td.al-table-cell:nth-child(2) {
            border-left: 1px solid #708090;
            border-right: 1px solid #708090;
          }

          #al-table-table tbody tr:nth-child(odd) {
            background-color: #222;
          }

          #al-table-table tbody tr:nth-child(even) {
            background-color: #333;
          }

          tr.al-table-header-row {
            position: sticky;
            top: 0;
            z-index: 1;
          }
          p.activity-subheader {
            -webkit-text-stroke: 1px #00f7ff;
            font-size: 20pt;
            font-weight: bold;
            text-align: center;
            //background-color: #000;
          }

          td.activity-cell {
            text-align: left;
            width: 50%;
          }

          #filter-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: black;
            padding: 1px;
            border: 1px solid #708090;
            color: white;
            margin-top: 10px;
            margin-bottom: 10px;
          }

          #filter-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
          }

          #filter-box {
            display: grid;
            grid-template-columns: 1fr 1px 1fr;
            grid-gap: 10px;
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 10px;
            text-align: left;
            width: 100%;
            border-top-width: 1px;
            border-top-style: solid;
            border-top-color: #708090;
          }

          .filter-column {
            display: flex;
            flex-direction: column;
          }

          .filter-column label {
            margin-bottom: 5px;
          }

          .vertical-line {
            background-color: #708090;
            width: 1px;
            height: 100%;
          }

          .filter-label {
            display: flex;
            align-items: center; /* Aligns the checkbox and label text vertically */
            margin-right: 5px;
          }

          .category-filter {
            margin-right: 5px; /* Space between the checkbox and the label text */
          }

          .al-button {
            padding: 10px 20px;
            margin: 0 5px;
            border: 1px solid #708090;
            background-color: #333;
            color: white;
            cursor: pointer;
          }

          .al-button:hover {
            background-color: #444;
          }
              `;
			const styleSheet = document.createElement("style");
			styleSheet.innerHTML = css;
			document.head.appendChild(styleSheet);
		}

		createPanel() {
			let alModalHTML = `
        <div id="modal-style-al" style="display: none">
            <div style="position: absolute; top: 0px; left: 0px; width: 98vw; height: 100vh;">
                <div id="al-modal-base_window" style="position: absolute; top: 10vh; left: 25vw; width: 30vw; height: 85vh; text-align: center; border: 1px solid grey; background-color: rgb(0, 0, 0); border-radius: 20px; padding: 20px; z-index: 10000; display: flex; align-items: center; flex-direction: column;">
                    <div id="close-button-al" style="background-color: red; width: 30px; height: 30px; position: absolute; top: 10px; right: 10px; border-radius: 50%; cursor: pointer;">
                        <p style="color: white; font-size: 20px; font-weight: bold; text-align: center; line-height: 30px;">X</p>
                    </div>
                    <br/>
                    <p id="activity-subheader" class="activity-subheader">Your Recent Activity Log <span id="row-count">(0)</span></p>
                    <div id="al-table-div" class="al-table-div">
                      <table id="al-table-table">
                        <thead>
                          <tr class="al-table-header-row">
                            <th class="al-table-header" style="width: 25%">Time</th>
                            <th class="al-table-header" style="width: 25%">Category</th>
                            <th class="al-table-header" style="width: 50%">Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                        <!-- Data rows will be inserted here -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </br>
                </div>
            </div>
    `;

			const contentDiv = document.getElementById("content");
			const modalContainer = document.createElement("div");
			modalContainer.innerHTML = alModalHTML;
			contentDiv.appendChild(modalContainer);

			const onlineCount = document.querySelector(
				".top-bar .gold:not(#top-bar-admin-link)"
			);
			const linkElement = document.createElement("a");
			linkElement.href = "#";
			linkElement.className = "hover float-end link-no-decoration";
			linkElement.title = "Activity Log";
			linkElement.textContent = "Activity" + "\u00A0\u00A0\u00A0";

			onlineCount.insertAdjacentElement("beforebegin", linkElement);

			const modalStyleAL = document.getElementById("modal-style-al");
			const closeButton = document.getElementById("close-button-al");

			linkElement.addEventListener("click", function (event) {
				event.preventDefault();
				modalStyleAL.style.display = "block";
			});

			closeButton.addEventListener("click", function () {
				modalStyleAL.style.display = "none";
			});

			document.addEventListener("keydown", function (event) {
				var chat_focused = $("#chat-area-input").is(":focus");
				if (!chat_focused) {
					// Use the key code for backtick, which is 192
					/*                     if (event.keyCode === 192) {
                        if (modalStyleAL.style.display === 'block') {
                            // Close the modal
                            modalStyleAL.style.display = 'none';
                        } else {
                            // Open the modal
                            modalStyleAL.style.display = 'block';
                        }
                    } */
				}
			});

			// Add an event listener to the modal
			modalStyleAL.addEventListener("click", function (event) {
				// Check if the click happened outside the modal window
				const isClickInside = document
					.getElementById("al-modal-base_window")
					.contains(event.target);

				if (!isClickInside) {
					// If the click is outside, hide the modal
					modalStyleAL.style.display = "none";
				}
			});

			// Stop propagation of the click event from the modal window to the modal background
			document
				.getElementById("al-modal-base_window")
				.addEventListener("click", function (event) {
					event.stopPropagation();
				});

			const colorElements = [
				{
					id: "mainBoxColor",
					label: "Primary Box (Background)",
					default: "#000000",
				},
				{
					id: "boxHeaderColor",
					label: "Header (Text)",
					default: "#00f7ff",
				},
				{
					id: "filterTextClass",
					label: "Checkbox Labels (Text)",
					default: "#ffffff",
				},
			];

			/*colorElements.forEach(colorElement => {
                const colorPicker = this.createColorPicker(colorElement.id, colorElement.label, colorElement.default);
                document.getElementById('al-modal-base_window').appendChild(colorPicker);
            });*/
		}

		/*createColorPicker(id, label, defaultColor) {
            const wrapper = document.createElement('div');
            const pickerLabel = document.createElement('label');
            pickerLabel.setAttribute('for', id);
            pickerLabel.textContent = label;

            const pickerInput = document.createElement('input');
            pickerInput.type = 'color';
            pickerInput.id = id;

            // Load existing color settings or initialize if not present
            const storedColors = localStorage.getItem('activitylog.colors');
            const colors = storedColors ? JSON.parse(storedColors) : {};

            pickerInput.value = colors[id] || defaultColor;

            pickerInput.addEventListener('input', function(event) {
                // Retrieve the latest colors object
                const storedColors = localStorage.getItem('activitylog.colors');
                const currentColors = storedColors ? JSON.parse(storedColors) : {};

                // Update the current color in the colors object
                currentColors[event.target.id] = event.target.value;

                // Apply color changes immediately
                IdlePixelPlus.plugins.actlogtweaks.applyLiveColorPreferences(event.target.id, event.target.value);

                // Save the updated colors object to localStorage
                localStorage.setItem('activitylog.colors', JSON.stringify(currentColors));
            });

            wrapper.appendChild(pickerLabel);
            wrapper.appendChild(pickerInput);
            return wrapper;
        }

        applyColorPreferences() {
            // Load existing color settings or initialize if not present
            const colors = JSON.parse(localStorage.getItem('activitylog.colors')) || {};

            // Apply all color preferences based on the colors object
            for (const id in colors) {
                const color = colors[id];
                // Determine which element the color should be applied to based on the id
                switch (id) {
                    case 'mainBoxColor':
                        document.getElementById('al-modal-base_window').style.backgroundColor = color;
                        break;
                    case 'boxHeaderColor':
                        document.querySelectorAll('.activity-subheader').forEach(element => {
                            element.style.webkitTextStroke = `1px ${color}`;
                        });
                        break;
                    case 'filterTextClass':
                        document.querySelectorAll('.filter-label').forEach(element => {
                            element.style.color = color;
                        });
                        // Add cases for other color IDs as necessary
                }
            }
        }

        applyLiveColorPreferences(id, color) {
            // Apply color preferences based on the passed id and color
            switch (id) {
                case 'mainBoxColor':
                    document.getElementById('al-modal-base_window').style.backgroundColor = color;
                    break;
                case 'boxHeaderColor':
                    document.querySelectorAll('.activity-subheader').forEach(element => {
                        element.style.webkitTextStroke = `1px ${color}`;
                    });
                    break;
                case 'filterTextClass':
                    document.querySelectorAll('.filter-label').forEach(element => {
                        element.style.color = color;
                    });
                    break;
                    // Add cases for other color IDs as necessary
            }
        }*/

		initFilters() {
			const filterContainer = document.createElement("div");
			filterContainer.id = "filter-container";

			const title = document.createElement("div");
			title.id = "filter-title";
			title.textContent = "Filters";
			filterContainer.appendChild(title);

			const filterBox = document.createElement("div");
			filterBox.id = "filter-box";
			filterBox.style.display = "grid";
			filterBox.style.gridTemplateColumns = "repeat(3, 1fr)";
			filterBox.style.gridGap = "10px";
			filterBox.style.padding = "10px";
			filterBox.style.alignItems = "start";
			filterContainer.appendChild(filterBox);

			// Original categories array without "Uncategorized"
			let categories = [
				"Achievement",
				"Brewing",
				"Combat",
				"Cooking",
				"Crafting",
				"Criptoe",
				"Economy",
				"Farming",
				"Fishing",
				"Gems",
				"Geodes",
				"New Loot",
				"SD Watch",
				"Woodcutting",
				"XP",
			];

			// Sort categories alphabetically
			categories.sort();

			// Add "Uncategorized" at the end
			categories.push("Uncategorized");

			// Calculate the number of categories per column
			const perColumn = Math.ceil(categories.length / 3);

			// Create three columns and distribute the sorted categories into them
			for (let i = 0; i < 3; i++) {
				const columnDiv = document.createElement("div");
				columnDiv.className = "filter-column";
				// Apply borders to the middle column
				if (i === 1) {
					columnDiv.style.borderLeft = "1px solid #708090";
					columnDiv.style.borderRight = "1px solid #708090";
					columnDiv.style.paddingLeft = "10px";
				}
				filterBox.appendChild(columnDiv);

				// Slice the sorted categories array to get the categories for this column
				const columnCategories = categories.slice(
					i * perColumn,
					(i + 1) * perColumn
				);
				columnCategories.forEach((category) => {
					const label = document.createElement("label");
					label.className = "filter-label";

					const checkbox = document.createElement("input");
					checkbox.type = "checkbox";
					checkbox.className = "category-filter";
					checkbox.checked = this.activeFilters.has(category);
					checkbox.value = category;

					const labelText = document.createTextNode(category);
					label.appendChild(checkbox);
					label.appendChild(labelText);

					columnDiv.appendChild(label);
				});
			}

			const activitySubheader = document.querySelector(".activity-subheader");
			activitySubheader.parentNode.insertBefore(
				filterContainer,
				activitySubheader.nextSibling
			);

			// Add event listeners to checkboxes
			document.querySelectorAll(".category-filter").forEach((checkbox) => {
				checkbox.addEventListener("change", this.handleFilterChange.bind(this));
			});

			// Create buttons container
			const buttonsContainer = document.createElement("div");
			buttonsContainer.id = "buttons-container";
			buttonsContainer.style.display = "flex";
			buttonsContainer.style.justifyContent = "center";
			buttonsContainer.style.gap = "30px";
			buttonsContainer.style.marginTop = "10px"; // Adjust as needed for spacing
			buttonsContainer.style.marginBottom = "10px"; // Adjust as needed for spacing

			// Create the "All" button
			const allButton = document.createElement("button");
			allButton.textContent = "All";
			allButton.className = "al-button";
			allButton.onclick = () => {
				this.setAllFilters(true);
			};

			// Create the "None" button
			const noneButton = document.createElement("button");
			noneButton.textContent = "None";
			noneButton.className = "al-button";
			noneButton.onclick = () => {
				this.setAllFilters(false);
			};

			// Append buttons to the buttons container
			buttonsContainer.appendChild(allButton);
			buttonsContainer.appendChild(noneButton);

			// Append buttons container after the filterContainer
			filterContainer.after(buttonsContainer);
		}

		setAllFilters(check) {
			// This will either check or uncheck all checkboxes based on the 'check' boolean
			const checkboxes = document.querySelectorAll(".category-filter");
			checkboxes.forEach((checkbox) => {
				checkbox.checked = check;
				// Update activeFilters set based on the 'check' boolean
				if (check) {
					this.activeFilters.add(checkbox.value);
				} else {
					this.activeFilters.delete(checkbox.value);
				}
			});
			// After changing the checkboxes, apply the filters
			this.applyFilters();
		}

		handleFilterChange(event) {
			const category = event.target.value;
			if (event.target.checked) {
				this.activeFilters.add(category);
			} else {
				this.activeFilters.delete(category);
			}
			this.applyFilters();
		}

		applyFilters() {
			const rows = document.querySelectorAll("#al-table-table tbody tr");
			rows.forEach((row, index) => {
				// Reset the display and remove any inline background-color style
				row.style.display = "";
				row.style.backgroundColor = ""; // Clear any inline style

				// Get the category from the cell
				const categoryCellText = row.cells[1].textContent;
				if (
					this.activeFilters.has(categoryCellText) ||
					this.activeFilters.size === 0
				) {
					// Show the row
					row.style.display = "";
				} else {
					// Hide the row
					row.style.display = "none";
				}
			});

			// Reapply the zebra striping
			this.zebraStripeRows();
			this.updateRowCount();
		}

		zebraStripeRows() {
			const visibleRows = document.querySelectorAll(
				'#al-table-table tbody tr:not([style*="display: none"])'
			);
			visibleRows.forEach((row, index) => {
				if (index % 2 === 0) {
					row.style.backgroundColor = "#333"; // Lighter for even rows
				} else {
					row.style.backgroundColor = "#222"; // Darker for odd rows
				}
			});
		}

		updateRowCount() {
			const visibleRows = document.querySelectorAll(
				'#al-table-table tbody tr:not([style*="display: none"])'
			);
			const rowCount = visibleRows.length;
			const rowCountSpan = document.getElementById("row-count");

			// Format the count with commas based on the user's locale
			const formattedCount = rowCount.toLocaleString();
			rowCountSpan.textContent = ` (${formattedCount})`;
		}

		onLogin() {
			websocket.send(ActivityLogger.hide());
			websocket.send((ActivityLogger.forceHide = true));
			this.initStyles();
			this.createPanel();
			this.initFilters();
			player = IdlePixelPlus.getVarOrDefault("username");
			storeName = `${player}.activityLog`;
			const oldData = this.fetchOldData(player);
			const updatedData = this.updateData(oldData);
			this.saveNewData(player, updatedData);
			activityLog =
				JSON.parse(localStorage.getItem(player + ".activityLog")) || [];
			this.displayActivityLog();
			//this.applyColorPreferences()
		}

		determineCategory(message) {
			const categoryPatterns = {
				Achievement: /^You completed the achievement/,
				Brewing: /^(You brew|Not Consumed!)/,
				Combat:
					/^(You (defeated a|died to a)|Tsunami Triggered in Beach|FP REFUNDED|ENERGY REFUNDED)/,
				Cooking: /^You (burnt|successfully cooked)/,
				Crafting: /^You craft/,
				Criptoe: /^Research Points gained:/,
				Economy: /^You sell/,
				Farming: /^((You|Your) (harvest|tool finds a seed)|Instantly grows)/,
				Fishing:
					/^(You just caught a|You caught a|Found 1 Super Bait using Rotten Potion)/,
				Gathering: /^You found a unique gathering item/,
				Gems: /^You find a/,
				Geodes: /^You found a [a-z_]+ geode/,
				"New Loot": /^You looted a new item/,
				"SD Watch": /^SD Watch Charge Used/,
				Woodcutting: /^You chop down/,
				XP: /^(You gain a [a-z_]+ level|You unlocked a new skill|You gained)/,
			};

			for (const [category, pattern] of Object.entries(categoryPatterns)) {
				if (pattern.test(message)) {
					//console.log(message);
					return category;
				}
			}
			//console.log(message);
			return "Uncategorized";
		}

		formatDate() {
			const now = new Date();
			return now.getTime(); // Returns the Unix timestamp
		}

		isUnixTimestamp(timestamp) {
			const numericTimestamp = Number(timestamp);
			return !isNaN(numericTimestamp) && numericTimestamp > 1000000000;
		}

		fetchOldData(player) {
			const oldDataRaw = localStorage.getItem(player + ".activityLog");
			return oldDataRaw ? JSON.parse(oldDataRaw) : [];
		}

		convertToUnix(originalDateString) {
			const date = new Date(originalDateString);
			return date.getTime();
		}

		updateData(data) {
			return data.map((entry) => {
				// Create a new object excluding the category field
				const { category, ...entryWithoutCategory } = entry;

				// Check and convert timestamp if necessary
				if (!this.isUnixTimestamp(entry.timestamp)) {
					const unixTimestamp = this.convertToUnix(entry.timestamp);
					return { ...entryWithoutCategory, timestamp: unixTimestamp };
				}

				return entryWithoutCategory;
			});
		}

		saveNewData(player, newData) {
			localStorage.setItem(player + ".activityLog", JSON.stringify(newData));
		}

		convertUnixToReadable(unixTimestamp) {
			const date = new Date(unixTimestamp);
			const yearFormatter = new Intl.DateTimeFormat(undefined, {
				year: "numeric",
			});
			const monthFormatter = new Intl.DateTimeFormat(undefined, {
				month: "2-digit",
			});
			const dayFormatter = new Intl.DateTimeFormat(undefined, {
				day: "2-digit",
			});
			const hourFormatter = new Intl.DateTimeFormat(undefined, {
				hour: "2-digit",
				hour12: false,
			});
			const minuteFormatter = new Intl.DateTimeFormat(undefined, {
				minute: "2-digit",
			});
			const secondFormatter = new Intl.DateTimeFormat(undefined, {
				second: "2-digit",
			});

			const year = yearFormatter.format(date);
			const month = monthFormatter.format(date);
			const day = dayFormatter.format(date);
			let hour = hourFormatter.format(date);
			let minute = minuteFormatter.format(date);
			let second = secondFormatter.format(date);

			hour = hour.padStart(2, "0");
			minute = minute.padStart(2, "0");
			second = second.padStart(2, "0");

			const formattedDate = `${year}/${month}/${day} ${hour}:${minute}:${second}`;
			return formattedDate;
		}

		buildActivityLog(time, category, message, color) {
			const tr = document.createElement("tr");
			const tdTimestamp = document.createElement("td");
			tdTimestamp.className = "al-table-cell";
			tdTimestamp.style.color = color;
			tdTimestamp.textContent = this.convertUnixToReadable(time);

			const tdCategory = document.createElement("td");
			tdCategory.className = "al-table-cell";
			tdCategory.style.color = color;
			tdCategory.textContent = category;

			const tdMessage = document.createElement("td");
			tdMessage.className = "al-table-cell activity-cell";
			tdMessage.style.color = color;
			tdMessage.style.fontWeight = "bold";
			tdMessage.textContent = message;

			tr.appendChild(tdTimestamp);
			tr.appendChild(tdCategory);
			tr.appendChild(tdMessage);

			const tableBody = document.querySelector("#al-table-table tbody");

			// Insert the new row at the top of the table body
			if (tableBody.firstChild) {
				tableBody.insertBefore(tr, tableBody.firstChild);
			} else {
				tableBody.appendChild(tr);
			}

			// Construct the new log entry
			activityLog.unshift({
				timestamp: time,
				message: message,
				color: color,
			});
			// Trim the activityLog array to 1000 entries if necessary
			if (activityLog.length > 250) {
				activityLog.length = 250;
			}
			// Store the updated activityLog array in localStorage
			localStorage.setItem(
				player + ".activityLog",
				JSON.stringify(activityLog)
			);
			// Update the table with the new log entry
			//this.displayActivityLog();

			const newLogEntry = {
				timestamp: time,
				category: category,
				message: message,
				color: color,
			};

			saveNewData(newLogEntry);

			this.applyFilters();
		}

		displayActivityLog() {
			// Retrieve the stored log
			let activityLog =
				JSON.parse(localStorage.getItem(player + ".activityLog")) || [];

			// Get the table body where logs should be displayed
			const tableBody = document.querySelector("#al-table-table tbody");

			// Clear any existing rows in the table body
			tableBody.innerHTML = "";

			// Loop through each log entry and add it to the table
			activityLog.forEach((logEntry) => {
				let category = this.determineCategory(logEntry.message);
				const tr = document.createElement("tr");

				const tdTimestamp = document.createElement("td");
				tdTimestamp.className = "al-table-cell";
				tdTimestamp.style.color = logEntry.color;
				tdTimestamp.textContent = this.convertUnixToReadable(
					logEntry.timestamp
				);

				const tdCategory = document.createElement("td");
				tdCategory.className = "al-table-cell";
				tdCategory.style.color = logEntry.color;
				tdCategory.textContent = category;

				const tdMessage = document.createElement("td");
				tdMessage.className = "al-table-cell activity-cell";
				tdMessage.style.color = logEntry.color;
				tdMessage.textContent = logEntry.message;

				tr.appendChild(tdTimestamp);
				tr.appendChild(tdCategory);
				tr.appendChild(tdMessage);

				// Add the new row to the table body
				tableBody.appendChild(tr);
			});
			this.updateRowCount();
		}

		onVariableSet(key, valueBefore, valueAfter) {
			if (
				key === "researcher_points" &&
				valueBefore &&
				valueBefore != valueAfter
			) {
				let timestamp = this.formatDate();
				this.buildActivityLog(
					timestamp,
					"Criptoe",
					`Research Points gained: ${(
						valueAfter - valueBefore
					).toLocaleString()}`,
					"green"
				);
			}
		}

		onMessageReceived(data) {
			if (data.startsWith("ACTIVITY_LOG=")) {
				data = data.replaceAll("ACTIVITY_LOG=", "");
				let messageSplit = data.split("~");
				let message = messageSplit[0];
				let color = messageSplit[1];
				const timestamp = this.formatDate();
				let category = this.determineCategory(message);

				this.buildActivityLog(timestamp, category, message, color);
			}
			if (data.startsWith("SCROLL_TOAST")) {
				// SCROLL_TOAST=images/badge_10_percent_fp.png~yellow~FP REFUNDED
				// SCROLL_TOAST=images/badge_10_percent_energy.png~red~ENERGY REFUNDED
				let messageSplit = data.split("~");
				let message = messageSplit[2];
				if (message == "1") {
					message = "Found 1 Super Bait using Rotten Potion";
				}
				if (message == "Completed!") {
					message = "SD Watch Charge Used!";
				}
				let color = "white";
				const timestamp = this.formatDate();
				let category = this.determineCategory(message);

				if (message != "UNSET CHAT TAG" && message == "UNSET SIGIL") {
					this.buildActivityLog(timestamp, category, message, color);
				}
			}
			//TSUNAMI_ANIMATE
			if (data == "TSUNAMI_ANIMATE") {
				// SCROLL_TOAST=images/badge_10_percent_fp.png~yellow~FP REFUNDED
				// SCROLL_TOAST=images/badge_10_percent_energy.png~red~ENERGY REFUNDED
				let message = "Tsunami Triggered in Beach";
				let color = "white";
				const timestamp = this.formatDate();
				let category = this.determineCategory(message);

				this.buildActivityLog(timestamp, category, message, color);
			}
		}
	}

	const plugin = new UITweaksPlugin();
	IdlePixelPlus.registerPlugin(plugin);
})();
