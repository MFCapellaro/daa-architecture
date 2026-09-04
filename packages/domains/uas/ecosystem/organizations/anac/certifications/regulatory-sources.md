# Regulatory Sources

## Purpose

This document identifies the regulatory sources that establish, modify, or support the requirements represented within the certification domain.

It does not reproduce regulatory content.

It provides the relationship between certification requirements and their authoritative regulatory sources.

---

## Primary Regulatory Framework

### RAAC Part 61

**Domain:** Personnel licensing and certificates of competence.

Part 61 establishes requirements applicable to aeronautical personnel licensing and certificates of competence.

Within the RPA/RPAS ecosystem, it provides the regulatory basis for remote pilot competence and licensing requirements.

**Role in this corpus:**

* remote pilot licensing;
* pilot competence;
* training requirements;
* theoretical examination;
* practical examination;
* applicable pilot qualification requirements.

**Source relationship:**

```text
Remote Pilot
      ↓
Qualification
      ↓
RAAC Part 61
```

---

### RAAC Part 67

**Domain:** Aeronautical medical certification.

Part 67 establishes requirements concerning aeronautical medical certification.

Within the RPA/RPAS ecosystem, its requirements may apply to remote pilots according to the applicable regulatory framework.

**Role in this corpus:**

* medical certification;
* medical fitness;
* applicable medical standards.

**Source relationship:**

```text
Remote Pilot
      ↓
Medical Certification
      ↓
RAAC Part 67
```

---

### RAAC Part 100

**Domain:** General requirements for RPA/RPAS operations.

Part 100 establishes the general regulatory framework for RPA/RPAS operations.

It provides the context within which operational categories, limitations and requirements are determined.

**Source relationship:**

```text
Aircraft + Operation + Context
              ↓
        RAAC Part 100
```

---

### RAAC Part 101

**Domain:** Open Category.

Part 101 establishes particular provisions applicable to operations within the Open Category.

Its requirements must be interpreted together with Part 100 and any applicable amendments.

---

### RAAC Part 102

**Domain:** Specific Category.

Part 102 establishes particular provisions applicable to operations within the Specific Category.

Its requirements include the applicable operational authorization and risk-management framework.

---

## Regulatory Resolutions

### Resolution ANAC 550/2025

Establishes the current regulatory architecture that approved:

* RAAC Part 100;
* RAAC Part 101;
* RAAC Part 102.

It is therefore a foundational source for the current RPA/RPAS regulatory framework.

**Source ID:**

`anac-res-550-2025`

---

### Resolution ANAC 312/2026

Approves Amendment No. 1 to the Second Edition of RAAC Part 100.

It modifies provisions concerning:

* definitions;
* exclusions;
* operational categories;
* operational limitations.

This resolution is particularly relevant to rural rotary-wing operations.

**Source ID:**

`anac-res-312-2026`

---

## Source Relationships

The regulatory structure represented in this corpus is:

```text
ANAC
 │
 ├── Resolution 550/2025
 │       │
 │       ├── RAAC Part 100
 │       │       │
 │       │       ├── Resolution 312/2026
 │       │       │
 │       │       └── General operational framework
 │       │
 │       ├── RAAC Part 101
 │       │       └── Open Category
 │       │
 │       └── RAAC Part 102
 │               └── Specific Category
 │
 ├── RAAC Part 61
 │       └── Remote Pilot Qualification
 │
 └── RAAC Part 67
         └── Medical Certification
```

---

## Temporal Principle

Regulatory sources are versioned evidence.

A new resolution or amendment must not overwrite the historical source from which a previous interpretation emerged.

Instead:

```text
Previous Source
      ↓
New Regulatory Evidence
      ↓
Updated Interpretation
```

Historical sources remain traceable.

---

## Certification Interpretation

Certification requirements must be represented as relationships between the relevant participant and the applicable regulatory context.

They must not be embedded as permanent characteristics of a product.

For example:

```text
Product
   ↓
Aircraft
   ↓
Operation
   ↓
Regulatory Context
   ├── Pilot Qualification
   ├── Medical Certification
   ├── Aircraft Registration
   └── Operational Requirements
```

---

## Source Authority

The authoritative origin for the regulatory material represented here is the Administración Nacional de Aviación Civil (ANAC).

Official ANAC regulatory publications and amendments constitute the primary evidence.

The semantic representations in this domain remain subordinate to their originating sources.

---

## Update

Regulatory sources should be checked on the defined update cycle.

**Default update frequency:** monthly.

A relevant regulatory change may trigger an immediate update independently of the regular cycle.

The update mechanism must:

1. identify the source;
2. verify its current version;
3. detect changes;
4. preserve the previous version;
5. register the new evidence;
6. flag affected semantic representations for review.

---

## Related Corpus

Primary source evidence is maintained in:

```text
packages/domains/uas/ecosystem/organizations/anac/sources/
```

Certification representations are maintained in:

```text
packages/domains/uas/ecosystem/organizations/anac/certifications/
```
