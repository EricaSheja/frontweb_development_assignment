Campus Life Planner

A simple HTML/CSS/JavaScript web app for tracking campus tasks, events, assignments, study sessions, club meetups with durations, tags,
search, sorting, a small stats dashboard, and a weekly time cap. It is built by just plain HTML, CSS,and a few JavaScript files loaded with normal <script> tags.

Theme: Campus Life Planner (records: title, dueDate, duration, tag)

Features

Dashboard: total tasks, total time planned, the most common tag, a simple 7-day "tasks due" bar chart, and a weekly time cap with a message
that warns you if you go over.
Records : shown as a table on bigger screens or as cards on smaall screens
with: 

A search box that works as plain text or as a regular expression, matched against the title, tag, and due date.
A few example search buttons you can click to try it out.
Matching text gets highlighted in yellow using <mark>.
Sort buttons for due date, title, and duration.
Edit (fills in the form) and Delete (asks "are you sure?" first).

Add/Edit form :four fields, each checked with a regular expression before saving, with error messages shown right under the field.
Settings: switch the duration unit between minutes and hours, switch between light/dark theme, change the weekly time cap, and import/export your data as a JSON file.
Saving your data :everything is saved to the browser's localStorage automatically, so your tasks are still there next time you open the page.
Accessibility :skip-to-content link, labels on every form field, error messages announced to screen readers, visible focus outlines, and alayout that adjusts for phone/tablet/desktop screen sizes.

Structure

index.html             The page itself :all 5 sections (About, Dashboard,Records, Add/Edit, Settings)
styles/main.css         All the page's styling, colors, and responsive layout
scripts/
  validators.js         The regex rules + a validate function for each field
  storage.js            Saving/loading data with localStorage, seed data,and checking imported JSON files
  search.js             Searching, highlighting matches, and sorting
  state.js              Adding/editing/deleting records, and the numbers shown on the Dashboard
  ui.js                 Everything that touches the screen: showing sections, drawing the table/cards, button clicks
  main.js               The small file that starts everything when the page loads
seed.json               12 sample records (see "Seed data" below)
tests.html              A test page that loads the real files above and checks their functions give the right answers

How the files talk to each other

This project imports loads the 6 files in scripts/ one after another with <script> tags in index.html, in this exact order:

<script src="scripts/validators.js"></script>
<script src="scripts/storage.js"></script>
<script src="scripts/search.js"></script>
<script src="scripts/state.js"></script>
<script src="scripts/ui.js"></script>
<script src="scripts/main.js"></script>

This order matters, because files like main.js calles in other files so if the order was to be disrupted it would call non existent files

Regex catalog
I'm going to explain the REGEX pattern using a #PurposePatternWhere, where i will say the purpose of the regex, show the regex itself and where it is applied
[it's used1Title: no leading/trailing spaces, not empty/^\S(?:.*\S)?$/TITLE_REGEX in validators.js, used by validateTitle()2Duration: a positive number with up to 2 decimals/^(0|[1-9]\d*)(\.\d{1,2})?$/DURATION_REGEX, used by validateDuration()3Due date: YYYY-MM-DD with a real month/day shape/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/DATE_REGEX, used by validateDate(), followed by isRealCalendarDate() to catch things like Feb 304Tag: letters, spaces, and dashes only/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/TAG_REGEX, used by validateTag()5Back-reference: catches an accidentally repeated word (e.g. "Quick quick check-in")/\b(\w+)\s+\1\b/iDUPLICATE_WORD_REGEX in validators.js — blocks saving the form, and also offered as a search example6Time-token finder (useful in the search box)/\b\d{2}:\d{2}\b/Used directly in the search box and as a preset example button7Tag-filter shortcut, e.g. typing @tag:Studynot a regex — a plain .indexOf() prefix checkgetFilteredRecords() in search.js]

If you type something invalid into the search box (like an unfinished regex,the code catches the error with try/catch in getFilteredRecords() and shows a message instead of crashing the page.


Keyboard map

Everything in the app can be reached and operated without a mouse. This was verified with an actual keyboard-only test pass

KeyWhat it does:
Tab: Moves forward through every interactive element, in this order on a fresh page load: skip link - nav links (About, Dashboard, Records, Add task, Settings) - whatever's interactive in the visible section - footer links.
Shift + TabMoves: moves backward through the same order.
Enter: Activates the focused link or the default action of a focused button (e.g. following a nav link switches sections and moves focus to the new section's heading; submitting the Add/Edit form).
Space: Activates a focused button, most notably the three sort buttons on Records (Due date / Title / Duration), which toggle aria-pressed and re-sort the list, the same as clicking them 
Escape: Not bound to anything custom. Browser default behavior only (e.g. closing a native date picker), so it never interferes with the page.


Form fields are reachable in the same top-to-bottom order they're shown in, and an invalid field receives focus automatically after a failed submit, so you don't have to hunt for which field had the error.
The Import JSON control is a styled <label> wrapping a hidden file input, but it's still fully keyboard-operable: tabbing to it and pressing Enter or Space opens the native file picker, same as clicking it.

Accessibility notes

A "Skip to main content" link appears when you press Tab, letting keyboard users jump past the navigation.
Every form field has a <label> and an error message paragraph right next to it, marked role="alert" so screen readers announce it.
The weekly cap message switches to aria-live="assertive" when you go over the cap, so it interrupts and gets announced right away.
Color contrast: dark charcoal text on a white background, with an emerald-green accent reserved for buttons and links.
Animations are turned off automatically if the visitor's operating system has "reduce motion" turned on.

Data model

Each task/record looks like this in localStorage:

json{
  "id": "rec_0001",
  "title": "Submit chemistry lab report",
  "dueDate": "2026-06-19",
  "duration": 90,
  "tag": "Coursework"
}

duration is always stored in minutes — the Settings page only changes howit's displayed (minutes or hours), not the saved value.

Seed data

seed.json has 12 sample records, including a few edge cases on purpose: a very short task (0.5 minutes), a very long one (480 minutes), a date far inthe future, a title containing a time like "14:00", and one title that
purposely repeats a word ("Quick quick check-in") so you can test the duplicate-word search. Load it from Settings → Import JSON.

Running the tests

tests.html loads the real validators.js, storage.js, and search.js files and runs about 30 simple checks against their actual functions (checks if statements building a list of pass/failresults):

Open tests.html directly in your browser (double-click works fine, or serve it with a local server).
The page lists each check as PASS or FAIL, with a total count at the bottom.

Running the app locally

Double-click index.html, or just put it in a web browser or go live in your VS code

Ideas that can be implemented to make this better (not done yet):

remembering the last search you typed between visits, and letting you export to CSV instead of just JSON.
