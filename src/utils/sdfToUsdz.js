import * as THREE from 'three';
import { zipSync, strToU8 } from 'three/examples/jsm/libs/fflate.module.js';

// CPK colors (hex)
const ElementColors = {
    H:  0xffffff, C:  0x909090, O:  0xff2200, N:  0x3050f8,
    S:  0xffff30, P:  0xff8000, Cl: 0x1ff01f, F:  0x90e050,
    Br: 0xa62929, I:  0x940094, Default: 0xff00ff,
};

// Covalent radii (Å)
const ElementRadii = {
    H: 0.32, C: 0.75, O: 0.73, N: 0.71, S: 1.02, P: 1.06, Cl: 0.99, F: 0.71, Default: 0.8,
};

function parseSDF(sdfText) {
    const lines = sdfText.split(/\r?\n/);
    if (lines.length < 4) return null;

    const countsLine = lines[3];
    const numAtoms = parseInt(countsLine.substring(0, 3).trim(), 10);
    const numBonds = parseInt(countsLine.substring(3, 6).trim(), 10);

    const atoms = [], bonds = [];

    for (let i = 0; i < numAtoms; i++) {
        const line = lines[4 + i];
        atoms.push({
            x: parseFloat(line.substring(0, 10)),
            y: parseFloat(line.substring(10, 20)),
            z: parseFloat(line.substring(20, 30)),
            element: line.substring(31, 34).trim(),
        });
    }
    for (let i = 0; i < numBonds; i++) {
        const line = lines[4 + numAtoms + i];
        bonds.push({
            atom1: parseInt(line.substring(0, 3)) - 1,
            atom2: parseInt(line.substring(3, 6)) - 1,
        });
    }
    return { atoms, bonds };
}

function hexToUsdColor(hex) {
    const r = ((hex >> 16) & 0xff) / 255;
    const g = ((hex >> 8)  & 0xff) / 255;
    const b = ( hex        & 0xff) / 255;
    return `(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
}

function p(n) { return n.toFixed(6); } // precision helper

function buildUSDA(parsed) {
    const { atoms, bonds } = parsed;

    // Center on atom cloud midpoint
    let cx = 0, cy = 0, cz = 0;
    atoms.forEach(a => { cx += a.x; cy += a.y; cz += a.z; });
    cx /= atoms.length; cy /= atoms.length; cz /= atoms.length;

    // Unique element list for materials
    const elements = [...new Set(atoms.map(a => a.element))];

    // ── Materials ──────────────────────────────────────────────────────────────
    let matDefs = '';
    elements.forEach(elem => {
        const hex = ElementColors[elem] ?? ElementColors.Default;
        matDefs += `
        def Material "${elem}Mat"
        {
            token outputs:surface.connect = </Root/Materials/${elem}Mat/Shader.outputs:surface>
            def Shader "Shader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor = ${hexToUsdColor(hex)}
                float inputs:roughness = 0.3
                float inputs:metallic = 0.1
                token outputs:surface
            }
        }`;
    });

    matDefs += `
        def Material "BondMat"
        {
            token outputs:surface.connect = </Root/Materials/BondMat/Shader.outputs:surface>
            def Shader "Shader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor = (0.7500, 0.7500, 0.7500)
                float inputs:roughness = 0.4
                float inputs:metallic = 0.1
                token outputs:surface
            }
        }`;

    // ── Atoms + Labels ─────────────────────────────────────────────────────────
    let atomDefs = '';
    atoms.forEach((atom, i) => {
        const x = atom.x - cx, y = atom.y - cy, z = atom.z - cz;
        const r = (ElementRadii[atom.element] ?? ElementRadii.Default) * 0.4;

        // Sphere
        atomDefs += `
    def Sphere "Atom_${i}"
    {
        double radius = ${p(r)}
        rel material:binding = </Root/Materials/${atom.element}Mat>
        double3 xformOp:translate = (${p(x)}, ${p(y)}, ${p(z)})
        uniform token[] xformOpOrder = ["xformOp:translate"]
    }`;

        // Native 2D text label — Preliminary_Text (Apple AR Quick Look, iOS 14+)
        const labelY = y + r + 0.35;
        const labelW = Math.max(r * 2.5, 0.5);
        const labelH = labelW * 0.55;

        atomDefs += `
    def Xform "Label_${i}" (
        prepend apiSchemas = ["Preliminary_Text"]
    )
    {
        string content = "${atom.element}"
        string[] font = ["Helvetica Neue", "System"]
        float depth = 0.0
        float pointSize = 108
        float width = ${p(labelW)}
        float height = ${p(labelH)}
        token wrapMode = "singleLine"
        token horizontalAlignment = "center"
        token verticalAlignment = "middle"
        double3 xformOp:translate = (${p(x)}, ${p(labelY)}, ${p(z)})
        uniform token[] xformOpOrder = ["xformOp:translate"]
    }`;
    });

    // ── Bonds ──────────────────────────────────────────────────────────────────
    let bondDefs = '';
    const q = new THREE.Quaternion();
    const yAxis = new THREE.Vector3(0, 1, 0);

    bonds.forEach((bond, i) => {
        const a1 = atoms[bond.atom1], a2 = atoms[bond.atom2];
        if (!a1 || !a2) return;

        const x1 = a1.x - cx, y1 = a1.y - cy, z1 = a1.z - cz;
        const x2 = a2.x - cx, y2 = a2.y - cy, z2 = a2.z - cz;

        const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2;

        q.setFromUnitVectors(yAxis, new THREE.Vector3(dx, dy, dz).normalize());

        bondDefs += `
    def Cylinder "Bond_${i}"
    {
        double radius = 0.080000
        double height = ${p(len)}
        token axis = "Y"
        rel material:binding = </Root/Materials/BondMat>
        double3 xformOp:translate = (${p(mx)}, ${p(my)}, ${p(mz)})
        quatf xformOp:orient = (${p(q.w)}, ${p(q.x)}, ${p(q.y)}, ${p(q.z)})
        uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:orient"]
    }`;
    });

    // ── Assemble full USDA ─────────────────────────────────────────────────────
    return `#usda 1.0
(
    defaultPrim = "Root"
    metersPerUnit = 1
    upAxis = "Y"
)

def Xform "Root"
{
    token preliminary:anchoring:type = "plane"
    token preliminary:planeAnchoring:alignment = "horizontal"

    float3 xformOp:scale = (0.05, 0.05, 0.05)
    uniform token[] xformOpOrder = ["xformOp:scale"]

    def "Materials"
    {${matDefs}
    }
${atomDefs}
${bondDefs}
}
`;
}

// Pack files into a USDZ-compliant ZIP (level=0, 64-byte aligned).
// Mirrors Three.js USDZExporter's alignment logic.
function packUSDZ(files) {
    let offset = 0;
    for (const filename in files) {
        const file = files[filename];
        const headerSize = 34 + filename.length; // local file header overhead in fflate
        offset += headerSize;
        const mod = offset & 63;
        if (mod !== 4) {
            const padding = new Uint8Array(64 - mod);
            files[filename] = [file, { extra: { 12345: padding } }];
        }
        offset += file.length;
    }
    return zipSync(files, { level: 0 });
}

export async function generateUSDZFromSDF(sdfText) {
    const parsed = parseSDF(sdfText);
    if (!parsed) throw new Error('Could not parse SDF format');

    const usda = buildUSDA(parsed);
    const files = { 'scene.usda': strToU8(usda) };
    return packUSDZ(files);
}
