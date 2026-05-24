#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "manifest" / "docs-manifest.yaml"
REQUIRED_FRONTMATTER_FIELDS = {
    "title",
    "doc_id",
    "doc_type",
    "role",
    "app_scope",
    "owner",
    "status",
    "last_reviewed",
    "review_cycle",
}
MANAGED_DIRS = [
    ROOT / "apps",
    ROOT / "shared",
    ROOT / "docs-governance",
]
MANAGED_FILES = [
    ROOT / "README.md",
    ROOT / "archive" / "README.md",
    ROOT / "archive" / "legacy" / "README.md",
]
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


def load_manifest() -> list[dict[str, str]]:
    if not MANIFEST_PATH.exists():
        raise SystemExit(f"Missing manifest: {MANIFEST_PATH}")

    documents: list[dict[str, str]] = []
    current: dict[str, str] | None = None

    for raw_line in MANIFEST_PATH.read_text().splitlines():
        line = raw_line.rstrip()
        if line.startswith("  - "):
            if current:
                documents.append(current)
            current = {}
            key, value = line[4:].split(":", 1)
            current[key.strip()] = value.strip()
            continue

        if current and line.startswith("    ") and ":" in line:
            key, value = line.strip().split(":", 1)
            current[key.strip()] = value.strip()

    if current:
        documents.append(current)

    return documents


def parse_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(errors="ignore")
    if not text.startswith("---\n"):
        return {}

    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return {}

    frontmatter: dict[str, str] = {}
    for line in parts[0].splitlines()[1:]:
        if not line or line.startswith("  - "):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = value.strip()
    return frontmatter


def iter_managed_markdown_files() -> list[Path]:
    files: list[Path] = []
    for directory in MANAGED_DIRS:
        files.extend(p for p in directory.rglob("*.md") if p.is_file())
    files.extend(path for path in MANAGED_FILES if path.exists())
    return sorted(set(files))


def validate_manifest(manifest_docs: list[dict[str, str]]) -> list[str]:
    errors: list[str] = []
    seen_doc_ids: dict[str, str] = {}

    for entry in manifest_docs:
        path_value = entry.get("path", "")
        if not path_value:
            errors.append("Manifest entry missing path")
            continue

        target = ROOT / path_value
        if not target.exists():
            errors.append(f"Manifest path does not exist: {path_value}")

        doc_id = entry.get("doc_id", "")
        if doc_id:
            if doc_id in seen_doc_ids:
                errors.append(
                    f"Duplicate manifest doc_id '{doc_id}' in {path_value} and {seen_doc_ids[doc_id]}"
                )
            else:
                seen_doc_ids[doc_id] = path_value

    return errors


def validate_frontmatter(manifest_docs: list[dict[str, str]]) -> list[str]:
    errors: list[str] = []
    manifest_by_path = {entry["path"]: entry for entry in manifest_docs if entry.get("path")}

    for path in iter_managed_markdown_files():
        rel_path = str(path.relative_to(ROOT))
        frontmatter = parse_frontmatter(path)

        if not frontmatter:
            errors.append(f"Missing frontmatter: {rel_path}")
            continue

        missing_fields = REQUIRED_FRONTMATTER_FIELDS - set(frontmatter)
        if missing_fields:
            errors.append(
                f"Missing required frontmatter fields in {rel_path}: {', '.join(sorted(missing_fields))}"
            )

        manifest_entry = manifest_by_path.get(rel_path)
        if not manifest_entry:
            errors.append(f"Managed markdown file missing from manifest: {rel_path}")
            continue

        for field in ("title", "doc_id", "doc_type", "role", "app_scope", "owner", "status"):
            manifest_value = manifest_entry.get(field, "")
            fm_value = frontmatter.get(field, "")
            if manifest_value and fm_value and manifest_value != fm_value:
                errors.append(
                    f"Manifest/frontmatter mismatch in {rel_path} for {field}: '{manifest_value}' != '{fm_value}'"
                )

    return errors


def validate_relative_links() -> list[str]:
    errors: list[str] = []

    for path in iter_managed_markdown_files():
        text = path.read_text(errors="ignore")
        text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
        for target in MARKDOWN_LINK_RE.findall(text):
            if target.startswith("http://") or target.startswith("https://"):
                continue
            if target.startswith("/"):
                continue
            if target.startswith("#"):
                continue
            if target.startswith("mailto:"):
                continue

            link_target = target.split("#", 1)[0]
            if not link_target:
                continue

            resolved = (path.parent / link_target).resolve()
            if not resolved.exists():
                errors.append(
                    f"Broken relative link in {path.relative_to(ROOT)} -> {target}"
                )

    return errors


def main() -> int:
    manifest_docs = load_manifest()
    errors = []
    errors.extend(validate_manifest(manifest_docs))
    errors.extend(validate_frontmatter(manifest_docs))
    errors.extend(validate_relative_links())

    if errors:
        print("Documentation validation failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Documentation validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
