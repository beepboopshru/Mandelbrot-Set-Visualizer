# **App Name**: Fractal Neon

## Core Features:

- Mandelbrot Generation: Generate and render the Mandelbrot set fractal dynamically on a canvas element.
- Interactive Navigation: Enable zooming and panning of the fractal with smooth transitions, updating the rendered view accordingly.
- Detail Adjustment: Allow users to adjust the iteration depth via a slider or input field to control fractal detail.
- Palette Selection: Provide a dropdown menu to switch between pre-defined color palettes for the fractal.
- Reset View: Implement a 'Reset' button to revert to the default zoom level and center position of the Mandelbrot set.
- Progressive Rendering Tool: The LLM is used as a tool, deciding when to generate quick, low-resolution previews during zoom/pan and progressively refine details as the user stops interacting, optimizing perceived performance.

## Style Guidelines:

- Background color: Very dark desaturated blue (#0A0A26) to create a dark-themed aesthetic.
- Primary color: Bright blue (#63B5FF) for main interactive elements.
- Accent color: Electric purple (#D063FF) for highlighting and active states, providing a neon/glowing effect.
- Font: 'Space Grotesk' sans-serif for headlines and 'Inter' sans-serif for body text; using the former will create a tech-inspired aesthetic.
- Top navigation bar with app title and quick controls, with a side control panel for detailed adjustments.
- Subtle transitions when zooming and panning, as well as color palette changes.