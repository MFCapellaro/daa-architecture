# UAS Domain

## Purpose

The UAS domain represents unmanned aerial systems as operational expressions within DAA.

It transforms configured capabilities into real-world operational entities.

---

## Architectural Role

UAS consumes capabilities defined by:

- Configuration
- Core
- Knowledge

It does not redefine their meaning.

---

## Dependency Flow

```text
Grammar
    ↓
Kernel
    ↓
Coherence
    ↓
Knowledge
    ↓
Core
    ↓
Configuration
    ↓
UAS Domain
    ↓
Operational Systems