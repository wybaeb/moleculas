import * as THREE from 'three';
import { zipSync, strToU8 } from 'three/examples/jsm/libs/fflate.module.js';

// CPK colors (hex)
const ElementColors = {
    H:  0xffffff, C:  0x909090, O:  0xff2200, N:  0x3050f8,
    S:  0xffff30, P:  0xff8000, Cl: 0x1ff01f, F:  0x90e050,
    Br: 0xa62929, I:  0x940094, Fe: 0xe06633, Zn: 0x7d80b0,
    Ca: 0x3dff00, Mg: 0x8aff00, Na: 0xab5cf2, K:  0x8f40d4,
    Mn: 0x9c7ac7, Cu: 0xc88033, Se: 0xffa100, Default: 0xff00ff,
};

// Covalent radii (Å)
const ElementRadii = {
    H: 0.32, C: 0.75, O: 0.73, N: 0.71, S: 1.02, P: 1.06, Cl: 0.99, F: 0.71,
    Br: 1.14, I: 1.33, Fe: 1.24, Zn: 1.20, Ca: 1.74, Mg: 1.36, Na: 1.54,
    K: 1.96, Mn: 1.17, Cu: 1.12, Se: 1.16, Default: 0.8,
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

// ── PDB parsing ──────────────────────────────────────────────────────────────

function extractCaTrace(pdbText) {
    const lines = pdbText.split(/\r?\n/);
    const chains = {};
    for (const line of lines) {
        const rec = line.substring(0, 6).trim();
        if (rec !== 'ATOM') continue;
        const atomName = line.substring(12, 16).trim();
        if (atomName !== 'CA') continue;
        const chain = line.substring(21, 22).trim() || '_';
        const x = parseFloat(line.substring(30, 38));
        const y = parseFloat(line.substring(38, 46));
        const z = parseFloat(line.substring(46, 54));
        if (!chains[chain]) chains[chain] = [];
        chains[chain].push({ x, y, z });
    }
    return chains;
}

// Catmull-Rom spline interpolation
function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return {
        x: 0.5 * ((2*p1.x) + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
        y: 0.5 * ((2*p1.y) + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
        z: 0.5 * ((2*p1.z) + (-p0.z+p2.z)*t + (2*p0.z-5*p1.z+4*p2.z-p3.z)*t2 + (-p0.z+3*p1.z-3*p2.z+p3.z)*t3),
    };
}

function smoothChain(pts, segsPerResidue) {
    if (pts.length < 2) return pts;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(i + 2, pts.length - 1)];
        for (let s = 0; s < segsPerResidue; s++) {
            out.push(catmullRom(p0, p1, p2, p3, s / segsPerResidue));
        }
    }
    out.push(pts[pts.length - 1]);
    return out;
}

// HSL spectrum color (hue 0→0.7 mapped to red→violet)
function spectrumColor(t) {
    const h = t * 0.7;
    const s = 0.9, l = 0.55;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    const hi = Math.floor(h * 6);
    if (hi === 0)      { r=c; g=x; b=0; }
    else if (hi === 1) { r=x; g=c; b=0; }
    else if (hi === 2) { r=0; g=c; b=x; }
    else if (hi === 3) { r=0; g=x; b=c; }
    else               { r=x; g=0; b=c; }
    return { r: r+m, g: g+m, b: b+m };
}

function generateTubeMesh(spline, radius, circleSegs) {
    const verts = [];
    const colors = [];
    const faces = [];
    const n = spline.length;

    for (let i = 0; i < n; i++) {
        // Tangent
        const prev = spline[Math.max(i - 1, 0)];
        const next = spline[Math.min(i + 1, n - 1)];
        const tx = next.x - prev.x, ty = next.y - prev.y, tz = next.z - prev.z;
        const tLen = Math.sqrt(tx*tx + ty*ty + tz*tz) || 1;
        const T = { x: tx/tLen, y: ty/tLen, z: tz/tLen };

        // Arbitrary perpendicular
        let up = Math.abs(T.y) < 0.9 ? { x:0,y:1,z:0 } : { x:1,y:0,z:0 };
        // N = T x up (normalized)
        let Nx = T.y*up.z - T.z*up.y, Ny = T.z*up.x - T.x*up.z, Nz = T.x*up.y - T.y*up.x;
        let nLen = Math.sqrt(Nx*Nx + Ny*Ny + Nz*Nz) || 1;
        Nx /= nLen; Ny /= nLen; Nz /= nLen;
        // B = T x N
        const Bx = T.y*Nz - T.z*Ny, By = T.z*Nx - T.x*Nz, Bz = T.x*Ny - T.y*Nx;

        const col = spectrumColor(i / (n - 1));

        for (let j = 0; j < circleSegs; j++) {
            const angle = (j / circleSegs) * Math.PI * 2;
            const cos = Math.cos(angle), sin = Math.sin(angle);
            verts.push({
                x: spline[i].x + radius * (cos * Nx + sin * Bx),
                y: spline[i].y + radius * (cos * Ny + sin * By),
                z: spline[i].z + radius * (cos * Nz + sin * Bz),
            });
            colors.push(col);
        }
    }

    // Quads
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < circleSegs; j++) {
            const a = i * circleSegs + j;
            const b = i * circleSegs + (j + 1) % circleSegs;
            const c = (i + 1) * circleSegs + (j + 1) % circleSegs;
            const d = (i + 1) * circleSegs + j;
            faces.push([a, b, c, d]);
        }
    }

    return { verts, colors, faces };
}

function buildProteinUSDA(pdbText) {
    const chains = extractCaTrace(pdbText);
    const chainIds = Object.keys(chains);
    if (!chainIds.length) return null;

    // Center
    let cx=0, cy=0, cz=0, count=0;
    for (const id of chainIds) {
        for (const pt of chains[id]) { cx+=pt.x; cy+=pt.y; cz+=pt.z; count++; }
    }
    cx/=count; cy/=count; cz/=count;

    let meshDefs = '';

    chainIds.forEach((chainId, ci) => {
        const raw = chains[chainId].map(pt => ({ x:pt.x-cx, y:pt.y-cy, z:pt.z-cz }));
        if (raw.length < 2) return;

        const spline = smoothChain(raw, 4);
        const { verts, colors, faces } = generateTubeMesh(spline, 0.4, 8);

        const pointsStr = verts.map(v => `(${p(v.x)}, ${p(v.y)}, ${p(v.z)})`).join(', ');
        const colorsStr = colors.map(c => `(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`).join(', ');
        const fvcStr = faces.map(() => '4').join(', ');
        const fviStr = faces.map(f => f.join(', ')).join(', ');

        meshDefs += `
    def Mesh "Chain_${ci}"
    {
        int[] faceVertexCounts = [${fvcStr}]
        int[] faceVertexIndices = [${fviStr}]
        point3f[] points = [${pointsStr}]
        color3f[] primvars:displayColor = [${colorsStr}] (
            interpolation = "vertex"
        )
        uniform bool doubleSided = 1
    }`;
    });

    // Scale: proteins are ~50-100 Å, so scale down more
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

    float3 xformOp:scale = (0.01, 0.01, 0.01)
    uniform token[] xformOpOrder = ["xformOp:scale"]
${meshDefs}
}
`;
}

// ── Format detection & export ────────────────────────────────────────────────

function detectFormat(text) {
    const first = text.trimStart().substring(0, 200);
    if (first.includes('ATOM') || first.includes('HEADER') || first.includes('REMARK')) return 'pdb';
    return 'sdf';
}

export async function generateUSDZFromSDF(text) {
    const fmt = detectFormat(text);

    if (fmt === 'pdb') {
        const usda = buildProteinUSDA(text);
        if (!usda) throw new Error('No Cα atoms found in PDB');
        const files = { 'scene.usda': strToU8(usda) };
        return packUSDZ(files);
    }

    const parsed = parseSDF(text);
    if (!parsed) throw new Error('Could not parse SDF format');
    const usda = buildUSDA(parsed);
    const files = { 'scene.usda': strToU8(usda) };
    return packUSDZ(files);
}
