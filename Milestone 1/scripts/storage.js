/* This file is in charge of saving and loading our data using the browser's localStorage. It also checks that an imported
JSON file actually looks like data our app can use */

// These names are used as the "keys" for localStorage, kind of
// like the label on a storage box.
var STORAGE_KEY = "campusPlannerRecords";
var SETTINGS_KEY = "campusPlannerSettings";

// Default settings 
var settings = {
  unit: "minutes",
  theme: "light",
  weeklyCapMinutes: 600
};

// This array holds all of our tasks/records while the app is running.
var records = [];


function loadRecordsFromStorage() {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      records = JSON.parse(saved);
    } catch (err) {
      records = [];
    }
  } else {
    records = getSeedRecords();
    saveRecordsToStorage();
  }
}

function saveRecordsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadSettingsFromStorage() {
  var saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      settings = JSON.parse(saved);
    } catch (err) {
      //keep the defaults if the saved settings are broken
    }
  }
}

function saveSettingsToStorage() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// A small starting list of tasks 
function getSeedRecords() {
  return [
    { id: "rec_0001", title: "Submit chemistry lab report", dueDate: "2026-06-20", duration: 90, tag: "Assignment" },
    { id: "rec_0002", title: "Study Group", dueDate: "2026-06-21", duration: 60, tag: "Study Group" },
    { id: "rec_0003", title: "Quick quick check-in", dueDate: "2026-06-19", duration: 15, tag: "Club" },
    { id: "rec_0004", title: "Robotics club meeting 14:00", dueDate: "2026-06-22", duration: 45, tag: "Club" },
    { id: "rec_0005", title: "Read history chapter 5", dueDate: "2026-06-23", duration: 30, tag: "Reading" }
  ];
}

// Returns an object: true or false
function validateRecordsShape(data) {
  if (!Array.isArray(data)) {
    return { valid: false, message: "the file must contain a list of records." };
  }

  var seenIds = {};

  for (var i = 0; i < data.length; i++) {
    var item = data[i];

    if (!item.id || !item.title || !item.dueDate || item.duration === undefined || !item.tag) {
      return { valid: false, message: "record #" + (i + 1) + " is missing a required field." };
    }
    if (!DATE_REGEX.test(item.dueDate)) {
      return { valid: false, message: "record #" + (i + 1) + " has a badly formatted date." };
    }
    if (seenIds[item.id]) {
      return { valid: false, message: "duplicate id found: " + item.id };
    }
    seenIds[item.id] = true;
  }

  return { valid: true, message: "" };
}