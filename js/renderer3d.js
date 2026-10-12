/**
 * renderer3d.js - Interactive 3D WebGL / Three.js Event Display for IceCube
 * The Thinking Experiment Design System: Light Mode Only (Teal, Amber, White)
 * Authored for Vladimir Lopez · 2026
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

  // IceCube nanosecond time rainbow color mapping
  // 0.0: Earliest (Red) -> Orange -> Yellow -> Green -> Cyan -> 1.0: Latest (Blue)
  function getIceCubeTimeColor(normalizedT) {
    const t = Math.max(0, Math.min(1, normalizedT));
    if (t < 0.2) {
      const u = t / 0.2;
      return new THREE.Color(1.0, 0.45 * u, 0.0);
    } else if (t < 0.4) {
      const u = (t - 0.2) / 0.2;
      return new THREE.Color(1.0, 0.45 + 0.55 * u, 0.0);
    } else if (t < 0.6) {
      const u = (t - 0.4) / 0.2;
      return new THREE.Color(1.0 - u, 0.95, 0.2 * u);
    } else if (t < 0.8) {
      const u = (t - 0.6) / 0.2;
      return new THREE.Color(0.0, 0.95 - 0.15 * u, 0.2 + 0.8 * u);
    } else {
      const u = (t - 0.8) / 0.2;
      return new THREE.Color(0.0, 0.8 * (1.0 - u * 0.7), 1.0);
    }
  }

  // Light-mode inactive DOM colors (soft glacial slate)
  const defaultDomColor = new THREE.Color(0.55, 0.68, 0.75);
  const deepCoreInactiveColor = new THREE.Color(0.35, 0.52, 0.62);

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
    const height = container.clientHeight || 520;

    // Light-mode Glacial Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f6f9); // Crisp Antarctic glacial tint
    scene.fog = new THREE.FogExp2(0xf0f6f9, 0.00035);

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 10, 8000);
    camera.position.set(1100, -1300, 700);
    camera.up.set(0, 0, 1); // z is vertical

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxDistance = 5000;
      controls.minDistance = 80;
      controls.target.set(0, 0, 0); // Center of detector volume
    }

    // Light-mode ambient and sun highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff6ea, 0.75);
    dirLight.position.set(600, -1000, 1200);
    scene.add(dirLight);

    // Static Detector Geometry (Strings, DOMs, Stratigraphy)
    buildDetectorStructure();

    // Event visuals group (tracks, vertex markers, Cherenkov cones)
    eventVisualsGroup = new THREE.Group();
    scene.add(eventVisualsGroup);

    // Window resize handler
    window.removeEventListener('resize', onWindowResize);
    window.addEventListener('resize', onWindowResize);

    isInitialized = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
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

    // 1. Strings as thin vertical line segments in Teal
    stringLinesGroup = new THREE.Group();
    const lineMatStandard = new THREE.LineBasicMaterial({
      color: 0x0f7e9b,
      transparent: true,
      opacity: 0.35
    });
    const lineMatDeepCore = new THREE.LineBasicMaterial({
      color: 0x095f76,
      transparent: true,
      opacity: 0.65
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

    // 2. Volcanic Dust Layer (Depth 2000m - 2100m => z ~ -50m to -150m) in soft warm amber
    const dustGeometry = new THREE.CylinderGeometry(620, 620, 100, 32);
    dustGeometry.rotateX(Math.PI / 2);
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0xd67b19,
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
      roughness: 0.35,
      metalness: 0.15
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

    // 4. Ice Boundary grids (Top 1,450m depth & Bottom 2,450m depth)
    const gridTop = new THREE.GridHelper(1200, 12, 0x0f7e9b, 0xc8dbe3);
    gridTop.rotation.x = Math.PI / 2;
    gridTop.position.z = 515;
    scene.add(gridTop);

    const gridBottom = new THREE.GridHelper(1200, 12, 0x0f7e9b, 0xc8dbe3);
    gridBottom.rotation.x = Math.PI / 2;
    gridBottom.position.z = -515;
    scene.add(gridBottom);
  }

  /**
   * Update DOM rendering states based on simulation hits and current scrubbed time
   */
  function updateHitsDisplay(currentTimeNs = Infinity, maxTimeSpanNs = 3000) {
    if (!domInstancedMesh) return;

    const { allDOMs } = Detector;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < allDOMs.length; i++) {
      const dom = allDOMs[i];

      if (dom.isHit && dom.hitTimeNs <= currentTimeNs) {
        // Proportional sizing based on detected charge (PE)
        const chargeScale = Math.min(6.5, 1.2 + 0.8 * Math.log10(Math.max(1, dom.chargePE)));
        dummy.position.set(dom.x, dom.y, dom.z);
        dummy.scale.set(chargeScale, chargeScale, chargeScale);
        dummy.updateMatrix();
        domInstancedMesh.setMatrixAt(i, dummy.matrix);

        // Chromatic rainbow timing color (Red = earliest, Blue = latest)
        const normT = maxTimeSpanNs > 0 ? Math.min(1.0, dom.hitTimeNs / maxTimeSpanNs) : 0;
        const hitColor = getIceCubeTimeColor(normT);
        domInstancedMesh.setColorAt(i, hitColor);
      } else {
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

    while (eventVisualsGroup.children.length > 0) {
      const obj = eventVisualsGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      eventVisualsGroup.remove(obj);
    }

    if (!event) return;

    const vertex = new THREE.Vector3(event.vertex.x, event.vertex.y, event.vertex.z);

    // 1. Vertex marker (Amber point for neutrino interaction point)
    const vertexGeom = new THREE.SphereGeometry(15, 16, 16);
    const vertexMat = new THREE.MeshBasicMaterial({ color: 0xd67b19 });
    const vertexMesh = new THREE.Mesh(vertexGeom, vertexMat);
    vertexMesh.position.copy(vertex);
    eventVisualsGroup.add(vertexMesh);

    // 2. Incoming neutrino trajectory (dashed Amber line arriving at vertex)
    const incomingDir = new THREE.Vector3(event.direction.x, event.direction.y, event.direction.z).normalize();
    const startPoint = vertex.clone().sub(incomingDir.clone().multiplyScalar(900));
    const incomingGeom = new THREE.BufferGeometry().setFromPoints([startPoint, vertex]);
    const incomingMat = new THREE.LineDashedMaterial({
      color: 0xd67b19,
      dashSize: 28,
      gapSize: 18
    });
    const incomingLine = new THREE.Line(incomingGeom, incomingMat);
    incomingLine.computeLineDistances();
    eventVisualsGroup.add(incomingLine);

    // 3. Outgoing lepton trajectory (for tracks) in crisp Teal
    if (event.type === 'track') {
      const trackLen = event.lengthM || 1800;
      const endPoint = vertex.clone().add(incomingDir.clone().multiplyScalar(trackLen));
      const trackGeom = new THREE.BufferGeometry().setFromPoints([vertex, endPoint]);
      const trackMat = new THREE.LineBasicMaterial({
        color: 0x095f76,
        linewidth: 3
      });
      const trackLine = new THREE.Line(trackGeom, trackMat);
      eventVisualsGroup.add(trackLine);
    } else if (event.type === 'double_bang') {
      const tauM = (event.energyTeV / 1000) * 50;
      const endPoint = vertex.clone().add(incomingDir.clone().multiplyScalar(tauM));
      // Second bang marker
      const bang2Geom = new THREE.SphereGeometry(15, 16, 16);
      const bang2Mat = new THREE.MeshBasicMaterial({ color: 0x0f7e9b });
      const bang2Mesh = new THREE.Mesh(bang2Geom, bang2Mat);
      bang2Mesh.position.copy(endPoint);
      eventVisualsGroup.add(bang2Mesh);

      // Track connecting the two bangs
      const trackGeom = new THREE.BufferGeometry().setFromPoints([vertex, endPoint]);
      const trackMat = new THREE.LineBasicMaterial({ color: 0x0f7e9b, linewidth: 2 });
      eventVisualsGroup.add(new THREE.Line(trackGeom, trackMat));
    }
  }

  /**
   * Camera Viewport Presets
   */
  function setCameraPreset(presetName) {
    if (!camera || !controls) return;

    if (presetName === 'overview') {
      camera.position.set(1100, -1300, 700);
      controls.target.set(0, 0, 0);
    } else if (presetName === 'topdown') {
      camera.position.set(0, 0, 2200);
      controls.target.set(0, 0, 0);
    } else if (presetName === 'elevation') {
      camera.position.set(1900, 0, 0);
      controls.target.set(0, 0, 0);
    } else if (presetName === 'deepcore') {
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
    canvas.height = containerElement.clientHeight || 520;
    containerElement.innerHTML = "";
    containerElement.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f7e9b';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('IceCube 2D Orthographic Display Mode (WebGL Fallback)', 20, 35);
  }

  return {
    init,
    updateHitsDisplay,
    setEventGeometry,
    setCameraPreset,
    getIceCubeTimeColor
  };
})();

if (typeof window !== 'undefined') {
  window.Renderer3D = Renderer3D;
}
