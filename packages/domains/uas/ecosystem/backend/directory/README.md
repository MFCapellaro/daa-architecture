# Directory

## Purpose

`Directory` provides the extended representation of published ecosystem Nodes.

Every published Node represented in the ecosystem map may also be represented in the Directory.

The Directory does not create a second identity for the entity.

It extends the canonical ecosystem Node when additional organizational, structural, relational, or contact information exists.

The Directory is therefore an optional depth layer over an existing ecosystem identity.

---

## 1. Core Principle

> **Every published ecosystem Node is eligible for Directory representation.**

The Directory is not a separate ecosystem.

It is an extended representation of the same ecosystem identity.

```text
ECOSYSTEM NODE
      │
      ├── MAP
      │    └── minimal public representation
      │
      └── DIRECTORY
           └── extended representation
                └── additional information when available
```

Directory depth is progressive.

A Node does not need extended information in order to exist.

---

## 2. Map and Directory

The two representations have different purposes.

### Map

The Map answers:

> **What exists, where is it, and how does it relate to the ecosystem?**

It prioritizes:

* identity;
* location;
* presence;
* layers;
* public relationships;
* spatial discovery.

### Directory

The Directory answers:

> **What is this entity, and what additional structure surrounds it?**

It may include:

* organizational structure;
* people;
* roles;
* areas;
* departments;
* branches;
* internal contacts;
* extended relationships;
* additional institutional information.

The Directory does not require all of these fields to exist.

Its depth depends on the available evidence and the operational value of the information.

---

## 3. One Identity

Map and Directory representations share the same canonical Node identity.

```yaml
id: kampu
```

The Directory references the canonical ecosystem Node rather than creating a second entity.

Conceptually:

```text
Directory representation
       │
       └── nodeRef ──────► Canonical Node
```

This prevents identity duplication and allows both representations to remain synchronized.

The Directory does not establish an independent identity for the entity.

---

## 4. No Duplication

Basic Node information belongs to the canonical ecosystem Node.

The Directory consumes that information by reference.

For example, the Directory should not independently redefine:

* name;
* identity;
* location;
* website;
* primary presence;
* ecosystem layers.

Instead:

```text
CANONICAL NODE

   │
   ├── identity
   ├── location
   ├── presence
   └── layers
          │
          ▼
      DIRECTORY
          │
          └── extended information
```

If the canonical Node changes, the Directory reflects the updated basic information.

The Directory may add information, but it does not fork the canonical identity.

---

## 5. Extended Information

Extended information exists only where evidence or operational value justifies it.

Examples:

```text
Organization
 ├── executive structure
 ├── departments
 ├── regional offices
 ├── people
 ├── responsibilities
 └── internal relationships
```

For a dealer:

```text
Dealer
 ├── sales
 ├── logistics
 ├── technical support
 └── after-sales
```

For an institution:

```text
Institution
 ├── authorities
 ├── areas
 ├── programs
 ├── regional structure
 └── associated people
```

The absence of extended information does not prevent an entity from being represented in the Directory.

---

## 6. Directory Corpus

Directory information may be maintained in a separate raw corpus.

```text
data/raw/

├── ecosystem-source.txt
└── directory-source.txt
```

The separation is intentional.

The ecosystem corpus describes:

> **presence in the ecosystem**

The Directory corpus describes:

> **internal or extended structure**

The two corpora may refer to the same entity without duplicating its identity.

The separation also allows each corpus to preserve its own source evidence and editorial boundaries.

---

## 7. Directory Reference

A Directory representation is associated with the canonical ecosystem Node.

Conceptually:

```yaml
nodeRef: kampu

extended:
  ...
```

The `nodeRef` establishes correspondence with the canonical ecosystem identity.

The Directory importer must resolve this relationship before creating the extended representation.

A Directory record must never silently create a second ecosystem identity when the corresponding Node is unresolved.

---

## 8. Publication Relationship

Public Directory representation is subject to ecosystem publication.

Conceptually:

```text
SOURCE
   ↓
IDENTITY
   ↓
MERGE
   ↓
PUBLICATION
   ↓
CANONICAL NODE
   ↓
DIRECTORY
```

The Directory does not independently determine whether an entity belongs to the public ecosystem.

Publication establishes the public boundary.

An internal Directory record may exist during processing or enrichment, but it does not become publicly visible merely because Directory information exists.

---

## 9. Incomplete Directory Information

A published Node may exist in the Directory with no extended information.

This is valid.

```text
MAP
 └── published Node

DIRECTORY
 └── same Node
      └── no extended data yet
```

As new information emerges, the Directory can be enriched without modifying the Map representation.

This allows the corpus to grow progressively.

---

## 10. Bidirectional Navigation

The public experience should support navigation in both directions.

### Map → Directory

```text
Map Node
   ↓
Directory
   ↓
Extended information
```

### Directory → Map

```text
Directory
   ↓
Canonical Node
   ↓
Map representation
   ↓
Map location
```

The two views therefore remain different representations of the same entity rather than disconnected interfaces.

---

## 11. People and Internal Structure

People may appear in Directory information when they are relevant to the structure or operation of an ecosystem entity.

Examples include:

* president;
* director;
* sales representative;
* logistics manager;
* technical representative;
* post-sales contact.

At this stage, people should not automatically become independent ecosystem Nodes.

Their relationship to the organization belongs to the Directory representation.

This distinction is particularly important during corpus import: a person listed together with an organizational role does not, by that fact alone, constitute an organization or an independent ecosystem entity.

A person may become an independent ecosystem identity later only when sufficient evidence establishes that identity and its relevance to the ecosystem.

---

## 12. Growth Model

The Directory is designed to grow incrementally.

An entity may begin as:

```text
Node
```

Then become:

```text
Node
└── Directory
```

And later evolve into:

```text
Node
└── Directory
    ├── Areas
    ├── People
    ├── Roles
    ├── Branches
    └── Relationships
```

No change to the canonical Node identity is required as information becomes richer.

The Directory adds depth without replacing the underlying identity.

---

## 13. Future Extensions

The Directory may eventually support:

* organizational charts;
* regional structures;
* dealer teams;
* manufacturer representatives;
* service networks;
* technical contacts;
* institutional programs;
* branches;
* alliances;
* organizational relationships.

These extensions should emerge from corpus evidence rather than being imposed prematurely.

---

## 14. DAA Alignment

The Directory follows the same principle as the broader ecosystem architecture:

> **Identity precedes structure.**

The entity must first exist as a coherent ecosystem Node.

Only then can its extended structure be represented.

```text
Identity
   ↓
Presence
   ↓
Publication
   ↓
Directory
   ↓
Structure
   ↓
Extended Relationships
```

The Directory therefore does not compete with the Map.

It gives depth to what the Map has already established.

---

## 15. Core Principle

> **The Map establishes presence.**
>
> **The Directory reveals structure.**

One entity.

One identity.

Two representations.

The Map remains concise.

The Directory becomes deeper only where the ecosystem provides enough information to make that depth meaningful.
