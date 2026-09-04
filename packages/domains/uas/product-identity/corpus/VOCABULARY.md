# Corpus Vocabulary

## Purpose

The Corpus Vocabulary defines the semantic normalization layer of the First Corpus.

It establishes relationships between manufacturer terminology, observed concepts, normalized concepts, and emerging functional meanings.

The vocabulary does not replace source terminology.

It preserves the original language while establishing a common semantic reference for comparison and discernment.

---

## Methodological Position

Normalization follows observation.

```text id="v1x7c2"
Source
  ↓
Observation
  ↓
Raw Term
  ↓
Normalized Concept
  ↓
Functional Meaning
```

Normalization must never precede the observation from which it is derived.

---

## Core Principle

> **Normalization unifies meaning without erasing origin.**

The original term remains traceable to its source.

The normalized concept provides a common semantic reference.

The functional meaning remains subject to discernment.

---

## Vocabulary Layers

The Corpus distinguishes four semantic layers.

### Raw Term

The exact terminology observed in a source.

```text
Raw Term
```

Raw terms must not be altered.

They preserve manufacturer language and source identity.

---

### Normalized Concept

A semantically unified concept representing equivalent or sufficiently related observations.

```text
Raw Terms
    ↓
Normalized Concept
```

Normalization does not imply functional equivalence.

Two terms may describe the same concept while participating in different functions.

---

### Functional Meaning

The operational meaning associated with a normalized concept.

```text
Normalized Concept
        ↓
Functional Meaning
```

Functional meaning is established through context and relationships.

It must not be inferred solely from terminology.

---

### Product Capability Relation

A normalized function may contribute to an emerging Product capability.

```text
Function
    ↓
Product Capability
```

Product Capability is downstream from functional discernment.

---

## Normalization Rules

### Rule 01 — Preserve Origin

Every normalized concept must remain traceable to its raw terms and original sources.

```text
Raw Term
   ↓
Source
   ↓
Observation
   ↓
Normalized Concept
```

---

### Rule 02 — Do Not Normalize by Translation Alone

Translation does not constitute semantic normalization.

For example:

```text
"Spraying"
    ↓
"Spraying"
```

is not sufficient normalization.

The Corpus must determine what the term represents within its operational context.

---

### Rule 03 — Do Not Normalize by Name Similarity

Similar terminology does not guarantee equivalent meaning.

```text
"Obstacle Detection"
        ≠
"Obstacle Avoidance"
```

unless evidence establishes their relationship.

---

### Rule 04 — Preserve Context

A term must be interpreted within the context in which it was observed.

```text
Term
  +
Context
  ↓
Meaning
```

Context may include:

* platform,
* agricultural operation,
* subsystem,
* operational mode,
* purpose,
* physical implementation.

---

### Rule 05 — Do Not Infer Missing Information

An absent observation must remain absent.

```text
Not Observed
    ≠
Not Present
```

Likewise:

```text
Unknown
    ≠
Zero
```

and:

```text
Unresolved
    ≠
False
```

---

### Rule 06 — Preserve Manufacturer Language

Manufacturer terminology remains part of the Corpus even after normalization.

This allows later analysis of:

* terminology,
* conceptual emphasis,
* architecture,
* product strategy,
* manufacturer identity.

---

### Rule 07 — Normalize Across Evidence

A normalized concept becomes stronger when the same meaning is observed across:

* multiple products,
* multiple families,
* multiple platforms,
* multiple manufacturers,
* independent sources.

Recurrence increases evidential confidence.

---

## Vocabulary Record

Each normalized concept should eventually contain:

```text id="4g7v9q"
Normalized Concept
    ↓
Raw Terms
    ↓
Sources
    ↓
Observations
    ↓
Context
    ↓
Functional Interpretation
    ↓
Evidence Status
```

The record must remain traceable to the original evidence.

---

# Initial Vocabulary

The following entries are preliminary.

They represent normalization candidates emerging from the current First Corpus.

---

## Agricultural Application

### Raw Terms

Current observations include terminology referring to:

```text
Agricultural Application
Agricultural Operation
Agricultural Treatment
```

### Normalized Concept

**Agricultural Application**

### Functional Interpretation

Application of an operational Product capability within an agricultural context.

### Status

**Function Candidate**

### Evidence

Observed across multiple manufacturers and product families.

### Notes

The concept remains intentionally broad.

Specific application functions such as spraying and spreading must remain distinct until their relationship is sufficiently established.

---

## Spraying

### Raw Terms

Current observations include:

```text
Spraying
Spray
Spray System
```

### Normalized Concept

**Liquid Application**

### Functional Interpretation

Application of liquid material through an agricultural application system.

### Status

**Function Candidate**

### Evidence

Observed across DJI AGRAS, XAG agricultural platforms, and TopXGun FP Series.

### Notes

The relationship between `Spraying` and `Liquid Application` is a normalization hypothesis supported by operational context.

The original term remains preserved.

---

## Spreading

### Raw Terms

Current observations include:

```text
Spreading
Spreader
Spreading System
```

### Normalized Concept

**Material Application**

### Functional Interpretation

Distribution of agricultural material over an operational area.

### Status

**Function Candidate**

### Evidence

Observed across multiple agricultural aerial platforms.

### Notes

The exact material domain remains open.

The Corpus must distinguish material application from liquid-specific application.

---

## Autonomous Operation

### Raw Terms

Current observations include terminology referring to:

```text
Autonomous Operation
Autonomous Flight
Automatic Operation
```

### Normalized Concept

**Autonomous Operation**

### Functional Interpretation

Execution of operational behavior with reduced or delegated direct human control.

### Status

**Function Candidate**

### Evidence

Observed across multiple manufacturers and product families.

### Notes

Autonomous operation may emerge from multiple underlying functions including:

```text
Navigation
Positioning
Path Planning
Control
Obstacle Detection
```

These relationships remain subject to discernment.

---

## Obstacle Detection

### Raw Terms

Current observations include:

```text
Obstacle Detection
Obstacle Sensing
Obstacle Detection System
```

### Normalized Concept

**Obstacle Detection**

### Functional Interpretation

Detection or sensing of objects or conditions that may affect safe operation.

### Status

**Function Candidate**

### Evidence

Observed across multiple agricultural aerial platforms.

### Notes

Detection must remain distinct from avoidance.

---

## Obstacle Avoidance

### Raw Terms

Current observations include:

```text
Obstacle Avoidance
Obstacle Avoidance System
```

### Normalized Concept

**Obstacle Avoidance**

### Functional Interpretation

Modification or control of movement in response to detected obstacles.

### Status

**Function Candidate**

### Evidence

Observed across multiple agricultural aerial platforms.

### Notes

Obstacle avoidance may depend on obstacle detection but is not semantically identical to it.

---

## Aerial Platform

### Raw Terms

Current observations include:

```text
Aerial Platform
Agricultural Drone
Agricultural UAV
Aircraft
```

### Normalized Concept

**Aerial Platform**

### Functional Interpretation

A platform capable of performing operations through aerial movement.

### Status

**Structural Concept Candidate**

### Evidence

Observed across DJI AGRAS, XAG P Series, and TopXGun aerial platforms.

### Notes

Aerial platform is not itself a function.

It describes the physical-operational domain in which functions are implemented.

---

## Ground Platform

### Raw Terms

Current observations include terminology associated with:

```text
Rover
Ground Vehicle
Ground Platform
```

### Normalized Concept

**Ground Platform**

### Functional Interpretation

A platform capable of performing operations through terrestrial movement.

### Status

**Structural Concept Candidate**

### Evidence

Observed in XAG R Series.

### Notes

Ground Platform is intentionally kept parallel to Aerial Platform.

The Corpus must determine which functions remain common across platforms.

---

## Liquid Storage

### Raw Terms

Potential observations include:

```text
Tank
Liquid Tank
Tank Capacity
Spray Tank
```

### Normalized Concept

**Liquid Storage**

### Functional Interpretation

Retention of liquid material for subsequent operational use.

### Status

**Function Candidate**

### Notes

A capacity measurement such as tank volume is a characteristic.

The storage function is distinct from the characteristic.

```text
Tank Capacity
    ↓
Liquid Storage
```

---

## Payload Capacity

### Raw Terms

Potential observations include:

```text
Payload
Payload Capacity
Maximum Payload
Load Capacity
```

### Normalized Concept

**Payload Capacity**

### Functional Interpretation

The quantity of operational material or equipment that a platform can carry within specified conditions.

### Status

**Characteristic Concept Candidate**

### Notes

Payload capacity is not itself a function.

It may constrain multiple functions.

---

# Functional Relationships Emerging

The current vocabulary suggests several preliminary relationships.

### Liquid Application

```text id="j7x4w2"
Liquid Storage
      ↓
Liquid Application
      ↓
Agricultural Treatment
```

---

### Material Application

```text id="f2q8m5"
Material Storage
      ↓
Material Handling
      ↓
Material Application
      ↓
Agricultural Treatment
```

The existence of these relationships remains subject to further evidence.

---

### Autonomous Operation

```text id="p6s1z9"
Positioning
     +
Navigation
     +
Path Planning
     +
Control
     +
Obstacle Detection
     ↓
Autonomous Operation
```

This is a functional hypothesis.

It is not yet established as a formal Product capability model.

---

# Cross-Manufacturer Normalization

Normalization becomes particularly valuable when the same function appears under different manufacturer terminology.

The current Corpus follows:

```text id="w5c8r3"
DJI
  ┐
XAG
  ├── Raw Terms
TopXGun
  ┘
       ↓
Semantic Normalization
       ↓
Shared Concept
       ↓
Functional Discernment
```

Manufacturer differences must remain visible after normalization.

---

# Convergence and Divergence

Normalization provides the semantic basis for identifying convergence and divergence.

### Convergence

```text id="x8m3q6"
Different Raw Terms
       ↓
Same Normalized Concept
       ↓
Potential Functional Convergence
```

### Divergence

```text id="s4p7n2"
Similar Raw Terms
       ↓
Different Functional Meaning
       ↓
Functional Divergence
```

Neither conclusion should be established from terminology alone.

---

# Vocabulary Status

The vocabulary is evolutionary.

New observations may:

* confirm a normalization,
* refine a normalization,
* split a concept,
* merge concepts,
* reject a normalization,
* introduce a new functional layer.

Therefore:

> **The vocabulary remains open to evidence.**

A normalized concept is not immutable.

---

# Integrity

The Corpus Vocabulary preserves the distinction between:

```text
Origin
  ↓
Observation
  ↓
Term
  ↓
Concept
  ↓
Function
  ↓
Product Capability
```

No normalization may sever traceability to its origin.

No functional interpretation may overwrite the observation from which it emerged.

No classification may be used to justify a normalization retroactively.

The vocabulary exists to make evidence comparable while preserving the path by which meaning was discovered.

---

## Core Principle

> **Normalization establishes semantic coherence without prematurely establishing classification.**

The vocabulary prepares the evidence for functional discernment.

It does not replace discernment.
