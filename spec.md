Milestone 1

Project: Campus Life Planner
Erica Sheja Rurangwa

This document is the planning step before any code was written. It covers
three things: what the screens look like (wireframes), what shape the data
takes, and how the app will be usable by keyboard and
screen-reader users.

1 Wireframes

See wireframe.svg, there there is a sketch of my website It shows two of the
five screens at two different screen widths, since the layout changes
depending on device size:

Mobile screen : has the records screen, stacked nav links, a search box,two sort buttons, and the task list shown as cards (one task per card, with a colored left border and a tag pill).

Desktop: has the dashboard screen, a horizontal nav bar, three stat cards in a row (total tasks, total time, top tag), a 7-day bar chart of upcoming due dates, and a weekly time cap progress bar.

The Records screen is the one place where the layout genuinely changes
shape between breakpoints (cards on mobile, a table on tablet/desktop)
rather than just resizing, so it was the one worth sketching at both sizes.

The other three screens (About, Add/Edit, Settings) are simpler, a single
column of text or form fields, so a sketch wasn't necessary to plan their
layout; they just stack the same way at every screen width.

2 Data model

Each task/event in the planner is stored as one plain object in the json file:
It is stored in this way

{
  "id": "rec_0001",
  "title": "Submit chemistry lab report",
  "dueDate": "2026-06-19",
  "duration": 90,
  "tag": "Coursework"
}


| Field | Type | Notes |
|---|---|---|
| `id` | string | Generated automatically, looks like `rec_0001`, `rec_0002`, ... |
| `title` | string | What the task is. Cannot be empty or have a repeated word. |
| `dueDate` | string | Always `YYYY-MM-DD`. Must be a real calendar date. |
| `duration` | number | Minutes. Always stored in minutes, even if the Settings page is set to display hours. |
| `tag` | string | A single category like "Assignment", "Study Group", or "Club". Letters/spaces/dashes only. |

All records are kept in one JavaScript array and saved to the browser's
local storage as a JSON string under the key CampusPlanner records. A
separate small object holds user settings (display unit, theme, weekly time
cap) under the key campusPlannerSettings.

3 Accessibilty plan

Skip Link: The very first thing a keyboard user can Tab to is a
  "Skip to main content" link, so they don't have to tab through the whole
  nav bar on every page visit.
Labels on every input: Every form field gets a real label for ..., not just a placeholder, so screen readers always announce what the field is for.

The wekkly cap message switches urgencym: It's `aria-live="polite"` normally, but switches to `aria-live="assertive"` the moment the user goes over their weekly time cap, since that's the one update worth interrupting for.

Visible focus outlines on every interactive element (links, buttons,inputs), not just the browser default, so sighted keyboard users can always see where they are.

Anyone whose operating system has reduced motion turned on gets all transitions and the page fade-in animation switched off automatically.

We will verify again veriy everything in the milestone 7 with audit.md