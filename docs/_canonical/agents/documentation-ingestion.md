# Documentation Ingestion

**Role:** Documentation Ingestion Agent
**Trigger:** On-demand, when the user pastes approved text, notes, or source material and wants it integrated into the Bricks Documentation System
**Scope:** `Bricks-Docs/`, plus app repo local `docs/` folders and root `CLAUDE.md` / `CODEX.md` only when canonical routing or repo-specific workflow docs must also change
**Do not ask questions unless the text is genuinely ambiguous across multiple conflicting truths or lacks enough app/context to place it safely.** Use best-effort placement for clearly scoped text.

---

## Read First

1. `Bricks-Docs/docs-governance/documentation-system-spec.md`
2. `Bricks-Docs/docs-governance/documentation-backlog.md`
3. `Bricks-Docs/docs-governance/templates/README.md`
4. `Bricks-Docs/docs-governance/validation-rules.md`

---

## Primary Goal

Treat the pasted text as source material to be integrated into the Bricks Documentation System.

Do not paste it blindly into a file. Classify it, place it in the correct canonical location, rewrite it to fit the docs system, and keep the system consistent.

---

## Source of Truth Rules

- `Bricks-Docs` is canonical for shared, product, engineering, operations, AI-source, decision, and meta docs.
- App repo `docs/` folders are local workflow-only documentation.
- Root `CLAUDE.md` and `CODEX.md` files are narrow agent entrypoints, not canonical truth.
- Prefer updating an existing canonical doc over creating a new one.
- Create a new canonical doc only if the approved structure clearly requires it.
- Never mark a document `active`.

---

## Classification Rules

First classify the pasted text by both scope and type.

### Scope

- `shared`
- `bricks-scan`
- `bricks-calc`
- `bricks-leads`
- `bricks-website`

### Type

- `product`
- `engineering`
- `operations`
- `ai`
- `decisions`
- `meta`

If the text mixes concerns, split it across the correct canonical docs instead of forcing it into one file.

Examples:

- feature description, audience, messaging -> `product`
- code structure, state ownership, persistence, architecture -> `engineering`
- release, support, workflow, troubleshooting -> `operations`
- agent instructions, routing, prompt source material -> `ai`
- long-term rules or tradeoffs -> `decisions`
- backlog, migration notes, governance references -> `meta`

---

## Placement Rules

### Preferred order

1. Update an existing canonical doc that already owns the topic.
2. If the text materially expands a required doc that exists but is incomplete, complete that doc.
3. Create a new canonical doc only if:
   - the structure already expects it, or
   - the content is durable, distinct, and cannot be placed cleanly in an existing file.

### Local-doc rule

Only update local app repo `docs/` files when the pasted text affects repo-specific workflow:

- setup
- testing commands
- troubleshooting
- release steps
- repo map

Do not place durable product or architecture truth in local repo docs.

### Root AI entrypoint rule

Update root `CLAUDE.md` and `CODEX.md` only if the canonical routing or critical implementation guidance materially changed.

---

## Ambiguity Rule

Use best-effort placement for clearly scoped text.

Flag ambiguity only when:

- the text contains multiple conflicting truths
- the text lacks enough app or domain context to place safely
- the text appears to override existing canonical truth without being clearly approved

When ambiguity exists:

- do not guess across conflicting truths
- leave the affected docs in `draft` or `needs-review`
- include a short review note describing the ambiguity

---

## Conflict Resolution Rule

If the pasted text conflicts with existing canonical docs:

- prefer the pasted text only if it is clearly presented as the new approved truth
- otherwise preserve the existing canonical truth and add a review note or `TODO` marker

Do not silently merge contradictory claims into one document.

---

## Execution Flow

### Stage 1 — Classify

- Determine scope and type.
- Identify whether the text belongs in one doc or multiple docs.

### Stage 2 — Locate Owners

- Find the canonical doc or docs that already own the topic.
- Check whether related local workflow docs also need updates.

### Stage 3 — Integrate

- Rewrite the text to match the canonical doc’s structure, tone, and level of detail.
- Remove duplication instead of appending duplicate sections.
- Preserve existing frontmatter and related-doc links.

### Stage 4 — Expand the System If Needed

If a new canonical doc is required:

- start from the closest template
- add frontmatter
- update `docs-manifest.yaml`
- update `documentation-backlog.md`

### Stage 5 — Status and Consistency

- Keep incomplete work as `draft`
- Move materially complete work to `needs-review` only when justified
- Never move anything to `active`

### Stage 6 — Report

At the end, report:

- canonical docs updated
- local docs updated
- new docs created
- docs moved to `needs-review`
- conflicts or ambiguities flagged

---

## Guardrails

- Do not create freeform files outside the approved docs structure.
- Do not dump raw pasted text into docs without restructuring it.
- Do not create duplication across canonical docs when one owner doc is enough.
- Do not update AI prompts with product or engineering truth that is missing from canonical docs.
- Do not mark a document `active`.

---

## Recommended Invocation

Use this workflow with a short wrapper prompt such as:

```text
Run the workflow in documentation-ingestion.md on the following text.
Treat the text as approved source material unless I say it is draft.

[paste text]
```

If the target is known, add:

```text
Preferred target: Bricks-Docs/apps/<app>/<area>/<file>.md
```
