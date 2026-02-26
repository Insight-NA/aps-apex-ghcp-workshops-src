# Image Agent Tools

This folder contains Node-based utilities used by the `@image-manager` Copilot agent.

## CLI: Analyze Images

The `analyze-images` command scans active and archive asset folders for the web and mobile apps and reports basic metadata (format, dimensions, file size).

### Installation

From the repository root:

```bash
cd tools/image-agent
npm install
```

### Usage

From the repository root:

```bash
cd tools/image-agent
npm run analyze-images
```

Or, after `npm install -g` within this folder, you can run:

```bash
image-agent-analyze
```

### Output

By default, the command prints a human-readable summary grouped by area (mobile/web, active/archive).
You can also request JSON output for programmatic consumption:

```bash
npm run analyze-images -- --json
```

This is the initial building block that the `@image-manager` Copilot agent can call to understand the current state of image assets before planning generation or refresh tasks.
