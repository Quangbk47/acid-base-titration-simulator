import { pairForInput } from '../data/titrationPairs.js';
import * as THREE from '../../assets/vendor/three/three.module.js';
import { OrbitControls } from '../../assets/vendor/three/OrbitControls.js';
import { RoomEnvironment } from '../../assets/vendor/three/RoomEnvironment.js';
import { hasDispensedDrop, buildVesselModel, flaskFillHeight, flaskRadiusAt, flaskLiquidProfile, FLASK_GLASS_PROFILE, VESSEL_LAYOUT, FLASK_BOTTOM } from './vesselModel.js';

export function createVesselScene({ viewport, onError = () => {} }) {
  const compact = matchMedia('(max-width: 767px)').matches;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const segments = compact ? 32 : 48;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#edf4f2');
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  const home = new THREE.Vector3(6.0, 4.2, 8.1);
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
  const glass = new THREE.MeshPhysicalMaterial({ color: '#edfafa', transmission: 0.94, thickness: 0.035, roughness: 0.065, ior: 1.46, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 0.75 });
  const glassRim = new THREE.MeshPhysicalMaterial({ color: '#a4c8c8', transmission: 0.7, thickness: 0.04, roughness: 0.1, ior: 1.46, transparent: true, opacity: 0.62 });
  // Neutral optical shading makes colorless liquid visible; pink alone is pH-driven.
  const liquidBase = '#d6eceb';
  // Alpha-blended water stays visible behind transmissive glass without an opaque disk.
  // Nested transmission would resample the same background and hide the initial sample.
  const buretLiquidMaterial = new THREE.MeshPhysicalMaterial({ color: liquidBase, roughness: 0.08, metalness: 0, transmission: 0, thickness: 0.18, ior: 1.333, transparent: true, opacity: 0.58, depthWrite: false, clearcoat: 0.35 });
  const solutionMaterial = buretLiquidMaterial.clone();
  solutionMaterial.transparent = true; solutionMaterial.opacity = 0.40; solutionMaterial.depthWrite = false;
  const surfaceMaterial = new THREE.MeshPhysicalMaterial({ color: '#f2faf9', roughness: 0.05, clearcoat: 0.35, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const mesh = (geometry, material, x, y, z = 0) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = material !== glass && material !== glassRim && !material.transparent;
    object.receiveShadow = material !== glass;
    scene.add(object);
    return object;
  };
  const cylinder = (radius, height, material, x, y, z = 0) => mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material, x, y, z);
  const ring = (radius, thickness, x, y, z = 0, material = glassRim, radialSegments = 8) => {
    const object = mesh(new THREE.TorusGeometry(radius, thickness, radialSegments, segments), material, x, y, z);
    object.rotation.x = Math.PI / 2;
    return object;
  };
  const lathe = (profile, material, x = 0.35) => mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments), material, x, 0);
  const between = (from, to, radius, material) => {
    const start = new THREE.Vector3(...from); const end = new THREE.Vector3(...to); const direction = end.clone().sub(start);
    const object = cylinder(radius, direction.length(), material, 0, 0);
    object.position.copy(start.add(end).multiplyScalar(0.5)); object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); return object;
  };

  // Bench, weighted stand, steel rod and two clamps.
  const bench = mesh(new THREE.CylinderGeometry(2.2, 2.25, 0.12, 64), ceramic, 0, 0.11);
  bench.receiveShadow = true;
  bench.castShadow = false;
  const { rodX, rodZ, baseWidth, baseDepth, tipY, buretBottom, buretTop } = VESSEL_LAYOUT;
  mesh(new THREE.BoxGeometry(baseWidth, 0.13, baseDepth), dark, rodX, 0.235, rodZ);
  cylinder(0.048, 5.3, metal, rodX, 2.92, rodZ);
  cylinder(0.072, 0.12, dark, rodX, 5.58, rodZ);
  for (const y of [3.25, 4.85]) {
    between([rodX, y, rodZ], [0.35, y, -0.19], 0.028, metal);
    mesh(new THREE.BoxGeometry(0.14, 0.18, 0.15), dark, rodX, y, rodZ);
    const clamp = mesh(new THREE.TorusGeometry(0.177, 0.02, 8, 32, Math.PI * 1.6).rotateZ(Math.PI * 0.7), dark, 0.35, y);
    clamp.rotation.x = Math.PI / 2;
    cylinder(0.06, 0.16, dark, rodX, y, rodZ - 0.12).rotation.x = Math.PI / 2;
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
  const buretLiquid = mesh(new THREE.CylinderGeometry(VESSEL_LAYOUT.buretLiquidRadius, VESSEL_LAYOUT.buretLiquidRadius, 1, segments, 1, true), buretLiquidMaterial, 0.35, 4);
  buretLiquid.castShadow = false;
  const meniscus = lathe([[0, 0], [0.09, 0], [0.11, 0.004], [0.114, 0.009]], surfaceMaterial);
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: '#86aaa9', transparent: true, opacity: 0.27, depthWrite: false });
  const buretEdge = ring(0.113, 0.0025, 0.35, 5.3, 0, edgeMaterial, 4);
  const outletLiquid = lathe([[0, 2.07], [0.014, 2.07], [0.016, 2.13], [0.039, 2.54], [0.049, 2.56], [0.049, 2.78], [0.113, 2.91], [0.113, 3.0]], buretLiquidMaterial);
  outletLiquid.castShadow = false;

  // Fine graduations wrap the front of the tube and remain visible in glass.
  const ticks = [];
  for (let i = 0; i <= 50; i += 1) {
    const y = buretTop - i * (buretTop - buretBottom) / 50;
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
  const titrantLabel = textLabel('NaOH', 0.35, 5.68, 0, 0.68);
  const buretCapacityLabel = textLabel('50 mL', 0.35, 5.55, 0, 0.42);

  // Closed base and open neck: a real hollow Erlenmeyer silhouette.
  lathe(FLASK_GLASS_PROFILE, glass);
  ring(0.225, 0.026, 0.35, 1.75);
  ring(0.64, 0.018, 0.35, 0.2);
  const flaskCapacityLabel = textLabel('250 mL', 0.35, 0.87, 0.53, 0.5);
  const flaskLiquid = lathe(flaskLiquidProfile(0.1), solutionMaterial);
  const liquidSurface = lathe([[0, 0], [0.5, 0], [0.54, 0.004], [0.55, 0.007]], surfaceMaterial.clone());
  const flaskEdge = ring(1, 0.006, 0.35, 0.4, 0, edgeMaterial, 4);
  const rippleMaterial = new THREE.MeshBasicMaterial({ color: '#fa92bf', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const ripple = ring(0.2, 0.008, 0.35, 0.4, 0, rippleMaterial);
  const dropMaterial = new THREE.MeshPhysicalMaterial({ color: '#a7d4dd', roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.94 });
  const dropGeometry = new THREE.SphereGeometry(0.04, 12, 8);
  const drops = Array.from({ length: 6 }, () => {
    const drop = mesh(dropGeometry, dropMaterial, 0.35, 2.05);
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
  let renderedFrames = 0;
  const clearEffects = () => {
    for (const drop of drops) { drop.active = false; drop.mesh.visible = false; }
    splashAge = 1;
    renderer.domElement.dataset.activeDrops = '0';
    ripple.visible = false;
    solutionMaterial.color.set(liquidBase).lerp(new THREE.Color('#ed74ad'), model.pinkStrength);
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
      const progress = Math.min(1, drop.age / drop.duration);
      drop.mesh.position.y = THREE.MathUtils.lerp(tipY - 0.035, FLASK_BOTTOM + liquidHeight, progress * progress);
      drop.mesh.scale.y = 1.15 + 0.45 * progress;
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
      ripple.position.y = FLASK_BOTTOM + liquidHeight + 0.014;
      ripple.scale.setScalar(Math.min(0.2 + progress * 1.3, flaskRadiusAt(liquidHeight) * 0.9 / 0.208));
      rippleMaterial.opacity = (1 - progress) * 0.6;
      rippleMaterial.color.copy(solutionMaterial.color);
    } else {
      ripple.visible = false;
    }
    solutionMaterial.color.set(liquidBase).lerp(new THREE.Color('#ed74ad'), model.pinkStrength);
    handle.rotation.z = model.status === 'running' || drops.some((drop) => drop.active) ? Math.PI / 2 : 0;
    renderer.domElement.dataset.activeDrops = String(drops.filter((drop) => drop.active).length);
    renderer.render(scene, camera);
    renderer.domElement.dataset.renderFrames = String(++renderedFrames);
    renderer.domElement.dataset.renderCalls = String(renderer.info.render.calls);
    renderer.domElement.dataset.geometryCount = String(renderer.info.memory.geometries);
    renderer.domElement.dataset.effectsActive = String(active);
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
    update(state, { animate = true, titrantName = 'NaOH', ...settings } = {}) {
      const next = buildVesselModel(state, settings);
      const newDrop = hasDispensedDrop(model, next);
      const reset = next.dropCount === 0 || next.dropCount < model.dropCount || next.status === 'idle' || next.status === 'paused';
      model = next;
      const buretCapacity = Math.max(50, model.initialMl);
      const label = state ? pairForInput(state.chemistryInput).titrant : titrantName;
      titrantLabel(label); renderer.domElement.dataset.titrant = label;
      buretCapacityLabel(`${buretCapacity.toFixed(0)} mL`);
      graduationLabels.forEach((label, index) => label((index * buretCapacity / 5).toFixed(0)));
      flaskCapacityLabel(`${model.capacityMl.toFixed(0)} mL`);
      if (reset || !animate || motion.matches) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null; previousTime = null;
        clearEffects();
      }
      const buretHeight = (buretTop - buretBottom) * model.buretFraction;
      buretLiquid.scale.y = Math.max(0.000001, buretHeight);
      buretLiquid.position.y = buretBottom + buretHeight / 2;
      buretLiquid.visible = model.remainingMl > 0;
      meniscus.position.y = buretBottom + buretHeight;
      meniscus.visible = buretLiquid.visible;
      buretEdge.position.y = meniscus.position.y + 0.008;
      buretEdge.visible = buretLiquid.visible;
      outletLiquid.visible = buretLiquid.visible;
      liquidHeight = flaskFillHeight(model.flaskFraction);
      const radius = flaskRadiusAt(liquidHeight);
      const oldGeometry = flaskLiquid.geometry;
      // Rebuild only the liquid's inexpensive geometry when its fill actually changes.
      if (flaskLiquid.userData.fill !== model.flaskFraction) {
        flaskLiquid.geometry = new THREE.LatheGeometry(flaskLiquidProfile(liquidHeight).map(([r, y]) => new THREE.Vector2(r, y)), segments);
        oldGeometry.dispose();
        flaskLiquid.userData.fill = model.flaskFraction;
      }
      flaskLiquid.position.y = 0;
      liquidSurface.scale.set(radius / 0.55, 1, radius / 0.55);
      liquidSurface.position.y = FLASK_BOTTOM + liquidHeight;
      flaskEdge.scale.setScalar(radius);
      flaskEdge.position.y = FLASK_BOTTOM + liquidHeight + 0.007;
      solutionMaterial.color.set(liquidBase).lerp(new THREE.Color('#ed74ad'), model.pinkStrength);
      liquidSurface.material.color.copy(solutionMaterial.color);
      solutionMaterial.opacity = 0.40 + 0.20 * model.pinkStrength;
      liquidSurface.material.opacity = 0.22 + 0.12 * model.pinkStrength;
      if (newDrop && animate && !reset && !motion.matches && visible && !document.hidden) {
        const drop = drops.find((item) => !item.active) ?? drops[0];
        drop.age = 0;
        drop.duration = state?.speed === 'fast' ? 0.25 : 0.48;
        drop.active = true;
        drop.mesh.visible = true;
        drop.mesh.position.y = tipY - 0.035;
      }
      renderer.domElement.dataset.dropCount = String(model.dropCount);
      renderer.domElement.dataset.addedMl = String(model.addedMl);
      renderer.domElement.dataset.selectedIndicator = model.indicatorName;
      renderer.domElement.dataset.indicator = model.indicator;
      renderer.domElement.dataset.buretMl = model.remainingMl.toFixed(2);
      renderer.domElement.dataset.totalMl = model.totalMl.toFixed(2);
      renderer.domElement.dataset.buretSurfaceY = (buretBottom + buretHeight).toFixed(5);
      renderer.domElement.dataset.flaskSurfaceY = (FLASK_BOTTOM + liquidHeight).toFixed(5);
      renderer.domElement.dataset.liquidColor = solutionMaterial.color.getHexString();
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
