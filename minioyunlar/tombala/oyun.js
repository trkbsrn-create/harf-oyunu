// Mini oyun: Tombala (resimli, heceli, kelimeli tombala)
// Öğretmenin isteği: kartta resimler, heceler ve kelimeler var. Torbadan bir top çıkar: resim
// kutusu için harf (o sesle başlayan resme pul konur), hece kutusu için hece, kelime kutusu için
// kelime (aynısının yazılı olduğu kutuya pul konur). Kart dolunca "Tombala!". Yalnızca bu harfe
// kadar öğrenilmiş harfler (resimler başındaki harfe göre; yazılanlar yalnızca bilinen harflerle).
// Yeterli resim/hece/kelime yoksa kutular tekrar eder. Üst seviyelerde kartta olmayan top da
// çıkar; o zaman "Kartımda yok" düğmesine basılır. Yanlış seçim bir can götürür.
// Seviyeler: 1: 4 kutu (2 resim, 2 hece); 2: 4 kutu (1 resim, 2 hece, 1 kelime), arada kartta
// olmayan top; 3: 6 kutu (2 resim, 2 hece, 2 kelime), arada kartta olmayan ya da kapatılmış top,
// satır dolunca "Çinko!".

const TOMBALA_SEVIYELERI = {
  1: { kutular: { resim: 2, hece: 2, kelime: 0 }, sutun: 2, sasirtma: 0 },
  2: { kutular: { resim: 1, hece: 2, kelime: 1 }, sutun: 2, sasirtma: 2 },
  3: { kutular: { resim: 2, hece: 2, kelime: 2 }, sutun: 3, sasirtma: 3 },
};

const PUL_RENKLERI = [0xff6b5a, 0x7cc4ef, 0x8fd16a, 0xffc928, 0xc8a2ff];

class TombalaSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("tombala");
  }

  preload() {
    super.preload();
    for (const k of basResimleri(this.harf)) this.load.svg(kelimeResmi(k), `gorseller/${kelimeResmi(k)}.svg`);
  }

  // Kartın kutuları: { tur, cagri (topta çıkan), metin (kutuda yazan ya da resmin adı) }
  kutulariSec() {
    const harf = this.harf;
    const icinde = (m) => m.includes(harf);
    const karistir = (dizi) => {
      const k = Phaser.Utils.Array.Shuffle(dizi.slice());
      return [...k.filter(icinde), ...k.filter((m) => !icinde(m))]; // önce oyunun harfini içerenler
    };
    const uzunluk = this.seviye >= 3 ? null : 2;
    const havuzlar = {
      resim: karistir(basResimleri(harf)).map((k) => ({ tur: "resim", cagri: k[0], metin: k })),
      hece: karistir([...new Set(heceHavuzu(harf).map((h) => h.hece))].filter((h) => !uzunluk || h.length === uzunluk))
        .map((h) => ({ tur: "hece", cagri: h, metin: h })),
      kelime: karistir(ogrenilmisKelimeler(harf).map((k) => k.kelime).filter((k) => k.length <= 5))
        .map((k) => ({ tur: "kelime", cagri: k, metin: k })),
    };
    const secilen = [];
    let eksik = 0;
    for (const [tur, sayi] of Object.entries(this.ayar.kutular)) {
      const havuz = havuzlar[tur];
      for (let i = 0; i < sayi; i++) {
        // Resimlerde başındaki harf farklı olsun (iki resim aynı topla kapanmasın); azsa olur
        let oge = havuz.find((o) => !secilen.includes(o) && !(tur === "resim" && secilen.some((x) => x.cagri === o.cagri)));
        if (!oge) oge = havuz.find((o) => !secilen.includes(o));
        if (oge) secilen.push(oge); else eksik++;
      }
    }
    // Eksikler önce öbür türlerden, o da yoksa var olanların tekrarıyla dolar (öğretmenin kararı)
    const kalan = Object.values(havuzlar).flat().filter((o) => !secilen.includes(o));
    while (eksik > 0 && kalan.length) { secilen.push(kalan.shift()); eksik--; }
    const ilkler = secilen.slice();
    for (let i = 0; eksik > 0 && ilkler.length; i++, eksik--) secilen.push({ ...ilkler[i % ilkler.length] });
    this.disarida = [...new Set(kalan.map((o) => o.cagri))]
      .filter((c) => !secilen.some((o) => o.cagri === c || o.metin === c)); // resmi kartta olan kelime de çıkmaz
    return Phaser.Utils.Array.Shuffle(secilen);
  }

  create() {
    this.ortakKur();
    this.ayar = TOMBALA_SEVIYELERI[this.seviye] || TOMBALA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.kutular = [];
    this.yokDugmesi = null;
    this.top = null;
    this.cekilen = null;
    this.kilitli = true;
    const karttakiler = this.kutulariSec();
    this.ilerlemeKur(karttakiler.length);

    // Kart
    const sutun = this.ayar.sutun;
    const satir = Math.ceil(karttakiler.length / sutun);
    const kutuEn = 200;
    const kutuBoy = 180;
    const solX = 560 - ((sutun - 1) / 2) * (kutuEn + 16);
    const ustY = 400 - ((satir - 1) / 2) * (kutuBoy + 16);
    const g = this.add.graphics().setDepth(1);
    const kartEn = sutun * (kutuEn + 16) + 40;
    const kartBoy = satir * (kutuBoy + 16) + 40;
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(560 - kartEn / 2 + 8, 400 - kartBoy / 2 + 8, kartEn, kartBoy, 24);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(560 - kartEn / 2, 400 - kartBoy / 2, kartEn, kartBoy, 24);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(560 - kartEn / 2, 400 - kartBoy / 2, kartEn, kartBoy, 24);
    const ZEMIN = { resim: 0xf6efe0, hece: 0xfff1bf, kelime: 0xdcf0fb };
    karttakiler.forEach((o, i) => {
      const x = solX + (i % sutun) * (kutuEn + 16);
      const y = ustY + Math.floor(i / sutun) * (kutuBoy + 16);
      const kap = this.add.container(x, y).setDepth(2);
      const kg = this.add.graphics();
      kg.fillStyle(ZEMIN[o.tur], 1);
      kg.fillRoundedRect(-kutuEn / 2, -kutuBoy / 2, kutuEn, kutuBoy, 16);
      kg.lineStyle(3, 0x2b2b2b, 1);
      kg.strokeRoundedRect(-kutuEn / 2, -kutuBoy / 2, kutuEn, kutuBoy, 16);
      kap.add(kg);
      if (o.tur === "resim") {
        const resim = this.add.image(0, 0, kelimeResmi(o.metin));
        resim.setScale(Math.min(150 / resim.width, 140 / resim.height));
        kap.add(resim);
      } else {
        const yazi = boyaliOrtala(titret(this.add.text(0, 0, o.metin, {
          fontFamily: "Andika", fontSize: o.tur === "hece" ? "72px" : "60px", color: "#2b2b2b", padding: { x: 4, y: 4 },
        }), 1.4));
        yazi.setScale(Math.min(1, 170 / yazi.width));
        kap.add(yazi);
      }
      kap.kutu = { ...o, satir: Math.floor(i / sutun), dolu: false };
      kap.setSize(kutuEn, kutuBoy).setInteractive({ useHandCursor: true });
      kap.on("pointerdown", () => this.kutuyaDokun(kap));
      this.kutular.push(kap);
    });

    // Torba ve "Kartımda yok" düğmesi (sağda)
    const t = this.add.graphics().setDepth(1);
    t.fillStyle(0xc99a63, 1);
    t.lineStyle(5, 0x2b2b2b, 1);
    t.fillEllipse(1070, 470, 190, 170);
    t.strokeEllipse(1070, 470, 190, 170);
    t.fillRoundedRect(1020, 360, 100, 40, 14);
    t.strokeRoundedRect(1020, 360, 100, 40, 14);
    t.lineStyle(4, 0xe0533d, 1);
    t.lineBetween(1030, 392, 1110, 392);
    if (this.ayar.sasirtma) {
      this.yokDugmesi = this.add.container(1070, 640, [
        this.add.image(0, 0, "incele-dugmesi").setScale(1.15, 1),
        doodleYazi(this, 0, -3, "Kartımda yok", 26).setOrigin(0.5),
      ]).setSize(230, 80).setDepth(5).setInteractive({ useHandCursor: true });
      this.yokDugmesi.on("pointerdown", () => this.yokaBasildi());
    }

    // Çekiliş sırası: her kutunun topu + şaşırtma topları (kartta olmayan ya da tekrar)
    this.siradakiler = Phaser.Utils.Array.Shuffle(karttakiler.map((o) => o.cagri));
    for (let i = 0; i < this.ayar.sasirtma; i++) {
      const tekrar = this.seviye >= 3 && i % 2 === 1;
      const cagri = tekrar || !this.disarida.length ? null : Phaser.Utils.Array.GetRandom(this.disarida);
      // İlk çekiliş hep karttan (kolay başlangıç); şaşırtmalar araya
      const yer = Phaser.Math.Between(1, this.siradakiler.length);
      this.siradakiler.splice(yer, 0, cagri || "tekrar");
    }
    this.time.delayedCall(400, () => this.harfiTanit(() => this.topCek()));
  }

  topCek() {
    if (this.bitti) return;
    if (this.top) this.top.destroy();
    let harf = this.siradakiler.shift();
    if (harf === undefined) return;
    if (harf === "tekrar") {
      const dolular = this.kutular.filter((k) => k.kutu.dolu);
      harf = dolular.length ? Phaser.Utils.Array.GetRandom(dolular).kutu.cagri : (this.disarida[0] || this.siradakiler.shift());
    }
    this.cekilen = harf;
    const kap = this.add.container(1070, 470).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0xfffdf6, 1);
    g.fillCircle(0, 0, 58);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, 58);
    g.fillStyle(0xffe680, 1);
    g.fillCircle(0, 0, 42);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: "64px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 10, padding: { x: 4, y: 4 },
    }), 1.8));
    yazi.setScale(Math.min(1, 96 / yazi.width)); // hece ve kelime topa sığsın
    kap.add([g, yazi]);
    kap.setScale(0.3);
    this.top = kap;
    Sesler.nota(700, 0, 0.1, 0.1, "sine");
    this.tweens.add({ targets: kap, y: 230, scale: 1, duration: 450, ease: "Back.Out",
      onComplete: () => {
        if (harf.length === 1) harfiSoyle(harf); else Sesler.soyle(harf);
        this.kilitli = false;
        const dogru = this.kutular.find((k) => k.kutu.cagri === harf && !k.kutu.dolu);
        this.elGoster(dogru || this.yokDugmesi);
      } });
  }

  kutuyaDokun(kap) {
    if (this.bitti || this.kilitli || kap.kutu.dolu) return;
    if (kap.kutu.cagri === this.cekilen) {
      this.kilitli = true;
      kap.kutu.dolu = true;
      // Pul konur
      const pul = this.add.circle(0, 0, 58, Phaser.Utils.Array.GetRandom(PUL_RENKLERI), 0.55).setStrokeStyle(5, 0x2b2b2b);
      kap.add(pul);
      pul.setScale(0);
      this.tweens.add({ targets: pul, scale: 1, duration: 250, ease: "Back.Out" });
      Sesler.pling();
      this.time.delayedCall(250, () => Sesler.soyle(kap.kutu.metin));
      this.ilerlemeArtir(kap.x, kap.y);
      // Satır doldu mu? (çok satırlı kartta "Çinko!")
      const satirlar = new Set(this.kutular.map((k) => k.kutu.satir));
      const satirDolu = this.kutular.filter((k) => k.kutu.satir === kap.kutu.satir).every((k) => k.kutu.dolu);
      if (satirlar.size > 1 && satirDolu && !this.bitti) this.yaziPatlat("Çinko!");
      if (!this.bitti) this.time.delayedCall(1500, () => this.topCek());
    } else {
      this.yanlis(kap);
    }
  }

  yokaBasildi() {
    if (this.bitti || this.kilitli) return;
    const kartta = this.kutular.some((k) => k.kutu.cagri === this.cekilen && !k.kutu.dolu);
    if (!kartta) {
      this.kilitli = true;
      Sesler.pling();
      this.tweens.add({ targets: this.yokDugmesi, scale: 1.1, duration: 140, yoyo: true });
      this.tweens.add({ targets: this.top, x: 1300, alpha: 0, duration: 400 });
      this.time.delayedCall(700, () => this.topCek());
    } else {
      this.yanlis(this.yokDugmesi);
    }
  }

  yanlis(nesne) {
    this.tweens.add({ targets: nesne, angle: { from: -5, to: 5 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => nesne.setAngle(0) });
    this.kalpEksilt();
    this.ipucuGoster(this.kutular.find((k) => k.kutu.cagri === this.cekilen && !k.kutu.dolu) || this.yokDugmesi);
  }

  yaziPatlat(metin, x = 560, y0 = 400, derinlik = 20) {
    const y = doodleYazi(this, x, y0, metin, 80, "mavi").setOrigin(0.5).setDepth(derinlik).setScale(0);
    this.tweens.add({ targets: y, scale: 1, duration: 300, ease: "Back.Out", yoyo: true, hold: 700,
      onComplete: () => y.destroy() });
    Sesler.buyume();
  }

  bitir(basarili) {
    if (basarili && !this.bitti) this.yaziPatlat("Tombala!", 640, 130, 1100); // bitiş penceresinin üstünde
    super.bitir(basarili);
  }

  oyunBitti() {
    for (const k of this.kutular) k.disableInteractive();
    if (this.yokDugmesi) this.yokDugmesi.disableInteractive();
  }
}

miniOyunKaydet("tombala", TombalaSahnesi);
