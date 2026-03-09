# MoleculaX — 3D Molecule Structure Viewer

An interactive web application for visualizing chemical molecules in 3D. Built with [Vite](https://vitejs.dev/) and [Three.js](https://threejs.org/), rendered via [3Dmol.js](https://3dmol.org/).

**[Live demo →](https://YOUR_NAMESPACE.gitlab.io/moleculas/)**

---

## Features

- **3D visualization** — render molecular structures in stick or sphere style
- **Atom labels** — toggle element labels and multiple bond display
- **2D structural diagrams** — fetched automatically from [PubChem](https://pubchem.ncbi.nlm.nih.gov/)
- **Brutto formula & SMILES** — displayed in the info panel for each molecule
- **AR export** — download a `.usdz` file for Apple AR Quick Look on iPhone/iPad
- **Dark UI** — minimal, responsive interface

## Molecules included

| Name | Formula |
|---|---|
| Hexanitrohexaazaisowurtzitane (CL-20) | C₆H₆N₁₂O₁₂ |
| Pentaerythritol tetranitrate (PETN) | C₅H₈N₄O₁₂ |
| 4,10-дициано-2,6,8,12-тетранитро-HNIW | C₈H₆N₁₂O₈ |
| Трихлоизоционуровая кислота | C₃Cl₃N₃O₃ |
| Абиетиновая кислота | C₂₀H₃₀O₂ |
| Абсцизовая кислота | C₁₅H₂₀O₄ |
| Лимонная кислота | C₆H₈O₇ |

## Getting started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project structure

```
moleculas/
├── index.html               # App entry point
├── vite.config.js           # Vite configuration
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js              # App logic — viewer, controls, menu
│   ├── style.css            # Styles
│   └── molecules/           # SDF structure files
│       ├── *.sdf
│       └── ...
├── scripts/
│   └── generate_molecules.py  # Utility: generate SDF files from SMILES via RDKit
└── .gitlab-ci.yml           # GitLab Pages CI/CD pipeline
```

## Adding molecules

1. Place a `.sdf` file in `src/molecules/`. The filename (without extension, underscores replaced by spaces) becomes the display name.
2. Add an entry to the `moleculeMeta` object in `src/main.js` with `formula`, `smiles`, and optionally a PubChem `cid`.

To generate an SDF from a SMILES string, you can use the included Python utility (requires [RDKit](https://www.rdkit.org/)):

```bash
# Install RDKit in a virtual environment
python -m venv .venv && source .venv/bin/activate
pip install rdkit
python scripts/generate_molecules.py
```

## Deployment to GitLab Pages

The repository includes a `.gitlab-ci.yml` that automatically builds and publishes the app to GitLab Pages on every push to the default branch.

The live URL will be:
```
https://<your-namespace>.gitlab.io/moleculas/
```

No environment variables or secrets are required — the app uses only public, unauthenticated APIs (PubChem REST API) and a public CDN (3Dmol.js).

## Technology stack

| Layer | Library |
|---|---|
| Build | [Vite 5](https://vitejs.dev/) |
| 3D rendering | [3Dmol.js](https://3dmol.org/) (CDN) |
| AR geometry math | [Three.js](https://threejs.org/) |
| AR packaging | [fflate](https://github.com/101arrowz/fflate) (bundled with Three.js) |
| Structural diagrams | [PubChem REST API](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest) |
| Fonts | [Google Fonts](https://fonts.google.com/) — Inter, Outfit |

## License

MIT
