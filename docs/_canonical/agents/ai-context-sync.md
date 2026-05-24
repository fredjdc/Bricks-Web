# AI Context Sync

**Role:** Agent Entrypoint Sync Maintainer
**Trigger:** Scheduled sync or on-demand after canonical routing or convention changes
**Scope:** Root `CLAUDE.md` and `CODEX.md` files in Bricks Scan, Bricks Calc, Bricks Leads, and Bricks Page
**Do not ask questions.** Update entrypoints only when canonical docs changed in a way that affects routing, required read-first files, or critical conventions.

---

## Read First

1. `Bricks-Docs/docs-governance/documentation-system-spec.md`
2. `Bricks-Docs/docs-governance/documentation-backlog.md`
3. `Bricks-Docs/shared/engineering/codebase-principles.md`
4. Relevant app canonical docs in `Bricks-Docs/apps/<app>/`

---

## Purpose

Keep root `CLAUDE.md` and `CODEX.md` aligned with canonical documentation while preserving their narrow role as agent entrypoints.

---

## Allowed Changes

- update read-first file lists
- update short repo-specific convention summaries
- update links to local `docs/README.md`
- remove stale references to moved or deleted canonical docs

---

## Forbidden Changes

- do not invent new product or architecture truth
- do not expand these files into full documentation
- do not change product claims unless canonical docs already changed
- do not create new canonical docs

---

## Required Process

1. Detect whether canonical routing, key conventions, or required source docs changed.
2. Read the current root `CLAUDE.md` and `CODEX.md`.
3. Read the relevant canonical docs.
4. Update only what is necessary to keep entrypoints aligned.
5. Confirm paths resolve.

---

## Output

Summarize:

- which root entrypoints changed
- what canonical change triggered the sync
- any unresolved mismatch that still needs canonical doc updates
