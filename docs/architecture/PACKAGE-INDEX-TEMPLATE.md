# PACKAGE INDEX TEMPLATE

## Purpose

This template provides the standard structure for defining DAA package public entry points.

It translates the Package Index Standard into a reusable authoring pattern while preserving encapsulation and architectural coherence.

---

## Template

```ts
/**
 * Package Name
 *
 * Public API
 *
 * Exposes the validated concepts intended
 * for external architectural consumption.
 */

// Concepts
export * from "./path/ConceptName.js";

// Relationships
export * from "./path/RelationshipName.js";
```

---

## Guidelines

Every package index:

- exposes only intentional public concepts,
- keeps internal implementation details private,
- provides a stable import boundary,
- reflects the architectural identity of the package,
- exports validated concepts only,
- preserves coherence between package structure and public API.

The index is the architectural boundary of the package.