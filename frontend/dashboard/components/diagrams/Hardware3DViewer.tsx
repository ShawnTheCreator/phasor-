import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Hardware3DViewerProps {
  bx?: number;
  by?: number;
  bz?: number;
  isSimulating?: boolean;
}

export default function Hardware3DViewer({
  bx = 12480.0,
  by = -2150.0,
  bz = -27850.0,
  isSimulating = false
}: Hardware3DViewerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'assembled' | 'exploded' | 'flux'>('assembled');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  // References for dynamic 3D updates
  const vectorArrowRef = useRef<THREE.Group | null>(null);
  const fluxRingsRef = useRef<THREE.Group | null>(null);
  const rm3100GroupRef = useRef<THREE.Group | null>(null);
  const ledLightRef = useRef<THREE.PointLight | null>(null);
  const explodedOffsetRef = useRef<number>(0);

  // Calculate field magnitude
  const bTotal = Math.sqrt(bx * bx + by * by + bz * bz);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 640;
    const height = 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(65, 55, 75);
    camera.lookAt(0, 5, 0);

    // 2. High-Fidelity WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Studio Cleanroom Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(45, 80, 40);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-50, 40, -45);
    scene.add(rimLight);

    const underLight = new THREE.DirectionalLight(0x64748b, 0.6);
    underLight.position.set(0, -30, 0);
    scene.add(underLight);

    // 4. Ground Inspection Grid
    const gridHelper = new THREE.GridHelper(120, 24, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -12;
    scene.add(gridHelper);

    // Main Root Assembly Group
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);

    // =========================================================================
    // PART A: RASPBERRY PI PICO RP2040 MICROCONTROLLER
    // =========================================================================
    const picoGroup = new THREE.Group();
    rootAssembly.add(picoGroup);

    // Pico PCB (51mm x 21mm x 1.6mm in real life -> scaled to 48 x 20 x 2)
    const pcbGeo = new THREE.BoxGeometry(48, 1.8, 20);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Raspberry Pi deep green lacquer
      roughness: 0.35,
      metalness: 0.15
    });
    const picoPcb = new THREE.Mesh(pcbGeo, pcbMat);
    picoPcb.castShadow = true;
    picoPcb.receiveShadow = true;
    picoGroup.add(picoPcb);

    // Castellation Solder Pads along edges (40 pins in gold)
    const padGeo = new THREE.BoxGeometry(1.2, 0.4, 0.8);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Electroless Nickel Immersion Gold (ENIG)
      metalness: 0.9,
      roughness: 0.2
    });
    for (let i = -19; i <= 19; i += 2) {
      const padTop = new THREE.Mesh(padGeo, padMat);
      padTop.position.set(i, 1.0, 9.7);
      picoGroup.add(padTop);

      const padBot = new THREE.Mesh(padGeo, padMat);
      padBot.position.set(i, 1.0, -9.7);
      picoGroup.add(padBot);
    }

    // RP2040 Microcontroller SoC (7x7mm QFN-56 package)
    const socGeo = new THREE.BoxGeometry(7.5, 1.2, 7.5);
    const socMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.4
    });
    const soc = new THREE.Mesh(socGeo, socMat);
    soc.position.set(6, 1.5, 0);
    soc.castShadow = true;
    picoGroup.add(soc);

    // RP2040 Die Laser Engraving Badge (Specular Top)
    const dieBadgeGeo = new THREE.PlaneGeometry(5.5, 5.5);
    const dieBadgeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.2,
      metalness: 0.8
    });
    const dieBadge = new THREE.Mesh(dieBadgeGeo, dieBadgeMat);
    dieBadge.rotation.x = -Math.PI / 2;
    dieBadge.position.set(6, 2.12, 0);
    picoGroup.add(dieBadge);

    // Micro-USB Port (Brushed Steel Shield)
    const usbGeo = new THREE.BoxGeometry(7.5, 3.2, 6.5);
    const usbMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.25
    });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-22, 2.4, 0);
    usb.castShadow = true;
    picoGroup.add(usb);

    // Crystal Oscillator (12.000 MHz Metal Can)
    const xtalGeo = new THREE.BoxGeometry(3.6, 1.4, 2.4);
    const xtalMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.3
    });
    const xtal = new THREE.Mesh(xtalGeo, xtalMat);
    xtal.position.set(-2, 1.6, -4.5);
    picoGroup.add(xtal);

    // BOOTSEL Tactile Switch
    const switchBaseGeo = new THREE.BoxGeometry(3.5, 1.2, 3.5);
    const switchBaseMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6 });
    const switchBase = new THREE.Mesh(switchBaseGeo, switchBaseMat);
    switchBase.position.set(-8, 1.5, 3.5);
    picoGroup.add(switchBase);

    const buttonGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 16);
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(-8, 2.4, 3.5);
    picoGroup.add(button);

    // Onboard Status LED (Pulsing Green Beacon)
    const ledGeo = new THREE.BoxGeometry(1.6, 0.8, 1.0);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x22c55e,
      emissiveIntensity: 1.8
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-14, 1.3, -4.5);
    picoGroup.add(led);

    const ledLight = new THREE.PointLight(0x22c55e, 1.2, 18);
    ledLight.position.set(-14, 3, -4.5);
    picoGroup.add(ledLight);
    ledLightRef.current = ledLight;

    // =========================================================================
    // PART B: PNI RM3100 3-AXIS MAGNETO-INDUCTIVE SENSOR MODULE
    // =========================================================================
    const rm3100Group = new THREE.Group();
    // Positioned offset adjacent to Pico connected via I2C header
    rm3100Group.position.set(0, 0, 24);
    rootAssembly.add(rm3100Group);
    rm3100GroupRef.current = rm3100Group;

    // RM3100 Matte Obsidian PCB (24mm x 22mm x 1.6mm)
    const rmPcbGeo = new THREE.BoxGeometry(24, 1.6, 22);
    const rmPcbMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.4,
      metalness: 0.2
    });
    const rmPcb = new THREE.Mesh(rmPcbGeo, rmPcbMat);
    rmPcb.castShadow = true;
    rmPcb.receiveShadow = true;
    rm3100Group.add(rmPcb);

    // PNI MagI2C ASIC Controller Chip (Center of sensor daughterboard)
    const asicGeo = new THREE.BoxGeometry(5.5, 1.0, 5.5);
    const asicMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.4 });
    const asic = new THREE.Mesh(asicGeo, asicMat);
    asic.position.set(-3, 1.3, 0);
    rm3100Group.add(asic);

    // Copper Wire Material for Orthogonal Coils
    const copperCoilMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Polished enameled copper wire
      metalness: 0.88,
      roughness: 0.25,
      bumpScale: 0.05
    });

    // Coil Ferrite Core Core Pins
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.3 });

    // 1. X-Axis Coil (Horizontal parallel to X)
    const coilXGroup = new THREE.Group();
    coilXGroup.position.set(5.5, 3.2, -5.5);
    const coilXCore = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 10, 24), coreMat);
    coilXCore.rotation.z = Math.PI / 2;
    coilXGroup.add(coilXCore);

    const coilXWinding = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 7.5, 24), copperCoilMat);
    coilXWinding.rotation.z = Math.PI / 2;
    coilXWinding.castShadow = true;
    coilXGroup.add(coilXWinding);
    rm3100Group.add(coilXGroup);

    // 2. Y-Axis Coil (Horizontal parallel to Z)
    const coilYGroup = new THREE.Group();
    coilYGroup.position.set(-5.5, 3.2, 5.5);
    const coilYCore = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 10, 24), coreMat);
    coilYCore.rotation.x = Math.PI / 2;
    coilYGroup.add(coilYCore);

    const coilYWinding = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 7.5, 24), copperCoilMat);
    coilYWinding.rotation.x = Math.PI / 2;
    coilYWinding.castShadow = true;
    coilYGroup.add(coilYWinding);
    rm3100Group.add(coilYGroup);

    // 3. Z-Axis Coil (Vertical upright perpendicular to board)
    const coilZGroup = new THREE.Group();
    coilZGroup.position.set(5.5, 5.0, 5.5);
    const coilZCore = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 8.5, 24), coreMat);
    coilZGroup.add(coilZCore);

    const coilZWinding = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 6.5, 24), copperCoilMat);
    coilZWinding.castShadow = true;
    coilZGroup.add(coilZWinding);
    rm3100Group.add(coilZGroup);

    // Flexible I2C Ribbon Wires connecting Pico & RM3100
    const wireColors = [0xef4444, 0x0f172a, 0xeab308, 0x3b82f6]; // VCC (Red), GND (Black), SDA (Yellow), SCL (Blue)
    wireColors.forEach((color, idx) => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(idx * 2 - 3, 1.2, 10),
        new THREE.Vector3(idx * 2 - 3, 7, 14),
        new THREE.Vector3(idx * 2 - 3, 5, 18),
        new THREE.Vector3(idx * 2 - 3, 1.2, 22)
      );
      const wireGeo = new THREE.TubeGeometry(curve, 20, 0.55, 8, false);
      const wireMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      rootAssembly.add(wire);
    });

    // =========================================================================
    // PART C: DYNAMIC 3D GEOMAGNETIC FLUX VECTOR ARROW
    // =========================================================================
    const vectorGroup = new THREE.Group();
    vectorGroup.position.set(0, 4, 24); // Centered above RM3100 sensor coils
    rootAssembly.add(vectorGroup);
    vectorArrowRef.current = vectorGroup;

    // Glowing Arrow Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 22, 16);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.8
    });
    const shaft = new THREE.Mesh(shaftGeo, arrowMat);
    shaft.position.y = 11;
    vectorGroup.add(shaft);

    // Arrow Cone Head
    const coneGeo = new THREE.ConeGeometry(2.4, 6, 24);
    const cone = new THREE.Mesh(coneGeo, arrowMat);
    cone.position.y = 25;
    vectorGroup.add(cone);

    // Toroidal Magnetic Flux Loops
    const fluxGroup = new THREE.Group();
    fluxGroup.position.set(0, 4, 24);
    rootAssembly.add(fluxGroup);
    fluxRingsRef.current = fluxGroup;

    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.TorusGeometry(12 + r * 6, 0.35, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35 - r * 0.08
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + (r * 0.2);
      fluxGroup.add(ring);
    }

    // =========================================================================
    // MOUSE & TOUCH ORBIT CONTROLS (SMOOTH ROTATION & ZOOM)
    // =========================================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.45;
    let rotY = -0.55;
    let targetZoom = 1.0;
    let currentZoom = 1.0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotY += deltaX * 0.012;
      rotX += deltaY * 0.012;
      rotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.0015;
      targetZoom = Math.max(0.5, Math.min(2.2, targetZoom));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile / tablets
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      rotY += deltaX * 0.014;
      rotX += deltaY * 0.014;
      rotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX));
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domElem.addEventListener('touchstart', onTouchStart);
    domElem.addEventListener('touchmove', onTouchMove);
    domElem.addEventListener('touchend', onTouchEnd);

    // =========================================================================
    // ANIMATION & RENDER LOOP
    // =========================================================================
    let animFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Damped smooth zoom
      currentZoom += (targetZoom - currentZoom) * 0.1;
      camera.zoom = 1 / currentZoom;
      camera.updateProjectionMatrix();

      // Auto-rotation when idle
      if (autoRotate && !isDragging) {
        rotY += 0.003;
      }

      // Smooth rotation dampening
      rootAssembly.rotation.x = rotX;
      rootAssembly.rotation.y = rotY;

      // Pulse LED beacon
      if (ledLightRef.current) {
        ledLightRef.current.intensity = 1.0 + Math.sin(elapsed * 6) * 0.8;
      }

      // Exploded View smooth animation transition
      const targetOffset = viewMode === 'exploded' ? 22.0 : 0.0;
      explodedOffsetRef.current += (targetOffset - explodedOffsetRef.current) * 0.1;
      if (rm3100GroupRef.current) {
        rm3100GroupRef.current.position.y = explodedOffsetRef.current;
        rm3100GroupRef.current.position.z = 24 + (explodedOffsetRef.current * 0.4);
      }

      // Rotate flux loops
      if (fluxRingsRef.current) {
        fluxRingsRef.current.rotation.y = elapsed * 0.6;
        fluxRingsRef.current.visible = viewMode === 'flux' || viewMode === 'assembled';
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      domElem.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [autoRotate, viewMode]);

  // Update 3D Vector Arrow Orientation whenever Bx, By, Bz changes
  useEffect(() => {
    if (!vectorArrowRef.current) return;
    const arrow = vectorArrowRef.current;

    // Normalizing magnetic vector components to unit direction
    const norm = Math.max(1.0, Math.sqrt(bx * bx + by * by + bz * bz));
    const dirX = (by / norm);  // Map By (Eastward) to 3D X
    const dirY = (-bz / norm); // Map -Bz (Geomagnetic Downward -> 3D Y Up)
    const dirZ = (bx / norm);  // Map Bx (Northward) to 3D Z

    const targetDir = new THREE.Vector3(dirX, dirY, dirZ).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, targetDir);
    arrow.quaternion.copy(quat);

    // Storm color shift
    const isStormElevated = isSimulating || Math.abs(bz) > 30000;
    arrow.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).color) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.setHex(isStormElevated ? 0xdc2626 : 0x0284c7);
          mat.emissive.setHex(isStormElevated ? 0x991b1b : 0x0284c7);
        }
      }
    });
  }, [bx, by, bz, isSimulating]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #1e293b',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#0a0f1d'
    }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '420px', cursor: 'grab' }} />

      {/* Top Floating Telemetry & Mode Overlay */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none'
      }}>
        {/* Left: Device Spec Pill */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '8px 14px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            <strong style={{ color: '#38bdf8' }}>RP2040 + PNI RM3100 3D DIGITAL TWIN</strong>
          </div>
          <div style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.7rem' }}>
            |B|: <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{bTotal.toFixed(1)} nT</span> | Vector: ({bx.toFixed(0)}, {by.toFixed(0)}, {bz.toFixed(0)})
          </div>
        </div>

        {/* Right: Interactive Camera & Explode Controls */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setAutoRotate(r => !r)}
            style={{
              backgroundColor: autoRotate ? '#0284c7' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {autoRotate ? '⏸ Pause Orbit' : '▶ Auto-Rotate'}
          </button>

          <button
            onClick={() => setViewMode(m => m === 'exploded' ? 'assembled' : 'exploded')}
            style={{
              backgroundColor: viewMode === 'exploded' ? '#991b1b' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {viewMode === 'exploded' ? 'Assemble CAD' : 'Exploded View'}
          </button>

          <button
            onClick={() => setViewMode(m => m === 'flux' ? 'assembled' : 'flux')}
            style={{
              backgroundColor: viewMode === 'flux' ? '#10b981' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Flux Lines
          </button>
        </div>
      </div>

      {/* Bottom Interactive Legend / CAD Guidance */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        color: '#64748b',
        fontSize: '0.68rem',
        fontFamily: 'monospace'
      }}>
        <div>
          <span>🖱 Drag to rotate 360° | Scroll to zoom | Arrow shows live 3D B-vector</span>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span><span style={{ color: '#22c55e' }}>■</span> Pico RP2040</span>
          <span><span style={{ color: '#d97706' }}>■</span> RM3100 Coils</span>
          <span><span style={{ color: '#38bdf8' }}>▲</span> B-Field Vector</span>
        </div>
      </div>
    </div>
  );
}
