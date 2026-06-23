// =====================
// LIGHTWEIGHT CANVAS PATHS
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
const isMobile = window.innerWidth <= 768;
const maxPetals = isMobile ? 4 : 12; // Di hp lebih dikit lagi biar lega layarnya

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
    this.colorBase = "rgba(255,255,255,";
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
// MUSIC
// =====================
const audio = document.getElementById("bg-music");
const disc = document.getElementById("disc");
const playBtn = document.getElementById("play-btn");
let playing = false;

function toggleMusic() {
  if (playing) {
    audio.pause();
    disc.classList.remove("playing");
    playBtn.textContent = "▶";
  } else {
    audio.volume = 0.7;
    audio.play().catch((e) => console.log(e));
    disc.classList.add("playing");
    playBtn.textContent = "⏸";
  }
  playing = !playing;
}
window.addEventListener("load", () => setTimeout(() => toggleMusic(), 300));

// =====================
// HOLD TO BLOW
// =====================
const blowBtn = document.getElementById("blow-btn");
const blowProgress = document.getElementById("blow-progress");
const blowInner = document.getElementById("blow-inner");
const candles = document.querySelectorAll(".candle");
const wishResult = document.getElementById("wish-result");

let holdProgress = 0,
  holdInterval = null,
  candlesOut = false;

function startHold(e) {
  if (candlesOut) return;
  if (e) e.preventDefault();
  clearInterval(holdInterval);
  holdInterval = setInterval(() => {
    holdProgress += (30 / 1400) * 100;
    if (holdProgress >= 100) {
      holdProgress = 100;
      updateProgressUI();
      clearInterval(holdInterval);
      blowOutCandles();
      return;
    }
    updateProgressUI();
  }, 30);
}
function endHold() {
  if (candlesOut) return;
  clearInterval(holdInterval);
  const decay = setInterval(() => {
    holdProgress -= 4;
    if (holdProgress <= 0) {
      holdProgress = 0;
      clearInterval(decay);
    }
    updateProgressUI();
  }, 16);
}
function updateProgressUI() {
  blowProgress.style.setProperty("--p", holdProgress.toFixed(0));
}

function blowOutCandles() {
  candlesOut = true;
  blowInner.textContent = "✨";
  candles.forEach((c, i) =>
    setTimeout(() => c.classList.add("extinguished"), i * 120),
  );
  spawnSparkles();
  setTimeout(
    () => wishResult.classList.add("visible"),
    candles.length * 120 + 600,
  );
}

function spawnSparkles() {
  const rect = blowBtn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = window.innerHeight * 0.42;
  const emojis = ["✨", "☁️", "💫", "🤍"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = originX + (Math.random() - 0.5) * 160 + "px";
    s.style.top = originY + (Math.random() - 0.5) * 60 + "px";
    s.style.animationDelay = Math.random() * 0.3 + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
}

blowBtn.addEventListener("mousedown", startHold);
blowBtn.addEventListener("mouseup", endHold);
blowBtn.addEventListener("mouseleave", endHold);
blowBtn.addEventListener("touchstart", startHold, { passive: false });
blowBtn.addEventListener("touchend", endHold);
blowBtn.addEventListener("touchcancel", endHold);

// =====================
// NAVIGATE & CUSTOM MODAL PASSWORD
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const secretBtn = document.getElementById("secret-link");
  const modal = document.getElementById("pw-modal");
  const pwInput = document.getElementById("pw-input");
  const pwSubmit = document.getElementById("pw-submit");
  const pwCancel = document.getElementById("pw-cancel");
  const pwError = document.getElementById("pw-error");
  let targetHref = "";

  if (secretBtn && modal) {
    // 1. Pas tombol surat diklik, buka pop-up
    secretBtn.addEventListener("click", (e) => {
      e.preventDefault();
      targetHref = e.currentTarget.href; // Simpan link rahasianya
      modal.classList.add("active");
      pwInput.value = ""; // Kosongin input tiap dibuka
      pwError.textContent = "";
      setTimeout(() => pwInput.focus(), 100); // Otomatis fokus ke kotak ngetik
    });

    // 2. Fungsi buat ngecek password
    const checkPassword = () => {
      const pw = pwInput.value;

      // MINTA PASSWORD DI SINI (GANTI '1234' JADI PW YANG LU MAU)
      if (pw === "1234") {
        modal.classList.remove("active"); // Tutup pop-up
        document.body.classList.add("fading-out"); // Efek transisi
        setTimeout(() => (window.location.href = targetHref), 650); // Mulus pindah halaman
      } else {
        pwError.textContent = "Yah passwordnya salah! Coba lagi."; // Pesan error di dalem pop-up
        pwInput.value = "";
        pwInput.focus();
      }
    };

    // 3. Tombol Submit diklik
    pwSubmit.addEventListener("click", checkPassword);

    // 4. Biar bisa pencet tombol 'Enter' di keyboard buat lanjut
    pwInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") checkPassword();
    });

    // 5. Tombol Cancel diklik
    pwCancel.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }
});
