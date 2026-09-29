"use strict";

/**
 * Domain data — fixed classes and sessions from REQUIREMENTS.md (FR domain data table).
 * `available` is mutated in-memory on confirmation (FR-7.1). It is never persisted
 * outside this page load, so a reload restores these initial values (FR-7.3).
 */
const CLASSES = [
  {
    id: "yoga",
    name: "Yoga",
    price: 8,
    sessions: [
      { id: "yoga-mon-18", day: "Monday", time: "18:00", available: 10 },
      { id: "yoga-wed-19", day: "Wednesday", time: "19:00", available: 6 },
      { id: "yoga-sat-10", day: "Saturday", time: "10:00", available: 2 },
    ],
  },
  {
    id: "pilates",
    name: "Pilates",
    price: 10,
    sessions: [
      { id: "pilates-tue-18", day: "Tuesday", time: "18:00", available: 8 },
      { id: "pilates-thu-19", day: "Thursday", time: "19:00", available: 4 },
      { id: "pilates-sat-11", day: "Saturday", time: "11:30", available: 0 },
    ],
  },
  {
    id: "functional",
    name: "Functional Training",
    price: 12,
    sessions: [
      { id: "functional-mon-19", day: "Monday", time: "19:30", available: 5 },
      { id: "functional-wed-18", day: "Wednesday", time: "18:00", available: 10 },
      { id: "functional-fri-18", day: "Friday", time: "18:30", available: 3 },
    ],
  },
  {
    id: "spinning",
    name: "Spinning",
    price: 11,
    sessions: [
      { id: "spinning-tue-19", day: "Tuesday", time: "19:30", available: 7 },
      { id: "spinning-thu-18", day: "Thursday", time: "18:00", available: 1 },
      { id: "spinning-sun-10", day: "Sunday", time: "10:00", available: 10 },
    ],
  },
];

const STEP_ORDER = ["class", "session", "participants", "summary", "confirmation"];
const STEP_LABELS = {
  class: "Class",
  session: "Session",
  participants: "Participants",
  summary: "Review",
  confirmation: "Done",
};

/** Reservation-in-progress state. Reset on "start another reservation"; class/session
 * availability (CLASSES) is intentionally NOT reset here (FR-8.2). */
const state = {
  step: "class",
  selectedClassId: null,
  selectedSessionId: null,
  participants: 1,
  lastConfirmation: null,
};

const appEl = document.getElementById("app");
const stepperEl = document.getElementById("stepper");

// ---------- Helpers ----------

function getSelectedClass() {
  return CLASSES.find((c) => c.id === state.selectedClassId) || null;
}

function getSelectedSession() {
  const cls = getSelectedClass();
  if (!cls) return null;
  return cls.sessions.find((s) => s.id === state.selectedSessionId) || null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPrice(amount) {
  return `€${amount.toFixed(2)}`;
}

function pluralize(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function isReservationValid() {
  const cls = getSelectedClass();
  const session = getSelectedSession();
  if (!cls || !session) return false;
  if (session.available <= 0) return false;
  if (state.participants < 1) return false;
  if (state.participants > session.available) return false;
  return true;
}

function getValidationMessage() {
  if (!state.selectedClassId) return "Please select a class.";
  if (!state.selectedSessionId) return "Please select a session.";
  const session = getSelectedSession();
  if (!session || session.available <= 0) {
    return "This session is now full. Please choose another session.";
  }
  if (state.participants < 1) return "Please select at least 1 participant.";
  if (state.participants > session.available) {
    return `Only ${pluralize(session.available, "place")} left in this session.`;
  }
  return "";
}

// ---------- Actions ----------

function selectClass(classId) {
  state.selectedClassId = classId;
  state.selectedSessionId = null;
  state.participants = 1;
  state.step = "session";
  render();
}

function selectSession(sessionId) {
  state.selectedSessionId = sessionId;
  state.participants = 1;
  state.step = "participants";
  render();
}

function confirmReservation() {
  if (!isReservationValid()) {
    render();
    return;
  }
  const cls = getSelectedClass();
  const session = getSelectedSession();

  // Deduct participants from the session's remaining availability (FR-7.1).
  session.available -= state.participants;

  state.lastConfirmation = {
    className: cls.name,
    sessionLabel: `${session.day} · ${session.time}`,
    participants: state.participants,
    pricePerParticipant: cls.price,
    total: cls.price * state.participants,
  };
  state.step = "confirmation";
  render();
}

function startNewReservation() {
  // Reset the reservation-in-progress only. CLASSES availability persists (FR-8.2).
  state.selectedClassId = null;
  state.selectedSessionId = null;
  state.participants = 1;
  state.lastConfirmation = null;
  state.step = "class";
  render();
}

// ---------- Rendering ----------

function renderStepper() {
  const currentIndex = STEP_ORDER.indexOf(state.step);
  stepperEl.innerHTML = STEP_ORDER.map((key, i) => {
    let stateClass = "upcoming";
    if (i < currentIndex) stateClass = "completed";
    if (i === currentIndex) stateClass = "active";
    return `
      <li class="step ${stateClass}">
        <span class="step-index">${i + 1}</span>
        <span class="step-label">${STEP_LABELS[key]}</span>
      </li>
    `;
  }).join("");
}

function renderClassStep() {
  const panel = document.createElement("div");
  panel.className = "step-panel";
  panel.innerHTML = `
    <h2>1. Choose a class</h2>
    <p class="step-hint">Select a class to see its available sessions.</p>
    <div class="class-grid">
      ${CLASSES.map(
        (c) => `
        <button type="button" class="class-card" data-class-id="${c.id}">
          <span class="class-name">${c.name}</span>
          <span class="class-price">${formatPrice(c.price)} / participant</span>
          <span class="class-sessions-count">${pluralize(c.sessions.length, "session")}</span>
        </button>
      `
      ).join("")}
    </div>
  `;
  appEl.appendChild(panel);

  panel.querySelectorAll(".class-card").forEach((btn) => {
    btn.addEventListener("click", () => selectClass(btn.dataset.classId));
  });
}

function renderSessionStep() {
  const cls = getSelectedClass();
  const panel = document.createElement("div");
  panel.className = "step-panel";
  panel.innerHTML = `
    <button type="button" class="link-back" data-action="back-to-class">← Change class</button>
    <h2>2. Choose a session — ${cls.name}</h2>
    <p class="step-hint">${formatPrice(cls.price)} per participant</p>
    <ul class="session-list">
      ${cls.sessions
        .map((s) => {
          const full = s.available <= 0;
          const badgeClass = full ? "badge-full" : s.available <= 2 ? "badge-low" : "badge-ok";
          const badgeText = full ? "Full" : `${pluralize(s.available, "place")} left`;
          return `
          <li>
            <button
              type="button"
              class="session-row${full ? " is-full" : ""}"
              data-session-id="${s.id}"
              ${full ? "disabled" : ""}
            >
              <span class="session-time">${s.day} · ${s.time}</span>
              <span class="session-availability ${badgeClass}">${badgeText}</span>
            </button>
          </li>
        `;
        })
        .join("")}
    </ul>
  `;
  appEl.appendChild(panel);

  panel.querySelector('[data-action="back-to-class"]').addEventListener("click", () => {
    state.step = "class";
    render();
  });

  panel.querySelectorAll(".session-row:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => selectSession(btn.dataset.sessionId));
  });
}

function renderParticipantsStep() {
  const cls = getSelectedClass();
  const session = getSelectedSession();
  const max = session.available;

  const panel = document.createElement("div");
  panel.className = "step-panel";
  panel.innerHTML = `
    <button type="button" class="link-back" data-action="back-to-session">← Change session</button>
    <h2>3. Number of participants</h2>
    <p class="step-hint">${cls.name} — ${session.day} ${session.time} (${pluralize(max, "place")} available)</p>
    <div class="participants-control">
      <button type="button" class="stepper-btn" data-action="dec" aria-label="Decrease participants" ${state.participants <= 1 ? "disabled" : ""}>−</button>
      <input
        type="number"
        id="participants-input"
        min="1"
        max="${max}"
        step="1"
        inputmode="numeric"
        value="${state.participants}"
        aria-label="Number of participants"
      />
      <button type="button" class="stepper-btn" data-action="inc" aria-label="Increase participants" ${state.participants >= max ? "disabled" : ""}>+</button>
    </div>
    <p class="field-hint">Choose between 1 and ${max} participants.</p>
    <p class="line-total">Subtotal: <strong id="subtotal-value">${formatPrice(cls.price * state.participants)}</strong></p>
    <div class="actions">
      <button type="button" class="btn btn-primary" data-action="continue">Review reservation</button>
    </div>
  `;
  appEl.appendChild(panel);

  const input = panel.querySelector("#participants-input");
  const subtotalEl = panel.querySelector("#subtotal-value");
  const continueBtn = panel.querySelector('[data-action="continue"]');
  const decBtn = panel.querySelector('[data-action="dec"]');
  const incBtn = panel.querySelector('[data-action="inc"]');

  panel.querySelector('[data-action="back-to-session"]').addEventListener("click", () => {
    state.step = "session";
    render();
  });

  decBtn.addEventListener("click", () => {
    state.participants = clamp(state.participants - 1, 1, max);
    render();
  });

  incBtn.addEventListener("click", () => {
    state.participants = clamp(state.participants + 1, 1, max);
    render();
  });

  // Update the live subtotal while typing without re-rendering (keeps input focus/cursor).
  input.addEventListener("input", () => {
    const parsed = parseInt(input.value, 10);
    const preview = clamp(isNaN(parsed) ? 1 : parsed, 1, max);
    subtotalEl.textContent = formatPrice(cls.price * preview);
  });

  // Commit and clamp the final value once the user leaves the field. Updates the DOM
  // in place (instead of calling render()) so a Continue click right after typing
  // isn't lost to the blur handler replacing the button out from under the click.
  input.addEventListener("blur", () => {
    const parsed = parseInt(input.value, 10);
    const clamped = clamp(isNaN(parsed) ? 1 : parsed, 1, max);
    state.participants = clamped;
    input.value = String(clamped);
    subtotalEl.textContent = formatPrice(cls.price * clamped);
    decBtn.disabled = clamped <= 1;
    incBtn.disabled = clamped >= max;
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    }
  });

  continueBtn.addEventListener("click", () => {
    const parsed = parseInt(input.value, 10);
    state.participants = clamp(isNaN(parsed) ? 1 : parsed, 1, max);
    state.step = "summary";
    render();
  });
}

function renderSummaryStep() {
  const cls = getSelectedClass();
  const session = getSelectedSession();
  const total = cls.price * state.participants;
  const valid = isReservationValid();

  const panel = document.createElement("div");
  panel.className = "step-panel";
  panel.innerHTML = `
    <h2>4. Review your reservation</h2>
    <dl class="summary-list">
      <div class="summary-row">
        <dt>Class</dt>
        <dd>${cls.name} <button type="button" class="link-edit" data-action="edit-class">Change</button></dd>
      </div>
      <div class="summary-row">
        <dt>Session</dt>
        <dd>${session.day} · ${session.time} <button type="button" class="link-edit" data-action="edit-session">Change</button></dd>
      </div>
      <div class="summary-row">
        <dt>Participants</dt>
        <dd>${state.participants} <button type="button" class="link-edit" data-action="edit-participants">Change</button></dd>
      </div>
      <div class="summary-row">
        <dt>Price per participant</dt>
        <dd>${formatPrice(cls.price)}</dd>
      </div>
      <div class="summary-row total">
        <dt>Total price</dt>
        <dd>${formatPrice(total)}</dd>
      </div>
    </dl>
    ${!valid ? `<p class="error-message" role="alert">${getValidationMessage()}</p>` : ""}
    <div class="actions">
      <button type="button" class="btn btn-primary" data-action="confirm" ${!valid ? "disabled" : ""}>Confirm reservation</button>
    </div>
  `;
  appEl.appendChild(panel);

  panel.querySelector('[data-action="edit-class"]').addEventListener("click", () => {
    state.step = "class";
    render();
  });
  panel.querySelector('[data-action="edit-session"]').addEventListener("click", () => {
    state.step = "session";
    render();
  });
  panel.querySelector('[data-action="edit-participants"]').addEventListener("click", () => {
    state.step = "participants";
    render();
  });
  const confirmBtn = panel.querySelector('[data-action="confirm"]');
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmReservation);
  }
}

function renderConfirmationStep() {
  const c = state.lastConfirmation;
  const panel = document.createElement("div");
  panel.className = "step-panel confirmation";
  panel.innerHTML = `
    <div class="success-icon" aria-hidden="true">✓</div>
    <h2>Reservation confirmed!</h2>
    <p class="step-hint">Your spot has been reserved. Here are the details.</p>
    <dl class="summary-list">
      <div class="summary-row"><dt>Class</dt><dd>${c.className}</dd></div>
      <div class="summary-row"><dt>Session</dt><dd>${c.sessionLabel}</dd></div>
      <div class="summary-row"><dt>Participants</dt><dd>${c.participants}</dd></div>
      <div class="summary-row total"><dt>Total price</dt><dd>${formatPrice(c.total)}</dd></div>
    </dl>
    <div class="actions">
      <button type="button" class="btn btn-primary" data-action="new-reservation">Start another reservation</button>
    </div>
  `;
  appEl.appendChild(panel);

  panel.querySelector('[data-action="new-reservation"]').addEventListener("click", startNewReservation);
}

function render() {
  // Guard against an inconsistent step/selection combination (e.g. defensive fallback).
  if (["session", "participants", "summary"].includes(state.step) && !getSelectedClass()) {
    state.step = "class";
  }
  if (["participants", "summary"].includes(state.step) && !getSelectedSession()) {
    state.step = "session";
  }

  appEl.innerHTML = "";
  renderStepper();

  switch (state.step) {
    case "class":
      renderClassStep();
      break;
    case "session":
      renderSessionStep();
      break;
    case "participants":
      renderParticipantsStep();
      break;
    case "summary":
      renderSummaryStep();
      break;
    case "confirmation":
      renderConfirmationStep();
      break;
    default:
      renderClassStep();
  }
}

render();
