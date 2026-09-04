# Notes Backend

## Purpose

`Notes` provides the semantic and editorial layer associated with ecosystem activities.

A note expands an activity without changing the activity itself.

The activity answers:

> **What is happening?**

The note allows the ecosystem to explain:

> **Why does it matter, what is it about, and what should the user know?**

A note is therefore optional.

An activity can exist and be published without a note.

---

## Architectural Principle

```text
Activity
   │
   └── Note available?
          │
          ├── no → Activity remains complete
          │
          └── yes → Semantic layer becomes available
```

The note does not replace the activity.

It enriches it.

This follows the same structural principle used by the Directory:

```text
Node
   └── Directory
         └── extended information

Activity
   └── Note
         └── extended meaning
```

---

## Relationship to Activity

A note belongs to an activity.

The activity remains the primary structured object containing:

* title;
* type;
* date;
* temporal status;
* location or emission location;
* organizer;
* thematic information;
* publication status.

The note provides additional editorial content.

```text
Activity
 ├── structured data
 ├── temporal state
 ├── geographic reference
 └── Note
      ├── introduction
      ├── context
      ├── description
      └── additional semantic content
```

The relationship is one-to-zero-or-one at the current architectural stage.

---

## Content Sources

Notes may originate from different entry points.

### Raw Corpus

The initial ecosystem mapping may contain an activity without an associated note.

This is valid.

The absence of a note must never prevent the activity from entering the system.

### Backend

Authorized users may create or edit notes directly from the backend.

Backend editing is intended primarily for:

* important activities;
* editorial additions;
* corrections;
* enrichment;
* internally produced content.

### User Submission

Registered users may submit activity content through the public entry point.

The submitted content enters the same activity/note handling flow.

The system should avoid maintaining separate content models for each origin.

```text
RAW
      \
BACKEND ---> Activity / Note unit ---> Review ---> Publication
      /
ENTRY
```

---

## Review

Submitted or imported content may require review before publication.

Review should remain lightweight.

The objective is not to introduce an editorial workflow disproportionate to the ecosystem.

The system should primarily verify:

* completeness;
* consistency;
* source;
* publication eligibility;
* temporal validity;
* geographic information;
* relationship between activity and note.

The content itself may already have been prepared by the organization's communication or dissemination team.

---

## Publication

A note may be:

* unpublished;
* published;
* scheduled for publication;
* archived.

Publication belongs to the publication lifecycle and should not alter the underlying activity.

An activity may therefore be:

```text
published
+
note unpublished
```

or:

```text
published
+
note published
```

The activity remains visible in both cases.

The note simply becomes an additional navigation layer when published.

---

## Navigation

The note participates in the same progressive navigation model as the Directory.

```text
MAP
 │
 └── Activity
       │
       ├── List of Activities
       │
       └── Note
             │
             └── extended semantic content
```

Navigation should work in both directions:

```text
Activity → Note

Note → Activity
```

The user should never lose the context of the activity while reading its semantic layer.

---

## Temporal Behavior

Activities are temporal objects.

Their publication may therefore be scheduled for deactivation after the activity has occurred.

The activity then becomes historical rather than disappearing from the ecosystem.

The associated note follows the activity's historical context.

```text
Upcoming
   ↓
Active
   ↓
Historical
```

Historical activities and their notes remain available for retrospective exploration, subject to publication policy.

This preserves the evolution of the ecosystem over time.

---

## Discovery and Filtering

Notes inherit the contextual relationship of their activity.

The primary discovery dimensions remain those of the Activity layer:

* calendar;
* activity type;
* location;
* thematic area;
* organizer;
* temporal status.

The note adds semantic depth but does not introduce an independent discovery system at this stage.

This avoids unnecessary duplication.

---

## Editorial Independence

A note may be created or modified independently of the activity's basic structured data.

For example:

```text
Activity
  date: 2026-10-15
  type: conference
  location: Rosario

Note
  editorial content:
    conference context
    speakers
    relevance
    additional information
```

Changing the note does not change the identity of the activity.

Changing the activity does not require rewriting the note unless the semantic content becomes inconsistent.

---

## Provenance

The system preserves the origin of the note.

Possible sources include:

* `raw`;
* `backend`;
* `submission`;
* future controlled sources.

Provenance remains part of the backend record and is not confused with publication status.

```text
source ≠ publication
```

A submitted note can become published.

A backend-created note can remain unpublished.

A raw note can be reviewed and subsequently published.

---

## Principle of Minimal Structure

Notes should remain lightweight.

The initial implementation does not attempt to become a complete publishing platform.

The system should provide only what is necessary to:

1. associate content with an activity;
2. preserve its source;
3. review it;
4. publish it;
5. display it as an additional semantic layer;
6. preserve it historically.

Additional editorial capabilities may emerge later from actual use.

---

## Future Extensions

The Note model may later support:

* images;
* galleries;
* video;
* documents;
* references;
* related activities;
* related nodes;
* external sources;
* multimedia storytelling;
* richer editorial formats.

These are future capabilities, not prerequisites for the initial ecosystem.

---

## Architectural Position

`Notes` belongs to the semantic layer of the ecosystem backend.

```text
ECOSYSTEM
│
├── Identity
├── Merge
├── Directory
├── Activities
│    └── Notes
└── Publication
```

Notes add meaning without adding structural complexity.

The architecture therefore remains:

**simple at the entry point, structured internally, progressively richer at the point of exploration.**
