"""
DRONSAIR ecosystem validator.

Responsibility:
    Inspect normalized ecosystem nodes and report structural,
    provenance, and evidence inconsistencies.

Design principles:
    - never modify nodes;
    - never merge entities;
    - never invent missing data;
    - distinguish invalidity from incompleteness;
    - preserve ambiguity as a review finding.

The validator observes. Human review decides.
"""

from __future__ import annotations

from pathlib import Path
import re
import yaml


REQUIRED_TOP_LEVEL = {
    "id",
    "name",
    "type",
    "identity",
    "layers",
    "capabilities",
    "presence",
    "source",
    "status",
}

VALID_VERIFICATION = {
    "partial",
    "verified",
    "rejected",
}

VALID_IDENTITY_STATUS = {
    "active",
    "inactive",
    "unknown",
}

VALID_TYPES = {
    "company",
    "institution",
    "organization",
    "media",
    "event",
}

REQUIRED_PRESENCE = {
    "website",
    "websiteMentioned",
    "websiteMentionsDrones",
    "websiteUnavailable",
}

REQUIRED_SOURCE = {
    "file",
    "line",
    "section",
    "raw",
}


def finding(
    *,
    node_id: str | None,
    severity: str,
    code: str,
    message: str,
) -> dict:
    """Create one deterministic validation finding."""
    return {
        "nodeId": node_id,
        "severity": severity,
        "code": code,
        "message": message,
    }


def validate_node(node: dict) -> list[dict]:
    """
    Validate one normalized node.

    Returns findings without modifying the node.
    """
    findings: list[dict] = []

    node_id = node.get("id")

    # ---------------------------------------------------------
    # Top-level structure
    # ---------------------------------------------------------

    missing = REQUIRED_TOP_LEVEL - set(node.keys())

    if missing:
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="missing_top_level_fields",
                message=(
                    "Missing required top-level fields: "
                    + ", ".join(sorted(missing))
                ),
            )
        )

    # ---------------------------------------------------------
    # Identity
    # ---------------------------------------------------------

    identity = node.get("identity")

    if not isinstance(identity, dict):
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="invalid_identity",
                message="Identity must be an object.",
            )
        )
    else:
        identity_status = identity.get("status")

        if identity_status not in VALID_IDENTITY_STATUS:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="invalid_identity_status",
                    message=f"Unknown identity status: {identity_status!r}.",
                )
            )

    # ---------------------------------------------------------
    # Basic identity fields
    # ---------------------------------------------------------

    name = node.get("name")

    if not isinstance(name, str) or not name.strip():
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="missing_name",
                message="Node name is missing or empty.",
            )
        )

    node_type = node.get("type")

    if node_type not in VALID_TYPES:
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="invalid_type",
                message=f"Unknown node type: {node_type!r}.",
            )
        )

    # ---------------------------------------------------------
    # Layers
    # ---------------------------------------------------------

    layers = node.get("layers")

    if not isinstance(layers, list) or not layers:
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="invalid_layers",
                message="Node must contain at least one layer.",
            )
        )

    # ---------------------------------------------------------
    # Presence
    # ---------------------------------------------------------

    presence = node.get("presence")

    if not isinstance(presence, dict):
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="invalid_presence",
                message="Presence must be an object.",
            )
        )
    else:
        missing_presence = REQUIRED_PRESENCE - set(presence.keys())

        if missing_presence:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="missing_presence_fields",
                    message=(
                        "Missing presence fields: "
                        + ", ".join(sorted(missing_presence))
                    ),
                )
            )

        website = presence.get("website")
        website_mentioned = presence.get("websiteMentioned")
        website_mentions_drones = presence.get(
            "websiteMentionsDrones"
        )

        # Absence of a website must not become positive evidence.
        if website is None and website_mentions_drones is True:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="unsupported_web_evidence",
                    message=(
                        "websiteMentionsDrones is true while no website "
                        "is present."
                    ),
                )
            )

        # If a website is explicitly mentioned, the flag should agree.
        if website is not None and website_mentioned is not True:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="warning",
                    code="website_flag_mismatch",
                    message=(
                        "A website is present but websiteMentioned "
                        "is not true."
                    ),
                )
            )

        # A missing website makes drone-content evidence unknown.
        if website is None and website_mentions_drones is not None:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="warning",
                    code="missing_web_evidence",
                    message=(
                        "No website is available; "
                        "websiteMentionsDrones should normally be null."
                    ),
                )
            )

    # ---------------------------------------------------------
    # Provenance
    # ---------------------------------------------------------

    source = node.get("source")

    if not isinstance(source, dict):
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="invalid_source",
                message="Source must be an object.",
            )
        )
    else:
        missing_source = REQUIRED_SOURCE - set(source.keys())

        if missing_source:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="missing_provenance",
                    message=(
                        "Missing provenance fields: "
                        + ", ".join(sorted(missing_source))
                    ),
                )
            )

        source_line = source.get("line")

        if not isinstance(source_line, int) or source_line < 1:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="invalid_source_line",
                    message="Source line must be a positive integer.",
                )
            )

        if not source.get("raw"):
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="missing_raw_evidence",
                    message="Raw source evidence is missing.",
                )
            )

    # ---------------------------------------------------------
    # Status
    # ---------------------------------------------------------

    status = node.get("status")

    if not isinstance(status, dict):
        findings.append(
            finding(
                node_id=node_id,
                severity="error",
                code="invalid_status",
                message="Status must be an object.",
            )
        )
    else:
        verification = status.get("verification")

        if verification not in VALID_VERIFICATION:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="error",
                    code="invalid_verification",
                    message=f"Unknown verification status: {verification!r}.",
                )
            )

        if status.get("imported") is not True:
            findings.append(
                finding(
                    node_id=node_id,
                    severity="warning",
                    code="not_marked_imported",
                    message="Imported status is not explicitly true.",
                )
            )

    # ---------------------------------------------------------
    # Review conditions
    # ---------------------------------------------------------

    source_section = (
        node.get("source", {}).get("section")
        if isinstance(node.get("source"), dict)
        else None
    )

    if source_section == "unknown":
        findings.append(
            finding(
                node_id=node_id,
                severity="review",
                code="unknown_section",
                message=(
                    "Source section could not be normalized and "
                    "requires human review."
                ),
            )
        )

    return findings


def validate_file(path: Path) -> list[dict]:
    """Load and validate one YAML node file."""
    try:
        node = yaml.safe_load(
            path.read_text(
                encoding="utf-8",
                errors="replace",
            )
        )
    except yaml.YAMLError as exc: 
        return [
        {
            "nodeId": None,
            "severity": "error",
            "code": "invalid_yaml",
            "message": f"Invalid YAML: {exc}",
            "file": path.name,
        }
    ]

    if not isinstance(node, dict):
        return [
            finding(
                node_id=None,
                severity="error",
                code="invalid_node_document",
                message="YAML document must contain an object.",
            )
        ]

    findings = validate_node(node)

    # Keep the filename available for report generation.
    for item in findings:
        item["file"] = path.name

    return findings


def validate_directory(directory: Path) -> list[dict]:
    """Validate every YAML node in a directory."""
    findings: list[dict] = []

    for path in sorted(directory.glob("*.yml")):
        findings.extend(validate_file(path))

    return findings


if __name__ == "__main__":
    import sys

    directory = (
        Path(sys.argv[1])
        if len(sys.argv) > 1
        else Path(__file__).resolve().parents[1] / "data" / "nodes"
    )

    results = validate_directory(directory)

    print(f"Files checked: {len(list(directory.glob('*.yml')))}")
    print(f"Findings: {len(results)}")

    for item in results:
        print(
            f"[{item['severity']}] "
            f"{item.get('file', '?')} "
            f"{item['code']}: "
            f"{item['message']}"
        )