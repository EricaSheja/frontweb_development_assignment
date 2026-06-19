/* This file holds all the regular expressions (regex) we use
   to check that the user typed something valid into the form. */

// Title: cannot be empty and cannot start/end with a space.
var TITLE_REGEX = /^\S(?:.*\S)?$/;

// Looks for the same word repeated right after itself
// \b= word boundary, (\w+)= capture a word, \1= the same word again.
var DUPLICATE_WORD_REGEX = /\b(\w+)\s+\1\b/i;

// Due date must look like YYYY-MM-DD with a real month
var DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Duration must be a positive number, with up to 2 decimal places allowed
var DURATION_REGEX = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Tag can only have letters, spaces, and dashes 
var TAG_REGEX = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;


// Checks that a YYYY-MM-DD string is a real date 
function isRealCalendarDate(dateString) {
  var bits = dateString.split("-");
  var year = parseInt(bits[0], 10);
  var month = parseInt(bits[1], 10);
  var day = parseInt(bits[2], 10);

  var testDate = new Date(year, month - 1, day);
  return (
    testDate.getFullYear() === year &&
    testDate.getMonth() === month - 1 &&
    testDate.getDate() === day
  );
}

// Checks the title field and gives back a result object
// result.valid is true/false, result.message explains why if it failed.
function validateTitle(title) {
  if (!TITLE_REGEX.test(title)) {
    return { valid: false, message: "Title cannot be empty or start/end with a space." };
  }
  if (DUPLICATE_WORD_REGEX.test(title)) {
    return { valid: false, message: "Title has a repeated word (e.g. \"the the\"). Please fix it." };
  }
  return { valid: true, message: "" };
}

// Checks the due date field.
function validateDate(dateString) {
  if (!DATE_REGEX.test(dateString)) {
    return { valid: false, message: "Please enter a valid date in YYYY-MM-DD format." };
  }
  if (!isRealCalendarDate(dateString)) {
    return { valid: false, message: "That date does not exist on the calendar." };
  }
  return { valid: true, message: "" };
}

// Checks the duration field
function validateDuration(durationText) {
  if (!DURATION_REGEX.test(durationText)) {
    return { valid: false, message: "Duration must be a positive number (e.g. 60 or 90.5)." };
  }
  var durationNumber = parseFloat(durationText);
  if (durationNumber <= 0 || durationNumber > 1440) {
    return { valid: false, message: "Duration must be between 1 and 1440 minutes." };
  }
  return { valid: true, message: "" };
}

// Checks the tag field.
function validateTag(tag) {
  if (!TAG_REGEX.test(tag)) {
    return { valid: false, message: "Tag can only contain letters, spaces, and dashes." };
  }
  return { valid: true, message: "" };
}