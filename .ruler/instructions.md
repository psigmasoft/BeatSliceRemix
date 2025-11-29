# Ruler Instructions

These are your centralised AI agent instructions.
Add your coding guidelines, style guides, and other project-specific context here.

Other files in this directory provide additional context:
- Reference documentation is in `/docs/reference/` (not loaded by Ruler)
- Use CORE_RULES.md as the single source of truth

Ruler concatenates all .md files in this directory and applies them to configured AI coding agents.

---

## Important: Disable Expo MCP Tools

**This project is a Vite frontend App, NOT an Expo/React Native mobile app.**

Do NOT use:
- `mcp__expo_mcp__generate_agents_md` - will generate wrong mobile-focused content
- `mcp__expo_mcp__learn` - irrelevant for this stack
- `mcp__expo_mcp__add_library` - not applicable
- `mcp__expo_mcp__search_documentation` - wrong documentation

If you need to update AGENTS.md, manually edit it from CORE_RULES.md content instead.
