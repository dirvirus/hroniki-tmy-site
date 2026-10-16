// ============================================
//   ХРОНИКИ ТЬМЫ — анимация сайта
// ============================================

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const stars = [];
const particles = [];

for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
    });
}

for (let i = 0; i < 40; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ?
            'rgba(170,110,220,0.5)' :
            'rgba(110,220,230,0.5)',
    });
}

function animate() {
    ctx.fillStyle = 'rgba(10,8,16,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Звёзды
    stars.forEach(s => {
        s.a += s.speed;
        const alpha = 0.3 + Math.abs(Math.sin(s.a)) * 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,210,90,${alpha})`;
        ctx.fill();
    });

    // Частицы
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    });

    requestAnimationFrame(animate);
}
animate();

// ============================================
//   Форма обратной связи
// ============================================

const form = document.getElementById('feedback-form');
const status = document.getElementById('form-status');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: form.name.value,
            email: form.email.value,
            message: form.message.value,
        };
        status.textContent = 'Отправка...';
        status.className = 'form-status';

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json.ok) {
                status.textContent = '✓ Сообщение отправлено!';
                status.className = 'form-status success';
                form.reset();
            } else {
                status.textContent = '✗ ' +
                    (json.error || 'Ошибка');
                status.className = 'form-status error';
            }
        } catch (err) {
            status.textContent = '✗ Ошибка соединения';
            status.className = 'form-status error';
        }
    });
}