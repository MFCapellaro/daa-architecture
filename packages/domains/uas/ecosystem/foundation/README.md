# DRONSAIR — Ecosystem Foundation

First vertical slice for the ecosystem map.

The current corpus already contains a broad discovery of actors and categories; this package defines the first frontend-facing contract without changing the corpus.

Principles:
- Source knowledge is independent from frontend state.
- A node may belong to multiple layers.
- Relationships are latent data and become visible through interaction.
- YAML is the initial human-readable source format.
- The dataset can later be generated into PostgreSQL/PostGIS without changing the frontend contract.

Pipeline:

Corpus → YAML → validation → generated dataset → API/DB → frontend

The sample YAML files are intentionally a vertical slice, not the full ecosystem import.
