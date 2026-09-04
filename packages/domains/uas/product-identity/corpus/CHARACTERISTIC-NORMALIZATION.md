# Characteristic Normalization

## Purpose

Characteristic Normalization transforms observed product characteristics into a coherent semantic and representational form suitable for comparison.

Normalization preserves the meaning and provenance of the original observation while establishing a common representation.

---

## Methodological Position

Characteristic Normalization follows Characteristic Schema and precedes Comparison.

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
Product Capability
  ↓
Classification
  ↓
Product Class
  ↓
Characteristic Schema
  ↓
Characteristic Normalization
  ↓
Comparison
```

The distinction between the first normalization layer and Characteristic Normalization is intentional.

### Semantic Normalization

Establishes coherent meaning across source terminology.

### Characteristic Normalization

Establishes coherent representation of an already identified characteristic.

```text id="5v4n3c"
Source Language
      ↓
Semantic Normalization
      ↓
Characteristic
      ↓
Characteristic Normalization
      ↓
Comparable Representation
```

---

# Core Principle

> **Characteristic Normalization preserves observed meaning while establishing a common representation for comparison.**

Normalization must transform representation without transforming evidence.

---

# Observation Precedes Normalization

No characteristic should be normalized without an underlying observation.

```text id="2j7x1m"
Observation
    ↓
Normalization
```

The normalized value must remain traceable to:

```text id="q5b8vz"
Source
  ↓
Original Observation
  ↓
Normalized Representation
```

---

# Original Value and Normalized Value

Both must be preserved.

```text id="6r2m4p"
Original Value
      ↓
Normalization
      ↓
Normalized Value
```

Example:

```text id="f8v3kd"
Original:
10.57 gal

Normalized:
40.0 L
```

The normalized value does not replace the original evidence.

It accompanies it.

---

# Semantic Identity Precedes Numeric Normalization

A numerical conversion is legitimate only after the characteristic identity has been established.

For example:

```text id="g7c2ps"
"40 L"
```

cannot be normalized meaningfully until we know whether it represents:

* tank capacity,
* payload capacity,
* usable liquid capacity,
* recommended fill volume,
* or another quantity.

Therefore:

```text id="1x5h9a"
Meaning
  ↓
Characteristic Identity
  ↓
Unit Normalization
```

not:

```text id="2v9k4e"
Number
  ↓
Unit Conversion
  ↓
Assumed Meaning
```

---

# Normalization Dimensions

Characteristic normalization may operate across several dimensions.

## Semantic

Determines what the characteristic means.

```text id="a6n3qs"
Source Term
   ↓
Normalized Concept
```

---

## Unit

Establishes a canonical unit.

```text id="c8m5tw"
Original Unit
   ↓
Canonical Unit
```

---

## Scale

Establishes a consistent numerical scale.

```text id="d4x7np"
kg
g
lb
   ↓
Canonical Scale
```

---

## Representation

Establishes how the value is structurally represented.

```text id="w2h9km"
Single Value
Range
Boolean
Category
Set
Conditioned Value
```

---

## Context

Preserves the conditions under which the value is valid.

```text id="p7r1zc"
Value
  +
Condition
  ↓
Normalized Characteristic
```

---

# Semantic Normalization

Different source expressions may represent the same characteristic.

```text id="e3k6mv"
"Payload"
"Maximum Load"
"Carrying Capacity"
        ↓
Payload Capacity
```

The convergence must be supported by evidence and functional meaning.

Terminological similarity alone is insufficient.

---

# Semantic Divergence

A source term may represent different characteristics.

```text id="q9f4sb"
"Range"
   ├── Communication Range
   ├── Flight Range
   └── Operational Range
```

Normalization must preserve these distinctions.

A single normalized field must never absorb meanings that are functionally different.

---

# Unit Normalization

When the characteristic identity is stable, units may be normalized.

```text id="v6k8jy"
Original Value
     ↓
Original Unit
     ↓
Conversion
     ↓
Canonical Unit
```

Examples:

```text id="h2s7cq"
1000 g → 1 kg
10.57 gal → 40.0 L
```

The conversion must be deterministic and traceable.

---

# Precision

Normalization must not create false precision.

If the source states:

```text id="r1c5xw"
40 L
```

the normalized representation should not imply:

```text id="j9m3ka"
40.000000 L
```

unless such precision is supported by the source.

Normalization changes representation.

It does not increase evidence quality.

---

# Significant Digits

Normalized values should preserve the meaningful precision of the source.

```text id="n8q4lz"
10.57 gal
   ↓
40.0 L
```

The resulting precision should reflect the source and the conversion.

---

# Ranges

A range must remain a range.

```text id="w4p8sd"
10–15 km
```

must not become:

```text id="c6j2qa"
12.5 km
```

unless the midpoint is explicitly derived for a defined analytical purpose.

The schema must distinguish:

* minimum,
* maximum,
* nominal,
* average,
* tested,
* estimated,
* and derived values.

---

# Conditional Values

A value without its conditions may lose meaning.

```text id="m7x3kf"
Flight Time
    +
Payload
    +
Wind
    +
Operating Mode
       ↓
Normalized Observation
```

Normalization must preserve relevant conditions rather than flattening them into a single number.

---

# Derived Values

Derived values must be distinguished from observed values.

```text id="v2n8rc"
Observed Value
      ↓
Derivation Rule
      ↓
Derived Value
```

For example:

```text id="s5k1bd"
Observed:
Tank Capacity = 40 L

Derived:
Capacity in m³ = 0.04 m³
```

The derived value must never be presented as though it were directly observed.

---

# Inferred Values

Inferred values are different from derived values.

```text id="q4m8hx"
Evidence
   ↓
Reasoning
   ↓
Inference
```

An inference contains interpretation beyond direct transformation.

It must therefore carry a distinct status.

```text id="t7c3pn"
Observed
Derived
Inferred
```

These states must not be conflated.

---

# Unknown Values

A characteristic may belong to the schema while its value remains unknown.

```text id="d8v5mq"
Characteristic
      ↓
No Reliable Observation
      ↓
Unknown
```

Unknown does not mean zero.

It does not mean absent.

It means that the Corpus has not established a reliable value.

---

# Unresolved Values

Conflicting evidence requires a different state.

```text id="x3r7kn"
Source A → 40 L
Source B → 45 L
        ↓
    Conflict
        ↓
    Unresolved
```

The Corpus should preserve the conflict rather than arbitrarily selecting one value.

---

# Not Applicable

A characteristic may legitimately not apply to a product.

```text id="j6w2sp"
Characteristic
      ↓
Not Applicable
```

This differs from:

```text id="r9m4cx"
Unknown
```

and:

```text id="v3q7la"
Unresolved
```

These states must remain distinct.

---

# Absent and Not Applicable

An explicitly absent feature may also be meaningful.

```text id="p8c5zr"
Characteristic
      ↓
Feature Absent
```

This differs from:

```text id="m1x6vb"
Characteristic
      ↓
Not Applicable
```

and:

```text id="q4h9sk"
Characteristic
      ↓
Unknown
```

The distinction matters for comparison.

---

# Boolean Normalization

Boolean characteristics require a controlled semantic interpretation.

Source expressions such as:

```text id="n7k2wd"
"Yes"
"Available"
"Supported"
"Included"
```

may converge into:

```text
true
```

but only when they refer to the same defined capability.

Likewise:

```text
"No"
"Not supported"
"Unavailable"
```

may normalize to:

```text
false
```

provided the semantic context is equivalent.

---

# Categorical Normalization

Categorical values require controlled vocabularies where appropriate.

```text
"Manual"
"Assisted"
"Automatic"
"Autonomous"
```

must not be collapsed into one category merely because all describe control.

The schema must preserve distinctions that affect meaning.

---

# Structural Normalization

Structural characteristics require semantic mapping rather than numerical conversion.

```text
Manufacturer Structure
       ↓
Normalized Structure
```

For example, multiple manufacturer descriptions of a propulsion configuration may normalize to a common structural concept while retaining the original terminology.

---

# Temporal Normalization

Time-related characteristics require a common temporal representation.

Examples:

```text
minutes
hours
seconds
```

may be normalized to a canonical unit.

But the schema must also distinguish:

* maximum,
* nominal,
* tested,
* estimated,
* and condition-dependent duration.

---

# Contextual Normalization

Some characteristics require context to remain valid.

```text
Characteristic
      ↓
Value
      +
Context
```

For UAS this may include:

* payload,
* weather,
* altitude,
* wind,
* operating mode,
* application type,
* terrain,
* battery condition,
* or regulatory context.

The normalized representation must preserve context when it affects interpretation.

---

# Regulatory Normalization

Regulatory characteristics require special care.

A regulatory classification is not necessarily a physical characteristic.

```text
Physical Property
      ↓
Regulatory Interpretation
```

These must remain distinct.

For example:

```text
Weight
   ↓
Regulatory Category
```

does not mean that the regulatory category is itself a physical property.

Regulatory normalization should therefore preserve:

* jurisdiction,
* regulatory framework,
* effective date,
* threshold,
* and classification basis.

---

# Source Hierarchy

When multiple sources provide the same characteristic, normalization should preserve source identity.

```text id="v9m2lc"
Source A ─┐
Source B ─┼──→ Characteristic
Source C ─┘
```

Differences should be evaluated rather than silently averaged.

The Corpus should prefer evidence according to explicit source rules.

---

# Conflicting Values

Conflicting observations must remain visible.

```text id="x6q4nb"
Observation A
     40 L
        \
         → Conflict Analysis
        /
Observation B
     45 L
```

Possible outcomes include:

```text id="m8r1yc"
Confirmed
Preferred Source
Condition-dependent
Version-dependent
Unresolved
```

The resolution must remain traceable.

---

# Version Normalization

Products may change across revisions, configurations, or production periods.

```text id="j3w7kp"
Product
 ├── Version A
 ├── Version B
 └── Version C
```

Normalization must not merge version-specific values unless equivalence has been established.

---

# Configuration Normalization

A product may have multiple configurations.

```text id="q5v8mz"
Product
   ↓
Configuration
   ↓
Characteristic Value
```

Configuration-dependent values should remain associated with their configuration.

---

# Characteristic Identity

Each normalized characteristic should preserve:

```text id="r7k2px"
Characteristic
├── Identity
├── Definition
├── Original Value
├── Original Unit
├── Normalized Value
├── Normalized Unit
├── Conditions
├── Source
├── Evidence Status
├── Transformation
└── Version
```

This creates an auditable normalization record.

---

# Normalization Record

A normalized value should conceptually be represented as:

```text id="w4m9sd"
{
  characteristic,
  originalValue,
  originalUnit,
  normalizedValue,
  normalizedUnit,
  conditions,
  source,
  evidenceStatus,
  transformation,
  version
}
```

The exact implementation may evolve.

The conceptual requirement remains stable.

---

# Normalization and Comparability

Normalization creates the conditions for comparison.

```text id="k1x7qc"
Product A
  ↓
Normalized Characteristic
  \
   \
    → Comparable Representation
   /
  /
Product B
  ↓
Normalized Characteristic
```

Only after semantic and representational equivalence has been established should values be compared.

---

# Normalization Does Not Eliminate Difference

Normalization should establish common representation without erasing meaningful differences.

```text id="s6p3vn"
Normalization
     ↓
Common Representation
     +
Preserved Difference
```

This is critical.

The objective is not to make products appear identical.

The objective is to make their differences interpretable.

---

# Normalization and Manufacturer DNA

Manufacturer-specific terminology and implementation should remain traceable after normalization.

```text id="d8q2lm"
Source Expression
      ↓
Normalized Characteristic
      ↓
Comparison
      ↓
Observed Divergence
```

If normalization erases the source distinction too early, manufacturer patterns may disappear.

Therefore:

> **Normalize meaning, not identity.**

---

# Normalization and Comparison

Comparison receives normalized characteristics.

```text id="p4m7yc"
Characteristic Schema
      ↓
Observed Characteristics
      ↓
Characteristic Normalization
      ↓
Comparable Values
      ↓
Comparison
```

The comparison layer should not perform semantic normalization retroactively.

If comparison reveals a normalization problem, the correction should return to this layer.

---

# Feedback

Comparison may reveal that normalization rules are insufficient.

```text id="n8c3vx"
Normalization
      ↓
Comparison
      ↓
Unexpected Divergence
      ↓
Normalization Review
      ↓
Refined Normalization
```

This is a valid feedback loop.

It does not violate precedence because the new normalization is triggered by new evidence.

---

# Normalization States

## Raw

Original source representation.

## Semantically Identified

Characteristic meaning has been established.

## Normalized

Representation has been transformed into the canonical form.

## Derived

Value has been mathematically transformed from observed data.

## Inferred

Value depends on interpretation beyond direct transformation.

## Corroborated

Multiple compatible sources support the value.

## Unknown

No reliable value has been established.

## Unresolved

Evidence conflicts or remains insufficient.

## Not Applicable

Characteristic does not apply.

These states should remain explicit.

---

# Normalization Integrity

Characteristic Normalization must preserve:

### Provenance

The origin of the observation remains traceable.

### Meaning

Normalization does not alter semantic identity.

### Precision

Normalization does not manufacture accuracy.

### Context

Relevant conditions remain attached.

### Uncertainty

Unknown and unresolved states remain visible.

### Distinction

Meaningful differences are not collapsed.

### Reversibility

Where practical, the transformation can be traced back to the original representation.

---

# Current State

The Corpus now establishes the following comparative preparation sequence:

```text id="y7p2km"
Product Class
      ↓
Characteristic Schema
      ↓
Characteristic Observation
      ↓
Characteristic Normalization
      ↓
Comparable Representation
      ↓
Comparison
```

This completes the preparation required before systematic comparison.

---

# Open Questions

* Which characteristics require semantic normalization rules?
* Which units should be canonical for each schema?
* How should condition-dependent values be represented?
* How should conflicting manufacturer specifications be resolved?
* How should version and configuration differences be handled?
* Which transformations are safe to automate?
* Which transformations require human discernment?
* How should uncertainty propagate into comparison?
* Which normalized representations preserve manufacturer-specific evidence most effectively?

---

## Core Principle

> **Characteristic Normalization creates comparability without erasing provenance, uncertainty, context, or meaningful difference.**

The normalized value is therefore not a replacement for the observation.

It is a coherent representation of the observation.

---

# Transition to Comparison

The Corpus is now prepared to enter the comparative layer:

```text
Evidence
   ↓
Observation
   ↓
Meaning
   ↓
Product Capability
   ↓
Classification
   ↓
Product Class
   ↓
Characteristic Schema
   ↓
Characteristic Normalization
   ↓
Comparison
   ↓
Convergence / Divergence
   ↓
Discernment
```

Comparison becomes meaningful only because the preceding layers have established what is being compared, why it belongs together, which characteristics matter, and how their observations can be represented coherently.

**Comparison does not begin with values.

It begins with established meaning.**
