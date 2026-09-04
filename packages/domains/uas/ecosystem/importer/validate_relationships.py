#!/usr/bin/env python3
"""
DRONSAIR ecosystem relationship validator.

Validates:
    packages/domains/uas/ecosystem/data/relationships.yml

Against:
    packages/domains/uas/ecosystem/data/nodes/*.yml

Design principles:
- validate structure;
- validate referential integrity;
- validate deterministic relationship IDs;
- preserve the distinction between evidence and semantic verification;
- never infer or modify relationships;
- never modify source files;
- report all findings without stopping at the first error.

Expected relationship shape:

- id: "mas-maiz-represented-by-bidcom-agro"
  source: "mas-maiz"
  type: represented_by
  target: "bidcom-agro"

  context:
    brand: "DJI Agriculture"

  evidence:
    source: "ecosystem-source.txt"
    line: 78
    section: "drones"

  status:
    verification: observed
    reviewRequired: true
"""

from __future__ import annotations

import re
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / "ecosystem"

RELATIONSHIPS = BASE / "data/relationships.yml"
NODES = BASE / "data/nodes"


# ---------------------------------------------------------------------------
# Allowed values
# ---------------------------------------------------------------------------

ALLOWED_VERIFICATIONS = {
    "observed",
    "partial",
    "verified",
    "unverified",
}

ALLOWED_RELATIONSHIP_TYPES = {
    "represented_by",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def finding(
    findings: list[dict],
    *,
    relationship: str | None,
    code: str,
    message: str,
) -> None:
    findings.append(
        {
            "relationship": relationship,
            "code": code,
            "message": message,
        }
    )


def load_yaml(path: Path):
    try:
        with path.open(
            "r",
            encoding="utf-8",
        ) as handle:
            return yaml.safe_load(handle)

    except yaml.YAMLError as exc:
        raise ValueError(
            f"Invalid YAML in {path}: {exc}"
        ) from exc


def deterministic_id(
    source: str,
    relationship_type: str,
    target: str,
) -> str:
    return f"{source}-{relationship_type}-{target}"


def node_ids() -> set[str]:
    """
    Load all node IDs from data/nodes/*.yml.
    """
    ids: set[str] = set()

    if not NODES.exists():
        return ids

    for path in sorted(NODES.glob("*.yml")):

        data = load_yaml(path)

        if not isinstance(data, dict):
            continue

        node_id = data.get("id")

        if isinstance(node_id, str):
            ids.add(node_id)

    return ids


# ---------------------------------------------------------------------------
# Main validation
# ---------------------------------------------------------------------------

def main() -> None:

    findings: list[dict] = []

    if not RELATIONSHIPS.exists():
        print(
            f"ERROR: relationships file not found: "
            f"{RELATIONSHIPS}"
        )
        raise SystemExit(1)

    available_nodes = node_ids()

    data = load_yaml(RELATIONSHIPS)

    # -----------------------------------------------------------------------
    # Root structure
    # -----------------------------------------------------------------------

    if not isinstance(data, list):
        finding(
            findings,
            relationship=None,
            code="invalid_root",
            message=(
                "relationships.yml must contain "
                "a YAML list."
            ),
        )

        print_report(findings, 0)
        raise SystemExit(1)

    seen_ids: set[str] = set()
    seen_relationships: set[tuple[str, str, str]] = set()

    # -----------------------------------------------------------------------
    # Relationship records
    # -----------------------------------------------------------------------

    for index, relationship in enumerate(
        data,
        start=1,
    ):

        relationship_label = (
            relationship.get("id")
            if isinstance(relationship, dict)
            else f"record-{index}"
        )

        if not isinstance(relationship, dict):
            finding(
                findings,
                relationship=relationship_label,
                code="invalid_record",
                message=(
                    "Relationship record must be "
                    "a mapping."
                ),
            )

            continue

        # -------------------------------------------------------------------
        # Required top-level fields
        # -------------------------------------------------------------------

        for field in (
            "id",
            "source",
            "type",
            "target",
        ):
            if field not in relationship:
                finding(
                    findings,
                    relationship=relationship_label,
                    code=f"missing_{field}",
                    message=(
                        f"Missing required field: {field}"
                    ),
                )

        relationship_id = relationship.get("id")
        source = relationship.get("source")
        relationship_type = relationship.get("type")
        target = relationship.get("target")

        # -------------------------------------------------------------------
        # Field types
        # -------------------------------------------------------------------

        if not isinstance(
            relationship_id,
            str,
        ):
            finding(
                findings,
                relationship=relationship_label,
                code="invalid_id",
                message="id must be a string.",
            )
            relationship_id = None

        if not isinstance(source, str):
            finding(
                findings,
                relationship=relationship_label,
                code="invalid_source",
                message="source must be a string.",
            )
            source = None

        if not isinstance(
            relationship_type,
            str,
        ):
            finding(
                findings,
                relationship=relationship_label,
                code="invalid_type",
                message="type must be a string.",
            )
            relationship_type = None

        if not isinstance(target, str):
            finding(
                findings,
                relationship=relationship_label,
                code="invalid_target",
                message="target must be a string.",
            )
            target = None

        if (
            relationship_id is not None
            and relationship_id in seen_ids
        ):
            finding(
                findings,
                relationship=relationship_id,
                code="duplicate_id",
                message=(
                    "Relationship ID appears more than once."
                ),
            )

        if relationship_id is not None:
            seen_ids.add(relationship_id)

        # -------------------------------------------------------------------
        # Relationship type
        # -------------------------------------------------------------------

        if (
            relationship_type is not None
            and relationship_type
            not in ALLOWED_RELATIONSHIP_TYPES
        ):
            finding(
                findings,
                relationship=relationship_label,
                code="unknown_relationship_type",
                message=(
                    f"Unknown relationship type: "
                    f"{relationship_type}"
                ),
            )

        # -------------------------------------------------------------------
        # Referential integrity
        # -------------------------------------------------------------------

        if (
            source is not None
            and source not in available_nodes
        ):
            finding(
                findings,
                relationship=relationship_label,
                code="missing_source_node",
                message=(
                    f"Source node does not exist: {source}"
                ),
            )

        if (
            target is not None
            and target not in available_nodes
        ):
            finding(
                findings,
                relationship=relationship_label,
                code="missing_target_node",
                message=(
                    f"Target node does not exist: {target}"
                ),
            )

        # -------------------------------------------------------------------
        # Deterministic ID
        # -------------------------------------------------------------------

        if (
            relationship_id is not None
            and source is not None
            and relationship_type is not None
            and target is not None
        ):

            expected_id = deterministic_id(
                source,
                relationship_type,
                target,
            )

            if relationship_id != expected_id:
                finding(
                    findings,
                    relationship=relationship_id,
                    code="non_deterministic_id",
                    message=(
                        f"Expected ID "
                        f"'{expected_id}'."
                    ),
                )

            key = (
                source,
                relationship_type,
                target,
            )

            if key in seen_relationships:
                finding(
                    findings,
                    relationship=relationship_id,
                    code="duplicate_relationship",
                    message=(
                        "Same source, type and target "
                        "appear more than once."
                    ),
                )

            seen_relationships.add(key)

        # -------------------------------------------------------------------
        # Context
        # -------------------------------------------------------------------

        context = relationship.get("context")

        if context is not None:

            if not isinstance(context, dict):
                finding(
                    findings,
                    relationship=relationship_label,
                    code="invalid_context",
                    message=(
                        "context must be a mapping."
                    ),
                )

            else:

                if "brand" in context:
                    brand = context["brand"]

                    if brand is not None and not isinstance(
                        brand,
                        str,
                    ):
                        finding(
                            findings,
                            relationship=relationship_label,
                            code="invalid_brand",
                            message=(
                                "context.brand must be "
                                "a string or null."
                            ),
                        )

        # -------------------------------------------------------------------
        # Evidence
        # -------------------------------------------------------------------

        evidence = relationship.get("evidence")

        if not isinstance(evidence, dict):
            finding(
                findings,
                relationship=relationship_label,
                code="missing_evidence",
                message=(
                    "evidence must be a mapping."
                ),
            )

        else:

            for field in (
                "source",
                "line",
                "section",
            ):
                if field not in evidence:
                    finding(
                        findings,
                        relationship=relationship_label,
                        code=f"missing_evidence_{field}",
                        message=(
                            f"Missing evidence field: "
                            f"{field}"
                        ),
                    )

            if "source" in evidence:
                if not isinstance(
                    evidence["source"],
                    str,
                ):
                    finding(
                        findings,
                        relationship=relationship_label,
                        code="invalid_evidence_source",
                        message=(
                            "evidence.source must be "
                            "a string."
                        ),
                    )

            if "line" in evidence:
                if (
                    not isinstance(
                        evidence["line"],
                        int,
                    )
                    or isinstance(
                        evidence["line"],
                        bool,
                    )
                    or evidence["line"] < 1
                ):
                    finding(
                        findings,
                        relationship=relationship_label,
                        code="invalid_evidence_line",
                        message=(
                            "evidence.line must be "
                            "a positive integer."
                        ),
                    )

            if "section" in evidence:
                if not isinstance(
                    evidence["section"],
                    str,
                ):
                    finding(
                        findings,
                        relationship=relationship_label,
                        code="invalid_evidence_section",
                        message=(
                            "evidence.section must be "
                            "a string."
                        ),
                    )

        # -------------------------------------------------------------------
        # Status
        # -------------------------------------------------------------------

        status = relationship.get("status")

        if not isinstance(status, dict):
            finding(
                findings,
                relationship=relationship_label,
                code="missing_status",
                message=(
                    "status must be a mapping."
                ),
            )

        else:

            if "verification" not in status:
                finding(
                    findings,
                    relationship=relationship_label,
                    code="missing_verification",
                    message=(
                        "Missing status.verification."
                    ),
                )

            else:

                verification = status["verification"]

                if verification not in ALLOWED_VERIFICATIONS:
                    finding(
                        findings,
                        relationship=relationship_label,
                        code="invalid_verification",
                        message=(
                            f"Unknown verification state: "
                            f"{verification}"
                        ),
                    )

            if "reviewRequired" not in status:
                finding(
                    findings,
                    relationship=relationship_label,
                    code="missing_review_required",
                    message=(
                        "Missing status.reviewRequired."
                    ),
                )

            elif not isinstance(
                status["reviewRequired"],
                bool,
            ):
                finding(
                    findings,
                    relationship=relationship_label,
                    code="invalid_review_required",
                    message=(
                        "status.reviewRequired must "
                        "be boolean."
                    ),
                )

    print_report(
        findings,
        len(data),
    )

    if findings:
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(
    findings: list[dict],
    relationships_checked: int,
) -> None:

    print(
        f"Relationships checked: "
        f"{relationships_checked}"
    )

    print(
        f"Findings: {len(findings)}"
    )

    if not findings:
        return

    print()

    for item in findings:
        relationship = item["relationship"]

        if relationship:
            print(
                f"[{item['code']}] "
                f"{relationship}: "
                f"{item['message']}"
            )
        else:
            print(
                f"[{item['code']}] "
                f"{item['message']}"
            )


if __name__ == "__main__":
    main()
