# Node Entry

## Purpose

`Node Entry` defines the controlled entry point through which companies, institutions, organizations, and other ecosystem actors may submit their information to DRONSAIR.

The entry process does not create a separate type of entity.

It feeds the same ecosystem Node model used by the map and the Directory.

```text
ENTRY
 │
 ▼
SUBMISSION
 │
 ▼
REVIEW
 │
 ▼
NODE
 │
 ├── MAP
 └── DIRECTORY
```

---

## Principle

A Node may originate from ecosystem mapping or from an actor submitting its own information.

Its origin does not change its identity.

```text
RAW ───────────┐
               │
BACKEND ───────┼──► NODE
               │
ENTRY ─────────┘
```

All sources converge into the same canonical Node model.

---

## Entry Experience

The entry page should be simple and focused.

The submitting organization should provide only the information necessary to identify and represent itself within the ecosystem.

Possible information includes:

* organization name;
* type;
* website;
* contact information;
* location;
* description;
* relevant capabilities;
* related brands;
* other information supported by the current Node model.

The form should not expose backend complexity.

The user should not need to understand:

* Node identity;
* normalization;
* identity resolution;
* duplicate detection;
* merge;
* layers;
* provenance;
* publication states;
* internal identifiers.

These belong to the backend.

---

## Submission

A completed entry creates a submission rather than an immediately published Node.

```text
Entry Page
    │
    ▼
Submission
    │
    ├── source
    ├── submitted data
    └── submitter
```

The submission preserves the information provided by the actor.

The backend then determines how that information relates to the existing ecosystem corpus.

A submission is therefore an input to the ecosystem, not itself a new ecosystem identity.

---

## Existing Node

A submission may correspond to an entity already present in the ecosystem.

The backend must therefore be able to identify potential matches without automatically replacing the source record.

```text
Submission
     │
     ▼
Potential existing Node
     │
     ├── new entity
     └── existing entity
```

Identity resolution remains a backend responsibility.

The entry page should not expose this complexity to the submitter.

---

## Merge

When a submitted entity corresponds to an existing source Node, the backend may merge the information according to the ecosystem identity and merge rules.

The original source Node remains preserved.

The published representation may become the resulting merged Node.

```text
SOURCE NODE A ──┐
                ├──► MERGED NODE ──► PUBLICATION
SUBMISSION B ───┘
```

The merge operation must preserve provenance.

The submission does not erase the source.

---

## Review

Every external submission requires review before publication.

Review confirms:

* identity;
* authenticity;
* completeness;
* consistency;
* relevance to the ecosystem;
* relationship to existing Nodes;
* publication suitability.

Review may result in:

```text
SUBMISSION
   │
   ├── approve
   ├── request correction
   ├── merge with existing Node
   └── reject
```

The workflow should remain as short as possible.

---

## Publication

Submission and publication are separate states.

A submitted entity may exist internally without being publicly visible.

```text
NODE
 ├── exists
 ├── reviewed
 └── published → yes / no
```

Once approved, the Node becomes available through the same public representations as every other published Node:

```text
NODE
 ├── MAP
 └── DIRECTORY
```

No special public representation is required for self-submitted Nodes.

---

## Directory Integration

Every published Node appears in the Directory.

The Directory remains the canonical collection of public ecosystem Nodes.

The entry page does not create a separate directory.

```text
ENTRY
  ↓
NODE
  ↓
DIRECTORY
```

Additional organizational information may later be available through the Directory's extended structure.

---

## Map Integration

When a submitted Node contains sufficient geographic information, it may become geographically represented on the map after review and controlled geolocation.

The map and Directory reference the same Node identity.

```text
NODE
 ├── Directory representation
 └── Map representation
```

The entry page therefore contributes to the same ecosystem rather than creating a parallel registry.

---

## Self-Maintenance

A future version may allow verified organizations to maintain their own information.

Possible actions include:

* updating contact information;
* updating website;
* adding capabilities;
* updating location;
* adding brands;
* submitting corrections;
* providing additional organizational information.

Changes remain subject to review and publication rules.

Self-maintenance does not grant unrestricted modification of the ecosystem identity model.

---

## Relationship to Extended Structure

The entry page initially concerns the Node itself.

It does not require the submitting organization to provide a complete organizational structure.

For organizations with meaningful internal structures, additional information may later appear in the Directory's extended layer.

```text
NODE
 │
 └── DIRECTORY
       │
       └── extended structure → optional
```

This keeps the initial submission lightweight while allowing the ecosystem to become progressively richer.

---

## Provenance

The system preserves how the Node entered the ecosystem.

Possible origins include:

* `raw`;
* `backend`;
* `entry`;
* future controlled sources.

Origin is preserved even after merge.

```text
provenance

    ≠

identity

    ≠

publication
```

These are separate dimensions.

---

## Security and Trust

Self-submission does not imply automatic trust.

The system should distinguish between:

* submitted;
* reviewed;
* verified;
* published.

Verification mechanisms may evolve later.

The initial architecture only requires a controlled review boundary before public publication.

---

## Minimal Workflow

The preferred interaction is:

```text
Complete
   ↓
Submit
   ↓
Review
   ↓
Publish
```

The backend absorbs the complexity of:

* normalization;
* identity resolution;
* duplicate detection;
* merge;
* provenance;
* geolocation;
* publication.

The submitter experiences only the minimum necessary workflow.

---

## Future Extensions

The Node Entry system may later support:

* authenticated organization accounts;
* verified ownership;
* self-service updates;
* invitations;
* delegated organization administrators;
* document validation;
* richer organization profiles;
* claims over existing Nodes;
* notifications when information requires review.

These capabilities are intentionally deferred.

The initial objective is controlled contribution to the ecosystem corpus.

---

## Architectural Position

Node Entry is an ingestion surface, not a separate domain model.

```text
                 ECOSYSTEM NODE

                       ▲
          ┌────────────┼────────────┐
          │            │            │
         RAW        BACKEND       ENTRY
          │            │            │
          └────────────┼────────────┘
                       │
                     REVIEW
                       │
                  PUBLICATION
                       │
              ┌────────┴────────┐
              │                 │
             MAP            DIRECTORY
```

The same Node identity can therefore be discovered, enriched, reviewed, merged, and published regardless of where its information originated.

**One Node. Multiple entry points. One identity.**
