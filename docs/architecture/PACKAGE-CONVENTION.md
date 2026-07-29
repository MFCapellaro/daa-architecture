# DAA Package Convention

## Purpose

The DAA Package Convention defines the standard structure for every architectural package.

Each package represents a coherent fragment of the architectural language.

A consistent package structure improves readability, discoverability and long-term maintainability while preserving architectural coherence.

---

## Principle

Every package follows the same structural organization.

Developers should recognize the purpose of every file and directory regardless of the package they are working in.

Consistency is part of the architecture.

---

## Standard Structure

```text
package/

README.md
index.ts

concepts...

test/
```

The internal concept directories depend on the package domain.

For example:

```text
knowledge/

README.md
index.ts

experience/
learning/
observation/

test/
```

---

## README.md

Every package contains a README.md.

The README explains the package from an architectural perspective rather than an implementation perspective.

Standard sections:

```text
Purpose

Concepts

Conceptual Flow

Relationships

Public API

Notes
```

---

## index.ts

The index.ts file defines the public interface of the package.

Only concepts intended for external use are exported.

Internal implementation details remain private.

---

## Concepts

Concept files define the architectural vocabulary.

Each concept should represent a single coherent responsibility.

Concept definitions precede implementations.

---

## Relationships

Relationships express how concepts interact.

Packages organize relationships before behaviors.

Behaviors emerge from validated relationships.

---

## Tests

Every package includes a dedicated test directory.

Tests validate:

- Concept integrity
- Relationship coherence
- Public API consistency

Tests verify architectural behavior rather than implementation details.

---

## Naming Convention

Use PascalCase for concepts.

Examples:

```text
Identity
Integrity
Knowledge
Experience
Observation
Learning
```

Use singular names whenever possible.

Directory names use lowercase.

Examples:

```text
knowledge/
coherence/
grammar/
kernel/
```

---

## Public API

Each package exposes a single public entry point.

```text
index.ts
```

Consumers should import concepts through the package interface rather than internal files.

---

## Architectural Sequential Logic

Every package is developed following the Architectural Sequential Logic.

```text
Meaning
    ↓
Purpose
    ↓
Concepts
    ↓
Relationships
    ↓
Public API
    ↓
Validation
    ↓
Behaviors
```

Behavior never precedes conceptual validation.

---

## Architectural Rule

Packages preserve coherence by sharing a common structure.

Structural consistency is part of the architectural identity.

---

## Summary

Every package is a self-explanatory chapter of the DAA architecture.

Every package follows the same structure.

Every package contributes a coherent fragment of the architectural language.

Consistency preserves identity.

Coherence enables evolution.