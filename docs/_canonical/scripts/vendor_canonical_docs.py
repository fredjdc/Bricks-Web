#!/usr/bin/env python3

from __future__ import annotations

import argparse
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path


CANONICAL_ROOT = Path(__file__).resolve().parents[1]  # Bricks-Docs/
WORKSPACE_ROOT = CANONICAL_ROOT.parent  # /Users/.../Github (not a git repo)


@dataclass(frozen=True)
class VendorTarget:
    repo_name: str


TARGETS: dict[str, VendorTarget] = {
    "bricks-calc": VendorTarget(repo_name="Bricks-Calc"),
    "bricks-web": VendorTarget(repo_name="Bricks-Web"),
}


def copy_tree(src: Path, dst: Path) -> None:
    if not src.exists():
        return
    if src.is_file():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        return
    shutil.copytree(src, dst, dirs_exist_ok=True)


def clear_dir(path: Path) -> None:
    if not path.exists():
        return
    for child in path.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def vendor_into_repo(target: VendorTarget, *, clean: bool) -> Path:
    repo_root = WORKSPACE_ROOT / target.repo_name
    if not repo_root.exists():
        raise SystemExit(f"Target repo not found: {repo_root}")

    vendor_root = repo_root / "docs" / "_canonical"
    vendor_root.mkdir(parents=True, exist_ok=True)

    if clean:
        clear_dir(vendor_root)

    # Copy canonical docs into the vendored folder. Keep the internal layout stable.
    #
    # We vendor the full docs surface (including agent prompts and governance) so that
    # canonical cross-links remain valid when a repo is cloned on its own.
    # We do not copy .git or GitHub workflows.
    copy_tree(CANONICAL_ROOT / "README.md", vendor_root / "README.md")
    copy_tree(CANONICAL_ROOT / "agents", vendor_root / "agents")
    copy_tree(CANONICAL_ROOT / "archive", vendor_root / "archive")
    copy_tree(CANONICAL_ROOT / "shared", vendor_root / "shared")
    copy_tree(CANONICAL_ROOT / "docs-governance", vendor_root / "docs-governance")
    copy_tree(CANONICAL_ROOT / "manifest", vendor_root / "manifest")
    copy_tree(CANONICAL_ROOT / "apps", vendor_root / "apps")
    copy_tree(CANONICAL_ROOT / "scripts", vendor_root / "scripts")

    return vendor_root


def rewrite_adapters_in_repo(repo_root: Path) -> None:
    docs_dir = repo_root / "docs"
    if not docs_dir.exists():
        return

    # Rewrite common adapter text to point to the vendored docs copy.
    # We keep this intentionally conservative: only rewrite literal "Bricks-Docs/..." code-path mentions
    # in repo-local docs, not arbitrary prose.
    replacements = {
        "Bricks-Docs/apps/bricks-calc/product/app-store-copy.md": "docs/_canonical/apps/bricks-calc/product/app-store-copy.md",
        "Bricks-Docs/apps/bricks-calc/product/screenshot-copy.md": "docs/_canonical/apps/bricks-calc/product/screenshot-copy.md",
        "Bricks-Docs/shared/brand/brand-voice-guide.md": "docs/_canonical/shared/brand/brand-voice-guide.md",
        "Bricks-Docs/shared/brand/brand-foundation.md": "docs/_canonical/shared/brand/brand-foundation.md",
        "Bricks-Docs/shared/brand/brand-system.md": "docs/_canonical/shared/brand/brand-system.md",
        "Bricks-Docs/shared/brand/design-system.md": "docs/_canonical/shared/brand/design-system.md",
        "Bricks-Docs/shared/brand/tokens.json": "docs/_canonical/shared/brand/tokens.json",
        "Bricks-Docs/shared/brand/social-media-playbook.md": "docs/_canonical/shared/brand/social-media-playbook.md",
        "Bricks-Docs/shared/ai/content-agent-base.md": "docs/_canonical/shared/ai/content-agent-base.md",
        "Bricks-Docs/apps/bricks-calc/ai/content-agent-spec.md": "docs/_canonical/apps/bricks-calc/ai/content-agent-spec.md",
        "Bricks-Docs/apps/bricks-scan/ai/content-agent-spec.md": "docs/_canonical/apps/bricks-scan/ai/content-agent-spec.md",
        "Bricks-Docs/apps/bricks-leads/ai/content-agent-spec.md": "docs/_canonical/apps/bricks-leads/ai/content-agent-spec.md",
        "Bricks-Docs/apps/bricks-calc/product/aso-strategy-en.md": "docs/_canonical/apps/bricks-calc/product/aso-strategy-en.md",
        "Bricks-Docs/apps/bricks-calc/product/aso-strategy-es.md": "docs/_canonical/apps/bricks-calc/product/aso-strategy-es.md",
        "Bricks-Docs/apps/bricks-calc/product/conversion-messaging-system.md": "docs/_canonical/apps/bricks-calc/product/conversion-messaging-system.md",
        "Bricks-Docs/apps/bricks-calc/product/keyword-tracking.md": "docs/_canonical/apps/bricks-calc/product/keyword-tracking.md",
        "Bricks-Docs/apps/bricks-calc/product/executive-aso-report.md": "docs/_canonical/apps/bricks-calc/product/executive-aso-report.md",
        "Bricks-Docs/apps/bricks-calc/product/cpp-refinance-en.md": "docs/_canonical/apps/bricks-calc/product/cpp-refinance-en.md",
        "Bricks-Docs/apps/bricks-calc/product/cpp-refinance-es.md": "docs/_canonical/apps/bricks-calc/product/cpp-refinance-es.md",
        "Bricks-Docs/apps/bricks-scan/product/aso-strategy-en.md": "docs/_canonical/apps/bricks-scan/product/aso-strategy-en.md",
    }

    for md_path in sorted(docs_dir.rglob("*.md")):
        try:
            raw = md_path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue

        updated = raw
        for old, new in replacements.items():
            updated = updated.replace(old, new)

        if updated != raw:
            md_path.write_text(updated, encoding="utf-8")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Vendor Bricks-Docs canonical docs into sibling repos under docs/_canonical/."
    )
    parser.add_argument(
        "--target",
        action="append",
        choices=sorted(TARGETS.keys()),
        help="Which repo(s) to vendor into. Repeatable. Defaults to all.",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Clear docs/_canonical before copying (recommended).",
    )
    parser.add_argument(
        "--rewrite-adapters",
        action="store_true",
        help="Rewrite repo-local adapter docs to point to docs/_canonical paths.",
    )
    args = parser.parse_args(argv)

    keys = args.target or list(TARGETS.keys())
    for key in keys:
        target = TARGETS[key]
        vendor_root = vendor_into_repo(target, clean=args.clean)
        if args.rewrite_adapters:
            rewrite_adapters_in_repo(WORKSPACE_ROOT / target.repo_name)
        print(f"Vendored Bricks-Docs into: {vendor_root}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
