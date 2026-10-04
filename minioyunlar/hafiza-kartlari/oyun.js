// Mini oyun: Hafıza Kartları
// Kartlar kapalı durur; çocuk iki kart açar, eşleşirlerse açık kalır, eşleşmezlerse kapanır.
// Öğretmenin kararı: yalnızca oyunun harfiyle ilgili kartlar gelir. Her çift aynı resmin iki
// kartıdır; resimler o harfin kelimelerinden (Resimden Sesi Bul'un KONUMLU_KELIMELER'i) seçilir.
// Eşleşince kelime okunur. Seviye arttıkça çift çoğalır ve harfin yeri çeşitlenir:
// 1: 4 çift, harf başında; 2: 5 çift, başında ve sonunda; 3: 6 çift, başında, sonunda, ortasında.
// Her 2 yanlış eşleştirmede 1 can gider (öğretmenin kararı). Bütün çiftler bulununca kazanılır.

const HAFIZA_SEVIYELERI = {
  1: { cift: 4, konumlar: ["bas"] },
  2: { cift: 5, konumlar: ["bas", "son"] },
  3: { cift: 6, konumlar: ["bas", "son", "orta"] },
};

const HAFIZA_KART_EN = 150;
const HAFIZA_KART_BOY = 170;

class HafizaKartlariSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("hafiza-kartlari");
  }

  preload() {
    super.preload();
    const kelimeler = KONUMLU_KELIMELER[this.harf] || KONUMLU_KELIMELER.a;
    for (const k of new Set([...kelimeler.bas, ...kelimeler.son, ...kelimeler.orta])) {
      const ad = kelimeResmi(k);
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.ortakKur();
    this.ayar = HAFIZA_SEVIYELERI[this.seviye] || HAFIZA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.acik = [];
    this.yanlisSayisi = 0;
    this.kilitli = true;
    doodleYazi(this, 640, 50, "Eşini bul", 40).setOrigin(0.5).setDepth(900);

    const ciftler = this.resimCiftleri();
    this.ilerlemeKur(ciftler.length);
    // Her çift iki kart olur; kartlar karışık dizilir
    const kartlar = [];
    ciftler.forEach((cift, i) => {
      kartlar.push({ ...cift[0], cift: i }, { ...cift[1], cift: i });
    });
    Phaser.Utils.Array.Shuffle(kartlar);
    const sutun = kartlar.length === 8 ? 4 : kartlar.length === 10 ? 5 : 6;
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
    this.time.delayedCall(400, () => this.harfiTanit(() => {
      this.kilitli = false;
      // Gösteren el iki karta sırayla dokunur (bir kez); eşleşeni göstermez
      this.elGoster([this.kartlar[0], this.kartlar[1]]);
    }));
  }

  // Aynı resim çiftleri: oyunun harfinin kelimelerinden, seviyenin konumlarından dengeli seçilir
  resimCiftleri() {
    const kelimeler = KONUMLU_KELIMELER[this.harf] || KONUMLU_KELIMELER.a;
    const havuzlar = this.ayar.konumlar.map((k) => Phaser.Utils.Array.Shuffle(kelimeler[k].slice()));
    const secilen = [];
    for (let i = 0; secilen.length < this.ayar.cift && i < 50; i++) {
      const havuz = havuzlar[i % havuzlar.length];
      const k = havuz.shift();
      if (k && !secilen.includes(k)) secilen.push(k);
    }
    return secilen.map((k) => {
      const kart = { resim: kelimeResmi(k), kelime: k };
      return [kart, kart];
    });
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
    if (this.acik.length < 2) return;

    const [k1, k2] = this.acik;
    if (k1.kart.cift === k2.kart.cift) {
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
        this.ilerlemeArtir((k1.x + k2.x) / 2, (k1.y + k2.y) / 2);
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
