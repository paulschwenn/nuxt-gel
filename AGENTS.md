Here’s a complete, drop-in replacement **AGENTS.md** tailored for your `nuxt-gel` repo and optimized for Nuxt 4, Nuxt UI 4, and Gel (formerly EdgeDB), with MCP server usage baked in.

---

# AGENTS.md

**Purpose:** This file tells AI coding agents exactly how to update and maintain this Nuxt module during the port from **Nuxt 3 → Nuxt 4**, **Nuxt UI → Nuxt UI v4**, and **EdgeDB → Gel**. It includes setup, coding rules, migration steps, test/release commands, and safe usage of MCP servers for **Nuxt**, **Nuxt UI**, and **Gel**.

This project is a fork/port of `nuxt-edgedb` to modern **Nuxt 4 + Nuxt UI v4 + Gel 6+**. Agents should preserve compatibility and DX while aligning with current best practices.

---

## Quick mission briefing

* **Goal:** Ship a Nuxt 4 module that integrates **Gel 6+** (EdgeDB rename) with great defaults, type-safe queries, auth helpers, and a Nuxt UI v4–friendly example/playground.
* **Must haves:**

  * Nuxt 4 compatibility (runtime, module hooks, types, nitro compatibility)
  * Nuxt UI v4–compatible example UI & docs snippets
  * Gel naming, env vars, CLI, auth endpoints (branch-based) everywhere
  * Solid tests and lint/type checks
  * Safe, minimal, version-pinned **MCP** usage for Nuxt / Nuxt UI / Gel
* **Non-goals:** Feature creep, breaking public APIs without a clear migration path, or adding unrelated dependencies.

---

## Local setup & common commands

Run these from the repo root unless specified.

```bash
# Install dependencies
pnpm install

# Typecheck + lint
pnpm typecheck
pnpm lint:fix

# Build the module
pnpm build

# Run unit tests (Vitest)
pnpm test

# Dev playground (example app lives in ./playground)
# Recommended sequence for a fresh clone:
pnpm install
pnpm stub
cd playground
gel project init
npx nuxt-gel-module
pnpm dev
```

> Notes
> • `pnpm stub` prepares local codegen and fixtures used by the module and tests.
> • The example app uses the Gel CLI; ensure you’ve installed Gel before `gel project init`.

---

## Project structure (high-level)

```
.
├─ src/               # Nuxt module source (runtime, composables, server utilities)
├─ templates/         # Template files injected by the module scaffold/CLI
├─ playground/        # Example Nuxt app to verify integration & DX
├─ test/              # Unit tests (Vitest)
├─ .nuxtrc            # Nuxt module config
├─ build.config.ts    # Unbuild / build tooling
└─ README.md          # User-facing docs
```

**Generated artifacts that should not be committed** (paths can differ if config changes):

```
**/*.edgeql.ts
dbschema/queries.*
dbschema/query-builder
dbschema/interfaces.ts
queries/*.query.ts
```

Add/keep them in `.gitignore`.

---

## Coding standards

* **Language:** TypeScript strict.
* **Style:** Follow repo ESLint/Prettier configs. No ad-hoc style changes.
* **APIs:** Keep public API stable where possible. If you must break something, add a migration note in this file and in `CHANGELOG.md`.
* **Runtime imports:** Prefer ESM and typed exports. Avoid dynamic `require`.
* **Errors:** Helpful messages; never swallow critical errors.
* **Docs:** Keep `README.md` aligned with actual behavior and examples.
* **Tests:** Cover composables, module options, and critical server utilities.

---

## Nuxt 4 migration checklist (agent-actionable)

**Update core module integration**

* [ ] Ensure `defineNuxtModule` usage matches Nuxt 4 defaults and type signatures.
* [ ] Verify Nitro compatibility for any server runtime utilities and H3 usage.
* [ ] Confirm auto-imports still resolve correctly with Nuxt 4’s resolver.
* [ ] Remove/replace any Nuxt 3–only APIs.
* [ ] Update `peerDependencies` to allow `nuxt@^4`.

**Update docs & playground to Nuxt 4**

* [ ] Playground `nuxt.config.ts` uses `extends/modules/imports` consistent with Nuxt 4.
* [ ] Confirm dev server, aliases, and auto-imports work out of the box.
* [ ] Ensure `pnpm dev` hot reload works as expected in playground.

**Testing on Nuxt 4**

* [ ] Run typecheck/tests against Nuxt 4.
* [ ] If CI exists, matrix test (Node LTS + Nuxt 3 (last) & 4 (current)), or explicitly mark Nuxt 3 as legacy.

---

## Nuxt UI v4 adoption

**For the example app and docs snippets only** (the module itself is UI-agnostic):

* [ ] Upgrade to **Nuxt UI v4** in `playground/` and adjust any component imports/usages.
* [ ] Prefer semantic components and props that exist in v4; remove any v3-only usage.
* [ ] Keep examples minimal, accessible, and SSR-safe.

---

## Gel (formerly EdgeDB) migration specifics

**Terminology & routing**

* Use **Gel** naming: packages, env vars, docs, comments.
* Prefer **branch semantics** (e.g. `/branch/__default__`) instead of old “database” paths, including for auth endpoints.
* Update all environment variables to **`GEL_` / `NUXT_GEL_`** equivalents and deprecate old `EDGEDB_` names gracefully.

**Code updates (search/replace guidance)**

* Replace imports and names from `edgedb` → `gel` where applicable.
* Auth endpoints & admin UIs must target Gel paths (`/branch/<name>/ext/auth/...`).
* Query generation should use current Gel toolchain (`@gel/generate`, CLI).

**Playground**

* Ensure `gel project init` works cleanly and the module wizard (`npx nuxt-gel-module`) guides through local setup.

---

## Module options (authoritative)

Documented for users in `README.md`; agents must keep these options accurate and in sync with the runtime defaults.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-gel-module'],
  gel: {
    devtools: true,
    watch: true,
    watchPrompt: true,
    generateTarget: 'ts',
    dbschemaDir: 'dbschema',
    queriesDir: 'queries',
    installCli: true,
    composables: true,
    injectDbCredentials: true,
    auth: false,
    oauth: false
  }
})
```

---

## Public composables & server helpers (do not break without a plan)

* `useGel()` → returns the scoped Gel client for the current request.
* `useGelQueries()` → returns generated query functions from `dbschema/queries.*`.
* `useGelQueryBuilder()` → exposes the generated EdgeQL builder API for server usage.

> Keep function names, parameter shapes, and return types stable. If adding new features, prefer additive APIs.

---

## Authentication guidance (baseline)

* **Email/OAuth** toggles via module options.
* OAuth providers supported by Gel can be surfaced via convenience components in the example app (e.g., `GelOAuthButton`, `GelOAuthCallback`).
* Document required env vars clearly in `README.md`.
* Do **not** hardcode secrets in source/tests/examples.

---

## MCP (Model Context Protocol) usage policy

We use MCP servers to help agents work safely and effectively:

### Approved servers

* **Nuxt MCP**: for file structure, module conventions, and Nuxt APIs.
* **Nuxt UI MCP**: for component APIs, theming, and usage patterns.
* **Gel MCP**: for schema inspection, query generation, and auth endpoints.

### Agent rules

* **Pin versions**: Always pin MCP server versions in local config.
* **Least privilege**: Only enable capabilities you need (read-only where possible).
* **Review generated rules**: If an MCP server writes rules files, review diffs before committing.
* **No secrets**: Never paste tokens/credentials into MCP prompts or config.
* **Network awareness**: If a tool can send/receive data, confirm destination and intent.
* **Disable on CI**: MCP is for local dev assistance only—never required in CI.
* **If in doubt, ask for human review**: Prefer safety over convenience.

> Security note: There have been incidents of malicious MCP servers exfiltrating data. Pin versions, verify sources, and audit permissions regularly.

---

## Agent task flow (recommended)

1. **Set up the repo**

   * `pnpm install && pnpm build && pnpm test && pnpm typecheck`

2. **Run the playground once**

   * `pnpm stub && cd playground && gel project init && npx nuxt-gel-module && pnpm dev`
   * Confirm example queries, auth toggles, and HMR-style schema updates.

3. **Perform Nuxt 4 port**

   * Update module internals for Nuxt 4 hook/types.
   * Fix any auto-import and resolver issues.
   * Re-verify nitro runtime server code.

4. **Adopt Nuxt UI v4 in the playground**

   * Replace deprecated components/usages.
   * Keep examples small and focused; demonstrate one happy path per page.

5. **Do Gel rename/branch changes**

   * Imports, env vars, endpoints, docs.
   * Ensure codegen and query builder generation works.

6. **Harden tests**

   * Unit tests around module options, composable behavior, and auth toggles.
   * Add regression tests for common misconfigurations.

7. **Docs pass**

   * Sync `README.md` install steps and options with reality.
   * Include a minimal quickstart and migration notes.

8. **Final QA**

   * `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
   * Run the playground locally end-to-end.

---

## Release checklist

* [ ] Update `peerDependencies` and compatibility notes (Nuxt 4, Gel 6+).
* [ ] Ensure changelog documents any breaking changes and migration steps.
* [ ] Tag a semver release (respecting semver).
* [ ] Publish after tests pass locally and (if set up) in CI.

---

## Compatibility targets

* **Nuxt:** `^4` (primary).
* **Gel:** `^6` (primary).
* **Node:** Active LTS.
* **Nuxt UI v4:** playground/examples only; the module has no runtime dependency on Nuxt UI.

---

## Common pitfalls & resolutions

* **Generated files in VCS:** Keep them ignored; regenerate locally.
* **Auth endpoints 404:** Verify branch-based paths and that auth extension is enabled in the Gel instance.
* **Auto-imports missing:** Re-check Nuxt 4 resolver/auto-imports and module `meta` configuration.
* **MCP overreach:** Disable servers that try to write project files unexpectedly; prefer explicit, audited scripts.

---

## What **not** to change (without strong justification)

* Public composable names and signatures listed above
* Default module option keys
* Example app routing for auth flows (unless fixing a bug/regression)

---

## Minimal contributions guide (for agents)

* Keep PRs focused and small.
* Include tests and docs updates with code changes.
* Avoid adding new runtime deps unless absolutely necessary.
* Defer product decisions (new features) to maintainers.

---

## Appendix: Useful commands (copy-paste friendly)

```bash
# From repo root
pnpm install
pnpm typecheck
pnpm lint
pnpm lint:fix
pnpm test
pnpm build

# Playground boot
pnpm stub
cd playground
gel project init
npx nuxt-gel-module
pnpm dev
```

---

## Sources & alignment (for human reviewers)

This file encodes current best practices for Nuxt 4 migration, Nuxt UI v4 usage in examples, Gel rename/branch semantics, and MCP safety. It is intentionally agent-actionable and conservative about public API changes.

---

### Maintainers

* Keep this file in sync with implementation.
* Expand the MCP “Approved servers” list with pinned versions you trust.
* Record any breaking changes and migration steps here and in the changelog.

---

**End of AGENTS.md**

---

## Why these choices (citations)

* **AGENTS.md standard & suggested structure** – This file follows the open format and intent described on the AGENTS.md site and repo (setup, code style, commands, predictable location for agent guidance). ([agents.md][1])
* **Nuxt 4 migration** – Checklist aligns with Nuxt’s Nuxt 4 upgrade guidance and blog announcement emphasizing improved DX, defaults, and organizational changes. ([Nuxt][2])
* **Nuxt UI v4** – Playground/example guidance maps to the Nuxt UI v4 release, unifying UI and Pro with updated component sets. ([Nuxt][3])
* **Gel rename + branch semantics & env updates** – Gel is the successor identity for EdgeDB and uses branch semantics; we reflect this in auth endpoints and env variables. ([geldata.com][4])
* **MCP servers for Nuxt UI and Gel** – Pointer to Nuxt UI’s MCP docs and the Gel MCP server for agent tooling; guidance includes the warning about rules files and safe usage. ([Nuxt UI][5])
* **MCP security caution** – We explicitly recommend pinning versions and least-privilege use in light of recent malicious MCP server incidents. ([IT Pro][6])

[1]: https://agents.md/?utm_source=chatgpt.com "AGENTS.md"
[2]: https://nuxt.com/docs/4.x/getting-started/upgrade?utm_source=chatgpt.com "Upgrade Guide · Get Started with Nuxt v4"
[3]: https://nuxt.com/blog/nuxt-ui-v4?utm_source=chatgpt.com "Nuxt UI v4 · Nuxt Blog"
[4]: https://www.geldata.com/blog/edgedb-is-now-gel-and-postgres-is-the-future?utm_source=chatgpt.com "EdgeDB is now Gel and Postgres is the Future | Gel Blog"
[5]: https://ui.nuxt.com/docs/getting-started/ai/mcp?utm_source=chatgpt.com "MCP Server - Nuxt UI"
[6]: https://www.itpro.com/security/a-malicious-mcp-server-is-silently-stealing-user-emails?utm_source=chatgpt.com "A malicious MCP server is silently stealing user emails"
