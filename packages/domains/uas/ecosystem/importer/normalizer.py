"""
DRONSAIR ecosystem normalizer.

Responsibility:
    Transform a parsed raw ecosystem record into the canonical node shape.

Design principles:
    - preserve source wording;
    - normalize only what can be normalized safely;
    - never invent missing data;
    - preserve provenance;
    - keep ambiguity visible;
    - produce deterministic IDs.

This module does not:
    - read files;
    - write files;
    - validate nodes;
    - merge entities;
    - decide semantic identity;
    - geocode locations.
"""

from __future__ import annotations

import re
import unicodedata


# ---------------------------------------------------------------------------
# Basic normalization
# ---------------------------------------------------------------------------

def normalize_text(value: str) -> str:
    """
    Repair common UTF-8 / Latin-1 mojibake conservatively.
    """
    if "Ã" in value or "Â" in value or "â" in value:
        try:
            repaired = value.encode("latin1").decode("utf-8")
            return repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass

    return value


def slug(value: str) -> str:
    """
    Generate a deterministic structural identifier from a name.
    """
    value = normalize_text(value)
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")

    value = re.sub(
        r"[^a-zA-Z0-9]+",
        "-",
        value.lower(),
    ).strip("-")

    return value or "unknown"


# ---------------------------------------------------------------------------
# Source parsing helpers
# ---------------------------------------------------------------------------

def clean_url(url: str) -> str:
    """Remove punctuation accidentally captured at the end of a URL."""
    return url.rstrip(".,;:)]}")


def extract_urls(text: str) -> list[str]:
    """Extract explicit URLs without interpreting their meaning."""
    matches = re.findall(
        r"https?://[^\s,)\]}]+",
        text,
    )

    return [
        clean_url(url)
        for url in matches
    ]


def extract_email(text: str) -> str | None:
    """Extract the first explicit email address."""
    match = re.search(
        r"[A-Za-z0-9._%+-]+"
        r"@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text,
    )

    if not match:
        return None

    return match.group(0).lower()


# ---------------------------------------------------------------------------
# Phone normalization
# ---------------------------------------------------------------------------

def _digits_only(value: str) -> str:
    """Keep digits only."""
    return re.sub(r"\D", "", value)


def normalize_phone(value: str) -> str | None:
    """
    Normalize Argentine telephone numbers.

    Canonical output:
        CABA:
            +54 11 xxxxxxxx

        Other Argentine areas:
            +54 xxx xxxxxxx

    Missing/ambiguous numbers are preserved only when they can be safely
    interpreted as an Argentine telephone number.
    """
    digits = _digits_only(value)

    if not digits:
        return None

    # Remove international prefix.
    if digits.startswith("0054"):
        digits = digits[4:]

    elif digits.startswith("54"):
        digits = digits[2:]

    # Buenos Aires / CABA.
    if digits.startswith("11"):
        subscriber = digits[2:]

        if len(subscriber) == 8:
            return f"+54 11 {subscriber}"

        return None

    # Argentine regional numbers generally use 3-digit area codes
    # followed by 7-digit subscriber numbers in the source corpus.
    if len(digits) == 10:
        area = digits[:3]
        subscriber = digits[3:]

        return f"+54 {area} {subscriber}"

    # Some source records may contain a four-digit area code.
    if len(digits) == 11:
        area = digits[:4]
        subscriber = digits[4:]

        if len(subscriber) == 7:
            return f"+54 {area} {subscriber}"

    return None


def extract_phone_candidates(text: str) -> list[str]:
    """
    Extract plausible Argentine phone-number candidates.

    We deliberately avoid interpreting arbitrary numbers as phones.
    """
    pattern = (
        r"(?<!\d)"
        r"(?:\+54[\s-]*)?"
        r"(?:\(?\d{2,4}\)?[\s-]*)?"
        r"\d{3,4}[\s-]*\d{4}"
        r"(?!\d)"
    )

    matches = re.findall(pattern, text)

    return [
        match.strip()
        for match in matches
        if normalize_phone(match)
    ]


def extract_phone(text: str) -> str | None:
    """
    Extract and normalize the first plausible phone number.
    """
    candidates = extract_phone_candidates(text)

    if not candidates:
        return None

    return normalize_phone(candidates[0])


# ---------------------------------------------------------------------------
# WhatsApp
# ---------------------------------------------------------------------------

def extract_whatsapp(text: str) -> str | None:
    """
    Extract a WhatsApp number only when the source explicitly identifies it
    as WhatsApp.

    We do not infer WhatsApp from the existence of a phone number.
    """
    pattern = (
        r"(?:whatsapp|wsp|w\.a\.?)"
        r"\s*(?:[:\-]|\s)\s*"
        r"((?:\+54[\s-]*)?"
        r"(?:\(?\d{2,4}\)?[\s-]*)?"
        r"\d{3,4}[\s-]*\d{4})"
    )

    match = re.search(
        pattern,
        normalize_text(text),
        flags=re.IGNORECASE,
    )

    if not match:
        return None

    return normalize_phone(match.group(1))


# ---------------------------------------------------------------------------
# Name
# ---------------------------------------------------------------------------

def first_name(line: str) -> str:
    """
    Extract the probable organization/entity name.

    The complete original source line remains preserved as `raw`.
    """
    value = normalize_text(line.strip())

    value = re.sub(
        r"^[•*\-]\s*",
        "",
        value,
    )

    parts = re.split(
        r"\s+-\s+",
        value,
        maxsplit=1,
    )

    return parts[0].strip()


def source_details(line: str) -> str:
    """
    Return the part of the source line after the entity name.

    Example:
        Kampu - Av. Perón 2300 Yerba Buena, Tucumán - +54 ...

    returns:
        Av. Perón 2300 Yerba Buena, Tucumán - +54 ...
    """
    value = normalize_text(line.strip())

    parts = re.split(
        r"\s+-\s+",
        value,
        maxsplit=1,
    )

    if len(parts) == 1:
        return ""

    return parts[1].strip()


# ---------------------------------------------------------------------------
# Entity type
# ---------------------------------------------------------------------------

def infer_type(section: str) -> str:
    """
    Map an ecosystem section to a broad entity type.

    This remains intentionally structural.
    It is not semantic identity resolution.
    """
    return {
        "drones": "company",
        "operators": "company",
        "dealers": "company",
        "technology": "company",
        "media": "media",
        "academia": "institution",
        "public": "organization",
        "events": "event",
        "insurance": "company",
        "suppliers": "company",
    }.get(
        section,
        "organization",
    )


# ---------------------------------------------------------------------------
# Presence
# ---------------------------------------------------------------------------

def infer_presence(text: str) -> dict:
    """
    Preserve observable digital presence evidence.

    Absence of a URL is never interpreted as absence of an entity.
    """
    low = normalize_text(text).lower()
    found_urls = extract_urls(text)

    return {
        "website": found_urls[0] if found_urls else None,

        "websiteMentioned": bool(found_urls),

        "websiteMentionsDrones": (
            None
            if not found_urls
            else not bool(
                re.search(
                    r"(sin drones|faltan los drones|web sin drones|no hay drones)",
                    low,
                )
            )
        ),

        "websiteUnavailable": bool(
            re.search(
                r"(sin web|sin web!!!|no funciona|web no funciona|https no activado)",
                low,
            )
        ),
    }


# ---------------------------------------------------------------------------
# Location
# ---------------------------------------------------------------------------

ARGENTINA_PROVINCES = {
    "Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán",
}


def _remove_contact_data(text: str) -> str:
    """
    Remove URLs, emails, phones and WhatsApp labels before attempting
    location extraction.
    """
    value = normalize_text(text)

    for url in extract_urls(value):
        value = value.replace(url, "")

    email = extract_email(value)

    if email:
        value = value.replace(email, "")

    for phone in extract_phone_candidates(value):
        value = value.replace(phone, "")

    value = re.sub(
        r"\b(?:whatsapp|wsp|w\.a\.?)\b\s*(?::|-)?",
        "",
        value,
        flags=re.IGNORECASE,
    )

    return re.sub(
        r"\s+",
        " ",
        value,
    ).strip(" -–—")


def extract_location(text: str) -> dict:
    """
    Extract explicit geographic information.

    This function does not geocode.

    Coordinates therefore remain null until a later controlled
    geolocation step.
    """
    value = _remove_contact_data(text)

    address = None
    city = None
    province = None
    country = None

    # ---------------------------------------------------------------
    # Explicit:
    #     address, city, Argentina
    # ---------------------------------------------------------------

    match = re.search(
        r"(.+?)\s*,\s*"
        r"([^,]+?)\s*,\s*"
        r"Argentina\b",
        value,
        flags=re.IGNORECASE,
    )

    if match:
        address_candidate = match.group(1).strip(" -–—")
        city_candidate = match.group(2).strip(" -–—")

        if address_candidate:
            address = address_candidate

        if city_candidate:
            city = city_candidate

        country = "Argentina"

    # ---------------------------------------------------------------
    # Explicit:
    #     address, city, Province
    # ---------------------------------------------------------------

    if province is None:
        province_pattern = "|".join(
            re.escape(province_name)
            for province_name in sorted(
                ARGENTINA_PROVINCES,
                key=len,
                reverse=True,
            )
        )

        match = re.search(
            rf"(.+?)\s*,\s*"
            rf"([^,]+?)\s*,\s*"
            rf"({province_pattern})\b",
            value,
            flags=re.IGNORECASE,
        )

        if match:
            address_candidate = match.group(1).strip(" -–—")
            city_candidate = match.group(2).strip(" -–—")

            address = address_candidate or None
            city = city_candidate or None
            province = match.group(3).strip()
            country = "Argentina"

    # ---------------------------------------------------------------
    # Explicit:
    #     address/city, Province
    # ---------------------------------------------------------------

    if province is None:
        province_pattern = "|".join(
            re.escape(province_name)
            for province_name in sorted(
                ARGENTINA_PROVINCES,
                key=len,
                reverse=True,
            )
        )

        match = re.search(
            rf"(.+?)\s*,\s*"
            rf"({province_pattern})\b",
            value,
            flags=re.IGNORECASE,
        )

        if match:
            before = match.group(1).strip(" -–—")

            province = match.group(2).strip()
            country = "Argentina"

            # Keep ambiguous pre-province text as address.
            if before:
                address = before

    # ---------------------------------------------------------------
    # Explicit province without comma
    # ---------------------------------------------------------------

    if province is None:
        province_pattern = "|".join(
            re.escape(province_name)
            for province_name in sorted(
                ARGENTINA_PROVINCES,
                key=len,
                reverse=True,
            )
        )

        match = re.search(
            rf"\b({province_pattern})\b",
            value,
            flags=re.IGNORECASE,
        )

        if match:
            province = match.group(1).strip()
            country = "Argentina"

    # ---------------------------------------------------------------
    # Argentina explicitly mentioned
    # ---------------------------------------------------------------

    if country is None:
        if re.search(
            r"\bArgentina\b",
            value,
            flags=re.IGNORECASE,
        ):
            country = "Argentina"

    return {
        "address": address,
        "city": city,
        "province": province,
        "country": country,
    }


# ---------------------------------------------------------------------------
# Canonical normalization
# ---------------------------------------------------------------------------

def normalize(
    *,
    raw: str,
    source_line: int,
    source_section: str,
    occurrence: int = 1,
) -> dict:
    """
    Normalize one raw ecosystem record.

    `occurrence` only disambiguates identical structural IDs.
    It does not imply semantic identity.
    """
    clean_raw = normalize_text(raw.strip())

    name = first_name(clean_raw)
    details = source_details(clean_raw)

    base_id = slug(name)

    node_id = (
        base_id
        if occurrence == 1
        else f"{base_id}-{occurrence}"
    )

    presence = infer_presence(clean_raw)

    # Location is extracted from the entity's details, not from the
    # complete source line, so the entity name cannot contaminate
    # the address.
    location = extract_location(details)

    phone = extract_phone(details)
    whatsapp = extract_whatsapp(details)
    email = extract_email(details)

    return {
        "id": node_id,

        "name": name,

        "type": infer_type(source_section),

        "identity": {
            "status": "active",
        },

        "layers": [
            source_section,
        ],

        "capabilities": [],

        "contact": {
            "address": location["address"],
            "city": location["city"],
            "province": location["province"],
            "country": location["country"],
            "phone": phone,
            "whatsapp": whatsapp,
            "email": email,
        },

        "presence": presence,

        "geolocation": {
            "latitude": None,
            "longitude": None,
            "precision": None,
            "status": "pending",
        },

        "sourceLine": source_line,

        "sourceSection": source_section,

        "raw": clean_raw,

        "verification": "partial",
    }