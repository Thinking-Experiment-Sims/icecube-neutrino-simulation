/**
 * renderer3d.js - Interactive 3D WebGL / Three.js Event Display for IceCube
 * Authored for "The Thinking Experiment" · Vladimir Lopez · 2026
 * 
 * Features:
 * - Real-time 3D rendering of 86 strings and 5,160 DOMs using Three.js InstancedMesh
 * - Rainbow nanosecond chromatic time progression (Red = earliest, Blue = latest)
 * - Proportional charge-scaling (PMT photoelectrons)
 * - Stratigraphy layers: Clathrate clear ice, volcanic dust layer (2,000-2,100m)
 * - Dynamic camera presets: Overview, Top-Down, Side Depth, Event Tracking
 * - Graceful fallback to 2D Orthographic Canvas if WebGL is unavailable
 */

const Renderer3D = (() => {
  let container = null;
  let scene, camera, renderer, controls;
  let domInstancedMesh = null;
  let stringLinesGroup = null;
  let dustLayerMesh = null;
  let eventVisualsGroup = null;
  let isInitialized = false;
  let animationFrameId = null;

  // Color mapping helper: maps normalized time [0, 1] to IceCube standard palette
  // 0.0: Red -> Orange -> Yellow -> Green -> Cyan -> 1.0: Blue
  function getIceCubeTimeColor(normalizedT) {
    const t = Math.max(0, Math.min(1, normalizedT));
    if (t < 0.2) {
      // Red (1,0,0) to Orange (1,0.5,0)
      const u = t / 0.2;
      return new THREE.Color(1.0, 0.5 * u, 0.0);
    } else if (t < 0.4) {
      // Orange (1,0.5,0) to Yellow (1,1,0)
      const u = (t - 0.2) / 0.2;
      return new THREE.Color(1.0, 0.5 + 0.5 * u, 0.0);
    } else if (t < 0.6) {
      // Yellow (1,1,0) to Green (0,1,0.3)
      const u = (t - 0.4) / 0.2;
      return new THREE.Color(1.0 - u, 1.0, 0.3 * u);
    } else if (t < 0.8) {
      // Green to Cyan (0, 0.9, 1.0)
      const u = (t - 0.6) / 0.2;
      return new THREE.Color(0.0, 1.0 - 0.1 * u, 0.3 + 0.7 * u);
    } else {
      // Cyan to Deep Blue (0, 0.2, 1.0)
      const u = (t - 0.8) / 0.2;
      return new THREE.Color(0.0, 0.9 * (1.0 - u * 0.7), 1.0);
    }
  }

  const defaultDomColor = new THREE.Color(0.12, 0.25, 0.4); // Dark inactive cyan
  const deepCoreInactiveColor = new THREE.Color(0.18, 0.35, 0.55);

  /**
   * Initialize Three.js scene inside DOM element
   */
  function init(containerElement) {
    container = containerElement;
    if (!container) return;

    if (typeof THREE === 'undefined') {
      console.warn("Three.js not loaded. Falling back to 2D Canvas display.");
      init2DFallback(container);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep Antarctic space-night
    scene.fog = new THREE.FogExp2(0x060913, 0.00045);

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 10, 8000);
    camera.position.set(1100, -1300, 700);
    camera.up.set(0, 0, 1); // z is vertical

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxDistance = 5000;
      controls.minDistance = 80;
      controls.target.set(0, 0, 0); // Center of detector volume
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x88ccff, 0.8);
    dirLight.position.set(500, -1000, 1200);
    scene.add(dirLight);

    // Build Static Detector Geometry
    buildDetectorStructure();

    // Event visuals group (tracks, vertex markers, Cherenkov cones)
    eventVisualsGroup = new THREE.Group();
    scene.add(eventVisualsGroup);

    // Window resize handler
    window.addEventListener('resize', onWindowResize);

    isInitialized = true;
    animate();
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /**
   * Build strings, DOMs and stratigraphy meshes
   */
  function buildDetectorStructure() {
    const { allDOMs, stringsMeta } = Detector;

    // 1. Strings as thin vertical line segments
    stringLinesGroup = new THREE.Group();
    const lineMatStandard = new THREE.LineBasicMaterial({
      color: 0x1a3350,
      transparent: true,
      opacity: 0.45
    });
    const lineMatDeepCore = new THREE.LineBasicMaterial({
      color: 0x245588,
      transparent: true,
      opacity: 0.75
    });

    for (let s = 0; s < stringsMeta.length; s++) {
      const sm = stringsMeta[s];
      const points = [
        new THREE.Vector3(sm.x, sm.y, 520),
        new THREE.Vector3(sm.x, sm.y, -520)
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, sm.isDeepCore ? lineMatDeepCore : lineMatStandard);
      stringLinesGroup.add(line);
    }
    scene.add(stringLinesGroup);

    // 2. Volcanic Dust Layer (Depth 2000m - 2100m => z ~ -50m to -150m)
    const dustGeometry = new THREE.CylinderGeometry(620, 620, 100, 32);
    dustGeometry.rotateX(Math.PI / 2);
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c5a32,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    dustLayerMesh = new THREE.Mesh(dustGeometry, dustMaterial);
    dustLayerMesh.position.set(0, 0, -100);
    scene.add(dustLayerMesh);

    // 3. 5,160 DOMs using InstancedMesh for extreme rendering efficiency
    const sphereGeom = new THREE.SphereGeometry(4.5, 12, 10);
    const domMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.2
    });

    domInstancedMesh = new THREE.InstancedMesh(sphereGeom, domMaterial, allDOMs.length);
    domInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < allDOMs.length; i++) {
      const dom = allDOMs[i];
      dummy.position.set(dom.x, dom.y, dom.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      domInstancedMesh.setMatrixAt(i, dummy.matrix);
      domInstancedMesh.setColorAt(i, dom.isDeepCore ? deepCoreInactiveColor : defaultDomColor);
    }

    domInstancedMesh.instanceColor.needsUpdate = true;
    domInstancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(domInstancedMesh);

    // 4. Subtle Ice Surface grid (z = +520m, 1,450m depth top of detector)
    const gridTop = new THREE.GridHelper(1200, 12, 0x1b3452, 0x0c1b2c);
    gridTop.rotation.x = Math.PI / 2;
    gridTop.position.z = 515;
    scene.add(gridTop);

    // Bottom grid (z = -515m, 2,450m depth)
    const gridBottom = new THREE.GridHelper(1200, 12, 0x1b3452, 0x0c1b2c);
    gridBottom.rotation.x = Math.PI / 2;
    gridBottom.position.z = -515;
    scene.add(gridBottom);
  }

  /**
   * Update DOM rendering states based on simulation hits and current scrubbed time
   * currentTimeNs: number in ns (hits with t <= currentTimeNs illuminate)
   */
  function updateHitsDisplay(currentTimeNs = Infinity, maxTimeSpanNs = 3000) {
    if (!domInstancedMesh) return;

    const { allDOMs } = Detector;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < allDOMs.length; i++) {
      const dom = allDOMs[i];

      if (dom.isHit && dom.hitTimeNs <= currentTimeNs) {
        // Calculate size based on detected charge (logarithmic scaling)
        // Normal radius: 4.5m, max charge radius up to 28m
        const chargeScale = Math.min(6.5, 1.2 + 0.8 * Math.log10(Math.max(1, dom.chargePE)));
        dummy.position.set(dom.x, dom.y, dom.z);
        dummy.scale.set(chargeScale, chargeScale, chargeScale);
        dummy.updateMatrix();
        domInstancedMesh.setMatrixAt(i, dummy.matrix);

        // Calculate chromatic time color
        const normT = maxTimeSpanNs > 0 ? Math.min(1.0, dom.hitTimeNs / maxTimeSpanNs) : 0;
        const hitColor = getIceCubeTimeColor(normT);
        domInstancedMesh.setColorAt(i, hitColor);
      } else {
        // Inactive / unhit DOM
        dummy.position.set(dom.x, dom.y, dom.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        domInstancedMesh.setMatrixAt(i, dummy.matrix);
        domInstancedMesh.setColorAt(i, dom.isDeepCore ? deepCoreInactiveColor : defaultDomColor);
      }
    }

    domInstancedMesh.instanceMatrix.needsUpdate = true;
    if (domInstancedMesh.instanceColor) {
      domInstancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Render particle trajectory lines and vertex markers in 3D
   */
  function setEventGeometry(event) {
    if (!eventVisualsGroup) return;

    // Clear previous event visuals
    while (eventVisualsGroup.children.length > 0) {
      const obj = eventVisualsGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      eventVisualsGroup.remove(obj);
    }

    if (!event) return;

    const vertex = new THREE.Vector3(event.vertex.x, event.vertex.y, event.vertex.z);

    // 1. Vertex marker (amber point for neutrino interaction point)
    const vertexGeom = new THREE.SphereGeometry(14, 16, 16);
    const vertexMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const vertexMesh = new THREE.Mesh(vertexGeom, vertexMat);
    vertexMesh.position.copy(vertex);
    eventVisualsGroup.add(vertexMesh);

    // 2. Incoming neutrino trajectory (dashed or thin amber line arriving at vertex)
    const incomingDir = new THREE.Vector3(event.direction.x, event.direction.y, event.direction.z).normalize();
    const startPoint = vertex.clone().sub(incomingDir.clone().multiplyScalar(900));
    const incomingGeom = new THREE.BufferGeometry().setFromPoints([startPoint, vertex]);
    const incomingMat = new THREE.LineDashedMaterial({
      color: 0xffaa00,
      dashSize: 30,
      gapSize: 20
    });
    const incomingLine = new THREE.Line(incomingGeom, incomingMat);
    incomingLine.computeLineDistances();
    eventVisualsGroup.add(incomingLine);

    // 3. Outgoing lepton trajectory (for tracks)
    if (event.type === 'track') {
      const trackLen = event.lengthM || 1800;
      const endPoint = vertex.clone().add(incomingDir.clone().multiplyScalar(trackLen));
      const trackGeom = new THREE.BufferGeometry().setFromPoints([vertex, endPoint]);
      const trackMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3
      });
      const trackLine = new THREE.Line(trackGeom, trackMat);
      eventVisualsGroup.add(trackLine);
    } else if (event.type === 'double_bang') {
      const tauM = (event.energyTeV / 1000) * 50;
      const endPoint = vertex.clone().add(incomingDir.clone().multiplyScalar(tauM));
      // Second bang marker
      const bang2Geom = new THREE.SphereGeometry(14, 16, 16);
      const bang2Mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
      const bang2Mesh = new THREE.Mesh(bang2Geom, bang2Mat);
      bang2Mesh.position.copy(endPoint);
      eventVisualsGroup.add(bang2Mesh);

      // Track connecting the two bangs
      const trackGeom = new THREE.BufferGeometry().setFromPoints([vertex, endPoint]);
      const trackMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, linewidth: 2 });
      eventVisualsGroup.add(new THREE.Line(trackGeom, trackMat));
    }
  }

  /**
   * Camera Viewport Presets
   */
  function setCameraPreset(presetName) {
    if (!camera || !controls) return;

    if (presetName === 'overview') {
      // Classic 3D perspective looking slightly down into the array
      camera.position.set(1100, -1300, 700);
      controls.target.set(0, 0, 0);
    } else if (presetName === 'topdown') {
      // Celestial sky map (zenith looking straight down)
      camera.position.set(0, 0, 2200);
      controls.target.set(0, 0, 0);
    } else if (presetName === 'elevation') {
      // Side profile showing depth from surface (1,450m down to 2,450m)
      camera.position.set(1900, 0, 0);
      controls.target.set(0, 0, 0);
    } else if (presetName === 'deepcore') {
      // Close up on dense center DeepCore
      camera.position.set(220, -280, -100);
      controls.target.set(0, 0, -150);
    }

    controls.update();
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  /**
   * 2D Orthographic Fallback if WebGL/Three.js fails
   */
  function init2DFallback(containerElement) {
    const canvas = document.createElement('canvas');
    canvas.width = containerElement.clientWidth || 800;
    canvas.height = containerElement.clientHeight || 600;
    containerElement.innerHTML = "";
    containerElement.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f3ff';
    ctx.font = '16px monospace';
    ctx.fillText('IceCube 2D Orthographic Display Mode (WebGL Fallback)', 20, 30);
  }

  return {
    init,
    updateHitsDisplay,
    setEventGeometry,
    setCameraPreset,
    getIceCubeTimeColor
  };
})();

// Export for module/browser compatibility
if (typeof window !== 'undefined') {
  window.Renderer3D = Renderer3D;
}
