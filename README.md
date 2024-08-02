# Lagrange - Procedural Planet Builder 🪐

<p>
  <img src="https://img.shields.io/badge/VueJS-3.4-%2342B883?logo=vuedotjs&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/Vite-5.2-%23BD34FE?logo=vite&labelColor=%2335495E&logoColor=white">
  <img src="https://img.shields.io/badge/ThreeJS-r166-%23049EF4?logo=threedotjs&labelColor=%2335495E&logoColor=white">
</p>

A WebGL side-project using VueJS and ThreeJS! <br>
Lagrange is a browser application to help you create your own planets, using procedural noise as a foundation to build upon.

_(**important note:** this is something I am working on during my free time, which means that update frequency will vary!)_

**🪐✨ [Check out the app here!](https://lagrange.eepyberry.me) ✨🪐**

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

## 📋 Current Features

### Codex
- 📋 Create, import & export your planets! (now set as the landing page)
- 🔎 See previews of your creations!

### Editor
- ☀️ **Lighting parameters!** (sunlight, ambient light)
- 🌍 **Planet & Rendering parameters!** (transform, PBR, water level)
- 🗺️ **Surface parameters!** (bumps, noise settings, color)
- ⛰️ **Biome parameters!** (🚧 poles)
- ☁️ **Clouds parameters!** (transform, color, opacity)
- 🌈 **Atmosphere parameters!** (density, color)

## ⏰ Planned features

- More biomes!
- Cracks & Craters!
- Gas Giants!
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
