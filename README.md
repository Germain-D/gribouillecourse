# Map Drawing App

This project is a web application that allows users to draw freehand paths, visualize them on a map, and export the paths as GPX files. It is built using Nuxt.js, Tailwind CSS, Pinia for state management, and DaisyUI for UI components.

## Features

- Freehand drawing area for creating paths.
- Visualization of drawn paths on a map.
- Export functionality to download paths as GPX files.
- Responsive design using Tailwind CSS and DaisyUI components.

## Project Structure

```
map-drawing-app
├── assets
│   └── css
│       └── tailwind.css
├── components
│   ├── DrawingCanvas.vue
│   ├── ExportButton.vue
│   ├── MapDisplay.vue
│   └── Navigation.vue
├── composables
│   └── useDrawing.ts
├── layouts
│   └── default.vue
├── pages
│   ├── index.vue
│   └── results.vue
├── plugins
│   └── map-plugin.ts
├── public
│   └── favicon.ico
├── server
│   └── api
│       └── generate-path.ts
├── stores
│   └── path.ts
├── app.vue
├── nuxt.config.ts
├── package.json
├── tailwind.config.js
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/map-drawing-app.git
   ```

2. Navigate to the project directory:
   ```
   cd map-drawing-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

## Usage

- Navigate to the home page to start drawing your path.
- Use the drawing canvas to create your desired path.
- After finishing your drawing, navigate to the results page to view the path on the map.
- Use the export button to download the path as a GPX file.

## Technologies Used

- **Nuxt.js**: A framework for Vue.js that enables server-side rendering and static site generation.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **Pinia**: A state management library for Vue.js applications.
- **DaisyUI**: A component library for Tailwind CSS that provides pre-designed UI components.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.