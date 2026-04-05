# GW-policy-event-replay-system

## Overview

This project implements a working prototype of an event-driven audit and replay system for insurance policies. Instead of storing only the latest state, the system captures every change as an immutable event and allows reconstruction of policy state at any point in time.

The system is designed to simulate how such a solution would be implemented within enterprise insurance platforms like Guidewire PolicyCenter.

---

## Problem

Traditional insurance systems store only the current state of a policy. This creates challenges in:

* Regulatory audits
* Dispute resolution
* Debugging historical decisions
* Failure recovery

Without a complete history of changes, it is difficult to understand how a policy reached its current state.

---

## Solution

This project adopts an event-based approach:

* Every change to a policy is stored as an event
* Events are persisted as an immutable log
* The system reconstructs past state by replaying events

This enables full traceability and deterministic state reconstruction.

---

## Features

### 1. Policy State Management

* Create and update policy attributes:

  * Premium
  * Status
  * Coverage

### 2. Event Logging

* Each update generates an event:

  * Field changed
  * Old value
  * New value
  * Timestamp

### 3. Event Timeline

* Chronological view of all changes

### 4. Replay Engine

* Reconstruct policy state at any selected timestamp

### 5. Validation Engine

* Compare reconstructed state with current state
* Highlight mismatches

---

## Architecture

The system follows an event-sourcing style approach:

* **Policy State** → Current snapshot
* **Event Log** → Source of truth
* **Replay Engine** → Rebuilds state
* **Validation Layer** → Ensures correctness

---

## Guidewire Mapping

This prototype is designed to reflect how the solution would be implemented in Guidewire PolicyCenter:

* Event Log → Custom Entity (`EventLog_Ext`)
* Change Capture → Rules (Pre-update logic)
* Replay Engine → Gosu service
* UI → PCF screens

---

## Tech Stack

* React / Next.js (Frontend)
* In-memory state (for fast prototyping)
* JavaScript (logic implementation)

---

## Demo Flow

1. Create or load a policy
2. Perform updates (e.g., premium changes)
3. View event timeline
4. Select a past timestamp
5. Reconstruct policy state
6. Compare past vs current state

---

## Future Enhancements

* Integration with Guidewire PolicyCenter
* Persistent event storage (database / event store)
* Advanced audit reporting
* Distributed event streaming

---

## Key Insight

Instead of storing state, store **events that create the state**.

This allows systems to be fully auditable, debuggable, and recoverable.

---
