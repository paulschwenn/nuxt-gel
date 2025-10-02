# Project Goal

The goal of this project is to port the `nuxt-gel` module to Nuxt 4. This involves updating all dependencies, ensuring compatibility with Nuxt 4's new features and breaking changes, and verifying that all features, including authentication and the CLI, work as expected.

## Key Tasks

1.  **Upgrade Nuxt Dependencies:** Update `nuxt`, `@nuxt/kit`, `@nuxt/schema`, and other Nuxt-related packages to their latest Nuxt 4 compatible versions.
2.  **Upgrade `gel` Dependencies:** Update `gel` and `@gel/generate` to their latest versions.
3.  **Nuxt 4 Compatibility:**
    *   Review the Nuxt 4 migration guide and update the module's code accordingly.
    *   Pay special attention to changes in the module authoring API, Nitro configuration, and DevTools integration.
    *   Update the `devtools:customTabs` hook to the new API.
4.  **`pnpm` Compatibility:** Ensure that the project continues to work seamlessly with `pnpm`. All scripts and workflows should be tested with `pnpm`.
5.  **CLI:** The CLI must be compatible with `pnpm`.
6.  **Testing:** Thoroughly test the module in the playground to ensure all features are working correctly after the upgrade.
7. **MCP tools:** Use the relevant mcp tools for maximum token efficiency and context utilisation. 

## AI Coding Assistant Guidelines

*   When making changes, always refer to the Nuxt 4 documentation to ensure you're using the correct APIs and best practices.
*   Prioritize backward compatibility where possible, but don't hesitate to adopt new Nuxt 4 features that improve the module's performance or developer experience.
*   Ensure all code is well-documented, especially any new or complex logic.
*   Write clear and concise commit messages that explain the "why" behind each change.
