# Content Agent Base Spec (Canonical)

Canonical content agent base spec lives in:

- `docs/_canonical/shared/ai/content-agent-base.md`

After returning the JSON, call `mcp_buffer_create_post` for each draft with:
- `saveToDraft: true`
- `schedulingType: "automatic"`
- the exact `channelId` from the output above.

Do not add `dueAt`. Do not set `mode`. Drafts only.

---

## 7. CHANNEL IDs (Buffer — Bricks Apps org)

| Platform  | Channel ID                   | Handle / Name       |
|-----------|------------------------------|---------------------|
| Twitter   | `69937941d6f8d304f91ecefb`   | @hellobricksapps    |
| LinkedIn  | `69937985d6f8d304f91ed0b4`   | Bricks Apps (page)  |
| Instagram | `699379cad6f8d304f91ed23e`   | @hellobricksapps    |
