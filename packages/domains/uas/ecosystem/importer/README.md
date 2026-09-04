# DRONSAIR Ecosystem Importer

## Location

`packages/domains/uas/ecosystem/importer/import_ecosystem.py`

## Input

`packages/domains/uas/ecosystem/data/raw/ecosystem-source.txt`

## Output

`packages/domains/uas/ecosystem/data/generated/nodes/*.yml`

`packages/domains/uas/ecosystem/data/generated/import-report.json`

## Operating principle

The importer is deliberately conservative:

1. It reads the research listing.
2. It detects sections/layers.
3. It creates deterministic node IDs.
4. It extracts obvious URLs.
5. It preserves source line, section and raw source text.
6. It records signals such as:
   - no website;
   - website not working;
   - website does not show drones.
7. It marks imported nodes as `reviewRequired: true`.
8. It does NOT infer missing coordinates, capabilities or relationships.
9. Re-running the importer regenerates the derived YAML dataset.

This makes the YAML files a generated operational dataset, while the research
listing remains the source input.

## Next evolution

After validation, the importer should gain:
- explicit merge/alias rules;
- location parsing;
- brand relationships;
- capability normalization;
- confidence scoring;
- change detection between imports;
- optional PostgreSQL/PostGIS export.
