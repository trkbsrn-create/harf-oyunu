// Oyunun ana kodu: büyük bir ada ve adada gezen ana karakter.

const DUNYA_GENISLIK = 2400;
const DUNYA_YUKSEKLIK = 1600;
const YURUME_HIZI = 260; // saniyede piksel

// Adanın kıyı çizgisi: dalgalı bir oval. Aynı şekil her açılışta aynı çıkar.
function adaNoktalari(olcek) {
  const noktalar = [];
  const merkezX = DUNYA_GENISLIK / 2;
  const merkezY = DUNYA_YUKSEKLIK / 2;
  for (let i = 0; i < 72; i++) {
    const aci = (i / 72) * Math.PI * 2;
    const dalga = 1 + 0.07 * Math.sin(3 * aci) + 0.04 * Math.sin(5 * aci + 1);
    noktalar.push(new Phaser.Geom.Point(
      merkezX + Math.cos(aci) * 1020 * dalga * olcek,
      merkezY + Math.sin(aci) * 640 * dalga * olcek
    ));
  }
  return noktalar;
}

// Ağaç, çalı ve kayaların yerleri
const SUSLER = [
  { tur: "agac", x: 700, y: 520 }, { tur: "agac", x: 1550, y: 430 },
  { tur: "agac", x: 1900, y: 900 }, { tur: "agac", x: 520, y: 1050 },
  { tur: "agac", x: 1250, y: 1220 }, { tur: "agac", x: 1050, y: 470 },
  { tur: "cali", x: 900, y: 820 }, { tur: "cali", x: 1650, y: 1150 },
  { tur: "cali", x: 400, y: 760 }, { tur: "cali", x: 1400, y: 700 },
  { tur: "cali", x: 2000, y: 640 }, { tur: "cali", x: 800, y: 1250 },
  { tur: "kaya", x: 1150, y: 980 }, { tur: "kaya", x: 1800, y: 560 },
  { tur: "kaya", x: 620, y: 650 }, { tur: "kaya", x: 1500, y: 1350 },
];

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

    for (const sus of SUSLER) {
      this.add.image(sus.x, sus.y, sus.tur).setOrigin(0.5, 1).setDepth(sus.y);
    }

    this.cocuk = this.add.image(DUNYA_GENISLIK / 2, DUNYA_YUKSEKLIK / 2 + 120, "cocuk")
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
    const cimen = adaNoktalari(0.88);

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
