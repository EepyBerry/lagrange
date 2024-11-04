
<div align="center">
  <img alt="update-logo" src="https://github.com/user-attachments/assets/ec71bcd0-e9d2-4023-a7af-8556a80b2e3e">
</div>


# Lagrange - Procedural Planet Builder 🪐

<p>
  <img src="https://img.shields.io/badge/VueJS-3.4-%2342B883?logo=vuedotjs&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/Vite-5.2-%23BD34FE?logo=vite&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/ThreeJS-r166-%23049EF4?logo=threedotjs&labelColor=%2335495E&logoColor=white">
</p>

A WebGL project using VueJS and ThreeJS! <br>
Lagrange is a browser application to help you create your own planets, using procedural noise as a foundation to build upon.

**🪐✨ [Check out the app here!](https://lagrange.eepyberry.me) ✨🪐**

_(**note:** this is something I am working on during my free time, which means that update frequency will vary!)_

## 🚀 Latest version: "Ecosystems"!

<ul>
  <li>⭐ Introduces a fully fledged <strong>biome system</strong>, using temperature- & humidity-based positioning!</li>
  <li>⭐ Surface noise now works properly in Linux-based browsers!</li>
  <li>⭐ Smaller performance fixes all around, including fewer GLSL uniforms & varyings!</li>
</ul>

## 🖼️ Showcase

<div align="center">
  <img width="30%" src="https://github.com/user-attachments/assets/937ec6c2-6969-49fa-a32c-856a759524f0" title="Kormeg" alt="planet:Kormeg">
  <img width="30%" src="https://github.com/user-attachments/assets/73345f0a-43d9-4055-9366-3150f499502f" title="Meriana" alt="planet:Meriana">
  <img width="30%" src="https://github.com/user-attachments/assets/7f20e7d1-a390-4050-8df6-3e8b5f1a6145" title="Hoven" alt="planet:Hoven">
</div>
<div align="center">
  <img width="30%" src="https://github.com/user-attachments/assets/94951339-dc6f-4f68-9ef2-259cc7b585eb" title="Rakken IV" alt="planet:Rakken IV">
  <img width="30%" src="https://github.com/user-attachments/assets/9309ad14-6de0-4dc8-a37b-5b617395baf4" title="Rilgar" alt="planet:Rilgar">
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

- ☀️ **Lighting parameters!** (sunlight, ambient light)
- 🌍 **Planet & Rendering parameters!** (transform, water level, PBR settings)
- 🗺️ **Surface parameters!** (bump mapping, noise settings, color ramp)
- ⛰️ **Biome parameters!** (temperature/humidity mapping, per-biome min/max values & color)
- ☁️ **Clouds parameters!** (transform, color, opacity ramp)
- 🌈 **Atmosphere parameters!** (density, color mixing modes)

## ⏰ Planned features

- Dark side "night lights"!
- Cracks & Craters!
- Gas Giants!
- Rings & Asteroid belts!
- _Galactic Map_, to organize them around stars!

## ✨ Inspirations

This project is heavily inspired by the awesome projects below:

- [PlanetMaker Chrome Experiment](https://planetmaker.apoapsys.com) (2013, Kevin M. Gill)
- [NASA's Eye on Exoplanets](https://eyes.nasa.gov/apps/exo/#/) (Unknown date, NASA)

## 📓 Licensing

Original assets and source code from this project are provided under a BSD 3-Clause "New" or "Revised" License.<br>
Please consult the [license file](LICENSE) for full information.

Content from other parties is provided under their respective license, and attribution is given at the top of the aforementioned content.

## 🤝 Contributing

If you want to contribute code, feel free to submit your PRs!

Please make sure to respect the following:

1. [fork the project](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)
2. create a branch from `develop`
3. request your branch to be merged into `develop`
