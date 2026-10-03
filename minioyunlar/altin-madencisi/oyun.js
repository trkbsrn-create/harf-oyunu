// Mini oyun: Altın Madencisi (kanca)
// Madenci yukarıda durur, kancası sağa sola sallanır. Çocuk ekrana dokununca kanca o yöne iner,
// ilk değdiği harfli külçeyi yakalayıp yukarı çeker. Bütün külçeler aynı görünür: istenen harfin
// külçesi altın çıkar (ilerleme); başka harfli külçe taş çıkar ve kanca onu yavaş çeker (zaman
// kaybı, can gitmez; öğretmenin seçtiği taslaktaki gibi). Kaybetmek yok.
// Seviyeler: 1: 5 altın, yavaş sallanma; 2: 7 altın, benzer harfler; 3: 9 altın, hızlı sallanma.

const MADEN_SEVIYELERI = {
  1: { hedef: 5, salinim: 1.4, benzer: false, kulce: 10 },
  2: { hedef: 7, salinim: 1.8, benzer: true, kulce: 12 },
  3: { hedef: 9, salinim: 2.3, benzer: true, kulce: 14 },
};

const KANCA_MERKEZ = { x: 640, y: 175 };
const MADEN_UST = 250;

class AltinMadencisiSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("altin-madencisi");
  }

  preload() {
    super.preload();
    this.load.svg("cocuk", "gorseller/cocuk.svg");
  }

  create() {
    this.ortakKur();
    this.ayar = MADEN_SEVIYELERI[this.seviye] || MADEN_SEVIYELERI[1];
    this.ilerlemeKur(this.ayar.hedef);
    this.hedefPaneliKur("Altın:");
    this.kulceler = [];
    this.durum = "bekle"; // salla, in, cek
    this.zaman = 0;
    this.uzunluk = 50;
    this.tutulan = null;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.yanlislar = this.ayar.benzer && benzerler.length ? [...benzerler, ...ogrenilmis] : ogrenilmis;

    const g = this.add.graphics().setDepth(-5);
    g.fillStyle(0xc9ecff, 1);
    g.fillRect(0, 100, 1280, MADEN_UST - 100);
    g.fillStyle(0xc49a6c, 1);
    g.fillRect(0, MADEN_UST, 1280, 720 - MADEN_UST);
    g.fillStyle(0x6fbf4a, 1);
    g.fillRect(0, MADEN_UST - 12, 1280, 12);
    g.fillStyle(0xa47a50, 1);
    for (let i = 0; i < 60; i++) g.fillCircle((i * 211) % 1280, MADEN_UST + 30 + ((i * 97) % 420), 4 + (i % 3));
    // Makara ve madenci
    this.add.image(KANCA_MERKEZ.x - 70, KANCA_MERKEZ.y + 50, "cocuk").setOrigin(0.5, 1).setScale(0.55).setDepth(5);
    const m = this.add.graphics().setDepth(6);
    m.fillStyle(0x8d6e4c, 1);
    m.fillRect(KANCA_MERKEZ.x - 40, KANCA_MERKEZ.y - 30, 80, 24);
    m.lineStyle(4, 0x2b2b2b, 1);
    m.strokeRect(KANCA_MERKEZ.x - 40, KANCA_MERKEZ.y - 30, 80, 24);
    m.fillStyle(0xffe680, 1);
    m.fillCircle(KANCA_MERKEZ.x, KANCA_MERKEZ.y, 16);
    m.strokeCircle(KANCA_MERKEZ.x, KANCA_MERKEZ.y, 16);
    this.ip = this.add.graphics().setDepth(15);

    for (let i = 0; i < this.ayar.kulce; i++) this.kulceKoy(i < 3);
    this.input.on("pointerdown", () => this.indir());
    this.time.delayedCall(400, () => this.harfiTanit(() => {
      this.durum = "salla";
      this.elGoster({ x: 640, y: 470 });
    }));
  }

  // Yeni külçe: öbürleriyle çakışmayan rastgele yere
  kulceKoy(dogruZorunlu) {
    const dogruSayisi = this.kulceler.filter((k) => k.kulce.dogru).length;
    const dogru = dogruZorunlu || dogruSayisi < 3 || Math.random() < 0.45;
    const harf = dogru ? this.harf : Phaser.Utils.Array.GetRandom(this.yanlislar);
    const r = Phaser.Math.Between(32, 44);
    let x = 0;
    let y = 0;
    for (let d = 0; d < 80; d++) {
      x = Phaser.Math.Between(80, 1200);
      y = Phaser.Math.Between(MADEN_UST + 70, 670);
      if (Math.hypot(x - KANCA_MERKEZ.x, y - KANCA_MERKEZ.y) < 170) continue;
      if (this.kulceler.every((k) => Math.hypot(k.x - x, k.y - y) > k.kulce.r + r + 26)) break;
    }
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    this.kulceCiz(g, r, 0xffd34d);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: `${Math.round(r * 1.05)}px`, color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
    }), 1.3));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.kulce = { harf, dogru: harf === this.harf, r };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, ease: "Back.Out" });
    this.kulceler.push(kap);
  }

  kulceCiz(g, r, renk) {
    g.clear();
    g.fillStyle(renk, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.beginPath();
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (i % 2 ? 0.86 : 1);
      if (i === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  indir() {
    if (this.bitti || this.durum !== "salla") return;
    this.durum = "in";
    Sesler.nota(330, 0, 0.08, 0.08, "sine");
  }

  kancaUcu() {
    return {
      x: KANCA_MERKEZ.x + Math.sin(this.aci) * this.uzunluk,
      y: KANCA_MERKEZ.y + Math.cos(this.aci) * this.uzunluk,
    };
  }

  update(zaman, fark) {
    if (this.bitti || this.durum === "bekle") return;
    const sn = fark / 1000;
    if (this.durum === "salla") {
      this.zaman += sn;
      this.aci = Math.sin(this.zaman * this.ayar.salinim) * 1.25;
    } else if (this.durum === "in") {
      this.uzunluk += 560 * sn;
      const uc = this.kancaUcu();
      const degen = this.kulceler.find((k) => Math.hypot(k.x - uc.x, k.y - uc.y) < k.kulce.r + 10);
      if (degen) this.yakala(degen);
      else if (uc.x < 0 || uc.x > 1280 || uc.y > 720) this.durum = "cek";
    } else if (this.durum === "cek") {
      const hiz = !this.tutulan ? 760 : this.tutulan.kulce.dogru ? 420 : 150;
      this.uzunluk -= hiz * sn;
      if (this.tutulan) {
        const uc = this.kancaUcu();
        this.tutulan.setPosition(uc.x, uc.y + this.tutulan.kulce.r * 0.6);
      }
      if (this.uzunluk <= 50) {
        this.uzunluk = 50;
        this.yukariGeldi();
      }
    }
    this.kancaCiz();
  }

  kancaCiz() {
    const g = this.ip;
    const uc = this.kancaUcu();
    g.clear();
    g.lineStyle(4, 0x2b2b2b, 1);
    g.lineBetween(KANCA_MERKEZ.x, KANCA_MERKEZ.y, uc.x, uc.y);
    // Kanca: iki kollu çengel
    const dx = Math.cos(this.aci);
    const dy = -Math.sin(this.aci);
    g.lineStyle(6, 0x555555, 1);
    g.beginPath();
    g.moveTo(uc.x - dx * 20, uc.y - dy * 20);
    g.lineTo(uc.x, uc.y);
    g.lineTo(uc.x + dx * 20, uc.y + dy * 20);
    g.strokePath();
    g.fillStyle(0x555555, 1);
    g.fillCircle(uc.x, uc.y, 7);
  }

  yakala(k) {
    this.tutulan = k;
    this.durum = "cek";
    this.kulceler = this.kulceler.filter((x) => x !== k);
    if (k.kulce.dogru) {
      Sesler.pling();
    } else {
      // Yanlış harf: külçe taşa döner, ağır gelir
      this.kulceCiz(k.cizim, k.kulce.r, 0x9e9e9e);
      Sesler.yanlis();
    }
  }

  yukariGeldi() {
    const k = this.tutulan;
    this.tutulan = null;
    this.durum = "salla";
    if (!k) return;
    if (k.kulce.dogru) {
      harfiSoyle(this.harf);
      this.ilerlemeArtir(k.x, k.y);
    }
    this.tweens.add({ targets: k, scale: 0, alpha: 0, duration: 250, onComplete: () => k.destroy() });
    if (!this.bitti) this.time.delayedCall(400, () => this.kulceKoy(false));
  }

  oyunBitti() {
    this.durum = "bekle";
  }
}

miniOyunKaydet("altin-madencisi", AltinMadencisiSahnesi);
