// 1. Setup Smooth Scrolling Engine
const lenis = new Lenis({ duration: 1.5, smooth: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 2. THREE.JS WEBGL SETUP
// ==========================================
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
const mainGroup = new THREE.Group();
scene.add(mainGroup);

const geometry = new THREE.TorusKnotGeometry(9, 2.5, 200, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1, wireframe: true });
const coreMesh = new THREE.Mesh(geometry, material);
coreMesh.scale.set(0, 0, 0);
mainGroup.add(coreMesh);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 100; }
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
const thunderLight = new THREE.PointLight(0xffea00, 0, 100);
thunderLight.position.set(0, 0, 10);
scene.add(thunderLight);

const Sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(35, Sizes.width / Sizes.height, 0.1, 1000);
camera.position.z = 60;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(Sizes.width, Sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener('resize', () => {
    Sizes.width = window.innerWidth; Sizes.height = window.innerHeight;
    camera.aspect = Sizes.width / Sizes.height; camera.updateProjectionMatrix();
    renderer.setSize(Sizes.width, Sizes.height);
});

// ==========================================
// 3. THE VIDEO SYNC & TITAN REVEAL TIMING
// ==========================================
const startBtn = document.getElementById('start-btn');
const enterScreen = document.getElementById('enter-screen');
const video = document.getElementById('intro-video');
const mainSite = document.getElementById('main-site');

const VIDEO_START_TIME = 15.0;
const TRANSFORMATION_TIME = 20.0;

let transformationTriggered = false;
const introTl = gsap.timeline({ paused: true });

introTl.to("#flash-overlay", { opacity: 1, duration: 0.05, ease: "power4.in" })
    .call(() => {
        mainSite.style.opacity = 1;
        mainSite.style.pointerEvents = "all";
        gsap.to(video, { opacity: 0, duration: 0.2 });
    })
    .to("#flash-overlay", { opacity: 0, duration: 0.1 })
    .to("#flash-overlay", { opacity: 0.8, duration: 0.05 })
    .to("body", { x: -15, y: 15, duration: 0.05, yoyo: true, repeat: 7 }, "-=0.2")
    .to("#flash-overlay", { opacity: 0, duration: 0.8, ease: "power2.out" })
    .to(thunderLight, { intensity: 50, duration: 0.1 }, "-=0.8")
    .to(thunderLight, { intensity: 2, duration: 2 }, "-=0.7")
    .to(coreMesh.scale, { x: 1, y: 1, z: 1, duration: 2.5, ease: "elastic.out(1, 0.3)" }, "-=0.8")
    .to(coreMesh.rotation, { x: Math.PI * 2, y: Math.PI * 2, duration: 3, ease: "power3.out" }, "-=2.5")
    .to(particlesMaterial, { opacity: 0.8, duration: 1 }, "-=1.5")
    .to(".hero-title", { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out", stagger: 0.2 }, "-=2")
    .to([".top-bar", ".bottom-bar", ".scroll-indicator"], { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power2.out" }, "-=1.2");

startBtn.addEventListener('click', () => {
    gsap.to(enterScreen, { opacity: 0, duration: 0.5, onComplete: () => enterScreen.style.display = 'none' });
    video.style.display = 'block';
    video.currentTime = VIDEO_START_TIME;
    video.play();
});

video.addEventListener('timeupdate', () => {
    if (video.currentTime >= TRANSFORMATION_TIME && !transformationTriggered) {
        transformationTriggered = true;
        introTl.play();
    }
});

// ==========================================
// 4. MOUSE PARALLAX FRAME LOOP
// ==========================================
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0, currentScroll = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
});
window.addEventListener('scroll', () => { currentScroll = window.scrollY; });

const clock = new THREE.Clock();
const tick = () => {
    const time = clock.getElapsedTime();
    targetX = mouseX * 0.001; targetY = mouseY * 0.001;
    mainGroup.rotation.y += 0.002; mainGroup.rotation.x += 0.001;
    mainGroup.rotation.y += 0.05 * (targetX - mainGroup.rotation.y);
    mainGroup.rotation.x += 0.05 * (targetY - mainGroup.rotation.x);
    particlesMesh.rotation.y = -mouseX * 0.0001 + time * 0.05;
    particlesMesh.rotation.x = -mouseY * 0.0001;
    mainGroup.position.y = currentScroll * -0.015;
    particlesMesh.position.y = currentScroll * 0.01;
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();

const card = document.querySelector('.glass-card');
const glow = document.querySelector('.glow-effect');
if (card && glow) {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        glow.style.left = `${e.clientX - rect.left}px`;
        glow.style.top = `${e.clientY - rect.top}px`;
    });
}

gsap.from(".animate-text", {
    scrollTrigger: { trigger: ".premium-dashboard", start: "top 80%" },
    y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
});

// ==========================================
// 5. ANIMATED ROUTER SYSTEM ARCHITECTURE
// ==========================================
let selectionState = { class: '', category: '', subject: '', module: '' };

const subjectDatabase = {
    '10th': ['Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Geography', 'Economics', 'I.T.'],
    'JEE': ['Physics', 'Chemistry', 'Math'],
    'NEET': ['Physics', 'Chemistry', 'Biology'],
    'School_11_12': ['Physics', 'Chemistry', 'Math', 'Biology', 'I.P.', 'Phy Edu', 'Fine Arts', 'Eng']
};

// High fidelity file sizes and extensions database mapping criteria
const chapterDatabase = {
    'Physics': [
        { title: 'Units & Measurements', size: '2.4 MB' },
        { title: 'Motion in a Straight Line', size: '3.1 MB' },
        { title: 'Motion in a Plane', size: '4.2 MB' },
        { title: 'Laws of Motion', size: '5.0 MB' },
        { title: 'Work, Energy & Power', size: '3.8 MB' }
    ],
    'Chemistry': [
        { title: 'Some Basic Concepts', size: '1.9 MB' },
        { title: 'Structure of Atom', size: '4.5 MB' },
        { title: 'Classification of Elements', size: '2.8 MB' },
        { title: 'Chemical Bonding', size: '5.2 MB' }
    ],
    'Math': [
        { title: 'Sets & Relations', size: '2.1 MB' },
        { title: 'Trigonometric Functions', size: '6.0 MB' },
        { title: 'Complex Numbers', size: '4.1 MB' },
        { title: 'Linear Inequalities', size: '1.8 MB' }
    ]
};

function animateNodeReveal(targetSelector) {
    const element = document.querySelector(targetSelector);
    element.classList.remove('hidden-node');

    gsap.fromTo(element,
        { opacity: 0, y: 30, scaleY: 0.9 },
        { opacity: 1, y: 0, scaleY: 1, duration: 0.6, ease: "power4.out" }
    );

    gsap.from(element.querySelectorAll('.chip-btn, span, .chapter-row'), {
        opacity: 0, scale: 0.9, y: 15, duration: 0.4, stagger: 0.08, ease: "power2.out", clearProps: "all"
    });
}

function selectClass(className) {
    selectionState.class = className;
    setActiveChip('step-class', className);

    gsap.to(['#step-category', '#step-subject', '#step-module', '#test-engine-view', '#jee-suboptions', '#resource-vault-view'], {
        opacity: 0, y: 10, duration: 0.3, onComplete: () => {
            document.getElementById('step-category').classList.add('hidden-node');
            document.getElementById('step-subject').classList.add('hidden-node');
            document.getElementById('step-module').classList.add('hidden-node');
            document.getElementById('test-engine-view').classList.add('hidden-node');
            document.getElementById('jee-suboptions').classList.add('hidden-node');
            document.getElementById('resource-vault-view').classList.add('hidden-node');
        }
    });

    setTimeout(() => {
        if (className === '10th') {
            renderSubjects(subjectDatabase['10th']);
        } else {
            animateNodeReveal('#step-category');
            resetChips('step-category');
        }
        lenis.scrollTo('.premium-dashboard', { offset: -50 });
    }, 350);
}

function selectCategory(catName) {
    selectionState.category = catName;
    setActiveChip('step-category', catName);

    gsap.to(['#step-module', '#test-engine-view', '#jee-suboptions', '#resource-vault-view'], {
        opacity: 0, y: 10, duration: 0.3, onComplete: () => {
            document.getElementById('step-module').classList.add('hidden-node');
            document.getElementById('test-engine-view').classList.add('hidden-node');
            document.getElementById('jee-suboptions').classList.add('hidden-node');
            document.getElementById('resource-vault-view').classList.add('hidden-node');
        }
    });

    setTimeout(() => {
        if (catName === 'JEE') renderSubjects(subjectDatabase['JEE']);
        else if (catName === 'NEET') renderSubjects(subjectDatabase['NEET']);
        else renderSubjects(subjectDatabase['School_11_12']);
    }, 350);
}

function renderSubjects(subjectsList) {
    const container = document.getElementById('subject-chips');
    container.innerHTML = '';
    subjectsList.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'chip-btn';
        btn.innerText = sub;
        btn.onclick = () => selectSubject(sub, btn);
        container.appendChild(btn);
    });
    animateNodeReveal('#step-subject');
}

function selectSubject(subName, element) {
    selectionState.subject = subName;
    const parent = document.getElementById('step-subject');
    parent.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');

    gsap.to(['#test-engine-view', '#jee-suboptions', '#resource-vault-view'], {
        opacity: 0, duration: 0.2, onComplete: () => {
            document.getElementById('test-engine-view').classList.add('hidden-node');
            document.getElementById('jee-suboptions').classList.add('hidden-node');
            document.getElementById('resource-vault-view').classList.add('hidden-node');
        }
    });

    setTimeout(() => {
        animateNodeReveal('#step-module');
        resetChips('step-module');
    }, 250);
}

function selectModule(modName) {
    selectionState.module = modName;
    setActiveChip('step-module', modName);

    document.getElementById('test-engine-view').classList.add('hidden-node');
    document.getElementById('jee-suboptions').classList.add('hidden-node');
    document.getElementById('resource-vault-view').classList.add('hidden-node');

    setTimeout(() => {
        if (modName === 'Test') {
            if (selectionState.category === 'JEE') {
                animateNodeReveal('#jee-suboptions');
            } else {
                launchTestEngine('Standard Assessment');
            }
        } else {
            launchResourceVault(modName);
        }
    }, 250);
}

// ==========================================
// 6. DYNAMIC STATIC PDF DOCUMENT RESOURCE VAULT
// ==========================================
function launchResourceVault(moduleType) {
    const vaultPanel = document.getElementById('resource-vault-view');
    const headerTitle = document.getElementById('vault-header-title');
    const listTarget = document.getElementById('chapter-list-target');

    headerTitle.innerText = `Secure File Stream Engine // Target Node: ${selectionState.subject} -> ${moduleType}`;
    listTarget.innerHTML = '';

    const files = chapterDatabase[selectionState.subject] || [
        { title: 'Introduction General Parameters', size: '1.2 MB' },
        { title: 'Core Target Mechanics Framework', size: '2.5 MB' }
    ];

    files.forEach((file) => {
        // Formulate a structured clean file name matching criteria
        const generatedFileName = `${selectionState.subject}_${moduleType}_${file.title.replace(/\s+/g, '')}.pdf`;

        const row = document.createElement('div');
        row.className = 'chapter-row';
        row.innerHTML = `
            <div class="pdf-info-block">
                <div class="pdf-icon-badge">PDF</div>
                <div class="chapter-meta">
                    <h5>${file.title}</h5>
                    <p>Size: ${file.size} | Extended Resource Node</p>
                </div>
            </div>
            <button class="vault-action-btn" onclick="openPdfViewer('${generatedFileName}')">VIEW PDF</button>
        `;
        listTarget.appendChild(row);
    });

    animateNodeReveal('#resource-vault-view');
    setTimeout(() => { lenis.scrollTo('#resource-vault-view', { offset: -40 }); }, 150);
}

// ==========================================
// 7. IN-APP REALTIME PDF VIEW MODAL ENGINE CONTROL
// ==========================================
function openPdfViewer(fileName) {
    document.getElementById('pdf-modal-filename').innerText = fileName.toLowerCase();
    const modal = document.getElementById('pdf-viewer-modal');
    modal.classList.remove('hidden-pdf-viewer');
    lenis.stop(); // Temporarily pause main background page parallax scroll activity
}

function closePdfViewer() {
    const modal = document.getElementById('pdf-viewer-modal');
    modal.classList.add('hidden-pdf-viewer');
    lenis.start(); // Unleash scrollbar activity back
}

// ==========================================
// 8. ONLINE CBT EXAMINATION MOCK SYSTEM ENGINE
// ==========================================
const mockQuestions = [
    { q: "Evaluate the dimensional framework matching Planck's Constant vector forces.", a: "M L² T⁻¹", b: "M L T⁻²", c: "M L⁻¹ T⁻¹", d: "M² L T²" },
    { q: "Isolate the configuration limit function matrix value as delta approach infinity.", a: "Zero state value", b: "Absolute infinite matrix", c: "Indeterminate baseline vector", d: "Unity configuration constraint" },
    { q: "Determine primary resonance constraints on an isolated particle configuration system.", a: "Lambda phase resonance factor alpha", b: "Symmetric vector equilibrium node", c: "Quantized threshold parameters", d: "Inverse frequency attenuation wave" }
];
let activeQuesIndex = 0;

function launchTestEngine(type) {
    const panel = document.getElementById('test-engine-view');
    panel.classList.remove('hidden-node');

    gsap.fromTo(panel,
        { opacity: 0, scale: 0.95, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power4.out" }
    );

    const palette = document.getElementById('palette-container');
    palette.innerHTML = '';
    mockQuestions.forEach((_, idx) => {
        const numBtn = document.createElement('button');
        numBtn.className = `palette-num ${idx === 0 ? 'active' : ''}`;
        numBtn.innerText = idx + 1;
        numBtn.onclick = () => loadQuestion(idx);
        palette.appendChild(numBtn);
    });

    gsap.to('.palette-num', { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" });
    loadQuestion(0);
    setTimeout(() => { lenis.scrollTo('#test-engine-view', { offset: -40 }); }, 150);
}

function loadQuestion(index) {
    activeQuesIndex = index;
    const nums = document.querySelectorAll('.palette-num');
    nums.forEach((n, i) => {
        if (i === index) n.classList.add('active');
        else n.classList.remove('active');
    });

    const qBox = document.getElementById('animated-question-box');
    const oBox = document.getElementById('animated-options-box');
    const data = mockQuestions[index];

    gsap.timeline()
        .to([qBox, oBox], { opacity: 0, x: -20, duration: 0.25, ease: "power2.in" })
        .call(() => {
            document.getElementById('current-question-text').innerText = `${index + 1}. ${data.q}`;
            document.getElementById('text-opt-a').innerText = data.a;
            document.getElementById('text-opt-b').innerText = data.b;
            document.getElementById('text-opt-c').innerText = data.c;
            document.getElementById('text-opt-d').innerText = data.d;
            document.querySelectorAll('input[name="quiz-opt"]').forEach(input => input.checked = false);
        })
        .fromTo([qBox, oBox],
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power3.out" }
        );
}

function testAction(action) {
    if (action === 'next') {
        if (activeQuesIndex < mockQuestions.length - 1) loadQuestion(activeQuesIndex + 1);
    } else if (action === 'prev') {
        if (activeQuesIndex > 0) loadQuestion(activeQuesIndex - 1);
    } else if (action === 'save') {
        gsap.fromTo('.palette-num.active', { scale: 1.3 }, { scale: 1, duration: 0.3, ease: "bounce.out" });
    } else if (action === 'submit') {
        alert("Ecosystem Verification System: Structural Assessment Matrix submitted successfully.");
        gsap.to('#test-engine-view', {
            opacity: 0, scale: 0.95, y: 30, duration: 0.5, onComplete: () => {
                document.getElementById('test-engine-view').classList.add('hidden-node');
            }
        });
    }
}

function setActiveChip(stepId, text) {
    const container = document.getElementById(stepId);
    container.querySelectorAll('.chip-btn').forEach(btn => {
        if (btn.innerText === text) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
}
function resetChips(stepId) {
    document.getElementById(stepId).querySelectorAll('.chip-btn').forEach(b => b.classList.remove('selected'));
}