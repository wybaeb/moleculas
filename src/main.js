import './style.css';

// Dynamically import all .sdf files
const moleculePaths = import.meta.glob('./molecules/*.sdf', { query: '?url', import: 'default', eager: true });

// Metadata: filename stem → { cid, formula }
// formula uses plain text with ^ for subscript markers replaced in renderFormula()
const moleculeMeta = {
  'Hexanitrohexaazaisowurtzitane': {
    cid: 9889323,
    formula: 'C6H6N12O12',
    smiles: 'C12C3N(C4C(N3[N+](=O)[O-])N(C(N1[N+](=O)[O-])C(N2[N+](=O)[O-])N4[N+](=O)[O-])[N+](=O)[O-])[N+](=O)[O-]',
  },
  'Pentaerythritol tetranitrate': {
    cid: 6518,
    formula: 'C5H8N4O12',
    smiles: 'C(C(CO[N+](=O)[O-])(CO[N+](=O)[O-])CO[N+](=O)[O-])O[N+](=O)[O-]',
  },
  'Трихлоизоционуровая кислота': {
    cid: 6909,
    formula: 'C3Cl3N3O3',
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
    smiles: 'C(C(=O)O)C(CC(=O)O)(C(=O)O)O',
  },
  '4,10-дициано-2,6,8,12-тетранитро-2,4,6,8,10,12-гексаазоизовюрцитан': {
    formula: 'C8H6N12O8',
    smiles: '[H]C12N(C#N)C([H])3N([N+](=O)[O-])C([H])4N([N+](=O)[O-])C([H])3N(C#N)C([H])1N([N+](=O)[O-])C([H])4N([N+](=O)[O-])2',
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

  const meta = moleculeMeta[name];

  // Brutto formula
  if (meta && meta.formula) {
    formulaEl.innerHTML = renderFormula(meta.formula);
  } else {
    formulaEl.textContent = '—';
  }

  // Structural formula (SMILES)
  if (meta && meta.smiles) {
    structuralEl.textContent = meta.smiles;
    structuralBlock.classList.remove('hidden');
  } else {
    structuralEl.textContent = '';
    structuralBlock.classList.add('hidden');
  }

  // Structural 2D scheme from PubChem
  const useCid = meta ? meta.cid : cid;
  if (useCid) {
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

  document.getElementById('empty-state').style.display = 'none';
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
    if (meta && meta.formula) {
      const formulaEl = document.createElement('span');
      formulaEl.className = 'molecule-item-formula';
      formulaEl.innerHTML = renderFormula(meta.formula);
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

    if (currentStyle.stick) {
      currentStyle = { sphere: {} };
    } else {
      if (labelsEnabled) {
        currentStyle = { stick: { multipleBond: true, radius: 0.1 } };
      } else {
        currentStyle = { stick: {} };
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
