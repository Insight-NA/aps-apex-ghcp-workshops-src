# Task: Generate Backgrounds

When asked to generate or refresh backgrounds (for example, "Route 66 day and night backgrounds"), follow this high-level plan:

1. Read `.github/copilot-agents/image-agent-manifest.json` to understand required background sizes for web and mobile.
2. Determine the logical theme and variants from the user request (e.g., `route66`, `day`, `night`).
3. For each variant and platform:
   - Compose a Gemini 3 Pro prompt using `templates/background-generation-template.md` and the relevant style guides and safety policies.
   - Request a high-resolution master image large enough for the biggest required size.
4. For each master image:
   - Use the image worker (Sharp-based script) to generate all required size variants for that platform.
   - Write outputs into the appropriate active asset folders, e.g.:
     - `mobile/assets/backgrounds/<theme>/...`
     - `frontend/public/backgrounds/<theme>/...`
   - If a target file already exists, move it into the matching `_archive` folder with a timestamped version suffix before writing the new file.
5. Update the platform-specific manifests (`mobile/src/assets/imageManifest.json`, `frontend/src/assets/imageManifest.json`) with the new paths and variants.
6. Run an analysis pass to confirm all required sizes exist and there are no broken references.
7. Produce a concise summary for the user, including:
   - New files created.
   - Files archived.
   - Any warnings (e.g., approximate aspect ratios or large file sizes).
