# Priority Filter Specification

## Goal

Add a priority filter to the existing equipment request list so managers can quickly focus on requests with a selected priority.

## User Need

Managers need a faster way to find equipment requests that need attention, without leaving the existing request list.

## Functional Rules

* Show all requests when the page first opens.
* Provide an **All** option and an option for each priority level already used by the application.
* When a specific priority is selected, show only requests whose priority matches that level.
* Requests with missing or unrecognized priority values remain visible under **All**, but are excluded from every specific priority filter.
* When no requests match the selected priority, display: “No requests were found.”
* Incomplete request information must not cause the application to crash.
* Selecting a filter changes only which requests are displayed. It must not delete or modify requests.

## Constraints

* The filter belongs on the existing request list; do not require navigation to another page.
* Use the priority levels already present in the application.
* The feature must work without a login or database and continue to work after refreshing the page.
* Preserve all existing requests and their data.
* Limit filtering to priority; no additional sorting or filtering controls are required.

## Acceptance CriteriaS

1. On initial page load, all requests are shown.
2. Selecting each available priority shows only requests with that priority.
3. Requests with missing or unrecognized priorities are shown under **All** and hidden under each specific priority.
4. Selecting **All** after applying a priority filter restores the complete request list.
5. If the selected priority has no matching requests, the page displays “No requests were found.”
6. Requests with incomplete information do not crash the application.
7. Applying filters does not delete or change any request data.
8. After refreshing the page, the application still works and requests remain available without login or a database.
9. When switching from a specific priority filter back to All, every request appears in the same order as before filtering.

## Out of Scope

* Filtering or sorting by status, date, or any field other than priority.
* Adding new priority levels or changing existing priority values.
* Replacing the existing request list with a separate page or view.
* Adding login, database, or other external service requirements.

