import fs from 'fs';
import * as THREE from 'three';
import { generateUSDZFromSDF } from './src/utils/sdfToUsdz.js';

const text = fs.readFileSync('./src/molecules/Лимонная_кислота.sdf', 'utf-8');

async function test() {
    try {
        const data = await generateUSDZFromSDF(text);
        console.log("USDZ Generated! Size:", data.byteLength);
    } catch (err) {
        console.error("Error generating USDZ:", err);
    }
}
test();
