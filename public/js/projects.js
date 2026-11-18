const domainSearch = document.getElementById('domainSearch');
const searchBtn = document.getElementById('searchBtn');
const domainChips = document.getElementById('domainChips');
const projectList = document.getElementById('projectList');
const resultsTitle = document.getElementById('resultsTitle');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeText = document.getElementById('welcomeText');
const previewUrl = document.getElementById('previewUrl');
const previewContent = document.getElementById('previewContent');
const demoModal = document.getElementById('demoModal');
const demoModalTitle = document.getElementById('demoModalTitle');
const demoModalClose = document.getElementById('demoModalClose');
const demoBootup = document.getElementById('demoBootup');
const bootText = document.getElementById('bootText');
const bootBarFill = document.getElementById('bootBarFill');
const demoIframe = document.getElementById('demoIframe');

let selectedProject = null;
let activeChip = 'all';

// ---- SESSION CHECK ----
async function checkSession() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  if (!data.loggedIn) {
    window.location.href = 'login.html';
  } else {
    welcomeText.textContent = `Hi, ${data.user.name}`;
  }
}
checkSession();

// ---- DOMAIN CHIPS (covers ALL domains) ----
const DOMAIN_LABELS = [
  { key: 'all', label: 'All Domains' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'education', label: 'Education' },
  { key: 'food delivery', label: 'Food Delivery' },
  { key: 'social media', label: 'Social Media' },
  { key: 'finance', label: 'Finance' },
  { key: 'travel', label: 'Travel' },
  { key: 'real estate', label: 'Real Estate' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'entertainment', label: 'Entertainment' }
];

function renderChips() {
  domainChips.innerHTML = '';
  DOMAIN_LABELS.forEach(d => {
    const chip = document.createElement('div');
    chip.className = 'domain-chip' + (d.key === activeChip ? ' active' : '');
    chip.textContent = d.label;
    chip.addEventListener('click', () => {
      activeChip = d.key;
      domainSearch.value = '';
      renderChips();
      applyFilter();
    });
    domainChips.appendChild(chip);
  });
}
renderChips();

// ---- RENDER PROJECT CARDS ----
function renderProjects(list) {
  projectList.innerHTML = '';

  if (list.length === 0) {
    projectList.innerHTML = '<div class="empty-state">No projects found. Try another domain or clear the search.</div>';
    return;
  }

  list.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.dataset.id = proj.id;
    card.innerHTML = `
      <h3>${proj.name}</h3>
      <p>${proj.description}</p>
      <div class="tag-row">
        ${proj.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        <span class="tag live-tag">🟢 Live Demo</span>
      </div>
    `;
    card.addEventListener('click', () => selectProject(proj, card));
    projectList.appendChild(card);
  });
}

// ---- FILTER LOGIC (search box + chips together) ----
function applyFilter() {
  const query = domainSearch.value.trim().toLowerCase();

  let list = PROJECT_DATA;

  if (activeChip !== 'all') {
    list = list.filter(p => p.domain.includes(activeChip));
  }

  if (query) {
    list = list.filter(p =>
      p.domain.some(d => d.includes(query) || query.includes(d)) ||
      p.name.toLowerCase().includes(query)
    );
    resultsTitle.textContent = list.length
      ? `Results for "${domainSearch.value.trim()}"`
      : `No matches for "${domainSearch.value.trim()}"`;
  } else {
    const label = DOMAIN_LABELS.find(d => d.key === activeChip);
    resultsTitle.textContent = activeChip === 'all' ? 'All Projects' : label.label + ' Projects';
  }

  renderProjects(list);
}

// Show ALL projects by default (every domain)
renderProjects(PROJECT_DATA);

searchBtn.addEventListener('click', applyFilter);
domainSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyFilter();
});
domainSearch.addEventListener('input', () => {
  if (domainSearch.value.trim() === '') applyFilter();
});

// ---- LIVE PREVIEW RENDERING ----
const PREVIEW_COLORS = [
  ['#6a8bff', '#2575fc'],
  ['#ff6a8b', '#ff2575'],
  ['#22d3a8', '#16a085'],
  ['#ffb347', '#fc8a25'],
  ['#a06aff', '#7525fc'],
  ['#22b8ff', '#258bfc'],
  ['#ff8a65', '#ff5e3a'],
  ['#f06595', '#d6336c']
];

function colorForProject(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PREVIEW_COLORS[Math.abs(hash) % PREVIEW_COLORS.length];
}

function renderLivePreview(proj) {
  const slug = proj.name.toLowerCase().replace(/\s+/g, '-');
  previewUrl.textContent = `${slug}.researchconnect.live`;

  const [c1, c2] = (window.demoPaletteOf ? demoPaletteOf(proj) : colorForProject(proj.id));

  previewContent.innerHTML = `
    <div class="preview-app" style="background:linear-gradient(135deg, ${c1}22, ${c2}22); border-radius:8px; padding:12px;">
      <div class="pv-title">🚀 ${proj.name}
        <span class="live-status"><span class="live-dot"></span>LIVE</span>
      </div>
      <div class="pv-bar" style="width:80%; background:${c1}55;"></div>
      <div class="pv-bar" style="width:55%; background:${c2}55;"></div>
      <div class="pv-row">
        <div class="pv-box" style="background:linear-gradient(135deg, ${c1}, ${c2});"></div>
        <div class="pv-box" style="background:${c1}33;"></div>
        <div class="pv-box" style="background:${c2}33;"></div>
      </div>
      <button class="launch-demo-btn" id="launchDemoBtn">▶ Launch Live Demo</button>
    </div>
  `;

  document.getElementById('launchDemoBtn').addEventListener('click', () => openDemoModal(proj));
}

// ---- PROJECT SELECTION ----
// Note: we no longer auto-dump the tech stack into chat on select.
// The assistant only answers frontend/backend/etc when the user actually asks.
function selectProject(proj, cardEl) {
  selectedProject = proj;

  document.querySelectorAll('.project-card').forEach(c => c.classList.remove('active'));
  cardEl.classList.add('active');

  renderLivePreview(proj);

  chatBox.innerHTML = '';
  addBubble(`You selected "${proj.name}" 🎉 Ask me anything about it — frontend, backend, database, platform, or just say "suggest" for a recommendation.`, 'system');
}

// ---- CHAT LOGIC (fixed info responses, no external API) ----
function addBubble(text, type) {
  const div = document.createElement('div');
  div.className = `bubble ${type}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function generateReply(question) {
  if (!selectedProject) {
    return 'Please select a project from the list on the left first, so I know what you\'re asking about!';
  }

  const q = question.toLowerCase();
  const p = selectedProject;

  if (q.includes('frontend') || q.includes('front-end') || q.includes('front end')) {
    return `For ${p.name}, the recommended frontend is: ${p.frontend}.`;
  }
  if (q.includes('backend') || q.includes('back-end') || q.includes('back end') || q.includes('server')) {
    return `For ${p.name}, the recommended backend is: ${p.backend}.`;
  }
  if (q.includes('database') || q.includes('db')) {
    return `${p.name} typically uses: ${p.database}.`;
  }
  if (q.includes('platform') || q.includes('host') || q.includes('deploy')) {
    return `For deploying ${p.name}, a good platform choice is: ${p.platform}.`;
  }
  if (q.includes('tech stack') || q.includes('stack') || q.includes('all') || q.includes('everything')) {
    return `Full stack for ${p.name}:\n\n🎨 Frontend: ${p.frontend}\n⚙️ Backend: ${p.backend}\n🗄️ Database: ${p.database}\n☁️ Platform: ${p.platform}`;
  }
  if (q.includes('suggest') || q.includes('recommend') || q.includes('idea') || q.includes('what should')) {
    return `Based on ${p.name}, I'd suggest starting with ${p.frontend} for the UI since it pairs well with ${p.backend}. Use ${p.database} for storage, and deploy on ${p.platform} for an easy free-tier setup.`;
  }
  if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
    return `Hello! Ask me about ${p.name}'s frontend, backend, database, or hosting platform — or just say "suggest" for a recommendation.`;
  }

  return `I can help with ${p.name}'s tech stack. Try asking about its "frontend", "backend", "database", "platform", or say "suggest" for a recommendation.`;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addBubble(text, 'user');
  chatInput.value = '';

  setTimeout(() => {
    const reply = generateReply(text);
    addBubble(reply, 'bot');
  }, 350);
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// ---- LIVE DEMO MODAL: real working mini-apps (built by demos.js) ----
const demoModalBox = document.getElementById('demoModalBox');
const demoFullBtn = document.getElementById('demoFullBtn');
const bootLog = document.getElementById('bootLog');
let bootTimers = [];

function clearBootTimers() {
  bootTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
  bootTimers = [];
}

function openDemoModal(proj) {
  clearBootTimers();
  demoModalTitle.textContent = `${proj.name} — Live Demo`;
  demoModal.classList.add('open');
  demoBootup.classList.remove('hide');
  demoIframe.onload = null;
  demoIframe.srcdoc = '';
  bootBarFill.style.width = '0%';
  bootLog.innerHTML = '';

  const steps = [
    ['Connecting to server...', 'ok'],
    ['Pulling latest build...', 'ok'],
    ['Installing dependencies...', 'ok'],
    ['Starting ' + proj.name + '...', 'ok'],
    ['Server is running 🚀', 'run']
  ];

  steps.forEach((s, i) => {
    bootTimers.push(setTimeout(() => {
      bootText.textContent = s[0];
      bootBarFill.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
      const line = document.createElement('div');
      line.className = 'boot-line ' + s[1];
      line.textContent = (s[1] === 'run' ? '● ' : '✓ ') + s[0];
      bootLog.appendChild(line);
    }, i * 420));
  });

  // The iframe is always rendered (under the boot overlay), so it lays out reliably.
  bootTimers.push(setTimeout(() => {
    const reveal = () => { demoIframe.onload = null; demoBootup.classList.add('hide'); };
    demoIframe.onload = reveal;
    demoIframe.srcdoc = buildDemoHTML(proj);
    bootTimers.push(setTimeout(reveal, 2500)); // safety net
  }, steps.length * 420 + 250));
}

function closeDemoModal() {
  clearBootTimers();
  demoModal.classList.remove('open');
  demoModalBox.classList.remove('full');
  demoFullBtn.textContent = '⛶';
  demoIframe.onload = null;
  demoIframe.srcdoc = '';
  demoBootup.classList.remove('hide');
}

demoFullBtn.addEventListener('click', () => {
  const full = demoModalBox.classList.toggle('full');
  demoFullBtn.textContent = full ? '🗗' : '⛶';
});
demoModalClose.addEventListener('click', closeDemoModal);
demoModal.addEventListener('click', (e) => { if (e.target === demoModal) closeDemoModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && demoModal.classList.contains('open')) closeDemoModal(); });

// ---- LOGOUT ----
logoutBtn.addEventListener('click', async () => {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  const data = await res.json();
  window.location.href = data.redirect;
});
