// =====================
// LIGHTWEIGHT CANVAS PATHS (RESPONSIVE DI HP)
// =====================
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const petals = [];
// Kalo dibuka di HP (layar < 768px), daunnya dikurangin biar ga nutupin layar
const isMobile = window.innerWidth <= 768;
const maxPetals = isMobile ? 6 : 15;

class Petal {
  constructor() {
    this.reset();
    this.y = Math.random() * -200;
  }
  reset() {
    this.x = Math.random() * (window.innerWidth || canvas.width);
    this.y = -30;
    this.size = Math.random() * 8 + 6;
    this.speed = Math.random() * 1.5 + 0.5;
    this.wind = Math.random() * 1.5 - 0.75;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.wobble = Math.random() * Math.PI * 2;
    const colors = ["rgba(255,255,255,", "rgba(186,230,253,"];
    this.colorBase = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.y += this.speed;
    this.x += this.wind + Math.sin(this.wobble) * 0.5;
    this.wobble += 0.02;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 30) this.reset();
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.size, this.size);
    ctx.fillStyle = this.colorBase + this.opacity + ")";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(1, 1, 1, 2, 0, 3);
    ctx.bezierCurveTo(-1, 2, -1, 1, 0, 0);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < maxPetals; i++) petals.push(new Petal());

function animatePetals() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  petals.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animatePetals);
}
animatePetals();

// =====================
// MUSIC (AUTO-PLAY TRICK)
// =====================
const audio = document.getElementById("bg-music");
const disc = document.getElementById("disc");
const playBtn = document.getElementById("play-btn");
let playing = false;

function playMusic() {
  if (!playing && audio) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playing = true;
          disc.classList.add("playing");
          playBtn.textContent = "⏸";
        })
        .catch((e) => console.log("Autoplay nunggu interaksi user..."));
    }
  }
}

function toggleMusic() {
  if (playing) {
    audio.pause();
    disc.classList.remove("playing");
    playBtn.textContent = "▶";
    playing = false;
  } else {
    playMusic();
  }
}

// Trik ngakalin blokiran awal
window.addEventListener("load", () => {
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        playing = true;
        disc.classList.add("playing");
        playBtn.textContent = "⏸";
      })
      .catch((error) => {
        // Pasang jebakan interaksi di seluruh layar
        const startOnInteraction = () => {
          playMusic();
          document.removeEventListener("click", startOnInteraction);
          document.removeEventListener("touchstart", startOnInteraction);
        };
        document.addEventListener("click", startOnInteraction, { once: true });
        document.addEventListener("touchstart", startOnInteraction, {
          once: true,
        });
      });
  }
});

// =====================
// GIFT OPEN
// =====================
let giftOpened = false;
function openGift() {
  if (giftOpened) return;
  giftOpened = true;

  // PAKSA LAGU MUTER PAS KADO DITAP BIAR TEMBUS BLOKIRAN HP
  playMusic();

  document.getElementById("gift-lid").classList.add("open");

  // Ngilangin tulisan "tap to open" pas diklik
  const hint = document.getElementById("click-hint-text");
  if (hint) {
    hint.style.opacity = "0";
    setTimeout(() => (hint.style.display = "none"), 500);
  }

  let burstCount = 0;
  const burstInterval = setInterval(() => {
    if (burstCount >= 12) {
      clearInterval(burstInterval);
      return;
    }
    const p = new Petal();
    p.x = window.innerWidth / 2 + (Math.random() - 0.5) * 80;
    p.y = window.innerHeight * 0.4;
    p.speed = Math.random() * 2 + 1.5;
    p.wind = (Math.random() - 0.5) * 4;
    petals.push(p);
    burstCount++;
  }, 50);

  setTimeout(() => {
    document.getElementById("hero-title").classList.add("visible");
    document.getElementById("hero-sub").classList.add("visible");
  }, 600);
}

// =====================
// GARDEN WISHES & OTHERS
// =====================
const wishes = [
  "☁️ Semoga hidupmu selalu dipenuhi dengan kebahagiaan yang tak pernah habis.",
  "🌟 Semoga setiap langkahmu diiringi dengan kesehatan dan keberkahan.",
  "✨ Semoga impian-impianmu yang indah itu satu per satu menjadi kenyataan.",
  "⭐ Semoga cinta yang kamu berikan kembali padamu berlipat ganda.",
  "🌙 Semoga kamu selalu dikelilingi oleh orang-orang yang mencintaimu tulus.",
  "☀️ Semoga hatimu selalu tenang dan penuh dengan rasa syukur.",
  "💫 Semoga rezekimu lapang dan jalanmu selalu terang.",
  "🕊️ Semoga hari ini dan seterusnya menjadi awal babak terindah dalam hidupmu.",
];

const flowerBtns = document.querySelectorAll(".flower-btn");
function showWish(index) {
  const wishEl = document.getElementById("flower-wish");
  wishEl.style.opacity = "0";
  flowerBtns.forEach((b) => b.classList.remove("bloomed"));
  flowerBtns[index].classList.add("bloomed");
  setTimeout(() => {
    wishEl.textContent = wishes[index];
    wishEl.style.opacity = "1";
  }, 200);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(
    ".reveal, .section-eyebrow, .letter-heading, .letter-body, .celebrate-heading, .garden-heading, .garden-sub, .flower-btn, .gallery-heading, .gallery-sub, .closing-quote, .closing-body, .hearts-row, .made-with, .next-page-cta",
  )
  .forEach((el) => observer.observe(el));

document.addEventListener("DOMContentLoaded", () => {
  const candleBtn = document.getElementById("candle-link");
  if (candleBtn) {
    candleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetUrl = e.currentTarget.href;
      if (playing && audio) {
        let step = 0;
        const fade = setInterval(() => {
          step++;
          audio.volume = Math.max(0, 1 - step / 20);
          if (step >= 20) {
            clearInterval(fade);
            audio.pause();
          }
        }, 30);
      }
      document.body.classList.add("fading-out");
      setTimeout(() => (window.location.href = targetUrl), 700);
    });
  }
});
