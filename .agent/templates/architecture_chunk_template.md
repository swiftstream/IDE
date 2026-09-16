# Architecture Chunk Template

Use only when a genuinely independent Swift Stream IDE architecture owner is needed. Omit sections that would be empty.

```markdown
# [Chunk Name]

Authoritative owner for `[ID-FAMILY]-*` and [single focused concept].

## Scope

[What this chunk owns; route adjacent concerns to their existing owners.]

## Primary Source

[Smallest authoritative source/config roots used to verify current behavior.]

## Verified Current Facts

[Only non-obvious current implementation facts that materially help future work.]

## Stable Boundary Rules

### `[ID-FAMILY]-001` — [Short rule title]

[Clear enforceable current invariant/boundary.]

## Validation Notes

[Only validation requirements specific to this architecture owner. General validation belongs in `TESTING_RULES.md` / `WORKFLOW.md`.]

## Open Decisions

[Only unresolved choices that belong to this concept, usually by `DEC-*` reference; omit when none.]

## Related Owners

[Only direct neighboring owners needed for routing; link instead of duplicating their rules.]
```

Rules:

- Every architecture ID has exactly one owner.
- Move IDs when splitting/reassigning ownership; never duplicate them in two chunks.
- Do not create a new chunk merely because a new directory/file appeared or a future concept might exist.
- Create a chunk only when a distinct durable architecture boundary has enough independent rules/routing value.
- Keep implementation history, task logs, transient environment/tool bindings, and speculative field catalogs out of architecture chunks.
