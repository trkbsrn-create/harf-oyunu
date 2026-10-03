// Oyun sesleri. Efektler tarayıcıda o anda üretilir (Web Audio). Sözler (harf, hece, kelime,
// hikâye) Azure'un yapay zekâ sesleriyle önceden seslendirildi: sesler/*.mp3, sesler/liste.js
// (araclar/seslendir.py). Dosyası olmayan sözü tarayıcının Türkçe sesi okur. Hiçbir şey kaydedilmez.

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
    this.dosyalariYukle();
  },

  // Seslendirilmiş sözleri arka planda indirip çözer (ilk dokunuştan sonra, bir kez)
  dosyalariYukle() {
    if (this.tamponlar || typeof SES_DOSYALARI === "undefined") return;
    this.tamponlar = {};
    for (const dosya of new Set(Object.values(SES_DOSYALARI))) this.tampon(dosya);
  },

  // Bir ses dosyasının çözülmüş hâli (Promise; bir kez indirilir)
  tampon(dosya) {
    this.tamponlar = this.tamponlar || {};
    if (!this.tamponlar[dosya]) {
      this.tamponlar[dosya] = fetch(`sesler/${dosya}.mp3`)
        .then((c) => { if (!c.ok) throw new Error(dosya); return c.arrayBuffer(); })
        .then((veri) => this.baglam.decodeAudioData(veri));
      this.tamponlar[dosya].catch(() => { delete this.tamponlar[dosya]; });
    }
    return this.tamponlar[dosya];
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

  // Balon patlarken: kısa, tok bir "pat" ve ince bir çınlama
  pat() {
    this.nota(180, 0, 0.06, 0.25, "square");
    this.nota(1400, 0.02, 0.12, 0.08, "sine");
  },

  // Mini oyunda yanlış seçim: yumuşak, inen iki nota (korkutmasın)
  yanlis() {
    this.nota(330, 0, 0.14, 0.12, "triangle");
    this.nota(247, 0.1, 0.22, 0.12, "triangle");
  },

  // Bir harfi, heceyi, kelimeyi ya da sözü sesli söyler: seslendirilmiş dosyası varsa onu çalar,
  // yoksa tarayıcının Türkçe sesi okur. Türkçe ses yoksa ya da tarayıcı desteklemiyorsa sessiz kalır.
  // bitince: söyleme bitince bir kez çağrılır (ses hiç çıkmasa bile, tahmini süre sonunda).
  //
  // Telefon (Android Chrome) için önlemler: ses motoru ilk dokunuşta ısıtılır (yoksa ilk söz
  // geç gelir); önceki söz susturulduktan hemen sonra yenisi verilmez, kısa bir ara verilir
  // (yoksa yeni söz kesilir ya da hiç çıkmaz); söz nesnesi saklanır (yoksa tarayıcı onu
  // silebilir, söz yarıda kalır). Güvence süresi, ses gerçekten başladığında yeniden
  // kurulur: yavaş telefonda ses geç başlasa da sonraki adım onu kesmez.
  soyle(metin, bitince) {
    const dosya = typeof SES_DOSYALARI !== "undefined" && SES_DOSYALARI[metin];
    if (dosya && this.baglam) this.dosyaCal(dosya, metin, bitince);
    else this.tarayiciylaSoyle(metin, bitince);
  },

  // Seslendirilmiş sözü çalar; dosya gelmezse ya da ses kapalıysa tarayıcının sesine döner.
  dosyaCal(dosya, metin, bitince) {
    this.sustur();
    const no = this.sozNo;
    let cagrildi = false;
    const bitti = () => {
      if (cagrildi || !bitince) return;
      cagrildi = true;
      bitince();
    };
    let guvence = setTimeout(bitti, 8000); // dosya hiç gelmezse
    this.tampon(dosya).then((tampon) => {
      if (no !== this.sozNo) { clearTimeout(guvence); bitti(); return; } // bu arada yeni söz geldi
      if (this.baglam.state !== "running") throw new Error("ses kapalı");
      const kaynak = this.baglam.createBufferSource();
      kaynak.buffer = tampon;
      kaynak.connect(this.baglam.destination);
      kaynak.onended = () => {
        if (this.calan === kaynak) this.calan = null;
        clearTimeout(guvence);
        bitti();
      };
      this.calan = kaynak;
      kaynak.start();
      clearTimeout(guvence);
      guvence = setTimeout(bitti, tampon.duration * 1000 + 1500);
    }).catch(() => {
      clearTimeout(guvence);
      if (no === this.sozNo) this.tarayiciylaSoyle(metin, bitince);
      else bitti();
    });
  },

  // Tarayıcının Türkçe sesiyle söyler (seslendirilmiş dosyası olmayan sözler için)
  tarayiciylaSoyle(metin, bitince) {
    if (this.calan) {
      const calan = this.calan;
      this.calan = null;
      try { calan.stop(); } catch (e) { /* zaten bitmiş */ }
    }
    let cagrildi = false;
    const bitti = () => {
      if (cagrildi || !bitince) return;
      cagrildi = true;
      bitince();
    };
    const tahmin = Math.max(800, metin.length * 110);
    let guvence = setTimeout(bitti, tahmin + 3500);
    if (!("speechSynthesis" in window)) return;
    const konusma = window.speechSynthesis;
    const soz = new SpeechSynthesisUtterance(metin);
    this.sonSoz = soz;
    soz.lang = "tr-TR";
    soz.rate = 0.9; // doğal seslerde fazla yavaşlatmak robotik duyuluyor
    const turkce = this.turkceSes();
    if (turkce) soz.voice = turkce;
    soz.onstart = () => {
      clearTimeout(guvence);
      guvence = setTimeout(bitti, tahmin * 1.5 + 1500);
    };
    soz.onend = () => {
      clearTimeout(guvence);
      bitti();
    };
    const no = (this.sozNo = (this.sozNo || 0) + 1);
    const soylet = () => {
      if (no !== this.sozNo) return; // bu arada daha yeni bir söz geldi
      konusma.resume();
      konusma.speak(soz);
    };
    if (konusma.speaking || konusma.pending) {
      konusma.cancel();
      setTimeout(soylet, 120);
    } else {
      soylet();
    }
  },

  // Söyleneni keser (sıradaki söz de söylenmez)
  sustur() {
    this.sozNo = (this.sozNo || 0) + 1;
    if (this.calan) {
      const calan = this.calan;
      this.calan = null;
      try { calan.stop(); } catch (e) { /* zaten bitmiş */ }
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  },

  // Tarayıcının Türkçe sesi (sesler listesi telefonda geç gelir; gelince saklanır)
  turkceSes() {
    if (!("speechSynthesis" in window)) return null;
    if (!this.sesDinleniyor) {
      this.sesDinleniyor = true;
      window.speechSynthesis.addEventListener?.("voiceschanged", () => { this.turkce = undefined; });
    }
    if (!this.turkce) {
      // En doğal Türkçe ses seçilir: önce yapay zekâ ile üretilen "doğal" sesler (Edge'de
      // "Microsoft Emel Online (Natural)" gibi), sonra Google'ın sesi, sonra cihazın herhangi bir
      // Türkçe sesi. Aynı türde kadın sesi (Emel, Seda, Yelda...) önce gelir.
      const turkceler = window.speechSynthesis.getVoices()
        .filter((v) => v.lang && v.lang.replace("_", "-").toLowerCase().startsWith("tr"));
      const puan = (v) => {
        const ad = v.name.toLowerCase();
        let p = 0;
        if (ad.includes("natural") || ad.includes("neural") || ad.includes("doğal")) p += 100;
        if (ad.includes("online")) p += 40;
        if (ad.includes("google")) p += 30;
        if (["emel", "seda", "yelda", "filiz"].some((k) => ad.includes(k))) p += 5;
        return p;
      };
      this.turkce = turkceler.sort((a, b) => puan(b) - puan(a))[0];
    }
    return this.turkce || null;
  },

  // İlk dokunuşta ses motorunu ısıtır: duyulmayan kısa bir söz (telefonda ilk söz geç gelmesin)
  konusmayiIsit() {
    if (this.isindi || !("speechSynthesis" in window)) return;
    this.isindi = true;
    this.turkceSes();
    const soz = new SpeechSynthesisUtterance(" ");
    soz.volume = 0;
    soz.lang = "tr-TR";
    this.isitmaSozu = soz;
    window.speechSynthesis.speak(soz);
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

// Telefonda tarayıcı sesi yalnızca parmak ekrandan kalkınca açmaya izin verir (parmak
// değdiği an yetmez). Bu yüzden ses ve sesli okuma her dokunuşun sonunda açılır; böylece
// mikrofon izni beklenmeden ilk dokunuştan itibaren sesler gelir.
for (const olay of ["pointerup", "touchend", "click", "keydown"]) {
  document.addEventListener(olay, () => {
    Sesler.ac();
    Sesler.konusmayiIsit();
  }, { capture: true, passive: true });
}
