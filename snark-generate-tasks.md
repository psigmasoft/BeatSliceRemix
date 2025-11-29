# Rule: Generating a Task List from User Requirements

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on user requirements, feature requests, or existing documentation. The task list should guide a developer through implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[feature-name].md` (e.g., `tasks-user-profile-editing.md`)

## Process

1.  **Receive Requirements:** The user provides a feature request, task description, or points to existing documentation
2.  **Analyze Requirements:** The AI analyzes the functional requirements, user needs, and implementation scope from the provided information
3.  **Phase 1: Generate Parent Tasks:** Based on the requirements analysis, create the file and generate the main, high-level tasks required to implement the feature. **IMPORTANT: Always include task 0.0 "Ask user if they want to use a feature branch" as the first task, unless the user specifically requests not to create a branch.** Use your judgement on how many additional high-level tasks to use. It's likely to be about 5. Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on your requirements. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
4.  **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
5.  **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. Ensure sub-tasks logically follow from the parent task and cover the implementation details implied by the requirements.
6.  **Identify Relevant Files:** Based on the tasks and requirements, identify potential files that will need to be created or modified. List these under the `Relevant Files` section, including corresponding test files if applicable.
7.  **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, notes, and final completion tasks into the final Markdown structure.
8.  **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[feature-name].md`, where `[feature-name]` describes the main feature or task being implemented (e.g., if the request was about user profile editing, the output is `tasks-user-profile-editing.md`).
9.  **Complete Final Tasks:** After implementation tasks are done, complete tasks 9.0 and 10.0 (move files, generate commit message, reflect on process) before work is considered complete.

## Output Format

The generated task list _must_ follow this structure:

````markdown
## Relevant Files

- `path/to/potential/file1.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/file1.test.ts` - Unit tests for `file1.ts`.
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `path/to/another/file.test.tsx` - Unit tests for `another/file.tsx`.
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).
- `lib/utils/helpers.test.ts` - Unit tests for `helpers.ts`.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

**IMPORTANT:** Once all implementation tasks are complete, you MUST complete the final tasks (below) before considering work done:

- Task 9.0: Move and rename PRD/TASKS files to the completed_tasks directory
- Task 9.5: Clean up additional MD files created during the implementation (NEW)
- Task 10.0: Generate commit message and reflect on process

**IMPORTANT:** A concise git commit message should be displayed (not automatically committed) that the user can copy and use to commit the work to git. The user must review the changes first.

**IMPORTANT:** Check and follow the agent rules regarding "self improvement" and "reflection" as the final step of the work.

## MD File Cleanup Process (Task 9.5)

During the planning and verification phase, multiple supporting Markdown documents may be created:

**Supporting Documents Created for This Work**:

- Verification documents (e.g., `IMPLEMENTATION_READINESS_CHECK.md`)
- Code review documents (e.g., `BACKEND_CODE_VERIFICATION.md`)
- Flow verification documents (e.g., `END_TO_END_FLOW_VERIFICATION.md`)
- Any other planning/analysis documents created during the work

**Cleanup Process**:

1. These supporting documents are distinct from the core PRD and TASKS files
2. After all implementation and final tasks are complete, move these files to `_PLANS/DONE/completed_tasks/`
3. This keeps the active `tasks/` directory clean and ready for new work
4. All documentation is preserved in the completed_tasks archive

**When to Perform Cleanup**:

- Include as Task 9.5 in every task list
- Execute AFTER tasks 9.0-9.4 (PRD/TASKS file movement)
- Execute BEFORE task 10.0 (commit message and reflection)

**Command Pattern**:

```bash
# Move supporting MD files to completed_tasks
mv tasks/[SUPPORTING_DOCUMENT].md _PLANS/DONE/completed_tasks/

# Verify cleanup
ls -la _PLANS/DONE/completed_tasks/*.md
```
````

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 [Sub-task description 1.1]
  - [ ] 1.2 [Sub-task description 1.2]
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 [Sub-task description 2.1]
- [ ] 3.0 Parent Task Title (may not require sub-tasks if purely structural or configuration)

---

## Final Completion Tasks (Must complete before marking work done)

- [ ] 9.0 Move and rename PRD/TASKS files to completed_tasks directory
  - [ ] 9.1 Move PRD file: Rename from `prd-[feature-name].md` to `DONE-prd-[feature-name].md` and move to `_PLANS/DONE/completed_tasks/`
  - [ ] 9.2 Move TASKS file: Rename from `tasks-[feature-name].md` to `DONE-tasks-[feature-name].md` and move to `_PLANS/DONE/completed_tasks/`
  - [ ] 9.3 Verify both files are in the correct location and inform user of successful move
- [ ] 9.5 Clean up additional MD files created during implementation
  - [ ] 9.5.1 List all MD files in tasks directory: `ls tasks/*.md`
  - [ ] 9.5.2 Identify files created during this work (distinct from PRD and TASKS files)
  - [ ] 9.5.3 Move supporting documents to `_PLANS/DONE/completed_tasks/` (verification, code review, flow docs, etc.)
  - [ ] 9.5.4 Verify all cleanup files are in correct location
  - [ ] 9.5.5 Confirm tasks/ directory only contains files for upcoming work (or is empty)
- [ ] 10.0 Generate commit message and reflect on process
  - [ ] 10.1 Generate a concise git commit message summarizing the completed work (do not commit - user will do this)
  - [ ] 10.2 Reflect on the task implementation: What went well? What could be improved? How do the findings relate to workflow guidelines?
  - [ ] 10.3 Provide suggestions for improving related guidelines if applicable

```

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature.
```
