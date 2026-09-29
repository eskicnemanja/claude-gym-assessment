# Requirements — Gym Class Reservation

Functional requirements extracted from `BRD.md` for development purposes. This is a client-side-only, anonymous reservation app with no backend, no accounts, and no persistence beyond the current browser session.

## 1. Domain Data (fixed/hardcoded)

4 classes, each with a fixed price per participant and 3 predefined sessions (10-participant cap per session):

| Class | Price | Sessions (initial available places) |
|---|---:|---|
| Yoga | €8 | Mon 18:00 (10), Wed 19:00 (6), Sat 10:00 (2) |
| Pilates | €10 | Tue 18:00 (8), Thu 19:00 (4), Sat 11:30 (0) |
| Functional Training | €12 | Mon 19:30 (5), Wed 18:00 (10), Fri 18:30 (3) |
| Spinning | €11 | Tue 19:30 (7), Thu 18:00 (1), Sun 10:00 (10) |

## 2. Reservation Flow (FR-1)

- **FR-1.1** User selects a class from the 4 available.
- **FR-1.2** Selecting a class reveals its 3 sessions for selection.
- **FR-1.3** User selects one session.
- **FR-1.4** User selects a number of participants.
- **FR-1.5** User reviews a summary before confirming.
- **FR-1.6** User explicitly confirms the reservation.
- **FR-1.7** User sees a confirmation of success.
- **FR-1.8** User can start a new reservation after confirming.
- **FR-1.9** Before confirming, the user can change the selected class, session, or participant count at any point.

## 3. Session Selection (FR-2)

- **FR-2.1** Each session displays: day/time, availability status (available/full), and remaining place count.
- **FR-2.2** A session with 0 remaining places cannot be selected/reserved.

## 4. Participant Count (FR-3)

- **FR-3.1** Minimum is 1 participant.
- **FR-3.2** Maximum is the session's current remaining places.
- **FR-3.3** If remaining places is 0, no reservation is possible for that session.
- **FR-3.4** The app must not allow confirming a count that exceeds remaining capacity.

## 5. Price Calculation (FR-4)

- **FR-4.1** Total price = number of participants × class price per participant.
- **FR-4.2** Calculated automatically (no manual entry).
- **FR-4.3** No payment is processed.

## 6. Reservation Summary (FR-5)

Before confirmation, display:
- **FR-5.1** Selected class
- **FR-5.2** Selected session
- **FR-5.3** Number of participants
- **FR-5.4** Price per participant
- **FR-5.5** Total price
- **FR-5.6** All fields remain editable from this screen (goes back to FR-1.9).

## 7. Confirmation (FR-6)

- **FR-6.1** Reservation requires explicit user confirmation action.
- **FR-6.2** On confirm, show a clear success indication with enough detail to understand what was reserved.
- **FR-6.3** No email, SMS, printed ticket, or external confirmation.

## 8. Availability Updates (FR-7)

- **FR-7.1** On confirmation, deduct the reserved participant count from that session's remaining availability.
- **FR-7.2** Updated availability persists only in-memory / for the current browser session (e.g., app state — not a backend).
- **FR-7.3** A page refresh or reopen resets all availability to the BRD's initial values.
- **FR-7.4** No sync across users or browsers is required.

## 9. Start Another Reservation (FR-8)

- **FR-8.1** After confirmation, user can return to a state where a new reservation can be started.
- **FR-8.2** Availability changes from prior confirmations in the same session persist across this reset (only the reservation-in-progress resets, not availability).

## 10. Validation / Error Handling (FR-9)

Reservation confirmation must be blocked, with feedback to the user, when:
- **FR-9.1** No class selected.
- **FR-9.2** No session selected.
- **FR-9.3** Participant count < 1.
- **FR-9.4** Participant count exceeds remaining places.
- **FR-9.5** Selected session has 0 remaining places.

## 11. UI Requirements (FR-10)

The interface must let the user:
- **FR-10.1** Identify available classes.
- **FR-10.2** Identify sessions for the selected class.
- **FR-10.3** Understand session availability at a glance.
- **FR-10.4** Select number of participants.
- **FR-10.5** Review the reservation before confirming.
- **FR-10.6** Confirm a valid reservation.
- **FR-10.7** Understand when/why a reservation cannot be confirmed.
- **FR-10.8** See the confirmation screen.
- **FR-10.9** Start another reservation.

No specific visual design is mandated.

## 12. Data Privacy (FR-11)

- **FR-11.1** No personal data is collected or required: no name, email, phone, address, account, or payment info.
- **FR-11.2** Reservations are fully anonymous.

## 13. Out of Scope

Do not implement: user accounts, authentication, memberships/subscriptions, payment processing, discounts/promotions, database/backend storage, live multi-user availability sync, waiting lists, personal-trainer scheduling, cancellation, rescheduling, trainer management, email/SMS confirmation, external calendar integration, external APIs, complex date/calendar logic.

## 14. Open Implementation Choices

Not prescribed by the BRD — decide during technical design: programming language, framework, file structure, state-management approach, automated-test technology, test-document format, project-plan format.
