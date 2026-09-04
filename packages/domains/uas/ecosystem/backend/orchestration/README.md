# Backend Orchestration

## Purpose

Orchestration coordinates the backend processes that transform ecosystem information into a coherent, publishable system.

It does not define the meaning of nodes, activities, directory entries, notes, relationships, or publication states.

Its responsibility is to coordinate the components that already own those meanings.

The orchestration layer is therefore the **flow layer of the backend**.

---

## Core Principle

> Orchestration coordinates processes; it does not own their semantics.

Each subsystem remains responsible for its own domain:

* **Identity** — determines identity state and entity continuity.
* **Merge** — consolidates source nodes without destroying provenance.
* **Directory** — exposes node information and extended organizational structure.
* **Activities** — manages temporal ecosystem activities.
* **Notes** — provides the extended semantic layer of activities.
* **Publication** — determines whether an entity is visible to users.
* **Entry Pages** — provide controlled user-facing ingestion.
* **Relationships** — connect entities without embedding relationship logic into other domains.

Orchestration connects these processes without replacing them.

---

# 1. Main Responsibility

Orchestration coordinates the lifecycle from incoming information to published ecosystem representation.

A typical flow is:

```text
RAW
  ↓
IMPORT
  ↓
NORMALIZATION
  ↓
IDENTITY
  ↓
MERGE
  ↓
ENRICHMENT
  ↓
PUBLICATION
  ↓
MAP / DIRECTORY / ACTIVITIES
```

Not every record necessarily passes through every stage.

The orchestration layer determines which processes are required according to the origin and state of the information.

---

# 2. Multiple Entry Points

The backend receives information from several sources.

```text
                    ┌──────────────┐
                    │ Raw Corpus   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Backend UI   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Entry Page   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Orchestration│
                    └──────────────┘
```

Different entry points converge on the same internal units.

The origin of the information must remain traceable.

---

# 3. Node Flow

Nodes may originate from:

* raw ecosystem mapping;
* backend creation;
* organization entry pages;
* future integrations.

The resulting process is:

```text
Source
  ↓
Normalize
  ↓
Identify
  ↓
Merge when appropriate
  ↓
Enrich
  ↓
Review
  ↓
Publish / Hold
```

A source node is never destroyed merely because another node becomes its canonical representation.

The backend preserves the source and publishes the resulting canonical node when appropriate.

---

# 4. Activity Flow

Activities follow a similar but temporal lifecycle.

```text
Source
  ↓
Activity record
  ↓
Optional note
  ↓
Review
  ↓
Publication
  ↓
Active
  ↓
Scheduled deactivation
  ↓
Historical record
```

An activity may exist without an associated note.

The note is an optional semantic extension.

The activity itself remains the primary object.

---

# 5. Publication Coordination

Publication is a controlled state transition.

Orchestration may request publication, but the publication subsystem owns the publication state.

Conceptually:

```text
candidate
    ↓
review
    ↓
approved
    ↓
published
    ↓
archived
```

Or:

```text
candidate
    ↓
review
    ↓
rejected
```

Publication must never require deletion of the underlying source information.

---

# 6. Map and Directory

The map and directory are two representations of the same ecosystem information.

```text
                 Canonical Node
                      │
             ┌────────┴────────┐
             ↓                 ↓
            Map            Directory
             │                 │
        basic view       basic + extended
```

Every published map node is therefore available to the directory.

The directory may contain additional information without duplicating the basic node data.

Orchestration ensures that both representations remain aligned.

---

# 7. Activity List and Semantic Layer

Activities follow the same structural principle.

```text
                  Activity
                     │
             ┌───────┴────────┐
             ↓                ↓
        Activity List       Note
             │                │
        basic view       semantic extension
```

The list provides the temporal ecosystem view.

The note provides additional context when available.

The two are linked representations, not duplicated records.

---

# 8. Temporal Orchestration

Activities are temporal entities.

When an activity is created, its lifecycle may include a scheduled deactivation.

```text
creation
   ↓
publication
   ↓
active period
   ↓
scheduled end
   ↓
historical state
```

The transition to historical state does not remove the activity.

Historical activities remain available for:

* retrospective exploration;
* ecosystem history;
* statistics;
* future analysis;
* relationships with organizations and other activities.

---

# 9. Review Coordination

Review is intentionally centralized at the orchestration level.

Different sources may have different degrees of trust and completeness, but they converge on the same controlled publication process.

```text
incoming information
        ↓
     review
        ↓
 ┌──────┴──────┐
 ↓             ↓
approve       hold
 ↓
publish
```

The complexity of the source should not be transferred to the user.

The backend absorbs that complexity.

---

# 10. User Entry Pages

Future entry pages provide controlled external ingestion.

Two primary entry points are anticipated:

```text
Node Entry Page
Activity Entry Page
```

They should remain intentionally simple.

Users provide the information they already possess.

The backend handles:

* normalization;
* validation;
* identity comparison;
* merge candidates;
* publication review;
* scheduling;
* relationships;
* enrichment.

The entry page is therefore an **input surface**, not a representation of backend complexity.

---

# 11. Orchestration Does Not Duplicate Data

Orchestration must avoid creating parallel representations of the same information.

For example:

```text
Node
 ├── Map representation
 └── Directory representation
```

does not imply two nodes.

Likewise:

```text
Activity
 ├── List representation
 └── Note representation
```

does not imply two activities.

The system maintains one underlying identity and exposes multiple semantic views.

---

# 12. Provenance

Every orchestrated process must preserve provenance.

At minimum, the system should be able to determine:

* where information originated;
* when it entered the system;
* which process transformed it;
* whether it was merged;
* which canonical entity resulted;
* who approved publication;
* when publication occurred;
* when publication ended.

Orchestration connects these transitions without erasing their history.

---

# 13. Determinism

Repeated execution of the same process over the same input should produce the same structural result.

Orchestration therefore favors:

* deterministic identifiers;
* explicit state transitions;
* reproducible imports;
* controlled merges;
* idempotent operations where possible.

A repeated import must not create uncontrolled duplication.

---

# 14. Future Expansion

The orchestration layer is deliberately open to future ecosystem domains.

Potential future processes include:

* meteorology;
* photogrammetry;
* EOSDA integrations;
* software;
* services;
* comparative products;
* purchase pools;
* insurance;
* training;
* certifications;
* additional ecosystem resources.

These additions should enter through orchestration rather than requiring structural changes to the existing map and directory model.

---

# 15. Structural Model

The backend can therefore be understood as:

```text
                    ORCHESTRATION
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
    Identity            Merge           Publication
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                 ┌────────┴────────┐
                 ↓                 ↓
                Node            Activity
                 │                 │
          ┌──────┴──────┐    ┌────┴─────┐
          ↓             ↓    ↓          ↓
         Map        Directory List      Note
```

The architecture remains simple because each layer has one clear responsibility.

---

## Principle

> The backend absorbs complexity so that the ecosystem remains simple to use.

Orchestration is the mechanism that makes that possible.
