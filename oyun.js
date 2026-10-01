// Oyunun ana kodu: büyük bir ada ve adada gezen ana karakter.

const DUNYA_GENISLIK = 6400;
const DUNYA_YUKSEKLIK = 3600;
const YURUME_HIZI = 260; // saniyede piksel
const BASLANGIC_X = DUNYA_GENISLIK / 2;
const BASLANGIC_Y = DUNYA_YUKSEKLIK / 2 + 120;
const SENSOR_MENZILI = 1600; // sandığa bu kadar yaklaşınca aura ve bip başlar

// Adanın kıyı çizgisi: dalgalı bir oval. Aynı şekil her açılışta aynı çıkar.
function adaNoktalari(olcek) {
  const noktalar = [];
  const merkezX = DUNYA_GENISLIK / 2;
  const merkezY = DUNYA_YUKSEKLIK / 2;
  const yaricapX = DUNYA_GENISLIK / 2 - 260;
  const yaricapY = DUNYA_YUKSEKLIK / 2 - 220;
  for (let i = 0; i < 160; i++) {
    const aci = (i / 160) * Math.PI * 2;
    const dalga = 1 + 0.06 * Math.sin(3 * aci) + 0.04 * Math.sin(5 * aci + 1)
      + 0.02 * Math.sin(11 * aci + 2);
    noktalar.push(new Phaser.Geom.Point(
      merkezX + Math.cos(aci) * yaricapX * dalga * olcek,
      merkezY + Math.sin(aci) * yaricapY * dalga * olcek
    ));
  }
  return noktalar;
}

// Ağaç, çalı ve kayaları adaya serpiştirir. Sabit tohumla rastgele seçildiği
// için yerleri her açılışta aynıdır.
function suslerUret() {
  const rastgele = new Phaser.Math.RandomDataGenerator(["harf-adasi"]);
  const cimen = new Phaser.Geom.Polygon(adaNoktalari(0.9));
  const turler = ["agac", "agac", "cali", "cali", "cali", "kaya"];
  const susler = [];
  let deneme = 0;
  while (susler.length < 140 && deneme < 5000) {
    deneme++;
    const x = rastgele.between(0, DUNYA_GENISLIK);
    const y = rastgele.between(0, DUNYA_YUKSEKLIK);
    if (!cimen.contains(x, y)) continue;
    if (Math.hypot(x - BASLANGIC_X, y - BASLANGIC_Y) < 260) continue;
    if (susler.some((s) => Math.hypot(s.x - x, s.y - y) < 190)) continue;
    susler.push({ tur: rastgele.pick(turler), x, y });
  }
  return susler;
}

class AdaSahnesi extends Phaser.Scene {
  constructor() {
    super("AdaSahnesi");
  }

  preload() {
    this.load.svg("cocuk", "gorseller/cocuk.svg");
    this.load.svg("cocuk-adim1", "gorseller/cocuk-adim1.svg");
    this.load.svg("cocuk-adim2", "gorseller/cocuk-adim2.svg");
    this.load.svg("agac-govde", "gorseller/agac-govde.svg");
    this.load.svg("agac-tepe", "gorseller/agac-tepe.svg");
    this.load.svg("cali", "gorseller/cali.svg");
    this.load.svg("kaya", "gorseller/kaya.svg");
    this.load.svg("sandik-kapali", "gorseller/sandik-kapali.svg");
    this.load.svg("sandik-acik", "gorseller/sandik-acik.svg");
    this.load.svg("canta", "gorseller/canta.svg");
    this.load.svg("tohum", "gorseller/tohum.svg");
    for (const ad of ["cicek-kirmizi", "cicek-mor", "cicek-beyaz", "ot", "kelebek", "kus"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.dokulariUret();
    this.denizKur();
    this.adayiCiz();

    // Karakterin yürüyebildiği alan (kumsal dahil, denize girmeden)
    this.yuruyusAlani = new Phaser.Geom.Polygon(adaNoktalari(0.95));

    const susler = suslerUret();
    this.sallananlar = []; // rüzgârda sallanan ağaç tepeleri ve çalılar
    for (const sus of susler) {
      const faz = Phaser.Math.FloatBetween(0, Math.PI * 2);
      if (sus.tur === "agac") {
        this.add.image(sus.x, sus.y, "agac-govde").setOrigin(0.5, 1).setDepth(sus.y);
        // Tepe, gövdenin üst ucundan döner
        const tepe = this.add.image(sus.x, sus.y - 85, "agac-tepe")
          .setOrigin(0.5, 115 / 140).setDepth(sus.y + 0.1);
        this.sallananlar.push({ nesne: tepe, tur: "agac", faz });
      } else {
        const nesne = this.add.image(sus.x, sus.y, sus.tur).setOrigin(0.5, 1).setDepth(sus.y);
        if (sus.tur === "cali") this.sallananlar.push({ nesne, tur: "cali", faz });
      }
    }

    this.sandigiSakla(susler);
    this.cicekleriEk();
    this.kelebekleriKur();
    this.kuslar = [];
    this.time.addEvent({ delay: 7000, loop: true, callback: () => this.kusSurusuGonder() });
    this.bulutGolgeleriKur();
    this.adimSayaci = 0;
    this.tekAdim = false;
    this.donuk = false; // sandık açılırken karakter kısa bir süre durur

    this.cocuk = this.add.image(BASLANGIC_X, BASLANGIC_Y, "cocuk")
      .setOrigin(0.5, 1);
    this.hedef = null;
    this.sensorKur();

    // Kamera karakteri takip eder
    this.cameras.main.setBounds(0, 0, DUNYA_GENISLIK, DUNYA_YUKSEKLIK);
    this.cameras.main.startFollow(this.cocuk, true, 0.1, 0.1);

    // Yön tuşları
    this.tuslar = this.input.keyboard.createCursorKeys();

    // Dokunma / tıklama: karakter dokunulan yere yürür
    this.cantaKur();

    this.input.on("pointerdown", (p) => {
      Sesler.ac();
      if (this.cantaTiklamasi(p)) return;
      if (this.sandikGorundu && !this.sandikAcildi
          && this.sandik.getBounds().contains(p.worldX, p.worldY)) {
        this.sandigiAc();
        return;
      }
      this.hedefBelirle(p.worldX, p.worldY, true);
    });
    this.input.on("pointermove", (p) => {
      if (p.isDown && !this.cantaAcik) this.hedefBelirle(p.worldX, p.worldY, false);
    });
    this.input.keyboard.on("keydown", () => Sesler.ac());
    this.input.keyboard.addCapture("SPACE");
    this.input.keyboard.on("keydown-SPACE", () => this.cantayiAcKapat());
  }

  // ---- Çanta (envanter) ----

  cantaKur() {
    this.cantaAcik = false;
    // Sağ üst köşede her zaman duran çanta düğmesi
    this.cantaDugmesi = this.add.image(1280 - 80, 80, "canta")
      .setScrollFactor(0).setDepth(9000);

    // Çanta açılınca görünen pencere
    const pencere = this.add.container(0, 0).setScrollFactor(0).setDepth(9100).setVisible(false);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0x7a5c3e);
    g.fillRoundedRect(330, 170, 620, 420, 36);
    g.fillStyle(0xf3e2c0);
    g.fillRoundedRect(320, 150, 620, 420, 36);
    g.lineStyle(6, 0x3b2a1a);
    g.strokeRoundedRect(320, 150, 620, 420, 36);
    g.fillStyle(0x3fa7a0);
    g.fillRoundedRect(320, 150, 620, 80, { tl: 36, tr: 36, bl: 0, br: 0 });
    g.strokeRoundedRect(320, 150, 620, 80, { tl: 36, tr: 36, bl: 0, br: 0 });
    // Kutucuklar
    this.kutucuklar = [];
    for (let i = 0; i < Canta.BOYUT; i++) {
      const x = 410 + (i % 4) * 147;
      const y = 315 + Math.floor(i / 4) * 150;
      g.fillStyle(0xe6cfa3);
      g.fillRoundedRect(x - 60, y - 60, 120, 120, 20);
      g.lineStyle(4, 0x3b2a1a, 0.6);
      g.strokeRoundedRect(x - 60, y - 60, 120, 120, 20);
      this.kutucuklar.push({ x, y });
    }
    // Kapatma düğmesi (çarpı)
    g.fillStyle(0xe0533d);
    g.fillCircle(925, 165, 32);
    g.lineStyle(5, 0x3b2a1a);
    g.strokeCircle(925, 165, 32);
    g.lineStyle(8, 0xffffff);
    g.lineBetween(912, 152, 938, 178);
    g.lineBetween(938, 152, 912, 178);
    this.kapatmaAlani = new Phaser.Geom.Circle(925, 165, 36);
    this.pencereAlani = new Phaser.Geom.Rectangle(320, 150, 620, 420);

    const baslik = this.add.text(630, 190, "Çantam", {
      fontFamily: "Andika", fontSize: "46px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8,
    }).setOrigin(0.5);
    this.cantaIcerigi = this.add.container(0, 0);
    pencere.add([g, baslik, this.cantaIcerigi]);
    this.cantaPenceresi = pencere;
  }

  // Dokunuş çantayla ilgiliyse işler ve true döner.
  cantaTiklamasi(p) {
    if (this.cantaAcik) {
      if (this.kapatmaAlani.contains(p.x, p.y) || !this.pencereAlani.contains(p.x, p.y)
          || this.cantaDugmesi.getBounds().contains(p.x, p.y)) {
        this.cantayiAcKapat();
      }
      return true; // çanta açıkken karakter yürümez
    }
    if (this.cantaDugmesi.getBounds().contains(p.x, p.y)
        || this.cocuk.getBounds().contains(p.worldX, p.worldY)) {
      this.cantayiAcKapat();
      return true;
    }
    return false;
  }

  cantayiAcKapat() {
    if (this.donuk) return; // hazine anında çanta açılmaz
    this.cantaAcik = !this.cantaAcik;
    this.hedef = null;
    Sesler.canta(this.cantaAcik);
    if (this.cantaAcik) this.cantaIceriginiCiz();
    this.cantaPenceresi.setVisible(this.cantaAcik);
    if (this.cantaAcik) {
      this.cantaPenceresi.setScale(0.9).setAlpha(0);
      this.tweens.add({ targets: this.cantaPenceresi, scale: 1, alpha: 1, duration: 180, ease: "Back.Out" });
    }
  }

  cantaIceriginiCiz() {
    this.cantaIcerigi.removeAll(true);
    Canta.esyalar.forEach((esya, i) => {
      const k = this.kutucuklar[i];
      if (!k || esya.tur !== "tohum") return;
      const resim = this.add.image(k.x, k.y - 8, "tohum");
      const harf = this.add.text(k.x, k.y + 14, esya.harf, {
        fontFamily: "Andika", fontSize: "38px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 7,
      }).setOrigin(0.5);
      this.cantaIcerigi.add([resim, harf]);
    });
  }

  // Harf tohuma dönüşür ve çantaya uçar; açılmış sandık küçülüp sönükleşir.
  // (Geçici: mikrofon adımında bu, çocuk harfi söyleyince olacak.)
  tohumuKazan(harf, yazi, hale, isik) {
    const kamera = this.cameras.main;
    this.tweens.killTweensOf(yazi);
    const ekranX = yazi.x - kamera.scrollX;
    const ekranY = yazi.y - kamera.scrollY;
    this.tweens.add({ targets: [yazi, hale], scale: 0, alpha: 0, duration: 350,
      onComplete: () => { yazi.destroy(); hale.destroy(); } });
    this.tweens.add({ targets: isik, alpha: 0, duration: 800,
      onComplete: () => { this.tweens.killTweensOf(isik); isik.destroy(); } });

    const tohum = this.add.image(ekranX, ekranY, "tohum")
      .setScrollFactor(0).setDepth(9500).setScale(0);
    this.tweens.chain({
      targets: tohum,
      tweens: [
        { scale: 1.6, duration: 350, ease: "Back.Out" },
        { x: this.cantaDugmesi.x, y: this.cantaDugmesi.y, scale: 0.5, angle: 360,
          duration: 750, ease: "Cubic.In" },
      ],
      onComplete: () => {
        tohum.destroy();
        Sesler.tohum();
        Canta.tohumEkle(harf);
        if (this.cantaAcik) this.cantaIceriginiCiz();
        this.tweens.add({ targets: this.cantaDugmesi, scale: 1.25, duration: 120, yoyo: true });
      },
    });

    // Açılmış sandık adada kalır: küçük ve sönük
    this.tweens.add({ targets: this.sandik, scale: 0.65, alpha: 0.6, duration: 600 });
    this.sandik.setTint(0xc8bca8);
  }

  // Efektlerde kullanılan küçük yıldız ve parıltı resimleri
  dokulariUret() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff);
    const noktalar = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 16 : 7;
      const aci = (i / 10) * Math.PI * 2 - Math.PI / 2;
      noktalar.push({ x: 16 + Math.cos(aci) * r, y: 16 + Math.sin(aci) * r });
    }
    g.fillPoints(noktalar, true);
    g.generateTexture("yildiz", 32, 32);
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(8, 8, 8);
    g.generateTexture("parilti", 16, 16);
    g.clear();
    // Denizdeki küçük dalga kıvrımı
    g.lineStyle(4, 0xffffff, 1);
    const kivrim = [];
    for (let i = 0; i <= 20; i++) {
      kivrim.push({ x: 4 + i * 2, y: 10 + Math.sin((i / 20) * Math.PI * 2) * 5 });
    }
    g.strokePoints(kivrim);
    g.generateTexture("dalga", 48, 20);
    g.destroy();

    // Aura için yumuşak, ortası parlak bir ışık bulutu
    const tuval = this.textures.createCanvas("aura", 256, 256);
    const ctx = tuval.getContext();
    const renk = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    renk.addColorStop(0, "rgba(255, 236, 140, 0.95)");
    renk.addColorStop(0.45, "rgba(255, 214, 90, 0.55)");
    renk.addColorStop(1, "rgba(255, 214, 90, 0)");
    ctx.fillStyle = renk;
    ctx.fillRect(0, 0, 256, 256);
    tuval.refresh();
  }

  // Hazine sensörü: karakterin çevresindeki aura ve bip sesi
  sensorKur() {
    this.aura = this.add.image(this.cocuk.x, this.cocuk.y - 55, "aura").setAlpha(0);
    this.auraFaz = 0;
    this.bipSayaci = 0;
    this.auraParilti = this.add.particles(0, 0, "parilti", {
      follow: this.cocuk, followOffset: { x: 0, y: -55 },
      emitZone: { type: "random", source: new Phaser.Geom.Circle(0, 0, 70) },
      lifespan: 700, frequency: 110, speedY: { min: -40, max: -10 },
      scale: { start: 0.55, end: 0 }, tint: [0xfff3b0, 0xffcf3f, 0xffffff],
      emitting: false,
    });
  }

  sensorGuncelle(fark, yuruyor) {
    if (this.sandikAcildi) return;
    const uzaklik = Phaser.Math.Distance.Between(
      this.cocuk.x, this.cocuk.y, this.sandik.x, this.sandik.y);
    // 0 = çok uzak, 1 = sandığın yanında
    const yakinlik = Phaser.Math.Clamp(1 - (uzaklik - 70) / (SENSOR_MENZILI - 70), 0, 1);

    this.auraFaz += fark * (0.003 + yakinlik * 0.012);
    const nefes = 1 + 0.1 * Math.sin(this.auraFaz);
    this.aura
      .setPosition(this.cocuk.x, this.cocuk.y - 55)
      .setDepth(this.cocuk.depth - 0.5)
      .setAlpha(yakinlik * 0.9)
      .setScale((0.7 + yakinlik * 1.1) * nefes);

    this.auraParilti.setDepth(this.cocuk.depth + 0.5);
    this.auraParilti.emitting = yakinlik > 0.6;

    // Yürürken bip: yaklaştıkça sıklaşır ve incelir
    if (yuruyor && yakinlik > 0) {
      this.bipSayaci += fark;
      if (this.bipSayaci >= 900 - yakinlik * 780) {
        this.bipSayaci = 0;
        Sesler.bip(yakinlik);
      }
    } else {
      this.bipSayaci = 10000; // yürümeye başlayınca ilk bip hemen duyulsun
    }
  }

  // Sandığı başlangıçtan uzak bir çalının arkasına saklar.
  sandigiSakla(susler) {
    const calilar = susler.filter((s) => s.tur === "cali");
    const uzaklik = (s) => Math.hypot(s.x - BASLANGIC_X, s.y - BASLANGIC_Y);
    const cali = calilar.reduce((a, b) =>
      Math.abs(uzaklik(a) - 2000) < Math.abs(uzaklik(b) - 2000) ? a : b);
    this.saklanmaYeri = cali;
    this.sandik = this.add.image(cali.x + 8, cali.y - 24, "sandik-kapali")
      .setOrigin(0.5, 1).setDepth(cali.y - 1).setAlpha(0);
    this.sandikGorundu = false;
    this.sandikAcildi = false;
  }

  // Karakter yaklaşınca sandık çalının arkasından çıkar.
  sandigiGoster() {
    this.sandikGorundu = true;
    Sesler.pling();
    const cali = this.saklanmaYeri;
    this.tweens.add({ targets: this.sandik, alpha: 1, duration: 300 });
    this.tweens.add({
      targets: this.sandik, x: cali.x + 100, y: cali.y + 45,
      duration: 650, ease: "Back.Out",
      onComplete: () => {
        this.sandik.setDepth(this.sandik.y);
        this.sandikZipla = this.tweens.add({
          targets: this.sandik, y: this.sandik.y - 10,
          duration: 380, yoyo: true, repeat: -1, ease: "Sine.InOut",
        });
      },
    });
    this.sandikParilti = this.add.particles(cali.x + 100, cali.y, "parilti", {
      emitZone: { type: "random", source: new Phaser.Geom.Circle(0, 0, 60) },
      lifespan: 900, frequency: 160, speedY: { min: -40, max: -15 },
      scale: { start: 0.7, end: 0 }, tint: [0xfff3b0, 0xffffff, 0xffcf3f],
    }).setDepth(5000);
  }

  // Hazine anı: sandık titrer, açılır, ışık saçar, içinden harf yükselir.
  sandigiAc() {
    this.sandikAcildi = true;
    this.donuk = true;
    this.hedef = null;
    if (this.sandikZipla) this.sandikZipla.stop();
    if (this.sandikParilti) this.sandikParilti.stop();
    this.auraParilti.emitting = false;
    this.tweens.add({ targets: this.aura, alpha: 0, duration: 400 });

    const s = this.sandik;
    this.tweens.killTweensOf(s);
    s.setAlpha(1);
    this.tweens.add({
      targets: s, angle: { from: -7, to: 7 }, duration: 70, yoyo: true, repeat: 5,
      onComplete: () => {
        s.setAngle(0).setTexture("sandik-acik");
        this.hazineEfekti(s.x, s.y - 50);
      },
    });
  }

  hazineEfekti(x, y) {
    Sesler.hazine();
    const kamera = this.cameras.main;
    kamera.stopFollow();
    kamera.pan(x, y - 120, 500, Phaser.Math.Easing.Sine.InOut);
    kamera.flash(300, 255, 245, 200);
    kamera.shake(250, 0.006);

    // Dönen ışık huzmeleri
    const isik = this.add.graphics({ x, y }).setDepth(0).setScale(0); // zemin hizasında
    isik.fillStyle(0xfff3b0, 0.55);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      isik.fillTriangle(0, 0,
        Math.cos(a - 0.12) * 300, Math.sin(a - 0.12) * 300,
        Math.cos(a + 0.12) * 300, Math.sin(a + 0.12) * 300);
    }
    this.tweens.add({ targets: isik, scale: 1, duration: 500, ease: "Back.Out" });
    this.tweens.add({ targets: isik, angle: 360, duration: 8000, repeat: -1 });

    // Saçılan yıldızlar
    this.add.particles(x, y, "yildiz", {
      speed: { min: 220, max: 560 }, angle: { min: 200, max: 340 },
      gravityY: 700, lifespan: 1700, rotate: { start: 0, end: 540 },
      scale: { start: 1, end: 0.2 },
      tint: [0xffcf3f, 0xffffff, 0xff8fb1, 0x8fd3ff, 0x9fe870],
      emitting: false,
    }).setDepth(6000).explode(50);

    // İçinden yükselen harf
    const harf = HARFLER[0].kucuk;
    const hale = this.add.circle(x, y - 210, 110, 0xffffff, 0.6).setDepth(6000).setScale(0);
    const yazi = this.add.text(x, y, harf, {
      fontFamily: "Andika", fontSize: "180px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 14,
    }).setOrigin(0.5).setDepth(6001).setScale(0);
    this.tweens.add({
      targets: yazi, y: y - 210, scale: 1, duration: 900, ease: "Back.Out",
      onComplete: () => {
        this.tweens.add({ targets: yazi, y: y - 225, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
      },
    });
    this.tweens.add({ targets: hale, scale: 1, duration: 900, ease: "Back.Out" });
    this.tweens.add({ targets: hale, alpha: 0.3, duration: 700, yoyo: true, repeat: -1, delay: 900 });

    this.time.delayedCall(1800, () => {
      this.donuk = false;
      kamera.startFollow(this.cocuk, true, 0.05, 0.05);
    });
    this.time.delayedCall(2600, () => this.tohumuKazan(harf, yazi, hale, isik));
  }

  // Yürürken ayak altından çıkan küçük toz bulutu
  tozCikar() {
    const x = this.cocuk.x + Phaser.Math.Between(-12, 12);
    const y = this.cocuk.y - 4;
    const toz = this.add.circle(x, y, 10, 0xd9c79c).setDepth(y - 1);
    this.tweens.add({
      targets: toz, scale: 2.2, alpha: 0, y: y - 12, duration: 420,
      onComplete: () => toz.destroy(),
    });
  }

  // Deniz: kıyıya doğru açılan renkler, gelip giden köpük, kayan dalgalar
  denizKur() {
    const g = this.add.graphics().setDepth(-4);
    g.fillStyle(0xaee2f2);
    g.fillPoints(adaNoktalari(1.1), true);
    g.fillStyle(0xc4ecf7);
    g.fillPoints(adaNoktalari(1.05), true);

    this.kopuk = this.add.graphics().setDepth(-2);
    this.kopukNoktalari = adaNoktalari(1);

    // Dalga kıvrımları: denizde yavaşça kayar, belirip kaybolur
    const kara = new Phaser.Geom.Polygon(adaNoktalari(1.04));
    this.dalgalar = [];
    let deneme = 0;
    while (this.dalgalar.length < 160 && deneme < 4000) {
      deneme++;
      const x = Phaser.Math.Between(0, DUNYA_GENISLIK);
      const y = Phaser.Math.Between(0, DUNYA_YUKSEKLIK);
      if (kara.contains(x, y)) continue;
      const d = this.add.image(x, y, "dalga").setDepth(-3).setAlpha(0);
      this.dalgalar.push({ nesne: d, faz: Phaser.Math.FloatBetween(0, Math.PI * 2),
        hiz: Phaser.Math.FloatBetween(6, 14) });
    }
    this.denizKarasi = new Phaser.Geom.Polygon(adaNoktalari(1.02));

    // Ara sıra güneşte parlayan pırıltılar (sadece ekranda görünen denizde)
    this.time.addEvent({ delay: 180, loop: true, callback: () => this.denizPiriltisi() });
  }

  denizPiriltisi() {
    const gorunen = this.cameras.main.worldView;
    const x = Phaser.Math.Between(gorunen.x, gorunen.right);
    const y = Phaser.Math.Between(gorunen.y, gorunen.bottom);
    if (this.denizKarasi.contains(x, y)) return;
    const p = this.add.image(x, y, "yildiz").setDepth(-3).setScale(0).setAlpha(0.9);
    this.tweens.add({
      targets: p, scale: 0.45, angle: 90, duration: 350, yoyo: true,
      onComplete: () => p.destroy(),
    });
  }

  // Rüzgârda sallanan çiçekler ve ot öbekleri
  cicekleriEk() {
    const rastgele = new Phaser.Math.RandomDataGenerator(["cicekler"]);
    const cimen = new Phaser.Geom.Polygon(adaNoktalari(0.9));
    const turler = ["ot", "ot", "ot", "cicek-kirmizi", "cicek-mor", "cicek-beyaz"];
    let eklenen = 0;
    for (let deneme = 0; deneme < 4000 && eklenen < 500; deneme++) {
      const x = rastgele.between(0, DUNYA_GENISLIK);
      const y = rastgele.between(0, DUNYA_YUKSEKLIK);
      if (!cimen.contains(x, y)) continue;
      const nesne = this.add.image(x, y, rastgele.pick(turler)).setOrigin(0.5, 1).setDepth(y);
      this.sallananlar.push({ nesne, tur: "cicek", faz: rastgele.frac() * Math.PI * 2 });
      eklenen++;
    }
  }

  // Adada gezinen kelebekler
  kelebekleriKur() {
    const ada = new Phaser.Geom.Polygon(adaNoktalari(0.85));
    const renkler = [0xffd23f, 0xff8fb1, 0x8fd3ff, 0xffa94d, 0xc8a2ff];
    this.kelebekAlani = ada;
    this.kelebekler = [];
    while (this.kelebekler.length < 40) {
      const x = Phaser.Math.Between(0, DUNYA_GENISLIK);
      const y = Phaser.Math.Between(0, DUNYA_YUKSEKLIK);
      if (!ada.contains(x, y)) continue;
      const nesne = this.add.image(x, y, "kelebek").setTint(Phaser.Utils.Array.GetRandom(renkler));
      this.kelebekler.push({ nesne, x, y, hedefX: x, hedefY: y,
        faz: Math.random() * Math.PI * 2, hiz: Phaser.Math.Between(35, 60) });
    }
  }

  kelebekleriUcur(zaman, fark) {
    for (const k of this.kelebekler) {
      const dx = k.hedefX - k.x;
      const dy = k.hedefY - k.y;
      const uzaklik = Math.hypot(dx, dy);
      if (uzaklik < 10) {
        // Yakında yeni bir çiçek seç
        const yeniX = k.x + Phaser.Math.Between(-300, 300);
        const yeniY = k.y + Phaser.Math.Between(-200, 200);
        if (this.kelebekAlani.contains(yeniX, yeniY)) {
          k.hedefX = yeniX;
          k.hedefY = yeniY;
        }
      } else {
        const adim = (k.hiz * fark) / 1000;
        k.x += (dx / uzaklik) * adim;
        k.y += (dy / uzaklik) * adim;
      }
      // Kanat çırpma ve hafif inip kalkma
      const kanat = Math.abs(Math.sin(zaman * 0.018 + k.faz));
      k.nesne.setScale(0.25 + kanat * 0.75, 1);
      k.nesne.setPosition(k.x, k.y - 40 + Math.sin(zaman * 0.004 + k.faz) * 8);
      k.nesne.setDepth(k.y + 120);
    }
  }

  // Ekranın bir kenarından öbürüne uçan küçük bir martı sürüsü
  kusSurusuGonder() {
    const gorunen = this.cameras.main.worldView;
    const soldan = Math.random() < 0.5;
    const hizX = (soldan ? 1 : -1) * Phaser.Math.Between(150, 200);
    const hizY = Phaser.Math.Between(-40, 40);
    const baslaX = soldan ? gorunen.x - 100 : gorunen.right + 100;
    const baslaY = Phaser.Math.Between(gorunen.y + 80, gorunen.bottom - 80);
    const aci = Phaser.Math.RadToDeg(Math.atan2(hizY, hizX)) + 90;
    const sayi = Phaser.Math.Between(2, 4);
    for (let i = 0; i < sayi; i++) {
      // V düzeni: lider önde, diğerleri arkada yanlarda
      const geri = i * 60;
      const yan = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 50;
      const x = baslaX - Math.sign(hizX) * geri;
      const y = baslaY + yan;
      const kus = this.add.image(x, y, "kus").setDepth(4700).setAngle(aci).setScale(0.8);
      const golge = this.add.ellipse(x + 60, y + 90, 40, 14, 0x000000, 0.12).setDepth(4600);
      this.kuslar.push({ kus, golge, hizX, hizY, faz: Math.random() * Math.PI * 2 });
    }
  }

  kuslariUcur(zaman, fark) {
    const merkez = this.cameras.main.midPoint;
    this.kuslar = this.kuslar.filter((k) => {
      const sn = fark / 1000;
      k.kus.x += k.hizX * sn;
      k.kus.y += k.hizY * sn;
      k.golge.setPosition(k.kus.x + 60, k.kus.y + 90);
      k.kus.setScale(0.8 * (0.45 + 0.55 * Math.abs(Math.sin(zaman * 0.012 + k.faz))), 0.8);
      if (Math.abs(k.kus.x - merkez.x) > 1600) {
        k.kus.destroy();
        k.golge.destroy();
        return false;
      }
      return true;
    });
  }

  // Görünmeyen bulutların adanın üstünde yavaşça kayan gölgeleri
  bulutGolgeleriKur() {
    const tuval = this.textures.createCanvas("bulut-golge", 512, 256);
    const ctx = tuval.getContext();
    for (const [x, y, r] of [[150, 140, 110], [260, 110, 120], [370, 145, 100], [250, 170, 90]]) {
      const renk = ctx.createRadialGradient(x, y, 0, x, y, r);
      renk.addColorStop(0, "rgba(30, 40, 60, 0.5)");
      renk.addColorStop(1, "rgba(30, 40, 60, 0)");
      ctx.fillStyle = renk;
      ctx.fillRect(0, 0, 512, 256);
    }
    tuval.refresh();
    this.bulutGolgeleri = [];
    for (let i = 0; i < 12; i++) {
      const g = this.add.image(
        Phaser.Math.Between(0, DUNYA_GENISLIK), Phaser.Math.Between(0, DUNYA_YUKSEKLIK),
        "bulut-golge").setDepth(4500).setScale(Phaser.Math.FloatBetween(1.8, 3)).setAlpha(0.45);
      this.bulutGolgeleri.push(g);
    }
  }

  bulutlariKaydir(fark) {
    const sn = fark / 1000;
    for (const g of this.bulutGolgeleri) {
      g.x += 22 * sn;
      g.y += 7 * sn;
      if (g.x > DUNYA_GENISLIK + 800) g.x = -800;
      if (g.y > DUNYA_YUKSEKLIK + 400) g.y = -400;
    }
  }

  // Her karede: köpük kıyıya vurur, dalgalar kayar, ağaçlar ve çalılar sallanır
  canlandir(zaman, fark) {
    const merkezX = DUNYA_GENISLIK / 2;
    const merkezY = DUNYA_YUKSEKLIK / 2;
    this.kopuk.clear();
    for (let i = 0; i < 2; i++) {
      const dalga = (Math.sin(zaman * 0.0012 + i * Math.PI) + 1) / 2; // 0..1
      const olcek = 1.006 + dalga * 0.028;
      this.kopuk.lineStyle(12 - dalga * 6, 0xffffff, 0.95 - dalga * 0.6);
      this.kopuk.strokePoints(this.kopukNoktalari.map((n) => ({
        x: merkezX + (n.x - merkezX) * olcek,
        y: merkezY + (n.y - merkezY) * olcek + 10,
      })), true);
    }

    for (const d of this.dalgalar) {
      d.nesne.x += (d.hiz * fark) / 1000;
      if (d.nesne.x > DUNYA_GENISLIK + 30) d.nesne.x = -30;
      d.nesne.setAlpha(Math.max(0, Math.sin(zaman * 0.0009 + d.faz)) * 0.8);
    }

    // Rüzgâr: yavaş ana salınım ve üstüne küçük titreşim
    const ruzgar = zaman * 0.0013;
    for (const s of this.sallananlar) {
      const salinim = Math.sin(ruzgar + s.faz) + 0.3 * Math.sin(ruzgar * 2.7 + s.faz * 2);
      if (s.tur === "agac") {
        s.nesne.setAngle(salinim * 2.2);
      } else if (s.tur === "cicek") {
        s.nesne.setAngle(salinim * 7);
      } else {
        s.nesne.setScale(1 + salinim * 0.025, 1 - salinim * 0.02);
      }
    }
  }

  adayiCiz() {
    const g = this.add.graphics().setDepth(-1);
    const kum = adaNoktalari(1);
    const cimen = adaNoktalari(0.93);

    // Kartonumsu kalınlık: adanın altında koyu bir kenar
    g.fillStyle(0x7a5c3e);
    g.fillPoints(kum.map((n) => ({ x: n.x, y: n.y + 18 })), true);

    g.fillStyle(0xf6d98b);
    g.fillPoints(kum, true);
    g.lineStyle(6, 0x3b2a1a);
    g.strokePoints(kum, true);

    g.fillStyle(0x9fd87a);
    g.fillPoints(cimen, true);
  }

  hedefBelirle(x, y, isaretGoster) {
    this.hedef = { x, y };
    if (isaretGoster) {
      const isaret = this.add.circle(x, y, 14).setStrokeStyle(4, 0xffffff).setDepth(5000);
      this.tweens.add({
        targets: isaret, scale: 1.8, alpha: 0, duration: 450,
        onComplete: () => isaret.destroy(),
      });
    }
  }

  update(zaman, fark) {
    this.canlandir(zaman, fark);
    this.kelebekleriUcur(zaman, fark);
    this.kuslariUcur(zaman, fark);
    this.bulutlariKaydir(fark);
    let dx = 0;
    let dy = 0;

    if (this.donuk || this.cantaAcik) {
      this.cocuk.setAngle(0).setScale(1).setTexture("cocuk");
      return;
    }

    if (this.tuslar.left.isDown) dx -= 1;
    if (this.tuslar.right.isDown) dx += 1;
    if (this.tuslar.up.isDown) dy -= 1;
    if (this.tuslar.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      this.hedef = null; // tuşlar dokunmaya göre önceliklidir
    } else if (this.hedef) {
      dx = this.hedef.x - this.cocuk.x;
      dy = this.hedef.y - this.cocuk.y;
      if (Math.hypot(dx, dy) < 6) {
        this.hedef = null;
        dx = 0;
        dy = 0;
      }
    }

    const uzunluk = Math.hypot(dx, dy);
    let yuruyor = false;

    if (uzunluk > 0) {
      const adim = (YURUME_HIZI * fark) / 1000;
      const ax = (dx / uzunluk) * adim;
      const ay = (dy / uzunluk) * adim;
      yuruyor = this.ilerle(ax, ay);
      if (!yuruyor) this.hedef = null; // kıyıya dayandı
      if (ax !== 0) this.cocuk.setFlipX(ax < 0);
    }

    // Yürürken adım resimleri sırayla değişir; her adımda toz ve ayak sesi
    this.cocuk.setDepth(this.cocuk.y);
    if (yuruyor) {
      this.adimSayaci += fark;
      if (this.adimSayaci >= 230) {
        this.adimSayaci = 0;
        this.tekAdim = !this.tekAdim;
        this.cocuk.setTexture(this.tekAdim ? "cocuk-adim1" : "cocuk-adim2");
        this.tozCikar();
        Sesler.adim(this.tekAdim);
      }
      // Adımın ortasında gövde hafifçe yükselir, yere basınca iner
      const adimOrani = this.adimSayaci / 230;
      this.cocuk.setScale(1, 1 + Math.sin(adimOrani * Math.PI) * 0.03);
      this.cocuk.setAngle(this.tekAdim ? 1.5 : -1.5);
    } else {
      this.adimSayaci = 230; // durup yeniden yürüyünce ilk adım hemen atılsın
      this.cocuk.setTexture("cocuk").setScale(1).setAngle(0);
    }

    this.sensorGuncelle(fark, yuruyor);
    this.sandikKontrol();
  }

  sandikKontrol() {
    if (this.sandikAcildi) return;
    const uzaklik = Phaser.Math.Distance.Between(
      this.cocuk.x, this.cocuk.y, this.sandik.x, this.sandik.y);
    if (!this.sandikGorundu && uzaklik < 380) {
      this.sandigiGoster();
    } else if (this.sandikGorundu && uzaklik < 70) {
      this.sandigiAc();
    }
  }

  // Adım adadaysa yürü; değilse kıyı boyunca kaymayı dene.
  ilerle(ax, ay) {
    const x = this.cocuk.x;
    const y = this.cocuk.y;
    const alan = this.yuruyusAlani;
    if (alan.contains(x + ax, y + ay)) {
      this.cocuk.setPosition(x + ax, y + ay);
    } else if (ax !== 0 && alan.contains(x + ax, y)) {
      this.cocuk.setPosition(x + ax, y);
    } else if (ay !== 0 && alan.contains(x, y + ay)) {
      this.cocuk.setPosition(x, y + ay);
    } else {
      return false;
    }
    return true;
  }
}

// Yazı tipi yüklendikten sonra oyunu başlat (yoksa yazı yanlış görünür).
document.fonts.load('72px "Andika"').finally(() => {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "oyun",
    width: 1280,
    height: 720,
    backgroundColor: "#8fd2ea",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [AdaSahnesi],
  });
});
