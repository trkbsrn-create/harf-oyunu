// Mini oyun: Harfi Çiz (arıyı götür)
// Harfin yazılış yolu ekranda durur. Harfin ipucu resmi (a için arı, n için nar...) yolun
// başındadır; çocuk onu parmağıyla yazılış yönünde yol boyunca götürür, arkasında sarı iz
// kalır. Yoldan çok saparsa o çizgi baştan başlar ve bir can gider. Harf 3 kez yazılır.
// Yazılış yönleri dik temel harfe göre (MEB): örneğin "a" önce sağ üstten başlayan, saat
// yönünün tersine yuvarlak, sonra sağda yukarıdan aşağı çizgi.
// Seviye arttıkça yardım azalır: 1) kalın yol, oklar, numaralar 2) ince yol, yalnızca
// başlangıç noktası 3) yalnızca silik iz.

// Yol noktaları (ekran koordinatı). Satır çizgileri: üst 330, taban 470, uzun harf 250.
function cizgiNoktalari(x1, y1, x2, y2) {
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 8));
  return Array.from({ length: n + 1 }, (_, i) => ({ x: x1 + ((x2 - x1) * i) / n, y: y1 + ((y2 - y1) * i) / n }));
}

// Elips yayı: bas ve bit derece (ekranda y aşağı; azalan açı = saat yönünün tersi)
function yayNoktalari(cx, cy, rx, ry, bas, bit) {
  const uzunluk = (Math.abs(bit - bas) * Math.PI / 180) * Math.max(rx, ry);
  const n = Math.max(3, Math.round(uzunluk / 8));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((bas + ((bit - bas) * i) / n) * Math.PI) / 180;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });
}

function birlestir(...parcalar) {
  return parcalar.reduce((tum, p) => tum.concat(tum.length ? p.slice(1) : p), []);
}

const HARF_YOLLARI = {
  a: [yayNoktalari(640, 400, 68, 70, -40, -340), cizgiNoktalari(708, 330, 708, 470)],
  n: [cizgiNoktalari(585, 330, 585, 470),
    birlestir(yayNoktalari(640, 385, 55, 50, 180, 360), cizgiNoktalari(695, 385, 695, 470))],
  e: [birlestir(cizgiNoktalari(575, 400, 705, 400), yayNoktalari(640, 400, 65, 70, 0, -300))],
  t: [birlestir(cizgiNoktalari(625, 260, 625, 440), yayNoktalari(655, 440, 30, 30, 180, 90)),
    cizgiNoktalari(590, 330, 680, 330)],
  i: [cizgiNoktalari(640, 330, 640, 470), cizgiNoktalari(640, 278, 640, 292)],
  l: [birlestir(cizgiNoktalari(630, 250, 630, 440), yayNoktalari(660, 440, 30, 30, 180, 90))],
};

const HARFI_CIZ_SEVIYELERI = {
  1: { yol: 46, oklar: true, numara: true, baslangic: true, tolerans: 44, sapma: 100 },
  2: { yol: 28, oklar: false, numara: false, baslangic: true, tolerans: 36, sapma: 85 },
  3: { yol: 8, oklar: false, numara: false, baslangic: false, tolerans: 50, sapma: 100, silik: true },
};
const HARFI_CIZ_TEKRAR = 3;

class HarfiCizSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("harfi-ciz");
  }

  preload() {
    super.preload();
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = HARFI_CIZ_SEVIYELERI[this.seviye] || HARFI_CIZ_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(HARFI_CIZ_TEKRAR);
    this.hedefPaneliKur("Yaz:");
    this.yollar = HARF_YOLLARI[this.harf] || HARF_YOLLARI.a;

    // Defter satır çizgileri
    const satir = this.add.graphics().setDepth(1);
    satir.lineStyle(3, 0xe0533d, 0.35);
    for (const y of [250, 330, 470]) {
      for (let x = 420; x < 860; x += 24) satir.lineBetween(x, y, x + 12, y);
    }

    this.yolCizim = this.add.graphics().setDepth(2);
    this.izCizim = this.add.graphics().setDepth(3);
    this.isaretler = this.add.container(0, 0).setDepth(4);
    const resim = (HARFLER.find((h) => h.kucuk === this.harf) || {}).resim || "ari";
    this.tasiyici = this.add.image(0, 0, resim).setDepth(10).setScale(0.6).setVisible(false);
    this.surukleniyor = false;

    this.input.on("pointerdown", (p) => {
      if (this.bitti || !this.tasiyici.visible) return;
      if (Phaser.Math.Distance.Between(p.x, p.y, this.tasiyici.x, this.tasiyici.y) < 75) {
        this.surukleniyor = true;
        // Nokta gibi çok kısa çizgi ("i"nin noktası): dokunmak yeter
        if (this.yollar[this.cizgiNo].length <= 4) this.cizgiBitti();
      }
    });
    this.input.on("pointermove", (p) => {
      if (this.surukleniyor && !this.bitti) this.ilerle(p);
    });
    this.input.on("pointerup", () => { this.surukleniyor = false; });

    this.time.delayedCall(400, () => this.harfiTanit(() => this.harfiBaslat()));
  }

  // Harf baştan: iz temizlenir, ilk çizgi
  harfiBaslat() {
    if (this.bitti) return;
    this.cizgiNo = 0;
    this.nokta = 0;
    this.yolCiz();
    this.izCiz();
    this.tasiyiciyiKoy();
  }

  // Silik yol, oklar, numaralar, başlangıç noktası (seviyeye göre)
  yolCiz() {
    const g = this.yolCizim;
    g.clear();
    this.isaretler.removeAll(true);
    const ayar = this.ayar;
    this.yollar.forEach((yol, i) => {
      g.lineStyle(ayar.yol, 0xddd6c6, ayar.silik ? 0.6 : 1);
      g.strokePoints(yol, false);
      g.fillStyle(0xddd6c6, ayar.silik ? 0.6 : 1);
      for (const n of [yol[0], yol[yol.length - 1]]) g.fillCircle(n.x, n.y, ayar.yol / 2);
      if (ayar.oklar) {
        // Yol boyunca yön okları
        for (let j = 6; j < yol.length - 3; j += 8) {
          const a = Phaser.Math.Angle.Between(yol[j - 1].x, yol[j - 1].y, yol[j + 1].x, yol[j + 1].y);
          const ok = this.add.triangle(yol[j].x, yol[j].y, 0, -7, 14, 0, 0, 7, 0xe0533d).setRotation(a);
          this.isaretler.add(ok);
        }
      }
    });
  }

  // Taşıyıcı (resim) şu anki çizginin başına; seviye izin veriyorsa yeşil başlangıç noktası
  // ve çizginin sıra numarası (yalnızca sıradaki çizginin; üst üste binmesin)
  tasiyiciyiKoy() {
    const yol = this.yollar[this.cizgiNo];
    if (this.baslangicNoktasi) this.baslangicNoktasi.destroy();
    if (this.numara) this.numara.destroy();
    if (this.ayar.numara && this.yollar.length > 1) {
      const n = yol[0];
      const daire = this.add.circle(0, 0, 16, 0xffe680).setStrokeStyle(3, 0x2b2b2b);
      const yazi = this.add.text(0, 0, String(this.cizgiNo + 1), {
        fontFamily: "Andika", fontSize: "22px", color: "#2b2b2b",
      }).setOrigin(0.5);
      this.numara = this.add.container(n.x - 62, n.y - 10, [daire, yazi]).setDepth(11);
    }
    if (this.ayar.baslangic) {
      this.baslangicNoktasi = this.add.circle(yol[0].x, yol[0].y, 12, 0x8fd16a).setStrokeStyle(3, 0x2b2b2b).setDepth(5);
    }
    this.tasiyici.setPosition(yol[0].x, yol[0].y).setVisible(true).setScale(0);
    this.tweens.add({ targets: this.tasiyici, scale: 0.6, duration: 250, ease: "Back.Out" });
  }

  // Bitmiş çizgiler ve şu anki çizginin gidilen kısmı sarı iz
  izCiz() {
    const g = this.izCizim;
    g.clear();
    g.lineStyle(16, 0xffcf3f, 1);
    for (let i = 0; i < this.cizgiNo; i++) g.strokePoints(this.yollar[i], false);
    if (this.cizgiNo < this.yollar.length && this.nokta > 0) {
      g.strokePoints(this.yollar[this.cizgiNo].slice(0, this.nokta + 1), false);
    }
  }

  // Parmak yol boyunca ileri gider; geri gitmek ya da atlamak sayılmaz (yazılış yönü)
  ilerle(p) {
    const yol = this.yollar[this.cizgiNo];
    let enIyi = this.nokta;
    let enYakin = Infinity;
    for (let j = this.nokta; j <= Math.min(this.nokta + 10, yol.length - 1); j++) {
      const d = Phaser.Math.Distance.Between(p.x, p.y, yol[j].x, yol[j].y);
      if (d < enYakin) {
        enYakin = d;
        enIyi = j;
      }
    }
    if (enYakin < this.ayar.tolerans) {
      if (enIyi > this.nokta) {
        const onceki = yol[this.nokta];
        this.nokta = enIyi;
        this.tasiyici.setPosition(yol[enIyi].x, yol[enIyi].y);
        if (Math.abs(yol[enIyi].x - onceki.x) > 1) this.tasiyici.setFlipX(yol[enIyi].x < onceki.x);
        this.izCiz();
        if (this.nokta >= yol.length - 1) this.cizgiBitti();
      }
    } else if (Phaser.Math.Distance.Between(p.x, p.y, yol[this.nokta].x, yol[this.nokta].y) > this.ayar.sapma) {
      this.kaydi();
    }
  }

  // Yoldan saptı: bu çizgi baştan, bir can gider
  kaydi() {
    this.surukleniyor = false;
    this.nokta = 0;
    this.izCiz();
    this.kalpEksilt();
    if (!this.bitti) this.tasiyiciyiKoy();
  }

  cizgiBitti() {
    this.surukleniyor = false;
    this.nokta = 0;
    this.cizgiNo++;
    this.izCiz();
    if (this.cizgiNo < this.yollar.length) {
      Sesler.nota(880, 0, 0.12, 0.12, "sine");
      this.tasiyiciyiKoy();
      return;
    }
    // Harf bitti
    this.tasiyici.setVisible(false);
    if (this.baslangicNoktasi) this.baslangicNoktasi.destroy();
    if (this.numara) this.numara.destroy();
    Sesler.pling();
    harfiSoyle(this.harf);
    this.tweens.add({ targets: this.izCizim, alpha: 0.4, duration: 150, yoyo: true, repeat: 2 });
    this.ilerlemeArtir();
    if (!this.bitti) this.time.delayedCall(1200, () => this.harfiBaslat());
  }

  oyunBitti() {
    this.surukleniyor = false;
  }
}

miniOyunKaydet("harfi-ciz", HarfiCizSahnesi);
