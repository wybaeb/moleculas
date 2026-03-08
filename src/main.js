import './style.css';

// Dynamically import all .sdf files
// This returns a mapping of path to a function that fetches the module
const moleculePaths = import.meta.glob('./molecules/*.sdf', { query: '?url', import: 'default', eager: true });

// State
let viewer = null;
let currentStyle = { stick: {} }; // Default style
let labelsEnabled = false;

const initViewer = () => {
  const container = document.getElementById('viewer-3d');

  // Create 3Dmol viewer
  viewer = $3Dmol.createViewer(container, {
    backgroundColor: '#0a0a0f',
  });
};

const loadMolecule = async (name, url) => {
  if (!viewer) return;

  // Update UI
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('current-molecule-name').textContent = name;
  document.getElementById('current-molecule-name').classList.add('glow');

  const response = await fetch(url);
  const data = await response.text();

  viewer.clear();
  viewer.addModel(data, "sdf");
  viewer.setStyle({}, currentStyle);
  if (labelsEnabled) {
    viewer.addPropertyLabels("elem", {}, {
      fontColor: 'white',
      backgroundColor: 'black',
      backgroundOpacity: 0.8,
      fontSize: 14,
      borderRadius: 4
    });
  } else {
    viewer.removeAllLabels();
  }
  viewer.zoomTo();
  viewer.render();

  // remove animation class so it can be re-triggered
  setTimeout(() => {
    document.getElementById('current-molecule-name').classList.remove('glow');
  }, 1000);
};

const setupMenu = () => {
  const list = document.getElementById('molecule-list');
  let firstItem = null;

  for (const [path, url] of Object.entries(moleculePaths)) {
    // Extract filename without extension
    const parts = path.split('/');
    let filename = parts[parts.length - 1];
    filename = filename.replace('.sdf', '').replace(/_/g, ' ');

    const li = document.createElement('li');
    li.textContent = filename;
    li.className = 'molecule-item';

    li.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.molecule-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      loadMolecule(filename, url);
    });

    list.appendChild(li);

    if (!firstItem) {
      firstItem = { element: li, name: filename, url: url };
    }
  }

  // Load first molecule by default
  if (firstItem) {
    firstItem.element.classList.add('active');
    loadMolecule(firstItem.name, firstItem.url);
  } else {
    document.getElementById('current-molecule-name').textContent = "No molecules found";
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

    // Toggle between stick and sphere
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

  document.getElementById('label-toggle').addEventListener('click', (e) => {
    if (!viewer) return;

    labelsEnabled = !labelsEnabled;
    const btn = e.currentTarget;

    if (labelsEnabled) {
      if (currentStyle.stick) {
        currentStyle = { stick: { multipleBond: true, radius: 0.1 } };
      }
      viewer.setStyle({}, currentStyle);

      viewer.addPropertyLabels("elem", {}, {
        fontColor: 'white',
        backgroundColor: 'black',
        backgroundOpacity: 0.8,
        fontSize: 14,
        borderRadius: 4
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
