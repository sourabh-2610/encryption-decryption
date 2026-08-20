// ══════════════════════════════════════════════
//  Interactive Particle Network Background
// ══════════════════════════════════════════════
(function () {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles, mouse;

    mouse = { x: null, y: null, radius: 150 };

    // Track mouse for interactivity
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            // Gentle drift
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction — particles push away
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += dx * force * 0.03;
                    this.y += dy * force * 0.03;
                }
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        const count = Math.min(Math.floor((width * height) / 8000), 150);
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animate);
    }

    init();
    window.addEventListener('resize', init);
    animate();
})();


// ══════════════════════════════════════════════
//  Scroll Reveal
// ══════════════════════════════════════════════
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .footer-text').forEach(el => obs.observe(el));


// ══════════════════════════════════════════════
//  Smooth Scroll
// ══════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
});


// ══════════════════════════════════════════════
//  Mini Demo Toggle (Concept Cards)
// ══════════════════════════════════════════════
function toggleDemo(id, card) {
    const demo = document.getElementById(id);
    const open = demo.classList.contains('open');
    document.querySelectorAll('.mini-demo').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.card-cta').forEach(c => c.textContent = 'Click to try it live →');
    if (!open) {
        demo.classList.add('open');
        card.querySelector('.card-cta').textContent = 'Click to close ✕';
        setTimeout(() => demo.querySelector('.mini-input')?.focus(), 300);
    }
}


// ══════════════════════════════════════════════
//  Mini Encrypt / Decrypt (Caesar Shift)
// ══════════════════════════════════════════════
const SHIFT = 7;

document.getElementById('miniEncIn').addEventListener('input', function () {
    const out = document.getElementById('miniEncOut');
    if (!this.value) { out.innerHTML = '<span style="color:var(--text-muted);font-family:Inter">Encrypted text appears here...</span>'; return; }
    out.textContent = this.value.split('').map(c => {
        if (/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 97 + SHIFT) % 26) + 97);
        if (/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 65 + SHIFT) % 26) + 65);
        return c;
    }).join('');
});

document.getElementById('miniDecIn').addEventListener('input', function () {
    const out = document.getElementById('miniDecOut');
    if (!this.value) { out.innerHTML = '<span style="color:var(--text-muted);font-family:Inter">Decrypted text appears here...</span>'; return; }
    out.textContent = this.value.split('').map(c => {
        if (/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 97 - SHIFT + 26) % 26) + 97);
        if (/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 65 - SHIFT + 26) % 26) + 65);
        return c;
    }).join('');
});


// ══════════════════════════════════════════════
//  AES-256-GCM Live Demo
// ══════════════════════════════════════════════
let mode = 'encrypt';

function setMode(m) {
    mode = m;
    document.getElementById('modeEnc').className = 'mode-btn' + (m === 'encrypt' ? ' active' : '');
    document.getElementById('modeDec').className = 'mode-btn' + (m === 'decrypt' ? ' active' : '');
    document.getElementById('actBtn').innerHTML = m === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt';
    document.getElementById('msgLabel').textContent = m === 'encrypt' ? 'Your Secret Message' : 'Encrypted Text';
    document.getElementById('demoIn').placeholder = m === 'encrypt' ? 'Type your secret message...' : 'Paste encrypted text here...';
}

async function deriveKey(pw, salt) {
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        km,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function demoAction() {
    const text = document.getElementById('demoIn').value;
    const pw = document.getElementById('demoKey').value;
    const out = document.getElementById('demoOut');

    if (!text || !pw) {
        out.innerHTML = '<span class="output-tag">Error</span><span style="color:#ef4444">Enter both message and key.</span>';
        return;
    }

    if (mode === 'encrypt') {
        try {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await deriveKey(pw, salt);
            const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
            const buf = new Uint8Array(28 + new Uint8Array(enc).length);
            buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(enc), 28);
            out.innerHTML = '<span class="output-tag">Encrypted</span>' + btoa(String.fromCharCode(...buf));
        } catch (e) {
            out.innerHTML = '<span class="output-tag">Error</span><span style="color:#ef4444">' + e.message + '</span>';
        }
    } else {
        try {
            const buf = new Uint8Array(atob(text).split('').map(c => c.charCodeAt(0)));
            const key = await deriveKey(pw, buf.slice(0, 16));
            const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(16, 28) }, key, buf.slice(28));
            out.innerHTML = '<span class="output-tag">Decrypted</span><span style="color:var(--green)">' + new TextDecoder().decode(dec) + '</span>';
        } catch (e) {
            out.innerHTML = '<span class="output-tag">Error</span><span style="color:#ef4444">Wrong key or corrupted data.</span>';
        }
    }
}

function demoClear() {
    document.getElementById('demoIn').value = '';
    document.getElementById('demoKey').value = '';
    document.getElementById('demoOut').innerHTML = '<span class="output-tag">Output</span><span style="color:var(--text-muted)">Result appears here...</span>';
}

function copyOut() {
    const el = document.getElementById('demoOut');
    const tag = el.querySelector('.output-tag');
    let t = el.textContent;
    if (tag) t = t.replace(tag.textContent, '').trim();
    navigator.clipboard.writeText(t).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}
