# Identity Resolution

## Purpose

Identity Resolution determines whether two or more source nodes represent the same real-world entity.

It is the first semantic curation stage of the Ecosystem Backend.

Its purpose is not to normalize source data.

Its purpose is to establish whether different observations can be understood as referring to one entity while preserving uncertainty when the evidence is insufficient.

---

## Position in the Backend

```text id="q5b6zn"
Source Nodes
     │
     ▼
Identity Resolution
     │
     ├── same entity
     │      ↓
     │    Merge
     │
     ├── different entities
     │      ↓
     │    Keep separate
     │
     └── uncertain
            ↓
          Review
```

Identity Resolution precedes Merge.

No merge should occur without an identity decision.

---

## Core Principle

> **Identity must be established from evidence, not similarity alone.**

Two records having similar names does not prove that they represent the same entity.

Identity Resolution therefore evaluates multiple observable signals and preserves ambiguity when the available evidence does not support a sufficiently reliable conclusion.

---

# 1. Source Identity

Every imported node has a source identity.

The source identity is immutable evidence produced by the importer.

Examples:

```text id="8q3n7a"
geosistemas
geosistemas-2

lumadron
lumadron-2
lumadron-3
```

The existence of multiple source IDs does not imply that the entities are different.

Likewise, similar IDs do not imply that they are the same.

The backend must establish that relationship explicitly.

---

# 2. Canonical Identity

A canonical identity represents the backend's current understanding of a real-world entity.

One canonical identity may reference:

```text id="4ajp5q"
source A
source B
source C
```

The canonical identity is not a replacement for the source identities.

It is a higher-level interpretation supported by them.

---

# 3. Evidence Signals

Identity Resolution may use observable evidence such as:

### Strong signals

* identical explicit website;
* identical normalized domain;
* identical email domain combined with compatible entity name;
* identical telephone number;
* identical WhatsApp number;
* explicit source statement establishing equivalence;
* an existing trusted canonical relationship.

### Supporting signals

* normalized organization name;
* address;
* city;
* province;
* contact information;
* brand relationships;
* source section;
* other compatible observations.

No individual weak signal should automatically establish identity.

---

# 4. Website Identity

A website is one of the strongest identity signals.

For example:

```text id="v4m0g2"
https://lumadron.com/
https://lumadron.com/
```

strongly supports a common identity.

However, a website should not automatically override contradictory evidence.

A shared domain may represent:

* a corporate group;
* multiple branches;
* multiple organizations;
* a brand and its distributor;
* a parent organization and subsidiary.

The backend should therefore preserve the distinction between:

> **same website**

and

> **same entity**

---

# 5. Contact Identity

Telephone and WhatsApp numbers may provide strong identity evidence.

Normalized contact information should be compared independently of formatting.

For example:

```text
+54 11 43429398
```

and an equivalent source representation may be treated as the same observed contact number.

Contact information must not be used as proof of identity when it is clearly shared across multiple entities.

Examples include:

* call centers;
* corporate switchboards;
* parent organizations;
* shared offices;
* service providers.

---

# 6. Name Similarity

Names provide useful evidence but are insufficient by themselves.

Examples:

```text
Geosistemas
Geosistemas S.A.
GEOSISTEMAS
```

may represent one entity.

But:

```text
Agro Drone
Agro Drones
Agro Drone Solutions
```

must not be automatically merged merely because their names are similar.

Name normalization is therefore a discovery mechanism, not an identity decision.

---

# 7. Location Evidence

Location can strengthen an identity decision.

Compatible:

```text id="4j2z4p"
same name
same website
same city
```

Contradictory:

```text id="xg8a8u"
same name
different website
different province
```

Location should therefore be treated as supporting evidence rather than an absolute identity key.

Organizations may have:

* multiple offices;
* branches;
* regional operations;
* headquarters in one location and operations in another.

---

# 8. Layer Evidence

Different layers do not imply different entities.

For example:

```text id="j7l4az"
Geosistemas
  → technology

Geosistemas-2
  → suppliers
```

may represent one entity participating in two ecosystem layers.

Identity Resolution must therefore operate **across layers**.

A layer is an observation of participation, not an identity boundary.

---

# 9. Brand Relationships

Brand relationships provide contextual evidence but do not establish identity by themselves.

For example:

```text id="p5r9jv"
Lumadron ── dealer_of ── DJI
```

does not imply that every node mentioning DJI and Lumadron is necessarily the same entity.

Brand relationships should be evaluated together with identity evidence.

---

# 10. Resolution States

Identity Resolution should produce an explicit state.

Conceptually:

```yaml id="d5qf5x"
identity:
  resolution: confirmed
```

Possible states include:

```text
confirmed
probable
uncertain
distinct
review
```

The exact enum may evolve with implementation.

The important principle is that uncertainty must be representable.

---

# 11. Confirmed Identity

A `confirmed` identity means the available evidence is sufficiently strong to establish that the source nodes represent the same entity.

Example:

```text id="i7p0m8"
geosistemas
geosistemas-2
      │
      ▼
confirmed: geosistemas
```

This allows the Merge stage to proceed.

---

# 12. Probable Identity

A `probable` identity means several independent signals support a common identity, but the evidence is not strong enough to justify automatic consolidation.

Example:

```text id="4u6x6p"
similar name
same city
compatible phone
different or missing website
```

The backend may flag this for review.

It should not silently merge it.

---

# 13. Uncertain Identity

An `uncertain` state means that the available evidence does not support a reliable identity conclusion.

The source nodes remain independent.

No merge occurs.

---

# 14. Distinct Identity

A `distinct` state explicitly records that two similar observations represent different entities.

This is valuable because it prevents the same ambiguity from being reconsidered repeatedly.

Example:

```text id="0e2s4h"
Agro Drone A
Agro Drone B

identity:
  resolution: distinct
```

---

# 15. Review

Human review is a first-class part of Identity Resolution.

Review may be required when:

* evidence conflicts;
* several entities share contact information;
* websites differ;
* names are highly similar;
* a corporate relationship is unclear;
* branches and headquarters may be confused;
* a brand relationship creates ambiguity;
* automated confidence is insufficient.

Review should record the decision without modifying the original evidence.

---

# 16. Automatic vs Manual Resolution

The backend should distinguish between:

### Automatic resolution

Used when evidence is sufficiently strong and unambiguous.

Examples:

```text
identical explicit website
+
compatible entity name
```

or:

```text
identical normalized phone
+
compatible organization identity
```

### Manual resolution

Used when:

* evidence is incomplete;
* signals conflict;
* multiple entities are plausible;
* the consequence of an incorrect merge is significant.

The objective is not maximum automation.

The objective is **safe and reproducible curation**.

---

# 17. Resolution Must Be Reversible

An identity decision must be reversible.

If later evidence demonstrates that a merge was incorrect, the system must be able to:

1. remove the identity association;
2. restore the source entities as independent identities;
3. preserve the original source observations;
4. rebuild the canonical representation.

This is another reason source nodes must never be deleted.

---

# 18. Identity vs Relationship

Identity Resolution must remain separate from relationship discovery.

These are fundamentally different:

```text id="6l5t0q"
A = B
```

versus:

```text id="f6r5x8"
A ── related_to ──► B
```

For example:

```text id="3f5m6k"
Lumadron ── dealer_of ──► DJI
```

means that two entities are related.

It does not mean they are one entity.

---

# 19. Identity vs Layer

Layers must never be used as identity keys.

The same canonical entity may belong to multiple layers:

```text id="0t0i6v"
Geosistemas
  ├── technology
  └── suppliers
```

Identity exists independently of layer membership.

---

# 20. Identity vs Publication

Identity Resolution does not decide whether an entity should be visible on the public ecosystem.

These are separate decisions.

```text id="k3f0fs"
Identity
    ↓
Canonical Entity
    ↓
Publication
```

An entity may have confirmed identity and still remain unpublished.

---

# 21. Provenance

Every identity decision should be traceable to its evidence.

The backend should be able to answer:

* Which source nodes were evaluated?
* Which signals supported the decision?
* Which signals contradicted it?
* Was the decision automatic or manual?
* Who or what established the decision?
* When was the decision made?
* Can the decision be reconsidered?

Provenance is part of identity management.

---

# 22. Determinism

Given the same source nodes and the same resolution rules, Identity Resolution should produce deterministic results.

Equivalent observations should not randomly produce different identities between executions.

Manual decisions must therefore be represented as explicit data rather than hidden procedural behavior.

---

# 23. Non-Goals

Identity Resolution does not:

* modify source nodes;
* delete duplicates;
* perform the merge itself;
* create commercial relationships;
* determine publication;
* geocode locations;
* infer missing information;
* replace human judgment where evidence is insufficient;
* decide how entities should appear visually on the map.

Its responsibility ends at the identity decision.

---

# 24. Output Contract

The Identity Resolution stage should provide enough information for the Merge stage to act safely.

Conceptually:

```yaml id="9k6x2s"
identityResolution:
  canonicalId: geosistemas
  sources:
    - geosistemas
    - geosistemas-2
  resolution: confirmed
  method: automatic
  evidence:
    - website
    - name
```

For an unresolved case:

```yaml id="7r8v6h"
identityResolution:
  sources:
    - example-a
    - example-b
  resolution: review
  method: automatic
  evidence:
    - name
    - city
```

The exact implementation may change.

The semantic contract should remain:

> **Identity Resolution produces an explicit, traceable decision about identity without destroying the observations from which that decision was derived.**

---

# Guiding Principle

> **Do not merge what merely resembles.
> Resolve what the evidence connects.
> Preserve what remains uncertain.**

# Identity & Merge

## Purpose

The Identity & Merge component resolves multiple ecosystem source nodes into canonical entities without destroying or altering their provenance.

It establishes the distinction between:

* source observations;
* identity resolution;
* canonical entities;
* publication state.

Its purpose is to make the ecosystem coherent while preserving the evidence from which that coherence was produced.

---

## 1. Source Nodes

Source nodes are the direct result of ecosystem discovery and import.

They represent observations extracted from source material.

A source node may contain:

* a name;
* contact information;
* website;
* location;
* layer;
* brand information;
* provenance;
* verification state;
* raw source data.

Source nodes are preserved.

They are not rewritten to represent the canonical entity.

---

## 2. Identity Resolution

Identity resolution determines whether two or more source nodes represent the same real-world entity.

The resolution process may use evidence such as:

* normalized name;
* website;
* domain;
* telephone;
* email;
* address;
* explicit relationships;
* manually confirmed equivalence.

Identity resolution must not infer equivalence from insufficient evidence.

When identity is uncertain, the ambiguity remains visible and the source nodes remain independent.

---

## 3. Canonical Entity

When multiple source nodes are confirmed as the same entity, the backend creates or updates a canonical node.

The canonical node represents the resolved entity rather than any individual source observation.

A canonical node may aggregate information from multiple source nodes.

The canonical node must preserve provenance through references to its contributing source nodes.

Conceptually:

```text
Source Node A ─┐
               ├──> Canonical Node
Source Node B ─┘
```

The canonical node becomes the representation consumed by public ecosystem services.

---

## 4. Merge Semantics

Merge does not mean deleting or replacing source nodes.

Merge means:

1. identify source nodes representing the same entity;
2. establish their equivalence;
3. create or update a canonical entity;
4. preserve all contributing source references;
5. consolidate compatible information;
6. preserve conflicting information when it cannot be safely resolved.

The backend must never silently discard source evidence.

A merge may therefore produce:

```text
canonical:
  id: geosistemas
  layers:
    - technology
    - suppliers

sources:
  - geosistemas
  - geosistemas-2
```

The source nodes remain available for audit, correction and future reprocessing.

---

## 5. Layer Preservation

Identity is independent from layer membership.

A single canonical entity may belong to multiple ecosystem layers.

For example, an entity may simultaneously be:

* a technology provider;
* a drone dealer;
* a service provider;
* a supplier.

The merge process must therefore operate on **identity**, not on layer.

When source nodes with different layers are merged, the canonical node inherits the relevant layers.

```text
Source A
  layer: technology

Source B
  layer: drones

        ↓ merge

Canonical Entity
  layers:
    - technology
    - drones
```

This allows the same entity to appear in multiple map layers without duplicating the entity itself.

---

## 6. Brands

Brands are relationships of an entity and must not be confused with entity identity.

A dealer may represent:

* one brand;
* multiple brands;
* a brand temporarily;
* different brands in different contexts.

The backend should therefore represent brand association explicitly.

Example:

```text
Dealer
  ├── brand: DJI
  ├── brand: XAG
  └── brand: TopXGun
```

A mono-brand dealer should retain the explicit relationship even when only one brand is present.

This allows brand-based exploration without creating artificial duplicate entities.

---

## 7. Publication

Identity resolution and publication are separate concerns.

A canonical entity may exist without being publicly visible.

The backend therefore determines publication independently of source preservation.

Conceptually:

```text
Source Nodes
     ↓
Identity Resolution
     ↓
Canonical Entity
     ↓
Publication Decision
     ↓
Public Ecosystem
```

Possible states include:

* unpublished;
* published;
* suspended;
* archived.

Publication state belongs to the canonical representation, not to the source observation.

---

## 8. Source Preservation

Source nodes are part of the evidence layer.

They should remain available even when:

* they have been merged;
* they are not published;
* they contain obsolete information;
* they contain conflicting information;
* they have been superseded by a canonical entity.

This makes the import process reversible and auditable.

The backend should be able to answer:

> Why does this canonical entity exist?

and:

> Which source observations produced it?

---

## 9. Provenance

Every canonical entity must retain references to its contributing source nodes.

Provenance should allow the backend to trace:

* source node IDs;
* source file;
* source line;
* source section;
* import cycle;
* merge decision;
* review status.

Provenance is not public ecosystem content by default.

It is backend evidence.

---

## 10. Review

Not every identity decision should be automated.

The backend should support a review state for cases where:

* names are similar but not conclusive;
* websites differ;
* contact information conflicts;
* multiple locations exist;
* one entity may have changed identity;
* a relationship requires human confirmation.

A review decision should produce an explicit record rather than silently modifying the source data.

---

## 11. Canonical vs Source Visibility

The source layer and public layer have different purposes.

### Source layer

Preserves:

* observations;
* raw wording;
* provenance;
* duplicates;
* uncertainty;
* historical records.

### Canonical layer

Provides:

* resolved identity;
* consolidated information;
* relationships;
* layers;
* publication state.

### Public layer

Provides only the canonical entities and relationships selected for publication.

This separation prevents the public map from becoming a visualization of the import process itself.

---

## 12. Future Relationships

Identity & Merge must remain independent from the specific ecosystem capabilities that may emerge later.

Canonical entities may eventually participate in relationships involving:

* activities;
* events;
* comparisons;
* purchasing pools;
* meteorology;
* photogrammetry;
* EOSDA services;
* software;
* training;
* insurance;
* logistics;
* other emerging ecosystem capabilities.

These relationships must not require changes to the fundamental identity model.

Identity establishes **who or what the entity is**.

Relationships establish **how it participates in the ecosystem**.

---

## 13. Core Principle

The backend does not erase complexity by deleting evidence.

It transforms observed complexity into coherent canonical representation while preserving the path between the two.

```text
Observation
    ↓
Source Node
    ↓
Identity Resolution
    ↓
Canonical Entity
    ↓
Relationships
    ↓
Publication
    ↓
Ecosystem
```

Identity is the foundation.

Merge creates coherence.

Publication creates visibility.
