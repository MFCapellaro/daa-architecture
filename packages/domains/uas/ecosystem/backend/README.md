# Ecosystem Backend

## Purpose

The Ecosystem Backend is the curation and publication layer between imported ecosystem observations and the published ecosystem.

Its responsibility is to transform a collection of source nodes into a coherent, extensible representation without destroying the evidence from which that representation emerged.

The backend may:

* resolve entity identity;
* merge source nodes that represent the same entity;
* preserve all source nodes and their provenance;
* combine layers across merged entities;
* establish explicit relationships between entities;
* associate dealers, operators, suppliers, and other actors with brands;
* manage ecosystem objects such as activities, comparatives, and pools;
* determine whether a canonical entity or ecosystem object is published;
* maintain unpublished source entities and objects;
* generate the projections consumed by the ecosystem map and directory.

The backend does **not** replace the importer.

The importer discovers and normalizes observations.

The backend interprets, relates, consolidates, structures, and publishes them.

---

## Position in the Ecosystem Pipeline

```text
Raw Source
    │
    ▼
Importer
    │
    ▼
Source Nodes
data/nodes/
    │
    ▼
Ecosystem Backend
    │
    ├── Identity Resolution
    ├── Merge
    ├── Layers
    ├── Relationships
    ├── Brand Associations
    ├── Ecosystem Objects
    └── Publication
    │
    ▼
Canonical Ecosystem
    │
    ├── Map Projection
    └── Directory Projection
```

The source node remains the evidence layer.

The canonical ecosystem becomes the coherent structural layer.

The map and directory are projections of that canonical ecosystem.

---

## Core Principle

> **Preserve the source. Publish the coherence.**

A source node must never be destroyed merely because it has been identified as belonging to another entity.

When several source nodes represent the same real-world entity, they are merged into a canonical entity while their provenance remains recoverable.

```text
source A ─┐
source B ─┼──► canonical entity
source C ─┘
```

The canonical entity becomes the published representation.

The source entities remain available for provenance, review, auditing, and future re-evaluation.

---

# 1. Source Nodes

Source nodes are produced by the ecosystem importer.

They represent observations extracted from the raw corpus.

They may contain:

* incomplete information;
* duplicate entities;
* different layers;
* conflicting observations;
* incomplete contact information;
* uncertain classification;
* repeated references to the same entity.

These conditions are expected.

The backend should not require the importer to resolve them prematurely.

The source node is evidence, not yet the final ecosystem entity.

---

# 2. Canonical Entities

A canonical entity represents the backend's current understanding that one or more source nodes refer to the same real-world entity.

A canonical entity may originate from:

* one source node;
* several source nodes;
* several ecosystem layers;
* several independent observations.

Conceptually:

```yaml
canonical:
  id: geosistemas
  sources:
    - geosistemas
    - geosistemas-2
```

The exact storage format is an implementation concern.

The semantic distinction is not:

> **Source identity ≠ Canonical identity**

---

# 3. Identity Resolution

Identity resolution determines whether two or more source nodes represent the same entity.

Evidence may include:

* normalized name;
* website;
* email domain;
* telephone;
* WhatsApp;
* address;
* other explicit source evidence;
* previously established relationships.

Identity resolution must remain conservative.

The backend must not merge entities merely because their names are similar.

Ambiguity should remain visible until sufficient evidence exists.

---

# 4. Merge

Merge consolidates multiple source observations into one canonical entity.

A merge must:

1. preserve every source node;
2. preserve source provenance;
3. create or reference one canonical identity;
4. combine compatible layers;
5. preserve useful information from all sources;
6. retain conflicting observations when they cannot safely be resolved;
7. prevent absorbed source nodes from being independently published when appropriate.

Example:

```text
Geosistemas
  ├── source: geosistemas
  │     layer: suppliers
  │
  └── source: geosistemas-2
        layer: technology

              │
              ▼

        canonical: geosistemas
        layers:
          - suppliers
          - technology
```

The same entity can therefore appear in multiple map layers without becoming multiple published entities.

---

# 5. Layers

Layers describe ecosystem participation.

When source nodes are merged, their compatible layers are retained.

```text
source A → technology
source B → suppliers

canonical → technology + suppliers
```

Layer membership belongs to the canonical representation.

The map can therefore expose the same entity through multiple layers without duplicating the entity.

---

# 6. Relationships

Relationships connect canonical entities without collapsing them.

Examples include:

```text
dealer_of
manufacturer_of
supplies
operates
insures
trains
organizes
participates_in
associated_with
```

A relationship must not be used as a substitute for identity resolution.

For example:

```text
Lumadron ── dealer_of ──► DJI
```

does not imply:

```text
Lumadron = DJI
```

Relationships describe structure between entities.

Merges describe identity.

---

# 7. Brands

Brand association is a relationship, not an identity merge.

A dealer representing DJI does not become DJI.

```text
Lumadron ── dealer_of ──► DJI
```

A dealer may represent one or several brands.

This allows the backend to support:

* mono-brand dealers;
* multi-brand dealers;
* manufacturer networks;
* brand filtering;
* distribution relationships;
* future commercial ecosystem views.

Brand relationships should remain explicit rather than being encoded as aliases of the dealer.

---

# 8. Directory

The directory is a non-geographic projection of the canonical ecosystem.

Its purpose is to provide structured exploration of entities and their relationships without requiring the user to interact with the map.

The directory may expose:

* identity;
* category;
* layers;
* location;
* contact information;
* website;
* brands;
* capabilities;
* relationships;
* activities;
* relevant ecosystem objects.

The directory may contain information that would be excessive or inappropriate for the map.

For example, an organization's internal structure may belong in its directory representation rather than being converted into map nodes.

This distinction prevents the map from becoming saturated while preserving informational depth.

```text
Canonical Entity
      │
      ├──► Map projection
      │
      └──► Directory projection
```

Both projections represent the same canonical ecosystem.

---

# 9. Activities

Activities represent time-bound or participation-based ecosystem events and actions.

Examples may include:

* exhibitions;
* expos;
* congresses;
* courses;
* demonstrations;
* presentations;
* workshops;
* promotional activities;
* other emerging activities.

An activity may relate to multiple entities.

```text
Activity
   │
   ├── organizer
   ├── participants
   ├── exhibitors
   ├── sponsors
   └── location
```

Activities should not be embedded indiscriminately into entity nodes.

They are independent ecosystem objects that establish relationships with entities.

This allows the same activity to appear in:

* the map;
* the directory;
* calendars;
* entity profiles;
* future discovery interfaces.

---

# 10. Comparatives

Comparatives represent structured comparison between products, brands, technologies, services, or other comparable entities.

A comparative may include:

* products;
* manufacturers;
* capabilities;
* measurable characteristics;
* contextual criteria;
* source evidence.

Example:

```text
DJI Agras T50 ─┐
               ├── comparative
XAG P150       ┘
```

Comparatives are not identity records.

They are structured relationships and observations derived from the ecosystem corpus.

They may later support:

* product comparison;
* technology exploration;
* capability analysis;
* purchasing decisions;
* research.

The comparative model should remain extensible because the criteria themselves may emerge from the corpus.

---

# 11. Pools

Pools represent coordinated groups of entities, resources, demand, supply, or opportunities.

Examples may include:

* collective purchasing;
* shared transport;
* service pools;
* equipment pools;
* demand aggregation;
* supplier aggregation;
* future cooperative mechanisms.

A pool may relate to:

* participants;
* products;
* suppliers;
* geographic areas;
* activities;
* conditions;
* status.

Example:

```text
Pool
  │
  ├── participants
  ├── products
  ├── supplier
  ├── geographic scope
  └── status
```

Pools are ecosystem objects rather than properties of individual nodes.

This allows the same entity to participate in multiple pools without duplicating the entity itself.

---

# 12. Publication

Identity and publication are separate decisions.

An entity may exist in the corpus without being published.

The backend therefore maintains publication state independently from source existence.

Conceptually:

```yaml
publication:
  published: true
```

A source node absorbed into a canonical entity may remain:

```yaml
publication:
  published: false
  mergedInto: geosistemas
```

This allows the system to preserve historical and observational evidence without exposing duplicate nodes to users.

Publication may depend on:

* identity resolution;
* verification status;
* completeness;
* editorial decisions;
* backend curation;
* future publication rules.

The importer does not decide publication.

---

# 13. Provenance

Every canonical entity and ecosystem object must remain traceable to its source observations.

Provenance should allow the system to answer:

* Where did this entity come from?
* Which source records were merged?
* Which raw line produced each observation?
* Which layer contributed each observation?
* Which source supports a relationship?
* Why is this entity published?
* Why was a source node not published?

Provenance is part of the evidence model, not merely debugging information.

---

# 14. Review

The backend may identify situations requiring human review.

Examples:

* ambiguous duplicate names;
* conflicting websites;
* conflicting contact information;
* uncertain brand association;
* possible identity collisions;
* incomplete merge evidence;
* uncertain relationships;
* insufficient evidence for publication.

Review should improve the canonical representation without modifying the original observation.

---

# 15. Extensibility & Emergence

The backend is intentionally open to ecosystem structures that are not yet fully known.

New domains should not be introduced merely because they are imaginable.

They should emerge from evidence, relationships, and recurring ecosystem needs.

Potential future domains may include:

* meteorology;
* photogrammetry;
* agricultural data services;
* EOSDA integrations;
* software;
* insurance services;
* training systems;
* new service categories;
* other capabilities revealed by the ecosystem.

These are examples, not predefined commitments.

The architecture should allow a new domain to be introduced without restructuring the existing identity, relationship, publication, map, or directory foundations.

The guiding principle is:

> **Do not anticipate the form of an emerging capability. Provide the structure through which it can become coherent when it emerges.**

---

# 16. Determinism

Backend operations should be deterministic.

Given the same source nodes and the same curation decisions, the backend should produce the same canonical representation.

This is particularly important for:

* identity resolution;
* merge operations;
* relationship generation;
* brand associations;
* publication;
* generated datasets.

---

# 17. Relationship to the Importer

The importer answers:

> **What did the source corpus say?**

The backend answers:

> **What do these observations represent together?**

The published ecosystem answers:

> **What can the ecosystem expose coherently?**

```text
Importer
  observation
       ↓
Backend
  interpretation
       ↓
Canonical Ecosystem
  coherence
       ↓
Map / Directory / Ecosystem Objects
  exploration
```

This distinction is fundamental.

The importer should therefore remain deliberately simple.

Controlled complexity belongs in the backend.

---

# 18. Relationship to Map and Directory

The map and directory consume the published canonical ecosystem.

They should not independently perform:

* duplicate detection;
* identity resolution;
* merge logic;
* brand inference;
* publication decisions.

The same canonical ecosystem should feed multiple representations.

```text
                 ┌──► Map
                 │
Canonical Model ─┼──► Directory
                 │
                 ├──► Activities
                 ├──► Comparatives
                 └──► Pools
```

One ecosystem.

Multiple projections and structures.

---

# 19. What the Backend Does Not Do

The backend does not:

* read the raw corpus directly;
* replace the importer;
* invent missing source information;
* silently overwrite source observations;
* geocode uncertain locations;
* infer semantic identity from weak evidence;
* delete source nodes after merging;
* treat brands as aliases of dealers;
* decide the visual design of the map;
* duplicate entities merely to satisfy different views;
* encode every future ecosystem capability prematurely.

The backend prepares the coherent ecosystem representation.

Presentation remains the responsibility of the consuming interfaces.

---

# Guiding Principle

The ecosystem is not a list of organizations.

It is a network of:

* entities;
* identities;
* layers;
* relationships;
* brands;
* activities;
* comparatives;
* pools;
* evidence;
* and capabilities that may emerge over time.

The backend is the layer where these observations become structurally coherent while remaining traceable to their origins.

> **Preserve the evidence.
> Allow coherence to emerge.
> Publish what has become coherent.**
