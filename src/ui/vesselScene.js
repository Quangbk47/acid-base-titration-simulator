import * as THREE from '../../assets/vendor/three/three.module.js';
import { OrbitControls } from '../../assets/vendor/three/OrbitControls.js';
import { RoomEnvironment } from '../../assets/vendor/three/RoomEnvironment.js';
import { buildVesselModel, flaskFillHeight, flaskRadiusAt, FLASK_BOTTOM } from './vesselModel.js';

export function createVesselScene({ viewport, onError = () => {} }) {
  const compact = matchMedia('(max-width: 767px)').matches;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const segments = compact ? 32 : 48;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#edf4f2');
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  const home = new THREE.Vector3(6.3, 4.3, 8.5);
  const target = new THREE.Vector3(0, 2.7, 0);
  camera.position.copy(home);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch (error) {
    onError(error);
    return { failed: true, update() {}, setVisible() {}, resetCamera() {}, dispose() {} };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Bàn thí nghiệm 3D. Kéo chuột hoặc chạm để xoay; cuộn hoặc chụm để zoom.');
  viewport.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.cursor.copy(target);
  controls.maxTargetRadius = 2;
  controls.minDistance = 4;
  controls.maxDistance = 17;
  controls.enableDamping = !motion.matches;
  controls.dampingFactor = 0.1;
  controls.minPolarAngle = 0.02;
  controls.maxPolarAngle = Math.PI - 0.02;
  controls.listenToKeyEvents(renderer.domElement);
  controls.update();
  controls.saveState();

  // Locally generated studio reflections: no HDR texture or CDN requests.
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#ffffff', '#a6bdb8', 0.65));
  const key = new THREE.DirectionalLight('#fff5e6', 2.4);
  key.position.set(3, 7, 4);
  key.castShadow = !compact;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = 0.04;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#d9f5ff', 0.8);
  fill.position.set(-4, 3, -3);
  scene.add(fill);

  const metal = new THREE.MeshStandardMaterial({ color: '#a9bfbd', metalness: 0.86, roughness: 0.24 });
  const dark = new THREE.MeshStandardMaterial({ color: '#254a4b', metalness: 0.45, roughness: 0.3 });
  const ceramic = new THREE.MeshStandardMaterial({ color: '#f7faf8', roughness: 0.32, metalness: 0.08 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#bce0dc', transmission: 0.9, thickness: 0.05, roughness: 0.08, ior: 1.46, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.3 });
  const glassRim = new THREE.MeshPhysicalMaterial({ color: '#79a7a8', transmission: 0.55, thickness: 0.06, roughness: 0.1, ior: 1.46, transparent: true, opacity: 0.85 });
  const buretLiquidMaterial = new THREE.MeshPhysicalMaterial({ color: '#a7cdd0', roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const solutionMaterial = new THREE.MeshPhysicalMaterial({ color: '#a7cdd0', roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.07 });
  const mesh = (geometry, material, x, y, z = 0) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = material !== glass && material !== glassRim;
    object.receiveShadow = material !== glass;
    scene.add(object);
    return object;
  };
  const cylinder = (radius, height, material, x, y, z = 0) => mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material, x, y, z);
  const ring = (radius, thickness, x, y, z = 0, material = glassRim) => {
    const object = mesh(new THREE.TorusGeometry(radius, thickness, 8, segments), material, x, y, z);
    object.rotation.x = Math.PI / 2;
    return object;
  };
  const lathe = (profile, material, x = 0.35) => mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments), material, x, 0);

  // Bench, weighted stand, steel rod and two clamps.
  const bench = mesh(new THREE.CylinderGeometry(2.2, 2.25, 0.12, 64), ceramic, 0, 0.02);
  bench.receiveShadow = true;
  mesh(new THREE.BoxGeometry(1.28, 0.13, 0.85), dark, -0.92, 0.14, -0.36);
  cylinder(0.048, 5.3, metal, -0.94, 2.83, -0.4);
  cylinder(0.072, 0.12, dark, -0.94, 5.49, -0.4);
  for (const y of [3.25, 4.85]) {
    const arm = cylinder(0.035, 1.35, metal, -0.3, y, -0.36);
    arm.rotation.z = Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.14, 0.18, 0.15), dark, -0.94, y, -0.4);
    const clamp = ring(0.19, 0.024, 0.35, y, 0, dark);
    clamp.rotation.x = 0;
    cylinder(0.065, 0.15, dark, -0.94, y, -0.52).rotation.x = Math.PI / 2;
  }

  // Buret has an open hollow lip, glass shoulder, stopcock and fine outlet.
  lathe([[0.075, 2.55], [0.075, 2.8], [0.15, 2.88], [0.15, 5.4], [0.17, 5.44], [0.125, 5.44], [0.125, 2.91], [0.054, 2.78], [0.054, 2.55]], glass);
  ring(0.147, 0.025, 0.35, 5.43);
  lathe([[0.02, 2.05], [0.037, 2.12], [0.06, 2.54], [0.044, 2.54], [0.02, 2.12]], glassRim);
  const stopcock = new THREE.Group();
  stopcock.position.set(0.35, 2.58, 0);
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 24), ceramic);
  plug.rotation.z = Math.PI / 2;
  stopcock.add(plug);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.065, 0.065), dark);
  handle.position.z = 0.23;
  stopcock.add(handle);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.27, 20), dark);
  knob.rotation.x = Math.PI / 2;
  knob.position.z = 0.1;
  stopcock.add(knob);
  scene.add(stopcock);
  const buretLiquid = cylinder(0.115, 1, buretLiquidMaterial, 0.35, 4);
  const meniscus = cylinder(0.116, 0.012, buretLiquidMaterial, 0.35, 5.3);

  // Fine graduations wrap the front of the tube and remain visible in glass.
  const ticks = [];
  for (let i = 0; i <= 50; i += 1) {
    const y = 5.3 - i * 2.3 / 50;
    const length = i % 10 === 0 ? 0.17 : i % 5 === 0 ? 0.12 : 0.07;
    ticks.push(0.35 - length / 2, y, 0.155, 0.35 + length / 2, y, 0.155);
  }
  const tickGeometry = new THREE.BufferGeometry();
  tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3));
  scene.add(new THREE.LineSegments(tickGeometry, new THREE.LineBasicMaterial({ color: '#527979', transparent: true, opacity: 0.8 })));
  const textLabel = (text, x, y, z, width = 0.45) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const context = canvas.getContext('2d');
    const paint = (value) => {
      context.clearRect(0, 0, 256, 96);
      context.font = '600 42px sans-serif';
      context.fillStyle = '#355b5b';
      context.textAlign = 'center';
      context.fillText(value, 128, 63);
    };
    paint(text);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
    sprite.position.set(x, y, z);
    sprite.scale.set(width, width * 96 / 256, 1);
    scene.add(sprite);
    let lastText = text;
    return (value) => {
      if (lastText === value) return;
      lastText = value;
      paint(value);
      texture.needsUpdate = true;
    };
  };
  const graduationLabels = [];
  for (let i = 0; i <= 50; i += 10) graduationLabels.push(textLabel(String(i), 0.68, 5.3 - i * 2.3 / 50, 0.16, 0.23));
  textLabel('NaOH', 0.35, 5.68, 0, 0.68);
  const buretCapacityLabel = textLabel('50 mL', 0.35, 5.55, 0, 0.42);

  // Closed base and open neck: a real hollow Erlenmeyer silhouette.
  lathe([[0, 0.13], [0.53, 0.13], [0.66, 0.16], [0.72, 0.23], [0.7, 0.35], [0.26, 1.28], [0.23, 1.38], [0.23, 1.73], [0.26, 1.75], [0.19, 1.75], [0.19, 1.39], [0.22, 1.3], [0.65, 0.34], [0.66, 0.24], [0.55, 0.19], [0, 0.19]], glass);
  ring(0.225, 0.026, 0.35, 1.75);
  ring(0.64, 0.018, 0.35, 0.2);
  const flaskCapacityLabel = textLabel('250 mL', 0.35, 0.87, 0.53, 0.5);
  const flaskLiquid = mesh(new THREE.CylinderGeometry(1, 1, 1, segments), solutionMaterial, 0.35, 0.3);
  const liquidSurface = cylinder(0.5, 0.012, solutionMaterial, 0.35, 0.4);
  const rippleMaterial = new THREE.MeshBasicMaterial({ color: '#fa92bf', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const ripple = ring(0.2, 0.008, 0.35, 0.4, 0, rippleMaterial);
  const dropMaterial = new THREE.MeshPhysicalMaterial({ color: '#b5e8ed', roughness: 0.08, clearcoat: 1 });
  const drops = Array.from({ length: 6 }, () => {
    const drop = mesh(new THREE.SphereGeometry(0.04, 12, 8), dropMaterial, 0.35, 2.05);
    drop.scale.y = 1.6;
    drop.visible = false;
    return { mesh: drop, age: 0, active: false };
  });

  let model = buildVesselModel(null);
  let visible = false;
  let disposed = false;
  let failed = false;
  let frame = null;
  let previousTime = null;
  let splashAge = 1;
  let liquidHeight = 0;
  const clearEffects = () => {
    for (const drop of drops) { drop.active = false; drop.mesh.visible = false; }
    splashAge = 1;
    ripple.visible = false;
    solutionMaterial.color.set('#a7cdd0').lerp(new THREE.Color('#ed74ad'), model.pinkStrength);
  };
  const requestFrame = () => {
    if (frame === null && visible && !document.hidden && !disposed && !failed) frame = requestAnimationFrame(draw);
  };
  const draw = (time) => {
    frame = null;
    const delta = previousTime === null ? 0 : Math.min(0.05, (time - previousTime) / 1000);
    previousTime = time;
    const cameraMoving = controls.update();
    let active = false;
    for (const drop of drops) {
      if (!drop.active) continue;
      active = true;
      drop.age += delta;
      const progress = Math.min(1, drop.age / 0.48);
      drop.mesh.position.y = THREE.MathUtils.lerp(2.05, FLASK_BOTTOM + liquidHeight, progress * progress);
      if (progress >= 1) {
        drop.active = false;
        drop.mesh.visible = false;
        splashAge = 0;
      }
    }
    if (splashAge < 0.5) {
      active = true;
      splashAge += delta;
      const progress = Math.min(1, splashAge / 0.5);
      ripple.visible = true;
      ripple.position.y = FLASK_BOTTOM + liquidHeight + 0.024;
      ripple.scale.setScalar(0.2 + progress * 1.3);
      rippleMaterial.opacity = (1 - progress) * 0.6;
      const localPink = model.indicator === 'acidic' ? (1 - progress) * 0.18 : 0;
      solutionMaterial.color.set('#a7cdd0').lerp(new THREE.Color('#ed74ad'), Math.max(model.pinkStrength, localPink));
    } else {
      ripple.visible = false;
      solutionMaterial.color.set('#a7cdd0').lerp(new THREE.Color('#ed74ad'), model.pinkStrength);
    }
    renderer.render(scene, camera);
    if (active || cameraMoving) requestFrame();
    else previousTime = null;
  };
  const resize = () => {
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestFrame();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  const onVisibility = () => {
    if (document.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
      clearEffects();
    } else requestFrame();
  };
  const onMotion = () => { controls.enableDamping = !motion.matches; clearEffects(); requestFrame(); };
  const onContextLost = (event) => {
    event.preventDefault();
    failed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    onError(new Error('WebGL context lost'));
  };
  controls.addEventListener('change', requestFrame);
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', onMotion);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  resize();

  return {
    update(state, { animate = true } = {}) {
      const next = buildVesselModel(state);
      const newDrop = next.dropCount > model.dropCount;
      const reset = next.dropCount < model.dropCount || next.status === 'idle' || next.status === 'paused';
      model = next;
      const buretCapacity = Math.max(50, model.initialMl);
      buretCapacityLabel(`${buretCapacity.toFixed(0)} mL`);
      graduationLabels.forEach((label, index) => label((index * buretCapacity / 5).toFixed(0)));
      flaskCapacityLabel(`${model.capacityMl.toFixed(0)} mL`);
      if (reset || !animate || motion.matches) clearEffects();
      const buretHeight = Math.max(0.001, 2.3 * model.buretFraction);
      buretLiquid.scale.y = buretHeight;
      buretLiquid.position.y = 2.95 + buretHeight / 2;
      buretLiquid.visible = model.remainingMl > 0;
      meniscus.position.y = 2.95 + buretHeight;
      meniscus.visible = buretLiquid.visible;
      liquidHeight = flaskFillHeight(model.flaskFraction);
      const radius = flaskRadiusAt(liquidHeight);
      const oldGeometry = flaskLiquid.geometry;
      // Rebuild only the liquid's inexpensive geometry when its fill actually changes.
      if (flaskLiquid.userData.fill !== model.flaskFraction) {
        flaskLiquid.geometry = new THREE.CylinderGeometry(radius, flaskRadiusAt(0), Math.max(0.001, liquidHeight), segments);
        oldGeometry.dispose();
        flaskLiquid.userData.fill = model.flaskFraction;
      }
      flaskLiquid.position.y = FLASK_BOTTOM + liquidHeight / 2;
      liquidSurface.scale.set(radius / 0.5, 1, radius / 0.5);
      liquidSurface.position.y = FLASK_BOTTOM + liquidHeight;
      solutionMaterial.color.set('#a7cdd0').lerp(new THREE.Color('#ed74ad'), model.pinkStrength);
      stopcock.rotation.y = model.status === 'running' ? Math.PI / 2 : 0;
      if (newDrop && animate && !reset && !motion.matches && visible && !document.hidden) {
        const drop = drops.find((item) => !item.active) ?? drops[0];
        drop.age = 0;
        drop.active = true;
        drop.mesh.visible = true;
        drop.mesh.position.y = 2.05;
      }
      renderer.domElement.dataset.dropCount = String(model.dropCount);
      renderer.domElement.dataset.indicator = model.indicator;
      renderer.domElement.dataset.buretMl = model.remainingMl.toFixed(2);
      renderer.domElement.dataset.totalMl = model.totalMl.toFixed(2);
      requestFrame();
    },
    setVisible(next) {
      visible = next;
      if (!visible) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = null;
        clearEffects();
      } else { resize(); requestFrame(); }
    },
    resetCamera() {
      controls.reset();
      camera.position.copy(home);
      controls.target.copy(target);
      controls.update();
      requestFrame();
    },
    dispose() {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.removeEventListener('change', requestFrame);
      controls.dispose();
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onMotion);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        for (const material of [object.material].flat()) if (material) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) { material.map?.dispose(); material.dispose(); }
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
