# Background Generation Prompt Template

Use this template to generate background images.

Variables:
- {theme}: Logical theme name (e.g., "Route 66").
- {variant}: Visual variant (e.g., "day", "night").
- {platform}: Target platform ("web" or "mobile").
- {aspect}: Desired aspect ratio or crop priority (e.g., "wide desktop" or "tall mobile portrait").

Prompt skeleton:

"Create a high-quality, photo-realistic background image for a road trip planning app.
The scene is themed around {theme}, {variant}.
Follow the Route 66 background style guide and the global content safety policy.
The image will be used as a background behind UI, so:
- Provide generous negative space for text and buttons.
- Keep any vehicles or focal elements away from the very center.
- Ensure colors and contrast keep white UI text legible.
Target platform: {platform}, optimized for {aspect}.
Do not include any visible text, logos, or recognizable faces."
