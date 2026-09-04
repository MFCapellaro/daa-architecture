# Publication

## Purpose

**Publication materializes the visibility state of an approved record.**

It determines when an approved record becomes publicly visible and preserves its lifecycle afterward.

Publication does not decide whether a record is approved.

---

## Position in the Flow

```text
RAW
 ↓
NORMALIZE
 ↓
IDENTITY
 ↓
DUPLICATE FILTER
 ↓
REVIEW
 ↓
PUBLICATION
 ↓
REPRESENTATION
```

Publication is the boundary between **approved data** and **public visibility**.

---

## Responsibility

Publication receives a record that has completed Review and determines its publication state.

It is responsible for:

* activating approved records;
* scheduling future publication;
* preserving publication state;
* archiving records whose active publication period has ended.

Publication does not resolve uncertainty.

---

## Publication States

```text
PROGRAMMED
    │
    │ publication date reached
    ▼
PUBLISHED
    │
    │ active period ended
    ▼
ARCHIVED
```

### PROGRAMMED

The record has been approved, but its publication date is in the future.

```text
approved
   ↓
future publication date
   ↓
PROGRAMMED
```

This is particularly relevant to activities whose publication should begin a defined period before the event.

For example:

```text
event date
    ↓
publication date = event date - 15 days
    ↓
PROGRAMMED
```

### PUBLISHED

The approved record has reached its publication condition and is publicly visible.

```text
approved
   ↓
publication condition reached
   ↓
PUBLISHED
```

### ARCHIVED

The publication period has ended, but the record remains part of the historical corpus.

```text
PUBLISHED
    ↓
active period ended
    ↓
ARCHIVED
```

Archiving does not delete the record.

---

## Approval Boundary

Publication begins **after Review**.

```text
REVIEW
   │
   ├── HOLD
   ├── WAITING
   ├── MERGE
   ├── NO_MERGE
   │
   └── APPROVED
          ↓
     PUBLICATION
```

Only `approved` advances into Publication.

Review decisions such as `hold` and `waiting` do not become Publication states.

---

## Temporal Publication

Publication may be immediate or scheduled.

```text
APPROVED
   │
   ├── publication date = now
   │       ↓
   │   PUBLISHED
   │
   └── publication date = future
           ↓
       PROGRAMMED
```

Temporal behavior belongs to Publication because visibility is a temporal property.

---

## Historical Preservation

Publication never destroys the underlying record.

An archived record remains available as historical evidence.

```text
source
  ↓
canonical record
  ↓
publication
  ↓
historical record
```

The transition from `PUBLISHED` to `ARCHIVED` changes visibility state, not identity.

---

## Relationship with Other Components

```text
Duplicate Filter
       ↓
     Review
       ↓
  Publication
       ↓
 Representation
```

### Duplicate Filter

Detects possible duplication.

### Review

Resolves uncertainty and determines whether the record is approved.

### Publication

Materializes the visibility state and its temporal condition.

### Representation

Determines how the published record is exposed in the ecosystem.

---

## Principle

> **Publication makes approved meaning visible without changing what it is.**
