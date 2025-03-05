<div align="center">
  <img alt="update-logo" src="https://github.com/user-attachments/assets/d2a172d2-3b3f-45dc-9e38-4315536aa57e">
</div>

# Lagrange - Procedural Planet Builder 🪐

<p>
  <img src="https://img.shields.io/badge/VueJS-3.5-%2342B883?logo=vuedotjs&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/Vite-6.1-%23BD34FE?logo=vite&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/ThreeJS-r173-%23049EF4?logo=threedotjs&labelColor=%2335495E&logoColor=white">
</p>

A WebGL project using VueJS and ThreeJS! <br>
Lagrange is a browser application to help you create your own planets, using procedural noise as a foundation to build upon.

**🪐✨ [Check out the app here!](https://lagrange.eepyberry.me) ✨🪐**

_(**note:** this is something I am working on during my free time, which means that update frequency will vary!)_

## 🚀 Latest major version: "Jovian Expansion"!

<ul>
  <li>⭐ Adds <strong>new parameters</strong> for your worlds: XYZ warping, displacement and ring systems!</li>
  <li>⭐ New dialog box when trying to leave the Editor without saving first, along with many touch-ups & improvements!</li>
  <li>⭐ Adds fr-FR translation, and changes project license to ISTSL-NR 1.0!</li>
</ul>

## 🖼️ Showcase

<div align="center">
  <img width="30%" src="https://github.com/user-attachments/assets/937ec6c2-6969-49fa-a32c-856a759524f0" title="Kormeg" alt="planet:Kormeg">
  <img width="30%" src="https://github.com/user-attachments/assets/27988862-2186-4704-97e3-5c1b579a1a8d" title="Meriana" alt="planet:Meriana">
  <img width="30%" src="https://github.com/user-attachments/assets/b448e96c-f80d-4e39-b2ca-578db53095df" title="Hoven" alt="planet:Hoven">

</div>
<div align="center">
  <img width="30%" src="https://github.com/user-attachments/assets/94951339-dc6f-4f68-9ef2-259cc7b585eb" title="Rakken IV" alt="planet:Rakken IV">
  <img width="30%" src="https://github.com/user-attachments/assets/6535c328-5765-4e19-8fb0-b50e547dc54e" title="Hermeus Major" alt="planet:Hermeus Major">
  <img width="30%" src="https://github.com/user-attachments/assets/476c8706-88a7-49c2-a6d2-2cd152207496" title="Xu'Alatl" alt="planet:Xu'Alatl">
</div>

## ⚠️ Requirements

**IMPORTANT:** to properly run the application, [**WebGL 2.0 browser support**](https://get.webgl.org/webgl2/) is required! <br>
The following website will give you more information on your WebGL capabilites: [**WebGL Report**](https://webglreport.com/?v=2)

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

### Editor

- ☀️ **Lighting parameters!** (sunlight, ambient light, color)
- 🌍 **Planet & Rendering parameters!** (transform, water level, PBR settings)
- 🗺️ **Surface parameters!** (bump mapping, warping, displacement, noise settings, color ramp)
- ⛰️ **Biome parameters!** (temperature/humidity mapping, per-biome min/max values & color)
- ☁️ **Clouds parameters!** (transform, warping, noise settings, color, opacity ramp)
- 🌈 **Atmosphere parameters!** (density, color mixing modes)
- 🪐 **Ring System parameters!** (radii, color ramp)

## ⏰ Planned features

- Dark side "night lights"!
- Cracks & Craters!
- Asteroid belts!
- Planet animations!
- _Galactic Map_, to organize them around stars!

## ✨ Inspirations & credits

This project is heavily inspired by the awesome projects below:

- [PlanetMaker Chrome Experiment](https://planetmaker.apoapsys.com) (2013, Kevin M. Gill)
- [NASA's Eye on Exoplanets](https://eyes.nasa.gov/apps/exo/#/) (Unknown date, NASA)

**Special thanks** to the awesome people below, without whom this project would likely not exist:

<ul>
  <li>Three.js extensions: <a href=\"https://github.com/FarazzShaikh\" target=\"\"><b>Faraz Shaikh</b></a> (CustomShaderMaterial)</li>
  <li>Main GLSL code snippets: <a href=\"https://iquilezles.org/\" target=\"_blank\"><b>Iñigo Quilez</b></a> (Voronoi + fBm), <a href=\"https://www.shadertoy.com/user/gltracy\" target=\"_blank\"><b>GLtracy</b></a> (atmosphere), <a href=\"https://andersonmancini.dev/\" target=\"_blank\"><b>Anderson Mancini</b></a> (lens flare)</li>
  <li>Miscellaneous GLSL code: <a href=\"https://www.dangreenheck.com/\"><b>Daniel Greenheck</b></a> (bump-mapping)</li>
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
