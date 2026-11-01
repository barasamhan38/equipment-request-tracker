import assert from "node:assert/strict";
import test from "node:test";

import { getEmptyStateCopy } from "../src/request-view.js";

test("an empty priority filter shows the no requests found message", () => {
  assert.deepEqual(getEmptyStateCopy(0, "High"), {
    title: "No requests were found.",
    showAddRequestMessage: false,
  });
});

test("an empty All view keeps the initial empty-list message", () => {
  assert.deepEqual(getEmptyStateCopy(0, "All"), {
    title: "No requests yet",
    showAddRequestMessage: true,
  });
});

test("selecting a priority with an empty request list renders the required message", async () => {
  const previousDocument = globalThis.document;
  const selectors = [
    "#request-form",
    "#form-message",
    "#needed-by",
    "#request-count",
    "#empty-state",
    "#request-table-wrapper",
    "#request-table-body",
    "#priority-filter",
    "#empty-state-title",
    "#empty-state-message",
  ];
  const elements = new Map(
    selectors.map((selector) => [
      selector,
      {
        addEventListener(eventName, listener) {
          this.listeners ??= {};
          this.listeners[eventName] = listener;
        },
        classList: { toggle() {} },
        replaceChildren() {},
      },
    ]),
  );
  elements.get("#priority-filter").value = "All";
  globalThis.document = { querySelector: (selector) => elements.get(selector) };

  try {
    await import("../src/app.js?empty-list-priority-test");

    assert.equal(elements.get("#empty-state-title").textContent, "No requests yet");
    const priorityFilter = elements.get("#priority-filter");
    priorityFilter.value = "High";
    priorityFilter.listeners.change();

    assert.equal(elements.get("#empty-state-title").textContent, "No requests were found.");
    assert.equal(elements.get("#empty-state-message").hidden, true);
  } finally {
    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }
  }
});