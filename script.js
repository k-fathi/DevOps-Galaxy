
// --- 1. CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCaLP4Ng0pe8AlX_0KUxgkfg7Kv9YA3nhY",
    authDomain: "devops-roadmap-x3.firebaseapp.com",
    projectId: "devops-roadmap-x3",
    storageBucket: "devops-roadmap-x3.firebasestorage.app",
    messagingSenderId: "230335947923",
    appId: "1:230335947923:web:d677f108b0cc9914519966",
    measurementId: "G-YPE10L62ZC"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence for better reliability
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Persistence failed: Multiple tabs open");
    } else if (err.code === 'unimplemented') {
        console.warn("Persistence failed: Browser does not support it");
    }
});

// --- 2. DATA (Initial Seed) ---
const initialRoadmapData = [
    {
        id: 1, slug: "linux", title: "Linux Adminstration", topics: [
            // Linux Admin 1 Module
            { id: "t1-a1", title: "Permissions & Users", module: "admin-1", videoUrl: "", notes: "" },
            { id: "t1-a2", title: "Package Management", module: "admin-1", videoUrl: "", notes: "" },
            { id: "t1-a3", title: "Process Management", module: "admin-1", videoUrl: "", notes: "" },
            { id: "t1-a4", title: "File System Basics", module: "admin-1", videoUrl: "", notes: "" },
            { id: "t1-a5", title: "Shell & Environment", module: "admin-1", videoUrl: "", notes: "" },
            // Linux Admin 2 Module
            { id: "t1-b1", title: "SSH Security", module: "admin-2", videoUrl: "", notes: "" },
            { id: "t1-b2", title: "IP/DNS/Ports", module: "admin-2", videoUrl: "", notes: "" },
            { id: "t1-b3", title: "Firewalls (iptables/ufw)", module: "admin-2", videoUrl: "", notes: "" },
            { id: "t1-b4", title: "Service Management", module: "admin-2", videoUrl: "", notes: "" },
            { id: "t1-b5", title: "Disk & Storage", module: "admin-2", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 2, slug: "gnubash", title: "Bash Scripting", topics: [
            { id: "t2-1", title: "Variables", videoUrl: "", notes: "" },
            { id: "t2-2", title: "Loops & Logic", videoUrl: "", notes: "" },
            { id: "t2-3", title: "Functions", videoUrl: "", notes: "" },
            { id: "t2-4", title: "Error Handling", videoUrl: "", notes: "" },
            { id: "t2-5", title: "Redirection", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 3, slug: "git", title: "Git & GitHub", topics: [
            { id: "t3-1", title: "Branching", videoUrl: "", notes: "" },
            { id: "t3-2", title: "Pull Requests", videoUrl: "", notes: "" },
            { id: "t3-3", title: "Git Flow", videoUrl: "", notes: "" },
            { id: "t3-4", title: "Rebase", videoUrl: "", notes: "" },
            { id: "t3-5", title: "Hooks", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 4, slug: "nginx", title: "Web Serving", topics: [
            { id: "t4-1", title: "Nginx Basics", videoUrl: "", notes: "" },
            { id: "t4-2", title: "Reverse Proxy", videoUrl: "", notes: "" },
            { id: "t4-3", title: "Load Balancing", videoUrl: "", notes: "" },
            { id: "t4-4", title: "SSL/Certbot", videoUrl: "", notes: "" },
            { id: "t4-5", title: "Caddy", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 5, slug: "docker", title: "Docker", topics: [
            { id: "t5-1", title: "Compose", videoUrl: "", notes: "" },
            { id: "t5-2", title: "Multi-stage Builds", videoUrl: "", notes: "" },
            { id: "t5-3", title: "Networking", videoUrl: "", notes: "" },
            { id: "t5-4", title: "Volumes", videoUrl: "", notes: "" },
            { id: "t5-5", title: "Registry", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 6, slug: "kubernetes", title: "Kubernetes", topics: [
            { id: "t6-1", title: "Architecture", videoUrl: "", notes: "" },
            { id: "t6-2", title: "K3s/Minikube", videoUrl: "", notes: "" },
            { id: "t6-3", title: "EKS/GKE", videoUrl: "", notes: "" },
            { id: "t6-4", title: "Helm", videoUrl: "", notes: "" },
            { id: "t6-5", title: "RBAC", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 7, slug: "argo", title: "GitOps", topics: [
            { id: "t7-1", title: "ArgoCD Basics", videoUrl: "", notes: "" },
            { id: "t7-2", title: "App of Apps", videoUrl: "", notes: "" },
            { id: "t7-3", title: "Sync Policies", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 8, slug: "prometheus", title: "Observability", topics: [
            // Prometheus Module
            { id: "t8-p1", title: "Installation & Setup", module: "prometheus", videoUrl: "", notes: "" },
            { id: "t8-p2", title: "PromQL Basics", module: "prometheus", videoUrl: "", notes: "" },
            { id: "t8-p3", title: "Exporters", module: "prometheus", videoUrl: "", notes: "" },
            { id: "t8-p4", title: "Service Discovery", module: "prometheus", videoUrl: "", notes: "" },
            { id: "t8-p5", title: "AlertManager", module: "prometheus", videoUrl: "", notes: "" },
            // Grafana Module
            { id: "t8-g1", title: "Dashboard Basics", module: "grafana", videoUrl: "", notes: "" },
            { id: "t8-g2", title: "Data Sources", module: "grafana", videoUrl: "", notes: "" },
            { id: "t8-g3", title: "Panels & Variables", module: "grafana", videoUrl: "", notes: "" },
            { id: "t8-g4", title: "Alerting in Grafana", module: "grafana", videoUrl: "", notes: "" },
            // ELK Module
            { id: "t8-e1", title: "Elasticsearch Setup", module: "elk", videoUrl: "", notes: "" },
            { id: "t8-e2", title: "Logstash Pipelines", module: "elk", videoUrl: "", notes: "" },
            { id: "t8-e3", title: "Kibana Dashboards", module: "elk", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 9, slug: "jenkins", title: "CI/CD", topics: [
            // Jenkins Module
            { id: "t9-j1", title: "Jenkins Installation", module: "jenkins", videoUrl: "", notes: "" },
            { id: "t9-j2", title: "Freestyle Jobs", module: "jenkins", videoUrl: "", notes: "" },
            { id: "t9-j3", title: "Pipeline as Code", module: "jenkins", videoUrl: "", notes: "" },
            { id: "t9-j4", title: "Jenkinsfile Syntax", module: "jenkins", videoUrl: "", notes: "" },
            { id: "t9-j5", title: "Plugins & Agents", module: "jenkins", videoUrl: "", notes: "" },
            // GitHub Actions Module
            { id: "t9-g1", title: "Workflow Basics", module: "github-actions", videoUrl: "", notes: "" },
            { id: "t9-g2", title: "YAML Syntax", module: "github-actions", videoUrl: "", notes: "" },
            { id: "t9-g3", title: "Secrets & Env", module: "github-actions", videoUrl: "", notes: "" },
            { id: "t9-g4", title: "Matrix Builds", module: "github-actions", videoUrl: "", notes: "" },
            { id: "t9-g5", title: "Reusable Workflows", module: "github-actions", videoUrl: "", notes: "" },
            // GitLab CI Module
            { id: "t9-l1", title: "GitLab Runner", module: "gitlab-ci", videoUrl: "", notes: "" },
            { id: "t9-l2", title: ".gitlab-ci.yml", module: "gitlab-ci", videoUrl: "", notes: "" },
            { id: "t9-l3", title: "Stages & Jobs", module: "gitlab-ci", videoUrl: "", notes: "" },
            { id: "t9-l4", title: "Artifacts & Cache", module: "gitlab-ci", videoUrl: "", notes: "" },
            // General CI/CD Concepts
            { id: "t9-c1", title: "Blue/Green Deploy", module: "concepts", videoUrl: "", notes: "" },
            { id: "t9-c2", title: "Canary Releases", module: "concepts", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 10, slug: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/cloudstream.svg", title: "Cloud", topics: [
            { id: "t10-1", title: "EC2 & VPC", videoUrl: "", notes: "" },
            { id: "t10-2", title: "S3", videoUrl: "", notes: "" },
            { id: "t10-3", title: "IAM", videoUrl: "", notes: "" },
            { id: "t10-4", title: "RDS", videoUrl: "", notes: "" },
            { id: "t10-5", title: "Route53", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 11, slug: "terraform", title: "Terraform", topics: [
            { id: "t11-1", title: "HCL Syntax", videoUrl: "", notes: "" },
            { id: "t11-2", title: "State Mgmt", videoUrl: "", notes: "" },
            { id: "t11-3", title: "Modules", videoUrl: "", notes: "" },
            { id: "t11-4", title: "Workspaces", videoUrl: "", notes: "" },
            { id: "t11-5", title: "Backends", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 12, slug: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/owasp-zap.png", title: "DevSecOps", topics: [
            { id: "t12-1", title: "SonarQube", videoUrl: "", notes: "" },
            { id: "t12-2", title: "Trivy", videoUrl: "", notes: "" },
            { id: "t12-3", title: "Vault", videoUrl: "", notes: "" },
            { id: "t12-4", title: "Compliance", videoUrl: "", notes: "" }
        ]
    },
    {
        id: 13, slug: "ansible", title: "Ansible", topics: [
            { id: "t13-1", title: "Playbooks", videoUrl: "", notes: "" },
            { id: "t13-2", title: "Roles", videoUrl: "", notes: "" },
            { id: "t13-3", title: "Inventory", videoUrl: "", notes: "" },
            { id: "t13-4", title: "Ansible Vault", videoUrl: "", notes: "" }
        ]
    }
];

let roadmapNodes = []; // Fetched dynamically
let parallelNodes = []; // Fetched dynamically

// ADMIN CONFIG
// ADMIN CONFIG
let isAdmin = false;
let currentModalNode = null;
let currentProofTopicId = null;
let isEditMode = false;

async function checkAdminStatus(userEmail) {
    try {
        const doc = await db.collection('settings').doc('admin_config').get();
        if (doc.exists) {
            const data = doc.data();
            const emails = data.admin_emails || [];
            return emails.includes(userEmail);
        }
    } catch (error) {
        console.error("Error fetching admin config:", error);
    }
    return false;
}


// --- 3. STATE ---
let currentUser = null;
let userData = {
    logs: {},     // { nodeId: [{date, text}] }
    resources: {},// { nodeId: [{title, url}] }
    vaultName: "",
    joinedDate: ""
};
// --- 4. AUTH & INIT ---
// Show Auth Overlay with correct form
function showAuth(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (formType === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
    document.getElementById('auth-overlay').classList.remove('hidden');
}

auth.onAuthStateChanged(async (user) => {
    const landing = document.getElementById('landing-container');
    const authOverlay = document.getElementById('auth-overlay');
    const mainApp = document.getElementById('main-app-container');

    if (user) {
        currentUser = user;

        // PERFORMANCE: Hide Landing to pause animation
        landing.classList.add('hidden');
        authOverlay.classList.add('hidden');

        // Show Main App
        mainApp.classList.remove('hidden');

        // Admin Check
        const isUserAdmin = await checkAdminStatus(user.email);
        if (isUserAdmin) {
            isAdmin = true;
            const adminToggleContainer = document.getElementById('header-admin-toggle-container');
            if (adminToggleContainer) adminToggleContainer.classList.remove('hidden');
            console.log("Welcome Commander. Admin Mode Active.");
        }

        // Show Chat Trigger
        const chatTrigger = document.getElementById('chatbot-trigger');
        if (chatTrigger) chatTrigger.classList.remove('hidden');

        document.getElementById('user-ui').classList.remove('hidden');

        // 1. Fetch Global Roadmap First
        await fetchRoadmap();

        // 2. Load User Data
        await loadUserData(user);

        renderGalaxy();
        renderParallel();
        fetchLeaderboard();
    } else {
        // Show Landing, Hide Everything Else
        landing.classList.remove('hidden');
        mainApp.classList.add('hidden');
        document.getElementById('user-ui').classList.add('hidden');
        authOverlay.classList.add('hidden');

        // Hide Chat Trigger
        const chatTrigger = document.getElementById('chatbot-trigger');
        if (chatTrigger) chatTrigger.classList.add('hidden');
    }
});

async function fetchRoadmap() {
    // 1. Fetch ALL Main Roadmap data
    const snap = await db.collection('global_roadmap').get();

    if (snap.empty) {
        // 🛑 CRITICAL FIX: Removed seedDatabase() and initialRoadmapData
        // Now it safely sets an empty array without overwriting Firestore.
        console.warn("⚠️ Main Roadmap is empty. Waiting for Admin to add courses.");
        roadmapNodes = [];
    } else {
        roadmapNodes = [];
        snap.forEach(doc => {
            const d = doc.data();
            // Ensure ID is a number for the main roadmap
            d.id = parseInt(doc.id);
            // Fallback: If 'order' is missing, use 999 to prevent NaN sorting
            d.order = typeof d.order === 'number' ? d.order : 999;
            roadmapNodes.push(d);
        });

        // Sort safely in JavaScript instead of Firestore
        roadmapNodes.sort((a, b) => a.order - b.order);
    }

    // 2. Fetch ALL Parallel Tracks data
    const pSnap = await db.collection('global_parallel').get();

    if (pSnap.empty) {
        // 🛑 CRITICAL FIX: Removed seedParallel() and hardcoded data
        console.warn("⚠️ Parallel Tracks are empty. Waiting for Admin to add tracks.");
        parallelNodes = [];
    } else {
        parallelNodes = [];
        pSnap.forEach(doc => {
            const d = doc.data();
            // Keep ID as string for parallel tracks (p1, p2, etc.)
            d.id = doc.id;
            // Fallback: If 'order' is missing, use 999 to prevent NaN sorting
            d.order = typeof d.order === 'number' ? d.order : 999;
            parallelNodes.push(d);
        });

        // Sort safely
        parallelNodes.sort((a, b) => a.order - b.order);
    }
}



async function seedDatabase() {
    // Seed main roadmap
    const batch = db.batch();
    initialRoadmapData.forEach(node => {
        const ref = db.collection('global_roadmap').doc(node.id.toString());
        batch.set(ref, node);
    });
    await batch.commit();
    console.log("Main roadmap seeded.");
}

async function seedParallel() {
    const parallelData = [
        { id: "p1", slug: "nodedotjs", title: "Node.js (Backend)", topics: [{ id: "pt1", title: "Event Loop" }, { id: "pt2", title: "Express" }] },
        { id: "p2", slug: "python", title: "Python & Go", topics: [{ id: "pt3", title: "Syntax" }, { id: "pt4", title: "Requests" }] },
        { id: "p3", slug: "postgresql", title: "Databases Ops", topics: [{ id: "pt5", title: "PostgreSQL" }, { id: "pt6", title: "Redis" }] },
        { id: "p4", slug: "n8n", title: "n8n Automation", topics: [{ id: "pt7", title: "Workflows" }, { id: "pt8", title: "Webhooks" }] }
    ];
    const batch = db.batch();
    parallelData.forEach(node => {
        const ref = db.collection('global_parallel').doc(node.id);
        batch.set(ref, node);
    });
    await batch.commit();
    console.log("Parallel nodes seeded.");
}

async function loadUserData(user) {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
        userData = doc.data();
        if (!userData.logs) userData.logs = {}; // Backwards compatibility
        if (!userData.resources) userData.resources = {};
        if (!userData.proofs) userData.proofs = {};
        if (!userData.progress) userData.progress = {};

        // Calculate Global Progress for Header
        const totalP = userData.totalPercent || 0;
        document.getElementById('user-name-display').innerHTML = `👨‍🚀 ${userData.displayName} <span style="color:var(--gold); font-size:0.8rem; margin-left:5px;">(${totalP}%)</span>`;

        userData.vaultName = localStorage.getItem('obsidianVault') || "";
    } else {
        userData = { displayName: user.displayName, photoURL: user.photoURL, progress: {}, logs: {}, resources: {}, proofs: {}, totalPercent: 0, joinedDate: new Date().toISOString() };
        await db.collection('users').doc(user.uid).set(userData);
    }

    // Integrity Check: Ensure joinedDate exists for all users
    if (!userData.joinedDate) {
        let earliest = Date.now();
        Object.values(userData.logs || {}).forEach(logList => {
            logList.forEach(entry => {
                const time = new Date(entry.date).getTime();
                if (time < earliest) earliest = time;
            });
        });
        userData.joinedDate = new Date(earliest).toISOString();
        await db.collection('users').doc(user.uid).update({ joinedDate: userData.joinedDate });
    }
}

async function handleLogin() {
    try { await auth.signInWithEmailAndPassword(document.getElementById('email').value, document.getElementById('password').value); }
    catch (e) { alert(e.message); }
}
async function handleRegister() {
    const n = document.getElementById('reg-name').value;
    if (!n) return alert("Name needed");
    try {
        const cred = await auth.createUserWithEmailAndPassword(document.getElementById('reg-email').value, document.getElementById('reg-pass').value);
        await cred.user.updateProfile({ displayName: n });
        await db.collection('users').doc(cred.user.uid).set({
            displayName: n,
            progress: {}, logs: {}, resources: {}, totalPercent: 0
        });
    } catch (e) { alert(e.message); }
}
function handleLogout() { auth.signOut(); }

async function handleGoogleLogin() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        // Note: User creation/loading is handled by onAuthStateChanged -> loadUserData
    } catch (e) {
        console.error("Google Sign-In Error:", e);
        alert("Google Sign-In failed: " + e.message);
    }
}

function toggleAuthMode() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// --- PROFILE MODAL ---
const BADGES = [
    { name: '🌱 Novice', icon: '🌱', minPercent: 0 },
    { name: '🔨 Apprentice', icon: '🔨', minPercent: 25 },
    { name: '🚀 Specialist', icon: '🚀', minPercent: 50 },
    { name: '🔥 Expert', icon: '🔥', minPercent: 75 },
    { name: '🏛️ Architect', icon: '🏛️', minPercent: 100 }
];

function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    document.getElementById('profile-name-input').value = userData.displayName || currentUser.displayName || '';

    // Render Heatmap before Badges
    renderHeatmap();

    renderBadges();
    modal.classList.add('visible');
}

function renderHeatmap() {
    const container = document.getElementById('activity-heatmap-container');
    if (!container) return;
    container.innerHTML = '';

    // 1. Flatten all log dates
    const allDates = [];
    Object.values(userData.logs || {}).forEach(nodeLogs => {
        nodeLogs.forEach(log => {
            if (log.date) {
                allDates.push(log.date.split('T')[0]); // YYYY-MM-DD
            }
        });
    });

    // 2. Generate last 60 days
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const sq = document.createElement('div');
        sq.className = 'heatmap-sq';
        if (allDates.includes(dateStr)) {
            sq.classList.add('active');
        }

        // Add native tooltip
        sq.title = dateStr + (allDates.includes(dateStr) ? ' (Activity Found)' : ' (No activity)');

        container.appendChild(sq);
    }
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('visible');
}

function renderBadges() {
    const container = document.getElementById('badges-container');
    const progress = userData.totalPercent || 0;
    container.innerHTML = '';

    // Display overall progress percentage explicitly in profile
    const progressDisplay = document.createElement('div');
    progressDisplay.style.cssText = 'width: 100%; text-align: center; margin-bottom: 20px;';
    progressDisplay.innerHTML = `
                <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">${Math.round(progress)}%</div>
                <div style="font-size: 0.9rem; color: var(--text-muted);">Overall Progress</div>
            `;
    container.appendChild(progressDisplay);

    BADGES.forEach(badge => {
        const isUnlocked = progress >= badge.minPercent;
        container.innerHTML += `
                    <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}">
                        <span class="badge-icon">${badge.icon}</span>
                        <span class="badge-name">${badge.name}</span>
                    </div>
                `;
    });
}

async function updateDisplayName() {
    const newName = document.getElementById('profile-name-input').value.trim();
    if (!newName) {
        alert('Please enter a valid name');
        return;
    }

    try {
        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update({
            displayName: newName
        });

        // Update local userData
        userData.displayName = newName;

        // Update header display
        document.getElementById('user-name-display').textContent = '👨‍🚀 ' + newName;

        alert('✅ Name updated successfully!');
    } catch (e) {
        alert('Error updating name: ' + e.message);
    }
}

let sortableInstance = null;

// --- HELPER FUNCTIONS ---
function ensureAbsoluteUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return 'https://' + url;
}

function toggleSidePanel() {
    const panel = document.getElementById('side-panel');
    const tipsBox = document.getElementById('devops-tips-box');
    const toggle = panel.querySelector('.panel-toggle');
    panel.classList.toggle('collapsed');

    const isCollapsed = panel.classList.contains('collapsed');
    toggle.textContent = isCollapsed ? '›' : '‹';

    // Sync tips box with panel
    if (tipsBox) {
        tipsBox.classList.toggle('collapsed', isCollapsed);
    }

    // Toggle body class for layout adjustments
    document.body.classList.toggle('panel-open', !isCollapsed);
}

// --- ONE-TIME MIGRATION: Update Observability with Modules ---
// Run this once in console: migrateObservabilityCourse()
async function migrateObservabilityCourse() {
    const newTopics = [
        // Prometheus Module
        { id: "t8-p1", title: "Installation & Setup", module: "prometheus", videoUrl: "", notes: "" },
        { id: "t8-p2", title: "PromQL Basics", module: "prometheus", videoUrl: "", notes: "" },
        { id: "t8-p3", title: "Exporters", module: "prometheus", videoUrl: "", notes: "" },
        { id: "t8-p4", title: "Service Discovery", module: "prometheus", videoUrl: "", notes: "" },
        { id: "t8-p5", title: "AlertManager", module: "prometheus", videoUrl: "", notes: "" },
        // Grafana Module
        { id: "t8-g1", title: "Dashboard Basics", module: "grafana", videoUrl: "", notes: "" },
        { id: "t8-g2", title: "Data Sources", module: "grafana", videoUrl: "", notes: "" },
        { id: "t8-g3", title: "Panels & Variables", module: "grafana", videoUrl: "", notes: "" },
        { id: "t8-g4", title: "Alerting in Grafana", module: "grafana", videoUrl: "", notes: "" },
        // ELK Module
        { id: "t8-e1", title: "Elasticsearch Setup", module: "elk", videoUrl: "", notes: "" },
        { id: "t8-e2", title: "Logstash Pipelines", module: "elk", videoUrl: "", notes: "" },
        { id: "t8-e3", title: "Kibana Dashboards", module: "elk", videoUrl: "", notes: "" }
    ];

    await db.collection('global_roadmap').doc('8').update({ topics: newTopics });
    showToast("✅ Observability course migrated!");
    location.reload();
}

// --- ONE-TIME MIGRATION: Update Linux with Modules ---
// Run this once in console: migrateLinuxCourse()
async function migrateLinuxCourse() {
    const newTopics = [
        // Linux Admin 1 Module
        { id: "t1-a1", title: "Permissions & Users", module: "admin-1", videoUrl: "", notes: "" },
        { id: "t1-a2", title: "Package Management", module: "admin-1", videoUrl: "", notes: "" },
        { id: "t1-a3", title: "Process Management", module: "admin-1", videoUrl: "", notes: "" },
        { id: "t1-a4", title: "File System Basics", module: "admin-1", videoUrl: "", notes: "" },
        { id: "t1-a5", title: "Shell & Environment", module: "admin-1", videoUrl: "", notes: "" },
        // Linux Admin 2 Module
        { id: "t1-b1", title: "SSH Security", module: "admin-2", videoUrl: "", notes: "" },
        { id: "t1-b2", title: "IP/DNS/Ports", module: "admin-2", videoUrl: "", notes: "" },
        { id: "t1-b3", title: "Firewalls (iptables/ufw)", module: "admin-2", videoUrl: "", notes: "" },
        { id: "t1-b4", title: "Service Management", module: "admin-2", videoUrl: "", notes: "" },
        { id: "t1-b5", title: "Disk & Storage", module: "admin-2", videoUrl: "", notes: "" }
    ];

    await db.collection('global_roadmap').doc('1').update({ topics: newTopics });
    showToast("✅ Linux course migrated!");
    location.reload();
}

// --- TOAST NOTIFICATION ---
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- 5. RENDER GALAXY & LINES ---
function renderGalaxy() {
    const container = document.getElementById('solar-systems');

    // Re-render rebuilds DOM.
    document.querySelectorAll('.system-node').forEach(e => e.remove());

    // ZigZag Layout (Compact)
    const rowHeight = 150;
    const colWidth = 160;
    const startX = 340; // Center offset
    const startY = 60;

    let maxY = 0; // Track the lowest point

    roadmapNodes.forEach((node, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        // Zig-Zag logic
        const visualCol = (row % 2 === 0) ? col : (3 - col);

        const x = startX + (visualCol * colWidth);
        const y = startY + (row * rowHeight);

        if (y > maxY) maxY = y;

        const div = document.createElement('div');
        div.className = 'system-node';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.id = `node-${node.id}`;
        div.setAttribute('data-id', node.id); // For Sortable Sort

        const progressList = userData.progress[node.id] || [];
        const done = progressList.length;
        const status = done === (node.topics || []).length ? 'completed' : (done > 0 ? 'in-progress' : 'pending');
        div.setAttribute('data-status', status);

        // Drag Handle
        const dragHandle = isEditMode ? `<div class="drag-handle" style="display:block;">⣿</div>` : '';

        const imgTag = node.slug.startsWith('http')
            ? `<img src="${node.slug}" />`
            : `<img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${node.slug}.png" onerror="this.onerror=null;this.src='https://cdn.simpleicons.org/${node.slug}/white';">`;

        // Percentage Badge logic
        const totalTopics = (node.topics || []).length;
        const percent = totalTopics > 0 ? Math.round((done / totalTopics) * 100) : 0;

        let badgeHtml = '';
        if (totalTopics > 0) {
            badgeHtml = `<div class="percentage-badge">${percent}%</div>`;
        }

        div.innerHTML = `${dragHandle}<div class="planet">${imgTag}</div>${badgeHtml}<div class="node-label">${index + 1}. ${node.title}</div>`;
        div.onclick = () => openModal(node);

        // Admin Edit Mode Controls
        if (isEditMode) {
            // Edit Button
            const editBtn = document.createElement('div');
            editBtn.className = 'edit-node-btn';
            editBtn.innerText = '✏️';
            editBtn.title = 'Edit Node';
            editBtn.onclick = (e) => { e.stopPropagation(); editNode(node); };
            div.appendChild(editBtn);

            // Delete Button
            const delBtn = document.createElement('div');
            delBtn.className = 'delete-btn';
            delBtn.innerText = '✕';
            delBtn.title = 'Delete Node';
            delBtn.onclick = (e) => { e.stopPropagation(); deleteNode(node.id); };
            div.appendChild(delBtn);
        }

        container.appendChild(div);

    });

    // --- GHOST NODE FOR ADDING COURSES (Edit Mode) ---
    if (isEditMode) {
        const index = roadmapNodes.length; // Ensure it's usually at the end
        const row = Math.floor(index / 4);
        const col = index % 4;
        const visualCol = (row % 2 === 0) ? col : (3 - col); // Zig-zag

        // Same positioning logic as main nodes
        const startX = 360;
        const startY = 60;
        const x = startX + (visualCol * 160);
        const y = startY + (row * 150);

        const ghostDiv = document.createElement('div');
        ghostDiv.className = 'system-node ghost-node'; // Wrapper
        ghostDiv.style.left = `${x}px`;
        ghostDiv.style.top = `${y}px`;
        ghostDiv.title = 'Add New Course';
        ghostDiv.onclick = addNewNode;

        // Inner Visual (Matches .planet structure)
        const ghostPlanet = document.createElement('div');
        ghostPlanet.className = 'planet ghost-planet';
        ghostPlanet.innerText = '+';

        ghostDiv.appendChild(ghostPlanet);
        container.appendChild(ghostDiv);

        if (y > maxY) maxY = y;
    }

    // --- FIND AND MARK CURRENT COURSE ---
    // Current Course = First one that is NOT 100% complete
    let activeNodeFound = false;
    // Re-loop to find the dom element because we need sorted order
    // Actually roadmapNodes is already sorted.

    for (const node of roadmapNodes) {
        const pList = userData.progress[node.id] || [];
        const tCount = (node.topics || []).length;
        if (pList.length < tCount && tCount > 0) {
            // This is the active node
            const activeEl = document.getElementById(`node-${node.id}`);
            if (activeEl) {
                const pointer = document.createElement('div');
                pointer.className = 'current-target';
                pointer.innerHTML = '<div class="radar-ring"></div>';
                activeEl.appendChild(pointer);
            }
            activeNodeFound = true;
            break;
        }
    }

    // If all done, maybe point to the last one or nothing? logic: if everything is 100%, no pointer.
    // If nothing started, points to first. Correct.

    // DYNAMIC HEIGHT UPDATE
    // Ensure container grows to fit the lowest node + padding
    const requiredHeight = maxY + 250;
    container.style.height = `${requiredHeight}px`;

    // Draw lines after DOM update
    setTimeout(updateLines, 100);
}

// --- ADMIN FUNCTIONS ---
function toggleEditMode(checked) {
    isEditMode = checked;

    // Toggle body class for CSS targeting
    const sidePanel = document.getElementById('side-panel');
    const panelToggle = sidePanel.querySelector('.panel-toggle');

    if (checked) {
        document.body.classList.add('edit-mode');
        // Auto-Collapse Panel
        sidePanel.classList.add('collapsed');
        panelToggle.textContent = '›';
    } else {
        document.body.classList.remove('edit-mode');
        // Auto-Expand Panel
        sidePanel.classList.remove('collapsed');
        panelToggle.textContent = '‹';
    }

    const galaxy = document.getElementById('solar-systems');

    if (checked) {
        galaxy.classList.add('admin-sort-mode'); // Enable Dual Layout

        // Initialize Sortable
        if (typeof Sortable !== 'undefined') {
            sortableInstance = new Sortable(galaxy, {
                animation: 150,
                handle: '.drag-handle',
                ghostClass: 'sortable-ghost',
                onEnd: function () {
                    saveRoadmapOrder(true);
                }
            });
        }
    } else {
        galaxy.classList.remove('admin-sort-mode'); // Disable Dual Layout

        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }
    }
    renderGalaxy(); // Re-render to show/hide edit controls & handles
    renderParallel();
}

// --- TRULY SMART ICON SEARCH ---
let simpleIconsIndex = null;
let iconSearchDebounce = null;

// Fetch SimpleIcons index (cached)
async function loadSimpleIconsIndex() {
    if (simpleIconsIndex) return simpleIconsIndex;
    try {
        // Use unpkg as the source for the SimpleIcons package data
        const res = await fetch('https://unpkg.com/simple-icons@latest/icons.json');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Build searchable index: [{title, slug}, ...]
        simpleIconsIndex = Object.entries(data).map(([slug, info]) => ({
            slug: slug.toLowerCase(),
            title: (info.title || slug).toLowerCase()
        }));
        console.log(`Smart Icons: Loaded ${simpleIconsIndex.length} icons`);
        return simpleIconsIndex;
    } catch (e) {
        console.warn('Smart Icons: Could not load index, using fallback mode', e);
        simpleIconsIndex = [];
        return simpleIconsIndex;
    }
}

// Simple fuzzy score: how well does query match target?
function fuzzyScore(query, target) {
    if (!query || !target) return 0;
    query = query.toLowerCase();
    target = target.toLowerCase();

    // Exact match = highest score
    if (target === query) return 100;
    // Starts with = very high
    if (target.startsWith(query)) return 80 + (query.length / target.length) * 15;
    // Contains = moderate
    if (target.includes(query)) return 50 + (query.length / target.length) * 20;

    // Character-by-character match (for typos)
    let score = 0, qIdx = 0;
    for (let i = 0; i < target.length && qIdx < query.length; i++) {
        if (target[i] === query[qIdx]) { score += 10; qIdx++; }
    }
    return qIdx === query.length ? score : 0;
}

// Search icons by query
async function searchIcons(query, limit = 5) {
    if (!query || query.length < 2) return [];
    const index = await loadSimpleIconsIndex();
    if (index.length === 0) return [];

    const q = query.toLowerCase().trim();
    const results = index
        .map(icon => ({
            ...icon,
            score: Math.max(fuzzyScore(q, icon.slug), fuzzyScore(q, icon.title))
        }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return results;
}

function updateIconPreview(rawSlug) {
    const slug = rawSlug ? rawSlug.trim().toLowerCase() : '';
    const img = document.getElementById('icon-preview-img');
    const fallback = document.getElementById('icon-preview-fallback');
    const box = document.getElementById('icon-preview-box');

    if (!img || !fallback || !box) return;

    if (!slug) {
        img.style.display = 'none';
        fallback.style.display = 'block';
        box.style.borderColor = '#333';
        return;
    }

    // Set defaults (Loading state / Reset)
    // Don't hide immediately to avoid flicker if same image, but here we change src so it is safer to reset
    img.style.display = 'none';
    fallback.style.display = 'block';

    const onLoadSuccess = () => {
        img.style.display = 'block';
        fallback.style.display = 'none';
        box.style.borderColor = 'var(--success)';
        img.onerror = null; // Prevent loops
    };

    if (slug.startsWith('http')) {
        img.src = slug;
        img.onload = onLoadSuccess;
        img.onerror = () => {
            box.style.borderColor = '#ffab00';
        };
    } else {
        // Fallback Logic: Homarr Labs (PNG) -> SimpleIcons (White SVG)
        const homarrUrl = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${slug}.png`;
        const simpleUrl = `https://cdn.simpleicons.org/${slug}/white`;

        // Attempt to load Homarr first using a temp image to avoid Broken Image icon
        const tempImg = new Image();
        tempImg.src = homarrUrl;

        tempImg.onload = () => {
            img.src = homarrUrl;
            img.onload = onLoadSuccess; // Should fire immediately purely from cache
        };

        tempImg.onerror = () => {
            // Homarr failed, likely not found. Try SimpleIcons directly on the element.
            img.src = simpleUrl;
            img.onload = onLoadSuccess;
            img.onerror = () => {
                // Both failed
                img.style.display = 'none';
                fallback.style.display = 'block';
                box.style.borderColor = '#ffab00';
            };
        };
    }
}

function showIconSuggestions(results) {
    let dropdown = document.getElementById('icon-suggestions');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'icon-suggestions';
        dropdown.style.cssText = 'position:absolute; top:100%; left:0; right:40px; background:#1a1f2e; border:1px solid #333; border-radius:8px; max-height:200px; overflow-y:auto; z-index:1000; display:none;';
        const container = document.getElementById('edit-c-slug')?.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(dropdown);
        }
    }

    if (results.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = results.map(r => `
        <div class="icon-suggestion" data-slug="${r.slug}" style="padding:10px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #222;">
            <img src="https://cdn.simpleicons.org/${r.slug}/white" style="width:20px; height:20px;" onerror="this.style.display='none'">
            <span style="flex:1; color:#fff;">${r.title}</span>
            <span style="font-size:0.7rem; color:#666;">${r.slug}</span>
        </div>
    `).join('');

    dropdown.style.display = 'block';

    // Click handlers
    dropdown.querySelectorAll('.icon-suggestion').forEach(el => {
        el.onmouseover = () => el.style.background = '#2a2f4e';
        el.onmouseout = () => el.style.background = 'transparent';
        el.onclick = () => {
            const slug = el.dataset.slug;
            document.getElementById('edit-c-slug').value = slug;
            updateIconPreview(slug);
            dropdown.style.display = 'none';
        };
    });
}

function hideIconSuggestions() {
    const dropdown = document.getElementById('icon-suggestions');
    if (dropdown) setTimeout(() => dropdown.style.display = 'none', 200);
}

function setupIconListeners() {
    const titleInput = document.getElementById('edit-c-title');
    const slugInput = document.getElementById('edit-c-slug');

    if (titleInput) {
        titleInput.addEventListener('input', async () => {
            if (slugInput.dataset.userEdited) return;
            // Extract first tech keyword
            const words = titleInput.value.toLowerCase().split(/\s+/).filter(w => w.length > 2);
            for (const word of words) {
                const results = await searchIcons(word, 1);
                if (results.length > 0) {
                    slugInput.value = results[0].slug;
                    updateIconPreview(results[0].slug);
                    return;
                }
            }
        });
    }

    if (slugInput) {
        const handleSlugUpdate = () => {
            slugInput.dataset.userEdited = 'true';
            clearTimeout(iconSearchDebounce);
            iconSearchDebounce = setTimeout(async () => {
                const val = slugInput.value;
                if (!val) {
                    updateIconPreview('');
                    return;
                }

                const results = await searchIcons(val);
                showIconSuggestions(results);

                // If exact match in suggestions, prefer it?
                // Or just try updating preview with current value
                // Logic: updating preview with current input is safest
                updateIconPreview(val);

            }, 300);
        };

        slugInput.addEventListener('input', handleSlugUpdate);
        slugInput.addEventListener('change', handleSlugUpdate);
        slugInput.addEventListener('paste', handleSlugUpdate);

        slugInput.addEventListener('blur', hideIconSuggestions);
    }
}

// Initialize listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    setupIconListeners();
    loadSimpleIconsIndex(); // Pre-load for faster searches
});

function editNode(node) {
    document.getElementById('edit-c-id').value = node.id;
    document.getElementById('edit-c-title').value = node.title;
    document.getElementById('edit-c-slug').value = node.slug;
    document.getElementById('edit-c-duration').value = node.duration || "";
    document.getElementById('course-modal-title').innerText = "Edit Course Details";

    // Reset user-edited flag and show preview
    const slugInput = document.getElementById('edit-c-slug');
    if (slugInput) slugInput.dataset.userEdited = '';
    updateIconPreview(node.slug);

    document.getElementById('course-edit-modal').classList.add('visible');
}

function addNewNode() {
    document.getElementById('edit-c-id').value = '';
    document.getElementById('edit-c-title').value = '';
    document.getElementById('edit-c-slug').value = 'linux';
    document.getElementById('edit-c-duration').value = '2 Weeks';
    document.getElementById('course-modal-title').innerText = "Add New Course";

    // Reset user-edited flag and show preview
    const slugInput = document.getElementById('edit-c-slug');
    if (slugInput) slugInput.dataset.userEdited = '';
    updateIconPreview('linux');

    document.getElementById('course-edit-modal').classList.add('visible');
}

async function saveCourseNode() {
    const id = document.getElementById('edit-c-id').value;
    const title = document.getElementById('edit-c-title').value;
    const slug = document.getElementById('edit-c-slug').value;
    const duration = document.getElementById('edit-c-duration').value;

    if (!title) return alert("Title required");

    if (id) {
        // EDIT
        const node = roadmapNodes.find(n => n.id.toString() === id.toString());
        if (node) {
            // Update ONLY provided fields atomically
            const updateData = { title: title };
            node.title = title;

            if (slug) {
                updateData.slug = slug;
                node.slug = slug;
            }
            if (duration) {
                updateData.duration = duration;
                node.duration = duration;
            }

            await db.collection('global_roadmap').doc(id.toString()).update(updateData);
            showToast("✅ Course Updated");
        }
    } else {
        // ADD
        const newId = roadmapNodes.length > 0 ? Math.max(...roadmapNodes.map(n => n.id)) + 1 : 1;
        const newNode = {
            id: newId,
            slug: slug || "linux",
            title: title,
            duration: duration || "",
            topics: [],
            order: 999 // New nodes go to end
        };
        await db.collection('global_roadmap').doc(newId.toString()).set(newNode);
        roadmapNodes.push(newNode);
        showToast("✅ Course Added");
    }
    closeCourseEditModal();
    renderGalaxy();
}

function closeCourseEditModal() {
    document.getElementById('course-edit-modal').classList.remove('visible');
}

async function deleteNode(id) {
    if (!confirm(`Delete node ${id}? This cannot be undone.`)) return;

    roadmapNodes = roadmapNodes.filter(n => n.id !== id);
    renderGalaxy();

    await db.collection('global_roadmap').doc(id.toString()).delete();
}

async function saveRoadmapOrder(isAutoSave = false) {
    // 1. Read DOM Order from Flex Layout
    const container = document.getElementById('solar-systems');
    const children = Array.from(container.children).filter(c => c.classList.contains('system-node'));

    // Critical: Ensure IDs are handled as they are stored (Main is Int)
    const newOrderIds = children.map(c => {
        const idAttr = c.getAttribute('data-id');
        return isNaN(idAttr) ? idAttr : parseInt(idAttr);
    });

    // 2. Re-order array locally
    const newRoadmapNodes = [];
    newOrderIds.forEach(id => {
        const n = roadmapNodes.find(x => x.id === id);
        if (n) newRoadmapNodes.push(n);
    });
    roadmapNodes = newRoadmapNodes;

    // 3. Save to Firestore - UPDATE ONLY 'order' FIELD
    const batch = db.batch();
    roadmapNodes.forEach((n, idx) => {
        const ref = db.collection('global_roadmap').doc(n.id.toString());
        batch.update(ref, {
            order: idx
        });
        n.order = idx; // Update local
    });

    try {
        await batch.commit();
        if (isAutoSave) {
            showToast("✅ Layout Saved");
        } else {
            alert("New Order Saved! Switching back to Galaxy View.");
            // Toggle Off Edit Mode to restore Visual Layout
            document.querySelector('.toggle-switch input').checked = false;
            toggleEditMode(false);
        }
    } catch (error) {
        console.error("Error saving roadmap order:", error);
        showToast("❌ Save Failed");
    }
}

function updateLines() {
    const svg = document.getElementById('constellation-lines');
    if (!svg) return;

    // Clear existing
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    // Add defs for filters
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Glow filter
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "lineGlow");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    filter.innerHTML = `
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            `;
    defs.appendChild(filter);
    svg.appendChild(defs);

    // Add CSS animation style
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `
                @keyframes gradientShift {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -30; }
                }
                .gradient-line {
                    animation: gradientShift 1.5s linear infinite;
                }
            `;
    svg.appendChild(style);

    for (let i = 0; i < roadmapNodes.length - 1; i++) {
        const nodeData = roadmapNodes[i];
        const nextNodeData = roadmapNodes[i + 1];

        const n1 = document.getElementById(`node-${nodeData.id}`);
        const n2 = document.getElementById(`node-${nextNodeData.id}`);

        if (!n1 || !n2) continue;

        const p1 = n1.querySelector('.planet').getBoundingClientRect();
        const p2 = n2.querySelector('.planet').getBoundingClientRect();
        const cRect = document.getElementById('solar-systems').getBoundingClientRect();

        // Centers relative to container
        const c1x = p1.left + p1.width / 2 - cRect.left;
        const c1y = p1.top + p1.height / 2 - cRect.top;
        const c2x = p2.left + p2.width / 2 - cRect.left;
        const c2y = p2.top + p2.height / 2 - cRect.top;

        // Radius (approx half width)
        const r = p1.width / 2;

        // Vector Math for Edge-to-Edge
        const dx = c2x - c1x;
        const dy = c2y - c1y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If too close, don't draw
        if (dist < r * 2) continue;

        // Normalize vector
        const ux = dx / dist;
        const uy = dy / dist;

        // Shorten line by radius + buffer
        const padding = 10;
        const startX = c1x + ux * (r + padding);
        const startY = c1y + uy * (r + padding);
        const endX = c2x - ux * (r + padding);
        const endY = c2y - uy * (r + padding);

        // Create unique gradient for this line
        const gradId = `flowGrad-${i}`;
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("id", gradId);
        gradient.setAttribute("x1", startX);
        gradient.setAttribute("y1", startY);
        gradient.setAttribute("x2", endX);
        gradient.setAttribute("y2", endY);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.innerHTML = `
                    <stop offset="0%" style="stop-color:#00f2ff;stop-opacity:0.8">
                        <animate attributeName="stop-color" values="#00f2ff;#7b2ff7;#00f2ff" dur="3s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="50%" style="stop-color:#7b2ff7;stop-opacity:1">
                        <animate attributeName="stop-color" values="#7b2ff7;#ff00aa;#7b2ff7" dur="3s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" style="stop-color:#bd00ff;stop-opacity:0.8">
                        <animate attributeName="stop-color" values="#bd00ff;#00f2ff;#bd00ff" dur="3s" repeatCount="indefinite"/>
                    </stop>
                `;
        defs.appendChild(gradient);

        // 1. Glow layer (blurred)
        const glowLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        glowLine.setAttribute("x1", startX);
        glowLine.setAttribute("y1", startY);
        glowLine.setAttribute("x2", endX);
        glowLine.setAttribute("y2", endY);
        glowLine.setAttribute("stroke", `url(#${gradId})`);
        glowLine.setAttribute("stroke-width", "6");
        glowLine.setAttribute("stroke-linecap", "round");
        glowLine.setAttribute("filter", "url(#lineGlow)");
        glowLine.setAttribute("opacity", "0.4");
        svg.appendChild(glowLine);

        // 2. Main gradient line
        const mainLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        mainLine.setAttribute("x1", startX);
        mainLine.setAttribute("y1", startY);
        mainLine.setAttribute("x2", endX);
        mainLine.setAttribute("y2", endY);
        mainLine.setAttribute("stroke", `url(#${gradId})`);
        mainLine.setAttribute("stroke-width", "3");
        mainLine.setAttribute("stroke-linecap", "round");
        svg.appendChild(mainLine);

        // 3. Animated dashed overlay for shimmer effect
        const shimmerLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        shimmerLine.setAttribute("x1", startX);
        shimmerLine.setAttribute("y1", startY);
        shimmerLine.setAttribute("x2", endX);
        shimmerLine.setAttribute("y2", endY);
        shimmerLine.setAttribute("stroke", "rgba(255, 255, 255, 0.3)");
        shimmerLine.setAttribute("stroke-width", "2");
        shimmerLine.setAttribute("stroke-dasharray", "5 25");
        shimmerLine.setAttribute("stroke-linecap", "round");
        shimmerLine.setAttribute("class", "gradient-line");
        svg.appendChild(shimmerLine);

        // 4. End point glow dots
        const startDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startDot.setAttribute("cx", startX);
        startDot.setAttribute("cy", startY);
        startDot.setAttribute("r", "4");
        startDot.setAttribute("fill", "#00f2ff");
        startDot.setAttribute("filter", "url(#lineGlow)");
        svg.appendChild(startDot);

        const endDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        endDot.setAttribute("cx", endX);
        endDot.setAttribute("cy", endY);
        endDot.setAttribute("r", "4");
        endDot.setAttribute("fill", "#bd00ff");
        endDot.setAttribute("filter", "url(#lineGlow)");
        svg.appendChild(endDot);

        // Draw Duration Text (if available)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        if (nodeData.duration) {
            // Determine if line is more vertical or horizontal
            const isVertical = Math.abs(dy) > Math.abs(dx);

            let textX = midX;
            let textY = midY;
            let anchor = "middle"; // Default: center horizontally

            if (isVertical) {
                // Vertical line: place text to the right of the TRUE midpoint
                textX = midX + 12;
                anchor = "start"; // Left-align since it's to the right of line
            } else {
                // Horizontal line: place text ABOVE the line with small gap
                textY = midY - 8;
            }

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", textX);
            text.setAttribute("y", textY);
            text.setAttribute("class", "connection-label");
            text.setAttribute("text-anchor", anchor);
            text.setAttribute("dominant-baseline", "central");
            text.setAttribute("alignment-baseline", "central");
            text.textContent = nodeData.duration;
            svg.appendChild(text);
        }
    }

    // Special case: Last node's duration (no arrow, so display below node)
    const lastNode = roadmapNodes[roadmapNodes.length - 1];
    if (lastNode && lastNode.duration) {
        const lastEl = document.getElementById(`node-${lastNode.id}`);
        if (lastEl) {
            const planet = lastEl.querySelector('.planet');
            if (planet) {
                const pRect = planet.getBoundingClientRect();
                const cRect = document.getElementById('solar-systems').getBoundingClientRect();
                const cx = pRect.left + pRect.width / 2 - cRect.left;
                const cy = pRect.bottom - cRect.top + 25; // Below the node

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", cx);
                text.setAttribute("y", cy);
                text.setAttribute("class", "connection-label");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.textContent = lastNode.duration;
                svg.appendChild(text);
            }
        }
    }
}





window.addEventListener('resize', updateLines);

function renderParallel() {
    const container = document.getElementById('tab-parallel');
    container.innerHTML = '';

    // 1. List Container
    const listDiv = document.createElement('div');
    listDiv.id = 'parallel-items-list';
    container.appendChild(listDiv);

    parallelNodes.forEach(node => {
        const done = userData.progress[node.id] || [];
        const total = Math.max((node.topics || []).length, 1);
        const pct = Math.round((done.length / total) * 100);

        const outer = document.createElement('div');
        outer.className = 'parallel-item-wrapper';
        outer.setAttribute('data-id', node.id);
        outer.style.display = 'flex';
        outer.style.alignItems = 'center';
        outer.style.marginBottom = '10px';

        // Admin Controls
        let adminBtns = '';
        if (isEditMode) {
            adminBtns = `
                        <div style="display:flex; gap:5px; margin-right:8px;">
                            <button onclick="deleteParallelNode('${node.id}')" style="background:rgba(255, 0, 0, 0.2); color:#ff4444; border:1px solid #ff4444; border-radius:4px; padding:4px 8px; font-size:0.8rem; cursor:pointer;" title="Delete Track">✕</button>
                            <button onclick="editParallelNode('${node.id}')" style="background:rgba(255, 255, 255, 0.1); color:white; border:1px solid rgba(255,255,255,0.2); border-radius:4px; padding:4px 8px; font-size:0.8rem; cursor:pointer;" title="Edit Track">✏️</button>
                        </div>
                    `;
        }

        outer.innerHTML = `
                    ${adminBtns}
                    <div class="parallel-item" style="flex:1; margin-bottom:0;" onclick='openModal(${JSON.stringify(node)})'>
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <div style="display:flex; align-items:center;">
                                <img src="https://cdn.simpleicons.org/${node.slug}/bd00ff" width="20" height="20" style="margin-right:8px;">
                                <div>
                                    <div style="font-weight:bold; font-size:0.9rem;">${node.title}</div>
                                    <div class="rank-bar-bg" style="height:6px; margin-top:5px; width:100px;">
                                        <div class="rank-bar-fill" style="width:${pct}%; background:var(--secondary);"></div>
                                    </div>
                                </div>
                            </div>
                            <div style="font-size:0.75rem; color:var(--text-muted); align-self:center;">${pct}%</div>
                        </div>
                    </div>
                `;
        listDiv.appendChild(outer);
    });

    // Init Sortable
    if (isEditMode) {
        new Sortable(listDiv, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                saveParallelOrder();
            }
        });
    }

    // 2. Admin Add Button (Resized & Synced)
    if (isEditMode) {
        const addBtn = document.createElement('button');
        addBtn.className = 'action-btn'; // Premium Glass Class
        addBtn.innerText = '+ Add Parallel Track';

        // Specific Overrides for Layout Sync
        addBtn.style.width = '100%'; // Full width to match panel
        addBtn.style.marginTop = '15px';
        addBtn.style.padding = '16px 20px'; // Taller
        addBtn.style.fontSize = '1rem';
        addBtn.style.textAlign = 'center';
        addBtn.style.letterSpacing = '1px';

        addBtn.onclick = () => addParallelNode();
        container.appendChild(addBtn);
    }
}

function addParallelNode() {
    document.getElementById('edit-p-id').value = '';
    document.getElementById('edit-p-title').value = '';
    document.getElementById('edit-p-slug').value = '';
    document.getElementById('parallel-modal-title').innerText = "Add Parallel Track";
    document.getElementById('parallel-track-modal').classList.add('visible');
}

function editParallelNode(id) {
    const node = parallelNodes.find(n => n.id === id);
    if (!node) return;
    document.getElementById('edit-p-id').value = id;
    document.getElementById('edit-p-title').value = node.title;
    document.getElementById('edit-p-slug').value = node.slug;
    document.getElementById('parallel-modal-title').innerText = "Edit Parallel Track";
    document.getElementById('parallel-track-modal').classList.add('visible');
}

async function saveParallelNode() {
    const id = document.getElementById('edit-p-id').value;
    const title = document.getElementById('edit-p-title').value;
    const slug = document.getElementById('edit-p-slug').value;
    if (!title) return alert("Title required");

    if (id) {
        // EDIT
        const node = parallelNodes.find(n => n.id === id);
        if (node) {
            const updateData = { title: title };
            node.title = title;

            if (slug) {
                updateData.slug = slug;
                node.slug = slug;
            }

            await db.collection('global_parallel').doc(id).update(updateData);
            showToast("✅ Track Updated");
        }
    } else {
        // ADD
        const newNode = {
            id: "p" + Date.now(),
            title: title,
            slug: slug || "javascript",
            topics: [],
            order: 999
        };
        await db.collection('global_parallel').doc(newNode.id).set(newNode);
        parallelNodes.push(newNode);
        showToast("✅ Track Added");
    }
    closeParallelEditModal();
    renderParallel();
}

function closeParallelEditModal() {
    document.getElementById('parallel-track-modal').classList.remove('visible');
}

async function deleteParallelNode(id) {
    if (!confirm("Delete this track?")) return;
    await db.collection('global_parallel').doc(id).delete();
    parallelNodes = parallelNodes.filter(n => n.id !== id);
    renderParallel();
}

async function saveParallelOrder() {
    // 1. Get the current visual order from the DOM
    const container = document.getElementById('parallel-items-list');
    const items = container.querySelectorAll('.parallel-item-wrapper');
    const newOrderIds = Array.from(items).map(item => item.getAttribute('data-id'));

    // 2. Reorder the local array
    const newParallelNodes = [];
    newOrderIds.forEach(id => {
        const node = parallelNodes.find(n => n.id === id);
        if (node) newParallelNodes.push(node);
    });
    parallelNodes = newParallelNodes;

    // 3. Save to Firestore using a BATCH operation (Crucial for persistence)
    const batch = db.batch();
    parallelNodes.forEach((node, index) => {
        const ref = db.collection('global_parallel').doc(node.id);
        // Atomic update of only 'order' field
        batch.update(ref, { order: index });
        node.order = index; // Keep local state in sync
    });

    try {
        await batch.commit(); // Send all updates as one single package
        showToast("✅ Parallel Order Saved");
    } catch (error) {
        console.error("Error saving parallel order:", error);
        showToast("❌ Failed to save order");
    }
}

// --- 6. MODAL SYSTEM ---
function openModal(node) {
    currentModalNode = node;
    const modal = document.getElementById('mission-modal');

    // Update Title
    document.getElementById('modal-title').textContent = node.title;

    // Update Course Icon
    const iconEl = document.getElementById('modal-course-icon');
    if (node.slug.startsWith('http')) {
        iconEl.src = node.slug;
    } else {
        iconEl.src = `https://cdn.simpleicons.org/${node.slug}/00f2ff`;
        iconEl.onerror = function () {
            this.onerror = null;
            this.src = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${node.slug}.png`;
        };
    }

    // Handle Dynamic Section Input
    const sectionContainer = document.getElementById('section-input-container');
    // Hide default section container as we will handle it via the unified module select
    sectionContainer.style.display = 'none';
    sectionContainer.innerHTML = '';

    // Update Duration Badge
    const durBadgeEl = document.getElementById('modal-duration-badge');
    if (node.duration) {
        durBadgeEl.className = 'duration-badge';
        durBadgeEl.textContent = node.duration;
        durBadgeEl.style.display = 'inline-block';
        if (isEditMode) {
            durBadgeEl.style.cursor = 'pointer';
            durBadgeEl.title = 'Click to Edit Duration';
            durBadgeEl.onclick = editDuration;
        } else {
            durBadgeEl.style.cursor = 'default';
            durBadgeEl.style.pointerEvents = 'none';
            durBadgeEl.onclick = null;
        }
    } else if (isEditMode) {
        durBadgeEl.className = 'duration-badge';
        durBadgeEl.textContent = 'SET DURATION';
        durBadgeEl.style.display = 'inline-block';
        durBadgeEl.style.cursor = 'pointer';
        durBadgeEl.title = 'Click to Set Duration';
        durBadgeEl.onclick = editDuration;
    } else {
        durBadgeEl.style.display = 'none';
        durBadgeEl.className = '';
    }


    modal.classList.add('visible');

    switchModalTab('checklist');
    renderChecklist();
    renderLogs();
    renderResources();
}



function closeModal() { document.getElementById('mission-modal').classList.remove('visible'); }

function switchModalTab(tabName) {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

    const btns = document.querySelectorAll('.modal-tab-btn');
    if (tabName === 'checklist') btns[0].classList.add('active');
    if (tabName === 'diary') btns[1].classList.add('active');
    if (tabName === 'resources') btns[2].classList.add('active');
    if (tabName === 'labs') {
        btns[3].classList.add('active');
        renderNodeLabs();
        if (isEditMode) {
            document.getElementById('labs-node-admin-controls').style.display = 'block';
        } else {
            document.getElementById('labs-node-admin-controls').style.display = 'none';
        }
    }

    document.getElementById(`view-${tabName}`).classList.add('active');
    document.getElementById(`view-${tabName}`).style.display = 'block'; // Ensure visibility
    // Hide others
    document.querySelectorAll('.tab-view').forEach(v => {
        if (v.id !== `view-${tabName}`) v.style.display = 'none';
    });
}

// --- NODE SPECIFIC LABS (BATTLE SIMS) ---
function renderNodeLabs() {
    const container = document.getElementById('node-labs-list');
    container.innerHTML = '';

    const labs = currentModalNode.labs || [];

    if (labs.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">No labs assigned for this course yet.</div>';
        return;
    }

    for (let i = 0; i < labs.length; i++) {
        const lab = labs[i];
        const index = i;
        const card = document.createElement('div');
        card.style.cssText = `
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: 0.2s;
                    width: 100%;
                `;

        let adminBtns = isEditMode ? `<div style="display:flex; gap:10px; margin-left:15px;">
                    <span onclick="editNodeLab(${index})" style="cursor:pointer;" title="Edit">✏️</span>
                    <span onclick="deleteNodeLab(${index})" style="cursor:pointer; color:#ff4444;" title="Delete">✕</span>
                </div>` : '';

        card.innerHTML = `
                    <div style="flex:1;">
                        <div style="color:var(--primary); font-weight:bold; font-size:1rem; margin-bottom:5px;">🚀 ${lab.title}</div>
                        <div style="color:var(--text-muted); font-size:0.85rem;">${lab.desc || ''}</div>
                    </div>
                    <a href="${lab.url}" target="_blank" class="action-btn" style="text-decoration:none; font-size:0.85rem; padding:8px 15px;">Launch</a>
                    ${adminBtns}
                `;
        container.appendChild(card);
    }
}

async function saveNodeLab() {
    const title = document.getElementById('node-lab-title').value;
    const url = document.getElementById('node-lab-url').value;
    const desc = document.getElementById('node-lab-desc').value;

    if (!title || !url) {
        alert("Mission Title and URL are required!");
        return;
    }

    // Ensure the array exists
    if (!currentModalNode.labs) currentModalNode.labs = [];

    // 1. Update Local State
    currentModalNode.labs.push({
        title: title,
        url: ensureAbsoluteUrl(url),
        desc: desc,
        addedAt: new Date().toISOString()
    });

    // 2. Persist to Firestore (Critical Fix)
    let collectionName = 'global_roadmap';
    let docId = currentModalNode.id.toString();

    // Detect Parallel Track IDs (start with 'p')
    if (docId.startsWith('p')) {
        collectionName = 'global_parallel';
    }

    try {
        await db.collection(collectionName).doc(docId).update({
            labs: currentModalNode.labs
        });
        showToast("✅ Mission Deployed & Saved!");
    } catch (e) {
        console.error("Error saving lab:", e);
        // Fallback for missing docs
        await db.collection(collectionName).doc(docId).set({ labs: currentModalNode.labs }, { merge: true });
        showToast("⚠️ Saved via Merge");
    }

    // 3. Clear Inputs & Refresh UI
    document.getElementById('node-lab-title').value = '';
    document.getElementById('node-lab-url').value = '';
    document.getElementById('node-lab-desc').value = '';

    renderNodeLabs();
}

async function editNodeLab(index) {
    const labs = currentModalNode.labs;
    if (!labs || !labs[index]) return;

    const lab = labs[index];
    const newTitle = prompt("Edit Title:", lab.title);
    if (newTitle === null) return;

    const newUrl = prompt("Edit URL:", lab.url);
    if (newUrl === null) return;

    const newDesc = prompt("Edit Description:", lab.desc);
    if (newDesc === null) return;

    lab.title = newTitle;
    lab.url = ensureAbsoluteUrl(newUrl);
    lab.desc = newDesc;

    await saveRoadmapOrder();
    renderNodeLabs();
}

async function deleteNodeLab(index) {
    if (!confirm("Abort this mission?")) return;

    if (currentModalNode.labs) {
        currentModalNode.labs.splice(index, 1);
        await saveRoadmapOrder();
        renderNodeLabs();
    }
}

// --- 7. CHECKLIST LOGIC ---
async function toggleTopicDone(tid) {
    let list = userData.progress[currentModalNode.id] || [];
    if (list.includes(tid)) {
        list = list.filter(x => x !== tid);
    } else {
        list.push(tid);
    }
    userData.progress[currentModalNode.id] = list;

    // Re-render to update UI
    renderChecklist();
    renderParallel();
    renderGalaxy();

    // Calculate Total Progress logic
    let totalT = 0, totalD = 0;
    [...roadmapNodes, ...parallelNodes].forEach(n => {
        const nTopics = n.topics || [];
        totalT += nTopics.length;
        totalD += (userData.progress[n.id] || []).length;
    });

    const globalP = totalT === 0 ? 0 : Math.round((totalD / totalT) * 100);

    // Update Header Display Immediately
    userData.totalPercent = globalP;
    const photo = userData.photoURL || (currentUser ? currentUser.photoURL : '');
    const imgHtml = photo ? `<img src="${photo}" style="width:24px; height:24px; border-radius:50%; vertical-align:middle; margin-right:5px; border:1px solid var(--primary);">` : '';
    document.getElementById('user-name-display').innerHTML = `${imgHtml} ${userData.displayName} <span style="color:var(--gold); font-size:0.8rem; margin-left:5px;">(${globalP}%)</span>`;

    if (currentUser) {
        // SELECTIVE UPDATE: Only update the changed progress key and total percentage
        await db.collection('users').doc(currentUser.uid).update({
            [`progress.${currentModalNode.id}`]: list,
            totalPercent: globalP,
            lastActive: new Date().toISOString()
        });
    }
}

function addTopicResource(topicIndex) {
    document.getElementById('edit-resource-topic-index').value = topicIndex;
    document.getElementById('edit-resource-title').value = '';
    document.getElementById('edit-resource-url').value = '';
    document.getElementById('resource-modal-title').innerText = 'Add Resource';
    document.getElementById('topic-resource-modal').classList.add('visible');
}

function closeTopicResourceModal() {
    document.getElementById('topic-resource-modal').classList.remove('visible');
}

async function saveTopicResource() {
    const topicIndex = parseInt(document.getElementById('edit-resource-topic-index').value);
    const title = document.getElementById('edit-resource-title').value.trim();
    const url = document.getElementById('edit-resource-url').value.trim();

    if (!title || !url) return alert("Both title and URL are required!");

    if (!currentModalNode.topics[topicIndex].resources) currentModalNode.topics[topicIndex].resources = [];
    currentModalNode.topics[topicIndex].resources.push({ title, url });

    closeTopicResourceModal();
    renderChecklist();

    // Save to Firestore
    const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
    await db.collection(col).doc(currentModalNode.id.toString()).update({
        topics: currentModalNode.topics
    });
    showToast("✅ Resource Added");
}

// --- USER PERSONAL LINKS ---
async function addUserLink(topicIndex) {
    const linkTitle = prompt("Link Title (e.g., 'Great Tutorial'):");
    if (!linkTitle) return;
    const linkUrl = prompt("Link URL:");
    if (!linkUrl) return;

    const key = `${currentModalNode.id}_${currentModalNode.topics[topicIndex].id}`;
    if (!userData.userLinks) userData.userLinks = {};
    if (!userData.userLinks[key]) userData.userLinks[key] = [];

    userData.userLinks[key].push({
        title: linkTitle,
        url: ensureAbsoluteUrl(linkUrl)
    });

    await db.collection('users').doc(currentUser.uid).update({
        [`userLinks.${key}`]: userData.userLinks[key]
    });

    renderChecklist();
}

async function deleteUserLink(topicIndex, linkIndex) {
    if (!confirm("Delete this link?")) return;

    const key = `${currentModalNode.id}_${currentModalNode.topics[topicIndex].id}`;
    userData.userLinks[key].splice(linkIndex, 1);

    await db.collection('users').doc(currentUser.uid).update({
        [`userLinks.${key}`]: userData.userLinks[key]
    });

    renderChecklist();
}

function renderChecklist() {
    const c = document.getElementById('checklist-container');
    c.innerHTML = '';

    // Safety check if topics is undefined
    if (!currentModalNode.topics) currentModalNode.topics = [];

    const done = userData.progress[currentModalNode.id] || [];
    document.getElementById('modal-progress-text').innerText = Math.round((done.length / Math.max(currentModalNode.topics.length, 1)) * 100) + "%";

    // --- MODULE FILTER BAR ---
    // Detect unique modules in topics
    const modules = [...new Set(currentModalNode.topics.map(t => t.module).filter(Boolean))];
    let activeModule = modules.length > 0 ? modules[0] : null; // Default to first module

    // -- Populate Consolidated Category Dropdown for Add Topic --
    const moduleSelectContainer = document.getElementById('module-select-container');
    const moduleLabels = {
        'jenkins': 'Jenkins',
        'github-actions': 'GitHub Actions',
        'gitlab-ci': 'GitLab CI',
        'concepts': 'Concepts',
        'prometheus': 'Prometheus',
        'grafana': 'Grafana',
        'elk': 'ELK Stack',
        'admin-1': 'Linux Admin 1',
        'admin-2': 'Linux Admin 2'
    };

    if (modules.length > 0) {
        let options = `<option value="">(No Module / General Topics)</option>`;
        options += modules.map(mod => `<option value="${mod}">${moduleLabels[mod] || mod}</option>`).join('');
        moduleSelectContainer.innerHTML = `<select id="new-topic-module" class="dark-input" style="min-width:160px; border-color:var(--primary);">${options}</select>`;
        moduleSelectContainer.style.display = 'flex';
    } else {
        // Fallback for simple roadmaps: just a text section input if needed, or hide
        moduleSelectContainer.innerHTML = `<input type="text" id="new-topic-section-legacy" class="dark-input" placeholder="Section (Optional)" style="width:150px;">`;
        moduleSelectContainer.style.display = 'flex';
    }

    if (modules.length > 1) {
        const filterBar = document.createElement('div');
        filterBar.id = 'module-filter-bar';
        filterBar.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid var(--border);';

        // Module-specific buttons with official icons
        const moduleIcons = {
            'jenkins': { slug: 'jenkins', label: 'Jenkins' },
            'github-actions': { slug: 'githubactions', label: 'GitHub Actions' },
            'gitlab-ci': { slug: 'gitlab', label: 'GitLab CI' },
            'concepts': { slug: null, label: '📚 Concepts' },
            'prometheus': { slug: 'prometheus', label: 'Prometheus' },
            'grafana': { slug: 'grafana', label: 'Grafana' },
            'elk': { slug: 'elastic', label: 'ELK Stack' },
            'alerting': { slug: null, label: '🔔 Alerting' },
            'admin-1': { slug: 'linux', label: ' Admin 1' },
            'admin-2': { slug: 'linux', label: ' Admin 2' }
        };

        modules.forEach((mod, idx) => {
            const btn = document.createElement('button');
            btn.className = 'module-filter-btn' + (idx === 0 ? ' active' : '');
            btn.dataset.module = mod;
            btn.onclick = () => filterTopics(mod);

            const config = moduleIcons[mod] || { slug: null, label: mod };
            if (config.slug) {
                btn.innerHTML = `<img src="https://cdn.simpleicons.org/${config.slug}/ffffff" width="14" height="14" style="margin-right:6px; vertical-align:middle;"> ${config.label}`;
            } else {
                btn.textContent = config.label;
            }

            filterBar.appendChild(btn);
        });

        c.appendChild(filterBar);

        // Add filter bar styles if not already present
        if (!document.getElementById('module-filter-styles')) {
            const style = document.createElement('style');
            style.id = 'module-filter-styles';
            style.textContent = `
                        .module-filter-btn {
                            padding: 6px 14px;
                            border-radius: 20px;
                            border: 1px solid var(--border);
                            background: transparent;
                            color: var(--text-muted);
                            font-size: 0.8rem;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }
                        .module-filter-btn:hover {
                            border-color: var(--primary);
                            color: var(--primary);
                        }
                        .module-filter-btn.active {
                            background: var(--primary);
                            color: var(--bg-deep);
                            border-color: var(--primary);
                            font-weight: bold;
                        }
                    `;
            document.head.appendChild(style);
        }
    }

    // Filter function (closure for active module state)
    window.filterTopics = function (module) {
        activeModule = module;

        // Update button states
        document.querySelectorAll('.module-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.module === module) {
                btn.classList.add('active');
            }
        });

        // Show/hide topic items
        document.querySelectorAll('#checklist-items-list .checklist-item').forEach(item => {
            const topicModule = item.dataset.module;
            if (topicModule === module) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        // Also hide/show section headers based on visible topics
        document.querySelectorAll('#checklist-items-list .section-header').forEach(header => {
            const section = header.dataset.section;
            const visibleTopics = document.querySelectorAll(`#checklist-items-list .checklist-item[data-section="${section}"]:not([style*="display: none"])`);
            header.style.display = visibleTopics.length > 0 ? 'block' : 'none';
        });
    };

    // 1. Create Sortable Container for Topics
    const listDiv = document.createElement('div');
    listDiv.id = 'checklist-items-list';
    c.appendChild(listDiv);

    // Accordion Style for Topics
    let currentSection = null;
    currentModalNode.topics.forEach((t, index) => {
        // Insert Section Header if it changes (Skip if we have modules enabled as they serve as categories)
        if (t.section && t.section !== currentSection && modules.length <= 1) {
            currentSection = t.section;
            const headerDiv = document.createElement('div');
            headerDiv.className = 'section-header';
            headerDiv.dataset.section = t.section;
            headerDiv.style.cssText = 'color:var(--primary); font-size:0.85rem; font-weight:bold; letter-spacing:1px; margin: 20px 0 10px 0; border-bottom:1px solid rgba(0, 242, 255, 0.2); padding-bottom:5px; text-transform:uppercase;';
            headerDiv.innerText = t.section;
            listDiv.appendChild(headerDiv);
        }

        const isChecked = done.includes(t.id);

        const div = document.createElement('div');
        div.className = `checklist-item`;
        div.setAttribute('data-id', t.id); // For sorting
        if (t.module) div.dataset.module = t.module; // For filtering
        if (t.section) div.dataset.section = t.section; // For section visibility
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        div.style.cursor = 'default';

        // Header row
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.gap = '10px';
        header.style.width = '100%';

        let adminControls = '';
        let dragHandle = '';
        if (isEditMode) {
            // Drag Handle
            dragHandle = `<span class="topic-drag-handle" style="cursor:grab; font-size:1.2rem; color:var(--text-muted); margin-right:5px;">⣿</span>`;

            // Edit & Delete
            adminControls = `
                        <div style="margin-left:auto; display:flex; gap:10px;">
                            <span style="cursor:pointer;" title="Edit Title" onclick="enableInlineEdit(${index})">✏️</span>
                            <span style="color:red; cursor:pointer; font-weight:bold;" title="Delete Topic" onclick="deleteTopic(${index})">✕</span>
                        </div>
                    `;
        }

        // Using SVG Arrow for accordion
        const arrow = `<span id="arrow-${t.id}" style="font-size:0.8rem; transition:0.3s; cursor:pointer;" onclick="toggleAccordion('${t.id}')">▶</span>`;

        header.innerHTML = `
                    ${dragHandle}
                    ${arrow}
                    <span id="topic-title-${index}" onclick="toggleAccordion('${t.id}')" style="flex:1; cursor:pointer; font-weight:600; display:flex; align-items:center;">
                        ${t.title}
                    </span>
                    ${adminControls}
                `;

        // Expanded Content
        const body = document.createElement('div');
        body.id = `accordion-${t.id}`;
        body.style.display = 'none'; // Hidden by default
        body.style.width = '100%';
        body.style.marginTop = '10px';
        body.style.paddingLeft = '20px';
        body.style.borderLeft = '2px solid var(--border)';
        body.style.marginLeft = '5px';

        // 1. DONE Checkbox + Proof of Work
        const proofKey = currentModalNode.id + '_' + t.id;
        const proofUrl = (userData.proofs && userData.proofs[proofKey]) || "";
        const proofIconClass = proofUrl ? 'has-proof' : '';
        const proofTooltip = proofUrl ? 'Edit Proof' : 'Add Proof of Work (GitHub/URL)';

        // Direct external link icon if proof exists
        const externalLinkIcon = proofUrl
            ? `<a href="${ensureAbsoluteUrl(proofUrl)}" target="_blank" class="external-proof-link" title="Open Link: ${proofUrl}"><i class="fas fa-external-link-alt"></i></a>`
            : '';

        const checkDiv = document.createElement('div');
        checkDiv.style.marginBottom = '10px';
        checkDiv.innerHTML = `
                    <div style="display:flex; align-items:center; width:100%;">
                        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; color: ${isChecked ? 'var(--success)' : 'var(--text-main)'}; flex:1;">
                            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTopicDone('${t.id}')" style="transform:scale(1.2);">
                            ${isChecked ? 'Completed' : 'Mark as Done'}
                        </label>
                        <div style="display:flex; align-items:center;">
                            <span class="proof-link-btn ${proofIconClass}" onclick="openProofModal('${t.id}', '${proofUrl}')" title="${proofTooltip}">
                                add your work here 🔗
                            </span>
                            ${externalLinkIcon}
                        </div>
                    </div>
                `;

        // 2. Resources List (Visible to ALL, controls for ADMIN)
        const resDiv = document.createElement('div');
        resDiv.style.marginBottom = '10px';

        // Header with optional Add button (admin only)
        const addResBtn = isEditMode
            ? `<span onclick="addTopicResource(${index})" style="cursor:pointer; font-size:0.8rem; color:var(--success); margin-left:10px;">(+) Add</span>`
            : '';

        resDiv.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">Resources:${addResBtn}</div>`;

        if (t.resources && t.resources.length > 0) {
            t.resources.forEach((r, resIdx) => {
                const safeUrl = ensureAbsoluteUrl(r.url);
                const iconHtml = getIconForUrl(r.url, r.type);
                const deleteBtn = isEditMode
                    ? `<span onclick="deleteTopicResource(${index}, ${resIdx})" style="color:red; cursor:pointer; font-size:0.75rem; margin-left:8px;" title="Delete Resource">✕</span>`
                    : '';
                resDiv.innerHTML += `
                            <div style="display:flex; align-items:center;">
                                <a href="${safeUrl}" target="_blank" class="resource-link" style="font-size:0.85rem; padding:5px;">${iconHtml} ${r.title}</a>
                                ${deleteBtn}
                            </div>`;
            });
        } else {
            resDiv.innerHTML += `<div style="font-size:0.8rem; font-style:italic; opacity:0.5;">No resources yet.</div>`;
        }

        // 3. MY LINKS (User Personal Links)
        const userLinksDiv = document.createElement('div');
        userLinksDiv.className = 'user-links-section';
        userLinksDiv.style.marginBottom = '10px';

        const userLinksKey = `${currentModalNode.id}_${t.id}`;
        const userLinks = (userData.userLinks && userData.userLinks[userLinksKey]) || [];

        // Always show add button for all users (not just admins)
        const addUserLinkBtn = `<span onclick="addUserLink(${index})" style="cursor:pointer; font-size:0.8rem; color:#8a2be2; margin-left:10px;">(+) Add Link</span>`;

        userLinksDiv.innerHTML = `<div style="font-size:0.8rem; color:#8a2be2; margin-bottom:5px; font-weight:600;">🔗 My Links:${addUserLinkBtn}</div>`;

        if (userLinks.length > 0) {
            userLinks.forEach((link, linkIdx) => {
                const safeUrl = ensureAbsoluteUrl(link.url);
                const deleteBtn = `<span class="user-link-delete" onclick="deleteUserLink(${index}, ${linkIdx})" title="Delete">✕</span>`;
                const iconHtml = getIconForUrl(link.url, null);
                userLinksDiv.innerHTML += `
                            <div class="user-link-item">
                                <a href="${safeUrl}" target="_blank" class="resource-link" style="font-size:0.85rem; padding:5px; flex:1;">${iconHtml} ${link.title}</a>
                                ${deleteBtn}
                            </div>
                        `;
            });
        } else {
            userLinksDiv.innerHTML += `<div style="font-size:0.8rem; font-style:italic; opacity:0.5;">No personal links yet. Add your favorite tutorials!</div>`;
        }

        // 4. User Notes
        const topicNotesKey = currentModalNode.id + '_' + t.id + '_notes';
        const topicNotes = userData.progress[topicNotesKey] || "";

        const noteDiv = document.createElement('div');
        noteDiv.className = 'topic-note-container';
        noteDiv.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                            <i class="fa-regular fa-file-lines" style="margin-right:5px;"></i> My Notes (Markdown Support)
                        </div>
                        <span id="edit-icon-${topicNotesKey}" style="cursor:pointer; font-size:0.8rem; opacity:0.5; transition:0.2s;" 
                              onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5"
                              onclick="toggleNoteEdit('${topicNotesKey}')">✏️ Edit</span>
                    </div>
                    <div id="note-view-${topicNotesKey}" class="md-content" 
                         style="background:rgba(0,0,0,0.15); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); min-height:40px; cursor:pointer; font-size:0.9rem;" 
                         onclick="toggleNoteEdit('${topicNotesKey}')">
                        ${topicNotes ? marked.parse(topicNotes) : '<span style="font-style:italic; opacity:0.4;">No notes yet. Click to add markdown thoughts...</span>'}
                    </div>
                    <textarea id="note-edit-${topicNotesKey}" class="dark-input md-edit-box" dir="auto" 
                              placeholder="Type your notes here... (Use # for headers, **bold**, etc.)"
                              style="display:none; width:100%; min-height:120px; font-size:0.9rem; margin-top:0;" 
                              onblur="saveNoteAndRender('${topicNotesKey}')">${topicNotes}</textarea>
                `;

        body.appendChild(checkDiv);
        body.appendChild(resDiv); // Resources visible to all
        body.appendChild(userLinksDiv);
        body.appendChild(noteDiv);

        div.appendChild(header);
        div.appendChild(body);
        listDiv.appendChild(div);

        // Apply syntax highlighting to the notes view
        const view = document.getElementById(`note-view-${topicNotesKey}`);
        applySyntaxHighlighting(view);
    });

    // Init Sortable for Topics
    if (isEditMode) {
        new Sortable(listDiv, {
            animation: 150,
            handle: '.topic-drag-handle',
            ghostClass: 'sortable-ghost',
            onEnd: function () {
                saveTopicOrder();
            }
        });
    }

    // Apply initial module filter (if modules exist)
    if (activeModule && modules.length > 1) {
        setTimeout(() => filterTopics(activeModule), 0);
    }

}

// --- TOPIC HELPER FUNCTIONS ---
function enableInlineEdit(index) {
    const topic = currentModalNode.topics[index];
    const titleSpan = document.getElementById(`topic-title-${index}`);
    if (!titleSpan) return;

    // Create inline edit container
    const editContainer = document.createElement('div');
    editContainer.style.cssText = 'display:flex; gap:8px; align-items:center; flex:1;';
    editContainer.id = `inline-edit-${index}`;

    // Title input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = topic.title;
    input.className = 'dark-input';
    input.style.cssText = 'flex:1; padding:5px 10px; font-size:0.9rem;';
    input.id = `inline-title-${index}`;
    editContainer.appendChild(input);

    // Save button
    const saveBtn = document.createElement('span');
    saveBtn.innerHTML = '✓';
    saveBtn.style.cssText = 'cursor:pointer; color:var(--success); font-size:1.2rem;';
    saveBtn.onclick = () => saveInlineEdit(index);
    editContainer.appendChild(saveBtn);

    // Cancel button
    const cancelBtn = document.createElement('span');
    cancelBtn.innerHTML = '✕';
    cancelBtn.style.cssText = 'cursor:pointer; color:red; font-size:1rem;';
    cancelBtn.onclick = () => renderChecklist();
    editContainer.appendChild(cancelBtn);

    // Replace title span with edit container
    titleSpan.replaceWith(editContainer);

    // Focus input
    input.focus();
    input.select();

    // Enter key to save
    input.onkeydown = (e) => {
        if (e.key === 'Enter') saveInlineEdit(index);
        if (e.key === 'Escape') renderChecklist();
    };
}

async function saveInlineEdit(index) {
    const input = document.getElementById(`inline-title-${index}`);
    const title = input.value.trim();

    if (!title) {
        alert("Topic title is required!");
        return;
    }

    currentModalNode.topics[index].title = title;

    renderChecklist();

    // Save
    const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
    await db.collection(col).doc(currentModalNode.id.toString()).update({
        topics: currentModalNode.topics
    });
    showToast("✅ Topic Updated");
}

async function saveTopicOrder() {
    const list = document.getElementById('checklist-items-list');
    const items = list.querySelectorAll('.checklist-item');
    const newOrder = [];

    items.forEach(item => {
        const id = item.getAttribute('data-id');
        const t = currentModalNode.topics.find(x => x.id === id);
        if (t) newOrder.push(t);
    });

    currentModalNode.topics = newOrder;

    // Save
    const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
    await db.collection(col).doc(currentModalNode.id.toString()).update({
        topics: currentModalNode.topics
    });
}

async function deleteTopic(index) {
    if (!confirm("Delete this topic?")) return;
    currentModalNode.topics.splice(index, 1);
    renderChecklist();
    // Save
    const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
    await db.collection(col).doc(currentModalNode.id.toString()).update({
        topics: currentModalNode.topics
    });
}

function applySyntaxHighlighting(containerElement) {
    if (!containerElement) return;
    containerElement.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

async function saveSpecificTopicNote(key, val) {
    userData.progress[key] = val;
    await db.collection('users').doc(auth.currentUser.uid).set(userData, { merge: true });
}

function toggleNoteEdit(key) {
    const view = document.getElementById(`note-view-${key}`);
    const edit = document.getElementById(`note-edit-${key}`);
    const icon = document.getElementById(`edit-icon-${key}`);

    if (view.style.display !== 'none') {
        view.style.display = 'none';
        edit.style.display = 'block';
        edit.focus();
        if (icon) icon.innerText = '✕ Cancel';
    } else {
        view.style.display = 'block';
        edit.style.display = 'none';
        if (icon) icon.innerText = '✏️ Edit';
    }
}

async function saveNoteAndRender(key) {
    const view = document.getElementById(`note-view-${key}`);
    const edit = document.getElementById(`note-edit-${key}`);
    const icon = document.getElementById(`edit-icon-${key}`);
    const val = edit.value;

    // Update UI immediately
    view.innerHTML = val ? marked.parse(val) : '<span style="font-style:italic; opacity:0.4;">No notes yet. Click to add markdown thoughts...</span>';
    view.style.display = 'block';
    edit.style.display = 'none';
    if (icon) icon.innerText = '✏️ Edit';

    // Apply syntax highlighting
    applySyntaxHighlighting(view);

    // Save to DB
    await saveSpecificTopicNote(key, val);
    showToast("✅ Note Saved");
}

async function addTopic() {
    const titleInput = document.getElementById('new-topic-title');
    const moduleSelect = document.getElementById('new-topic-module');
    const legacySectionInput = document.getElementById('new-topic-section-legacy');

    const title = titleInput.value.trim();
    if (!title) {
        alert("Topic Title is required!");
        return;
    }

    const newTid = 't-' + Date.now();
    const newTopic = { id: newTid, title: title, section: "", videoUrl: "", notes: "" };

    // Handle Module Filtering (Section mapping removed as redundant)
    if (moduleSelect && moduleSelect.value) {
        newTopic.module = moduleSelect.value;
    } else if (legacySectionInput) {
        newTopic.section = legacySectionInput.value.trim();
    }

    currentModalNode.topics.push(newTopic);

    // Clear inputs after adding
    titleInput.value = '';
    if (legacySectionInput) legacySectionInput.value = '';

    renderChecklist();
    await saveNodeUpdate(currentModalNode);
}

async function deleteTopic(index) {
    if (!confirm("Delete this topic?")) return;
    currentModalNode.topics.splice(index, 1);
    renderChecklist();
    await saveNodeUpdate(currentModalNode);
}

async function deleteTopicResource(topicIndex, resourceIndex) {
    const topic = currentModalNode.topics[topicIndex];
    if (!topic || !topic.resources) return;

    topic.resources.splice(resourceIndex, 1);
    renderChecklist();
    await saveNodeUpdate(currentModalNode);
    showToast("✅ Resource Deleted");
}

async function editDuration() {
    const d = prompt("Duration (e.g. '3 Weeks'):", currentModalNode.duration || "");
    if (d === null) return;

    // ✅ التعديل الجذري: تحديث الداتا محلياً ثم إرسال التعديل فقط للداتابيز
    currentModalNode.duration = d;

    const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
    await db.collection(col).doc(currentModalNode.id.toString()).update({
        duration: d
    });

    // Refresh UI
    openModal(currentModalNode);
    showToast("✅ Duration Updated");
}

async function saveNodeUpdate(node) {
    if (typeof node.id === 'string' && node.id.startsWith('p')) {
        await db.collection('global_parallel').doc(node.id).update(node);
    } else {
        await db.collection('global_roadmap').doc(node.id.toString()).update(node);
    }
}

// --- PROOF OF WORK HELPERS (MODAL) ---
function openProofModal(tid, currentUrl) {
    currentProofTopicId = tid;
    const modal = document.getElementById('proof-modal');
    const input = document.getElementById('proof-url-input');
    const removeBtn = document.getElementById('proof-remove-btn');
    const title = document.getElementById('proof-modal-title');

    input.value = currentUrl || "";
    title.innerText = currentUrl ? "🔗 Edit Proof of Work" : "🔗 Attach Proof of Work";
    removeBtn.style.display = currentUrl ? "block" : "none";

    modal.classList.add('visible');
    input.focus();
}

function closeProofModal() {
    document.getElementById('proof-modal').classList.remove('visible');
    currentProofTopicId = null;
}

async function saveProofFromModal() {
    const url = document.getElementById('proof-url-input').value.trim();
    if (!url) return showToast("⚠️ Please enter a URL");
    if (!currentProofTopicId) return;

    const key = currentModalNode.id + '_' + currentProofTopicId;
    if (!userData.proofs) userData.proofs = {};
    userData.proofs[key] = url;

    renderChecklist();
    closeProofModal();

    await db.collection('users').doc(currentUser.uid).update({
        [`proofs.${key}`]: url
    });
    showToast("✅ Proof Linked!");
}

async function removeProofFromModal() {
    if (!currentProofTopicId) return;

    const key = currentModalNode.id + '_' + currentProofTopicId;
    delete userData.proofs[key];

    renderChecklist();
    closeProofModal();

    await db.collection('users').doc(currentUser.uid).update({
        [`proofs.${key}`]: firebase.firestore.FieldValue.delete()
    });
    showToast("🗑️ Proof Removed");
}

// Helper for Accordion
function toggleAccordion(tid) {
    const body = document.getElementById(`accordion-${tid}`);
    const arrow = document.getElementById(`arrow-${tid}`);
    if (body.style.display === 'none') {
        body.style.display = 'block';
        if (arrow) arrow.style.transform = 'rotate(90deg)';
    } else {
        body.style.display = 'none';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}

async function saveTopicNote(tid, text) {
    // Backward compatibility helper or unused?
    // Since we use saveSpecificTopicNote for deep linking, we can keep this for old nodes or remove.
    // Let's forward to new logic if needed but args are diff.
    // Leaving emptiness to allow cleaner replacement.
}

async function toggleTopic(tid) {
    // Forward to new function
    await toggleTopicDone(tid);
}

// --- 8. LOGS & RESOURCES ---
function renderLogs() {
    const c = document.getElementById('diary-entries');
    c.innerHTML = '';
    const logs = userData.logs[currentModalNode.id] || [];

    // Show logs in reverse chronological order, but preserve original index
    logs.slice().reverse().forEach((l, reverseIdx) => {
        const originalIdx = logs.length - 1 - reverseIdx;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'log-entry';
        entryDiv.id = `log-entry-${originalIdx}`;
        entryDiv.style.cssText = 'position:relative; padding:12px; margin-bottom:10px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid rgba(255,255,255,0.1);';

        entryDiv.innerHTML = `
                    <div class="log-date" style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">${new Date(l.date).toLocaleString()}${l.editedAt ? ' (edited)' : ''}</div>
                    <div id="log-content-${originalIdx}" style="white-space:normal; line-height:1.5;">${marked.parse(l.text)}</div>
                    <div id="log-edit-area-${originalIdx}" style="display:none;">
                        <textarea id="log-edit-input-${originalIdx}" class="dark-input" dir="auto" style="width:100%; min-height:80px; margin-bottom:8px; resize:vertical;"></textarea>
                        <div style="display:flex; gap:8px; justify-content:flex-end;">
                            <button class="action-btn" onclick="saveLogEdit(${originalIdx})" style="background:var(--success); padding:5px 12px; font-size:0.85rem;">💾 Save</button>
                            <button class="action-btn" onclick="cancelLogEdit(${originalIdx})" style="background:var(--danger); padding:5px 12px; font-size:0.85rem;">✕ Cancel</button>
                        </div>
                    </div>
                    <div id="log-actions-${originalIdx}" style="position:absolute; top:10px; right:10px; display:flex; gap:10px;">
                        <span onclick="startLogEdit(${originalIdx})" style="cursor:pointer; font-size:1rem; opacity:0.7; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" title="Edit">✏️</span>
                        <span onclick="deleteLog(${originalIdx})" style="cursor:pointer; font-size:1rem; opacity:0.7; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" title="Delete">🗑️</span>
                    </div>
                `;
        c.appendChild(entryDiv);
        applySyntaxHighlighting(entryDiv);
    });

    if (logs.length === 0) {
        c.innerHTML = '<div style="font-size:0.9rem; font-style:italic; opacity:0.5; padding:15px; text-align:center;">No log entries yet. Start documenting your learning journey!</div>';
    }
}

async function saveLog() {
    const txt = document.getElementById('diary-input').value;
    if (!txt) return;
    const newLog = { date: new Date().toISOString(), text: txt };

    if (!userData.logs[currentModalNode.id]) userData.logs[currentModalNode.id] = [];
    userData.logs[currentModalNode.id].push(newLog);

    document.getElementById('diary-input').value = '';
    renderLogs();

    await db.collection('users').doc(currentUser.uid).update({
        [`logs.${currentModalNode.id}`]: userData.logs[currentModalNode.id]
    });
}

function startLogEdit(logIndex) {
    const logs = userData.logs[currentModalNode.id] || [];
    if (logIndex < 0 || logIndex >= logs.length) return;

    // Hide content, show edit area
    document.getElementById(`log-content-${logIndex}`).style.display = 'none';
    document.getElementById(`log-actions-${logIndex}`).style.display = 'none';
    document.getElementById(`log-edit-area-${logIndex}`).style.display = 'block';

    // Populate textarea with current text
    const textarea = document.getElementById(`log-edit-input-${logIndex}`);
    textarea.value = logs[logIndex].text;
    textarea.focus();
}

function cancelLogEdit(logIndex) {
    // Show content, hide edit area
    document.getElementById(`log-content-${logIndex}`).style.display = 'block';
    document.getElementById(`log-actions-${logIndex}`).style.display = 'flex';
    document.getElementById(`log-edit-area-${logIndex}`).style.display = 'none';
}

async function saveLogEdit(logIndex) {
    const logs = userData.logs[currentModalNode.id] || [];
    if (logIndex < 0 || logIndex >= logs.length) return;

    const newText = document.getElementById(`log-edit-input-${logIndex}`).value;

    if (newText.trim() === '') {
        alert("Log entry cannot be empty. Use delete to remove it.");
        return;
    }

    logs[logIndex].text = newText;
    logs[logIndex].editedAt = new Date().toISOString();

    renderLogs();

    await db.collection('users').doc(currentUser.uid).update({
        [`logs.${currentModalNode.id}`]: logs
    });
}

async function deleteLog(logIndex) {
    if (!confirm("Delete this log entry?")) return;

    const logs = userData.logs[currentModalNode.id] || [];
    if (logIndex < 0 || logIndex >= logs.length) return;

    logs.splice(logIndex, 1);

    renderLogs();

    await db.collection('users').doc(currentUser.uid).update({
        [`logs.${currentModalNode.id}`]: logs
    });
}

function getIconForUrl(url, type) {
    // 1. Check explicit type map first
    const typeMap = {
        'youtube': { icon: 'fa-youtube', color: '#ff0000' },
        'linkedin': { icon: 'fa-linkedin', color: '#0077b5' },
        'drive': { icon: 'fa-google-drive', color: '#1da462' },
        'github': { icon: 'fa-github', color: '#ffffff' } // explicit type support
    };

    if (type && typeMap[type]) {
        const map = typeMap[type];
        return `<i class="fab ${map.icon} resource-icon" style="color:${map.color};"></i>`;
    }

    // 2. Auto-detection from URL
    if (!url) return `<i class="fas fa-link resource-icon"></i>`;
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return `<i class="fab fa-youtube resource-icon" style="color:#ff0000;"></i>`;
    } else if (lowerUrl.includes('linkedin.com')) {
        return `<i class="fab fa-linkedin resource-icon" style="color:#0077b5;"></i>`;
    } else if (lowerUrl.includes('github.com')) {
        return `<i class="fab fa-github resource-icon" style="color:#ffffff;"></i>`;
    } else if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) {
        return `<i class="fab fa-google-drive resource-icon" style="color:#1da462;"></i>`;
    } else if (lowerUrl.includes('medium.com')) {
        return `<i class="fab fa-medium resource-icon" style="color:#ffffff;"></i>`;
    } else if (lowerUrl.includes('stackoverflow.com')) {
        return `<i class="fab fa-stack-overflow resource-icon" style="color:#f48024;"></i>`;
    }

    // Default
    return `<i class="fas fa-link resource-icon"></i>`;
}

// Platform Ranking Helper for auto-grouping
function getPlatformRank(url) {
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 1; // YouTube
    if (u.includes('github.com')) return 2; // GitHub
    if (u.includes('drive.google.com') || u.includes('docs.google.com')) return 3; // Drive
    return 4; // Others
}

function renderResources() {
    const container = document.getElementById('resources-list');
    container.innerHTML = '';

    // Auto-group by platform type
    if (currentModalNode.resources) currentModalNode.resources.sort((a, b) => getPlatformRank(a.url) - getPlatformRank(b.url));
    if (currentModalNode.freeCourses) currentModalNode.freeCourses.sort((a, b) => getPlatformRank(a.url) - getPlatformRank(b.url));

    // --- SECTION A: OFFICIAL DOCS (Global) ---
    const officialHeader = document.createElement('h6');
    officialHeader.innerText = "OFFICIAL DOCS";
    officialHeader.style.cssText = "color:var(--text-muted); margin-top:20px; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px;";
    container.appendChild(officialHeader);

    const officialListDiv = document.createElement('div');
    officialListDiv.id = 'official-resources-list';
    container.appendChild(officialListDiv);

    const officialRes = currentModalNode.resources || [];
    if (officialRes.length === 0) {
        officialListDiv.innerHTML = `<div style="font-style:italic; opacity:0.5; font-size:0.9rem;">No official docs yet.</div>`;
    } else {
        let lastRank = 0;
        officialRes.forEach((r, idx) => {
            const currentRank = getPlatformRank(r.url);
            // Insert divider if category changes
            if (lastRank !== 0 && currentRank !== lastRank) {
                const divider = document.createElement('div');
                divider.style.cssText = 'border-top: 1px dashed rgba(255, 255, 255, 0.2); margin: 15px 0 10px 0; width: 100%;';
                officialListDiv.appendChild(divider);
            }
            lastRank = currentRank;

            const safeUrl = ensureAbsoluteUrl(r.url);
            const iconHtml = getIconForUrl(r.url, r.type);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'resource-item-wrapper';
            itemDiv.style.cssText = 'margin-bottom:5px; display:flex; align-items:center; gap:10px;';
            itemDiv.innerHTML = `<a href="${safeUrl}" target="_blank" class="resource-link" style="flex:1; margin-bottom:0;">${iconHtml} ${r.title}</a>`;
            if (isEditMode) {
                itemDiv.innerHTML += `<span style="cursor:pointer;" title="Edit" onclick="editOfficialResource(${idx})">✏️</span><span style="cursor:pointer; color:#ff4444;" title="Delete" onclick="deleteOfficialResource(${idx})">✕</span>`;
            }
            officialListDiv.appendChild(itemDiv);
        });
    }
    if (isEditMode && officialRes.length > 0) {
        new Sortable(officialListDiv, { animation: 150, ghostClass: 'sortable-ghost', onEnd: (evt) => saveOfficialOrder(evt.oldIndex, evt.newIndex) });
    }

    // --- SECTION B: FREE COURSES AND DOCS (Global Admin) ---
    const freeHeader = document.createElement('h6');
    freeHeader.innerText = "FREE COURSES AND DOCS";
    freeHeader.style.cssText = "color:var(--text-muted); margin-top:30px; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px;";
    container.appendChild(freeHeader);

    const freeListDiv = document.createElement('div');
    freeListDiv.id = 'free-courses-list';
    container.appendChild(freeListDiv);

    const freeRes = currentModalNode.freeCourses || [];
    if (freeRes.length === 0) {
        freeListDiv.innerHTML = `<div style="font-style:italic; opacity:0.5; font-size:0.9rem;">No free courses yet.</div>`;
    } else {
        let lastRank = 0;
        freeRes.forEach((r, idx) => {
            const currentRank = getPlatformRank(r.url);
            // Insert divider if category changes
            if (lastRank !== 0 && currentRank !== lastRank) {
                const divider = document.createElement('div');
                divider.style.cssText = 'border-top: 1px dashed rgba(255, 255, 255, 0.2); margin: 15px 0 10px 0; width: 100%;';
                freeListDiv.appendChild(divider);
            }
            lastRank = currentRank;

            const safeUrl = ensureAbsoluteUrl(r.url);
            const iconHtml = getIconForUrl(r.url, r.type);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'resource-item-wrapper';
            itemDiv.style.cssText = 'margin-bottom:5px; display:flex; align-items:center; gap:10px;';
            itemDiv.innerHTML = `<a href="${safeUrl}" target="_blank" class="resource-link" style="flex:1; margin-bottom:0;">${iconHtml} ${r.title}</a>`;
            if (isEditMode) {
                itemDiv.innerHTML += `<span style="cursor:pointer;" title="Edit" onclick="editFreeCourse(${idx})">✏️</span><span style="cursor:pointer; color:#ff4444;" title="Delete" onclick="deleteFreeCourse(${idx})">✕</span>`;
            }
            freeListDiv.appendChild(itemDiv);
        });
    }
    if (isEditMode && freeRes.length > 0) {
        new Sortable(freeListDiv, { animation: 150, ghostClass: 'sortable-ghost', onEnd: (evt) => saveFreeCourseOrder(evt.oldIndex, evt.newIndex) });
    }
}

// --- Resource Helper Functions ---

async function saveOfficialOrder(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;
    const item = currentModalNode.resources.splice(oldIndex, 1)[0];
    currentModalNode.resources.splice(newIndex, 0, item);
    await saveRoadmapData();
}

async function deleteOfficialResource(index) {
    if (!confirm("Delete this official resource?")) return;
    currentModalNode.resources.splice(index, 1);
    renderResources();
    saveRoadmapData();
}

function closeMainResourceEditModal() {
    document.getElementById('main-resource-edit-modal').classList.remove('visible');
}

function editOfficialResource(index) {
    const r = currentModalNode.resources[index];
    document.getElementById('edit-main-res-index').value = index;
    document.getElementById('edit-main-res-type').value = 'official';
    document.getElementById('edit-main-res-title').value = r.title;
    document.getElementById('edit-main-res-url').value = r.url;
    document.getElementById('main-resource-modal-title').innerText = 'Edit Official Doc';
    document.getElementById('main-resource-edit-modal').classList.add('visible');
}

function editFreeCourse(index) {
    const r = currentModalNode.freeCourses[index];
    document.getElementById('edit-main-res-index').value = index;
    document.getElementById('edit-main-res-type').value = 'free';
    document.getElementById('edit-main-res-title').value = r.title;
    document.getElementById('edit-main-res-url').value = r.url;
    document.getElementById('main-resource-modal-title').innerText = 'Edit Free Course';
    document.getElementById('main-resource-edit-modal').classList.add('visible');
}

async function saveMainResourceEdit() {
    const index = parseInt(document.getElementById('edit-main-res-index').value);
    const type = document.getElementById('edit-main-res-type').value;
    const title = document.getElementById('edit-main-res-title').value.trim();
    const url = document.getElementById('edit-main-res-url').value.trim();

    if (!title || !url) {
        alert("Both Title and URL are required!");
        return;
    }

    if (type === 'official') {
        currentModalNode.resources[index].title = title;
        currentModalNode.resources[index].url = ensureAbsoluteUrl(url);
    } else {
        currentModalNode.freeCourses[index].title = title;
        currentModalNode.freeCourses[index].url = ensureAbsoluteUrl(url);
    }

    closeMainResourceEditModal();
    renderResources();
    saveRoadmapData();
    showToast("✅ Resource Updated");
}

async function saveFreeCourseOrder(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;
    if (!currentModalNode.freeCourses) return;
    const item = currentModalNode.freeCourses.splice(oldIndex, 1)[0];
    currentModalNode.freeCourses.splice(newIndex, 0, item);
    await saveRoadmapData();
}

async function deleteFreeCourse(index) {
    if (!confirm("Delete this free course?")) return;
    currentModalNode.freeCourses.splice(index, 1);
    renderResources();
    saveRoadmapData();
}

// --- SECTION Free Courses CRUD Helpers (End) ---

// Helper to save global roadmap data (Official + Free Courses)
async function saveRoadmapData() {
    let collectionName = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
    let docId = currentModalNode.id.toString();
    try {
        await db.collection(collectionName).doc(docId).update({
            resources: currentModalNode.resources || [],
            freeCourses: currentModalNode.freeCourses || []
        });
        showToast("✅ Global Resources Updated");
    } catch (e) {
        console.error("Save failed, attempting merge...", e);
        await db.collection(collectionName).doc(docId).set(currentModalNode, { merge: true });
    }
}

async function saveResource() {
    const cat = document.getElementById('res-category').value;
    const t = document.getElementById('res-title').value;
    const u = document.getElementById('res-url').value;
    if (!t || !u || !isEditMode) return;

    const newRes = { title: t, url: ensureAbsoluteUrl(u), type: 'link' };
    if (cat === 'official') {
        if (!currentModalNode.resources) currentModalNode.resources = [];
        currentModalNode.resources.push(newRes);
    } else {
        if (!currentModalNode.freeCourses) currentModalNode.freeCourses = [];
        currentModalNode.freeCourses.push(newRes);
    }

    document.getElementById('res-title').value = '';
    document.getElementById('res-url').value = '';
    renderResources();
    saveRoadmapData();
}

// --- 9. OBSIDIAN & EXTRAS ---
function sanitizeFilename(text) {
    // STRICT LINUX COMPATIBILITY
    // Step 1: Replace & with _and_
    let result = text.replace(/&/g, '_and_');
    // Step 2: Replace spaces with underscores
    result = result.replace(/\s+/g, '_');
    // Step 3: Remove ALL non-alphanumeric characters (keep only a-z, A-Z, 0-9, _, -)
    result = result.replace(/[^a-zA-Z0-9_-]/g, '');
    // Step 4: Clean up multiple underscores
    result = result.replace(/_+/g, '_');
    // Step 5: Trim underscores from start/end
    result = result.replace(/^_+|_+$/g, '');
    return result;
}

function configureObsidian() {
    let v = prompt("Enter EXACT Vault Name (Case-Sensitive):", userData.vaultName || "");
    if (v) {
        v = v.trim(); // Remove accidental spaces
        userData.vaultName = v;
        localStorage.setItem('obsidianVault', v);
        db.collection('users').doc(currentUser.uid).update({ vaultName: v });
        alert("✅ Vault linked: '" + v + "'");
    }
}

function openObsidian() {
    let uri;

    // Check if the user is inside a course modal
    if (currentModalNode) {
        // Create a new note specifically for this course (No vault name needed)
        const courseName = sanitizeFilename(currentModalNode.title);
        uri = `obsidian://new?name=${encodeURIComponent(courseName + "_Notes")}`;
        showToast(`📝 Opening note for ${currentModalNode.title}...`);
    } else {
        // If clicked from the main header, just open the Obsidian App
        uri = "obsidian://open";
        showToast("💎 Launching Obsidian...");
    }

    // Trigger the OS to open the app
    window.location.href = uri;
}

function switchPanel(p) {
    document.querySelectorAll('.panel-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel-content').forEach(c => c.classList.remove('active'));

    if (p === 'parallel') {
        document.querySelectorAll('.panel-tab')[0].classList.add('active');
        document.getElementById('tab-parallel').classList.add('active');
    } else if (p === 'squad') {
        document.querySelectorAll('.panel-tab')[1].classList.add('active');
        document.getElementById('tab-squad').classList.add('active');
        fetchLeaderboard();
    }
}




async function fetchLeaderboard() {
    const l = document.getElementById('leaderboard-list');
    l.innerHTML = 'Loading...';

    try {
        const snap = await db.collection('users').orderBy('totalPercent', 'desc').limit(10).get();
        l.innerHTML = '';

        if (snap.empty) {
            l.innerHTML = '<div style="padding:20px; text-align:center; opacity:0.6;">No data yet.</div>';
            return;
        }

        let r = 1;
        snap.forEach(doc => {
            const d = doc.data();
            l.innerHTML += `
                        <div class="rank-item ${r === 1 ? 'gold' : ''}" style="${doc.id === currentUser.uid ? 'border:1px solid var(--primary)' : ''}">
                            <div class="rank-num">#${r}</div>
                            <div style="flex:1; margin-left:10px;">
                                <div>${d.displayName}</div>
                                <div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${d.totalPercent || 0}%"></div></div>
                            </div>
                            <div style="font-weight:bold; margin-left:10px;">${d.totalPercent || 0}%</div>
                        </div>`;
            r++;
        });
    } catch (e) {
        console.error("Leaderboard Error:", e);
        if (e.code === 'failed-precondition') {
            l.innerHTML = '<div style="padding:15px; color:var(--text-muted); font-size:0.85rem; text-align:center;">⚠️ Firestore Index Required.<br>Open console for creation link.</div>';
        } else {
            l.innerHTML = '<div style="padding:15px; color:red; font-size:0.8rem; text-align:center;">Failed to load leaderboard.</div>';
        }
    }
}

// --- 11. SYSTEM STATUS / OBSERVABILITY DASHBOARD ---
function openStatusModal() {
    const modal = document.getElementById('status-modal');
    modal.classList.add('visible');

    // 1. Mission Duration (Uptime)
    calculateUptime();

    // 2. Study Consistency (Cluster Health)
    calculateClusterHealth();

    // 3. Global Coverage (Progress)
    calculateKnowledgeProgress();

    // 4. Intel Gathered (Real Logs Data)
    calculateTotalLogs();
}

function closeStatusModal() {
    document.getElementById('status-modal').classList.remove('visible');
}

function calculateUptime() {
    // Safety check for invalid or missing joinedDate
    if (!userData || !userData.joinedDate) {
        const uptimeEl = document.getElementById('status-uptime');
        if (uptimeEl) uptimeEl.innerText = "INITIALIZING...";
        return;
    }

    const joinedDate = new Date(userData.joinedDate);
    if (isNaN(joinedDate.getTime())) {
        const uptimeEl = document.getElementById('status-uptime');
        if (uptimeEl) uptimeEl.innerText = "00D 00H 00M";
        return;
    }

    // Rely on fixed joinedDate anchor
    const diff = Date.now() - joinedDate.getTime();

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    const uptimeEl = document.getElementById('status-uptime');
    if (uptimeEl) {
        uptimeEl.innerText = `${days.toString().padStart(2, '0')}D ${hours.toString().padStart(2, '0')}H ${mins.toString().padStart(2, '0')}M`;
    }
}

function calculateClusterHealth() {
    const dot = document.querySelector('.health-dot');
    const text = document.getElementById('health-text');

    // Logic: Look for any topic completed in last 72 hours
    let lastActivity = 0;
    // Check logs for recent entries
    Object.values(userData.logs || {}).forEach(logList => {
        logList.forEach(entry => {
            const time = new Date(entry.date).getTime();
            if (time > lastActivity) lastActivity = time;
        });
    });

    const isHealthy = (Date.now() - lastActivity) < (3 * 24 * 60 * 60 * 1000);

    if (isHealthy) {
        if (dot) dot.className = 'health-dot healthy';
        if (text) {
            text.innerText = 'HEALTHY';
            text.className = 'neon-green';
        }
    } else {
        if (dot) dot.className = 'health-dot';
        if (text) {
            text.innerText = 'DEGRADED';
            text.className = 'neon-amber';
        }
    }
}

function calculateKnowledgeProgress() {
    let totalT = 0, totalD = 0;
    [...roadmapNodes, ...parallelNodes].forEach(n => {
        const nTopics = n.topics || [];
        totalT += nTopics.length;
        totalD += (userData.progress[n.id] || []).length;
    });

    const percent = totalT === 0 ? 0 : Math.round((totalD / totalT) * 100);
    const conic = document.getElementById('status-nodes-progress');
    const label = document.getElementById('status-nodes-percent');

    if (label) label.innerText = percent + "%";
    if (conic) conic.style.background = `conic-gradient(var(--secondary) 0% ${percent}%, rgba(255, 255, 255, 0.05) ${percent}% 100%)`;
}

function calculateTotalLogs() {
    const countEl = document.getElementById('status-total-logs');
    const footerEl = document.getElementById('status-last-log');

    if (!userData) return;

    let totalCount = 0;
    let latestTime = 0;

    // 1. Count Captain's Logs (Dated)
    if (userData.logs) {
        Object.values(userData.logs).forEach(logList => {
            if (Array.isArray(logList)) {
                totalCount += logList.length;
                logList.forEach(entry => {
                    if (entry && entry.date) {
                        const time = new Date(entry.date).getTime();
                        if (!isNaN(time) && time > latestTime) latestTime = time;
                    }
                });
            }
        });
    }

    // 2. Count Topic Notes (from userData.progress keys ending in _notes)
    if (userData.progress) {
        Object.keys(userData.progress).forEach(key => {
            if (key.endsWith('_notes')) {
                const noteContent = userData.progress[key];
                if (typeof noteContent === 'string' && noteContent.trim() !== "") {
                    totalCount++;
                }
            }
        });
    }

    // 3. Count Personal Links (from userData.userLinks)
    if (userData.userLinks) {
        Object.values(userData.userLinks).forEach(linkList => {
            if (Array.isArray(linkList)) {
                totalCount += linkList.length;
            }
        });
    }

    if (countEl) countEl.innerText = totalCount;
    if (footerEl) {
        footerEl.innerText = latestTime > 0
            ? `Latest: ${new Date(latestTime).toLocaleDateString('en-GB')}`
            : "Latest: None";
    }
}

// =========================================
// 🤖 CHATBOT UI & HELPERS
// =========================================

window.toggleChat = function () {
    const win = document.getElementById('ai-chat-window');
    const btn = document.getElementById('chatbot-trigger');

    if (!win) return;

    if (win.classList.contains('visible')) {
        win.classList.remove('visible');
        if (btn) btn.classList.remove('pushed-down');
    } else {
        win.classList.add('visible');
        if (btn) btn.classList.add('pushed-down');

        // Focus input
        setTimeout(() => {
            const input = document.getElementById('chat-user-input');
            if (input) input.focus();
        }, 300);
    }
};

function renderMessage(text, sender) {
    const box = document.getElementById('chat-messages');
    if (!box) return;

    const role = sender === 'bot' ? 'ai' : sender;
    const d = document.createElement('div');
    d.className = `chat-msg ${role}`;
    d.dir = "auto";

    // Use marked if available and sender is bot, otherwise text
    if (sender === 'bot' && typeof marked !== 'undefined') {
        d.innerHTML = marked.parse(text);
    } else {
        d.textContent = text;
    }

    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

function showLoadingIndicator() {
    const box = document.getElementById('chat-messages');
    const d = document.createElement('div');
    d.className = 'chat-msg ai loading-indicator';
    const id = 'loading-' + Date.now();
    d.id = id;
    d.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ==========================================
// 🚀 SMART CHATBOT LOGIC (Gemini 2.5 Flash)
// ==========================================

// 1. Memory & Persona Setup
if (typeof chatHistory === 'undefined') {
    var chatHistory = [];
}

const SYSTEM_PROMPT = `
You are a Senior DevOps Mentor acting as a "Caring Critic".
Your goal is the user's professional mastery.
RULES:
1. No "Hello" or repetitive greetings. Start directly.
2. Be concise and direct.
3. If user speaks Arabic, reply in Egyptian Tech Slang (يا هندسة، عاش، بص بقى).
4. If user speaks English, reply in Professional English.
`;

// Initialize Memory
if (chatHistory.length === 0) {
    chatHistory.push({ role: "user", parts: [{ text: SYSTEM_PROMPT }] });
    chatHistory.push({ role: "model", parts: [{ text: "Understood. Ready." }] });
}

// 2. API Call Function (Gemini 2.5 Flash)
async function callGeminiAPI() {
    // Point to Cloudflare Pages Function
    const API_URL = "/chat";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

// 3. Send Message & UI Logic
async function sendMessage() {
    const chatInput = document.getElementById('chat-user-input');
    const message = chatInput.value.trim();

    if (!message) return;

    // Render User Message
    renderMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Add to History
    chatHistory.push({ role: "user", parts: [{ text: message }] });

    // Show Loading
    const loadingId = showLoadingIndicator();

    try {
        const reply = await callGeminiAPI();
        removeLoadingIndicator(loadingId);

        // Render Bot Reply
        renderMessage(reply, 'bot');
        chatHistory.push({ role: "model", parts: [{ text: reply }] });

    } catch (error) {
        removeLoadingIndicator(loadingId);
        renderMessage(`System Error: ${error.message}.`, 'bot');
    }
}

// 4. Event Listeners
const sendBtn = document.getElementById('send-btn');
if (sendBtn) {
    sendBtn.onclick = sendMessage;
}

const chatInput = document.getElementById('chat-user-input');
if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// =========================================
// 💡 SMART DEVOPS TIPS (Rotates every 3 Hours)
// =========================================

const devopsTipsList = [
    "Automate everything you do more than twice. Your future self will thank you.",
    "Treat your Infrastructure as Code (IaC). If it's not in Git, it doesn't exist.",
    "Fail fast, fail often, recover quickly. The goal is resilience, not perfection.",
    "Observability is key: Monitor everything, but only alert on actionable events.",
    "Security is everyone's responsibility (DevSecOps), not just the security team's.",
    "Keep your feedback loops short. Deploy smaller changes more frequently.",
    "Don't just fix the bug, fix the process that allowed the bug to happen.",
    "Master the Command Line; GUIs are nice, but the terminal is your superpower.",
    "Containers are ephemeral. Never store persistent data inside a container.",
    "Continuous Improvement is better than delayed perfection. Ship it!"
];

function updateDevOpsTip() {
    const tipElement = document.getElementById('tip-text');
    if (!tipElement) return;

    const now = Date.now();
    const durationPerTip = 3 * 60 * 60 * 1000;
    const tipIndex = Math.floor(now / durationPerTip) % devopsTipsList.length;

    tipElement.innerText = `"${devopsTipsList[tipIndex]}"`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateDevOpsTip();
    setInterval(updateDevOpsTip, 60000);
});



