import os
from rdkit import Chem
from rdkit.Chem import AllChem

molecules = {
    "Hexanitrohexaazaisowurtzitane": "C12C3N(C4C(N3[N+](=O)[O-])N(C(N1[N+](=O)[O-])C(N2[N+](=O)[O-])N4[N+](=O)[O-])[N+](=O)[O-])[N+](=O)[O-]",
    "Pentaerythritol_tetranitrate": "C(C(CO[N+](=O)[O-])(CO[N+](=O)[O-])CO[N+](=O)[O-])O[N+](=O)[O-]"
}

output_dir = "src/molecules"
os.makedirs(output_dir, exist_ok=True)

for name, smiles in molecules.items():
    mol = Chem.MolFromSmiles(smiles)
    if mol is not None:
        mol = Chem.AddHs(mol)
        AllChem.EmbedMolecule(mol, randomSeed=42)
        AllChem.MMFFOptimizeMolecule(mol)
        
        output_path = os.path.join(output_dir, f"{name}.sdf")
        writer = Chem.SDWriter(output_path)
        writer.write(mol)
        writer.close()
        print(f"Generated {output_path}")
    else:
        print(f"Failed to parse SMILES for {name}")
