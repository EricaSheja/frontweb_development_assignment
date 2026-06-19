/* state.js
This file changes our records array: adding new tasks,editing them, deleting them, and working out the numbers
shown on the Dashboard (totals, top tag, weekly trend)*/

// Remembers if we are editing a record (stores its id) or adding a new one.
var editingId = null;

// Makes a simple unique id like "rec_0006".
function makeNewId() {
  var highestNumber = 0;
  for (var i = 0; i < records.length; i++) {
    var parts = records[i].id.split("_");
    var num = parseInt(parts[1], 10);
    if (!isNaN(num) && num > highestNumber) {
      highestNumber = num;
    }
  }
  var nextNumber = highestNumber + 1;
  var padded = String(nextNumber).padStart(4, "0");
  return "rec_" + padded;
}

// Adds a brand new record to the records array.
function addRecord(title, dueDate, duration, tag) {
  var newRecord = {
    id: makeNewId(),
    title: title,
    dueDate: dueDate,
    duration: duration,
    tag: tag
  };
  records.push(newRecord);
  saveRecordsToStorage();
}

// Updates an existing record that matches the given id.
function updateRecord(id, title, dueDate, duration, tag) {
  for (var i = 0; i < records.length; i++) {
    if (records[i].id === id) {
      records[i].title = title;
      records[i].dueDate = dueDate;
      records[i].duration = duration;
      records[i].tag = tag;
    }
  }
  saveRecordsToStorage();
}

// Removes a record from the records array by id.
function deleteRecordById(id) {
  var newRecordsList = [];
  for (var i = 0; i < records.length; i++) {
    if (records[i].id !== id) {
      newRecordsList.push(records[i]);
    }
  }
  records = newRecordsList;
  saveRecordsToStorage();
}

// Finds one record by id
function findRecordById(id) {
  for (var i = 0; i < records.length; i++) {
    if (records[i].id === id) {
      return records[i];
    }
  }
  return null;
}

// Adds up the total minutes across every record.
function getTotalMinutes() {
  var totalMinutes = 0;
  for (var i = 0; i < records.length; i++) {
    totalMinutes = totalMinutes + records[i].duration;
  }
  return totalMinutes;
}

// Finds which tag shows up the most often.
function getTopTag() {
  var tagCounts = {};
  for (var i = 0; i < records.length; i++) {
    var tag = records[i].tag;
    if (tagCounts[tag]) {
      tagCounts[tag] = tagCounts[tag] + 1;
    } else {
      tagCounts[tag] = 1;
    }
  }

  var topTag = "—";
  var topCount = 0;
  for (var tagName in tagCounts) {
    if (tagCounts[tagName] > topCount) {
      topCount = tagCounts[tagName];
      topTag = tagName;
    }
  }
  return topTag;
}

// Works out how many tasks are due on each of the last 7 days.
// Gives back a list
function getLast7DaysTrend() {
  var today = new Date();
  var dayCounts = [];

  for (var i = 6; i >= 0; i--) {
    var day = new Date(today);
    day.setDate(today.getDate() - i);
    var dayString = day.toISOString().slice(0, 10); // YYYY-MM-DD

    var countForDay = 0;
    for (var j = 0; j < records.length; j++) {
      if (records[j].dueDate === dayString) {
        countForDay = countForDay + 1;
      }
    }
    dayCounts.push({ label: dayString.slice(5), count: countForDay });
  }

  return dayCounts;
}