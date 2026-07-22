# UAV Normalization Matrix

## Purpose

The UAV Normalization Matrix maps heterogeneous manufacturer terminology into the shared semantic structure defined by the DAA Data Model.

The matrix preserves the identity of each manufacturer while revealing the common operational concepts that enable interoperability.

Normalization begins by extracting concepts.

---

# Normalization Workflow

```text
Manufacturer
        │
        ▼
Concept Extraction
        │
        ▼
Conceptual Normalization
        │
        ▼
DAA Entity
        │
        ▼
Configuration
```

---

# Normalization Matrix

| DAA Entity | Operational Concept | DJI | XAG | TopXGun | Notes |
|------------|--------------------|-----|-----|----------|-------|
| Identity | Brand | DJI | XAG | TopXGun | Manufacturer identity |
| Identity | Model | Agras T50 | P150 | FP600 | Product designation |
| Architecture | Platform | Aircraft | Platform | Aircraft | Functional airframe |
| Architecture | Flight Control | Flight Controller | SuperX | Flight Controller | Navigation and control |
| Modules | Liquid Application | Dual Atomizing Spraying System | RevoSpray | Spraying System | Liquid payload module |
| Modules | Solid Application | Spreading System | RevoCast | Spreading System | Granular payload module |
| Modules | Mapping | Payload (optional) | RealTerra | Mapping Payload | Mission module |
| Payload | Liquid Capacity | Spray Tank | Spray Tank | Spray Tank | Liters |
| Payload | Solid Capacity | Spread Tank | Hopper | Spread Tank | Kilograms/Liters |
| Performance | Maximum Takeoff Weight | MTOW | MTOW | MTOW | Operational limit |
| Performance | Flight Radius | Flight Radius | Flight Radius | Flight Radius | Maximum operating radius |
| Performance | Wind Resistance | Wind Resistance | Wind Resistance | Wind Resistance | Environmental capability |
| Energy | Battery | Intelligent Flight Battery | Smart Battery | Smart Battery | Energy storage |
| Energy | Charging System | Power Supply | Charger | Charger | Charging infrastructure |
| Energy | Generator | D12000iE | Generator | Generator | Field energy source |
| Positioning | GNSS | GNSS | GNSS | GNSS | Navigation |
| Positioning | RTK | RTK | RTK | RTK | Precision positioning |
| Safety | Radar | Phased Array Radar | 4D Radar | Radar | Obstacle sensing |
| Safety | Vision | Binocular Vision | Vision System | Vision System | Optical perception |
| Communications | Remote Controller | RM700B | Ground Station | Remote Controller | Human interface |
| Communications | Wireless | Wi-Fi / Bluetooth | Wireless | Wireless | Data communication |

---

# Gap Analysis

The matrix is expected to evolve.

New manufacturers may introduce:

- new terminology;
- new modules;
- new operational concepts;
- new technologies.

The DAA model should absorb these additions without modifying its semantic structure.

---

# Validation Criteria

A normalization is considered complete when:

- the original meaning is preserved;
- the operational concept is identified;
- the DAA entity is unambiguous;
- different manufacturers converge into the same concept.

---

# Emergent Property

Conceptual Convergence emerges through normalization.

Interoperability emerges from meaning.