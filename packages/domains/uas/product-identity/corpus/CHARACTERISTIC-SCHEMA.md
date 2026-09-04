# Characteristic Schema

## Purpose

Characteristic Schema defines the set of characteristics required to describe and compare products within a Product Class.

The schema does not contain product values.

It defines the semantic structure through which values can later be normalized, represented, and compared.

---

## Methodological Position

Characteristic Schema follows Product Class.

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
Discernment
  ↓
Function
  ↓
Functional Relationship
  ↓
Functional Composition
  ↓
Product Capability
  ↓
Classification
  ↓
Product Class
  ↓
Characteristic Schema
  ↓
Normalized Characteristics
  ↓
Comparison
```

The schema therefore belongs to the comparative regime of the Corpus.

---

## Core Principle

> **A Characteristic Schema defines what is meaningful to compare within a Product Class before values are compared.**

The schema establishes the questions.

The product data provides the answers.

---

# Schema Is Not Data

A characteristic schema defines structure.

```text
Characteristic Schema
        ↓
Characteristic
        ↓
Expected Meaning
```

Product data supplies values.

```text
Product
   ↓
Observed Value
```

Therefore:

```text
Schema
  ≠
Value
```

Example:

```text
Characteristic:
Payload Capacity

Product A:
40 kg

Product B:
50 kg
```

The values belong to products.

The characteristic belongs to the schema.

---

# Schema Is Not a Specification Sheet

A specification sheet reproduces product information.

A Characteristic Schema establishes a normalized comparative structure.

```text
Specification Sheet
       ↓
Product-specific Information
```

versus:

```text
Characteristic Schema
       ↓
Common Semantic Structure
       ↓
Comparable Product Values
```

The schema must therefore precede the comparative table.

---

# Schema Is Not a List of Manufacturer Fields

Manufacturers may describe similar concepts differently.

```text
Manufacturer A
"Maximum Load"

Manufacturer B
"Payload"

Manufacturer C
"Carrying Capacity"
```

The schema determines whether these concepts represent a common normalized characteristic.

```text
Maximum Load
      \
Payload ----→ Payload Capacity
      /
Carrying Capacity
```

The normalization must precede comparison.

---

# Schema Emergence

A Characteristic Schema emerges from the Product Class.

```text
Product Class
      ↓
Shared Capability Structure
      ↓
Comparison Purpose
      ↓
Relevant Dimensions
      ↓
Characteristic Schema
```

The schema should therefore not be copied from the first product encountered.

---

# Schema Criteria

A characteristic should enter the schema only when it satisfies a meaningful comparative role.

## 1. Semantic Relevance

The characteristic must have a clear meaning.

```text
Characteristic
      ↓
Defined Meaning
```

---

## 2. Class Relevance

The characteristic must be relevant to the Product Class.

```text
Product Class
      ↓
Relevant Characteristic
```

A characteristic may be technically interesting but irrelevant to the class.

---

## 3. Functional Relevance

The characteristic should have a relationship to the capabilities being compared.

```text
Product Capability
     ↓
Functional Requirement
     ↓
Characteristic
```

---

## 4. Comparability

The characteristic must be representable across class members.

```text
Product A ─┐
Product B ─┼──→ Comparable Characteristic
Product C ─┘
```

If a characteristic cannot be meaningfully compared, its inclusion requires justification.

---

## 5. Evidence Availability

The characteristic must be supported by evidence.

```text
Characteristic
      ↓
Evidence
```

An expected field without evidence remains a schema requirement, not an observed product value.

---

# Characteristic Types

Characteristics may belong to different semantic types.

## Quantitative

Values represented numerically.

Examples:

```text
Payload Capacity
Tank Capacity
Maximum Speed
Flight Time
```

---

## Qualitative

Values described through meaningful categorical distinctions.

Examples:

```text
Control Mode
Navigation Mode
Application Method
```

---

## Structural

Characteristics describing system composition.

Examples:

```text
Rotor Configuration
Payload Configuration
Drive Configuration
```

---

## Functional

Characteristics directly related to operational behavior.

Examples:

```text
Obstacle Detection
Obstacle Avoidance
Application Control
```

---

## Contextual

Characteristics whose meaning depends on operating conditions.

Examples:

```text
Operating Environment
Terrain
Weather Conditions
Application Context
```

These types may coexist within one schema.

---

# Characteristic Identity

Each characteristic should have a stable semantic identity.

```text
Characteristic
├── ID
├── Name
├── Definition
├── Type
├── Unit
├── Domain
├── Source
└── Evidence Status
```

The identity should remain independent of manufacturer terminology.

---

# Characteristic Definition

A characteristic requires a precise definition.

For example:

```text
Payload Capacity
```

should not simply mean:

> "How much the drone can carry."

The schema should establish what is being measured, under what interpretation, and which related concepts are excluded.

This prevents semantic drift.

---

# Characteristic Units

Units are part of normalization.

```text
Value
   ↓
Unit
   ↓
Normalized Value
```

For example:

```text
40 kg
40000 g
88.18 lb
```

may represent the same quantity.

The schema establishes the canonical representation.

---

# Unit Normalization

Normalization should preserve the original value while establishing a common representation.

```text
Source Value
    ↓
Original Unit
    ↓
Normalized Unit
    ↓
Comparable Value
```

Example:

```text
50 lb
  ↓
22.68 kg
```

The original evidence must remain traceable.

---

# Characteristic Domain

Some characteristics require an allowed domain.

```text
Control Mode
├── Manual
├── Assisted
├── Autonomous
└── Hybrid
```

The domain should emerge from normalized evidence.

It should not be invented merely for convenience.

---

# Continuous and Discrete Characteristics

Some characteristics vary continuously.

```text
Payload Capacity
      ↓
0 ───────────────→ 100 kg
```

Others are discrete.

```text
Rotor Configuration
├── X
├── +
└── Coaxial
```

The schema must preserve the appropriate representation.

---

# Range Characteristics

Some characteristics are not single values.

```text
Operating Temperature
      ↓
Minimum ───── Maximum
```

The schema should distinguish:

* minimum,
* maximum,
* nominal,
* recommended,
* or tested values

when the evidence supports those distinctions.

---

# Conditional Characteristics

Some values depend on operating conditions.

```text
Flight Time
     ↓
Payload
     ↓
Wind
     ↓
Operating Mode
```

A value without its conditions may be misleading.

The schema should therefore permit contextual qualifiers where necessary.

---

# Characteristic Dependencies

Characteristics may depend on one another.

```text
Payload
   ↓
Flight Time
```

or:

```text
Tank Capacity
   ↓
Liquid Payload
   ↓
Operational Endurance
```

The schema should preserve important dependencies rather than flattening them into unrelated fields.

---

# Characteristic Relationships

Characteristics may form meaningful relationships.

```text
Characteristic A
        ↓
Relationship
        ↓
Characteristic B
```

Examples may include:

```text
Payload Capacity
      ↓
Operational Endurance
```

```text
Tank Capacity
      ↓
Application Duration
```

```text
Battery Capacity
      ↓
Flight Time
```

These relationships may later become relevant to comparative analysis.

---

# Required and Optional Characteristics

Not every characteristic has the same status.

## Required

Necessary to represent the Product Class coherently.

```text
Product Class
      ↓
Required Characteristic
```

## Optional

Useful for deeper comparison but not essential to class representation.

```text
Product Class
      ↓
Optional Characteristic
```

## Contextual

Relevant only under specific analytical purposes.

```text
Purpose
   ↓
Contextual Characteristic
```

---

# Characteristic Evidence States

## Observed

The value is directly supported by evidence.

## Corroborated

The value is supported by multiple independent sources.

## Derived

The value is mathematically or logically derived from observed evidence.

## Normalized

The original value has been transformed into the canonical representation.

## Unknown

The characteristic belongs to the schema but no reliable value has been established.

## Unresolved

Conflicting or insufficient evidence prevents a stable value.

These states must not be collapsed into a single "missing data" category.

---

# Source Preservation

Normalization must never erase provenance.

```text
Normalized Value
      ↓
Original Value
      ↓
Source
      ↓
Observation
```

The schema therefore supports both:

```text
Comparable Representation
```

and:

```text
Evidence Traceability
```

---

# Manufacturer Terminology

Manufacturer terminology remains evidence.

It does not become schema terminology automatically.

```text
Manufacturer Term
      ↓
Observation
      ↓
Normalization
      ↓
Characteristic
```

This preserves the distinction between:

```text
Source Language
```

and:

```text
Corpus Language
```

---

# Characteristic Convergence

Different terms may refer to the same normalized characteristic.

```text
"Payload"
"Maximum Load"
"Carrying Capacity"
        ↓
Payload Capacity
```

This convergence is established through semantic normalization.

---

# Characteristic Divergence

One manufacturer term may represent multiple meanings.

```text
"Range"
   ├── Communication Range
   ├── Flight Range
   └── Operational Range
```

The schema must preserve the distinction.

Apparent semantic convergence must not erase functional divergence.

---

# Characteristic Completeness

A schema is not complete merely because every product has a value for every field.

Completeness means:

> The schema contains the characteristics necessary to represent the Product Class for its intended analytical purpose.

Therefore:

```text
Complete Schema
    ≠
Complete Data
```

A class may have a complete schema while many product values remain unknown.

---

# Characteristic Schema and Comparison

The schema establishes the structure required for comparison.

```text
Product Class
      ↓
Characteristic Schema
      ↓
Product Values
      ↓
Normalization
      ↓
Comparison
```

Comparison should not begin until the schema is sufficiently stable.

---

# Characteristic Schema and Product Class

The relationship is bidirectional over time, but precedence remains intact.

Initially:

```text
Product Class
      ↓
Characteristic Schema
```

Later, comparative evidence may reveal:

```text
Characteristic Patterns
      ↓
Classification Refinement
```

This creates feedback without reversing precedence.

```text
Product Class
      ↓
Schema
      ↓
Comparison
      ↓
New Evidence
      ↓
Class Refinement
```

---

# Characteristic Schema and Manufacturer DNA

The schema establishes a common reference for comparing manufacturers.

```text
Characteristic Schema
        ↓
Shared Comparative Space
        ↓
DJI
XAG
TopXGun
        ↓
Observed Differences
        ↓
Persistent Patterns
```

These persistent patterns may later contribute to manufacturer identity.

The schema itself does not define manufacturer DNA.

It makes differences observable.

---

# Characteristic Schema and Comparison Bias

A schema can introduce bias if it is built from one manufacturer.

For example:

```text
Manufacturer A
     ↓
Specification Fields
     ↓
Schema
```

may encode the architecture of Manufacturer A into the comparison framework.

The preferred approach is:

```text
Multiple Sources
      ↓
Normalization
      ↓
Product Class
      ↓
Shared Requirements
      ↓
Characteristic Schema
```

This reduces manufacturer-specific bias.

---

# Schema Evolution

A Characteristic Schema may evolve.

New evidence may reveal:

* a missing characteristic,
* an unnecessary characteristic,
* a hidden dependency,
* a semantic distinction,
* a new contextual condition,
* or a better normalization rule.

```text
Schema
  ↓
Comparison
  ↓
Evidence
  ↓
Refinement
  ↓
Schema'
```

Every revision must remain traceable.

---

# Schema States

## Candidate Schema

Initial structure derived from a Product Class.

## Provisional Schema

Characteristics and definitions are sufficiently coherent for testing.

## Established Schema

The structure is stable enough for systematic comparison.

## Refined Schema

The schema has evolved through new evidence.

## Deprecated Schema

The schema is no longer the preferred representation but remains historically traceable.

---

# Schema Structure

A Characteristic Schema should eventually be representable as:

```text
Characteristic Schema
├── Schema ID
├── Product Class
├── Purpose
├── Characteristics
│   ├── ID
│   ├── Name
│   ├── Definition
│   ├── Type
│   ├── Unit
│   ├── Domain
│   ├── Conditions
│   ├── Dependencies
│   ├── Required / Optional
│   └── Evidence Rules
├── Normalization Rules
├── Comparison Rules
├── Version
├── Evidence Status
└── Open Questions
```

---

# Current State

The Corpus has established the conceptual requirement for Characteristic Schema.

The next step is not to populate all possible characteristics.

It is to identify the minimum coherent schema required to compare members of each Product Class.

```text
Product Class
      ↓
Minimum Required Characteristics
      ↓
Characteristic Schema
      ↓
Validation
      ↓
Comparison
```

The schema should grow only when evidence or analytical necessity justifies its expansion.

---

# Open Questions

* What is the minimum characteristic set for each Product Class?
* Which characteristics are class-defining?
* Which are merely comparative?
* Which characteristics require contextual conditions?
* Which manufacturer terms converge semantically?
* Which apparently identical terms diverge functionally?
* Which characteristics are dependent on others?
* Which values can be normalized safely?
* Which values must remain unresolved?
* How should derived values be represented?
* When is a schema stable enough for systematic comparison?

---

# Integrity

Characteristic Schema must remain traceable to:

```text
Source
  ↓
Observation
  ↓
Normalization
  ↓
Discernment
  ↓
Function
  ↓
Product Capability
  ↓
Product Class
  ↓
Characteristic Schema
```

The schema must never:

* invent product values,
* erase source terminology,
* conceal uncertainty,
* force incompatible concepts into one field,
* reproduce one manufacturer's specification structure without justification,
* or establish comparison criteria before the Product Class is sufficiently understood.

---

## Core Principle

> **The Characteristic Schema defines the semantic space in which members of a Product Class become meaningfully comparable.**

It does not tell us which product is better.

It does not contain the comparison.

It establishes the structure that makes comparison possible.

---

# Transition to Comparison

The comparative regime now becomes:

```text
Product Class
      ↓
Characteristic Schema
      ↓
Normalized Characteristics
      ↓
Product Values
      ↓
Comparison
      ↓
Convergence / Divergence
      ↓
Discernment
```

Comparison therefore does not close the Corpus.

It creates a new evidence surface from which additional patterns may emerge.

The resulting knowledge may then return to the Corpus through the established evolutionary cycle.
