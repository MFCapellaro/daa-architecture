# PACKAGE README TEMPLATE

## Purpose

This template provides the standard structure for documenting DAA packages.

It translates the Package README Standard into a reusable authoring pattern while preserving architectural coherence and semantic continuity.

---

## Template

```md
# Package Name

## Purpose

Describe the architectural purpose of the package.

Explain why this package exists and what capability it provides to the DAA ecosystem.

---

## Concepts

Describe the concepts introduced by this package.

Example:

- Concept A — semantic definition.
- Concept B — semantic definition.

---

## Conceptual Flow

Describe the causal relationships between concepts.

Example:

```text
Concept A
    ↓
Concept B
    ↓
Concept C
```

---

## Relationships

Describe how this package connects with other architectural layers.

Example:

- Package A defines...
- Package B consumes...
- Package C extends...

---

## Public API

Describe the concepts exposed through the package entry point.

Example:

```ts
export {
  ConceptA,
  ConceptB
}
```

---

## Notes

Optional architectural considerations.

Examples:

- Future extensions.
- Design decisions.
- Implementation notes.
```

---

## Guidelines

Every package README:

- explains meaning before implementation,
- describes architectural responsibility,
- documents concepts before behaviors,
- expresses relationships explicitly,
- preserves consistency across packages,
- remains concise and implementation-independent.

A README is the architectural introduction of a package.