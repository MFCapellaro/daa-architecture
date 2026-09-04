# CIAC Record

## Purpose

Represents an individual Civil Aviation Instruction Center (CIAC)
identified through the official ANAC registry.

The record preserves factual organizational evidence.

It does not evaluate the quality, reputation, commercial performance,
or suitability of the CIAC.

## Identity

Each CIAC record may contain:

* official name;
* authorization or certificate identifier;
* CIAC type;
* location;
* contact information, when publicly available;
* current authorization status;
* source reference;
* retrieval date.

## Instructional Type

A CIAC may be classified according to its authorized instructional scope.

### Type 1

Provides theoretical instruction.

### Type 2

Provides practical flight instruction.

### Type 3

Provides both theoretical and practical instruction.

A candidate may complete theoretical and practical instruction within
a Type 3 CIAC, or combine a Type 1 CIAC for theoretical instruction
with a Type 2 CIAC for practical instruction.

## RPAS Relevance

The current RPA/RPAS framework allows CIACs certified under RAAC Part 141
to request authorization to provide remote pilot and RPAS instructor
courses for the applicable categories.

The authorization of a CIAC to provide RPAS instruction must therefore
be represented independently from its general CIAC identity.

## Authorization

Authorization is contextual and temporal.

The record must distinguish between:

* CIAC certification;
* authorized instructional type;
* authorized courses;
* RPAS-specific authorization;
* current status.

An authorization must not be inferred merely from the existence of
the organization.

## Relationships

```text
ANAC
  │
  └── authorizes
          │
          ▼
        CIAC
        │ │
        │ ├── provides → Training
        │ │
        │ └── may provide → RPAS Training
        │
        ├── employs / associates → Instructor
        │
        └── operates / uses → Aircraft
```

## Evidence Principle

The CIAC record must preserve the distinction between:

1. information explicitly published by ANAC;
2. information obtained from another public source;
3. information supplied by the organization;
4. information inferred by DAA.

Only the first category establishes ANAC registry evidence.

## Temporal Preservation

A change in status, authorization, type, location, or instructional
scope must produce an updated state without destroying the previous
record.

Historical states remain part of the corpus.

## Verification

ANAC recommends verifying that the:

* CIAC;
* aircraft;
* instructors

are authorized before relying on the instructional activity.

The corpus should therefore preserve these relationships separately
when sufficient source evidence exists.

## Source

Primary source:

ANAC — CIACs habilitados.

Additional sources must be explicitly identified and must not replace
the authoritative ANAC registry evidence.
