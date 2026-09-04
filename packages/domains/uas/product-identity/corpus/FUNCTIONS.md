# Functions

## Purpose

Functions define the operational roles discerned from normalized observations within the First Corpus.

A function describes what a system, subsystem, or component does within an operational context.

Functions emerge from evidence.

They are not predefined product categories.

---

## Methodological Position

Functions are established after normalization, convergence, and divergence have provided sufficient evidence for functional discernment.

```text
Source
  ↓
Observation
  ↓
Normalization
  ↓
Convergence
  ↓
Divergence
  ↓
Functional Discernment
  ↓
Function
```

A function must remain traceable to the evidence from which it emerged.

---

## Core Principle

> **A function is an operational role discerned from coherent relationships between observations and context.**

A function is not:

* a product name,
* a manufacturer term,
* a specification,
* a characteristic,
* a platform,
* or a Product Class.

---

# Function Structure

Each function is described through:

```text
Function
├── Definition
├── Normalized Concepts
├── Supporting Observations
├── Convergence
├── Divergence
├── Operational Context
├── Evidence Status
└── Open Questions
```

This structure preserves the distinction between evidence and interpretation.

---

# Functional Domains

The current Corpus suggests several functional domains.

These domains are provisional.

```text
Application
Mobility
Navigation
Detection
Avoidance
Operation
```

The domains themselves remain open to refinement.

---

# Application Functions

## Liquid Application

### Definition

Application of liquid material through an operational application system.

### Normalized Concepts

Current normalized concepts include:

```text
Spraying
Spray
Spray System
Liquid Application
```

### Supporting Observations

The function recurs across:

```text
DJI AGRAS
XAG P Series
TopXGun FP Series
```

### Convergence

Cross-manufacturer convergence is observed.

### Divergence

Implementation may differ through:

* tank architecture,
* pump architecture,
* flow control,
* nozzle configuration,
* application width,
* control systems.

These differences do not by themselves constitute functional divergence.

### Operational Context

Agricultural treatment.

### Evidence Status

**Functionally Corroborated Candidate**

### Open Questions

* Which liquid application modes should remain within the same function?
* Which differences justify functional subdivision?
* Which characteristics are function-defining?
* Which characteristics are performance-related only?

---

## Material Application

### Definition

Distribution of agricultural material over an operational area.

### Normalized Concepts

Current normalized concepts include:

```text
Spreading
Spreader
Spreading System
Material Application
```

### Supporting Observations

Observed across multiple agricultural aerial platforms.

### Convergence

Cross-manufacturer convergence candidate.

### Divergence

Implementation may vary according to:

* material type,
* dispensing mechanism,
* storage system,
* flow control,
* distribution mechanism.

### Operational Context

Agricultural treatment.

### Evidence Status

**Function Candidate**

### Open Questions

* Which materials belong to the same functional domain?
* Should granular and other material application remain unified?
* What distinguishes material application from liquid application?

---

# Mobility Functions

## Aerial Movement

### Definition

Movement through an aerial environment using an aerial platform.

### Normalized Concepts

Current concepts include:

```text
Aerial Platform
Agricultural Drone
Agricultural UAV
```

### Functional Interpretation

Aerial movement is the mobility function associated with aerial agricultural platforms.

### Supporting Observations

Observed across:

```text
DJI AGRAS
XAG P Series
TopXGun FP Series
```

### Convergence

Cross-manufacturer convergence.

### Divergence

The implementation architecture may differ through:

* propulsion systems,
* rotor configuration,
* flight control,
* payload integration.

### Evidence Status

**Function Candidate**

### Open Questions

* Should aerial movement be treated as a function or as a platform property?
* Which mobility functions are shared with ground platforms at a higher abstraction level?

---

## Ground Movement

### Definition

Movement through a terrestrial environment using a ground platform.

### Supporting Observations

Current evidence includes:

```text
XAG R Series
```

### Convergence

Ground movement provides a potential cross-platform functional counterpart to aerial movement.

### Divergence

The physical implementation differs fundamentally from aerial movement.

### Evidence Status

**Function Candidate**

### Open Questions

* What higher-level function unifies aerial and ground movement?
* Which operational functions remain invariant across both platforms?

---

# Navigation Functions

## Navigation

### Definition

Determination and maintenance of movement relative to an intended operational course.

### Supporting Concepts

Current observations suggest relationships with:

```text
Positioning
Navigation
Path Planning
Flight Control
```

### Functional Interpretation

Navigation provides the directional and positional basis for movement.

### Evidence Status

**Function Candidate**

### Open Questions

* Which observations belong to navigation?
* Which belong to positioning?
* Where should path planning be separated from navigation?
* Which functions are prerequisites for autonomous operation?

---

# Detection Functions

## Obstacle Detection

### Definition

Detection or sensing of objects or conditions that may affect safe operation.

### Normalized Concepts

```text
Obstacle Detection
Obstacle Sensing
Obstacle Detection System
```

### Supporting Observations

Observed across multiple agricultural aerial platforms.

### Convergence

Cross-manufacturer convergence candidate.

### Divergence

Implementation may differ through:

* sensor type,
* sensing arrangement,
* detection range,
* processing,
* integration with control systems.

### Evidence Status

**Function Candidate**

### Open Questions

* What constitutes obstacle detection?
* Which sensing functions should remain separate?
* When does detection become perception or interpretation?

---

# Avoidance Functions

## Obstacle Avoidance

### Definition

Modification or control of movement in response to detected obstacles.

### Normalized Concepts

```text
Obstacle Avoidance
Obstacle Avoidance System
```

### Functional Relationship

```text
Obstacle Detection
        ↓
Obstacle Avoidance
```

Detection and avoidance remain distinct functions.

### Convergence

Cross-manufacturer convergence candidate.

### Divergence

Different systems may implement avoidance through:

* automatic trajectory adjustment,
* controlled stopping,
* operator notification,
* alternative path generation,
* other control responses.

### Evidence Status

**Function Candidate**

### Open Questions

* Which responses constitute avoidance?
* Is operator notification a separate function?
* At what point does avoidance become autonomous path planning?

---

# Operational Functions

## Autonomous Operation

### Definition

Execution of operational behavior with reduced or delegated direct human control.

### Supporting Concepts

Current observations suggest relationships among:

```text
Positioning
Navigation
Path Planning
Control
Obstacle Detection
Obstacle Avoidance
```

### Functional Composition

A preliminary functional hypothesis is:

```text
Positioning
     +
Navigation
     +
Path Planning
     +
Control
     +
Detection
     ↓
Autonomous Operation
```

This composition remains provisional.

### Convergence

Observed across multiple manufacturers.

### Divergence

The internal architecture and degree of autonomy may differ substantially.

### Evidence Status

**Function Candidate**

### Open Questions

* What minimum functions constitute autonomous operation?
* How should supervised autonomy be distinguished from full autonomy?
* Which functions are necessary and which are optional?
* Should autonomy be treated as a function or an emergent Product capability?

---

# Function Relationships

Functions should not be treated as isolated entries.

The current Corpus suggests several relationships.

## Application

```text
Liquid Storage
      ↓
Liquid Application
      ↓
Agricultural Treatment
```

---

## Navigation

```text
Positioning
      ↓
Navigation
      ↓
Path Planning
      ↓
Movement
```

This sequence remains a hypothesis.

---

## Obstacle Response

```text
Obstacle Detection
        ↓
Interpretation
        ↓
Decision
        ↓
Obstacle Avoidance
```

The intermediate functions remain unresolved.

---

## Autonomous Operation

```text
Navigation
      +
Control
      +
Path Planning
      +
Detection
      +
Avoidance
      ↓
Autonomous Operation
```

This is a candidate functional composition rather than an established Product capability model.

---

# Function vs Characteristic

The Corpus must preserve the distinction between operational function and measurable characteristic.

Example:

```text
Tank Capacity
      ↓
Characteristic
```

while:

```text
Liquid Storage
      ↓
Function
```

Likewise:

```text
Payload Capacity
      ↓
Characteristic
```

while:

```text
Material Handling
      ↓
Function
```

A characteristic may support a function without being the function itself.

---

# Function vs Product Capability

The Corpus also distinguishes function from Product capability.

```text
Function
    ↓
Operational role
```

versus:

```text
Product Capability
    ↓
Observable ability emerging from one or more functions
```

For example:

```text
Navigation
+
Obstacle Detection
+
Path Planning
+
Control
    ↓
Autonomous Operation Capability
```

Whether `Autonomous Operation` should ultimately be represented as a function or capability remains open.

This distinction must be resolved through further evidence.

---

# Function vs Platform

Platform describes the physical-operational context.

Function describes an operational role.

```text
Platform
   ↓
Where / through what the operation occurs

Function
   ↓
What the system does
```

Therefore:

```text
Aerial Platform
      ≠
Aerial Movement Function
```

although the two are closely related.

The Corpus must preserve this distinction until evidence establishes the appropriate abstraction level.

---

# Function Convergence

A function gains evidential strength when it recurs across independent structures.

```text
One Product
    ↓
Family Recurrence
    ↓
Manufacturer Recurrence
    ↓
Cross-Manufacturer Recurrence
    ↓
Cross-Platform Recurrence
```

Each additional recurrence increases confidence while also requiring more precise contextual interpretation.

---

# Function Divergence

A function may diverge in several ways:

```text
Same Function
     │
     ├── Different Architecture
     │
     ├── Different Implementation
     │
     ├── Different Performance
     │
     └── Different Functional Role
```

Only the last necessarily constitutes functional divergence.

The other differences may represent implementation or characteristic divergence.

---

# Functional Evidence Status

The Corpus uses the following states:

### Function Candidate

Evidence suggests a functional interpretation, but additional corroboration is required.

### Functionally Corroborated Candidate

The interpretation recurs across sufficient evidence to provide strong support while remaining open to refinement.

### Discerned Function

The functional interpretation has sufficient evidence and contextual coherence to become part of the stable Corpus model.

### Unresolved

Evidence exists, but the functional interpretation remains ambiguous.

---

# Current Function Register

| Function             | Domain      | Current Status                      |
| -------------------- | ----------- | ----------------------------------- |
| Liquid Application   | Application | Functionally Corroborated Candidate |
| Material Application | Application | Function Candidate                  |
| Aerial Movement      | Mobility    | Function Candidate                  |
| Ground Movement      | Mobility    | Function Candidate                  |
| Navigation           | Navigation  | Function Candidate                  |
| Obstacle Detection   | Detection   | Function Candidate                  |
| Obstacle Avoidance   | Avoidance   | Function Candidate                  |
| Autonomous Operation | Operation   | Function Candidate                  |

This register is intentionally small.

Functions should be added only when the evidence requires them.

---

# Emergent Functional Structure

The current Corpus suggests a preliminary structure:

```text
Agricultural Operation
        │
        ├── Application
        │     ├── Liquid Application
        │     └── Material Application
        │
        ├── Mobility
        │     ├── Aerial Movement
        │     └── Ground Movement
        │
        ├── Navigation
        │     └── Navigation
        │
        ├── Detection
        │     └── Obstacle Detection
        │
        ├── Avoidance
        │     └── Obstacle Avoidance
        │
        └── Operation
              └── Autonomous Operation
```

This structure is provisional.

It represents the current state of discernment rather than a definitive taxonomy.

---

# Product Class Emergence

Product Classes remain downstream from functions.

```text
Functions
    ↓
Functional Relationships
    ↓
Product Capability Patterns
    ↓
Recurring Functional Composition
    ↓
Product Class Candidate
```

A Product Class should therefore emerge from functional structure rather than from product naming.

---

# Manufacturer Identity

Manufacturer identity is also downstream.

```text
Shared Functions
      ↓
Implementation Differences
      ↓
Persistent Patterns
      ↓
Functional Signature
      ↓
Manufacturer Identity
```

The Corpus does not currently establish manufacturer DNA.

It establishes the conditions under which it may emerge.

---

# Open Questions

The current function model leaves several questions open:

* Is Autonomous Operation a function or an emergent capability?
* Is Aerial Movement a function or a platform-dependent implementation?
* What higher-level function unifies aerial and ground movement?
* Should Navigation contain Positioning and Path Planning?
* Should Obstacle Detection contain perception or interpretation?
* What constitutes the minimum functional unit?
* Which functions combine to form capabilities?
* Which functional compositions define Product Classes?

These questions require additional evidence.

---

# Integrity

Functions must remain traceable to:

```text
Source
  ↓
Observation
  ↓
Normalized Concept
  ↓
Convergence
  ↓
Divergence
  ↓
Functional Discernment
  ↓
Function
```

No function should be established solely from product category, manufacturer terminology, or technical specification.

No function should be elevated to a Product capability without evidence of emergent operational ability.

No Product Class should be defined before its functional structure is sufficiently understood.

---

## Core Principle

> **Functions emerge where normalized observations, recurring relationships, and operational context converge into a stable description of what a system does.**

The Function layer transforms observed information into operational meaning while preserving the evidence from which that meaning emerged.
