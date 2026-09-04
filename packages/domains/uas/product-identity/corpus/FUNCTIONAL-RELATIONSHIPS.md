# Functional Relationships

## Purpose

Functional Relationships define the coherent relationships among functions within the First Corpus.

A function describes an operational role.

A functional relationship describes how one function relates to another within an operational context.

Capabilities emerge from coherent functional relationships.

---

## Methodological Position

Functional relationships follow functional discernment.

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
Function
  ↓
Functional Relationship
  ↓
Product Capability
```

The relationship layer therefore connects individual functions with emergent system abilities.

---

## Core Principle

> **A Product capability emerges when functions establish coherent relationships that produce an observable operational ability.**

Functions do not become a Product capability merely by existing together.

Their relationship must contribute to a coherent operational outcome.

---

# Relationship Types

The current Corpus introduces several preliminary relationship types.

These are not yet exhaustive.

---

## Enables

One function establishes the conditions required for another function.

```text
Function A
    ↓
  Enables
    ↓
Function B
```

Example:

```text
Positioning
    ↓
Enables
    ↓
Navigation
```

---

## Supports

One function contributes to another without being strictly necessary for it.

```text
Function A
    ↓
 Supports
    ↓
Function B
```

Example:

```text
Obstacle Detection
    ↓
 Supports
    ↓
Obstacle Avoidance
```

---

## Precedes

One function occurs as a condition or stage before another.

```text
Function A
    ↓
 Precedes
    ↓
Function B
```

Example:

```text
Obstacle Detection
    ↓
 Precedes
    ↓
Obstacle Avoidance
```

Precedence does not necessarily imply causality.

---

## Combines With

Two or more functions participate jointly in an operational result.

```text
Function A
     +
Function B
     ↓
Combined Operation
```

Example:

```text
Navigation
     +
Path Planning
     ↓
Coherent Movement
```

---

## Depends On

One function requires another function to operate within a defined context.

```text
Function A
    ↓
Depends On
    ↓
Function B
```

Dependency must be established from evidence rather than assumed from common engineering practice.

---

## Composes

Multiple functions establish a higher-order functional structure.

```text
Function A
+
Function B
+
Function C
      ↓
Functional Composition
```

Functional composition is especially important for Product capability emergence.

---

# Functional Relationship Register

The current Corpus contains several preliminary relationships.

---

## Positioning → Navigation

### Relationship

**Enables**

### Interpretation

Positioning provides information required to determine movement relative to an intended course.

### Status

**Candidate**

### Open Question

Whether positioning should be treated as an independent function or as a subsystem Product capability remains unresolved.

---

## Navigation → Movement

### Relationship

**Guides**

### Interpretation

Navigation establishes directional context for movement.

### Status

**Functionally Coherent Candidate**

### Open Question

The exact boundary between navigation and path planning remains open.

---

## Path Planning → Movement

### Relationship

**Enables**

### Interpretation

Path planning establishes an intended route or movement sequence.

### Status

**Candidate**

---

## Obstacle Detection → Obstacle Avoidance

### Relationship

**Precedes / Supports**

### Interpretation

Detection provides information that may be used to modify movement in response to obstacles.

```text
Obstacle Detection
        ↓
     Information
        ↓
Obstacle Avoidance
```

### Status

**Functionally Corroborated Candidate**

### Important Distinction

Detection does not necessarily produce avoidance automatically.

An intermediate decision or control function may exist.

---

## Navigation → Autonomous Operation

### Relationship

**Enables**

### Interpretation

Navigation provides directional and positional conditions required for autonomous movement.

### Status

**Candidate**

---

## Obstacle Avoidance → Autonomous Operation

### Relationship

**Supports**

### Interpretation

Obstacle avoidance may contribute to autonomous operation by allowing movement to adapt to environmental conditions.

### Status

**Candidate**

---

## Liquid Storage → Liquid Application

### Relationship

**Enables**

### Interpretation

Liquid storage provides the material condition required for liquid application.

### Status

**Candidate**

### Important Distinction

Storage capacity is a characteristic.

Liquid storage is a functional role.

---

## Material Storage → Material Application

### Relationship

**Enables**

### Interpretation

Material storage provides material availability for subsequent application.

### Status

**Candidate**

---

# Functional Chains

Individual relationships may form coherent chains.

## Liquid Application

```text
Liquid Storage
      ↓
Material Availability
      ↓
Flow Control
      ↓
Liquid Application
```

The intermediate functions remain subject to evidence.

The chain should not be interpreted as a final architecture.

---

## Autonomous Movement

```text
Positioning
     ↓
Navigation
     ↓
Path Planning
     ↓
Movement
```

This represents a preliminary functional sequence.

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
       ↓
Movement Adaptation
```

The intermediate functions are currently unresolved.

Their existence should be established only when evidence requires them.

---

# Functional Composition

A Product capability candidate may emerge when several functions operate coherently together.

For example:

```text
Positioning
     +
Navigation
     +
Path Planning
     +
Control
     +
Obstacle Detection
     +
Obstacle Avoidance
          ↓
   Autonomous Operation
```

The important distinction is:

```text
Functions
    ≠
Product Capability
```

The Product capability is the observable operational ability emerging from their coherent interaction.

---

# Product Capability Emergence

The Corpus therefore adopts the following preliminary model:

```text
Function
   +
Function
   +
Function
   ↓
Coherent Relationship
   ↓
Functional Composition
   ↓
Observable Ability
   ↓
Product Capability
```

Product Capability is not simply the sum of functions.

It emerges from their relationship.

---

# Functional Dependency

A functional dependency may be represented as:

```text
A
↓
B
```

but the meaning of the arrow must always be explicitly classified.

For example:

```text
A → Enables → B
A → Supports → B
A → Precedes → B
A → Depends On → B
A → Combines With → B
A → Composes → B
```

The arrow itself must never carry an unspecified meaning.

---

# Relationship Evidence

Every functional relationship should eventually preserve:

```text
Relationship
├── Source Function
├── Relationship Type
├── Target Function
├── Context
├── Supporting Observations
├── Source Evidence
├── Confidence
└── Open Questions
```

This prevents relationships from becoming undocumented assumptions.

---

# Relationship Confidence

## Observed

The relationship is directly supported by evidence.

## Candidate

The relationship is strongly suggested but requires further evidence.

## Corroborated

The relationship is supported by multiple independent observations.

## Emergent

The relationship produces an observable higher-order operational ability.

## Unresolved

Evidence exists but the relationship remains ambiguous.

---

# Current Relationship Map

The current Corpus suggests:

```text
                    Positioning
                        │
                     Enables
                        ↓
                    Navigation
                        │
                     Guides
                        ↓
                  Path Planning
                        │
                     Enables
                        ↓
                     Movement
                        ↑
                        │
                 Obstacle Avoidance
                        ↑
                     Supports
                        │
                 Obstacle Detection
```

A second functional branch is:

```text
Liquid Storage
      │
   Enables
      ↓
Liquid Application
```

And:

```text
Material Storage
      │
   Enables
      ↓
Material Application
```

These structures remain provisional.

---

# From Relationships to Product Capability

The next abstraction is:

```text
Functional Relationships
          ↓
Functional Composition
          ↓
Observable Operational Ability
          ↓
Product Capability
```

For example:

```text
Positioning
Navigation
Path Planning
Movement
Obstacle Detection
Obstacle Avoidance
        ↓
Autonomous Operational Ability
        ↓
Product Capability Candidate
```

The Product capability should only be registered once the evidence demonstrates that the combined functions produce an observable ability.

---

# Product Capability vs Function

The distinction is critical.

### Function

Describes an operational role.

```text
Obstacle Detection
```

### Product Capability

Describes an observable ability resulting from coherent functional organization.

```text
Autonomous Operation
```

A Product capability may therefore contain multiple functions.

---

# Product Capability vs Product

A product implements or provides capabilities.

```text
Product
   ↓
Provides
   ↓
Product Capabilities
   ↓
Emerging from
   ↓
Functional Relationships
```

Therefore:

```text
Product
    ≠
Product Capability
```

and:

```text
Product Capability
    ≠
Product Class
```

---

# Product Capability and Product Class

Product Class remains downstream from Product capability.

```text
Functions
    ↓
Functional Relationships
    ↓
Product Capabilities
    ↓
Recurring Product Capability Structure
    ↓
Product Class
```

A Product Class should represent products sharing a sufficiently coherent Product capability structure.

---

# Product Capability and Manufacturer Identity

Manufacturer identity may emerge from recurring patterns in how capabilities are constructed.

```text
Shared Functional Domain
          ↓
Different Functional Composition
          ↓
Different Capability Expression
          ↓
Persistent Manufacturer Pattern
          ↓
Manufacturer Identity Candidate
```

This is where the earlier hypothesis of manufacturer DNA becomes structurally testable.

---

# Current Product Capability Candidates

The Corpus currently suggests the following Product capability candidates:

| Product Capability Candidate            | Supporting Functions                                                  | Status    |
| ------------------------------- | --------------------------------------------------------------------- | --------- |
| Autonomous Operation            | Positioning, Navigation, Path Planning, Control, Detection, Avoidance | Candidate |
| Agricultural Liquid Treatment   | Liquid Storage, Liquid Application, Movement                          | Candidate |
| Agricultural Material Treatment | Material Storage, Material Application, Movement                      | Candidate |
| Adaptive Obstacle Response      | Detection, Decision, Avoidance, Movement                              | Candidate |

These are deliberately called **candidates**.

They should not yet be treated as stable Product capabilities.

---

# Open Questions

The relationship layer leaves several questions open:

* Which functions are prerequisites for each Product capability?
* Which functions merely support a Product capability?
* Which functions can operate independently?
* Which relationships are universal?
* Which relationships are platform-specific?
* Which relationships are manufacturer-specific?
* When does functional composition become Product capability?
* What makes a Product capability observable?
* Which capabilities define Product Classes?

These questions require further evidence.

---

# Integrity

Functional Relationships must remain traceable to:

```text
Source
  ↓
Observation
  ↓
Normalized Concept
  ↓
Function
  ↓
Relationship
  ↓
Functional Composition
  ↓
Product Capability
```

Relationships must not be inferred solely from engineering intuition.

Capabilities must not be defined solely by product marketing language.

The Corpus must preserve the distinction between what is observed, what is inferred, and what emerges.

---

## Core Principle

> **Functions describe what a system does; relationships describe how those functions cooperate; capabilities emerge from their coherent interaction.**

The Functional Relationship layer is therefore the bridge between individual functions and emergent Product capability.
