import './style.css';

// Dynamically import all .sdf files
const moleculePaths = import.meta.glob('./molecules/*.sdf', { query: '?url', import: 'default', eager: true });

// Metadata: filename stem → { cid, formula }
// formula uses plain text with ^ for subscript markers replaced in renderFormula()
const moleculeMeta = {
  'Hexanitrohexaazaisowurtzitane': {
    cid: 9889323,
    formula: 'C6H6N12O12',
    condensed: '(NO2)6(CH)6N6',
    smiles: 'C12C3N(C4C(N3[N+](=O)[O-])N(C(N1[N+](=O)[O-])C(N2[N+](=O)[O-])N4[N+](=O)[O-])[N+](=O)[O-])[N+](=O)[O-]',
  },
  'Pentaerythritol tetranitrate': {
    cid: 6518,
    formula: 'C5H8N4O12',
    condensed: 'C(CH2ONO2)4',
    smiles: 'C(C(CO[N+](=O)[O-])(CO[N+](=O)[O-])CO[N+](=O)[O-])O[N+](=O)[O-]',
  },
  'Трихлоизоционуровая кислота': {
    cid: 6909,
    formula: 'C3Cl3N3O3',
    condensed: '(ClNCO)3',
    smiles: 'C1(=O)N(C(=O)N(C(=O)N1Cl)Cl)Cl',
  },
  'Абиетиновая кислота': {
    cid: 10569,
    formula: 'C20H30O2',
    smiles: 'CC(C)C1=CC2=CC[C@@H]3[C@@]([C@H]2CC1)(CCC[C@@]3(C)C(=O)O)C',
  },
  'Абсцизовая кислота': {
    cid: 5280896,
    formula: 'C15H20O4',
    smiles: 'CC1=CC(=O)CC([C@]1(/C=C/C(=C\\C(=O)O)/C)O)(C)C',
  },
  'Лимонная кислота': {
    cid: 311,
    formula: 'C6H8O7',
    condensed: 'HOC(COOH)(CH2COOH)2',
    smiles: 'C(C(=O)O)C(CC(=O)O)(C(=O)O)O',
  },
  'Ортоугольная кислота': {
    cid: 9547954,
    formula: 'CH4O4',
    condensed: 'C(OH)4',
    smiles: 'C(O)(O)(O)O',
  },
  'Дициклопентадиенил железа': {
    cid: 10219726,
    formula: 'C10H10Fe',
    condensed: 'Fe(C5H5)2',
    smiles: 'C1=C[CH]C=C1.C1=C[CH]C=C1.[Fe]',
  },
  'Пентасилациклодиенит': {
    formula: 'Si5H5',
    condensed: '(SiH)5',
    smiles: '[SiH-]1[SiH]=[SiH][SiH]=[SiH]1',
    structureImg: './structures/Пентасилациклодиенит.png',
  },
  '4,10-дициано-2,6,8,12-тетранитро-2,4,6,8,10,12-гексаазоизовюрцитан': {
    formula: 'C8H6N12O8',
    condensed: '(CN)2(NO2)4(CH)6N6',
    smiles: '[H]C12N(C#N)C([H])3N([N+](=O)[O-])C([H])4N([N+](=O)[O-])C([H])3N(C#N)C([H])1N([N+](=O)[O-])C([H])4N([N+](=O)[O-])2',
    structureImg: './structures/4,10-дициано-2,6,8,12-тетранитро-2,4,6,8,10,12-гексаазоизовюрцитан.png',
  },
  'Гептахлордициклопентапиранилбутилфтортетрагидроизобутиламиноакридин': {
    formula: 'C36H34Cl7FN2O2',
    smiles: 'CCCCC1c2c(Cl)c(-c3cc4c(o3)CC(Cl)C4)c(Cl)c(Cl)c2Nc2c(Cl)c(-c3cc4c(o3)CCC4)c(Cl)c(F)c2C1(Cl)NCC(C)C',
    structureImg: './structures/Гептахлордициклопентапиранилбутилфтортетрагидроизобутиламиноакридин.png',
  },
  'Додекагидридоренат(3-)': {
    formula: 'H12Re',
    condensed: '[ReH12]3-',
    smiles: '[H][Re-3]([H])([H])([H])([H])([H])([H])([H])([H])([H])([H])[H]',
    structureImg: './structures/Додекагидридоренат(3-).png',
  },
  'Декакарбонилдимарганец': {
    cid: 6096972,
    formula: 'C10Mn2O10',
    condensed: 'Mn2(CO)10',
    smiles: '[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[Mn].[Mn]',
    structureImg: './structures/Декакарбонилдимарганец.png',
  },
  'Пентакарбонилжелезо': {
    cid: 26040,
    formula: 'C5FeO5',
    condensed: 'Fe(CO)5',
    smiles: '[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[Fe]',
    structureImg: './structures/Пентакарбонилжелезо.png',
  },
  'Гексакарбонилсиборгий': {
    formula: 'C6O6Sg',
    condensed: 'Sg(CO)6',
    smiles: '[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[Sg]',
    structureImg: './structures/Гексакарбонилсиборгий.png',
  },
  'Тетракарбонилникель': {
    cid: 26039,
    formula: 'C4NiO4',
    condensed: 'Ni(CO)4',
    smiles: '[C-]#[O+].[C-]#[O+].[C-]#[O+].[C-]#[O+].[Ni]',
    structureImg: './structures/Тетракарбонилникель.png',
  },
  'Тетранитрид тетрасеры': {
    cid: 141455,
    formula: 'N4S4',
    condensed: 'S4N4',
    smiles: 'N1=S=NSN=S=NS1',
    structureImg: './structures/Тетранитрид_тетрасеры.png',
  },
  'Карборановая кислота': {
    formula: 'CH2B11Cl11',
    condensed: 'H(CHB11Cl11)',
    smiles: '[H+].[H]C1234B567(Cl)B89%10(Cl)B%11%12%13(Cl)B85%14(Cl)B%1158(Cl)B%12%11%15(Cl)B%139%12(Cl)B%1061(Cl)B%12%112(Cl)[B-]5%153(Cl)B%14874Cl',
    structureImg: './structures/Карборановая_кислота.png',
  },
  'Гексафторсурьмяная кислота': {
    cid: 11118066,
    formula: 'HF6Sb',
    condensed: 'H[SbF6]',
    smiles: 'F.F[Sb](F)(F)(F)F',
    structureImg: './structures/Гексафторсурьмяная_кислота.png',
  },
  'Сухая вода (Novec 1230)': {
    cid: 2782408,
    formula: 'C6F12O',
    condensed: 'CF3CF2C(O)CF(CF3)2',
    smiles: 'C(=O)(C(C(F)(F)F)(C(F)(F)F)F)C(C(F)(F)F)(F)F',
  },
};

// Protein metadata: name → { pdbId, description, organism }
const proteinMeta = {
  'Титин (I27 домен)': {
    pdbId: '1TIT',
    description: 'Иммуноглобулиновый домен I27 титина - крупнейшего белка человека',
    organism: 'Homo sapiens',
    formula: null,
  },
  'Инсулин': {
    pdbId: '4INS',
    description: 'Гормон инсулин, регулятор уровня глюкозы в крови',
    organism: 'Sus scrofa',
    formula: null,
  },
  'Гемоглобин': {
    pdbId: '1A3N',
    description: 'Белок-переносчик кислорода в эритроцитах',
    organism: 'Homo sapiens',
    formula: null,
  },
  'Зелёный флуоресцентный белок (GFP)': {
    pdbId: '1EMA',
    description: 'Флуоресцентный белок из медузы Aequorea victoria',
    organism: 'Aequorea victoria',
    formula: null,
  },
  'Лизоцим': {
    pdbId: '1AKI',
    description: 'Антибактериальный фермент, разрушающий клеточные стенки бактерий',
    organism: 'Gallus gallus',
    formula: null,
  },
};

// Render formula with HTML subscripts
const renderFormula = (formula) => {
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
};

// State
let viewer = null;
let currentStyle = { stick: {} };
let labelsEnabled = false;
let currentSdfText = null;
let currentMoleculeName = '';
let currentViewMode = 'molecule'; // 'molecule' or 'protein'

const initViewer = () => {
  const container = document.getElementById('viewer-3d');
  viewer = $3Dmol.createViewer(container, {
    backgroundColor: '#0a0a0f',
  });
};

const updateInfoPanel = (name, cid) => {
  const panel = document.getElementById('molecule-info');
  const formulaEl = document.getElementById('info-formula-value');
  const imgEl = document.getElementById('info-structure-img');
  const structuralBlock = document.getElementById('info-structural-formula-block');
  const structuralEl = document.getElementById('info-structural-formula-value');
  const condensedBlock = document.getElementById('info-condensed-block');
  const condensedEl = document.getElementById('info-condensed-value');

  const meta = moleculeMeta[name];

  // Brutto formula
  if (meta && meta.formula) {
    formulaEl.innerHTML = renderFormula(meta.formula);
  } else {
    formulaEl.textContent = '—';
  }

  // Condensed structural formula
  if (meta && meta.condensed) {
    condensedEl.innerHTML = renderFormula(meta.condensed);
    condensedBlock.classList.remove('hidden');
  } else {
    condensedBlock.classList.add('hidden');
  }

  // Structural formula (SMILES)
  if (meta && meta.smiles) {
    structuralEl.textContent = meta.smiles;
    structuralBlock.classList.remove('hidden');
  } else {
    structuralEl.textContent = '';
    structuralBlock.classList.add('hidden');
  }

  // Structural 2D scheme: local image → PubChem CID → PubChem SMILES
  const useCid = meta ? meta.cid : cid;
  if (meta && meta.structureImg) {
    imgEl.src = meta.structureImg;
    imgEl.alt = `Структурная схема ${name}`;
    imgEl.style.display = '';
  } else if (useCid) {
    imgEl.src = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${useCid}/PNG?record_type=2d&image_size=300x200`;
    imgEl.alt = `Структурная схема ${name}`;
    imgEl.style.display = '';
  } else if (meta && meta.smiles) {
    imgEl.src = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(meta.smiles)}/PNG?record_type=2d&image_size=300x200`;
    imgEl.alt = `Структурная схема ${name}`;
    imgEl.style.display = '';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }

  panel.classList.remove('hidden');
};

const loadMolecule = async (name, url) => {
  if (!viewer) return;

  currentViewMode = 'molecule';
  currentStyle = { stick: {} };
  document.getElementById('empty-state').style.display = 'none';
  // Reset structural formula label
  const sfLabel = document.querySelector('#info-structural-formula-block .info-label');
  if (sfLabel) sfLabel.textContent = 'Структурная формула';
  document.getElementById('current-molecule-name').textContent = name;
  document.getElementById('current-molecule-name').classList.add('glow');

  const response = await fetch(url);
  const data = await response.text();
  currentSdfText = data;
  currentMoleculeName = name;

  viewer.clear();
  viewer.addModel(data, 'sdf');
  viewer.setStyle({}, currentStyle);

  if (labelsEnabled) {
    viewer.addPropertyLabels('elem', {}, {
      fontColor: 'white',
      backgroundColor: 'black',
      backgroundOpacity: 0.8,
      fontSize: 14,
      borderRadius: 4,
    });
  } else {
    viewer.removeAllLabels();
  }

  viewer.zoomTo();
  viewer.render();

  // Update info panel
  updateInfoPanel(name);

  setTimeout(() => {
    document.getElementById('current-molecule-name').classList.remove('glow');
  }, 1000);
};

const updateProteinInfoPanel = (name, meta) => {
  const panel = document.getElementById('molecule-info');
  const formulaEl = document.getElementById('info-formula-value');
  const imgEl = document.getElementById('info-structure-img');
  const structuralBlock = document.getElementById('info-structural-formula-block');
  const structuralEl = document.getElementById('info-structural-formula-value');

  formulaEl.innerHTML = `<span style="font-size:14px">${meta.description}</span>`;

  if (meta.organism) {
    structuralEl.textContent = meta.organism;
    structuralBlock.classList.remove('hidden');
    structuralBlock.querySelector('.info-label').textContent = 'Организм';
  } else {
    structuralBlock.classList.add('hidden');
  }

  imgEl.src = `https://cdn.rcsb.org/images/structures/${meta.pdbId.toLowerCase()}_assembly-1.jpeg`;
  imgEl.alt = `Структура ${name}`;
  imgEl.style.display = '';

  panel.classList.remove('hidden');
};

const loadProtein = async (name, meta) => {
  if (!viewer) return;

  currentViewMode = 'protein';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('current-molecule-name').textContent = name;
  document.getElementById('current-molecule-name').classList.add('glow');

  try {
    const response = await fetch(`https://files.rcsb.org/download/${meta.pdbId}.pdb`);
    const data = await response.text();
    currentSdfText = data;
    currentMoleculeName = name;

    viewer.clear();
    viewer.addModel(data, 'pdb');
    viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    viewer.zoomTo();
    viewer.render();

    updateProteinInfoPanel(name, meta);
  } catch (err) {
    console.error('Failed to load protein:', err);
    document.getElementById('current-molecule-name').textContent = 'Error loading protein';
  }

  setTimeout(() => {
    document.getElementById('current-molecule-name').classList.remove('glow');
  }, 1000);
};

const setupMenu = () => {
  const list = document.getElementById('molecule-list');
  let firstItem = null;

  for (const [path, url] of Object.entries(moleculePaths)) {
    const parts = path.split('/');
    let filename = parts[parts.length - 1];
    filename = filename.replace('.sdf', '').replace(/_/g, ' ');

    const li = document.createElement('li');
    li.className = 'molecule-item';

    const nameEl = document.createElement('span');
    nameEl.className = 'molecule-item-name';
    nameEl.textContent = filename;
    li.appendChild(nameEl);

    const meta = moleculeMeta[filename];
    const condensedOrFormula = meta && (meta.condensed || meta.formula);
    if (condensedOrFormula) {
      const formulaEl = document.createElement('span');
      formulaEl.className = 'molecule-item-formula';
      formulaEl.innerHTML = renderFormula(condensedOrFormula);
      li.appendChild(formulaEl);
    }

    li.addEventListener('click', () => {
      document.querySelectorAll('.molecule-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      loadMolecule(filename, url);
    });

    list.appendChild(li);

    if (!firstItem) {
      firstItem = { element: li, name: filename, url: url };
    }
  }

  // Protein list
  const proteinList = document.getElementById('protein-list');
  for (const [name, meta] of Object.entries(proteinMeta)) {
    const li = document.createElement('li');
    li.className = 'molecule-item';

    const nameEl = document.createElement('span');
    nameEl.className = 'molecule-item-name';
    nameEl.textContent = name;
    li.appendChild(nameEl);

    const descEl = document.createElement('span');
    descEl.className = 'molecule-item-formula';
    descEl.textContent = meta.pdbId;
    li.appendChild(descEl);

    li.addEventListener('click', () => {
      document.querySelectorAll('.molecule-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      loadProtein(name, meta);
    });

    proteinList.appendChild(li);
  }

  if (firstItem) {
    firstItem.element.classList.add('active');
    loadMolecule(firstItem.name, firstItem.url);
  } else {
    document.getElementById('current-molecule-name').textContent = 'No molecules found';
  }
};

const setupControls = () => {
  document.getElementById('reset-view').addEventListener('click', () => {
    if (viewer) {
      viewer.zoomTo();
      viewer.render();
    }
  });

  document.getElementById('style-toggle').addEventListener('click', () => {
    if (!viewer) return;

    if (currentViewMode === 'protein') {
      // Cycle through protein styles: cartoon → stick → surface
      if (currentStyle.cartoon) {
        currentStyle = { stick: { colorscheme: 'ssJmol' } };
      } else if (currentStyle.stick) {
        currentStyle = { sphere: { colorscheme: 'ssJmol' } };
      } else {
        currentStyle = { cartoon: { color: 'spectrum' } };
      }
    } else {
      if (currentStyle.stick) {
        currentStyle = { sphere: {} };
      } else {
        if (labelsEnabled) {
          currentStyle = { stick: { multipleBond: true, radius: 0.1 } };
        } else {
          currentStyle = { stick: {} };
        }
      }
    }

    viewer.setStyle({}, currentStyle);
    viewer.render();
  });

  document.getElementById('ar-export').addEventListener('click', async () => {
    if (!currentSdfText) return;
    const btn = document.getElementById('ar-export');
    btn.disabled = true;
    try {
      const { generateUSDZFromSDF } = await import('./utils/sdfToUsdz.js');
      const arraybuffer = await generateUSDZFromSDF(currentSdfText);
      const blob = new Blob([arraybuffer], { type: 'model/vnd.usdz+zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentMoleculeName.replace(/\s+/g, '_')}.usdz`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('USDZ export failed:', err);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('label-toggle').addEventListener('click', (e) => {
    if (!viewer) return;

    labelsEnabled = !labelsEnabled;
    const btn = e.currentTarget;

    if (labelsEnabled) {
      if (currentStyle.stick) {
        currentStyle = { stick: { multipleBond: true, radius: 0.1 } };
      }
      viewer.setStyle({}, currentStyle);
      viewer.addPropertyLabels('elem', {}, {
        fontColor: 'white',
        backgroundColor: 'black',
        backgroundOpacity: 0.8,
        fontSize: 14,
        borderRadius: 4,
      });
      btn.style.color = '#fff';
      btn.style.borderColor = 'rgba(99, 102, 241, 0.8)';
      btn.style.background = 'rgba(99, 102, 241, 0.2)';
    } else {
      if (currentStyle.stick) {
        currentStyle = { stick: {} };
      }
      viewer.setStyle({}, currentStyle);
      viewer.removeAllLabels();
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.background = '';
    }

    viewer.render();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initViewer();
  setupMenu();
  setupControls();
});
