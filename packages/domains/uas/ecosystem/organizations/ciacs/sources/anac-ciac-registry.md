# ANAC CIAC Registry

## Purpose

Represents the authoritative public source used to identify Civil Aviation
Instruction Centers (CIAC) authorized by ANAC.

The registry provides the factual basis for identifying organizations that
participate in the aeronautical training ecosystem.

It is treated as source evidence.

The semantic interpretation of each organization belongs to the CIAC domain.

## Source

**Organization:** Administración Nacional de Aviación Civil (ANAC)

**Source:** Public registry of authorized CIACs.

**Official page:**

https://www.argentina.gob.ar/anac/ciacs-habilitados

The official page provides access to the public list of authorized CIACs.

ANAC explicitly advises users to verify that the center, aircraft and
instructors are authorized before relying on their services.

## Registry Information

The registry may provide information necessary to identify:

* CIAC;
* authorization status;
* CIAC type;
* training scope;
* associated aircraft;
* instructors;
* location;
* other authorization information exposed by ANAC.

## CIAC Types

ANAC currently exposes CIAC types associated with the applicable
instructional framework.

The public information identifies:

* Type 1 — theoretical instruction;
* Type 2 — practical instruction;
* Type 3 — theoretical and practical instruction.

A candidate obtaining a license must complete the applicable theoretical
and practical instruction through the authorized combination of centers.

## Remote Pilot Training

ANAC states that remote pilot training may be provided by authorized CIACs.

Under the current RPA/RPAS framework, all CIACs certified under RAAC Part 141
may manage authorization to provide remote pilot and RPAS instructor courses
for the applicable categories.

## Regulatory Evolution

The CIAC regulatory framework is currently undergoing transition.

Resolution ANAC 293/2026 approved a new edition of RAAC Part 141.

CIACs have until December 31, 2026 to adapt their internal procedures,
Instruction and Procedures Manuals, and applicable instructional programs.

The new framework becomes mandatory for courses initiated from January 1,
2027.

## Source Integrity

The registry must not be treated as a permanent list.

A CIAC may:

* become authorized;
* change its authorization;
* expand its scope;
* lose authorization;
* be suspended;
* cease operations.

The registry must therefore be periodically retrieved and compared with
previous versions.

## Update

**Default update frequency:** monthly.

Immediate retrieval should be possible when ANAC publishes a relevant
regulatory change or when a material change in CIAC authorization is detected.

## Relationships

```text
ANAC
  ↓
authorizes / supervises
  ↓
CIAC
  ↓
provides instruction
  ↓
Remote Pilot
  ↓
qualification
```

## Related Sources

* anac-res-293-2026
* anac-raac-part-141
* anac-raac-part-61
* anac-rpa-rpas-framework
