#!/usr/bin/env python3
"""
DRONSAIR ecosystem importer.

Input:
  packages/domains/uas/ecosystem/data/raw/ecosystem-source.txt

Output:
  packages/domains/uas/ecosystem/data/nodes/*.yml
  packages/domains/uas/ecosystem/data/generated/import-report.json

Hierarchy:

  * SECTION
    ** SUBSECTION / BRAND
      ENTITY
        CONTEXT
          ENTITY

Example:

  *DRONES
  **DJI Agriculture
  Tekron - ...
      Dealers
          Maquinagro S.A. - ...
          Nor Semillas - ...

This importer interprets indentation as structure.

Design goals:
- preserve source wording;
- respect the explicit * / ** hierarchy;
- respect indentation hierarchy;
- import representatives;
- import dealers when they are explicitly nested under "Dealers";
- do not confuse structural headings with entities;
- do not turn people, roles or departments into nodes;
- never invent missing data;
- keep provenance for every imported record;
- generate deterministic IDs;
- allow re-running after the source listing is updated.

Important:

This importer does NOT create semantic relationships yet.

The following information is retained in the import report so that
a later relationship layer can establish:

    dealer -> representative
    dealer -> brand

Human review remains required for ambiguous entities and relationships.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from normalizer import normalize


ROOT = Path(__file__).resolve().parents[2]  # .../uas
BASE = ROOT / "ecosystem"

SOURCE = BASE / "data/raw/ecosystem-source.txt"
OUT = BASE / "data/nodes"
REPORT = BASE / "data/generated/import-report.json"


# ---------------------------------------------------------------------------
# Section mapping
# ---------------------------------------------------------------------------

SECTION_MAP = {
    "DRONES": "drones",
    "Operadores": "operators",
    "CIACs": "academia",
    "CIAC": "academia",
    "Organismos Públicos": "public",
    "Organismos Publicos": "public",
    "Seguros": "insurance",
    "Educación / Universidades": "academia",
    "Educacion / Universidades": "academia",
    "Software": "technology",
    "Eventos": "events",
    "Fitosanitarios": "suppliers",
    "Directorios": "media",
    "StartUps": "technology",
    "Media": "media",
}


# ---------------------------------------------------------------------------
# Structural headings
# ---------------------------------------------------------------------------

STRUCTURAL_HEADINGS = {
    "autoridades",
    "comité ejecutivo",
    "comite ejecutivo",
    "certificaciones",
    "internacional",
    "prospectiva",
    "regionales",
    "sistema chacras",
    "administración y finanzas",
    "administracion y finanzas",
    "comunicación",
    "comunicacion",
    "nexo",
    "recursos humanos",
    "políticas públicas",
    "politicas publicas",
    "asesores externos",
    "cámaras asociadas",
    "camaras asociadas",
    "dealers",
}


ROLE_PREFIXES = (
    "presidente",
    "vicepresidente",
    "vice presidenta",
    "vicepresidenta",
    "secretario",
    "secretaria",
    "tesorero",
    "tesorera",
    "director",
    "directora",
    "subdirector",
    "subdirectora",
    "gerente",
    "gerenta",
    "responsable",
    "coordinador",
    "coordinadora",
    "asesor",
    "asesora",
    "miembro de equipo",
    "jefe",
    "jefa",
    "ingeniero",
    "ingeniera",
    "ing.",
    "dr.",
    "dra.",
)


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def normalize_text(value: str) -> str:
    """
    Normalize mojibake and whitespace conservatively.
    """
    if "Ã" in value or "Â" in value or "â" in value:
        try:
            repaired = value.encode("latin1").decode("utf-8")
            return repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass

    return value


def clean_source_line(line: str) -> str:
    """
    Remove structural whitespace while preserving source wording.
    """
    return normalize_text(line.strip())


# ---------------------------------------------------------------------------
# Indentation
# ---------------------------------------------------------------------------

def indentation(line: str) -> int:
    """
    Return logical indentation level.

    Tabs are treated as one structural level.
    Groups of spaces are also interpreted as indentation.

    The importer primarily cares about relative hierarchy:

        0 = top-level
        1 = nested context
        2 = entity inside that context
    """

    prefix = line[: len(line) - len(line.lstrip())]

    if not prefix:
        return 0

    tab_count = prefix.count("\t")

    spaces = prefix.replace("\t", "")

    if spaces:
        tab_count += max(1, len(spaces) // 2)

    return tab_count


# ---------------------------------------------------------------------------
# Section / subsection detection
# ---------------------------------------------------------------------------

def is_main_section(line: str) -> bool:
    """
    Main sections use a single leading '*'.

    Examples:
        *DRONES
        *Operadores
        *CIACs
    """

    s = line.strip()

    return (
        s.startswith("*")
        and not s.startswith("**")
        and len(s) > 1
    )


def is_subsection(line: str) -> bool:
    """
    Second-level headings use '**'.

    Examples:
        **DJI Agriculture
        **XAG
        **TopXGun
    """

    return line.strip().startswith("**")


def section_name(line: str) -> str:
    """
    Extract a heading without '*' markers.
    """

    return normalize_text(
        line.strip().lstrip("*").strip()
    )


def mapped_section(line: str) -> str | None:
    """
    Map a main section heading to the canonical ecosystem section.
    """

    return SECTION_MAP.get(
        section_name(line)
    )


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def looks_like_role_or_person(line: str) -> bool:
    """
    Detect internal personnel records.
    """

    s = clean_source_line(line).lower()

    return s.startswith(ROLE_PREFIXES)


def looks_like_structural_heading(line: str) -> bool:
    """
    Detect internal structural headings.
    """

    s = clean_source_line(line).lower()

    return s in STRUCTURAL_HEADINGS


def looks_like_contact_record(line: str) -> bool:
    """
    Detect lines that are clearly personnel/contact records.
    """

    s = clean_source_line(line)
    low = s.lower()

    if looks_like_role_or_person(s):
        return True

    role_patterns = [
        r"\bpresidente\b",
        r"\bvicepresidente\b",
        r"\bsecretari[oa]\b",
        r"\btesorer[oa]\b",
        r"\bdirector(?:a)?\b",
        r"\bsubdirector(?:a)?\b",
        r"\bgerent[ea]\b",
        r"\bresponsable\b",
        r"\bcoordinador(?:a)?\b",
        r"\basesor(?:a)?\b",
        r"\bmiembro de equipo\b",
    ]

    return any(
        re.search(pattern, low)
        for pattern in role_patterns
    )


def looks_like_dealer_context(line: str) -> bool:
    """
    Detect an explicit Dealers context heading.
    """

    return clean_source_line(line).lower() == "dealers"


def is_url_only(line: str) -> bool:
    """
    URLs alone are not ecosystem entities.
    """

    s = clean_source_line(line)

    return (
        s.startswith("http://")
        or s.startswith("https://")
    )


# ---------------------------------------------------------------------------
# YAML helpers
# ---------------------------------------------------------------------------

def yaml_quote(value: object) -> str:
    """
    Quote a YAML scalar safely.
    """

    value = str(value)

    value = value.replace(
        "\\",
        "\\\\",
    )

    value = value.replace(
        '"',
        '\\"',
    )

    return f'"{value}"'


def emit(node: dict) -> str:
    """
    Emit one canonical ecosystem node as YAML.
    """

    lines = [
        f'id: {yaml_quote(node["id"])}',
        f'name: {yaml_quote(node["name"])}',
        f'type: {node["type"]}',
        "",
        "identity:",
        f'  status: {node["identity"]["status"]}',
        "",
        "layers:",
    ]

    for layer in node["layers"]:
        lines.append(f"  - {layer}")

    lines += [
        "",
        "capabilities:",
    ]

    if node["capabilities"]:
        for capability in node["capabilities"]:
            lines.append(f"  - {capability}")
    else:
        lines.append("  []")

    # -------------------------------------------------------------------
    # Contact
    # -------------------------------------------------------------------

    contact = node["contact"]

    lines += [
        "",
        "contact:",
        (
            f'  address: {yaml_quote(contact["address"])}'
            if contact["address"]
            else "  address: null"
        ),
        (
            f'  city: {yaml_quote(contact["city"])}'
            if contact["city"]
            else "  city: null"
        ),
        (
            f'  province: {yaml_quote(contact["province"])}'
            if contact["province"]
            else "  province: null"
        ),
        (
            f'  country: {yaml_quote(contact["country"])}'
            if contact["country"]
            else "  country: null"
        ),
        (
            f'  phone: {yaml_quote(contact["phone"])}'
            if contact["phone"]
            else "  phone: null"
        ),
        (
            f'  whatsapp: {yaml_quote(contact["whatsapp"])}'
            if contact["whatsapp"]
            else "  whatsapp: null"
        ),
        (
            f'  email: {yaml_quote(contact["email"])}'
            if contact["email"]
            else "  email: null"
        ),
    ]

    # -------------------------------------------------------------------
    # Presence
    # -------------------------------------------------------------------

    presence = node["presence"]

    lines += [
        "",
        "presence:",
        (
            f'  website: {yaml_quote(presence["website"])}'
            if presence["website"]
            else "  website: null"
        ),
        (
            f'  websiteMentioned: '
            f'{str(presence["websiteMentioned"]).lower()}'
        ),
        (
            f'  websiteMentionsDrones: '
            f'{str(presence["websiteMentionsDrones"]).lower()}'
            if presence["websiteMentionsDrones"] is not None
            else "  websiteMentionsDrones: null"
        ),
        (
            f'  websiteUnavailable: '
            f'{str(presence["websiteUnavailable"]).lower()}'
        ),
    ]

    # -------------------------------------------------------------------
    # Geolocation
    # -------------------------------------------------------------------

    geolocation = node["geolocation"]

    lines += [
        "",
        "geolocation:",
        (
            f'  latitude: {geolocation["latitude"]}'
            if geolocation["latitude"] is not None
            else "  latitude: null"
        ),
        (
            f'  longitude: {geolocation["longitude"]}'
            if geolocation["longitude"] is not None
            else "  longitude: null"
        ),
        (
            f'  precision: {yaml_quote(geolocation["precision"])}'
            if geolocation["precision"] is not None
            else "  precision: null"
        ),
        f'  status: {yaml_quote(geolocation["status"])}',
    ]

    # -------------------------------------------------------------------
    # Provenance
    # -------------------------------------------------------------------

    lines += [
        "",
        "source:",
        f'  file: {yaml_quote("ecosystem-source.txt")}',
        f'  line: {node["sourceLine"]}',
        f'  section: {yaml_quote(node["sourceSection"])}',
        f'  raw: {yaml_quote(node["raw"])}',
    ]

    # -------------------------------------------------------------------
    # Verification
    # -------------------------------------------------------------------

    lines += [
        "",
        "status:",
        f'  verification: {node["verification"]}',
        "  imported: true",
        "  reviewRequired: true",
    ]

    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Node creation
# ---------------------------------------------------------------------------

def create_node(
    *,
    raw: str,
    lineno: int,
    section: str,
    occurrence: int,
    node_section: str | None = None,
) -> dict:
    """
    Normalize one source entity.

    `node_section` allows a dealer to receive the structural layer
    `dealers` while retaining the main ecosystem section as provenance.
    """

    normalization_section = (
        node_section
        if node_section is not None
        else section
    )

    node = normalize(
        raw=raw,
        source_line=lineno,
        source_section=normalization_section,
        occurrence=occurrence,
    )

    # Dealers belong to the drones ecosystem as well as the dealer layer.
    if node_section == "dealers":
        node["layers"] = [
            "drones",
            "dealers",
        ]

        # Keep the original main section as provenance.
        node["sourceSection"] = section

    return node


# ---------------------------------------------------------------------------
# Main import
# ---------------------------------------------------------------------------

def main() -> None:

    OUT.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORT.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if not SOURCE.exists():
        raise FileNotFoundError(
            f"Source file not found: {SOURCE}"
        )

    raw_text = SOURCE.read_text(
        encoding="utf-8",
        errors="strict",
    )

    lines = raw_text.splitlines()

    section = "unknown"
    subsection: str | None = None

    # Current structural entity.
    representative: dict | None = None

    # Whether we are currently inside an explicit Dealers block.
    dealer_context = False

    nodes: list[dict] = []

    # Deterministic IDs.
    seen: dict[str, int] = {}

    # Websites already encountered.
    seen_websites: dict[str, str] = {}

    website_matches = []

    # Relationship candidates.
    dealer_relationships = []

    ignored_internal = []
    ignored_structural = []
    ignored_headings = []

    for lineno, raw in enumerate(
        lines,
        start=1,
    ):

        if not raw.strip():
            continue

        level = indentation(raw)
        clean = clean_source_line(raw)

        # ---------------------------------------------------------------
        # Main section
        # ---------------------------------------------------------------

        if is_main_section(raw):
            heading = section_name(raw)

            mapped = mapped_section(raw)

            section = (
                mapped
                if mapped
                else "unknown"
            )

            subsection = None
            representative = None
            dealer_context = False

            continue

        # ---------------------------------------------------------------
        # Subsection / brand
        # ---------------------------------------------------------------

        if is_subsection(raw):
            subsection = section_name(raw)

            representative = None
            dealer_context = False

            continue

        # ---------------------------------------------------------------
        # Explicit Dealers context
        # ---------------------------------------------------------------

        if looks_like_dealer_context(clean):

            dealer_context = True

            continue

        # ---------------------------------------------------------------
        # Top-level entity
        # ---------------------------------------------------------------

        if level == 0:

            # A top-level structural heading is never a node.
            if looks_like_structural_heading(clean):
                ignored_structural.append({
                    "line": lineno,
                    "raw": clean,
                    "section": section,
                })

                representative = None
                dealer_context = False

                continue

            if is_url_only(clean):
                ignored_headings.append({
                    "line": lineno,
                    "raw": clean,
                    "section": section,
                })

                continue

            if looks_like_contact_record(clean):
                ignored_internal.append({
                    "line": lineno,
                    "raw": clean,
                    "section": section,
                })

                continue

            # -----------------------------------------------------------
            # Representative / ecosystem entity
            # -----------------------------------------------------------

            base_candidate = normalize(
                raw=clean,
                source_line=lineno,
                source_section=section,
                occurrence=1,
            )

            base_id = base_candidate["id"]

            occurrence = seen.get(
                base_id,
                0,
            ) + 1

            seen[base_id] = occurrence

            node = create_node(
                raw=clean,
                lineno=lineno,
                section=section,
                occurrence=occurrence,
            )

            nodes.append(node)

            representative = {
                "id": node["id"],
                "name": node["name"],
                "line": lineno,
                "section": section,
                "subsection": subsection,
            }

            website = node["presence"]["website"]

            if website:
                existing_id = seen_websites.get(website)

                if existing_id:
                    website_matches.append({
                        "line": lineno,
                        "website": website,
                        "existingId": existing_id,
                        "currentId": node["id"],
                    })
                else:
                    seen_websites[website] = node["id"]

            continue

        # ---------------------------------------------------------------
        # Indented content
        # ---------------------------------------------------------------

        if level > 0:

            # -----------------------------------------------------------
            # Dealer record
            # -----------------------------------------------------------

            if (
                dealer_context
                and representative is not None
                and level >= 2
            ):

                if looks_like_structural_heading(clean):
                    ignored_structural.append({
                        "line": lineno,
                        "raw": clean,
                        "section": section,
                    })

                    continue

                if looks_like_contact_record(clean):
                    ignored_internal.append({
                        "line": lineno,
                        "raw": clean,
                        "section": section,
                    })

                    continue

                if is_url_only(clean):
                    ignored_headings.append({
                        "line": lineno,
                        "raw": clean,
                        "section": section,
                    })

                    continue

                # -------------------------------------------------------
                # Normalize dealer
                # -------------------------------------------------------

                candidate = normalize(
                    raw=clean,
                    source_line=lineno,
                    source_section="dealers",
                    occurrence=1,
                )

                base_id = candidate["id"]

                occurrence = seen.get(
                    base_id,
                    0,
                ) + 1

                seen[base_id] = occurrence

                dealer = create_node(
                    raw=clean,
                    lineno=lineno,
                    section=section,
                    occurrence=occurrence,
                    node_section="dealers",
                )

                nodes.append(dealer)

                # -------------------------------------------------------
                # Preserve future relationship information.
                # -------------------------------------------------------

                dealer_relationships.append({
                    "dealerId": dealer["id"],
                    "dealerName": dealer["name"],
                    "representativeId": representative["id"],
                    "representativeName": representative["name"],
                    "brand": subsection,
                    "sourceLine": lineno,
                    "section": section,
                })

                # -------------------------------------------------------
                # Website detection
                # -------------------------------------------------------

                website = dealer["presence"]["website"]

                if website:
                    existing_id = seen_websites.get(website)

                    if existing_id:
                        website_matches.append({
                            "line": lineno,
                            "website": website,
                            "existingId": existing_id,
                            "currentId": dealer["id"],
                        })
                    else:
                        seen_websites[website] = dealer["id"]

                continue

            # -----------------------------------------------------------
            # Other indented content
            # -----------------------------------------------------------

            if looks_like_structural_heading(clean):
                ignored_structural.append({
                    "line": lineno,
                    "raw": clean,
                    "section": section,
                })

                continue

            if looks_like_contact_record(clean):
                ignored_internal.append({
                    "line": lineno,
                    "raw": clean,
                    "section": section,
                })

                continue

            ignored_internal.append({
                "line": lineno,
                "raw": clean,
                "section": section,
            })

    # -------------------------------------------------------------------
    # Write generated YAML nodes
    # -------------------------------------------------------------------

    for node in nodes:

        node_path = OUT / f'{node["id"]}.yml'

        node_path.write_text(
            emit(node),
            encoding="utf-8",
        )

    # -------------------------------------------------------------------
    # Report
    # -------------------------------------------------------------------

    report = {
        "source": "data/raw/ecosystem-source.txt",

        "nodesGenerated": len(nodes),

        "sections": sorted({
            node["sourceSection"]
            for node in nodes
        }),

        "reviewRequired": len(nodes),

        "duplicatesByNormalizedName": sorted(
            [
                key
                for key, value in seen.items()
                if value > 1
            ]
        ),

        "ignoredInternalRecords": len(
            ignored_internal
        ),

        "ignoredStructuralHeadings": len(
            ignored_structural
        ),

        "ignoredHeadings": len(
            ignored_headings
        ),

        "websiteMatches": website_matches,

        # ---------------------------------------------------------------
        # Structural relationships discovered from the source.
        #
        # These are NOT yet written to relationships.yml.
        # They are preserved as deterministic import evidence.
        # ---------------------------------------------------------------

        "dealerRelationships": dealer_relationships,

        "dealersGenerated": len(
            dealer_relationships
        ),
    }

    REPORT.write_text(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()