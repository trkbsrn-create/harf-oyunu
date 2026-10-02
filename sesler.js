// Oyun sesleri. Ses dosyası yok: bütün sesler tarayıcıda o anda üretilir.
// (Telif sorunu yok, hiçbir şey kaydedilmez.)

const Sesler = {
  baglam: null,

  // Tarayıcılar sesi ancak ilk dokunuş / tuş basışından sonra açar.
  ac() {
    if (!this.baglam) {
      const Baglam = window.AudioContext || window.webkitAudioContext;
      if (!Baglam) return;
      this.baglam = new Baglam();
    }
    if (this.baglam.state === "suspended") this.baglam.resume();
  },

  // Tek bir nota çalar.
  nota(frekans, baslangic, sure, ses = 0.2, tur = "triangle") {
    const b = this.baglam;
    if (!b || b.state !== "running") return;
    const t = b.currentTime + baslangic;
    const osc = b.createOscillator();
    const kazanc = b.createGain();
    osc.type = tur;
    osc.frequency.setValueAtTime(frekans, t);
    kazanc.gain.setValueAtTime(0.0001, t);
    kazanc.gain.exponentialRampToValueAtTime(ses, t + 0.01);
    kazanc.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    osc.connect(kazanc).connect(b.destination);
    osc.start(t);
    osc.stop(t + sure + 0.02);
  },

  // Yumuşak bir ayak sesi ("tıp"). Sırayla iki farklı ton.
  adim(tek) {
    const b = this.baglam;
    if (!b || b.state !== "running") return;
    const t = b.currentTime;
    const osc = b.createOscillator();
    const kazanc = b.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(tek ? 190 : 160, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
    kazanc.gain.setValueAtTime(0.0001, t);
    kazanc.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
    kazanc.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(kazanc).connect(b.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  },

  // Hazine sensörü: yakınlık 0..1 arttıkça ses incelir.
  bip(yakinlik) {
    this.nota(480 + yakinlik * 900, 0, 0.08, 0.06 + yakinlik * 0.06, "sine");
  },

  // Tohum çantaya girerken: hafif bir "pıt" ve iki parlak nota.
  tohum() {
    this.nota(392, 0, 0.12, 0.15, "triangle");
    this.nota(988, 0.08, 0.2, 0.1, "sine");
    this.nota(1319, 0.16, 0.3, 0.1, "sine");
  },

  // Su damlası şişeye girerken: yukarı kayan yumuşak bir "blup".
  damla() {
    const b = this.baglam;
    if (!b || b.state !== "running") return;
    const t = b.currentTime;
    const osc = b.createOscillator();
    const kazanc = b.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(1300, t + 0.12);
    kazanc.gain.setValueAtTime(0.0001, t);
    kazanc.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    kazanc.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(kazanc).connect(b.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  },

  // Bitki büyürken: yükselen, sevinçli dört nota ve parıltı.
  buyume() {
    [523, 659, 784, 1047].forEach((f, i) => this.nota(f, i * 0.07, 0.25, 0.14, "triangle"));
    this.nota(1568, 0.3, 0.4, 0.08, "sine");
  },

  // Çanta açılıp kapanırken: kısa, yumuşak iki nota.
  canta(acik) {
    this.nota(acik ? 330 : 392, 0, 0.1, 0.12, "triangle");
    this.nota(acik ? 440 : 294, 0.07, 0.14, 0.12, "triangle");
  },

  // Dinleme başlarken: "şimdi söyle" anlamında kısa, yumuşak bir çan.
  dinle() {
    this.nota(880, 0, 0.18, 0.08, "sine");
  },

  // Harf doğru söylenince: sevinçli kısa melodi.
  dogru() {
    [659, 784, 988, 1319].forEach((f, i) => this.nota(f, i * 0.08, 0.22, 0.16));
  },

  // Sandık göründüğünde: kısa bir "pling".
  pling() {
    this.nota(1318, 0, 0.25, 0.12, "sine");
    this.nota(1760, 0.08, 0.35, 0.1, "sine");
  },

  // Sandık açılırken: neşeli "ta-daa" ve parıltılar.
  hazine() {
    const melodi = [523, 659, 784, 1047];
    melodi.forEach((f, i) => this.nota(f, i * 0.11, 0.3, 0.2));
    this.nota(1047, 0.48, 0.9, 0.22);
    this.nota(1319, 0.48, 0.9, 0.14);
    this.nota(1568, 0.48, 0.9, 0.12);
    for (let i = 0; i < 8; i++) {
      this.nota(2000 + i * 180, 0.6 + i * 0.06, 0.15, 0.05, "sine");
    }
  },
};
