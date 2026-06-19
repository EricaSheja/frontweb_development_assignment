/* main.js
This is the file that actually starts the app. It waits for the page to finish loading, then loads our saved data and sets up everything on screen.

This file is loaded LAST after all other js files in index.html,so that all the functions and variables it uses already
exist by the time it runs */

document.addEventListener("DOMContentLoaded", function () {
  try {
    loadSettingsFromStorage();
    loadRecordsFromStorage();
    initUI();
  } catch (err) {
    // If something goes wrong while starting up, show a simple message instead of leaving a blank, broken page.
    console.error("The app failed to start:", err);
    document.body.innerHTML =
      "<p style='padding: 2rem; font-family: sans-serif;'>" +
      "Sorry, something went wrong while loading the app. Please refresh the page." +
      "</p>";
  }
});