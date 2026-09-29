# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository currently contains only `BRD.md` — the Business Requirements Document. No implementation exists yet (no source code, package manifest, build tooling, or tests). There are no build/lint/test commands to document until a project is scaffolded.

When implementation begins, update this file with the actual commands (install, build, lint, test — including how to run a single test) and a description of the resulting architecture.

## Source of Truth

`BRD.md` is the authoritative specification for business behavior. Section 18 ("Implementation Freedom") explicitly leaves language, framework, file structure, state-management approach, and test technology undecided — these are open implementation choices, not constraints to infer from the document.

Key constraints from the BRD to respect when implementing:

- **App**: Gym Class Reservation — a simple, anonymous, client-side-only web app (no accounts, no auth, no backend, no persistent storage, no payment processing — see Section 17 for the full exclusion list).
- **Domain data**: 4 fixed classes (Yoga, Pilates, Functional Training, Spinning), each with a fixed price per participant and exactly 3 predefined sessions with a 10-participant cap and specific starting availability (Section 3–4).
- **Reservation flow**: select class → select session → select participant count → review summary → confirm → see confirmation → optionally start another reservation (Section 5), with the ability to change any prior selection before confirming.
- **Validation**: participant count must be between 1 and the session's remaining capacity; full sessions cannot be reserved; confirmation must be blocked when the reservation is incomplete or invalid (Section 8, 14).
- **State**: confirming a reservation deducts participants from that session's remaining availability, and this persists only for the current browser session — a refresh/reopen resets availability to the BRD's initial values (Section 12–13). No cross-user/cross-browser sync is required.
- **No personal data** is ever collected (Section 16).
