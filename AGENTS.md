# AGENTS.md

## Project
Smart Campus Room Availability Checker. A student picks a room from a small fictional catalog and checks whether a time slot is free.
Fictional data only, a user-editable current time (default 08:30) instead of the real clock, an availability decision only.
Catalog: five fictional rooms, per the Assignment #04 scope decision. This overrides any earlier one-room scope.

## Repository map
- src/data/rooms.ts: fictional rooms and bookings (ROOMS, BOOKINGS, bookingsForRoom, findRoom); the only data source
- src/domain/availability.ts: booking rules (checkAvailability, overlaps)
- src/domain/time.ts: time helpers (fmtTime, parseTime, parseInterval)
- src/domain/checkFromInput.ts: parses the two time strings, then calls checkAvailability
- src/domain/roomFilter.ts: capacity and equipment filter (filterRooms)
- src/domain/roomSelection.ts: keeps the selected room only if it is still visible (nextSelectedRoomId)
- src/App.tsx: page state and composition
- src/components/RoomFilters.tsx: attendees input and equipment checkboxes
- src/components/RoomPicker.tsx: room cards with equipment tags
- src/components/Timeline.tsx: booking overview
- src/components/ResultPanel.tsx: availability result
- src/components/BookingsTable.tsx: existing bookings table
- src/types.ts: Room, Booking, CheckRequest, CheckResult
- Tests sit next to their modules: src/App.test.tsx, src/data/rooms.test.ts, src/domain/*.test.ts (7 files)

## Acceptance criteria (preserve exactly)
- AC1: reject start >= end and past requests (start must be strictly after the current time).
- AC2: reject durations longer than 120 minutes. Exactly 120 is allowed.
- AC3: reject a blocked room.
- AC4: reject overlaps; allow bookings touching only at endpoints.
- AC5: return Available / Unavailable without mutating booking data.
- AC6: clear feedback and a usable layout on desktop and narrow/mobile widths.

## New requirements (Assignment 4)
- Catalog of at least FOUR fictional rooms. Each room has id, name, capacity, equipment list, blocked status and its own bookings.
- Show only rooms that satisfy the selected requirements. The check must use the chosen room's bookings only.
- F1: capacity filter: room capacity >= requested attendees.
- F2: equipment filter: the room must contain ALL selected required items.
- F3: a blocked room can never be reported as available.
- F4: show a clear empty state when no room matches.
- F5: changing the selected room must refresh the availability result.

## Forbidden scope changes
No login, payments, live APIs, backend or database. No booking creation. Fictional data only.
No external deployments. Never read, print or commit secret values (.env, keys, tokens).

## Engineering rules
- Propose a small plan before editing. No full rewrite: one change at a time.
- Separate room data, booking rules, filtering logic and UI presentation.
- Prefer pure functions; no patterns or class hierarchies without a concrete need.
- Do not mutate fixtures. Do not weaken or delete existing test assertions.
- After every change: run the tests and list the changed files.

## Commands
- Tests: npx vitest run
- Type check: npm run typecheck
- Build: npm run build
- Lint: npm run lint
- Security: npm audit

## Verification
Never claim a test passed unless it was actually run. Report real command output.
Run the tests before proposing acceptance. AC6 (responsive layout) is not covered by tests; say so explicitly.
Test count: run npx vitest run for the current count.

## Agent boundaries
- Do not publish or deploy.
- Do not add or upgrade dependencies, or run npm audit fix --force, without approval.
- Do not add a database, even if the platform suggests one.

## Review gate
Before a change is accepted, report the diff summary and the real output of tests, typecheck, lint and build. Then wait for human approval.
