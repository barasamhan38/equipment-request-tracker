import {
  RequestValidationError,
  appendRequest,
  createRequest,
  filterRequestsByPriority,
  loadRequests,
  saveRequests,
} from "./request-store.js";

const form = document.querySelector("#request-form");
const message = document.querySelector("#form-message");
const neededByInput = document.querySelector("#needed-by");
const count = document.querySelector("#request-count");
const emptyState = document.querySelector("#empty-state");
const tableWrapper = document.querySelector("#request-table-wrapper");
const tableBody = document.querySelector("#request-table-body");
const priorityFilter = document.querySelector("#priority-filter");
const emptyStateTitle = document.querySelector("#empty-state-title");
const emptyStateMessage = document.querySelector("#empty-state-message");

let requests = loadRequests();

neededByInput.min = new Date().toISOString().slice(0, 10);
renderRequests();

priorityFilter.addEventListener("change", renderRequests);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFieldErrors();
  setMessage("");

  const input = Object.fromEntries(new FormData(form).entries());

  try {
    const request = createRequest(input);
    requests = appendRequest(requests, request);
    saveRequests(requests);
    form.reset();
    neededByInput.min = new Date().toISOString().slice(0, 10);
    setMessage("Request added.");
    renderRequests();
    document.querySelector("#requester").focus();
  } catch (error) {
    if (error instanceof RequestValidationError) {
      showFieldErrors(error.errors);
      setMessage("Complete all required fields.", true);
      return;
    }

    setMessage("The request could not be saved. Try again.", true);
    console.error(error);
  }
});

function renderRequests() {
  const visibleRequests = filterRequestsByPriority(requests, priorityFilter.value);
  const hasRequests = visibleRequests.length > 0;
  const noRequestsAtAll = requests.length === 0;
  count.textContent = `${visibleRequests.length} ${visibleRequests.length === 1 ? "request" : "requests"}`;
  emptyState.hidden = hasRequests;
  emptyStateTitle.textContent = noRequestsAtAll ? "No requests yet" : "No requests were found.";
  emptyStateMessage.hidden = !noRequestsAtAll;
  tableWrapper.hidden = !hasRequests;
  tableBody.replaceChildren(...visibleRequests.map(createRequestRow));
}

function createRequestRow(request) {
  const row = document.createElement("tr");
  const values = [
    displayValue(request?.requester),
    displayValue(request?.priority),
    displayValue(request?.department),
    displayValue(request?.equipment),
    formatDate(request?.neededBy),
    displayValue(request?.reason),
    formatDateTime(request?.createdAt),
  ];

  for (const value of values) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  }

  return row;
}

function formatDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return displayValue(value);
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return displayValue(value);
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function displayValue(value) {
  return typeof value === "string" && value.length > 0 ? value : "—";
}

function showFieldErrors(errors) {
  const firstInvalidField = Object.keys(errors)[0];

  for (const fieldName of Object.keys(errors)) {
    form.elements[fieldName]?.setAttribute("aria-invalid", "true");
  }

  form.elements[firstInvalidField]?.focus();
}

function clearFieldErrors() {
  for (const element of form.elements) {
    element.removeAttribute?.("aria-invalid");
  }
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}
