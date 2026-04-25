import { zipSync, strToU8 } from 'three/examples/jsm/libs/fflate.module.js';

function p(n) { return n.toFixed(6); }

function hexToRgb(hex) {
    return {
        r: ((hex >> 16) & 0xff) / 255,
        g: ((hex >> 8)  & 0xff) / 255,
        b: ( hex        & 0xff) / 255,
    };
}

// Extract all mesh geometry from 3Dmol viewer's internal scene
function extractMeshes(viewer) {
    const meshes = [];
    const group = viewer.modelGroup;
    if (!group) return meshes;

    group.traverse(function(obj) {
        const geo = obj.geometry;
        if (!geo) return;

        const mesh = { verts: [], faces: [], colors: [] };

        // Handle BufferGeometry (newer 3Dmol builds)
        if (geo.attributes && geo.attributes.position) {
            const pos = geo.attributes.position;
            const col = geo.attributes.color;
            const idx = geo.index;

            for (let i = 0; i < pos.count; i++) {
                mesh.verts.push({ x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) });
                if (col) {
                    mesh.colors.push({ r: col.getX(i), g: col.getY(i), b: col.getZ(i) });
                }
            }

            if (idx) {
                for (let i = 0; i < idx.count; i += 3) {
                    mesh.faces.push([idx.getX(i), idx.getX(i+1), idx.getX(i+2)]);
                }
            } else {
                for (let i = 0; i < pos.count; i += 3) {
                    mesh.faces.push([i, i+1, i+2]);
                }
            }
        }
        // Handle old-style Geometry (vertices/faces arrays — 3Dmol's bundled Three.js)
        else if (geo.vertices && geo.faces) {
            for (const v of geo.vertices) {
                mesh.verts.push({ x: v.x, y: v.y, z: v.z });
            }
            for (const f of geo.faces) {
                mesh.faces.push([f.a, f.b, f.c]);
                // Per-vertex colors from face
                if (f.vertexColors && f.vertexColors.length === 3) {
                    while (mesh.colors.length < mesh.verts.length) {
                        mesh.colors.push({ r: 0.7, g: 0.7, b: 0.7 });
                    }
                    mesh.colors[f.a] = hexToRgb(f.vertexColors[0].getHex());
                    mesh.colors[f.b] = hexToRgb(f.vertexColors[1].getHex());
                    mesh.colors[f.c] = hexToRgb(f.vertexColors[2].getHex());
                } else if (f.color) {
                    while (mesh.colors.length < mesh.verts.length) {
                        mesh.colors.push({ r: 0.7, g: 0.7, b: 0.7 });
                    }
                    const fc = hexToRgb(f.color.getHex());
                    mesh.colors[f.a] = fc;
                    mesh.colors[f.b] = fc;
                    mesh.colors[f.c] = fc;
                }
            }
        }
        else {
            return; // skip unknown geometry
        }

        // Fallback: material color if no per-vertex colors
        if (mesh.colors.length === 0 && mesh.verts.length > 0) {
            let matColor = { r: 0.7, g: 0.7, b: 0.7 };
            if (obj.material) {
                const mc = obj.material.color;
                if (mc) matColor = hexToRgb(mc.getHex ? mc.getHex() : mc);
            }
            mesh.colors = mesh.verts.map(() => matColor);
        }

        if (mesh.verts.length > 0 && mesh.faces.length > 0) {
            meshes.push(mesh);
        }
    });

    return meshes;
}

function buildSceneUSDA(meshes) {
    // Compute bounding box center for centering
    let cx = 0, cy = 0, cz = 0, totalVerts = 0;
    for (const m of meshes) {
        for (const v of m.verts) { cx += v.x; cy += v.y; cz += v.z; }
        totalVerts += m.verts.length;
    }
    if (totalVerts === 0) return null;
    cx /= totalVerts; cy /= totalVerts; cz /= totalVerts;

    // Compute scale based on bounding box size
    let maxR = 0;
    for (const m of meshes) {
        for (const v of m.verts) {
            const dx = v.x - cx, dy = v.y - cy, dz = v.z - cz;
            const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (r > maxR) maxR = r;
        }
    }
    const scale = maxR > 0 ? 0.5 / maxR : 0.05;

    let meshDefs = '';
    meshes.forEach((mesh, mi) => {
        const pointsStr = mesh.verts.map(v =>
            `(${p(v.x - cx)}, ${p(v.y - cy)}, ${p(v.z - cz)})`
        ).join(', ');

        const colorsStr = mesh.colors.map(c =>
            `(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`
        ).join(', ');

        const fvcStr = mesh.faces.map(() => '3').join(', ');
        const fviStr = mesh.faces.map(f => f.join(', ')).join(', ');

        meshDefs += `
    def Mesh "Mesh_${mi}"
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

    float3 xformOp:scale = (${p(scale)}, ${p(scale)}, ${p(scale)})
    uniform token[] xformOpOrder = ["xformOp:scale"]
${meshDefs}
}
`;
}

// Pack files into a USDZ-compliant ZIP (level=0, 64-byte aligned).
function packUSDZ(files) {
    let offset = 0;
    for (const filename in files) {
        const file = files[filename];
        const headerSize = 34 + filename.length;
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

export async function generateUSDZFromScene(viewer) {
    const meshes = extractMeshes(viewer);
    if (!meshes.length) throw new Error('No geometry found in viewer');

    const usda = buildSceneUSDA(meshes);
    if (!usda) throw new Error('Could not build USDA');

    const files = { 'scene.usda': strToU8(usda) };
    return packUSDZ(files);
}
