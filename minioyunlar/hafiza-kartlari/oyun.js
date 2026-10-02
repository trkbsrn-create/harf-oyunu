// Mini oyun: Hafıza Kartları
// Kartlar kapalı durur; çocuk iki kart açar, eşleşirlerse açık kalır, eşleşmezlerse kapanır.
// 1. ve 2. seviye: aynı harfi eşleştir (oyunun harfi daha çok çiftte çıkar).
// 3. seviye: harf ile resmi eşleştir ("a" kartı ↔ arı kartı).
// Her 2 yanlış eşleştirmede 1 can gider (öğretmenin kararı). Bütün çiftler bulununca kazanılır.

const HAFIZA_SEVIYELERI = {
  1: { tur: "ayni", cift: 4, kendi: 2, benzer: false },
  2: { tur: "ayni", cift: 6, kendi: 3, benzer: true },
  3: { tur: "resim", cift: 5 },
};

const HAFIZA_KART_EN = 150;
const HAFIZA_KART_BOY = 170;

class HafizaKartlariSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("hafiza-kartlari");
  }

  preload() {
    super.preload();
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = HAFIZA_SEVIYELERI[this.seviye] || HAFIZA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.acik = [];
    this.yanlisSayisi = 0;
    this.kilitli = true;
    doodleYazi(this, 640, 50, "Eşini bul", 40).setOrigin(0.5).setDepth(900);

    const ciftler = this.ayar.tur === "resim" ? this.resimCiftleri() : this.harfCiftleri();
    this.ilerlemeKur(ciftler.length);
    // Her çift iki kart olur; kartlar karışık dizilir
    const kartlar = [];
    ciftler.forEach((cift, i) => {
      kartlar.push({ ...cift[0], cift: i }, { ...cift[1], cift: i });
    });
    Phaser.Utils.Array.Shuffle(kartlar);
    const sutun = kartlar.length === 10 ? 5 : 4;
    const satir = Math.ceil(kartlar.length / sutun);
    const aralikX = 186;
    const aralikY = 192;
    this.kartlar = kartlar.map((bilgi, i) => {
      const x = 640 + ((i % sutun) - (sutun - 1) / 2) * aralikX;
      const y = 405 + (Math.floor(i / sutun) - (satir - 1) / 2) * aralikY;
      return this.kartYap(x, y, bilgi, i * 50);
    });

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.kart) this.kartaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => { this.kilitli = false; }));
  }

  // Aynı harf çiftleri: oyunun harfi birkaç çift, kalanı öbür öğrenilmiş harfler
  harfCiftleri() {
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    let digerleri = [];
    if (this.ayar.benzer) {
      digerleri = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    }
    for (const h of Phaser.Utils.Array.Shuffle(ogrenilmis.slice())) {
      if (!digerleri.includes(h)) digerleri.push(h);
    }
    const harfler = [];
    for (let i = 0; i < this.ayar.kendi; i++) harfler.push(this.harf);
    const kalan = this.ayar.cift - this.ayar.kendi;
    for (let i = 0; i < kalan; i++) harfler.push(digerleri[i % digerleri.length]);
    return harfler.map((h) => [{ harf: h }, { harf: h }]);
  }

  // Harf ve resim çiftleri: oyunun harfi her zaman var
  resimCiftleri() {
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    const resimliler = HARFLER.filter((h) => h.resim && ogrenilmis.includes(h.kucuk) && h.kucuk !== this.harf);
    const secilen = Phaser.Utils.Array.Shuffle(resimliler).slice(0, this.ayar.cift - 1);
    const kendi = HARFLER.find((h) => h.kucuk === this.harf);
    return [kendi, ...secilen].map((h) => [{ harf: h.kucuk }, { resim: h.resim, kelime: h.kelime }]);
  }

  kartYap(x, y, bilgi, gecikme) {
    const en = HAFIZA_KART_EN;
    const boy = HAFIZA_KART_BOY;
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    kap.add(g);
    // Ön yüz: harf ya da resim (kart açılınca görünür)
    let yuz;
    if (bilgi.harf) {
      yuz = boyaliOrtala(titret(this.add.text(0, 0, bilgi.harf, {
        fontFamily: "Andika", fontSize: "96px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 13, padding: { x: 4, y: 4 },
      }), 2));
    } else {
      yuz = this.add.image(0, 0, bilgi.resim);
      yuz.setScale(Math.min(120 / yuz.width, 130 / yuz.height));
    }
    yuz.setVisible(false);
    kap.add(yuz);
    kap.cizim = g;
    kap.yuz = yuz;
    kap.kart = bilgi;
    kap.setSize(en, boy).setInteractive({ useHandCursor: true });
    this.kartCiz(kap, "kapali");
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  // Kartın zemini: kapalıyken mavi ve soru işaretli, açıkken kâğıt; bulununca yeşil çerçeve
  kartCiz(kap, durum) {
    const g = kap.cizim;
    const en = HAFIZA_KART_EN;
    const boy = HAFIZA_KART_BOY;
    g.clear();
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-en / 2 + 6, -boy / 2 + 6, en, boy, 20);
    if (durum === "kapali") {
      g.fillStyle(0x9fd8f5, 1);
      g.fillRoundedRect(-en / 2, -boy / 2, en, boy, 20);
      g.lineStyle(3, 0xffffff, 0.7);
      g.strokeRoundedRect(-en / 2 + 12, -boy / 2 + 12, en - 24, boy - 24, 14);
      // Ortada küçük bir damla
      g.fillStyle(0xffffff, 0.85);
      g.fillCircle(0, 10, 20);
      g.fillTriangle(-17, 0, 17, 0, 0, -32);
    } else {
      g.fillStyle(0xfffdf6, 1);
      g.fillRoundedRect(-en / 2, -boy / 2, en, boy, 20);
    }
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(-en / 2, -boy / 2, en, boy, 20);
    if (durum === "bulundu") {
      g.lineStyle(9, 0x8fd16a, 1);
      g.strokeRoundedRect(-en / 2, -boy / 2, en, boy, 20);
    }
  }

  // Kartı çevirir: yarısında yüz değişir
  cevir(kap, ac, bitince) {
    this.tweens.add({
      targets: kap, scaleX: 0, duration: 130, ease: "Quad.In",
      onComplete: () => {
        this.kartCiz(kap, ac ? "acik" : "kapali");
        kap.yuz.setVisible(ac);
        this.tweens.add({ targets: kap, scaleX: 1, duration: 130, ease: "Quad.Out", onComplete: bitince });
      },
    });
  }

  kartaDokun(kap) {
    if (this.bitti || this.kilitli || kap.acildi || this.acik.length >= 2) return;
    kap.acildi = true;
    this.acik.push(kap);
    Sesler.nota(620, 0, 0.06, 0.1);
    this.cevir(kap, true);
    if (kap.kart.harf) harfiSoyle(kap.kart.harf);
    if (this.acik.length < 2) return;

    const [k1, k2] = this.acik;
    if (k1.kart.cift === k2.kart.cift || (k1.kart.harf && k1.kart.harf === k2.kart.harf)) {
      // Eşleşti
      this.time.delayedCall(450, () => {
        this.acik = [];
        for (const k of [k1, k2]) {
          k.bulundu = true;
          this.kartCiz(k, "bulundu");
          this.tweens.add({ targets: k, scale: 1.1, duration: 160, yoyo: true });
        }
        Sesler.pling();
        const resimli = [k1, k2].find((k) => k.kart.kelime);
        if (resimli) this.time.delayedCall(300, () => Sesler.soyle(resimli.kart.kelime));
        this.ilerlemeArtir();
      });
    } else {
      // Eşleşmedi: kartlar sallanır ve kapanır; her 2 yanlışta bir can gider
      this.time.delayedCall(1000, () => {
        if (this.bitti) return;
        this.yanlisSayisi++;
        if (this.yanlisSayisi % 2 === 0) this.kalpEksilt();
        else Sesler.nota(300, 0, 0.12, 0.1);
        for (const k of [k1, k2]) {
          this.tweens.add({ targets: k, angle: { from: -5, to: 5 }, duration: 70, yoyo: true, repeat: 1,
            onComplete: () => {
              k.setAngle(0);
              this.cevir(k, false, () => { k.acildi = false; });
            } });
        }
        this.time.delayedCall(450, () => { this.acik = []; });
      });
    }
  }

  oyunBitti() {
    for (const k of this.kartlar) k.disableInteractive();
  }
}

miniOyunKaydet("hafiza-kartlari", HafizaKartlariSahnesi);
