# Merge

## Purpose

The **Merge** layer determines when multiple source nodes represent the same real-world entity and establishes a canonical merged representation without destroying the original evidence.

Merge is a backend operation.

It does not modify the source corpus.

It does not redefine identity.

It does not decide whether an entity should be visible on the map.

Its responsibility is to establish a coherent relationship between source records and a canonical entity representation.

---

## 1. Principle

Multiple observations may refer to the same entity.

A source node represents an observation.

A merged node represents the entity resulting from the controlled convergence of those observations.

Therefore:

**Source nodes are preserved.**

**Merged nodes are derived.**

**Publication is a separate decision.**

---

## 2. Responsibilities

Merge is responsible for:

* detecting candidate duplicate entities;
* confirming or rejecting a merge;
* establishing a canonical node;
* combining compatible information;
* combining `layers`;
* preserving source references;
* preserving provenance;
* recording merge decisions;
* preventing accidental information loss;
* supporting entities that legitimately belong to multiple ecosystem layers.

Merge is not responsible for:

* parsing raw data;
* normalizing source records;
* semantic identity definition;
* geocoding;
* publishing nodes;
* rendering the map;
* managing directory structures;
* managing activities, comparisons or pools.

---

## 3. Source → Merge → Publication

The backend follows this conceptual flow:

```text
RAW SOURCE
    ↓
IMPORT
    ↓
SOURCE NODES
    ↓
IDENTITY
    ↓
MERGE
    ↓
CANONICAL NODE
    ↓
PUBLICATION
    ↓
MAP / DIRECTORY / OTHER EXPERIENCES
```

The source node remains available throughout the process.

The canonical node is a derived representation.

Publication determines whether that representation becomes externally visible.

---

## 4. Why Merge Exists

The same entity may appear several times because it was discovered through different ecosystem perspectives.

For example:

```text
Geosistemas
    ├── technology
    └── another source observation

Lumadron
    ├── drones
    ├── brands
    └── another source observation
```

These records should not necessarily become multiple points on the public map.

The backend should instead be capable of producing:

```text
GEOSISTEMAS
layers:
  - technology
  - ...

sourceNodes:
  - geosistemas
  - geosistemas-2
```

while preserving both observations.

---

## 5. Merge Candidate

A record may become a merge candidate when evidence indicates that two or more source nodes refer to the same entity.

Possible evidence includes:

* normalized name;
* explicit website;
* domain;
* email domain;
* telephone number;
* WhatsApp number;
* address;
* city;
* known brand relationship;
* explicit source references;
* human review.

No single weak signal should automatically establish semantic identity when ambiguity remains.

Merge must preserve ambiguity rather than silently collapsing unrelated entities.

---

## 6. Merge Decision

A merge decision should have an explicit status.

Conceptually:

```yaml
merge:
  status: confirmed
  canonicalId: geosistemas
  sourceNodes:
    - geosistemas
    - geosistemas-2
```

Possible statuses may include:

```text
candidate
confirmed
rejected
manual-review
```

The exact implementation may evolve.

The important principle is that **a merge decision is itself data**.

---

## 7. Canonical Node

The canonical node is the backend representation of the merged entity.

It should:

* have a stable ID;
* preserve the canonical name;
* combine compatible layers;
* expose consolidated contact and presence data;
* retain provenance;
* reference its source nodes;
* be independently publishable.

Example:

```yaml
id: geosistemas

name: Geosistemas

type: company

layers:
  - technology

sourceNodes:
  - geosistemas
  - geosistemas-2

merge:
  status: confirmed
```

The canonical node is **derived**, not a replacement for the source records.

---

## 8. Layer Union

One of the primary purposes of Merge is allowing an entity to belong to more than one ecosystem layer.

For example:

```text
Source A
layers:
  - drones

Source B
layers:
  - technology
```

becomes:

```text
Canonical entity
layers:
  - drones
  - technology
```

This allows the same entity to appear in multiple map contexts without creating duplicate entities.

The map can therefore query the canonical entity by layer.

---

## 9. Brand Relationships

Brands require explicit relationships rather than duplicate entity creation.

For example, a dealer representing a single drone manufacturer may contain:

```yaml
brands:
  - dji
```

A multi-brand dealer may contain:

```yaml
brands:
  - dji
  - xag
  - topxgun
```

The dealer remains one entity.

The brands remain distinct entities.

The relationship belongs to the backend domain model.

---

## 10. Lumadron-Type Cases

Some entities may participate in several ecosystem dimensions simultaneously.

For example:

```text
Lumadron
    ├── drone operator
    ├── dealer
    └── brand relationship
```

Merge must not flatten these roles into a single semantic category.

Instead, the canonical node preserves the entity while relationships express its different roles.

This prevents the map from generating artificial duplicates merely because an entity participates in different layers.

---

## 11. Source Preservation

Merge must never delete source nodes.

Source records provide:

* provenance;
* original wording;
* discovery context;
* historical evidence;
* traceability;
* future re-evaluation.

Therefore:

```text
source node ≠ disposable duplicate
```

A merged node should always be able to answer:

> Which observations produced this entity?

---

## 12. Conflict Handling

Source nodes may contain conflicting information.

Examples:

* different telephone numbers;
* different addresses;
* different websites;
* different names;
* different classifications.

Merge must not silently overwrite conflicting evidence.

Possible strategies include:

```text
preferred value
alternative value
conflict
unverified
```

The source evidence remains accessible.

Resolution may occur later through verification or backend review.

---

## 13. Provenance

Every merged attribute should remain traceable to its source whenever practical.

Conceptually:

```yaml
provenance:
  website:
    value: "https://example.com"
    sourceNodes:
      - example
  phone:
    value: "+54 ..."
    sourceNodes:
      - example-2
```

The implementation may initially use a simpler structure.

The architectural requirement is:

**Derived information must remain traceable to evidence.**

---

## 14. Idempotence

Running the merge process repeatedly with the same source data should not produce progressively different entities.

The operation should be deterministic.

Given:

```text
same source nodes
+
same merge decisions
```

the backend should produce:

```text
same canonical entity
```

This is essential for repeatable corpus imports.

---

## 15. Manual Review

Automatic detection should identify candidates.

It should not force uncertain merges.

A candidate may therefore remain unresolved:

```yaml
merge:
  status: manual-review
```

This allows the backend to continue processing the corpus without converting uncertainty into false identity.

---

## 16. Publication Boundary

Merge does not publish.

After merging:

```text
source nodes
    ↓
canonical node
    ↓
publication decision
```

The publication layer determines whether:

* the source node is visible;
* the canonical node is visible;
* both remain internal;
* only the merged representation appears publicly.

The normal case for a confirmed merge is:

```text
source nodes → preserved internally
canonical node → published
```

This separation prevents the public map from becoming a representation of the import process itself.

---

## 17. Relationship to the Map

The map should consume canonical published entities.

It should not need to understand:

* duplicate detection;
* source records;
* merge heuristics;
* corpus history.

Therefore:

```text
Corpus
   ↓
Source Nodes
   ↓
Merge
   ↓
Canonical Entities
   ↓
Publication
   ↓
Map
```

The map represents the ecosystem.

The backend manages how that representation is constructed.

---

## 18. Relationship to Identity

Identity and Merge are related but distinct.

**Identity** determines the conceptual identity of an entity.

**Merge** determines whether multiple observations can be represented by that identity.

Therefore:

```text
Identity
    ↓
Who is this?

Merge
    ↓
Which observations belong to the same entity?
```

Merge must never redefine an entity merely because two records look similar.

---

## 19. Relationship to Directory

An organization's internal structure is not a merge problem.

The organization itself may be one canonical entity:

```text
Aapresid
```

Its internal structure belongs to the Directory domain:

```text
Aapresid
    ├── board
    ├── departments
    ├── regional nodes
    └── other internal structures
```

The map can therefore represent Aapresid as one ecosystem node while the Directory provides deeper exploration.

---

## 20. Future Extensions

The Merge layer should remain generic enough to support future ecosystem domains such as:

* meteorology;
* photogrammetry;
* EOSDA integrations;
* software;
* agricultural services;
* data providers;
* training;
* insurance;
* infrastructure;
* emerging technologies.

The merge mechanism should operate on entity identity and evidence, not on a fixed list of ecosystem categories.

---

## 21. Architectural Principle

Merge transforms **multiple observations into one coherent representation** without erasing the observations that produced it.

The fundamental invariant is:

```text
Many source nodes
        ↓
One canonical entity
        ↓
Many possible relationships and layers
```

while preserving:

```text
provenance
+
ambiguity
+
source evidence
```

This keeps the ecosystem extensible, auditable and capable of evolving as new observations emerge.
