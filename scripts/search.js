/* search.js 
This file handles searching, highlighting matches, and sorting the list of records */

// These two variables remember which column we are sorting by and whether it's ascending or descending.
var currentSortField = null;
var currentSortIsAscending = true;

// Prevents user-typed text from being read as HTML tags 
function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Turns the search box text into a list of records that match. Supports a simple "@tag:something" shortcut, otherwise treats the text as regex.
function getFilteredRecords(searchText, caseInsensitive) {
  var errorBox = document.getElementById("search-error");
  errorBox.textContent = "";

  if (searchText === "") {
    return records.slice(); // return a copy of everything
  }

  // Special shortcut: "@tag:Study" only matches records whose tag starts with "Study".
  if (searchText.indexOf("@tag:") === 0) {
    var wantedTag = searchText.slice(5).toLowerCase();
    var tagMatches = [];
    for (var i = 0; i < records.length; i++) {
      if (records[i].tag.toLowerCase().indexOf(wantedTag) === 0) {
        tagMatches.push(records[i]);
      }
    }
    return tagMatches;
  }

  // Otherwise, treat the search text as a regular expression.
  var flags = caseInsensitive ? "i" : "";
  var searchRegex;
  try {
    searchRegex = new RegExp(searchText, flags);
  } catch (err) {
    errorBox.textContent = "That is not a valid search pattern: " + err.message;
    return [];
  }

  var matches = [];
  for (var j = 0; j < records.length; j++) {
    var record = records[j];
    var combinedText = record.title + " " + record.tag + " " + record.dueDate;
    if (searchRegex.test(combinedText)) {
      matches.push(record);
    }
  }
  return matches;
}

// Highlights the part of the text that matched the search, using <mark>.
function highlightMatch(text, searchText, caseInsensitive) {
  if (!searchText || searchText.indexOf("@tag:") === 0) {
    return escapeHtml(text);
  }

  var flags = caseInsensitive ? "gi" : "g";
  var regex;
  try {
    regex = new RegExp(searchText, flags);
  } catch (err) {
    return escapeHtml(text);
  }

  var escapedText = escapeHtml(text);
  return escapedText.replace(regex, function (match) {
    return "<mark>" + escapeHtml(match) + "</mark>";
  });
}

// Sorts a list of records by the field the user picked (title, dueDate, or duration).
function sortRecordsList(list) {
  if (!currentSortField) {
    return list;
  }

  var field = currentSortField;
  var direction = currentSortIsAscending ? 1 : -1;

  list.sort(function (a, b) {
    var valueA = a[field];
    var valueB = b[field];

    if (field === "duration") {
      return (valueA - valueB) * direction;
    }
    // title and dueDate compare fine as text/strings
    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });

  return list;}