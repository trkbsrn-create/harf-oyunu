// Mini oyun: Duvardan Geçme (harfli kapılar)
// Karakter (arkadan görünüş) yolda koşar; uzaktan üç kapılı duvarlar yaklaşır, her kapıda bir
// harf var. Çocuk istenen harfin kapısının şeridine geçer: karakterin sağına ya da soluna dokunur
// (ya da parmağını sürükler). Duvar gelince doğru kapıdan geçilir; yanlış kapı kapalıdır,
// karakter çarpıp sekerek geri döner ve bir can gider. Ünlü harf söylenir; ünsüz yalnızca
// üstteki panelde görünür (öğretmenin kararı).
// Ortak kural (Kazma düzeni): 1. seviye harf; 2. seviyede hece söylenir, hecenin harflerinin
// kapılarından sırayla geçilir (üstteki yerlere uçar; 4 hece); 3. seviyede kelime söylenir,
// hecelerinin kapılarından sırayla geçilir (3 kelime). Sırası gelmemiş parçanın kapısı da kapalıdır
// ama can götürmez; başka parça can götürür.
// Seviyeler: 1: 6 duvar, çok farklı harfler, yavaş; 2: 8 duvar; 3: 10 duvar, hızlı.

const DUVAR_SEVIYELERI = {
  1: { duvar: 6, sure: 4600, benzer: false },
  2: { duvar: 8, sure: 4000, benzer: true },
  3: { duvar: 10, sure: 3300, benzer: true },
};

const DUVAR_UFUK = 175;
const DUVAR_ALT = 640;
const DUVAR_SERIT = 250;

class DuvardanGecmeSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("duvardan-gecme");
  }

  preload() {
    super.preload();
    this.load.svg("cocuk-tirman", "gorseller/cocuk-tirman.svg");
  }

  create() {
    this.ortakKur();
    this.ayar = DUVAR_SEVIYELERI[this.seviye] || DUVAR_SEVIYELERI[1];
    this.kalpleriKur(3);
    // Bu harfte hece yoksa (a, n) 2-3. seviye de harf.
    this.siraliKur();
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.duvar : this.tur === "hece" ? 4 : 3);
    this.hedef = this.harf; // geçilecek kapının yazısı
    this.sonDogruSerit = null; // önceki duvarda doğru kapının şeridi
    this.siraliYanlislar = [];
    if (this.tur !== "harf") {
      this.siraliPanelKur();
    } else {
      this.hedefPaneliKur("Geç:");
    }
    this.duvar = null;
    this.serit = 0; // -1, 0, 1
    this.uretilen = 0;

    this.yolCiz();
    this.kosucu = this.add.image(640, DUVAR_ALT + 50, "cocuk-tirman").setOrigin(0.5, 1).setScale(0.9).setDepth(30);
    this.isaret = this.add.zone(640, 400, 10, 10); // gösteren el için doğru kapının yeri

    this.input.on("pointerdown", (p) => {
      if (this.bitti || p.y < 120) return;
      if (Math.abs(p.x - this.kosucu.x) < 70) return;
      this.seritSec(this.serit + (p.x < this.kosucu.x ? -1 : 1));
    });
    this.input.on("pointermove", (p) => {
      if (!p.isDown || p.y < 120 || this.bitti) return;
      const yeni = Phaser.Math.Clamp(Math.round((p.x - 640) / DUVAR_SERIT), -1, 1);
      if (yeni !== this.serit) this.seritSec(yeni);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniDuvar()));
  }

  // Ufka doğru daralan yol, çimen, şerit çizgileri
  yolCiz() {
    const g = this.add.graphics().setDepth(-5);
    g.fillStyle(0xc9ecff, 1);
    g.fillRect(0, 0, 1280, DUVAR_UFUK);
    g.fillStyle(0xb5e48c, 1);
    g.fillRect(0, DUVAR_UFUK, 1280, 720 - DUVAR_UFUK);
    g.fillStyle(0xe8cfa4, 1);
    g.lineStyle(5, 0x8d6e4c, 1);
    g.beginPath();
    g.moveTo(640 - 70, DUVAR_UFUK);
    g.lineTo(640 + 70, DUVAR_UFUK);
    g.lineTo(640 + 560, 720);
    g.lineTo(640 - 560, 720);
    g.closePath();
    g.fillPath();
    g.strokePath();
    this.cizgiler = this.add.graphics().setDepth(-4);
    this.yolKaymasi = 0;
  }

  // k: 0 (ufuk) .. 1 (karakterin önü)
  izdusum(k) {
    const kk = Math.pow(k, 1.6);
    return { y: DUVAR_UFUK + (DUVAR_ALT - DUVAR_UFUK) * kk, olcek: 0.12 + 0.88 * kk };
  }

  seritSec(yeni) {
    yeni = Phaser.Math.Clamp(yeni, -1, 1);
    if (yeni === this.serit) return;
    this.serit = yeni;
    Sesler.nota(520, 0, 0.05, 0.08, "sine");
    this.tweens.killTweensOf(this.kosucu);
    this.tweens.add({ targets: this.kosucu, x: 640 + yeni * DUVAR_SERIT, duration: 200, ease: "Quad.Out" });
  }

  harfleriSec() {
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    let yanlislar = [];
    if (this.ayar.benzer) yanlislar = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    for (const h of Phaser.Utils.Array.Shuffle(ogrenilmis.slice())) {
      if (!this.ayar.benzer && (BENZER_HARFLER[this.harf] || []).includes(h)) continue;
      if (!yanlislar.includes(h)) yanlislar.push(h);
    }
    if (yanlislar.length < 2) yanlislar = Phaser.Utils.Array.Shuffle(ogrenilmis.slice());
    return Phaser.Utils.Array.Shuffle([this.harf, ...Phaser.Utils.Array.Shuffle(yanlislar.slice(0, 3)).slice(0, 2)]);
  }

  // Kapı yazıları: harf ya da sıradaki parça ve başkaları (doğru olan this.hedef)
  kapiYazilari() {
    if (this.tur === "harf") return this.harfleriSec();
    this.soruYeni = !this.soru || this.sira >= this.soru.parcalar.length;
    if (this.soruYeni) this.siraliYanlislar = this.siraliSoruSec();
    const secenekler = this.siraliSecenekler(this.siraliYanlislar, 3, true);
    this.hedef = secenekler[0];
    return Phaser.Utils.Array.Shuffle(secenekler);
  }

  yeniDuvar() {
    if (this.bitti) return;
    this.uretilen++;
    const harfler = this.kapiYazilari();
    // Öğretmenin isteği: doğru kapı her duvarda başka yerde; karakterin şimdi durduğu şeritte de
    // olmaz (yerinde durarak kazanılmasın)
    const dogruSira = harfler.indexOf(this.hedef);
    if (dogruSira >= 0) {
      const adaylar = [0, 1, 2].filter((i) => i - 1 !== this.sonDogruSerit && i - 1 !== this.serit);
      const yer = Phaser.Utils.Array.GetRandom(adaylar.length ? adaylar : [0, 1, 2].filter((i) => i - 1 !== this.serit));
      [harfler[dogruSira], harfler[yer]] = [harfler[yer], harfler[dogruSira]];
      this.sonDogruSerit = yer - 1;
    }
    const kap = this.add.container(640, DUVAR_UFUK).setDepth(10);
    const g = this.add.graphics();
    // Tuğla duvar (tam boyutta çizilir, uzaktayken küçültülür)
    g.fillStyle(0xd9735b, 1);
    g.fillRect(-400, -250, 800, 250);
    g.lineStyle(3, 0x9c4a38, 1);
    for (let sira = 0, y = -250; y < 0; sira++, y += 36) {
      g.lineBetween(-400, y, 400, y);
      const altY = Math.min(y + 36, 0);
      for (let x = -400 + (sira % 2) * 40 + 40; x < 400; x += 80) g.lineBetween(x, y, x, altY);
    }
    g.lineStyle(6, 0x2b2b2b, 1);
    g.strokeRect(-400, -250, 800, 250);
    kap.add(g);
    const kapilar = [];
    harfler.forEach((harf, i) => {
      const x = (i - 1) * DUVAR_SERIT;
      const kg = this.add.graphics();
      kg.fillStyle(0xc99a63, 1);
      kg.fillRoundedRect(x - 85, -215, 170, 215, { tl: 70, tr: 70, bl: 0, br: 0 });
      kg.lineStyle(6, 0x2b2b2b, 1);
      kg.strokeRoundedRect(x - 85, -215, 170, 215, { tl: 70, tr: 70, bl: 0, br: 0 });
      kg.fillStyle(0x2b2b2b, 1);
      kg.fillCircle(x + 60, -40, 9); // tokmak harften uzakta (nokta gibi görünmesin)
      const yazi = boyaliOrtala(titret(this.add.text(x, -130, harf, {
        fontFamily: "Andika", fontSize: harf.length > 2 ? "62px" : harf.length > 1 ? "78px" : "100px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 14, padding: { x: 6, y: 6 },
      }), 2.2));
      kap.add([kg, yazi]);
      kapilar.push({ serit: i - 1, harf, dogru: harf === this.hedef, cizim: kg, x });
    });
    kap.duvar = { k: 0, kapilar, gecti: false };
    this.duvar = kap;
    this.duvarYerlestir();
    if (this.tur === "harf") harfiSoyle(this.harf);
    else if (this.soruYeni) this.siraliSoyle();
    // İlk duvarda gösteren el doğru kapıyı gösterir
    this.time.delayedCall(900, () => {
      if (this.duvar === kap && !this.bitti) this.elGoster(this.isaret);
    });
  }

  duvarYerlestir() {
    const kap = this.duvar;
    const { y, olcek } = this.izdusum(kap.duvar.k);
    kap.setPosition(640, y).setScale(olcek);
    const dogru = kap.duvar.kapilar.find((k) => k.dogru);
    this.isaret.setPosition(640 + dogru.x * olcek, y - 120 * olcek);
  }

  update(zaman, fark) {
    if (this.bitti) return;
    // Yol çizgileri akar
    this.yolKaymasi = (this.yolKaymasi + fark / 900) % 1;
    const c = this.cizgiler;
    c.clear();
    c.fillStyle(0xffffff, 0.8);
    for (let i = 0; i < 8; i++) {
      const k1 = ((i + this.yolKaymasi) / 8);
      const k2 = k1 + 0.05;
      for (const s of [-0.5, 0.5]) {
        const a = this.izdusum(k1);
        const b = this.izdusum(Math.min(k2, 1));
        const x1 = 640 + s * DUVAR_SERIT * a.olcek;
        const x2 = 640 + s * DUVAR_SERIT * b.olcek;
        c.fillTriangle(x1 - 3 * a.olcek, a.y, x1 + 3 * a.olcek, a.y, x2, b.y);
        c.fillTriangle(x2 - 5 * b.olcek, b.y, x2 + 5 * b.olcek, b.y, x1, a.y);
      }
    }
    // Koşma: karakter hafifçe zıplar, sağa sola döner
    this.kosucu.setFlipX(Math.floor(zaman / 180) % 2 === 0);
    this.kosucu.y = DUVAR_ALT + 50 - Math.abs(Math.sin(zaman / 180)) * 8;

    const kap = this.duvar;
    if (!kap || kap.duvar.gecti) return;
    kap.duvar.k = Math.min(1, kap.duvar.k + fark / this.ayar.sure);
    this.duvarYerlestir();
    if (kap.duvar.k >= 1) this.duvaraVardi(kap);
  }

  duvaraVardi(kap) {
    kap.duvar.gecti = true;
    const kapi = kap.duvar.kapilar.find((k) => k.serit === this.serit);
    const durum = this.tur === "harf" ? (kapi.dogru ? "sirada" : "yanlis") : this.siraliDurum(kapi.harf);
    if (durum === "sirada") {
      // Kapı açılır: içi karanlık geçit olur, karakter geçer
      kapi.cizim.clear();
      kapi.cizim.fillStyle(0x3b2a1a, 1);
      kapi.cizim.fillRoundedRect(kapi.x - 85, -215, 170, 215, { tl: 70, tr: 70, bl: 0, br: 0 });
      let tamam = false;
      if (this.tur === "harf") {
        Sesler.pling();
        this.ilerlemeArtir(640 + kapi.x, DUVAR_ALT - 150);
      } else {
        tamam = this.siraliParcaAl(640 + kapi.x * kap.scale, kap.y - 130 * kap.scale);
        if (tamam) this.siraliTamam(() => this.yeniDuvar());
      }
      this.tweens.add({ targets: kap, scale: 1.6, alpha: 0, y: DUVAR_ALT + 200, duration: 450, ease: "Quad.In",
        onComplete: () => { kap.destroy(); if (!tamam) this.time.delayedCall(250, () => this.yeniDuvar()); } });
    } else {
      // Çarpma: karakter seker, kamera sallanır, bir can gider
      Sesler.pat();
      this.tweens.add({ targets: this.kosucu, scale: 0.8, duration: 120, yoyo: true });
      if (durum === "yanlis") this.kalpEksilt(); // sırası gelmemiş doğru parça can götürmez
      const dogru = kap.duvar.kapilar.find((k) => k.dogru);
      dogru.cizim.lineStyle(10, 0x8fd16a, 1);
      dogru.cizim.strokeRoundedRect(dogru.x - 85, -215, 170, 215, { tl: 70, tr: 70, bl: 0, br: 0 });
      this.time.delayedCall(700, () => {
        this.tweens.add({ targets: kap, alpha: 0, duration: 300,
          onComplete: () => { kap.destroy(); this.time.delayedCall(250, () => this.yeniDuvar()); } });
      });
    }
  }

  oyunBitti() {
    this.duvar = null;
  }
}

miniOyunKaydet("duvardan-gecme", DuvardanGecmeSahnesi);
