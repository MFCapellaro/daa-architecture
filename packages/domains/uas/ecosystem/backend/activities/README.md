# Activities

## Purpose

`Activities` defines the temporal layer of the DRONSAIR ecosystem.

An activity represents something that happens, is scheduled to happen, or happened within the ecosystem.

Examples include:

* informative talks;
* exhibitions;
* conferences;
* courses;
* certifications;
* demonstrations;
* workshops;
* webinars;
* live transmissions;
* field activities;
* other activities that emerge from the ecosystem.

An activity is a structured and potentially geolocalizable object.

Its structure allows the same activity to be discovered through the map, activity listing, filters, calendar views, and its individual page.

---

## Principle

An activity has its own identity.

The activity does not depend on an editorial note to exist.

A note is an optional semantic layer that provides additional context and meaning.

Therefore:

```text
Activity
 └── extended note → optional
```

An activity may be published without a note.

The first imported activity records will commonly contain only the structured information available from the source corpus.

---

## Activity and Note

The activity is the primary object.

The note is a secondary semantic representation associated with that activity.

```text
ACTIVITY
│
├── structured information
│   ├── type
│   ├── date
│   ├── location
│   ├── organizer
│   └── other known properties
│
└── note → optional
     └── editorial / contextual content
```

The note may explain the activity in greater depth, provide context, highlight its relevance, or communicate information that cannot be adequately represented through structured fields.

The absence of a note does not reduce the validity of the activity.

---

## Temporal Identity

Every activity is temporal.

An activity has a time in which it is scheduled or takes place.

Relevant temporal properties may include:

* start date;
* end date;
* start time;
* end time;
* publication date;
* publication expiration date.

These temporal dimensions should remain distinct.

The occurrence of an activity determines its historical position.

Publication dates determine when its public representation becomes available or ceases to be active.

After an activity has occurred, it is not removed from the system.

It becomes a historical record.

```text
SCHEDULED
    │
    ▼
ACTIVE / UPCOMING
    │
    │ activity occurs
    ▼
HISTORICAL
```

Publication visibility may change independently according to publication rules.

Historical status changes the way the activity is represented, not its identity.

The historical activity remains available for temporal exploration and retrospective discovery.

---

## Location

An activity may have a physical location.

It may also be remote.

For webinars, live transmissions, and other remote activities, a transmission or emission location may be used as a geographic reference when appropriate.

Such a reference represents the known geographic origin of the activity's transmission, not necessarily the physical location where participants are present.

Therefore:

```text
Activity
 ├── physical location
 ├── transmission / emission location
 └── no reliable location
```

Geolocation is evidence-based.

The system must not invent coordinates when the source does not provide sufficient information.

---

## Navigation

Activities exist simultaneously at different levels of exploration.

```text
MAP
 │
 └── Activity
      │
      ▼
 Activity Page
      │
      └── extended note → optional
```

The Activity Page belongs to the complete Activities collection.

```text
Activities

 ├── Activity
 ├── Activity
 ├── Activity
 └── ...
```

The same activity can therefore be reached:

* spatially through the map;
* temporally through the calendar;
* categorically through filters;
* directly through the activity listing;
* semantically through its optional note.

The map is a representation of the ecosystem, not the activity collection itself.

---

## Activities Listing

The Activities listing provides access to the complete activity corpus.

It must support progressive filtering according to available data.

Possible dimensions include:

* date;
* calendar period;
* activity type;
* location;
* topic;
* organizer;
* related ecosystem layer;
* publication status;
* historical status.

Filtering does not create new activity objects.

It changes the way the existing corpus is explored.

---

## Calendar

The calendar is a temporal representation of Activities.

It does not constitute a separate data model.

```text
Activities
     │
     └── Calendar representation
```

The same activity may therefore appear in:

* map view;
* list view;
* calendar view;
* historical view.

All representations refer to the same activity identity.

---

## Sources of Entry

Activities may enter the system through different channels.

### Raw Corpus

The initial mapping process may provide structured activity records.

Raw records may contain incomplete information and may not contain an editorial note.

```text
RAW
 ↓
Activity
```

### Backend

Authorized users may create or edit activities directly from the backend.

This is intended primarily for:

* editorial activities;
* important ecosystem events;
* corrections;
* enrichment;
* activities requiring controlled publication.

```text
BACKEND
 ↓
Activity
```

### Entry Page

A public-facing entry page may allow registered users or authorized contributors to submit activities.

The entry process should remain simple and focused on the information required to represent the activity.

Submitted content enters a review process before publication.

```text
ENTRY PAGE
     │
     ▼
 SUBMISSION
     │
     ▼
  REVIEW
     │
     ▼
PUBLICATION
```

The three channels feed the same underlying Activity model.

They do not create different types of activities.

---

## Publication

Publication is separate from existence.

An activity may exist in the corpus without being publicly visible.

```text
Activity
 ├── exists
 ├── reviewed
 └── published → yes / no
```

Publication may be scheduled.

When an activity has occurred, its temporal status becomes historical.

When a publication reaches its expiration point, its public visibility may change according to publication rules.

Neither event destroys the activity.

The source record remains preserved.

---

## Review

Review is a publication concern.

It should verify the minimum conditions required for public representation without introducing unnecessary editorial complexity.

The system should favor:

```text
submit
  ↓
review
  ↓
publish
```

Where submitted content is already curated by the organization responsible for the activity, review should primarily confirm:

* completeness;
* consistency;
* source;
* publication suitability;
* temporal information;
* location information when applicable.

---

## Provenance

Every activity must preserve its origin.

The system must distinguish between:

* imported activity;
* backend-created activity;
* externally submitted activity;
* editorially enriched activity.

Provenance belongs to the data model and should not be confused with publication status.

An activity may be edited or enriched without losing its original source.

---

## Relationships

Activities may relate to ecosystem nodes.

For example:

```text
Organization
      │
      └── organizes ──► Activity

Activity
      ├── located_at ──► Location
      ├── concerns ────► Topic
      └── related_to ──► Node
```

Relationships allow activities to become part of the broader ecosystem rather than isolated calendar entries.

---

## Progressive Semantic Layer

The system supports progressive enrichment.

The minimum representation is:

```text
Activity
```

A richer representation may become:

```text
Activity
 └── Note
```

Additional relationships may later emerge:

```text
Activity
 ├── Node
 ├── Topic
 ├── Location
 └── Note
```

The architecture therefore allows semantic depth to grow without requiring the initial record to contain everything.

---

## Future Extensions

The Activity model is intentionally extensible.

Future activity-related capabilities may include:

* registration;
* attendance;
* participation;
* recordings;
* streaming links;
* associated documents;
* speakers;
* exhibitors;
* certifications;
* related products;
* related technologies;
* meteorological context;
* photogrammetric or remote-sensing context;
* software or platform references.

These capabilities should be introduced only when supported by actual ecosystem needs.

The initial model remains deliberately small.

---

## Design Principles

Activities follow the same architectural principles as the ecosystem as a whole:

* **One identity, multiple representations.**
* **Structure before semantic enrichment.**
* **Temporal information is intrinsic to Activity.**
* **Historical records are preserved.**
* **Notes are optional.**
* **Location is evidence-based.**
* **Publication is separate from existence.**
* **Provenance is preserved.**
* **Different entry channels feed the same model.**
* **Complexity belongs to the structure, not to the user experience.**

---

## Conceptual Model

The resulting structure is intentionally simple:

```text
                         ACTIVITIES
                              │
              ┌───────────────┼───────────────┐
              │               │               │
             MAP           CALENDAR          LIST
              │               │               │
              └───────────────┼───────────────┘
                              │
                           ACTIVITY
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 UPCOMING            HISTORY
                    │                   │
                    ▼                   ▼
                 ACTIVITY            ACTIVITY
                    │
                    └── NOTE → optional
```

The Activity model provides a temporal and semantic layer for ecosystem exploration while preserving the same structural simplicity established by the Node and Directory models.

**One activity. One identity. Multiple ways to discover it.**
