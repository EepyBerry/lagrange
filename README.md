<div align="center">
  <img alt="update-logo" src="https://github.com/user-attachments/assets/277ea5b4-8c9f-4955-b13f-84123260f9a3">
</div>

# Lagrange - Procedural Planet Builder 🪐

<p>
  <img src="https://img.shields.io/badge/VueJS-3.5-%2342B883?logo=vuedotjs&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/Vite-7.1-%23BD34FE?logo=vite&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/ThreeJS-r180-%23049EF4?logo=threedotjs&labelColor=%2335495E&logoColor=white">
</p>

A WebGL2 & WebGPU project using VueJS and ThreeJS! <br>
Lagrange is a browser application to help you create your own planets, using procedural noise as a foundation to build upon.

**🪐✨ [Check out the app here!](https://lagrange.eepyberry.me) ✨🪐**

_(**note:** this is something I am working on during my free time, which means that update frequency will vary!)_

## 🚀 Latest version: "Core Overhaul"!

<ul>
  <li>⭐ Introduces WebGPU support! Renderer selection is now available in the app settings!</li>
  <li>⭐ Full rewrite of the internal app structure to help future development efforts!</li>
</ul>

Check the [releases](https://github.com/EepyBerry/lagrange/releases) page for a more comprehensive changelog!

## 🖼️ Showcase

<div align="center">
  <img width="30%" src="https://github.com/user-attachments/assets/937ec6c2-6969-49fa-a32c-856a759524f0" title="Kormeg" alt="planet:Kormeg">
  <img width="30%" src="https://github.com/user-attachments/assets/27988862-2186-4704-97e3-5c1b579a1a8d" title="Meriana" alt="planet:Meriana">
  <img width="30%" src="https://github.com/user-attachments/assets/437c28a6-d002-4cd4-bf5d-9fdf6fab679d" title="Hoven" alt="planet:Hoven">
</div>
<div align="center">
  <img width="30%" src="https://github.com/user-attachments/assets/4496c676-dc7d-4cbd-9d58-87e2f985d396" title="Gleba" alt="planet:Gleba">
  <img width="30%" src="https://github.com/user-attachments/assets/ebe1b5ae-627f-49f2-9365-cf45628d9754" title="Hermeus Major" alt="planet:Hermeus Major">
  <img width="30%" src="https://github.com/user-attachments/assets/23be7f8a-625c-4fe1-a52d-428a702507d7" title="Xu'Alatl" alt="planet:Xu'Alatl">
</div>

## ⚠️ Requirements

**IMPORTANT:** to properly run the application, [**WebGL2 browser support**](https://get.webgl.org/webgl2/) is required! <br>
Additionally, [**WebGPU browser support**](https://webgpureport.org/) is required to use the WebGPU rendering engine. <br>

The following websites will give you more information on your WebGL2 & WebGPU capabilites: [**WebGL Report**](https://webglreport.com/?v=2), [**WebGPU Report**](https://webgpureport.org/)

Please check both of them thoroughly before submitting an issue, thanks! <3

## ⚙️ Installation & building

For more details on the commands themselves, check the [package.json](https://github.com/EepyBerry/lagrange/blob/main/package.json) file.

### Run locally

Clone the repository then use the following commands:

- Install dependencies: `npm install`
- Run the application locally: `npm run dev` / `npm run dev-host`

Lagrange runs on port 5173 by default; `dev-host` exposes the application to the local network.

### Build project

Building is done with the following command:

- `npm run build`

Vite copies the output to the `dist` folder, creating it first if need be.

## 📋 Current feature set

### Codex (landing page)

- 📋 Create, import & export your planets!
- 🔎 See previews of your creations!
- 🪐 Check basic information for each planet, such as its radius, axial tilt & biome composition!

### Editor

- ☀️ **Lighting parameters!** (sunlight, ambient light, color)
- 🌍 **Planet & Rendering parameters!** (transform, water level, PBR settings)
- 🗺️ **Surface parameters!** (bump mapping, warping, displacement, noise settings, color ramp)
- ⛰️ **Biome parameters!** (temperature/humidity mapping, per-biome min/max values & color)
- ☁️ **Clouds parameters!** (transform, warping, noise settings, color, opacity ramp)
- 🌈 **Atmosphere parameters!** (height, density, color mixing modes)
- 🪐 **Ring System parameters!** (number of rings, per-ring radii & color ramps)

## ⏰ Planned features

- Dark side "night lights"!
- Cracks & Craters!
- Planet animations!
- _Galactic Map_, to organize them around stars!

## ✨ Inspirations & credits

This project is heavily inspired by the awesome projects below:

- [PlanetMaker Chrome Experiment](https://planetmaker.apoapsys.com) (2013, Kevin M. Gill)
- [NASA's Eye on Exoplanets](https://eyes.nasa.gov/apps/exo/#/) (Unknown date, NASA)

**Special thanks** to the awesome people below, without whom this project would likely not exist:

<ul>
  <li>(pre-0.5) Three.js extensions: <a class=\"lgv\" href=\"https://github.com/FarazzShaikh\" target=\"\"><b>Faraz Shaikh</b></a> (CustomShaderMaterial)</li>
  <li>Main GLSL code snippets: <a class=\"lgv\" href=\"https://iquilezles.org/\" target=\"_blank\"><b>Iñigo Quilez</b></a> (Voronoi + fBm), <a class=\"lgv\" href=\"https://www.shadertoy.com/user/gltracy\" target=\"_blank\"><b>GLtracy</b></a> (atmosphere), <a class=\"lgv\" href=\"https://andersonmancini.dev/\" target=\"_blank\"><b>Anderson Mancini</b></a> (lens flare)</li>
  <li>Miscellaneous GLSL code: <a class=\"lgv\" href=\"https://www.dangreenheck.com/\"><b>Daniel Greenheck</b></a> (bump-mapping)</li>
</ul>

## 📓 Licensing

The "Lagrange" logo, including _every_ update variant, is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license ([CC BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/))

Original assets and source code from this project are provided under the "I'm So Tired" Software License 1.0 - No-Resale version.<br>
Please consult the [license file](LICENSE) for full information.

Content from other parties is provided under their respective license, and attribution is given either at the top of the aforementioned content, or in a separate license file.

## 🤝 Contributing

If you'd like to contribute code, feel free to submit your PRs!

This project makes heavy use of the "Gitflow" branching model. To ensure proper branching, please make sure to respect the following steps:

1. [Fork the project](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)
2. Create a branch from `develop`
3. Request your branch to be merged into `develop`
