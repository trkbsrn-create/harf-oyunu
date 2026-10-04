// Mini oyun: Kazma (tünel kaz)
// Yer altı bir toprak ızgarası. Karakter en üstten başlar. Çocuk ekranda bir yere dokunur (ya
// da parmağını basılı tutar); karakter o yöne kare kare toprağı kazarak ilerler. Toprağın içinde
// harfli taşlar (hazineler) var: istenen harfin taşları toplanır, yanlış harfli taş bir can
// götürür. Kayalar kazılamaz, etrafından dolaşılır.
// Seviyeler: 1: 6 hazine, az yanlış taş (harf topla).
// Öğretmenin isteği (hece): 2. seviye "harflerle hece yaz": hece söylenir (yazılmaz), üstte hece kadar
// boş yer; hecenin harfleri sırayla kazılıp toplanır, 4 hece. 3. seviye "hecelerle kelime yaz":
// kelime söylenir, taşlarda heceler; kelimenin heceleri sırayla toplanır, 3 kelime. Sırası gelmemiş
// doğru parça yalnızca sallanır (can gitmez), başka harf/hece can götürür. Bu harfte hece/kelime
// yoksa (a, n) 2-3. seviye de harf toplama (e'de kelime var).

const KAZMA_SEVIYELERI = {
  1: { hedef: 6, yanlis: 5, kaya: 8, benzer: false },
  2: { hedef: 8, yanlis: 8, kaya: 10, benzer: true, tur: 4, sirali: 4 },
  3: { hedef: 10, yanlis: 10, kaya: 14, benzer: true, tur: 3, sirali: 4 },
};

const KAZ_SUTUN = 16;
const KAZ_SATIR = 7;
const KAZ_EN = 72;
const KAZ_BOY = 68;
const KAZ_SOL = 640 - (KAZ_SUTUN * KAZ_EN) / 2;
const KAZ_UST = 215;

class KazmaSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("kazma");
  }

  preload() {
    super.preload();
    for (const ad of ["cocuk", "kaya"]) this.load.svg(ad, `gorseller/${ad}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = KAZMA_SEVIYELERI[this.seviye] || KAZMA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.siraliKur(); // harf topla / harflerle hece / hecelerle kelime (bkz. dosya başı)
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.hedef : this.tur === "hece" ? 4 : 3);
    if (this.tur === "harf") this.hedefPaneliKur("Topla:");
    this.hedefKare = null;
    this.yuruyor = false;
    this.basladi = false;

    // Gökyüzü ve çimen (en üst sıra, karakterin başladığı yer)
    const g = this.add.graphics().setDepth(-5);
    g.fillStyle(0xc9ecff, 1);
    g.fillRect(0, 100, 1280, KAZ_UST - 100);
    g.fillStyle(0x8d6e4c, 1);
    g.fillRect(KAZ_SOL - 20, KAZ_UST, KAZ_SUTUN * KAZ_EN + 40, KAZ_SATIR * KAZ_BOY + 20);
    g.fillStyle(0x6fbf4a, 1);
    g.fillRect(0, KAZ_UST - 14, 1280, 14);

    // Izgara: 0 kazılmış, 1 toprak, 2 kaya
    this.izgara = [];
    for (let c = 0; c < KAZ_SUTUN; c++) {
      this.izgara.push([]);
      for (let r = 0; r < KAZ_SATIR; r++) this.izgara[c].push(1);
    }
    this.kar = { c: Math.floor(KAZ_SUTUN / 2), r: 0 };
    this.izgara[this.kar.c][0] = 0;
    this.toprak = this.add.graphics().setDepth(1);

    // Kayalar ve hazineler (başlangıç karesinden uzakta, üst üste binmeden)
    const bos = [];
    for (let c = 0; c < KAZ_SUTUN; c++) {
      for (let r = 0; r < KAZ_SATIR; r++) {
        if (Math.abs(c - this.kar.c) + r > 1) bos.push({ c, r });
      }
    }
    Phaser.Utils.Array.Shuffle(bos);
    this.kayalar = [];
    for (let i = 0; i < this.ayar.kaya; i++) {
      const k = bos.pop();
      this.izgara[k.c][k.r] = 2;
      const { x, y } = this.konum(k.c, k.r);
      this.kayalar.push(this.add.image(x, y, "kaya").setScale(0.55).setDepth(3));
    }
    this.hazineler = [];
    if (this.tur === "harf") {
      const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
      const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
      const yanlisHavuz = this.ayar.benzer && benzerler.length ? [...benzerler, ...ogrenilmis] : ogrenilmis;
      // Kolay başlangıç: iki doğru hazine karakterin yakınında (ikinci ve üçüncü sırada)
      const yakinlar = bos.filter((k) => k.r <= 2 && Math.abs(k.c - this.kar.c) <= 3);
      for (let i = 0; i < this.ayar.hedef + 2; i++) {
        const k = i < 2 && yakinlar.length ? yakinlar.pop() : bos.pop();
        Phaser.Utils.Array.Remove(bos, k);
        this.hazineler.push(this.hazineYap(k.c, k.r, this.harf, true));
      }
      for (let i = 0; i < this.ayar.yanlis; i++) {
        const k = bos.pop();
        const harf = Phaser.Utils.Array.GetRandom(yanlisHavuz);
        this.hazineler.push(this.hazineYap(k.c, k.r, harf, false));
      }
    } else {
      this.siraliPanelKur();
    }
    this.topragiCiz();

    const { x, y } = this.konum(this.kar.c, this.kar.r);
    this.cocuk = this.add.image(x, y + KAZ_BOY / 2 - 2, "cocuk").setOrigin(0.5, 1).setScale(0.48).setDepth(20);

    this.input.on("pointerdown", (p) => this.hedefSec(p));
    this.input.on("pointermove", (p) => { if (p.isDown) this.hedefSec(p); });
    this.adimSaati = this.time.addEvent({ delay: 170, loop: true, callback: () => this.adimAt() });
    this.time.delayedCall(400, () => this.harfiTanit(() => {
      this.basladi = true;
      if (this.tur === "harf") this.elGoster(this.hazineler.find((h) => h.hazine.dogru));
      else this.yeniSoru();
    }));
  }

  // Sıralı oyun: yeni hece (harflerle) ya da kelime (hecelerle); eski taşlar kalkar, yenileri gömülür
  yeniSoru() {
    if (this.bitti) return;
    for (const h of this.hazineler) this.tweens.add({ targets: h, alpha: 0, scale: 0.5, duration: 250, onComplete: () => h.destroy() });
    this.hazineler = [];
    const yanlislar = this.siraliSoruSec();
    const { parcalar } = this.soru;
    // Yanlış parçalar (bilinen harf az ise her biri en çok iki kez)
    const yanlisParcalar = [];
    const adet = Math.min(this.ayar.sirali, yanlislar.length * 2);
    for (let i = 0; i < adet; i++) yanlisParcalar.push(yanlislar[i % yanlislar.length]);
    // Boş kareler: kaya değil, karakter yok; ilk parça karaktere yakın
    const bos = [];
    for (let c = 0; c < KAZ_SUTUN; c++) {
      for (let r = 0; r < KAZ_SATIR; r++) {
        if (this.izgara[c][r] !== 2 && (c !== this.kar.c || r !== this.kar.r)) bos.push({ c, r });
      }
    }
    Phaser.Utils.Array.Shuffle(bos);
    const uzaklik = (k) => Math.abs(k.c - this.kar.c) + Math.abs(k.r - this.kar.r);
    parcalar.forEach((metin, i) => {
      const k = i === 0 ? (bos.find((x) => uzaklik(x) >= 2 && uzaklik(x) <= 4) || bos[0]) : bos[0];
      Phaser.Utils.Array.Remove(bos, k);
      this.hazineler.push(this.hazineYap(k.c, k.r, metin, true));
    });
    for (const metin of yanlisParcalar) {
      const k = bos.pop();
      if (k) this.hazineler.push(this.hazineYap(k.c, k.r, metin, false));
    }
    for (const h of this.hazineler) {
      h.setScale(0);
      this.tweens.add({ targets: h, scale: 1, duration: 260, delay: 250, ease: "Back.Out" });
    }
    this.siraliSoyle();
    this.time.delayedCall(700, () => this.elGoster(this.siradakiTas()));
  }

  // Sıradaki toplanacak parçanın taşlarından biri
  siradakiTas() {
    return this.hazineler.find((h) => h.hazine.metin === this.soru.parcalar[this.sira]);
  }

  konum(c, r) {
    return { x: KAZ_SOL + c * KAZ_EN + KAZ_EN / 2, y: KAZ_UST + r * KAZ_BOY + KAZ_BOY / 2 };
  }

  hazineYap(c, r, harf, dogru) {
    const { x, y } = this.konum(c, r);
    const kap = this.add.container(x, y).setDepth(4);
    const g = this.add.graphics();
    if (harf.length > 1) g.setScale(1.25, 1); // hece taşı biraz geniş
    g.fillStyle(0xffd34d, 1); // bütün taşlar aynı renk: çocuk harfe bakarak seçsin
    g.lineStyle(3, 0x2b2b2b, 1);
    g.beginPath();
    g.moveTo(0, -28);
    g.lineTo(26, -8);
    g.lineTo(16, 26);
    g.lineTo(-16, 26);
    g.lineTo(-26, -8);
    g.closePath();
    g.fillPath();
    g.strokePath();
    const yazi = boyaliOrtala(titret(this.add.text(0, 2, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "22px" : harf.length > 1 ? "28px" : "34px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 6, padding: { x: 3, y: 3 },
    }), 1.2));
    kap.add([g, yazi]);
    kap.hazine = { c, r, metin: harf, dogru };
    return kap;
  }

  // Toprak kareleri (kazılmamış olanlar), hafif lekeli
  topragiCiz() {
    const g = this.toprak;
    g.clear();
    for (let c = 0; c < KAZ_SUTUN; c++) {
      for (let r = 0; r < KAZ_SATIR; r++) {
        if (this.izgara[c][r] !== 1) continue;
        const x = KAZ_SOL + c * KAZ_EN;
        const y = KAZ_UST + r * KAZ_BOY;
        g.fillStyle((c + r) % 2 ? 0xc49a6c : 0xbb9163, 1);
        g.fillRect(x, y, KAZ_EN, KAZ_BOY);
        g.fillStyle(0xa47a50, 1);
        g.fillCircle(x + 18 + ((c * 7) % 20), y + 20 + ((r * 11) % 18), 4);
        g.fillCircle(x + 48 - ((r * 5) % 14), y + 46 - ((c * 3) % 12), 3);
      }
    }
  }

  hedefSec(p) {
    if (this.bitti || !this.basladi || p.y < 120) return;
    const c = Phaser.Math.Clamp(Math.floor((p.x - KAZ_SOL) / KAZ_EN), 0, KAZ_SUTUN - 1);
    const r = Phaser.Math.Clamp(Math.floor((p.y - KAZ_UST) / KAZ_BOY), 0, KAZ_SATIR - 1);
    this.hedefKare = { c, r };
  }

  // Hedefe doğru bir kare: önce uzak olan eksende, kaya varsa öbür eksende
  adimAt() {
    if (this.bitti || !this.hedefKare || this.yuruyor) return;
    const { c, r } = this.kar;
    const dc = Math.sign(this.hedefKare.c - c);
    const dr = Math.sign(this.hedefKare.r - r);
    if (!dc && !dr) { this.hedefKare = null; return; }
    const secenekler = Math.abs(this.hedefKare.c - c) >= Math.abs(this.hedefKare.r - r)
      ? [[dc, 0], [0, dr]] : [[0, dr], [dc, 0]];
    for (const [ac, ar] of secenekler) {
      if (!ac && !ar) continue;
      const yc = c + ac;
      const yr = r + ar;
      if (yc < 0 || yc >= KAZ_SUTUN || yr < 0 || yr >= KAZ_SATIR) continue;
      if (this.izgara[yc][yr] === 2) continue;
      // Yoldaki taşa yalnızca çocuk tam onu seçtiyse basılır (geçerken yanlışlıkla can gitmesin)
      const hedefte = yc === this.hedefKare.c && yr === this.hedefKare.r;
      if (!hedefte && this.hazineler.some((h) => h.hazine.c === yc && h.hazine.r === yr)) continue;
      this.yuru(yc, yr);
      return;
    }
    this.hedefKare = null; // kaya yolu kapattı
  }

  yuru(c, r) {
    const kazildi = this.izgara[c][r] === 1;
    this.izgara[c][r] = 0;
    this.kar = { c, r };
    if (kazildi) {
      this.topragiCiz();
      Sesler.nota(140 + Math.random() * 40, 0, 0.06, 0.08, "square");
    } else {
      Sesler.adim(true);
    }
    const { x, y } = this.konum(c, r);
    if (x !== this.cocuk.x) this.cocuk.setFlipX(x < this.cocuk.x);
    this.yuruyor = true;
    this.tweens.add({ targets: this.cocuk, x, y: y + KAZ_BOY / 2 - 2, duration: 140,
      onComplete: () => { this.yuruyor = false; this.hazineyeBak(); } });
  }

  hazineyeBak() {
    const h = this.hazineler.find((x) => x.hazine.c === this.kar.c && x.hazine.r === this.kar.r);
    if (!h) return;
    if (this.tur !== "harf") { this.siraliBak(h); return; }
    this.hazineler = this.hazineler.filter((x) => x !== h);
    if (h.hazine.dogru) {
      Sesler.damla();
      harfiSoyle(this.harf);
      this.ilerlemeArtir(h.x, h.y);
      this.tweens.add({ targets: h, y: h.y - 40, scale: 1.4, alpha: 0, duration: 350, onComplete: () => h.destroy() });
    } else {
      this.kalpEksilt();
      this.tweens.add({ targets: h, angle: { from: -15, to: 15 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => this.tweens.add({ targets: h, alpha: 0, duration: 250, onComplete: () => h.destroy() }) });
      this.ipucuGoster(this.hazineler.find((x) => x.hazine.dogru));
    }
  }

  // Sıralı oyun: sıradaki parça toplanır ve üstteki yerine uçar; sırası gelmemiş doğru parça
  // yalnızca sallanır; başka parça can götürür
  siraliBak(h) {
    if (!this.soru || this.sira >= this.soru.parcalar.length) return;
    const durum = this.siraliDurum(h.hazine.metin);
    if (durum === "sirada") {
      this.hazineler = this.hazineler.filter((x) => x !== h);
      if (this.siraliParcaAl(h.x, h.y)) this.siraliTamam(() => this.yeniSoru());
      this.tweens.add({ targets: h, scale: 0.4, alpha: 0, duration: 300, onComplete: () => h.destroy() });
    } else if (durum === "sonra") {
      // Sırası gelmedi: can gitmez, sıradaki parça gösterilir
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.tweens.add({ targets: h, angle: { from: -12, to: 12 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => h.setAngle(0) });
      this.ipucuGoster(this.siradakiTas());
    } else {
      this.hazineler = this.hazineler.filter((x) => x !== h);
      this.kalpEksilt();
      this.tweens.add({ targets: h, angle: { from: -15, to: 15 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => this.tweens.add({ targets: h, alpha: 0, duration: 250, onComplete: () => h.destroy() }) });
      this.ipucuGoster(this.siradakiTas());
    }
  }

  oyunBitti() {
    if (this.adimSaati) this.adimSaati.remove();
  }
}

miniOyunKaydet("kazma", KazmaSahnesi);
