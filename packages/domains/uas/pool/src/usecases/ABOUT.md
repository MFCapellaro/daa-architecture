# ABOUT

## Use Cases

A Use Case expresses coherent behavior.

Entities define what exists.

Use Cases define how entities interact.

A Use Case transforms meaning into action while preserving domain coherence.

---

## Position within DAA

```text
Grammar
    ↓
Kernel
    ↓
Runtime
    ↓
Domain
    ↓
Use Cases
    ↓
Application
```

Grammar defines meaning.

Kernel preserves coherence.

Runtime executes behavior.

Domains define behavior.

Use Cases express behavior.

Applications invoke behavior.

---

## Purpose

A Use Case exists to coordinate domain entities toward a coherent outcome.

It does not redefine the domain.

It does not execute the runtime.

It expresses the behavior that the runtime executes.

---

## Behavior

Behavior emerges from coherent relationships.

A Use Case coordinates those relationships without changing their meaning.

The same entities may participate in many different behaviors.

The behavior belongs to the domain.

---

## Identity

A Use Case has one responsibility.

It expresses one coherent intention.

When a behavior requires a different intention, a new Use Case emerges.

---

## Runtime Relationship

Runtime executes.

A Use Case defines what Runtime executes.

Runtime preserves execution.

The Use Case preserves meaning.

---

## Architectural Law

Meaning precedes behavior.

Behavior precedes execution.

Execution precedes observation.

Observation precedes adaptation.

---

## First Use Cases

The initial behaviors of UAS Pool are:

```text
CreatePoolFormation

↓

JoinPool

↓

CompletePoolFormation

↓

RegisterTransaction
```

Together they express the complete collective purchasing trajectory.

---

## Guiding Principle

A Use Case does not create meaning.

A Use Case expresses meaning through coherent behavior.
