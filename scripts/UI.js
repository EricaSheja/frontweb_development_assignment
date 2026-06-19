/* ui.js
This file is in charge of everything on the screen: showing sections, drawing the table/cards, handling clicks, andreading/writing the form. It uses the functions and
variables from validators.js, storage.js, search.js, and state.js */

function initUI() {
  setupNavigation();
  setupForm();
  setupSearchAndSort();
  setupSettingsPage();
  setupImportExport();
  applyTheme();
  renderEverything();
}

// NAVIGATION BETWEEN SECTIONS

function setupNavigation() {
  var navLinks = document.querySelectorAll(".nav-link");

  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function (event) {
      event.preventDefault();
      var targetId = event.target.getAttribute("href").replace("#", "");
      showSection(targetId);

      // update which link looks "active"
      for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].removeAttribute("aria-current");
      }
      event.target.setAttribute("aria-current", "page");
    });
  }

  // Also handle links inside the page
  var innerLinks = document.querySelectorAll('a[href^="#"]');
  for (var k = 0; k < innerLinks.length; k++) {
    innerLinks[k].addEventListener("click", function (event) {
      var href = event.target.getAttribute("href");
      if (href && href.indexOf("#") === 0 && href.length > 1) {
        event.preventDefault();
        showSection(href.replace("#", ""));
      }
    });
  }
}

function showSection(sectionId) {
  var allSections = document.querySelectorAll("main > section");
  for (var i = 0; i < allSections.length; i++) {
    allSections[i].hidden = true;
  }

  var target = document.getElementById(sectionId);
  if (target) {
    target.hidden = false;
    target.focus();
  }

  // Re-render the dashboard or records every time someone visits that section.
  if (sectionId === "dashboard") {
    renderDashboard();
  }
  if (sectionId === "records") {
    renderRecordsList();
  }
}

// THE ADD / EDIT FORM


function setupForm() {
  var form = document.getElementById("record-form");
  var cancelBtn = document.getElementById("form-cancel-edit-btn");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    handleFormSubmit();
  });

  cancelBtn.addEventListener("click", function () {
    resetForm();
  });
}

function handleFormSubmit() {
  // Read the values straight from the inputs.
  var title = document.getElementById("field-title").value.trim();
  var dueDate = document.getElementById("field-duedate").value.trim();
  var durationText = document.getElementById("field-duration").value.trim();
  var tag = document.getElementById("field-tag").value.trim();

  // Clear old error messages first.
  clearFormErrors();

  var isValid = true;

  // Each validate function comes from validators.js and gives back
  var titleResult = validateTitle(title);
  if (!titleResult.valid) {
    showFieldError("error-title", "field-title", titleResult.message);
    isValid = false;
  }

  var dateResult = validateDate(dueDate);
  if (!dateResult.valid) {
    showFieldError("error-duedate", "field-duedate", dateResult.message);
    isValid = false;
  }

  var durationResult = validateDuration(durationText);
  if (!durationResult.valid) {
    showFieldError("error-duration", "field-duration", durationResult.message);
    isValid = false;
  }

  var tagResult = validateTag(tag);
  if (!tagResult.valid) {
    showFieldError("error-tag", "field-tag", tagResult.message);
    isValid = false;
  }

  if (!isValid) {
    // Move focus to the first field that has an error
    var firstError = document.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  // if everything passed, either update the existing record or add a new one.
  var durationNumber = parseFloat(durationText);

  if (editingId) {
    updateRecord(editingId, title, dueDate, durationNumber, tag);
    announce("Task updated.");
  } else {
    addRecord(title, dueDate, durationNumber, tag);
    announce("Task added.");
  }

  resetForm();
  showSection("records");
  renderRecordsList();
  renderDashboard();
}

function showFieldError(errorElementId, inputElementId, message) {
  document.getElementById(errorElementId).textContent = message;
  document.getElementById(inputElementId).setAttribute("aria-invalid", "true");
}

function clearFormErrors() {
  var errorParagraphs = document.querySelectorAll(".field-error");
  for (var i = 0; i < errorParagraphs.length; i++) {
    errorParagraphs[i].textContent = "";
  }
  var inputs = document.querySelectorAll("#record-form input");
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].setAttribute("aria-invalid", "false");
  }
}

function resetForm() {
  document.getElementById("record-form").reset();
  document.getElementById("field-id").value = "";
  clearFormErrors();
  editingId = null;
  document.getElementById("form-heading").textContent = "Add a task";
  document.getElementById("form-submit-btn").textContent = "Add task";
  document.getElementById("form-cancel-edit-btn").hidden = true;
}

function startEditingRecord(id) {
  var recordToEdit = findRecordById(id);
  if (!recordToEdit) {
    return;
  }

  editingId = id;
  document.getElementById("field-id").value = id;
  document.getElementById("field-title").value = recordToEdit.title;
  document.getElementById("field-duedate").value = recordToEdit.dueDate;
  document.getElementById("field-duration").value = recordToEdit.duration;
  document.getElementById("field-tag").value = recordToEdit.tag;

  document.getElementById("form-heading").textContent = "Edit task";
  document.getElementById("form-submit-btn").textContent = "Save changes";
  document.getElementById("form-cancel-edit-btn").hidden = false;

  showSection("add-edit");
}

function deleteRecord(id) {
  var sure = confirm("Are you sure you want to delete this task?");
  if (!sure) {
    return;
  }

  deleteRecordById(id);
  renderRecordsList();
  renderDashboard();
  announce("Task deleted.");
}

// SEARCH AND SORT CONTROLS

function setupSearchAndSort() {
  var searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    renderRecordsList();
  });

  var caseToggle = document.getElementById("search-case-toggle");
  caseToggle.addEventListener("change", function () {
    renderRecordsList();
  });

  var sortButtons = document.querySelectorAll(".btn-sort");
  for (var i = 0; i < sortButtons.length; i++) {
    sortButtons[i].addEventListener("click", function (event) {
      var field = event.currentTarget.getAttribute("data-sort-field");

      if (currentSortField === field) {
        // clicking the same button again flips the direction
        currentSortIsAscending = !currentSortIsAscending;
      } else {
        currentSortField = field;
        currentSortIsAscending = true;
      }

      // update the little arrows / pressed state on the buttons
      for (var j = 0; j < sortButtons.length; j++) {
        sortButtons[j].setAttribute("aria-pressed", "false");
      }
      event.currentTarget.setAttribute("aria-pressed", "true");

      renderRecordsList();
    });
  }

  // Quick example search buttons
  var presetList = [
    { label: "Tag: Study", pattern: "@tag:Study" },
    { label: "Has a time (14:00)", pattern: "\\b\\d{2}:\\d{2}\\b" },
    { label: "Repeated word", pattern: "\\b(\\w+)\\s+\\1\\b" }
  ];
  var presetContainer = document.getElementById("search-presets");
  for (var p = 0; p < presetList.length; p++) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip";
    chip.textContent = presetList[p].label;
    chip.setAttribute("data-pattern", presetList[p].pattern);
    chip.addEventListener("click", function (event) {
      document.getElementById("search-input").value = event.target.getAttribute("data-pattern");
      renderRecordsList();
    });
    presetContainer.appendChild(chip);
  }
}

// RENDERING (drawing data onto the page)

function renderEverything() {
  renderDashboard();
  renderRecordsList();
}

function renderRecordsList() {
  var searchText = document.getElementById("search-input").value.trim();
  var caseInsensitive = document.getElementById("search-case-toggle").checked;

  var filtered = getFilteredRecords(searchText, caseInsensitive);
  var sorted = sortRecordsList(filtered);

  var tbody = document.getElementById("records-tbody");
  var cardList = document.getElementById("records-cards");
  var emptyState = document.getElementById("empty-state");
  var statusBox = document.getElementById("results-status");

  tbody.innerHTML = "";
  cardList.innerHTML = "";

  if (sorted.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  statusBox.textContent = sorted.length + " task" + (sorted.length === 1 ? "" : "s") + " shown.";

  for (var i = 0; i < sorted.length; i++) {
    var record = sorted[i];
    var highlightedTitle = highlightMatch(record.title, searchText, caseInsensitive);

    // --- table row (desktop) ---
    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" + highlightedTitle + "</td>" +
      "<td class='mono'>" + escapeHtml(record.dueDate) + "</td>" +
      "<td class='mono'>" + record.duration + " min</td>" +
      "<td><span class='tag-pill'>" + escapeHtml(record.tag) + "</span></td>" +
      "<td class='actions-cell'></td>";

    var actionsCell = row.querySelector(".actions-cell");
    actionsCell.appendChild(makeEditButton(record.id));
    actionsCell.appendChild(makeDeleteButton(record.id));
    tbody.appendChild(row);

    // --- card (mobile) ---
    var card = document.createElement("li");
    card.className = "record-card";
    card.innerHTML =
      "<h3>" + highlightedTitle + "</h3>" +
      "<p class='record-card-meta mono'>" + escapeHtml(record.dueDate) + " &middot; " + record.duration + " min</p>" +
      "<span class='tag-pill'>" + escapeHtml(record.tag) + "</span>";

    var cardActions = document.createElement("div");
    cardActions.className = "actions-cell";
    cardActions.appendChild(makeEditButton(record.id));
    cardActions.appendChild(makeDeleteButton(record.id));
    card.appendChild(cardActions);

    cardList.appendChild(card);
  }
}

function makeEditButton(id) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-small btn-edit";
  btn.textContent = "Edit";
  btn.addEventListener("click", function () {
    startEditingRecord(id);
  });
  return btn;
}

function makeDeleteButton(id) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-small btn-delete";
  btn.textContent = "Delete";
  btn.addEventListener("click", function () {
    deleteRecord(id);
  });
  return btn;
}

function renderDashboard() {
  // Total number of tasks.
  document.getElementById("stat-total").textContent = records.length;

  // Total minutes planned, shown in the unit the user picked in Settings.
  var totalMinutes = getTotalMinutes();
  if (settings.unit === "hours") {
    document.getElementById("stat-sum").textContent = (totalMinutes / 60).toFixed(1) + " hrs";
  } else {
    document.getElementById("stat-sum").textContent = totalMinutes + " min";
  }

  document.getElementById("stat-top-tag").textContent = getTopTag();

  renderTrendChart();
  renderCapBar();
}

// Draws a simple bar for each of the last 7 days, showing how many tasks are due that day.
function renderTrendChart() {
  var chartBox = document.getElementById("trend-chart");
  chartBox.innerHTML = "";

  var dayCounts = getLast7DaysTrend();

  var highestCount = 1;
  for (var k = 0; k < dayCounts.length; k++) {
    if (dayCounts[k].count > highestCount) {
      highestCount = dayCounts[k].count;
    }
  }

  for (var m = 0; m < dayCounts.length; m++) {
    var bar = document.createElement("div");
    bar.className = "trend-bar";
    var percentHeight = (dayCounts[m].count / highestCount) * 100;
    bar.style.setProperty("--bar-height", percentHeight + "%");

    var tick = document.createElement("span");
    tick.className = "trend-bar-tick";
    tick.textContent = dayCounts[m].label;
    bar.appendChild(tick);

    bar.title = dayCounts[m].count + " task(s)";
    chartBox.appendChild(bar);
  }
}

// Shows the weekly cap progress bar and an announcement if the user is over the cap.
function renderCapBar() {
  var totalMinutes = getTotalMinutes();
  var cap = settings.weeklyCapMinutes;
  var percent = Math.min((totalMinutes / cap) * 100, 100);

  var fillBar = document.getElementById("cap-bar-fill");
  fillBar.style.width = percent + "%";

  var liveRegion = document.getElementById("cap-live-region");

  if (totalMinutes > cap) {
    fillBar.classList.add("over-cap");
    liveRegion.setAttribute("aria-live", "assertive");
    liveRegion.textContent = "Over your weekly cap! " + totalMinutes + " of " + cap + " minutes planned.";
  } else {
    fillBar.classList.remove("over-cap");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.textContent = totalMinutes + " of " + cap + " minutes planned this week.";
  }
}

// SETTINGS PAGE

function setupSettingsPage() {
  var unitSelect = document.getElementById("settings-unit");
  var themeSelect = document.getElementById("settings-theme");
  var capInput = document.getElementById("settings-cap");

  // Fill the controls with whatever is currently saved.
  unitSelect.value = settings.unit;
  themeSelect.value = settings.theme;
  capInput.value = settings.weeklyCapMinutes;

  unitSelect.addEventListener("change", function () {
    settings.unit = unitSelect.value;
    saveSettingsToStorage();
    renderDashboard();
  });

  themeSelect.addEventListener("change", function () {
    settings.theme = themeSelect.value;
    saveSettingsToStorage();
    applyTheme();
  });

  capInput.addEventListener("change", function () {
    var newCap = parseFloat(capInput.value);
    if (!isNaN(newCap) && newCap > 0) {
      settings.weeklyCapMinutes = newCap;
      saveSettingsToStorage();
      renderDashboard();
    }
  });
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", settings.theme);
}

// IMPORT / EXPORT (working with JSON files)

function setupImportExport() {
  var exportBtn = document.getElementById("export-btn");
  var importInput = document.getElementById("import-input");

  exportBtn.addEventListener("click", function () {
    exportRecordsAsFile();
  });

  importInput.addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (file) {
      importRecordsFromFile(file);
    }
  });
}

function exportRecordsAsFile() {
  var jsonText = JSON.stringify(records, null, 2);
  var blob = new Blob([jsonText], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var link = document.createElement("a");
  link.href = url;
  link.download = "campus-life-planner-export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  document.getElementById("import-status").textContent = "Export started - check your downloads folder.";
}

function importRecordsFromFile(file) {
  var statusBox = document.getElementById("import-status");
  var reader = new FileReader();

  reader.onload = function (event) {
    var importedData;
    try {
      importedData = JSON.parse(event.target.result);
    } catch (err) {
      statusBox.textContent = "That file is not valid JSON.";
      return;
    }

    var checkResult = validateRecordsShape(importedData);
    if (!checkResult.valid) {
      statusBox.textContent = "Import failed: " + checkResult.message;
      return;
    }

    records = importedData;
    saveRecordsToStorage();
    renderRecordsList();
    renderDashboard();
    statusBox.textContent = "Import successful - " + records.length + " task(s) loaded.";
  };

  reader.readAsText(file);
}

// SMALL HELPER FOR SCREEN-READER ANNOUNCEMENTS

function announce(message) {
  var statusBox = document.getElementById("global-status");
  statusBox.textContent = message;
}