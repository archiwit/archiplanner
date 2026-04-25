import React, { useEffect, useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const SCALE = 50;

const ThreeSpatialDesigner = forwardRef(({ 
    elements = [], 
    roomConfig = {}, 
    selectedId, 
    onSelect,
    onUpdateElement 
}, ref) => {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const transformControlsRef = useRef(null);
    const pointerLockRef = useRef(null);
    const furnitureRef = useRef(new THREE.Group());
    const [isInitialized, setIsInitialized] = useState(false);
    
    const onSelectRef = useRef(onSelect);
    useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

    const onUpdateRef = useRef(onUpdateElement);
    useEffect(() => { onUpdateRef.current = onUpdateElement; }, [onUpdateElement]);

    useImperativeHandle(ref, () => ({
        recenterCamera: () => {
            if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.set(15, 15, 15);
                controlsRef.current.target.set(10, 0, 10);
                controlsRef.current.update();
            }
        },
        focusOnElement: (id) => {
            const el = elements.find(e => String(e.id) === String(id));
            if (el && cameraRef.current && controlsRef.current) {
                const tx = (el.x || 0) / SCALE;
                const tz = (el.y || 0) / SCALE;
                controlsRef.current.target.set(tx, 0, tz);
                cameraRef.current.position.set(tx + 4, 3, tz + 4);
                controlsRef.current.update();
            }
        },
        toggleWalkMode: () => {
            if (pointerLockRef.current) {
                if (!pointerLockRef.current.isLocked) {
                    cameraRef.current.position.y = 1.65;
                    pointerLockRef.current.lock();
                } else {
                    pointerLockRef.current.unlock();
                }
            }
        }
    }));

    const mats = {
        wood: new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.8 }),
        marble: new THREE.MeshStandardMaterial({ color: '#e0e0e0', roughness: 0.05, metalness: 0.1 }),
        concrete: new THREE.MeshStandardMaterial({ color: '#9e9e9e', roughness: 0.9 }),
        ceramic: new THREE.MeshStandardMaterial({ color: '#fcfcfc', roughness: 0.05, metalness: 0.2 }),
        black: new THREE.MeshStandardMaterial({ color: '#1a1a1a' }),
        silver: new THREE.MeshStandardMaterial({ color: '#e0e0e0', metalness: 0.8, roughness: 0.2 }),
        gold: new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.9, roughness: 0.1 }),
        grass: new THREE.MeshStandardMaterial({ color: '#2d5a27', roughness: 0.8 }),
        glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.2, transmission: 0.95, thickness: 0.5 }),
        bottle: new THREE.MeshStandardMaterial({ color: '#2c4c2c', transparent: true, opacity: 0.8 })
    };

    const findMat = (name, customColor) => {
        if (customColor) return new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.8 });
        if (!name) return mats.wood;
        const n = String(name).toLowerCase();
        if (n.includes('mader')) return mats.wood;
        if (n.includes('marmo')) return mats.marble;
        if (n.includes('ceram')) return mats.ceramic;
        if (n.includes('cemento') || n.includes('concrete')) return mats.concrete;
        if (n.includes('grama') || n.includes('grass') || n.includes('cesped')) return mats.grass;
        if (n.startsWith('#')) return new THREE.MeshStandardMaterial({ color: n });
        return mats.wood;
    };

    const createChair = (style = 'chavari', mat) => {
        const group = new THREE.Group();
        const s = style.toLowerCase();
        if (s.includes('puff')) {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.45, 16), mat); p.position.y = 0.225; group.add(p);
        } else if (s.includes('cros')) {
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), mat); seat.position.y = 0.45; group.add(seat);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.06), mat); back.position.set(0, 0.725, -0.19); group.add(back);
            [[0.19, 0.19], [-0.19, 0.19], [0.19, -0.19], [-0.19, -0.19]].forEach(l => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.04), mat); leg.position.set(l[0], 0.225, l[1]); group.add(leg);
            });
        } else {
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), mat); seat.position.y = 0.45; group.add(seat);
            const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.045), mat); backFrame.position.set(0, 0.7, -0.18); group.add(backFrame);
            for(let i=-0.14; i<=0.14; i+=0.07) {
                const b = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.38), mat); b.position.set(i, 0.65, -0.18); group.add(b);
            }
            [[0.18, 0.18], [-0.18, 0.18], [0.18, -0.18], [-0.18, -0.18]].forEach(l => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.45), mat); leg.position.set(l[0], 0.225, l[1]); group.add(leg);
            });
        }
        return group;
    };

    const createChandelier = (color) => {
        const group = new THREE.Group();
        const mat = color.toLowerCase().includes('pla') ? mats.silver : mats.gold;
        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4), mat); group.add(core);
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45), mat);
            arm.rotation.z = Math.PI / 2.5; arm.position.set(Math.cos(ang) * 0.2, 0, Math.sin(ang) * 0.2); arm.rotation.y = -ang; group.add(arm);
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06), new THREE.MeshStandardMaterial({ color: '#fff9c4', emissive: '#fff9c4', emissiveIntensity: 1 }));
            bulb.position.set(Math.cos(ang) * 0.45, 0.15, Math.sin(ang) * 0.45); group.add(bulb);
        }
        return group;
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0a0a); sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(60, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
        camera.position.set(15, 15, 15); cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight); renderer.shadowMap.enabled = true; rendererRef.current = renderer;
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const sun = new THREE.DirectionalLight(0xffffff, 1); sun.position.set(30, 60, 30); scene.add(sun);
        scene.add(furnitureRef.current);
        const ctrls = new OrbitControls(camera, renderer.domElement); ctrls.enableDamping = true; ctrls.dampingFactor = 0.05; controlsRef.current = ctrls;
        const tControls = new TransformControls(camera, renderer.domElement);
        tControls.setMode('translate'); tControls.showY = false;
        tControls.addEventListener('dragging-changed', (e) => ctrls.enabled = !e.value);
        tControls.addEventListener('mouseUp', () => {
            if (tControls.object) {
                const target = tControls.object;
                onUpdateRef.current(target.userData.id, { x: target.position.x * SCALE, y: target.position.z * SCALE });
            }
        });
        scene.add(tControls); transformControlsRef.current = tControls;
        const plControls = new PointerLockControls(camera, renderer.domElement);
        plControls.addEventListener('unlock', () => { console.log("POV Unlocked"); });
        scene.add(plControls.object); pointerLockRef.current = plControls;
        const moveState = { w: false, a: false, s: false, d: false };
        const keyHandler = (e, down) => {
            const k = e.code;
            if (k === 'Escape' && plControls.isLocked) { e.stopPropagation(); }
            if (k === 'KeyW' || k === 'ArrowUp') moveState.w = down; 
            if (k === 'KeyS' || k === 'ArrowDown') moveState.s = down;
            if (k === 'KeyA' || k === 'ArrowLeft') moveState.a = down; 
            if (k === 'KeyD' || k === 'ArrowRight') moveState.d = down;
        };
        window.addEventListener('keydown', (e) => keyHandler(e, true));
        window.addEventListener('keyup', (e) => keyHandler(e, false));
        setIsInitialized(true);
        renderer.setAnimationLoop(() => {
            if (plControls.isLocked) {
                const s = 0.15;
                if (moveState.w) plControls.moveForward(s); if (moveState.s) plControls.moveForward(-s);
                if (moveState.a) plControls.moveRight(-s); if (moveState.d) plControls.moveRight(s);
                camera.position.y = 1.65;
            } else { ctrls.update(); }
            renderer.render(scene, camera);
        });
        const handleUp = (e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            const ray = new THREE.Raycaster(); ray.setFromCamera({ x, y }, camera);
            const hits = ray.intersectObjects(furnitureRef.current.children, true);
            if (hits.length > 0) {
                let p = hits[0].object; while (p && !p.userData?.id) p = p.parent;
                if (p?.userData?.id) onSelectRef.current(p.userData.id);
            } else { onSelectRef.current(null); }
        };
        canvasRef.current.addEventListener('pointerup', handleUp);
        return () => renderer.dispose();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        const scene = sceneRef.current;
        const oldRoom = scene.getObjectByName("RoomNode"); if (oldRoom) scene.remove(oldRoom);
        const roomGroup = new THREE.Group(); roomGroup.name = "RoomNode";
        const w = Number(roomConfig.width) || 20; const l = Number(roomConfig.length) || 20;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, l), findMat(roomConfig.floorType, roomConfig.floorColor));
        floor.rotation.x = -Math.PI/2; floor.position.set(w/2, 0, l/2); roomGroup.add(floor);
        const grid = new THREE.GridHelper(Math.max(w, l)*1.5, 30, 0x333333, 0x222222); grid.position.set(w/2, 0.01, l/2); roomGroup.add(grid);
        if (roomConfig.showWalls !== false) {
            const h = Number(roomConfig.wallHeight) || 4;
            const wMat = new THREE.MeshStandardMaterial({ color: roomConfig.wallColor || '#ffffff', side: THREE.DoubleSide });
            const addW = (sw, px, pz, ry) => {
                const wm = new THREE.Mesh(new THREE.PlaneGeometry(sw, h), wMat); wm.position.set(px, h/2, pz); wm.rotation.y = ry; roomGroup.add(wm);
            };
            addW(w, w/2, 0, 0); addW(w, w/2, l, Math.PI); addW(l, 0, l/2, Math.PI/2); addW(l, w, l/2, -Math.PI/2);
        }
        scene.add(roomGroup);
    }, [isInitialized, roomConfig]);

    useEffect(() => {
        if (!isInitialized) return;
        furnitureRef.current.clear();
        if (transformControlsRef.current) transformControlsRef.current.detach();

        elements.forEach(el => {
            const config = el.config_json || {};
            const item = new THREE.Group(); item.userData = { id: el.id };
            item.position.set((el.x || 0) / SCALE, 0, (el.y || 0) / SCALE);
            item.rotation.y = (el.rotation || 0) * (Math.PI / 180);

            if (String(el.id) === String(selectedId) && transformControlsRef.current) {
                transformControlsRef.current.attach(item);
            }

            const tipo = String(el.tipo || '').toLowerCase();
            const seats = Number(config.numSeatsLong) || 10;
            const tableColor = findMat(config.color || el.color || '#444444');
            const th = 0.75;

            // V23.0 CONEXIÓN CON CM (config.width / 100)
            if (tipo.includes('barra')) {
                const bw = (config.width / 100) || 1.8; 
                const bl = (config.height / 100) || 0.8;
                const bh = (config.barHeight / 100) || 1.1;
                const barGroup = new THREE.Group();
                const frontCounter = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.06, 0.3), mats.marble); frontCounter.position.set(0, bh, -0.2); barGroup.add(frontCounter);
                const frontBody = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.3), tableColor); frontBody.position.set(0, bh/2, -0.2); barGroup.add(frontBody);
                const shelfHeight = bh + 1.2;
                const backWall = new THREE.Mesh(new THREE.BoxGeometry(bw, shelfHeight, 0.1), tableColor); backWall.position.set(0, shelfHeight/2, 0.2); barGroup.add(backWall);
                [0.4, 0.8, 1.2, 1.6].forEach(h => {
                    const shelf = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.04, 0.25), mats.wood); shelf.position.set(0, h, 0.15); barGroup.add(shelf);
                    for(let x=-0.4; x<=0.4; x+=0.3) {
                        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), mats.bottle);
                        bottle.position.set(x * bw, h + 0.12, 0.15); barGroup.add(bottle);
                    }
                });
                item.add(barGroup);
            } else if (tipo.includes('mesa') || tipo.includes('coctel') || tipo.includes('ponque')) {
                const isRound = tipo.includes('redon') || tipo.includes('coctel') || tipo.includes('ponque');
                const ew = (config.width / SCALE) || 1.6; const elen = (config.height / SCALE) || 1.6;
                const tableTop = new THREE.Mesh(isRound ? new THREE.CylinderGeometry(ew/2, ew/2, 0.05, 32) : new THREE.BoxGeometry(ew, 0.05, elen), tableColor);
                tableTop.position.y = th; item.add(tableTop);
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, th, 16), mats.silver); leg.position.y = th/2; item.add(leg);
                const radius = (ew / 2) + 0.35;
                for (let i = 0; i < seats; i++) {
                    const ang = (i / seats) * Math.PI * 2;
                    const sGroup = new THREE.Group();
                    sGroup.position.set(Math.cos(ang) * radius, 0, Math.sin(ang) * radius); sGroup.rotation.y = -ang - Math.PI / 2;
                    sGroup.add(createChair(config.chairStyle || 'chavari', findMat(config.chairColor || el.color || '#333333')));
                    const dIn = 0.45; 
                    if (config.showPlates !== false) {
                        const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 16), findMat(config.tablewareColor || '#ffffff')); plat.position.set(0, th+0.03, dIn); sGroup.add(plat);
                        const servi = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.12), findMat(config.napkinColor || '#ffffff')); servi.position.set(0, th+0.045, dIn); sGroup.add(servi);
                    }
                    if (config.showCutlery !== false) {
                        const cMat = findMat(config.cutleryColor || '#c0c0c0');
                        const k = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.005, 0.18), cMat); k.position.set(0.15, th+0.033, dIn); sGroup.add(k);
                        const f = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.005, 0.18), cMat); f.position.set(-0.15, th+0.033, dIn); sGroup.add(f);
                    }
                    if (config.showWaterGlass !== false) {
                        const gW = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.012, 0.11, 8), mats.glass); gW.position.set(0.12, th+0.08, dIn + 0.12); sGroup.add(gW);
                    }
                    if (config.showWineGlass !== false) {
                        const gV = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.01, 0.13, 8), mats.glass); gV.position.set(0.07, th+0.09, dIn + 0.17); sGroup.add(gV);
                    }
                    if (config.showSodaGlass !== false) {
                        const gS = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 12), mats.glass); gS.position.set(0.18, th+0.07, dIn + 0.18); sGroup.add(gS);
                    }
                    item.add(sGroup);
                }
                if (config.showCenterpiece !== false) {
                    const style = config.centerpieceType || 'bajo';
                    let cp;
                    if (style === 'alto') {
                        cp = new THREE.Group();
                        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.65, 16), mats.silver); cp.add(base);
                        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), findMat(config.floralColor || '#ff8484')); flower.position.y = 0.45; cp.add(flower);
                    } else if (style === 'vela') {
                        cp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 12), new THREE.MeshStandardMaterial({ color: '#fff9c4', emissive: '#ffecb3', emissiveIntensity: 1 }));
                    } else {
                        cp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), findMat(config.floralColor || '#ff8484'));
                    }
                    cp.position.y = th + (style === 'alto' ? 0.35 : 0.05); item.add(cp);
                }
            } else if (tipo.includes('lampara')) {
                const wallH = Number(roomConfig.wallHeight) || 4;
                const cLen = (config.cableLength || 50) / 100;
                const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, cLen), mats.black); cable.position.y = wallH - (cLen / 2); item.add(cable);
                const chandelier = createChandelier(config.color || '#D4AF37'); chandelier.position.y = wallH - cLen - 0.2; item.add(chandelier);
                const light = new THREE.PointLight(0xfff5e6, 2.5, 12); light.position.y = chandelier.position.y - 0.2; item.add(light);
            } else if (tipo.includes('puerta')) {
                const dw = (config.doorWidth / 100) || 1.5; const dh = (config.doorHeight / 100) || 2.2;
                const frameMat = mats.wood;
                const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, dh, 0.12), frameMat); p1.position.set(-dw/2, dh/2, 0); item.add(p1);
                const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, dh, 0.12), frameMat); p2.position.set(dw/2, dh/2, 0); item.add(p2);
                const p3 = new THREE.Mesh(new THREE.BoxGeometry(dw, 0.12, 0.12), frameMat); p3.position.set(0, dh, 0); item.add(p3);
            } else if (tipo.includes('dj') || tipo.includes('sonido')) {
                const ew = (config.width / SCALE) || 1.5; const elen = (config.height / SCALE) || 0.8;
                const base = new THREE.Mesh(new THREE.BoxGeometry(ew, 1.0, elen), mats.black); base.position.y = 0.5; item.add(base);
                const mixer = new THREE.Mesh(new THREE.BoxGeometry(ew * 0.8, 0.1, elen * 0.8), mats.silver); mixer.position.y = 1.05; item.add(mixer);
            } else {
                const ew = (config.width / SCALE) || 1; const elen = (config.height / SCALE) || 1;
                const box = new THREE.Mesh(new THREE.BoxGeometry(ew, 0.22, elen), tableColor); box.position.y = 0.11; item.add(box);
            }
            furnitureRef.current.add(item);
        });
    }, [isInitialized, elements, selectedId, roomConfig]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'crosshair' }} />;
});

export default ThreeSpatialDesigner;
