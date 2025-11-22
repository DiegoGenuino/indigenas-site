import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Configuration ---
const CONFIG = {
    particleCount: 5000,
    particleSize: 0.05,
    colors: {
        origin: new THREE.Color('#d4a373'), // Earthy
        connection: new THREE.Color('#2a9d8f'), // Nature Green
        territory: new THREE.Color('#588157'), // Deep Forest Green
        resistance: new THREE.Color('#e76f51'), // Fiery Red
        fire: new THREE.Color('#ff4500'), // Burning Orange/Red
        celebration: new THREE.Color('#f4a261'), // Joyful Orange
        future: new THREE.Color('#a8dadc') // Ethereal Blue
    }
};

const chapters = [
    '#chapter-origin', '#chapter-connection', '#chapter-territory', '#chapter-artifacts', 
    '#chapter-resistance', '#chapter-fire', '#knowledge-stack', '#chapter-cosmology', 
    '#chapter-heroes', '#chapter-celebration', '#chapter-future'
];

// Global Mouse State
let mouseX = 0;
let mouseY = 0;

// --- Scene Setup ---
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Particles ---
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(CONFIG.particleCount * 3);
const randoms = new Float32Array(CONFIG.particleCount);

for (let i = 0; i < CONFIG.particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    randoms[i] = Math.random();
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: CONFIG.colors.origin },
        uScrollProgress: { value: 0 },
        uFormFactor: { value: 0 }
    },
    vertexShader: `
        uniform float uTime;
        uniform float uScrollProgress;
        uniform float uFormFactor;
        attribute float aRandom;
        varying float vAlpha;
        
        void main() {
            vec3 pos = position;
            float time = uTime * 0.5;
            
            float noise = sin(pos.x * 2.0 + time) * cos(pos.z * 1.5 + time) * 0.5;
            float wave = sin(pos.x * 1.0 + time * 2.0) * 1.0;
            float spike = sin(pos.x * 5.0 + time * 5.0) * cos(pos.z * 5.0) * 0.5;

            if (uFormFactor < 1.0) {
                pos.y += mix(noise, wave, uFormFactor);
            } else {
                pos.y += mix(wave, spike, uFormFactor - 1.0);
            }

            pos.x += sin(time + aRandom * 10.0) * 0.1;
            pos.z += cos(time + aRandom * 10.0) * 0.1;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = (4.0 + aRandom * 2.0) * (10.0 / -mvPosition.z);
            vAlpha = 0.8 - smoothstep(10.0, 20.0, length(pos));
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
            float r = distance(gl_PointCoord, vec2(0.5));
            if (r > 0.5) discard;
            float glow = 1.0 - (r * 2.0);
            glow = pow(glow, 1.5);
            gl_FragColor = vec4(uColor, vAlpha * glow);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// --- Procedural Indigenous Object (Cocar) ---
const cocarGroup = new THREE.Group();
scene.add(cocarGroup);
const featherCount = 20;
const radius = 2;
const featherGeometry = new THREE.ConeGeometry(0.1, 1.5, 8);
const featherMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, wireframe: true });

for (let i = 0; i < featherCount; i++) {
    const angle = (i / (featherCount - 1)) * Math.PI - Math.PI / 2;
    const feather = new THREE.Mesh(featherGeometry, featherMaterial);
    feather.position.x = Math.cos(angle) * radius;
    feather.position.y = Math.sin(angle) * radius;
    feather.position.z = 0;
    feather.rotation.z = angle - Math.PI / 2;
    cocarGroup.add(feather);
}
cocarGroup.position.set(0, 1, -10);
cocarGroup.visible = false;

// --- Procedural Forest (Wireframe with Scan Effect) ---
const forestGroup = new THREE.Group();
scene.add(forestGroup);
forestGroup.visible = false;

const treeGeometries = [];
for (let i = 0; i < 50; i++) {
    const height = 1 + Math.random() * 2;
    const radius = 0.2 + Math.random() * 0.3;
    const treeGeo = new THREE.ConeGeometry(radius, height, 4, 1, true);
    const x = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 10 - 5;
    treeGeo.translate(x, height / 2, z);
    treeGeometries.push(treeGeo);
}

const forestMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ff0000') },
        uScanHeight: { value: -5.0 }
    },
    vertexShader: `
        varying vec3 vPos;
        void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        uniform float uScanHeight;
        varying vec3 vPos;
        void main() {
            vec3 color = uColor * 0.2;
            float scanWidth = 0.5;
            float dist = abs(vPos.y - uScanHeight);
            if (dist < scanWidth) {
                float intensity = 1.0 - (dist / scanWidth);
                color += uColor * intensity * 2.0;
            }
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending
});

treeGeometries.forEach(geo => {
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, forestMaterial);
    forestGroup.add(line);
});

// --- Fire Sparks ---
const sparkCount = 1000;
const sparkGeo = new THREE.BufferGeometry();
const sparkPos = new Float32Array(sparkCount * 3);
const sparkSpeed = new Float32Array(sparkCount);
for(let i=0; i<sparkCount; i++) {
    sparkPos[i*3] = (Math.random() - 0.5) * 20;
    sparkPos[i*3+1] = Math.random() * 10;
    sparkPos[i*3+2] = (Math.random() - 0.5) * 10;
    sparkSpeed[i] = 0.02 + Math.random() * 0.05;
}
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
const sparkMaterial = new THREE.PointsMaterial({ color: 0xff4500, size: 0.1, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, sizeAttenuation: true });
const sparks = new THREE.Points(sparkGeo, sparkMaterial);
scene.add(sparks);
sparks.visible = false;

// --- Rain Particles ---
const rainCount = 1500;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 3);
const rainVel = new Float32Array(rainCount);
for(let i=0; i<rainCount; i++) {
    rainPos[i*3] = (Math.random() - 0.5) * 20;
    rainPos[i*3+1] = Math.random() * 20;
    rainPos[i*3+2] = (Math.random() - 0.5) * 10;
    rainVel[i] = 0.1 + Math.random() * 0.1;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
const rain = new THREE.Points(rainGeo, rainMaterial);
scene.add(rain);
rain.visible = false;

// --- Fireflies ---
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyCount = 50;
const fireflyPositions = new Float32Array(fireflyCount * 3);
const fireflyRandoms = new Float32Array(fireflyCount * 3);
for(let i = 0; i < fireflyCount; i++) {
    fireflyPositions[i * 3] = (Math.random() - 0.5) * 20;
    fireflyPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    fireflyRandoms[i * 3] = Math.random();
    fireflyRandoms[i * 3 + 1] = Math.random();
    fireflyRandoms[i * 3 + 2] = Math.random();
}
fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
fireflyGeometry.setAttribute('aRandom', new THREE.BufferAttribute(fireflyRandoms, 3));
const fireflyMaterial = new THREE.PointsMaterial({ color: 0xffffaa, size: 0.08, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true });
const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);



// --- Custom DOM Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows instantly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with a slight delay (using animate for smoothness)
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
    
    // Three.js Mouse Update
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
    gsap.to(particles.rotation, { x: mouseY * 0.2, y: mouseX * 0.2 + (clock.getElapsedTime() * 0.05), duration: 1 });
});

// Add hover effect for interactive elements
const interactiveElements = document.querySelectorAll('a, button, .knowledge-card, .hero-card, .timeline-item, .chapter-title');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
    });
});
// --- 3D Artifacts (Pottery) ---
const artifactGroup = new THREE.Group();
scene.add(artifactGroup);
artifactGroup.visible = false;
const potteryPoints = [];
for (let i = 0; i < 10; i++) {
    potteryPoints.push(new THREE.Vector2(Math.sin(i * 0.2) * 1 + 0.5, (i - 5) * 0.5));
}
const potteryGeo = new THREE.LatheGeometry(potteryPoints, 20);
const potteryMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513, wireframe: true, transparent: true, opacity: 0.8 });
const pottery = new THREE.Mesh(potteryGeo, potteryMaterial);
artifactGroup.add(pottery);
pottery.rotation.x = Math.PI / 6;

// --- 3D Cosmology (Constellation) ---
const constellationGroup = new THREE.Group();
scene.add(constellationGroup);
constellationGroup.visible = false;
const starCount = 200;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for(let i=0; i<starCount; i++) {
    starPos[i*3] = (Math.random() - 0.5) * 50;
    starPos[i*3+1] = (Math.random() - 0.5) * 30 + 10;
    starPos[i*3+2] = (Math.random() - 0.5) * 20 - 10;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true });
const stars = new THREE.Points(starGeo, starMaterial);
constellationGroup.add(stars);

const jaguarPoints = [
    new THREE.Vector3(-5, 12, -15), new THREE.Vector3(-2, 14, -15), new THREE.Vector3(2, 13, -15),
    new THREE.Vector3(5, 10, -15), new THREE.Vector3(3, 8, -15), new THREE.Vector3(-1, 9, -15),
    new THREE.Vector3(-4, 7, -15)
];
const jaguarGeo = new THREE.BufferGeometry().setFromPoints(jaguarPoints);
const jaguarLine = new THREE.Line(jaguarGeo, new THREE.LineBasicMaterial({ color: 0xa8dadc, transparent: true, opacity: 0.5 }));
constellationGroup.add(jaguarLine);

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();
    if (material && material.uniforms) material.uniforms.uTime.value = elapsedTime;
    if (particles) particles.rotation.y = elapsedTime * 0.05;
    if (typeof cocarGroup !== 'undefined' && cocarGroup.visible) {
        cocarGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;
        cocarGroup.position.y = 1 + Math.sin(elapsedTime) * 0.1;
    }
    if (typeof forestGroup !== 'undefined' && forestGroup.visible) forestMaterial.uniforms.uScanHeight.value = Math.sin(elapsedTime) * 2 + 1;
    if (typeof sparks !== 'undefined' && sparks.visible) {
        const positions = sparks.geometry.attributes.position.array;
        for(let i=0; i<sparkCount; i++) {
            positions[i*3+1] += sparkSpeed[i];
            if(positions[i*3+1] > 10) {
                positions[i*3+1] = 0;
                positions[i*3] = (Math.random() - 0.5) * 20;
            }
        }
        sparks.geometry.attributes.position.needsUpdate = true;
    }
    if (typeof rain !== 'undefined' && rain.visible) {
        const rPositions = rain.geometry.attributes.position.array;
        for(let i=0; i<rainCount; i++) {
            rPositions[i*3+1] -= rainVel[i];
            if(rPositions[i*3+1] < -5) {
                rPositions[i*3+1] = 15;
                rPositions[i*3] = (Math.random() - 0.5) * 20;
            }
        }
        rain.geometry.attributes.position.needsUpdate = true;
    }
    if (typeof fireflies !== 'undefined') {
        const fPositions = fireflies.geometry.attributes.position.array;
        const fRandoms = fireflies.geometry.attributes.aRandom.array;
        for(let i = 0; i < fireflyCount; i++) {
            fPositions[i*3] += Math.sin(elapsedTime + fRandoms[i*3] * 10) * 0.01;
            fPositions[i*3+1] += Math.cos(elapsedTime * 0.8 + fRandoms[i*3+1] * 10) * 0.01;
            fPositions[i*3+2] += Math.sin(elapsedTime * 0.5 + fRandoms[i*3+2] * 10) * 0.01;
        }
        fireflies.geometry.attributes.position.needsUpdate = true;
    }

    if (typeof artifactGroup !== 'undefined' && artifactGroup.visible) {
        artifactGroup.rotation.y += 0.005;
        pottery.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;
    }
    if (typeof constellationGroup !== 'undefined' && constellationGroup.visible) {
        constellationGroup.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- GSAP Scroll Animations ---
function scrambleText(element, text, duration) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const originalText = text || element.innerText;
    const length = originalText.length;
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1 / (duration * 30);
        if (progress >= 1) {
            element.innerText = originalText;
            clearInterval(interval);
            return;
        }
        let result = "";
        for (let i = 0; i < length; i++) {
            if (i < length * progress) result += originalText[i];
            else result += chars[Math.floor(Math.random() * chars.length)];
        }
        element.innerText = result;
    }, 33);
}

const titles = document.querySelectorAll('.chapter-title');
titles.forEach(title => {
    title.dataset.originalText = title.innerText;
    ScrollTrigger.create({
        trigger: title,
        start: "top 80%",
        onEnter: () => {
            gsap.fromTo(title, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
            scrambleText(title, title.dataset.originalText, 1.5);
        }
    });
});

const textBlocks = document.querySelectorAll('.text-block');
textBlocks.forEach(block => {
    gsap.to(block, {
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: {
            trigger: block, start: "top 85%", end: "top 65%", scrub: true, toggleActions: "play none none reverse"
        }
    });
});

const knowledgeSection = document.querySelector('.knowledge-section');
const knowledgeContainer = document.querySelector('.knowledge-container');
if (knowledgeSection && knowledgeContainer) {
    gsap.to(knowledgeContainer, {
        x: () => -(knowledgeContainer.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: knowledgeSection, pin: true, scrub: 1, start: "top top",
            end: () => "+=" + (knowledgeContainer.scrollWidth - window.innerWidth),
            invalidateOnRefresh: true,
            onEnter: () => { cocarGroup.visible = true; gsap.to(cocarGroup.position, { z: 0, duration: 1 }); },
            onLeave: () => { gsap.to(cocarGroup.position, { z: -10, duration: 1, onComplete: () => cocarGroup.visible = false }); },
            onEnterBack: () => { cocarGroup.visible = true; gsap.to(cocarGroup.position, { z: 0, duration: 1 }); },
            onLeaveBack: () => { gsap.to(cocarGroup.position, { z: -10, duration: 1, onComplete: () => cocarGroup.visible = false }); }
        }
    });
}

const tl = gsap.timeline({
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }
});

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.origin.r, g: CONFIG.colors.origin.g, b: CONFIG.colors.origin.b, duration: 1 }, "step1")
.to(material.uniforms.uFormFactor, { value: 0.0, duration: 1 }, "step1")
.to(camera.position, { z: 5, y: 2, duration: 1 }, "step1");

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.connection.r, g: CONFIG.colors.connection.g, b: CONFIG.colors.connection.b, duration: 1 }, "step1")
.to(material.uniforms.uFormFactor, { value: 1.0, duration: 1 }, "step1")
.to(camera.position, { z: 4, y: 1, duration: 1 }, "step1");

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.territory.r, g: CONFIG.colors.territory.g, b: CONFIG.colors.territory.b, duration: 1 }, "step2")
.to(material.uniforms.uFormFactor, { value: 0.5, duration: 1 }, "step2")
.to(camera.position, { z: 3.5, y: 0.8, duration: 1 }, "step2");

tl.to(material.uniforms.uColor.value, { r: 0.545, g: 0.27, b: 0.074, duration: 1 }, "step_artifacts")
.to(material.uniforms.uFormFactor, { value: 1.5, duration: 1 }, "step_artifacts")
.to(camera.position, { z: 3, y: 0.5, duration: 1 }, "step_artifacts");

ScrollTrigger.create({
    trigger: "#chapter-artifacts", start: "top center", end: "bottom center",
    onEnter: () => { if(artifactGroup) artifactGroup.visible = true; },
    onLeave: () => { if(artifactGroup) artifactGroup.visible = false; },
    onEnterBack: () => { if(artifactGroup) artifactGroup.visible = true; },
    onLeaveBack: () => { if(artifactGroup) artifactGroup.visible = false; }
});

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.resistance.r, g: CONFIG.colors.resistance.g, b: CONFIG.colors.resistance.b, duration: 1 }, "step3")
.to(material.uniforms.uFormFactor, { value: 2.0, duration: 1 }, "step3")
.to(camera.position, { z: 3, y: 0.5, duration: 1 }, "step3");

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.fire.r, g: CONFIG.colors.fire.g, b: CONFIG.colors.fire.b, duration: 1 }, "step_fire")
.to(camera.position, { z: 2, y: 0.2, duration: 1 }, "step_fire");

ScrollTrigger.create({
    trigger: "#chapter-fire", start: "top center", end: "bottom center",
    onEnter: () => { forestGroup.visible = true; sparks.visible = true; gsap.to(scene.fog, { density: 0.1, duration: 1 }); },
    onLeave: () => { forestGroup.visible = false; sparks.visible = false; gsap.to(scene.fog, { density: 0.02, duration: 1 }); },
    onEnterBack: () => { forestGroup.visible = true; sparks.visible = true; gsap.to(scene.fog, { density: 0.1, duration: 1 }); },
    onLeaveBack: () => { forestGroup.visible = false; sparks.visible = false; gsap.to(scene.fog, { density: 0.02, duration: 1 }); }
});

ScrollTrigger.create({
    trigger: "#chapter-resistance", start: "top center", end: "bottom center",
    onEnter: () => { if(rain) rain.visible = true; gsap.to(scene.fog, { density: 0.05, duration: 1 }); gsap.to(scene.fog.color, { r: 0, g: 0, b: 0, duration: 1 }); },
    onLeave: () => { if(rain) rain.visible = false; gsap.to(scene.fog, { density: 0.02, duration: 1 }); gsap.to(scene.fog.color, { r: 0.02, g: 0.02, b: 0.02, duration: 1 }); },
    onEnterBack: () => { if(rain) rain.visible = true; gsap.to(scene.fog, { density: 0.05, duration: 1 }); gsap.to(scene.fog.color, { r: 0, g: 0, b: 0, duration: 1 }); },
    onLeaveBack: () => { if(rain) rain.visible = false; gsap.to(scene.fog, { density: 0.02, duration: 1 }); gsap.to(scene.fog.color, { r: 0.02, g: 0.02, b: 0.02, duration: 1 }); }
});

tl.to(material.uniforms.uColor.value, { r: 0.0, g: 0.0, b: 0.2, duration: 1 }, "step_cosmology")
.to(material.uniforms.uFormFactor, { value: 0.0, duration: 1 }, "step_cosmology")
.to(camera.position, { z: 2, y: 5, duration: 1 }, "step_cosmology")
.to(camera.rotation, { x: 0.5, duration: 1 }, "step_cosmology");

ScrollTrigger.create({
    trigger: "#chapter-cosmology", start: "top center", end: "bottom center",
    onEnter: () => { if(constellationGroup) constellationGroup.visible = true; gsap.to(scene.fog, { density: 0.0, duration: 1 }); },
    onLeave: () => { if(constellationGroup) constellationGroup.visible = false; gsap.to(scene.fog, { density: 0.02, duration: 1 }); },
    onEnterBack: () => { if(constellationGroup) constellationGroup.visible = true; gsap.to(scene.fog, { density: 0.0, duration: 1 }); },
    onLeaveBack: () => { if(constellationGroup) constellationGroup.visible = false; gsap.to(scene.fog, { density: 0.02, duration: 1 }); }
});

tl.to(camera.rotation, { x: 0, duration: 1 }, "step_reset_cam");

// Transition to "Heroes" (Deep Earth, Respect)
tl.to(material.uniforms.uColor.value, { r: 0.2, g: 0.1, b: 0.05, duration: 1 }, "step_heroes")
.to(material.uniforms.uFormFactor, { value: 1.0, duration: 1 }, "step_heroes")
.to(camera.position, { z: 4, y: 1, duration: 1 }, "step_heroes");

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.celebration.r, g: CONFIG.colors.celebration.g, b: CONFIG.colors.celebration.b, duration: 1 }, "step4")
.to(material.uniforms.uFormFactor, { value: 1.5, duration: 1 }, "step4")
.to(camera.position, { z: 5, y: 2, duration: 1 }, "step4");

tl.to(material.uniforms.uColor.value, { r: CONFIG.colors.future.r, g: CONFIG.colors.future.g, b: CONFIG.colors.future.b, duration: 1 }, "step5")
.to(material.uniforms.uFormFactor, { value: 0.5, duration: 1 }, "step5")
.to(camera.position, { z: 6, y: 3, duration: 1 }, "step5");



// --- Custom Slider Logic ---
const modalOverlay = document.querySelector('.modal-overlay');
const closeBtn = document.querySelector('.close-modal');
const knowledgeCards = document.querySelectorAll('.knowledge-card');
const slides = document.querySelectorAll('.custom-slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const dotsContainer = document.querySelector('.slider-dots');
let currentSlideIndex = 0;

slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

function updateDots(index) {
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
}

function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    const currentSlide = slides[currentSlideIndex];
    const nextSlide = slides[index];
    const direction = index > currentSlideIndex ? 1 : -1;
    gsap.to(currentSlide, { autoAlpha: 0, x: -100 * direction, duration: 0.5, ease: "power2.inOut", onComplete: () => { currentSlide.classList.remove('active'); gsap.set(currentSlide, { x: 0 }); } });
    nextSlide.classList.add('active');
    gsap.fromTo(nextSlide, { autoAlpha: 0, x: 100 * direction }, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.inOut" });
    const content = nextSlide.querySelector('.slide-content');
    gsap.fromTo(content, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: 0.2, ease: "back.out(1.7)" });
    currentSlideIndex = index;
    updateDots(index);
}

prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));

knowledgeCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        currentSlideIndex = index;
        slides.forEach(s => { s.classList.remove('active'); gsap.set(s, { autoAlpha: 0 }); });
        const targetSlide = slides[currentSlideIndex];
        targetSlide.classList.add('active');
        gsap.set(targetSlide, { autoAlpha: 1 });
        updateDots(currentSlideIndex);
        document.body.style.overflow = 'hidden';
        gsap.to(modalOverlay, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
        const content = targetSlide.querySelector('.slide-content');
        gsap.fromTo(content, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "back.out(1.7)" });
    });
});

function closeModal() {
    gsap.to(modalOverlay, { autoAlpha: 0, duration: 0.4, ease: "power2.in", onComplete: () => { document.body.style.overflow = ''; } });
}
closeBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (modalOverlay.style.visibility !== 'hidden') {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') goToSlide(currentSlideIndex + 1);
        if (e.key === 'ArrowLeft') goToSlide(currentSlideIndex - 1);
    }
});

// --- Audio Manager ---
const audioFiles = {
    'chapter-origin': 'assets/audio/origin.mp3',
    'chapter-connection': 'assets/audio/connection.mp3',
    'chapter-territory': 'assets/audio/territory.mp3',
    'chapter-artifacts': 'assets/audio/artifacts.mp3',
    'chapter-resistance': 'assets/audio/resistance.mp3',
    'chapter-fire': 'assets/audio/fire.mp3',
    'knowledge-stack': 'assets/audio/knowledge.mp3',
    'chapter-cosmology': 'assets/audio/cosmology.mp3',
    'chapter-heroes': 'assets/audio/heroes.mp3',
    'chapter-celebration': 'assets/audio/celebration.mp3',
    'chapter-future': 'assets/audio/future.mp3'
};

let currentAudio = null;
let isMuted = true;
const soundBtn = document.getElementById('sound-toggle');
const soundIcon = soundBtn.querySelector('.sound-icon');

// Preload Audio (Optional: lazy load is better for many files)
const audioElements = {};

Object.keys(audioFiles).forEach(key => {
    const audio = new Audio(audioFiles[key]);
    audio.loop = true;
    audio.volume = 0;
    audioElements[key] = audio;
});

function toggleSound() {
    isMuted = !isMuted;
    if (isMuted) {
        soundIcon.textContent = "OFF";
        soundBtn.classList.remove('playing');
        if (currentAudio) fadeOut(currentAudio);
    } else {
        soundIcon.textContent = "ON";
        soundBtn.classList.add('playing');
        // Find current section and play
        const currentSection = getCurrentSection();
        if (currentSection && audioElements[currentSection]) {
            playAudio(currentSection);
        }
    }
}

soundBtn.addEventListener('click', toggleSound);

function fadeOut(audio) {
    gsap.to(audio, { volume: 0, duration: 1, onComplete: () => audio.pause() });
}

function fadeIn(audio) {
    audio.play().catch(e => console.log("Audio play failed (interaction needed):", e));
    gsap.to(audio, { volume: 0.5, duration: 1 });
}

function playAudio(sectionId) {
    if (isMuted) return;
    
    const newAudio = audioElements[sectionId];
    if (!newAudio) return;

    if (currentAudio && currentAudio !== newAudio) {
        fadeOut(currentAudio);
    }

    if (currentAudio !== newAudio) {
        currentAudio = newAudio;
        fadeIn(currentAudio);
    }
}

function getCurrentSection() {
    // Simple check based on scroll position or active class
    // We can rely on ScrollTrigger callbacks instead
    return null; 
}

// Update ScrollTriggers to handle audio
chapters.forEach((id) => {
    const sectionId = id.replace('#', '');
    ScrollTrigger.create({
        trigger: id,
        start: "top center",
        end: "bottom center",
        onEnter: () => playAudio(sectionId),
        onEnterBack: () => playAudio(sectionId)
    });
});

// --- Timeline Navigation Logic ---
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineProgress = document.querySelector('.timeline-progress');

chapters.forEach((id, index) => {
    const section = document.querySelector(id);
    if (section) {
        ScrollTrigger.create({
            trigger: section, start: "top center", end: "bottom center",
            onEnter: () => updateTimeline(index), onEnterBack: () => updateTimeline(index)
        });
    }
});

function updateTimeline(index) {
    timelineItems.forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });
    const progress = (index / (chapters.length - 1)) * 100;
    gsap.to(timelineProgress, { height: `${progress}%`, duration: 0.5, ease: "power2.out" });
}

timelineItems.forEach((item) => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('data-target');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            gsap.to(window, { duration: 1.5, scrollTo: { y: targetSection, autoKill: false }, ease: "power3.inOut" });
        }
    });
});

// --- Heroes Gallery Logic ---
const heroCards = document.querySelectorAll('.hero-card');
heroCards.forEach(card => {
    card.addEventListener('click', () => {
        heroCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
    card.addEventListener('mouseenter', () => {
        if (!card.classList.contains('active') && window.innerWidth > 768) {
            gsap.to(card, { filter: "grayscale(0%) brightness(0.9)", duration: 0.3 });
        }
    });
    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('active') && window.innerWidth > 768) {
            gsap.to(card, { filter: "grayscale(100%) brightness(0.7)", duration: 0.3 });
        }
    });
});