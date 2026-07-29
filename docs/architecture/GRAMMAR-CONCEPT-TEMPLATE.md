# GRAMMAR CONCEPT TEMPLATE

## Purpose

This template provides the standard structure for defining Grammar concepts in DAA.

It translates the Grammar Concept Standard into a reusable authoring pattern while preserving semantic continuity.

---

## Template

```ts
/**
 * ConceptName
 *
 * Purpose
 * Describe the semantic role of the concept.
 *
 * Relationships
 * - Describe the first conceptual relationship.
 * - Describe the second conceptual relationship.
 */
export interface ConceptName {
  readonly kind: 'ConceptName';
}
```

---

## Guidelines

Every Grammar concept:

- represents a single semantic primitive,
- remains implementation-independent,
- preserves identity through a minimal interface,
- expresses meaning through documentation,
- documents its conceptual relationships,
- belongs to Grammar as part of the shared language of DAA.