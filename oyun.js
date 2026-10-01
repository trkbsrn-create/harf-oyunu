// Oyunun ana kodu: büyük bir ada ve adada gezen ana karakter.

const DUNYA_GENISLIK = 6400;
const DUNYA_YUKSEKLIK = 3600;
const YURUME_HIZI = 260; // saniyede piksel
const BASLANGIC_X = DUNYA_GENISLIK / 2;
const BASLANGIC_Y = DUNYA_YUKSEKLIK / 2 + 120;

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
    this.load.svg("agac", "gorseller/agac.svg");
    this.load.svg("cali", "gorseller/cali.svg");
    this.load.svg("kaya", "gorseller/kaya.svg");
  }

  create() {
    this.adayiCiz();

    // Karakterin yürüyebildiği alan (kumsal dahil, denize girmeden)
    this.yuruyusAlani = new Phaser.Geom.Polygon(adaNoktalari(0.95));

    for (const sus of suslerUret()) {
      this.add.image(sus.x, sus.y, sus.tur).setOrigin(0.5, 1).setDepth(sus.y);
    }

    this.cocuk = this.add.image(BASLANGIC_X, BASLANGIC_Y, "cocuk")
      .setOrigin(0.5, 1);
    this.hedef = null;

    // Kamera karakteri takip eder
    this.cameras.main.setBounds(0, 0, DUNYA_GENISLIK, DUNYA_YUKSEKLIK);
    this.cameras.main.startFollow(this.cocuk, true, 0.1, 0.1);

    // Yön tuşları
    this.tuslar = this.input.keyboard.createCursorKeys();

    // Dokunma / tıklama: karakter dokunulan yere yürür
    this.input.on("pointerdown", (p) => this.hedefBelirle(p.worldX, p.worldY, true));
    this.input.on("pointermove", (p) => {
      if (p.isDown) this.hedefBelirle(p.worldX, p.worldY, false);
    });
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
    let dx = 0;
    let dy = 0;

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

    // Yürürken hafif sallanma
    this.cocuk.setAngle(yuruyor ? Math.sin(zaman / 70) * 5 : 0);
    this.cocuk.setDepth(this.cocuk.y);
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
    backgroundColor: "#bfe8f5",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [AdaSahnesi],
  });
});
