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
  'Магическая кислота': {
    cid: 16211378,
    formula: 'HF6O3SSb',
    condensed: 'FSO3H·SbF5',
    smiles: 'OS(=O)(=O)F.F[Sb](F)(F)(F)F',
  },
  '2,3,7,8-Тетрахлордибензодиоксин': {
    cid: 15625,
    formula: 'C12H4Cl4O2',
    smiles: 'C1=C2C(=CC(=C1Cl)Cl)OC3=CC(=C(C=C3O2)Cl)Cl',
  },
  '2,3,7,8-Тетрахлордибензофуран': {
    cid: 39929,
    formula: 'C12H4Cl4O',
    smiles: 'C1=C2C3=CC(=C(C=C3OC2=CC(=C1Cl)Cl)Cl)Cl',
  },
  'Лауретсульфат натрия': {
    cid: 23665884,
    formula: 'C14H29NaO5S',
    condensed: 'CH3(CH2)11(OCH2CH2)OSO3Na',
    smiles: 'CCCCCCCCCCCCOCCOS(=O)(=O)[O-].[Na+]',
  },
  'Сухая вода (Novec 1230)': {
    cid: 2782408,
    formula: 'C6F12O',
    condensed: 'CF3CF2C(O)CF(CF3)2',
    smiles: 'C(=O)(C(C(F)(F)F)(C(F)(F)F)F)C(C(F)(F)F)(F)F',
  },
  'Сульфоксилат натрия': {
    cid: 23689980,
    formula: 'CH3NaO3S',
    condensed: 'HOCH2SO2Na',
    smiles: 'C(O)S(=O)[O-].[Na+]',
  },
  'Синглетный кислород': {
    cid: 977,
    formula: 'O2',
    condensed: 'O=O',
    smiles: 'O=O',
  },
  'Гидроксид натрия': {
    cid: 14798,
    formula: 'NaOH',
    condensed: 'NaOH',
    smiles: '[Na]O',
  },
  'Соляная кислота': {
    cid: 313,
    formula: 'HCl',
    condensed: 'HCl',
    smiles: 'Cl',
  },
  'Хлорид натрия': {
    cid: 5234,
    formula: 'NaCl',
    condensed: 'NaCl',
    smiles: '[Na]Cl',
  },
  'Вода': {
    cid: 962,
    formula: 'H2O',
    condensed: 'H2O',
    smiles: 'O',
  },
  'Мочевина': {
    cid: 1176,
    formula: 'CH4N2O',
    condensed: '(NH2)2CO',
    smiles: 'NC(=O)N',
  },
  'Углекислый газ': {
    cid: 280,
    formula: 'CO2',
    condensed: 'CO2',
    smiles: 'O=C=O',
  },
  'Аммиак': {
    cid: 222,
    formula: 'NH3',
    condensed: 'NH3',
    smiles: 'N',
  },
  'Формальдегид': {
    cid: 712,
    formula: 'CH2O',
    condensed: 'HCHO',
    smiles: 'O=C',
  },
  'Гидросульфат натрия': {
    cid: 516919,
    formula: 'NaHSO4',
    condensed: 'NaHSO4',
    smiles: 'OS(=O)(=O)[O-].[Na+]',
  },
  'Серная кислота': {
    cid: 1118,
    formula: 'H2SO4',
    condensed: 'H2SO4',
    smiles: 'OS(=O)(=O)O',
  },
  '2,2,6,6-Тетраметилпиперидид лития': {
    cid: 11051814,
    formula: 'C9H18LiN',
    condensed: 'LiN[C(CH3)2(CH2)]2CH2',
    smiles: '[Li+].CC1(CCCC([N-]1)(C)C)C',
  },
  'Каппа-каррагинан': {
    cid: 11966249,
    formula: 'C24H36O25S2',
    smiles: 'C1[C@@H]2[C@@H]([C@H](O1)[C@H]([C@H](O2)O)O)O[C@H]3[C@@H]([C@H]([C@H]([C@H](O3)CO)OS(=O)(=O)[O-])O[C@@H]4[C@@H]([C@@H]5[C@H]([C@H](O4)CO5)O[C@H]6[C@@H]([C@H]([C@H]([C@H](O6)CO)OS(=O)(=O)[O-])O)O)O)O',
  },
  'Хлорбензальмалонодинитрил': {
    cid: 17604,
    formula: 'C10H5ClN2',
    condensed: 'C6H4(Cl)CH=C(CN)2',
    smiles: 'Clc1ccccc1/C=C(\\C#N)C#N',
  },
  'Дибенз b,f 1,4 оксазепин': {
    cid: 9213,
    formula: 'C13H9NO',
    smiles: 'C1=CC=C2C(=C1)/N=C\\C3=CC=CC=C3O2',
  },
  'Циануровая кислота': {
    cid: 7956,
    formula: 'C3H3N3O3',
    condensed: '(HNCO)3',
    smiles: 'C1(=O)NC(=O)NC(=O)N1',
  },
  'Карбонат натрия': {
    cid: 10340,
    formula: 'Na2CO3',
    condensed: 'Na2CO3',
    smiles: '[Na+].[Na+].[O-]C([O-])=O',
  },
  'Хлорид аммония': {
    cid: 25517,
    formula: 'NH4Cl',
    condensed: 'NH4Cl',
    smiles: '[NH4+].[Cl-]',
  },
  'Метанимин': {
    cid: 123139,
    formula: 'CH3N',
    condensed: 'CH2=NH',
    smiles: 'C=N',
  },
  'Хлорноватистая кислота': {
    cid: 24341,
    formula: 'HOCl',
    condensed: 'HOCl',
    smiles: 'OCl',
  },
  'Билиановая кислота': {
    formula: 'C24H34O8',
    smiles: 'OC(=O)CCC1(CC(=O)C2C3CCC(C(C)CCC(O)=O)C3(C)CC(=O)C2C1C)C(O)=O',
  },
  'Йод': {
    cid: 807,
    formula: 'I2',
    condensed: 'I2',
    smiles: 'II',
  },
  'Билианат натрия': {
    formula: 'C24H31Na3O8',
    smiles: '[Na+].[Na+].[Na+].[O-]C(=O)CCC1(CC(=O)C2C3CCC(C(C)CCC(=O)[O-])C3(C)CC(=O)C2C1C)C(=O)[O-]',
  },
  'Пентафторпропановая кислота': {
    cid: 62356,
    formula: 'C3HF5O2',
    condensed: 'CF3CF2COOH',
    smiles: 'C(=O)(C(C(F)(F)F)(F)F)O',
  },
  'Гептафторпропан': {
    cid: 67940,
    formula: 'C3HF7',
    condensed: '(CF3)2CFH',
    smiles: 'C(C(F)(F)F)(C(F)(F)F)F',
  },
  'Триоксид серы': {
    cid: 24682,
    formula: 'SO3',
    condensed: 'SO3',
    smiles: 'O=S(=O)=O',
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

// Reaction metadata
const reactionMeta = {
  'Окисление сульфоксилата натрия': {
    reactants: ['Синглетный кислород', 'Сульфоксилат натрия'],
    products: ['Формальдегид', 'Гидросульфат натрия'],
    equation: 'HOCH₂SO₂Na + O₂ → HCHO + NaHSO₄',
  },
  'Нейтрализация (NaOH + HCl)': {
    reactants: ['Гидроксид натрия', 'Соляная кислота'],
    products: ['Хлорид натрия', 'Вода'],
    equation: 'NaOH + HCl → NaCl + H₂O',
  },
  'Гидролиз мочевины': {
    reactants: ['Мочевина', 'Вода'],
    products: ['Углекислый газ', 'Аммиак', 'Аммиак'],
    equation: 'CO(NH₂)₂ + H₂O → CO₂ + 2NH₃',
  },
  'Синтез мочевины': {
    reactants: ['Углекислый газ', 'Аммиак', 'Аммиак'],
    products: ['Мочевина', 'Вода'],
    equation: 'CO₂ + 2NH₃ → CO(NH₂)₂ + H₂O',
  },
  'Горение формальдегида': {
    reactants: ['Формальдегид', 'Синглетный кислород'],
    products: ['Углекислый газ', 'Вода'],
    equation: 'CH₂O + O₂ → CO₂ + H₂O',
  },
  'Получение хлороводорода': {
    reactants: ['Хлорид натрия', 'Серная кислота'],
    products: ['Гидросульфат натрия', 'Соляная кислота'],
    equation: 'NaCl + H₂SO₄ → NaHSO₄ + HCl',
  },
  'Гидролиз трихлоризоциануровой кислоты': {
    reactants: ['Трихлоизоционуровая кислота', 'Вода', 'Вода', 'Вода'],
    products: ['Циануровая кислота', 'Хлорноватистая кислота', 'Хлорноватистая кислота', 'Хлорноватистая кислота'],
    equation: 'C₃Cl₃N₃O₃ + 3H₂O → C₃H₃N₃O₃ + 3HOCl',
  },
  'Поглощение CO₂ щёлочью': {
    reactants: ['Углекислый газ', 'Гидроксид натрия', 'Гидроксид натрия'],
    products: ['Карбонат натрия', 'Вода'],
    equation: 'CO₂ + 2NaOH → Na₂CO₃ + H₂O',
  },
  'Образование хлорида аммония': {
    reactants: ['Аммиак', 'Соляная кислота'],
    products: ['Хлорид аммония'],
    equation: 'NH₃ + HCl → NH₄Cl',
  },
  'Конденсация формальдегида с аммиаком': {
    reactants: ['Формальдегид', 'Аммиак'],
    products: ['Метанимин', 'Вода'],
    equation: 'HCHO + NH₃ → CH₂=NH + H₂O',
  },
  'Разложение Novec 1230 серной кислотой': {
    reactants: ['Сухая вода (Novec 1230)', 'Серная кислота'],
    products: ['Пентафторпропановая кислота', 'Гептафторпропан', 'Триоксид серы'],
    equation: 'C₆F₁₂O + H₂SO₄ → C₂F₅COOH + (CF₃)₂CFH + SO₃',
  },
  'Йодная проба каппа-каррагинана': {
    reactants: ['Каппа-каррагинан', 'Йод', 'Йод'],
    products: ['Каппа-каррагинан'],
    equation: 'κ-каррагинан + nI₂ → κ-каррагинан·nI₂ (комплекс)',
  },
  'Билиановая кислота + карбонат натрия': {
    reactants: ['Билиановая кислота', 'Билиановая кислота', 'Карбонат натрия', 'Карбонат натрия', 'Карбонат натрия'],
    products: ['Билианат натрия', 'Билианат натрия', 'Вода', 'Вода', 'Вода', 'Углекислый газ', 'Углекислый газ', 'Углекислый газ'],
    equation: '2C₂₄H₃₄O₈ + 3Na₂CO₃ → 2C₂₄H₃₁Na₃O₈ + 3H₂O + 3CO₂',
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
let spinEnabled = false;

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

const stopReactionAnimation = () => {
  if (reactionAnimState && reactionAnimState.animId) {
    cancelAnimationFrame(reactionAnimState.animId);
  }
  reactionAnimState = null;
  document.getElementById('reaction-controls').classList.add('hidden');
};

const loadMolecule = async (name, url) => {
  if (!viewer) return;

  stopReactionAnimation();
  currentViewMode = 'molecule';
  currentStyle = { stick: {} };
  document.getElementById('empty-state').style.display = 'none';
  // Reset labels after protein view
  const sfLabel = document.querySelector('#info-structural-formula-block .info-label');
  if (sfLabel) sfLabel.textContent = 'Структурная формула';
  document.querySelector('.info-formula .info-label').textContent = 'Брутто-формула';
  // Restore controls hidden during protein view
  document.getElementById('style-toggle').style.display = '';
  document.getElementById('label-toggle').style.display = '';
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
  if (spinEnabled) viewer.spin('y');
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
  const condensedBlock = document.getElementById('info-condensed-block');

  // Change label to "Описание"
  panel.querySelector('.info-formula .info-label').textContent = 'Описание';
  formulaEl.innerHTML = `<span style="font-size:14px">${meta.description}</span>`;

  // Hide condensed formula — not relevant for proteins
  condensedBlock.classList.add('hidden');

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

  stopReactionAnimation();
  currentViewMode = 'protein';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('current-molecule-name').textContent = name;
  document.getElementById('current-molecule-name').classList.add('glow');

  // Hide irrelevant controls for proteins
  document.getElementById('style-toggle').style.display = 'none';
  document.getElementById('label-toggle').style.display = 'none';

  try {
    const response = await fetch(`https://files.rcsb.org/download/${meta.pdbId}.pdb`);
    const data = await response.text();
    currentSdfText = data;
    currentMoleculeName = name;

    viewer.clear();
    viewer.addModel(data, 'pdb');
    viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    viewer.zoomTo();
    if (spinEnabled) viewer.spin('y');
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

// ── Reaction Animation System ──

// Map display name → SDF URL (built during setupMenu)
let moleculeUrlMap = {};

// Animation state
let reactionAnimState = null; // { reactantSdfs, productSdfs, playing, progress, animId, speed }

const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const computeCenterOfMass = (sdfText) => {
  const lines = sdfText.split('\n');
  const numAtoms = parseInt(lines[3].substring(0, 3));
  let cx = 0, cy = 0, cz = 0;
  for (let i = 4; i < 4 + numAtoms; i++) {
    cx += parseFloat(lines[i].substring(0, 10));
    cy += parseFloat(lines[i].substring(10, 20));
    cz += parseFloat(lines[i].substring(20, 30));
  }
  return { x: cx / numAtoms, y: cy / numAtoms, z: cz / numAtoms };
};

const shiftSdf = (sdfText, dx, dy, dz) => {
  const lines = sdfText.split('\n');
  const numAtoms = parseInt(lines[3].substring(0, 3));
  for (let i = 4; i < 4 + numAtoms; i++) {
    const x = parseFloat(lines[i].substring(0, 10)) + dx;
    const y = parseFloat(lines[i].substring(10, 20)) + dy;
    const z = parseFloat(lines[i].substring(20, 30)) + dz;
    lines[i] = x.toFixed(4).padStart(10) + y.toFixed(4).padStart(10) + z.toFixed(4).padStart(10) + lines[i].substring(30);
  }
  return lines.join('\n');
};

const centerSdf = (sdfText) => {
  const com = computeCenterOfMass(sdfText);
  return shiftSdf(sdfText, -com.x, -com.y, -com.z);
};

const renderReactionFrame = (progress) => {
  if (!viewer || !reactionAnimState) return;

  const { reactantSdfs, productSdfs } = reactionAnimState;
  const spread = 12;

  viewer.clear();

  if (progress <= 0.5) {
    // Reactants phase: approach each other (spread → 0)
    const t = easeInOutCubic(progress / 0.5);
    const distance = spread * (1 - t);
    reactantSdfs.forEach((sdf, i) => {
      const n = reactantSdfs.length;
      const xOffset = (i - (n - 1) / 2) * distance * 2;
      const shifted = shiftSdf(sdf, xOffset, 0, 0);
      viewer.addModel(shifted, 'sdf');
    });
  } else {
    // Products phase: separate from center (0 → spread)
    const t = easeInOutCubic((progress - 0.5) / 0.5);
    const distance = spread * t;
    productSdfs.forEach((sdf, i) => {
      const n = productSdfs.length;
      const xOffset = (i - (n - 1) / 2) * distance * 2;
      const shifted = shiftSdf(sdf, xOffset, 0, 0);
      viewer.addModel(shifted, 'sdf');
    });
  }

  if (labelsEnabled) {
    viewer.setStyle({}, { stick: { multipleBond: true, radius: 0.1 } });
    viewer.addPropertyLabels('elem', {}, {
      fontColor: 'white',
      backgroundColor: 'black',
      backgroundOpacity: 0.8,
      fontSize: 14,
      borderRadius: 4,
    });
  } else {
    viewer.setStyle({}, { stick: {} });
  }
  viewer.render();
};

const animationLoop = () => {
  if (!reactionAnimState || !reactionAnimState.playing) return;

  reactionAnimState.progress += reactionAnimState.speed;
  if (reactionAnimState.progress > 1) {
    reactionAnimState.progress = 0;
  }

  renderReactionFrame(reactionAnimState.progress);

  // Update timeline slider
  const slider = document.getElementById('reaction-timeline');
  slider.value = Math.round(reactionAnimState.progress * 1000);

  reactionAnimState.animId = requestAnimationFrame(animationLoop);
};

const toggleReactionPlayPause = () => {
  if (!reactionAnimState) return;
  reactionAnimState.playing = !reactionAnimState.playing;

  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');

  if (reactionAnimState.playing) {
    iconPlay.style.display = 'none';
    iconPause.style.display = '';
    reactionAnimState.animId = requestAnimationFrame(animationLoop);
  } else {
    iconPlay.style.display = '';
    iconPause.style.display = 'none';
    if (reactionAnimState.animId) {
      cancelAnimationFrame(reactionAnimState.animId);
    }
  }
};

const loadReaction = async (name, reaction) => {
  if (!viewer) return;

  // Stop any existing animation
  if (reactionAnimState && reactionAnimState.animId) {
    cancelAnimationFrame(reactionAnimState.animId);
  }

  currentViewMode = 'reaction';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('current-molecule-name').textContent = name;
  document.getElementById('current-molecule-name').classList.add('glow');

  // Hide molecule info, show reaction controls
  document.getElementById('molecule-info').classList.add('hidden');
  const controls = document.getElementById('reaction-controls');
  controls.classList.remove('hidden');
  document.getElementById('reaction-equation').textContent = reaction.equation;

  // Reset play/pause icons
  document.getElementById('icon-play').style.display = 'none';
  document.getElementById('icon-pause').style.display = '';

  // Fetch all SDFs
  const fetchSdf = async (moleculeName) => {
    const url = moleculeUrlMap[moleculeName];
    if (!url) throw new Error(`SDF not found for: ${moleculeName}`);
    const resp = await fetch(url);
    const text = await resp.text();
    return centerSdf(text);
  };

  try {
    const reactantSdfs = await Promise.all(reaction.reactants.map(fetchSdf));
    const productSdfs = await Promise.all(reaction.products.map(fetchSdf));

    reactionAnimState = {
      reactantSdfs,
      productSdfs,
      playing: true,
      progress: 0,
      animId: null,
      speed: 0.003,
    };

    // Initial render and zoom
    renderReactionFrame(0);
    viewer.zoomTo();
    viewer.zoom(0.7);
    viewer.render();

    // Start animation
    reactionAnimState.animId = requestAnimationFrame(animationLoop);
  } catch (err) {
    console.error('Failed to load reaction:', err);
    document.getElementById('current-molecule-name').textContent = 'Error loading reaction';
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

    // Build name→URL map for reaction system
    moleculeUrlMap[filename] = url;

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

  // Reaction list
  const reactionList = document.getElementById('reaction-list');
  for (const [name, reaction] of Object.entries(reactionMeta)) {
    const li = document.createElement('li');
    li.className = 'molecule-item';

    const nameEl = document.createElement('span');
    nameEl.className = 'molecule-item-name';
    nameEl.textContent = name;
    li.appendChild(nameEl);

    const eqEl = document.createElement('span');
    eqEl.className = 'molecule-item-formula';
    eqEl.textContent = reaction.equation;
    li.appendChild(eqEl);

    li.addEventListener('click', () => {
      document.querySelectorAll('.molecule-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      loadReaction(name, reaction);
    });

    reactionList.appendChild(li);
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
    if (!viewer) return;
    const btn = document.getElementById('ar-export');
    btn.disabled = true;
    try {
      const { generateUSDZFromScene } = await import('./utils/sdfToUsdz.js');
      const arraybuffer = await generateUSDZFromScene(viewer);
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

  // Spin toggle
  document.getElementById('spin-toggle').addEventListener('click', (e) => {
    if (!viewer) return;
    spinEnabled = !spinEnabled;
    const btn = e.currentTarget;
    if (spinEnabled) {
      viewer.spin('y');
      btn.style.color = '#fff';
      btn.style.borderColor = 'rgba(99, 102, 241, 0.8)';
      btn.style.background = 'rgba(99, 102, 241, 0.2)';
    } else {
      viewer.spin(false);
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.background = '';
    }
  });

  // Reaction controls
  document.getElementById('reaction-play-pause').addEventListener('click', toggleReactionPlayPause);

  document.getElementById('reaction-timeline').addEventListener('input', (e) => {
    if (!reactionAnimState) return;
    reactionAnimState.progress = parseInt(e.target.value) / 1000;
    renderReactionFrame(reactionAnimState.progress);
  });
};

const setupTabs = () => {
  const tabs = document.querySelectorAll('.sidebar-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initViewer();
  setupMenu();
  setupControls();
  setupTabs();
});
