import assert from "node:assert/strict";
import test from "node:test";

import {
  RequestValidationError,
  STORAGE_KEY,
  appendRequest,
  createRequest,
  filterRequestsByPriority,
  loadRequests,
  saveRequests,
} from "../src/request-store.js";

const validInput = {
  requester: "  Jordan Lee  ",
  department: "Operations",
  equipment: "  Laptop  ",
  neededBy: "2026-09-15",
  reason: "  Replace a failed field computer.  ",
};

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("createRequest trims input and adds system fields", () => {
  const request = createRequest(validInput, {
    id: "request-1",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  assert.deepEqual(request, {
    id: "request-1",
    requester: "Jordan Lee",
    department: "Operations",
    equipment: "Laptop",
    neededBy: "2026-09-15",
    reason: "Replace a failed field computer.",
    priority: "Normal",
    createdAt: "2026-08-17T12:00:00.000Z",
  });
});

test("createRequest reports missing required fields", () => {
  assert.throws(
    () => createRequest({ ...validInput, requester: "", equipment: " " }),
    (error) => {
      assert.ok(error instanceof RequestValidationError);
      assert.deepEqual(Object.keys(error.errors), ["requester", "equipment"]);
      return true;
    },
  );
});

test("appendRequest returns a new list with the newest request first", () => {
  const original = [{ id: "old" }];
  const result = appendRequest(original, { id: "new" });

  assert.deepEqual(result.map((request) => request.id), ["new", "old"]);
  assert.deepEqual(original.map((request) => request.id), ["old"]);
});

test("priority filtering preserves source order and leaves unknown priorities in All", () => {
  const requests = [
    { id: "high", priority: "High" },
    { id: "legacy" },
    { id: "low", priority: "Low" },
    { id: "unknown", priority: "Urgent" },
    { id: "normal", priority: "Normal" },
  ];

  assert.strictEqual(filterRequestsByPriority(requests), requests);
  assert.deepEqual(filterRequestsByPriority(requests).map(({ id }) => id), [
    "high",
    "legacy",
    "low",
    "unknown",
    "normal",
  ]);
  assert.deepEqual(filterRequestsByPriority(requests, "Low").map(({ id }) => id), ["low"]);
  assert.deepEqual(filterRequestsByPriority(requests, "Normal").map(({ id }) => id), ["normal"]);
  assert.deepEqual(filterRequestsByPriority(requests, "High").map(({ id }) => id), ["high"]);
  assert.deepEqual(filterRequestsByPriority(requests, "Other"), []);
  assert.deepEqual(requests, [
    { id: "high", priority: "High" },
    { id: "legacy" },
    { id: "low", priority: "Low" },
    { id: "unknown", priority: "Urgent" },
    { id: "normal", priority: "Normal" },
  ]);
});

test("saveRequests and loadRequests round-trip valid records", () => {
  const storage = new MemoryStorage();
  const request = createRequest(validInput, {
    id: "request-2",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  saveRequests([request], storage);

  assert.deepEqual(loadRequests(storage), [request]);
});

test("loadRequests safely handles damaged stored data", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "not-json");

  assert.deepEqual(loadRequests(storage), []);
});

test("loadRequests preserves existing records with missing priorities and incomplete fields", () => {
  const storage = new MemoryStorage();
  const legacyRequest = {
    id: "legacy-request",
    requester: "",
    department: "Operations",
    equipment: "Laptop",
    neededBy: "not-a-date",
    reason: "",
    createdAt: "not-a-timestamp",
  };
  storage.setItem(STORAGE_KEY, JSON.stringify([legacyRequest]));

  assert.deepEqual(loadRequests(storage), [legacyRequest]);
});
