# Review

## Purpose

**Review determines whether an ecosystem record is ready to advance.**

It resolves uncertainty before publication.

Review does not normalize, identify, merge, publish, or represent data.

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

Review is the decision point between **information assessment** and **public visibility**.

---

## Responsibility

Review evaluates the current state of a record and determines its next valid condition.

It may determine that a record is:

* ready for publication;
* waiting for confirmation;
* insufficient and therefore held;
* approved for a future publication date.

Review does not create missing information.

---

## Duplicate Review

When the duplicate filter identifies a possible duplicate, Review determines whether the records should be consolidated.

```text
DUPLICATE
    ↓
REVIEW
    ├── MERGE
    ├── NO MERGE
    └── WAITING
```

### Merge

The records represent the same entity and the available information can be consolidated.

### No Merge

The records are related or duplicated, but the new record adds no information that justifies a merge.

The source record remains preserved.

### Waiting

The available evidence is insufficient to confidently determine the relationship.

The records remain available for later review.

---

## Publication Readiness

After duplicate evaluation and any required consolidation, Review determines whether publication may proceed.

```text
REVIEW
   │
   ├── HOLD
   ├── WAITING
   ├── PROGRAMMED
   └── PUBLISHED
```

These states express different conditions.

### HOLD

Required basic information is missing.

The record cannot yet be considered publishable.

```text
insufficient data
       ↓
     HOLD
```

### WAITING

Sufficient information exists, but an unresolved uncertainty requires confirmation.

```text
sufficient data
       ↓
   uncertainty
       ↓
    WAITING
```

### PROGRAMMED

The record has been approved for publication, but its publication date is in the future.

```text
approved
   ↓
future publication date
   ↓
PROGRAMMED
```

This is particularly relevant to activities whose publication is scheduled relative to their event date.

### PUBLISHED

The record is approved and its publication condition has been reached.

```text
approved
   ↓
publication condition reached
   ↓
PUBLISHED
```

---

## Decision Principle

Review does not force progression.

It preserves uncertainty when certainty is not yet justified.

```text
Missing information
        ↓
      HOLD

Unresolved uncertainty
        ↓
     WAITING

Approved future visibility
        ↓
    PROGRAMMED

Approved current visibility
        ↓
    PUBLISHED
```

---

## Source Preservation

Review never destroys source evidence.

A record placed in `HOLD` or `WAITING` remains available for future evaluation.

A record that is not merged also remains preserved as source evidence.

The corpus therefore retains the history from which later knowledge may emerge.

---

## Relationship with Other Components

```text
Normalize
   ↓
Identity
   ↓
Duplicate Filter
   ↓
Review
   ↓
Publication
   ↓
Representation
```

### Normalize

Provides a structurally coherent record.

### Identity

Determines whether enough information exists to establish a usable identity.

### Duplicate Filter

Detects possible duplication.

### Review

Resolves uncertainty and determines publication readiness.

### Publication

Materializes the publication state determined by the process.

### Representation

Determines how a published entity becomes visible in the ecosystem.

---

## Principle

> **Review resolves uncertainty without forcing certainty.**
