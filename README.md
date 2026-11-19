# Smart Campus Room Availability Checker

Course project for **AI-Driven Software Engineering** (KBTU), Bakir Didar, 24B031711.
Built with Bolt.new and verified by hand; state after Practice #12 (Bolt Version 23).

- Live demo: https://smart-campus-room-av-omcs.bolt.host
- Stack: Vite 5, React 18, TypeScript, Tailwind CSS, Vitest 3 (+ jsdom, React Testing Library)

A student sets the number of attendees and the required equipment, picks one of five fictional rooms, enters a
time interval and gets **Available** or **Unavailable** with the reasons. An optional **Explain availability** button
gives a short explanation of that decision through a clearly labelled **mock** LLM adapter. The deterministic checker
is the only source of the decision; the explanation can never change it. Fictional data only: no login, backend,
database, API keys or booking creation.

## Setup and run
```
npm install
npm run dev
```
Open http://localhost:5173/.

## Checks
```
npx vitest run      # 10 test files, 118 tests
npm run typecheck   # tsc --noEmit -p tsconfig.app.json
npm run lint        # eslint .
npm run build       # production bundle in dist/
```

## Structure
| Path | Responsibility |
|---|---|
| `src/data/rooms.ts` | Fictional rooms and bookings, `bookingsForRoom`, `findRoom` |
| `src/domain/availability.ts` | Booking rules: valid time, 120-minute limit, blocked room, overlaps (touching allowed), no mutation |
| `src/domain/time.ts`, `checkFromInput.ts` | Time parsing and the input adapter |
| `src/domain/roomFilter.ts`, `roomSelection.ts` | Capacity / equipment filter and selection reset |
| `src/explain/contract.ts` | Explanation request/response contract, input and output validation, fallback text |
| `src/explain/prompt.ts` | System instruction for a real model |
| `src/explain/mockAdapter.ts` | Mock LLM adapter (same signature a server-side adapter would have) |
| `src/explain/explainService.ts` | Validation, 2 s timeout, deterministic fallback |
| `src/components/*.tsx` | UI: filters, room cards, result panel, explanation box, timeline, bookings table |
| `AGENTS.md` | Instructions for AI coding agents: scope, acceptance criteria, commands, boundaries, review gate |
