
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

// --- 2. DYNAMIC DATA (Fetched from Firestore) ---     
// No hardcoded data is stored here.

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

        // 3. Initialize Linux Roadmap Real-time Listener
        initializeRoadmapListener();

        // 4. Recalculate progress based on current roadmap
        await recalculateGlobalProgress();

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

// --- PURE FIRESTORE LISTENER (No Seeding) ---
// Listen to Linux roadmap data in real-time
function initializeRoadmapListener() {
    // Listen to the Linux roadmap with real-time updates
    db.collection('global_roadmap')
        .where('slug', '==', 'linux')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                console.log("📭 No data yet for Linux roadmap. Waiting for admin to add topics...");
                window.globalRoadmapData = null;
                return;
            }

            // Process the snapshot data
            const linuxData = snapshot.docs[0].data();
            window.globalRoadmapData = linuxData;

            // Identify the currently active tab (default to 'admin-1')
            const activeTab = getActiveTab() || 'admin-1';

            // Render the roadmap immediately
            renderRoadmap(activeTab);

            console.log("✅ Linux roadmap data loaded and rendered.", linuxData);
        }, (error) => {
            console.error("⚠️ Error listening to Linux roadmap:", error);
        });
}

// Helper function to get the currently active tab
function getActiveTab() {
    // Check if there's a tab selection in the UI
    const activeTabElement = document.querySelector('.roadmap-tab.active');
    if (activeTabElement) {
        return activeTabElement.getAttribute('data-module');
    }
    // Default to 'admin-1' if no active tab is found
    return 'admin-1';
}

// Function to render the roadmap based on active tab with accordion layout
// Updated to target #roadmap-list as requested by user
function renderRoadmap(module) {
    // Safety check: Ensure data is ready
    if (!window.globalRoadmapData) {
        console.warn("Roadmap data not ready yet. Skipping render.");
        return;
    }

    const topics = (window.globalRoadmapData.topics || []).filter(t => t.module === module);

    // User requested to target #roadmap-list
    let container = document.getElementById('roadmap-list');

    // Fallback if #roadmap-list doesn't exist but #roadmap-topics-container does (compatibility)
    if (!container) {
        container = document.getElementById('roadmap-topics-container');
    }

    if (!container) {
        console.warn("Target container (#roadmap-list) not found in DOM.");
        return;
    }

    container.innerHTML = '';

    if (topics.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No topics in this module yet.</p>';
        return;
    }

    // Group topics by chapter
    const chapterMap = new Map();
    topics.forEach(topic => {
        const chapter = topic.chapter || 'General Topics';
        if (!chapterMap.has(chapter)) {
            chapterMap.set(chapter, []);
        }
        chapterMap.get(chapter).push(topic);
    });

    // Render each chapter as an accordion
    chapterMap.forEach((chapterTopics, chapterName) => {
        // Calculate chapter progress using EXISTING helper (userData)
        const completedCount = chapterTopics.filter(t => isTopicComplete(t.id)).length;
        const totalCount = chapterTopics.length;
        const progressText = `${completedCount}/${totalCount}`; // Keep matching format

        // Create accordion container
        const accordion = document.createElement('div');
        accordion.className = 'chapter-accordion';

        // Create header
        const header = document.createElement('div');
        header.className = 'chapter-header';

        // Build header HTML with conditional delete button for admin
        let headerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <i class="fas fa-chevron-down chapter-chevron"></i>
                <span class="chapter-title">${chapterName}</span>
            </div>
            <span class="chapter-progress">${progressText} Completed</span>
        `;

        // Add delete button if admin
        if (isAdmin) {
            headerHTML += `
                <button class="delete-chapter-btn" data-chapter="${chapterName}" data-module="${module}">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            `;
        }

        header.innerHTML = headerHTML;

        // Create body (collapsible content)
        const body = document.createElement('div');
        body.className = 'chapter-body';

        // Add topics to body
        chapterTopics.forEach(topic => {
            const topicDiv = document.createElement('div');
            // Use .topic-item as requested in CSS
            topicDiv.className = 'topic-item';

            // Simplified structure: removed item-header wrapper to let flexbox work directly on topic-item
            topicDiv.innerHTML = `
                <div class="topic-checkbox">
                    <input type="checkbox" id="${topic.id}" ${isTopicComplete(topic.id) ? 'checked' : ''} onchange="toggleTopicComplete('${topic.id}')">
                </div>
                <label for="${topic.id}" class="topic-title">${topic.title}</label>
            `;
            body.appendChild(topicDiv);
        });

        if (isAdmin) {
            console.log(`Rendering Chapter: ${chapterName} with Delete Button`);
        }

        // Add click handler to toggle accordion
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking the delete button
            if (e.target.closest('.delete-chapter-btn')) {
                return;
            }

            const isExpanded = accordion.classList.contains('expanded');
            accordion.classList.toggle('expanded');

            // Update chevron rotation
            const chevron = header.querySelector('.chapter-chevron');
            if (chevron) {
                chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });

        // Add delete button event listener if admin
        if (isAdmin) {
            const deleteBtn = header.querySelector('.delete-chapter-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent accordion toggle
                    const chapterName = deleteBtn.getAttribute('data-chapter');
                    const moduleName = deleteBtn.getAttribute('data-module');
                    deleteChapter(chapterName, moduleName);
                });
            }
        }

        // Assemble accordion
        accordion.appendChild(header);
        accordion.appendChild(body);
        container.appendChild(accordion);
    });
}
function isTopicComplete(topicId) {
    if (!userData || !userData.progress) return false;
    const linuxProgress = userData.progress['linux'] || [];
    return linuxProgress.includes(topicId);
}

// Toggle topic completion status
async function toggleTopicComplete(topicId) {
    if (!currentUser) return;

    const linuxProgress = userData.progress['linux'] || [];
    const index = linuxProgress.indexOf(topicId);
    const isCompleting = index === -1; // true if checking, false if unchecking

    if (index > -1) {
        // Remove from completed
        linuxProgress.splice(index, 1);
    } else {
        // Add to completed
        linuxProgress.push(topicId);
    }

    userData.progress['linux'] = linuxProgress;

    // Update lastActive timestamp
    const now = new Date().toISOString();
    userData.lastActive = now;

    // Track activity history (only on completion)
    if (isCompleting) {
        if (!userData.activityHistory) userData.activityHistory = [];
        userData.activityHistory.push({ date: now, type: 'topic_complete' });
    }

    // Build Firestore update payload
    const updatePayload = {
        'progress.linux': linuxProgress,
        lastActive: now
    };
    if (isCompleting) {
        updatePayload.activityHistory = userData.activityHistory;
    }

    // Update Firestore
    await db.collection('users').doc(currentUser.uid).update(updatePayload);

    // Recalculate global progress
    await recalculateGlobalProgress();

    // Update chapter progress indicators in the accordion
    updateChapterProgress();

    // Recalculate health immediately
    calculateClusterHealth();

    // Refresh heatmap if profile modal is open
    renderHeatmap();

    console.log(`✅ Topic ${topicId} toggled.`);
}

// Helper function to update chapter progress indicators without full re-render
function updateChapterProgress() {
    if (!window.globalRoadmapData) return;

    document.querySelectorAll('.chapter-accordion').forEach(accordion => {
        const chapterTitle = accordion.querySelector('.chapter-title').textContent;
        const chapterTopics = (window.globalRoadmapData.topics || []).filter(t => t.chapter === chapterTitle);

        const completedCount = chapterTopics.filter(t => isTopicComplete(t.id)).length;
        const totalCount = chapterTopics.length;

        const progressElement = accordion.querySelector('.chapter-progress');
        if (progressElement) {
            progressElement.textContent = `${completedCount}/${totalCount} Completed`;
        }
    });
}

// Delete entire chapter (Admin Only)
async function deleteChapter(chapterName, moduleName) {
    if (!isAdmin) {
        console.warn('⚠️ Only admins can delete chapters');
        return;
    }

    // Check if we have a valid modal node open
    if (!currentModalNode) {
        alert('❌ No course selected. Please open a course first.');
        return;
    }

    // Confirm with user
    const confirmMessage = `Are you sure you want to delete the entire chapter "${chapterName}" and all its topics?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const currentTopics = currentModalNode.topics || [];

        // Filter out all topics that match both chapterName and moduleName (or just chapter if no module)
        const filteredTopics = currentTopics.filter(topic => {
            const topicChapter = topic.chapter || topic.section || 'General Topics';
            // If moduleName is provided, match both chapter and module
            if (moduleName && moduleName !== 'undefined' && moduleName !== 'null') {
                return !(topicChapter === chapterName && topic.module === moduleName);
            }
            // Otherwise just match chapter name
            return topicChapter !== chapterName;
        });

        const deletedCount = currentTopics.length - filteredTopics.length;

        if (deletedCount === 0) {
            alert('⚠️ No topics found in this chapter');
            return;
        }

        // Update local data
        currentModalNode.topics = filteredTopics;

        // Save to Firestore using the correct collection
        const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
        await db.collection(col).doc(currentModalNode.id.toString()).update({
            topics: filteredTopics
        });

        console.log(`✅ Deleted ${deletedCount} topics from chapter "${chapterName}"`);
        showToast(`✅ Chapter "${chapterName}" deleted (${deletedCount} topics removed)`);

        // Re-render the checklist
        renderChecklist();

    } catch (error) {
        console.error('❌ Error deleting chapter:', error);
        alert('Error deleting chapter: ' + error.message);
    }
}

// Edit chapter name - Enable inline editing (Admin Only)
function editChapterName(oldChapterName, moduleName) {
    if (!isAdmin) {
        console.warn('⚠️ Only admins can edit chapter names');
        return;
    }

    if (!currentModalNode) {
        alert('❌ No course selected. Please open a course first.');
        return;
    }

    // Find the chapter title element
    const titleId = `chapter-title-${oldChapterName.replace(/\s+/g, '-')}`;
    const titleSpan = document.getElementById(titleId);

    if (!titleSpan) {
        console.error('Chapter title element not found:', titleId);
        return;
    }

    // Create inline edit input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldChapterName;
    input.className = 'dark-input chapter-name-edit';
    input.style.cssText = 'padding:5px 10px; font-size:1rem; font-weight:bold; min-width:200px; border:2px solid var(--primary); border-radius:4px;';

    // Replace title span with input
    titleSpan.replaceWith(input);
    input.focus();
    input.select();

    // Save on Enter or blur
    const saveEdit = async () => {
        const newChapterName = input.value.trim();

        if (!newChapterName || newChapterName === oldChapterName) {
            // Cancelled or no change - just re-render
            renderChecklist();
            return;
        }

        try {
            const currentTopics = currentModalNode.topics || [];
            let updatedCount = 0;

            // Update all topics with the old chapter name
            currentTopics.forEach(topic => {
                const topicChapter = topic.chapter || topic.section || 'General Topics';
                const topicModule = topic.module || '';

                // Match by chapter name and module (if module is specified)
                if (topicChapter === oldChapterName) {
                    if (!moduleName || moduleName === '' || topicModule === moduleName) {
                        topic.chapter = newChapterName;
                        updatedCount++;
                    }
                }
            });

            if (updatedCount === 0) {
                showToast('⚠️ No topics found in this chapter');
                renderChecklist();
                return;
            }

            // Save to Firestore
            const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
            await db.collection(col).doc(currentModalNode.id.toString()).update({
                topics: currentTopics
            });

            console.log(`✅ Renamed chapter "${oldChapterName}" to "${newChapterName}" (${updatedCount} topics updated)`);
            showToast(`✅ Chapter renamed to "${newChapterName}"`);

            // Re-render the checklist
            renderChecklist();

        } catch (error) {
            console.error('❌ Error renaming chapter:', error);
            showToast('❌ Error renaming chapter');
            renderChecklist();
        }
    };

    // Event listeners
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur(); // Trigger save via blur
        }
        if (e.key === 'Escape') {
            renderChecklist(); // Cancel
        }
    });
}

// Save chapter order after drag and drop (Admin Only)
async function saveChapterOrder(activeModule) {
    if (!isAdmin || !currentModalNode) return;

    try {
        const listDiv = document.getElementById('checklist-items-list');
        if (!listDiv) return;

        // Get new chapter order from DOM
        const chapterAccordions = listDiv.querySelectorAll('.chapter-accordion');
        const newChapterOrder = [];

        chapterAccordions.forEach(accordion => {
            const chapterName = accordion.getAttribute('data-chapter');
            if (chapterName) {
                newChapterOrder.push(chapterName);
            }
        });

        // Reorder topics based on new chapter order
        const currentTopics = currentModalNode.topics || [];
        const reorderedTopics = [];

        // First, add topics in the new chapter order
        newChapterOrder.forEach(chapterName => {
            const chapterTopics = currentTopics.filter(t => {
                const topicChapter = t.chapter || t.section || 'General Topics';
                const topicModule = t.module || '';

                // Only match topics for the active module
                if (activeModule && activeModule !== '__general__') {
                    return topicChapter === chapterName && topicModule === activeModule;
                }
                return topicChapter === chapterName && !topicModule;
            });
            reorderedTopics.push(...chapterTopics);
        });

        // Add any remaining topics that weren't in the reordered list (from other modules)
        currentTopics.forEach(t => {
            if (!reorderedTopics.includes(t)) {
                reorderedTopics.push(t);
            }
        });

        // Update local data
        currentModalNode.topics = reorderedTopics;

        // Save to Firestore
        const col = currentModalNode.id.toString().startsWith('p') ? 'global_parallel' : 'global_roadmap';
        await db.collection(col).doc(currentModalNode.id.toString()).update({
            topics: reorderedTopics
        });

        console.log('✅ Chapter order saved');
        showToast('✅ Chapter order updated');

    } catch (error) {
        console.error('❌ Error saving chapter order:', error);
    }
}

// Legacy fetchRoadmap function kept for compatibility with existing code
async function fetchRoadmap() {
    // 1. Fetch ALL Main Roadmap data
    const snap = await db.collection('global_roadmap').get();

    if (snap.empty) {
        console.warn("⚠️ Main Roadmap is empty. Waiting for Admin to add courses.");
        roadmapNodes = [];
    } else {
        roadmapNodes = [];
        snap.forEach(doc => {
            const d = doc.data();
            d.id = parseInt(doc.id);
            d.order = typeof d.order === 'number' ? d.order : 999;
            roadmapNodes.push(d);
        });
        roadmapNodes.sort((a, b) => a.order - b.order);
    }

    // 2. Fetch ALL Parallel Tracks data
    const pSnap = await db.collection('global_parallel').get();

    if (pSnap.empty) {
        console.warn("⚠️ Parallel Tracks are empty. Waiting for Admin to add tracks.");
        parallelNodes = [];
    } else {
        parallelNodes = [];
        pSnap.forEach(doc => {
            const d = doc.data();
            d.id = doc.id;
            d.order = typeof d.order === 'number' ? d.order : 999;
            parallelNodes.push(d);
        });
        parallelNodes.sort((a, b) => a.order - b.order);
    }
}

async function loadUserData(user) {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
        userData = doc.data();
        if (!userData.logs) userData.logs = {}; // Backwards compatibility
        if (!userData.resources) userData.resources = {};
        if (!userData.proofs) userData.proofs = {};
        if (!userData.progress) userData.progress = {};

        // Note: totalPercent will be recalculated after roadmap loads

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

async function recalculateGlobalProgress() {
    if (!currentUser) return 0;

    // Count total topics across all courses
    let totalTopics = 0;
    let completedTopics = 0;

    [...roadmapNodes, ...parallelNodes].forEach(node => {
        const nodeTopics = node.topics || [];
        totalTopics += nodeTopics.length;

        const userProgress = userData.progress[node.id] || [];
        completedTopics += userProgress.length;
    });

    // Calculate percentage
    const globalPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    // Update local data
    userData.totalPercent = globalPercent;

    // Update UI
    const photo = userData.photoURL || currentUser.photoURL || '';
    const imgHtml = photo ? `<img src="${photo}" style="width:24px; height:24px; border-radius:50%; vertical-align:middle; margin-right:5px; border:1px solid var(--primary);">` : '';
    document.getElementById('user-name-display').innerHTML = `${imgHtml} ${userData.displayName} <span style="color:var(--gold); font-size:0.8rem; margin-left:5px;">(${globalPercent}%)</span>`;

    // Update Firebase
    await db.collection('users').doc(currentUser.uid).update({
        totalPercent: globalPercent
    });

    return globalPercent;
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

    // 1. Aggregate activity counts per day from ALL sources
    const activityDates = {};

    // A. Logs (Captain's Log entries)
    Object.values(userData.logs || {}).forEach(nodeLogs => {
        nodeLogs.forEach(log => {
            if (log.date) {
                const dateStr = log.date.split('T')[0]; // YYYY-MM-DD
                activityDates[dateStr] = (activityDates[dateStr] || 0) + 1;
            }
        });
    });

    // B. Activity History (topic completions, etc.)
    (userData.activityHistory || []).forEach(entry => {
        if (entry.date) {
            const dateStr = entry.date.split('T')[0];
            activityDates[dateStr] = (activityDates[dateStr] || 0) + 1;
        }
    });

    // 2. Generate grid from Feb 1, 2026 to May 31, 2026
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-05-31');

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        const sq = document.createElement('div');
        sq.className = 'heatmap-sq';

        const count = activityDates[dateStr] || 0;

        // Assign intensity level (GitHub-style)
        let level = 0;
        if (count >= 7) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;

        sq.setAttribute('data-level', level);

        // Tooltip
        sq.title = count > 0
            ? `${count} activit${count === 1 ? 'y' : 'ies'} on ${dateStr}`
            : `No activity on ${dateStr}`;

        container.appendChild(sq);

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
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

// --- AUTO PROGRESS RECALCULATION (Silent) ---
// Runs automatically without confirmation or reload
async function recalculateAllUsersProgressSilent() {
    if (!isAdmin) return;

    try {
        const usersSnap = await db.collection('users').get();

        for (const userDoc of usersSnap.docs) {
            const userProgress = userDoc.data().progress || {};

            let totalTopics = 0;
            let completedTopics = 0;

            [...roadmapNodes, ...parallelNodes].forEach(node => {
                const nodeTopics = node.topics || [];
                totalTopics += nodeTopics.length;

                const progress = userProgress[node.id] || [];
                completedTopics += progress.length;
            });

            const globalPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

            await db.collection('users').doc(userDoc.id).update({
                totalPercent: globalPercent
            });
        }

        console.log('✅ All users progress recalculated silently');
    } catch (error) {
        console.error('⚠️ Silent recalculation failed:', error);
        // Don't block main operation
    }
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

        // Percentage Badge logic - Always show badge
        const totalTopics = (node.topics || []).length;
        const percent = totalTopics > 0 ? Math.round((done / totalTopics) * 100) : 0;

        // Always show badge (even for new courses with 0 topics)
        const badgeHtml = `<div class="percentage-badge">${percent}%</div>`;

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

    // Setup listeners for icon autocomplete
    setupIconListeners();
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

    // Setup listeners for icon autocomplete
    setupIconListeners();
}

async function saveCourseNode() {
    const id = document.getElementById('edit-c-id').value;
    const title = document.getElementById('edit-c-title').value;
    const slug = document.getElementById('edit-c-slug').value;
    const duration = document.getElementById('edit-c-duration').value;

    if (!title) return alert("Title required");

    if (id) {
        // EDIT - Find the node first
        const node = roadmapNodes.find(n => n.id.toString() === id.toString());
        if (node) {
            // Update local data
            node.title = title;
            if (slug) node.slug = slug;
            if (duration) node.duration = duration;

            // 🔥 CRITICAL FIX: Save ALL node data, not just updated fields
            // This preserves topics, order, and other fields
            await saveNodeUpdate(node);
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

    // Auto-recalculate ALL users' progress when course structure changes
    await recalculateAllUsersProgressSilent();
}

function closeCourseEditModal() {
    document.getElementById('course-edit-modal').classList.remove('visible');
}

async function deleteNode(id) {
    if (!confirm(`Delete node ${id}? This cannot be undone.`)) return;

    roadmapNodes = roadmapNodes.filter(n => n.id !== id);
    renderGalaxy();

    await db.collection('global_roadmap').doc(id.toString()).delete();

    // Auto-recalculate ALL users' progress when course is removed
    await recalculateAllUsersProgressSilent();
}

async function saveRoadmapOrder(isAutoSave = false) {
    // 🔒 ADMIN CHECK: Only admins can reorder courses
    if (!isAdmin) {
        console.warn('⚠️ Non-admin user attempted to save roadmap order');
        return;
    }

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

    // 3. Save to Firestore - UPDATE ONLY 'order' FIELD (preserves all other data)
    const batch = db.batch();
    roadmapNodes.forEach((n, idx) => {
        const ref = db.collection('global_roadmap').doc(n.id.toString());
        // Using update() with only 'order' field preserves topics, duration, etc.
        batch.update(ref, {
            order: idx
        });
        n.order = idx; // Update local
    });

    try {
        await batch.commit();
        console.log('✅ Roadmap order saved successfully');

        // Auto-recalculate ALL users' progress when course structure changes
        await recalculateAllUsersProgressSilent();

        if (isAutoSave) {
            showToast("✅ Layout Saved");
        } else {
            alert("New Order Saved! Switching back to Galaxy View.");
            // Toggle Off Edit Mode to restore Visual Layout
            document.querySelector('.toggle-switch input').checked = false;
            toggleEditMode(false);
        }
    } catch (error) {
        console.error("❌ Error saving roadmap order:", error);
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

    // Recalculate global progress based on current roadmap
    await recalculateGlobalProgress();

    // Update user progress in Firebase
    if (currentUser) {
        await db.collection('users').doc(currentUser.uid).update({
            [`progress.${currentModalNode.id}`]: list,
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
    calculateTotalLogs();
}

async function deleteUserLink(topicIndex, linkIndex) {
    if (!confirm("Delete this link?")) return;

    const key = `${currentModalNode.id}_${currentModalNode.topics[topicIndex].id}`;
    userData.userLinks[key].splice(linkIndex, 1);

    await db.collection('users').doc(currentUser.uid).update({
        [`userLinks.${key}`]: userData.userLinks[key]
    });

    renderChecklist();
    calculateTotalLogs();
}

function renderChecklist(filterModule = null) {
    // State Persistence: Capture current state before wiping DOM
    const checklistContainerMock = document.getElementById('checklist-items-list');
    const expandedChapters = new Set();
    let domActiveModule = undefined;

    if (checklistContainerMock) {
        checklistContainerMock.querySelectorAll('.chapter-accordion.expanded').forEach(acc => {
            expandedChapters.add(acc.getAttribute('data-chapter'));
        });
    }
    const activeBtn = document.querySelector('.module-filter-btn.active');
    if (activeBtn) domActiveModule = activeBtn.dataset.module;

    const c = document.getElementById('checklist-container');
    c.innerHTML = '';

    // Safety check if topics is undefined
    if (!currentModalNode.topics) currentModalNode.topics = [];

    const done = userData.progress[currentModalNode.id] || [];
    document.getElementById('modal-progress-text').innerText = Math.round((done.length / Math.max(currentModalNode.topics.length, 1)) * 100) + "%";

    // --- MODULE FILTER BAR ---
    // Define fixed modules for Linux course (always show these 3 tabs in order)
    const isLinuxCourse = currentModalNode.slug === 'linux' || currentModalNode.title?.toLowerCase().includes('linux');
    const fixedModules = isLinuxCourse ? ['admin-1', 'admin-2', '__general__'] : [];

    // Detect unique modules in topics
    const detectedModules = [...new Set(currentModalNode.topics.map(t => t.module).filter(Boolean))];

    // For Linux course, use fixed order. For others, use detected modules.
    const modules = isLinuxCourse ? fixedModules : detectedModules;

    // Determine active module: Priority: Argument > DOM State > Default
    let resolvedModule = filterModule;
    // Treat null (default param) same as undefined for persistence logic
    if ((resolvedModule === undefined || resolvedModule === null) && domActiveModule !== undefined) {
        resolvedModule = domActiveModule;
    }

    // Default to 'admin-1' for Linux course, first module for others
    let activeModule = resolvedModule !== undefined ? resolvedModule : (isLinuxCourse ? 'admin-1' : (detectedModules.length > 0 ? detectedModules[0] : null));

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
        'admin-2': 'Linux Admin 2',
        '__general__': 'General Topics',
        'docker-core': 'Docker Core',
        'docker-compose': 'Docker Compose',
        'ecr': 'Amazon ECR',
        'nexus': 'Nexus Repository'
    };

    // For Linux course, always show 3 options: Admin 1, Admin 2, General Topics
    if (isLinuxCourse) {
        let options = `
            <option value="admin-1">Linux Admin 1</option>
            <option value="admin-2">Linux Admin 2</option>
            <option value="">General Topics</option>
        `;
        moduleSelectContainer.innerHTML = `<select id="new-topic-module" class="dark-input" style="min-width:160px; border-color:var(--primary);">${options}</select>`;
        moduleSelectContainer.style.display = 'flex';
    } else if (detectedModules.length > 0) {
        let options = `<option value="">(No Module / General Topics)</option>`;
        options += detectedModules.map(mod => `<option value="${mod}">${moduleLabels[mod] || mod}</option>`).join('');
        moduleSelectContainer.innerHTML = `<select id="new-topic-module" class="dark-input" style="min-width:160px; border-color:var(--primary);">${options}</select>`;
        moduleSelectContainer.style.display = 'flex';
    } else {
        // Fallback for simple roadmaps: just a text section input if needed, or hide
        moduleSelectContainer.innerHTML = `<input type="text" id="new-topic-section-legacy" class="dark-input" placeholder="Section (Optional)" style="width:150px;">`;
        moduleSelectContainer.style.display = 'flex';
    }

    // Show filter bar for Linux course or if there are modules
    const hasGeneralTopics = currentModalNode.topics.some(t => !t.module);
    if (isLinuxCourse || modules.length >= 1 || hasGeneralTopics) {
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
            'admin-2': { slug: 'linux', label: ' Admin 2' },
            '__general__': { slug: null, label: '📚 General Topics' },
            'docker-core': { slug: 'docker', label: 'Docker Core' },
            'docker-compose': { slug: 'docker', label: 'Docker Compose' },
            'ecr': { slug: 'amazonaws', label: 'Amazon ECR' },
            'nexus': { slug: 'sonatype', label: 'Nexus' }
        };

        // Render tabs in correct order
        modules.forEach((mod, idx) => {
            const btn = document.createElement('button');
            const isActive = (mod === activeModule);
            btn.className = 'module-filter-btn' + (isActive ? ' active' : '');
            btn.dataset.module = mod;
            btn.onclick = () => renderChecklist(mod); // Re-render with new filter

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

    // Define helper globally for persistence across renders
    window.filterTopics = function (mod) { renderChecklist(mod); };


    // 1. Create Container for Accordions
    const listDiv = document.createElement('div');
    listDiv.id = 'checklist-items-list';
    c.appendChild(listDiv);

    // Filter Logic
    let visibleTopics = currentModalNode.topics;
    let isGeneralTopicsView = false;

    if (activeModule === '__general__') {
        // Show only topics without a module
        visibleTopics = currentModalNode.topics.filter(t => !t.module);
        isGeneralTopicsView = true;
    } else if (activeModule) {
        visibleTopics = currentModalNode.topics.filter(t => t.module === activeModule);
    }

    // Group by Chapter (Accordion Logic) - Skip for General Topics view
    const chapterMap = new Map();
    if (isGeneralTopicsView) {
        // For General Topics, put all in one flat group
        chapterMap.set('General Topics in Linux', visibleTopics);
    } else {
        visibleTopics.forEach(t => {
            const chapter = t.chapter || t.section || 'General Topics';
            if (!chapterMap.has(chapter)) {
                chapterMap.set(chapter, []);
            }
            chapterMap.get(chapter).push(t);
        });
    }

    // Render Accordions (or flat list for General Topics)
    chapterMap.forEach((chapterTopics, chapterName) => {
        // Calculate Chapter Progress
        const chapterDoneCount = chapterTopics.filter(t => done.includes(t.id)).length;
        const chapterTotal = chapterTopics.length;

        // For General Topics, skip the accordion wrapper and render topics directly
        if (isGeneralTopicsView) {
            // Flat list container (no accordion)
            const flatListContainer = document.createElement('div');
            flatListContainer.className = 'general-topics-list';
            flatListContainer.style.cssText = 'display:flex; flex-direction:column; width:100%;';

            // Show empty state if no topics
            if (chapterTopics.length === 0) {
                flatListContainer.innerHTML = `
                    <div style="text-align:center; padding:30px; color:var(--text-muted); opacity:0.7;">
                        <i class="fas fa-inbox" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
                        No general topics yet. Add one using the form above!
                    </div>
                `;
                listDiv.appendChild(flatListContainer);
                return;
            }

            listDiv.appendChild(flatListContainer);

            // Render topics directly as flat list
            chapterTopics.forEach(t => {
                const index = currentModalNode.topics.indexOf(t);
                const isChecked = done.includes(t.id);

                const div = document.createElement('div');
                div.className = 'checklist-item roadmap-item';
                div.setAttribute('data-id', t.id);
                div.setAttribute('data-index', index);
                div.style.cssText = 'display:flex; flex-direction:column; width:100%; border-bottom:1px solid rgba(255,255,255,0.05);';

                const headerRow = document.createElement('div');
                headerRow.className = 'topic-item';

                let adminControls = '';
                let dragHandle = '';
                if (isEditMode) {
                    dragHandle = `<span class="topic-drag-handle" style="cursor:grab; font-size:1.2rem; color:var(--text-muted); margin-right:5px;">⣿</span>`;
                    adminControls = `<div style="margin-left:auto; display:flex; gap:10px;"><span style="cursor:pointer;" title="Edit Title" onclick="enableInlineEdit(${index})">✏️</span><span style="color:red; cursor:pointer; font-weight:bold;" title="Delete Topic" onclick="deleteTopic(${index})">✕</span></div>`;
                }

                const arrow = `<i id="arrow-${t.id}" class="fas fa-chevron-right topic-chevron" style="font-size:0.75rem; color:var(--primary); transition:transform 0.3s ease; cursor:pointer;" onclick="toggleAccordion('${t.id}')"></i>`;

                headerRow.innerHTML = `${dragHandle}${arrow}<div class="topic-checkbox"><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTopicDone('${t.id}')" style="transform:scale(1.2); cursor:pointer;"></div><span id="topic-title-${index}" onclick="toggleAccordion('${t.id}')" style="flex:1; cursor:pointer; font-weight:600; display:flex; align-items:center; margin-left:10px; ${isChecked ? 'text-decoration:line-through; opacity:0.7;' : ''}">${t.title}</span>${adminControls}`;

                // Details Body
                const detailsBody = document.createElement('div');
                detailsBody.id = `accordion-${t.id}`;
                detailsBody.style.cssText = 'display:none; padding:12px 16px; border-left:3px solid var(--primary); margin-left:0; width:100%; background:rgba(0, 242, 255, 0.02);';

                // Proof, Resources, Links, Notes (same as normal topics)
                const proofKey = currentModalNode.id + '_' + t.id;
                const proofUrl = (userData.proofs && userData.proofs[proofKey]) || "";
                const externalLinkIcon = proofUrl ? `<a href="${ensureAbsoluteUrl(proofUrl)}" target="_blank" class="external-proof-link"><i class="fas fa-external-link-alt"></i></a>` : '';
                detailsBody.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;"><span class="proof-link-btn ${proofUrl ? 'has-proof' : ''}" onclick="openProofModal('${t.id}', '${proofUrl}')" style="font-size:0.8rem;">${proofUrl ? 'Edit Proof 🔗' : 'Add Proof of Work (GitHub/URL) <i class="fab fa-github"></i>'}</span>${externalLinkIcon}</div>`;

                // Resources
                let resHtml = `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">Recommended Resources:${isEditMode ? `<span onclick="addTopicResource(${index})" style="cursor:pointer; font-size:0.8rem; color:var(--success); margin-left:10px;">(+) Add</span>` : ''}</div>`;
                if (t.resources && t.resources.length > 0) {
                    t.resources.forEach((r, resIdx) => {
                        const iconHtml = getIconForUrl(r.url, r.type);
                        const deleteBtn = isEditMode ? `<span onclick="deleteTopicResource(${index}, ${resIdx})" style="color:red; cursor:pointer; font-size:0.75rem; margin-left:8px;">✕</span>` : '';
                        resHtml += `<div style="display:flex; align-items:center;"><a href="${ensureAbsoluteUrl(r.url)}" target="_blank" class="resource-link" style="font-size:0.85rem; padding:5px;">${iconHtml} ${r.title}</a>${deleteBtn}</div>`;
                    });
                } else {
                    resHtml += `<div style="font-size:0.8rem; font-style:italic; opacity:0.5;">No resources yet.</div>`;
                }
                detailsBody.innerHTML += resHtml;

                // Notes
                const topicNotesKey = currentModalNode.id + '_' + t.id + '_notes';
                const topicNotes = userData.progress[topicNotesKey] || "";
                detailsBody.innerHTML += `<div style="margin-top:10px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;"><i class="fa-regular fa-file-lines" style="margin-right:5px;"></i> My Notes</div><span onclick="toggleNoteEdit('${topicNotesKey}')" style="cursor:pointer; font-size:0.8rem; opacity:0.5;">✏️ Edit</span></div><div id="note-view-${topicNotesKey}" class="md-content" style="background:rgba(0,0,0,0.15); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); min-height:40px; cursor:pointer; font-size:0.9rem;" onclick="toggleNoteEdit('${topicNotesKey}')">${topicNotes ? marked.parse(topicNotes) : '<span style="font-style:italic; opacity:0.4;">Click to add notes...</span>'}</div><textarea id="note-edit-${topicNotesKey}" class="dark-input md-edit-box" dir="auto" style="display:none; width:100%; min-height:120px; font-size:0.9rem; margin-top:0;" onblur="saveNoteAndRender('${topicNotesKey}')">${topicNotes}</textarea></div>`;

                div.appendChild(headerRow);
                div.appendChild(detailsBody);
                flatListContainer.appendChild(div);
            });

            return; // Skip rest of accordion logic for General Topics
        }

        // Accordion Container (for non-General Topics)
        const accordion = document.createElement('div');
        accordion.className = 'chapter-accordion'; // User CSS class
        // Restore expanded state
        if (expandedChapters.has(chapterName)) {
            accordion.classList.add('expanded');
        }
        accordion.style.marginBottom = '10px';

        // Header
        const header = document.createElement('div');
        header.className = 'chapter-header'; // User CSS class

        let headerContent = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                ${isAdmin && isEditMode ? '<span class="chapter-drag-handle" style="cursor:grab; font-size:1rem; color:var(--text-muted); margin-right:5px;" title="Drag to reorder">⣿</span>' : ''}
                <i class="fas fa-chevron-down chapter-chevron"></i>
                <span class="chapter-title" id="chapter-title-${chapterName.replace(/\s+/g, '-')}" style="font-weight:bold;">${chapterName}</span>
            </div>
            <span style="font-size:0.8rem; opacity:0.7; margin-right: 10px;">${chapterDoneCount}/${chapterTotal} Done</span>
        `;

        // Add Edit and Delete Buttons if Admin AND Edit Mode is active
        if (isAdmin && isEditMode) {
            const moduleSlug = chapterTopics.length > 0 && chapterTopics[0].module ? chapterTopics[0].module : '';
            const escapedChapterName = chapterName.replace(/'/g, "\\'");
            headerContent += `
                <button class="edit-chapter-btn" style="margin-left: 5px; padding: 4px 10px; font-size: 0.75rem; background: rgba(0,242,255,0.1); border: 1px solid var(--primary); border-radius: 4px; color: var(--primary); cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="event.stopPropagation(); editChapterName('${escapedChapterName}', '${moduleSlug}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-chapter-btn" style="margin-left: 5px;" onclick="event.stopPropagation(); deleteChapter('${escapedChapterName}', '${moduleSlug}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
        }

        header.innerHTML = headerContent;

        // Only set cursor:pointer - the actual click handler is defined later (around line 2423)
        header.style.cursor = 'pointer';

        // Body (Collapsible)
        const body = document.createElement('div');
        body.className = 'chapter-body';
        // Initial state: collapsed. If activeModule changed, maybe auto-expand if only one chapter?
        // User didn't ask for auto-expand. Default collapsed.

        // Render Topics inside Body
        chapterTopics.forEach(t => {
            // Find Original Index for editing
            const index = currentModalNode.topics.indexOf(t);
            const isChecked = done.includes(t.id);

            const div = document.createElement('div');
            div.className = `checklist-item`; // Keep class for possible styling
            div.className += ' roadmap-item'; // Add user requested class
            div.setAttribute('data-id', t.id); // For sorting
            div.setAttribute('data-index', index);
            if (t.module) div.dataset.module = t.module;

            // Item Styling
            div.style.cssText = 'display:flex; flex-direction:column; width:100%; border-bottom:1px solid rgba(255,255,255,0.05);';

            // --- Header Row ---
            // --- Header Row ---
            const headerRow = document.createElement('div');
            // Use .topic-item for strictly left-aligned styling as requested
            headerRow.className = 'topic-item';
            // REMOVED inline styles (display:flex, etc) to let CSS .topic-item take full control
            // Only keeping width:100% just in case, but CSS should handle padding/gap/alignment

            let adminControls = '';
            let dragHandle = '';
            if (isEditMode) {
                dragHandle = `<span class="topic-drag-handle" style="cursor:grab; font-size:1.2rem; color:var(--text-muted); margin-right:5px;">⣿</span>`;
                adminControls = `
                            <div style="margin-left:auto; display:flex; gap:10px;">
                                <span style="cursor:pointer;" title="Edit Title" onclick="enableInlineEdit(${index})">✏️</span>
                                <span style="color:red; cursor:pointer; font-weight:bold;" title="Delete Topic" onclick="deleteTopic(${index})">✕</span>
                            </div>
                        `;
            }

            // Inner Accordion Arrow (for details)
            const arrow = `<i id="arrow-${t.id}" class="fas fa-chevron-right topic-chevron" style="font-size:0.75rem; color:var(--primary); transition:transform 0.3s ease; cursor:pointer;" onclick="toggleAccordion('${t.id}')"></i>`;

            headerRow.innerHTML = `
                        ${dragHandle}
                        ${arrow}
                        <div class="topic-checkbox">
                             <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTopicDone('${t.id}')" style="transform:scale(1.2); cursor:pointer;">
                        </div>
                        <span id="topic-title-${index}" onclick="toggleAccordion('${t.id}')" style="flex:1; cursor:pointer; font-weight:600; display:flex; align-items:center; margin-left:10px; ${isChecked ? 'text-decoration:line-through; opacity:0.7;' : ''}">
                            ${t.title}
                        </span>
                        ${adminControls}
                    `;

            // --- Details Body (Inner) ---
            const detailsBody = document.createElement('div');
            detailsBody.id = `accordion-${t.id}`;
            detailsBody.style.display = 'none'; // Hidden by default
            detailsBody.style.padding = '12px 16px';
            detailsBody.style.borderLeft = '3px solid var(--primary)';
            detailsBody.style.marginLeft = '0';
            detailsBody.style.width = '100%';
            detailsBody.style.background = 'rgba(0, 242, 255, 0.02)';

            // 1. Proof of Work
            const proofKey = currentModalNode.id + '_' + t.id;
            const proofUrl = (userData.proofs && userData.proofs[proofKey]) || "";
            const proofIconClass = proofUrl ? 'has-proof' : '';
            const proofTooltip = proofUrl ? 'Edit Proof' : 'Add Proof of Work (GitHub/URL)';
            const externalLinkIcon = proofUrl
                ? `<a href="${ensureAbsoluteUrl(proofUrl)}" target="_blank" class="external-proof-link" title="Open Link: ${proofUrl}"><i class="fas fa-external-link-alt"></i></a>`
                : '';

            const checkDiv = document.createElement('div');
            checkDiv.style.cssText = 'font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;';
            checkDiv.innerHTML = `<span class="proof-link-btn ${proofIconClass}" onclick="openProofModal('${t.id}', '${proofUrl}')" title="${proofTooltip}" style="font-size:0.8rem;">${proofUrl ? 'Edit Proof 🔗' : 'Add Proof of Work (GitHub/URL) <i class="fab fa-github"></i>'}</span>${externalLinkIcon}`;

            // 2. Admin Links
            const linksDiv = document.createElement('div');
            linksDiv.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;';
            if (t.links && Array.isArray(t.links)) {
                t.links.forEach(link => {
                    const isRec = link.adminRecommended;
                    const btnStyle = isRec
                        ? 'border:1px solid var(--gold); background:rgba(255, 215, 0, 0.1); color:var(--gold);'
                        : 'border:1px solid var(--border); background:rgba(255,255,255,0.05); color:var(--text-muted);';
                    const icon = isRec ? '⭐' : '🔗';
                    linksDiv.innerHTML += `<a href="${ensureAbsoluteUrl(link.url)}" target="_blank" class="topic-link-btn" style="text-decoration:none; padding:5px 10px; border-radius:4px; font-size:0.75rem; display:flex; align-items:center; gap:5px; transition:all 0.2s; ${btnStyle}">${icon} ${link.title}</a>`;
                });
            }
            // 3. Resources Section
            const resDiv = document.createElement('div');
            const addResBtn = isEditMode ? `<span onclick="addTopicResource(${index})" style="cursor:pointer; font-size:0.8rem; color:var(--success); margin-left:10px;">(+) Add</span>` : '';
            resDiv.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">Recommended Resources:${addResBtn}</div>`;
            if (t.resources && t.resources.length > 0) {
                t.resources.forEach((r, resIdx) => {
                    const safeUrl = ensureAbsoluteUrl(r.url);
                    const iconHtml = getIconForUrl(r.url, r.type);
                    const deleteBtn = isEditMode ? `<span onclick="deleteTopicResource(${index}, ${resIdx})" style="color:red; cursor:pointer; font-size:0.75rem; margin-left:8px;">✕</span>` : '';
                    resDiv.innerHTML += `<div style="display:flex; align-items:center;"><a href="${safeUrl}" target="_blank" class="resource-link" style="font-size:0.85rem; padding:5px;">${iconHtml} ${r.title}</a>${deleteBtn}</div>`;
                });
            } else {
                resDiv.innerHTML += `<div style="font-size:0.8rem; font-style:italic; opacity:0.5;">No resources yet.</div>`;
            }

            // 4. User Links
            const userLinksDiv = document.createElement('div');
            const userLinksKey = `${currentModalNode.id}_${t.id}`;
            const userLinks = (userData.userLinks && userData.userLinks[userLinksKey]) || [];
            const addUserLinkBtn = `<span onclick="addUserLink(${index})" style="cursor:pointer; font-size:0.8rem; color:#8a2be2; margin-left:10px;">(+) Add Link</span>`;
            userLinksDiv.innerHTML = `<div style="font-size:0.8rem; color:#8a2be2; margin-bottom:5px; font-weight:600;">🔗 My Links:${addUserLinkBtn}</div>`;
            if (userLinks.length > 0) {
                userLinks.forEach((link, linkIdx) => {
                    const safeUrl = ensureAbsoluteUrl(link.url);
                    const deleteBtn = `<span class="user-link-delete" onclick="deleteUserLink(${index}, ${linkIdx})" title="Delete">✕</span>`;
                    const iconHtml = getIconForUrl(link.url, null);
                    userLinksDiv.innerHTML += `<div class="user-link-item"><a href="${safeUrl}" target="_blank" class="resource-link" style="font-size:0.85rem; padding:5px; flex:1;">${iconHtml} ${link.title}</a>${deleteBtn}</div>`;
                });
            } else {
                userLinksDiv.innerHTML += `<div style="font-size:0.8rem; font-style:italic; opacity:0.5;">No personal links yet.</div>`;
            }

            // 5. Notes
            const topicNotesKey = currentModalNode.id + '_' + t.id + '_notes';
            const topicNotes = userData.progress[topicNotesKey] || "";
            const noteDiv = document.createElement('div');
            noteDiv.innerHTML = `
             <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                 <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;"><i class="fa-regular fa-file-lines" style="margin-right:5px;"></i> My Notes</div>
                 <span onclick="toggleNoteEdit('${topicNotesKey}')" style="cursor:pointer; font-size:0.8rem; opacity:0.5;">✏️ Edit</span>
             </div>
             <div id="note-view-${topicNotesKey}" class="md-content" style="background:rgba(0,0,0,0.15); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); min-height:40px; cursor:pointer; font-size:0.9rem;" onclick="toggleNoteEdit('${topicNotesKey}')">
                 ${topicNotes ? marked.parse(topicNotes) : '<span style="font-style:italic; opacity:0.4;">Click to add notes...</span>'}
             </div>
             <textarea id="note-edit-${topicNotesKey}" class="dark-input md-edit-box" dir="auto" style="display:none; width:100%; min-height:120px; font-size:0.9rem; margin-top:0;" onblur="saveNoteAndRender('${topicNotesKey}')">${topicNotes}</textarea>
            `;

            detailsBody.appendChild(checkDiv);
            detailsBody.appendChild(linksDiv);
            detailsBody.appendChild(resDiv);
            detailsBody.appendChild(userLinksDiv);
            detailsBody.appendChild(noteDiv);

            div.appendChild(headerRow);
            div.appendChild(detailsBody);

            body.appendChild(div);
        });

        // Toggle Chapter Logic
        header.addEventListener('click', (e) => {
            // Prevent toggle if clicking delete or edit button or their children
            if (e.target.closest('.delete-chapter-btn') || e.target.closest('.edit-chapter-btn') || e.target.closest('.chapter-drag-handle')) return;

            const isExpanded = accordion.classList.contains('expanded');
            accordion.classList.toggle('expanded');
            const chevron = header.querySelector('.chapter-chevron');
            if (chevron) chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Set data attribute for chapter identification
        accordion.setAttribute('data-chapter', chapterName);
        accordion.setAttribute('data-module', chapterTopics[0]?.module || '');

        accordion.appendChild(header);
        accordion.appendChild(body);
        listDiv.appendChild(accordion);

        // Init Sortable for this body (Drag/Drop within chapter)
        if (isEditMode) {
            new Sortable(body, {
                animation: 150,
                handle: '.topic-drag-handle',
                ghostClass: 'sortable-ghost',
                group: 'chapters', // Allow moving between chapters
                onEnd: function (evt) {
                    saveTopicOrder(); // Re-saves the entire list based on DOM order.
                    // Note: Moving between chapters won't persist "Chapter" property change unless implemented.
                    // But visual order persists until reload.
                }
            });
        }
    });

    // Init Sortable for chapters container (Drag/Drop to reorder chapters) - Only in Admin Edit Mode
    if (isAdmin && isEditMode && listDiv) {
        new Sortable(listDiv, {
            animation: 200,
            handle: '.chapter-drag-handle',
            ghostClass: 'sortable-ghost-chapter',
            draggable: '.chapter-accordion',
            onEnd: function (evt) {
                saveChapterOrder(activeModule);
            }
        });
    }

    // Apply syntax highlighting
    document.querySelectorAll('.md-content').forEach(view => applySyntaxHighlighting(view));

    // Auto-select first module if none active and multi-module? Handled by default.
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

function applySyntaxHighlighting(containerElement) {
    if (!containerElement) return;
    containerElement.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

async function saveSpecificTopicNote(key, val) {
    const now = new Date().toISOString();
    userData.lastActive = now; // Update local state immediately

    if (!val || !val.trim()) {
        delete userData.progress[key];
        await db.collection('users').doc(auth.currentUser.uid).update({
            [`progress.${key}`]: firebase.firestore.FieldValue.delete(),
            lastActive: now
        });
    } else {
        userData.progress[key] = val;
        // Merge true is safer, but update is fine if document exists (which it should)
        await db.collection('users').doc(auth.currentUser.uid).set({
            ...userData,
            lastActive: now
        }, { merge: true });
    }
    calculateTotalLogs();
    calculateClusterHealth(); // Trigger health update
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

    // Auto-recalculate ALL users' progress
    await recalculateAllUsersProgressSilent();
}

async function deleteTopic(index) {
    if (!confirm("Delete this topic?")) return;
    currentModalNode.topics.splice(index, 1);
    renderChecklist();
    await saveNodeUpdate(currentModalNode);

    // Auto-recalculate ALL users' progress
    await recalculateAllUsersProgressSilent();
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
    // 🔥 CRITICAL FIX: Use set() with merge to save ALL data
    // This ensures topics, duration, order, and all other fields persist
    const nodeData = {
        id: node.id,
        title: node.title || '',
        slug: node.slug || '',
        topics: node.topics || [],
        duration: node.duration || '',
        order: typeof node.order === 'number' ? node.order : 999
    };

    // Add optional fields if they exist
    if (node.labs) nodeData.labs = node.labs;
    if (node.officialDocs) nodeData.officialDocs = node.officialDocs;
    if (node.freeCourses) nodeData.freeCourses = node.freeCourses;

    if (typeof node.id === 'string' && node.id.startsWith('p')) {
        await db.collection('global_parallel').doc(node.id).set(nodeData, { merge: true });
    } else {
        await db.collection('global_roadmap').doc(node.id.toString()).set(nodeData, { merge: true });
    }

    console.log('✅ Node saved to Firebase:', node.id);
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

    const now = new Date().toISOString();
    const newLog = { date: now, text: txt };

    if (!userData.logs[currentModalNode.id]) userData.logs[currentModalNode.id] = [];
    userData.logs[currentModalNode.id].push(newLog);
    userData.lastActive = now; // Update local state

    document.getElementById('diary-input').value = '';
    renderLogs();

    await db.collection('users').doc(currentUser.uid).update({
        [`logs.${currentModalNode.id}`]: userData.logs[currentModalNode.id],
        lastActive: now
    });
    calculateTotalLogs();
    calculateClusterHealth(); // Trigger health update
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
    calculateTotalLogs();
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

    // 1. Check userData.lastActive first (New Logic)
    let lastActivityTime = 0;

    if (userData.lastActive) {
        lastActivityTime = new Date(userData.lastActive).getTime();
    } else {
        // 2. Fallback: Check logs for recent entries (Backward Compatibility)
        Object.values(userData.logs || {}).forEach(logList => {
            logList.forEach(entry => {
                const time = new Date(entry.date).getTime();
                if (time > lastActivityTime) lastActivityTime = time;
            });
        });
    }

    // Threshold: 72 Hours
    const isHealthy = (Date.now() - lastActivityTime) < (72 * 60 * 60 * 1000);

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
    // Also use the description element to show breakdown if available, 
    // or set a title/tooltip on the count element.
    const container = countEl ? countEl.parentElement : null;

    if (!userData) return;

    let logsCount = 0;
    let notesCount = 0;
    let linksCount = 0;
    let latestTime = 0;

    // 1. Count Captain's Logs (Dated)
    if (userData.logs) {
        Object.values(userData.logs).forEach(logList => {
            if (Array.isArray(logList)) {
                logsCount += logList.length;
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
                    notesCount++;
                }
            }
        });
    }

    // 3. Count Personal Links (from userData.userLinks)
    if (userData.userLinks) {
        Object.values(userData.userLinks).forEach(linkList => {
            if (Array.isArray(linkList)) {
                linksCount += linkList.length;
            }
        });
    }

    const totalCount = logsCount + notesCount + linksCount;

    if (countEl) {
        countEl.innerText = totalCount;
        countEl.title = `Logs: ${logsCount}, Notes: ${notesCount}, Links: ${linksCount} (Click for details)`;
        countEl.style.cursor = "help";

        // Remove old listeners to avoid duplicates
        const newEl = countEl.cloneNode(true);
        countEl.parentNode.replaceChild(newEl, countEl);

        newEl.addEventListener('click', async () => {
            // 1. Build Valid Keys Map
            const validNoteKeys = new Set();
            const allNodes = [...(window.roadmapNodes || []), ...(window.parallelNodes || [])];
            allNodes.forEach(node => {
                if (node.topics) {
                    node.topics.forEach(t => {
                        validNoteKeys.add(`${node.id}_${t.id}_notes`);
                    });
                }
            });

            let msg = `🔍 Intel Breakdown:\n\n`;
            let orphanKeys = [];

            msg += `📝 Captain's Logs: ${logsCount}\n`;
            if (userData.logs) {
                Object.keys(userData.logs).forEach(k => {
                    const c = userData.logs[k].length;
                    if (c > 0) msg += `   - Node ${k}: ${c} logs\n`;
                });
            }

            msg += `\n🗒️ Topic Notes: ${notesCount}\n`;
            if (userData.progress) {
                Object.keys(userData.progress).forEach(k => {
                    if (k.endsWith('_notes')) {
                        const val = userData.progress[k];
                        if (typeof val === 'string' && val.trim() !== "") {
                            const isOrphan = !validNoteKeys.has(k);
                            msg += `   - ${k.replace('_notes', '').toUpperCase()}${isOrphan ? ' (ORPHAN - Will be cleaned)' : ''}\n`;
                            if (isOrphan) orphanKeys.push(k);
                        }
                    }
                });
            }

            msg += `\n🔗 Personal Links: ${linksCount}\n`;
            if (userData.userLinks) {
                Object.keys(userData.userLinks).forEach(k => {
                    const c = userData.userLinks[k].length;
                    if (c > 0) {
                        const noteKeyEquivalent = k + '_notes';
                        const isOrphan = !validNoteKeys.has(noteKeyEquivalent);
                        msg += `   - ${k}: ${c} links${isOrphan ? ' (ORPHAN - Will be cleaned)' : ''}\n`;
                        if (isOrphan) {
                            orphanKeys.push(`userLinks.${k}`);
                        }
                    }
                });
            }

            if (orphanKeys.length > 0) {
                msg += `\n⚠️ FOUND ${orphanKeys.length} GHOST ITEMS! Click OK to cleanup.`;
                if (confirm(msg)) {
                    // Cleanup
                    const updatePayload = {};
                    orphanKeys.forEach(k => {
                        if (k.startsWith('userLinks.')) {
                            const realKey = k.split('.')[1];
                            updatePayload[`userLinks.${realKey}`] = firebase.firestore.FieldValue.delete();
                            delete userData.userLinks[realKey];
                        } else {
                            delete userData.progress[k];
                            updatePayload[`progress.${k}`] = firebase.firestore.FieldValue.delete();
                        }
                    });

                    await db.collection('users').doc(currentUser.uid).update(updatePayload);
                    calculateTotalLogs();
                    alert("✅ Ghosts busted! Count updated.");
                }
            } else {
                alert(msg);
            }
        });
    }

    if (container) {
        // Optional: Update the description to show breakdown if the user prefers visibility
        // For now, simpler is better, let's stick to the tooltip on the number
    }

    if (footerEl) {
        footerEl.innerHTML = latestTime > 0
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

        // Send Welcome Message if chat is empty
        const chatBox = document.getElementById('chat-messages');
        if (chatBox && chatBox.children.length === 0) {
            sendWelcomeMessage();
        }

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

// Helper: Get Next Incomplete Topic
function getNextTopic() {
    // Loop through roadmap nodes to find the first incomplete topic
    for (const node of roadmapNodes) {
        const userProgress = userData.progress[node.id] || [];
        const nodeTopics = node.topics || [];

        for (const topic of nodeTopics) {
            if (!userProgress.includes(topic.id)) {
                return {
                    courseName: node.title,
                    topicTitle: topic.title,
                    topicId: topic.id
                };
            }
        }
    }

    // If all roadmap topics done, check parallel tracks
    for (const node of parallelNodes) {
        const userProgress = userData.progress[node.id] || [];
        const nodeTopics = node.topics || [];

        for (const topic of nodeTopics) {
            if (!userProgress.includes(topic.id)) {
                return {
                    courseName: node.title,
                    topicTitle: topic.title,
                    topicId: topic.id
                };
            }
        }
    }

    // All done!
    return null;
}

// Welcome Message
function sendWelcomeMessage() {
    const userName = (userData && userData.displayName) ? userData.displayName : "Engineer";

    // Calculate Progress
    let totalTopics = 0;
    let completedTopics = 0;

    roadmapNodes.forEach(node => {
        totalTopics += (node.topics || []).length;
        completedTopics += (userData.progress[node.id] || []).length;
    });

    parallelNodes.forEach(node => {
        totalTopics += (node.topics || []).length;
        completedTopics += (userData.progress[node.id] || []).length;
    });

    const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Get Next Topic
    const nextTopic = getNextTopic();

    let welcomeMsg = `ازيك يا **${userName}** 👋\n\n`;
    welcomeMsg += `أهلاً بيك في **Your DevOps Galaxy** 🌌\n\n`;
    welcomeMsg += `انت دلوقتي مخلص **${percent}%**`;

    if (nextTopic) {
        welcomeMsg += ` والنهاردة هنذاكر **${nextTopic.topicTitle}**\n\n`;
    } else {
        welcomeMsg += `\n\n🎉 **مبروك! خلصت كل التوبيكات!**\n\n`;
    }

    welcomeMsg += `أنا جاهز لكل أسئلتك يا هندسة 🚀`;

    renderMessage(welcomeMsg, 'bot');
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

// 1.5 Context Helper
function getUserContext() {
    try {
        const userName = (currentUser && currentUser.displayName) ? currentUser.displayName : "Engineer";

        // Calculate Progress
        let totalTopics = 0;
        let completedTopics = 0;

        // Main Roadmap
        roadmapNodes.forEach(node => {
            const nodeTopics = node.topics || [];
            totalTopics += nodeTopics.length;

            const userProgress = userData.progress[node.id] || [];
            completedTopics += userProgress.length;
        });

        // Parallel Tracks
        parallelNodes.forEach(node => {
            const nodeTopics = node.topics || [];
            totalTopics += nodeTopics.length;

            const userProgress = userData.progress[node.id] || [];
            completedTopics += userProgress.length;
        });

        const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        // Get Next Topic
        const nextTopic = getNextTopic();
        let nextTopicInfo = "";
        if (nextTopic) {
            nextTopicInfo = `NextTopic="${nextTopic.courseName} → ${nextTopic.topicTitle}", `;
        }

        // Collect User Notes (Last 5 most recent entries)
        let notesContext = "";
        const allLogs = [];

        // Gather all logs with timestamps
        Object.keys(userData.logs || {}).forEach(nodeId => {
            const logs = userData.logs[nodeId] || [];
            logs.forEach(log => {
                if (log.text && log.text.trim()) {
                    allLogs.push({
                        date: log.date,
                        text: log.text,
                        nodeId: nodeId
                    });
                }
            });
        });

        // Sort by date (newest first) - keeping them sorted but sending ALL
        allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // No longer slicing! Sending EVERYTHING.
        const allUserLogs = allLogs;

        if (allUserLogs.length > 0) {
            notesContext = "\nAll User Notes (Newest First):\n";
            allUserLogs.forEach((log, idx) => {
                notesContext += `${idx + 1}. [Date: ${log.date.split('T')[0]}] ${log.text}\n`;
            });
        }

        return `[SYSTEM CONTEXT: User="${userName}", GlobalProgress="${completedTopics}/${totalTopics} (${percent}%)", ${nextTopicInfo}${notesContext}The user is currently on the DevOps Galaxy Roadmap. Use this info to tailor your answer.]`;

    } catch (e) {
        console.warn("Context generation failed:", e);
        return "";
    }
}

// 2. API Call Function (Gemini 2.5 Flash)
async function callGeminiAPI(contextMsg) {
    // Point to Cloudflare Pages Function
    const API_URL = "/chat";

    // Clone history to avoid mutating the UI source
    // Inject context into the LAST message (User's message) as a hidden prefix
    const payloadHistory = JSON.parse(JSON.stringify(chatHistory));

    if (contextMsg && payloadHistory.length > 0) {
        const lastIdx = payloadHistory.length - 1;
        if (payloadHistory[lastIdx].role === 'user') {
            payloadHistory[lastIdx].parts[0].text = contextMsg + "\n\n" + payloadHistory[lastIdx].parts[0].text;
        }
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: payloadHistory })
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

    // Add to History (Clean version for UI/Memory)
    chatHistory.push({ role: "user", parts: [{ text: message }] });

    // Show Loading
    const loadingId = showLoadingIndicator();

    try {
        // Get Live Context
        const context = getUserContext();

        // Pass context to API call (it will be injected there)
        const reply = await callGeminiAPI(context);
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
    const durationPerTip = 0.2 * 60 * 60 * 1000;
    const tipIndex = Math.floor(now / durationPerTip) % devopsTipsList.length;

    tipElement.innerText = `"${devopsTipsList[tipIndex]}"`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateDevOpsTip();
    setInterval(updateDevOpsTip, 60000);
});