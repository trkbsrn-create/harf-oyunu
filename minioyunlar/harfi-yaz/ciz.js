// Harfi Yaz, 2. ve 3. düzey: Harfi Çiz (arıyı götür). Sahne harfi-yaz/oyun.js'de kurulur.
// Harfin yazılış yolu ekranda durur. Harfin ipucu resmi (a için arı, n için nar...) yolun
// başındadır; çocuk onu parmağıyla yazılış yönünde yol boyunca götürür, arkasında sarı iz
// kalır. Yoldan çok saparsa o çizgi baştan başlar ve bir can gider. Harf 3 kez yazılır.
// Yazılış yönleri dik temel harfe göre (MEB): örneğin "a" önce sağ üstten başlayan, saat
// yönünün tersine yuvarlak, sonra sağda yukarıdan aşağı çizgi.
// Düzeye göre yardım (öğretmenin seçimi): 2) kalın yol, oklar, numaralar 3) ince yol, yalnızca
// başlangıç noktası. (Yalnızca silik iz bırakan en zor hâl kaldırıldı.)

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
  // 2. grup: o sağ üstten saat yönünün tersine; k dikey, sonra kırık çizgi; u aşağı, kıvrılıp
  // yukarı, sonra sağ dikey; r dikey, sonra omuz; ı dikey; m dikey ve iki kemer
  o: [yayNoktalari(640, 400, 65, 70, -60, -420)],
  k: [cizgiNoktalari(600, 250, 600, 470),
    birlestir(cizgiNoktalari(690, 330, 600, 410), cizgiNoktalari(600, 410, 695, 470))],
  u: [birlestir(cizgiNoktalari(585, 330, 585, 415), yayNoktalari(640, 415, 55, 55, 180, 0),
    cizgiNoktalari(695, 415, 695, 330)), cizgiNoktalari(695, 330, 695, 470)],
  r: [cizgiNoktalari(605, 330, 605, 470), yayNoktalari(650, 380, 45, 45, 180, 320)],
  ı: [cizgiNoktalari(640, 330, 640, 470)],
  m: [cizgiNoktalari(570, 330, 570, 470),
    birlestir(yayNoktalari(610, 380, 40, 45, 180, 360), cizgiNoktalari(650, 380, 650, 470)),
    birlestir(yayNoktalari(690, 380, 40, 45, 180, 360), cizgiNoktalari(730, 380, 730, 470))],
  // 3. grup: ü u gibi, sonra iki nokta; s üst kıvrım saat yönünün tersine, alt kıvrım saat yönünde;
  // ö o gibi, sonra iki nokta; y u gibi, sağ çizgi aşağı iner ve sola kıvrılır; d a gibi, çizgi
  // yukarıdan; z üst, çapraz, alt (tek çizgi)
  ü: [birlestir(cizgiNoktalari(585, 330, 585, 415), yayNoktalari(640, 415, 55, 55, 180, 0),
    cizgiNoktalari(695, 415, 695, 330)), cizgiNoktalari(695, 330, 695, 470),
  cizgiNoktalari(605, 286, 605, 300), cizgiNoktalari(675, 286, 675, 300)],
  s: [birlestir(yayNoktalari(640, 365, 50, 35, -20, -270), yayNoktalari(640, 435, 50, 35, -90, 160))],
  ö: [yayNoktalari(640, 400, 65, 70, -60, -420), cizgiNoktalari(612, 286, 612, 300), cizgiNoktalari(668, 286, 668, 300)],
  y: [birlestir(cizgiNoktalari(585, 330, 585, 415), yayNoktalari(640, 415, 55, 55, 180, 0),
    cizgiNoktalari(695, 415, 695, 330)), birlestir(cizgiNoktalari(695, 330, 695, 520), yayNoktalari(655, 520, 40, 40, 0, 150))],
  d: [yayNoktalari(640, 400, 68, 70, -40, -340), cizgiNoktalari(708, 250, 708, 470)],
  z: [birlestir(cizgiNoktalari(585, 330, 695, 330), cizgiNoktalari(695, 330, 585, 470), cizgiNoktalari(585, 470, 695, 470))],
  // 4. grup: c sağ üstten saat yönünün tersine açık yay; ç c ve çengel; b dikey, sonra göbek;
  // g a gibi, sağ çizgi aşağı iner ve sola kıvrılır; ş s ve çengel
  c: [yayNoktalari(645, 400, 62, 70, -40, -320)],
  ç: [yayNoktalari(645, 400, 62, 70, -40, -320), cizgiNoktalari(642, 474, 632, 500)],
  b: [cizgiNoktalari(590, 250, 590, 470), yayNoktalari(645, 400, 55, 70, 160, -160)],
  g: [yayNoktalari(640, 400, 68, 70, -40, -340), birlestir(cizgiNoktalari(708, 330, 708, 520), yayNoktalari(668, 520, 40, 40, 0, 150))],
  ş: [birlestir(yayNoktalari(640, 365, 50, 35, -20, -270), yayNoktalari(640, 435, 50, 35, -90, 160)), cizgiNoktalari(640, 474, 632, 500)],
  // 5. grup: p aşağı uzun dikey, sonra göbek; h uzun dikey, sonra kemer; v tek çizgi; ğ g ve üstünde
  // kavis; f üstte kıvrık, aşağı, sonra yatay çizgi; j aşağı iner, sola kıvrılır, sonra nokta
  p: [cizgiNoktalari(590, 330, 590, 540), yayNoktalari(645, 400, 55, 70, 160, -160)],
  h: [cizgiNoktalari(585, 250, 585, 470), birlestir(yayNoktalari(640, 385, 55, 50, 180, 360), cizgiNoktalari(695, 385, 695, 470))],
  v: [birlestir(cizgiNoktalari(585, 330, 640, 470), cizgiNoktalari(640, 470, 695, 330))],
  ğ: [yayNoktalari(640, 400, 68, 70, -40, -340), birlestir(cizgiNoktalari(708, 330, 708, 520), yayNoktalari(668, 520, 40, 40, 0, 150)),
    yayNoktalari(640, 282, 24, 14, 180, 0)],
  f: [birlestir(yayNoktalari(655, 285, 30, 30, -30, -180), cizgiNoktalari(625, 285, 625, 470)), cizgiNoktalari(595, 340, 670, 340)],
  j: [birlestir(cizgiNoktalari(650, 330, 650, 520), yayNoktalari(615, 520, 35, 35, 0, 150)), cizgiNoktalari(650, 278, 650, 292)],
};

// Büyük harfler (öğretmenin isteği; dik temel harf yazılış sırası, öğretmen kontrol edecek):
// tavan 250, taban 470. A: sol eğik, sağ eğik, orta çizgi; N: sol dikey, çapraz, sağ dikey;
// E: dikey, üst, orta, alt; T: üst çizgi, dikey; İ: dikey, nokta; L: dikey ve alt (tek çizgi).
const BUYUK_HARF_YOLLARI = {
  a: [cizgiNoktalari(640, 250, 570, 470), cizgiNoktalari(640, 250, 710, 470), cizgiNoktalari(593, 398, 687, 398)],
  n: [cizgiNoktalari(580, 250, 580, 470), cizgiNoktalari(580, 250, 700, 470), cizgiNoktalari(700, 250, 700, 470)],
  e: [cizgiNoktalari(590, 250, 590, 470), cizgiNoktalari(590, 250, 690, 250),
    cizgiNoktalari(590, 360, 675, 360), cizgiNoktalari(590, 470, 690, 470)],
  t: [cizgiNoktalari(570, 250, 710, 250), cizgiNoktalari(640, 250, 640, 470)],
  i: [cizgiNoktalari(640, 250, 640, 470), cizgiNoktalari(640, 204, 640, 218)],
  l: [birlestir(cizgiNoktalari(595, 250, 595, 470), cizgiNoktalari(595, 470, 690, 470))],
  // O: tepeden saat yönünün tersine; K: dikey, üst çapraz, alt çapraz; U: tek çizgi;
  // R: dikey, göbek, bacak; I: dikey; M: sol dikey, V, sağ dikey
  o: [yayNoktalari(640, 360, 85, 110, -90, -450)],
  k: [cizgiNoktalari(590, 250, 590, 470), cizgiNoktalari(700, 250, 590, 370), cizgiNoktalari(628, 330, 705, 470)],
  u: [birlestir(cizgiNoktalari(580, 250, 580, 400), yayNoktalari(640, 400, 60, 70, 180, 0),
    cizgiNoktalari(700, 400, 700, 250))],
  r: [cizgiNoktalari(590, 250, 590, 470),
    birlestir(cizgiNoktalari(590, 250, 645, 250), yayNoktalari(645, 305, 55, 55, -90, 90), cizgiNoktalari(645, 360, 590, 360)),
    cizgiNoktalari(630, 360, 705, 470)],
  ı: [cizgiNoktalari(640, 250, 640, 470)],
  m: [cizgiNoktalari(570, 250, 570, 470),
    birlestir(cizgiNoktalari(570, 250, 640, 400), cizgiNoktalari(640, 400, 710, 250)), cizgiNoktalari(710, 250, 710, 470)],
  // Ü: U ve iki nokta; S: üst ve alt kıvrım; Ö: O ve iki nokta; Y: sol çapraz, sağ çapraz, dikey;
  // D: dikey, göbek; Z: üst, çapraz, alt
  ü: [birlestir(cizgiNoktalari(580, 250, 580, 400), yayNoktalari(640, 400, 60, 70, 180, 0),
    cizgiNoktalari(700, 400, 700, 250)), cizgiNoktalari(605, 204, 605, 218), cizgiNoktalari(675, 204, 675, 218)],
  s: [birlestir(yayNoktalari(640, 305, 60, 55, -20, -270), yayNoktalari(640, 415, 60, 55, -90, 160))],
  ö: [yayNoktalari(640, 360, 85, 110, -90, -450), cizgiNoktalari(610, 204, 610, 218), cizgiNoktalari(670, 204, 670, 218)],
  y: [cizgiNoktalari(570, 250, 640, 360), cizgiNoktalari(710, 250, 640, 360), cizgiNoktalari(640, 360, 640, 470)],
  d: [cizgiNoktalari(590, 250, 590, 470),
    birlestir(cizgiNoktalari(590, 250, 630, 250), yayNoktalari(630, 360, 80, 110, -90, 90), cizgiNoktalari(630, 470, 590, 470))],
  z: [birlestir(cizgiNoktalari(575, 250, 705, 250), cizgiNoktalari(705, 250, 575, 470), cizgiNoktalari(575, 470, 705, 470))],
  // C açık yay; Ç C ve çengel; B dikey, üst ve alt göbek; G yay ve içe çizgi; Ş S ve çengel
  c: [yayNoktalari(650, 360, 85, 110, -40, -320)],
  ç: [yayNoktalari(650, 360, 85, 110, -40, -320), cizgiNoktalari(648, 474, 638, 500)],
  b: [cizgiNoktalari(590, 250, 590, 470),
    birlestir(cizgiNoktalari(590, 250, 640, 250), yayNoktalari(640, 302, 48, 52, -90, 90), cizgiNoktalari(640, 354, 590, 354)),
    birlestir(cizgiNoktalari(590, 354, 645, 354), yayNoktalari(645, 412, 55, 58, -90, 90), cizgiNoktalari(645, 470, 590, 470))],
  g: [birlestir(yayNoktalari(650, 360, 85, 110, -40, -340), cizgiNoktalari(730, 398, 730, 360), cizgiNoktalari(730, 360, 672, 360))],
  ş: [birlestir(yayNoktalari(640, 305, 60, 55, -20, -270), yayNoktalari(640, 415, 60, 55, -90, 160)), cizgiNoktalari(640, 474, 632, 500)],
  // P dikey ve göbek; H iki dikey, orta çizgi; V tek çizgi; Ğ G ve kavis; F dikey, üst, orta; J aşağı, kıvrık
  p: [cizgiNoktalari(590, 250, 590, 470),
    birlestir(cizgiNoktalari(590, 250, 640, 250), yayNoktalari(640, 305, 55, 55, -90, 90), cizgiNoktalari(640, 360, 590, 360))],
  h: [cizgiNoktalari(585, 250, 585, 470), cizgiNoktalari(695, 250, 695, 470), cizgiNoktalari(585, 360, 695, 360)],
  v: [birlestir(cizgiNoktalari(570, 250, 640, 470), cizgiNoktalari(640, 470, 710, 250))],
  ğ: [birlestir(yayNoktalari(650, 360, 85, 110, -40, -340), cizgiNoktalari(730, 398, 730, 360), cizgiNoktalari(730, 360, 672, 360)),
    yayNoktalari(650, 212, 24, 14, 180, 0)],
  f: [cizgiNoktalari(590, 250, 590, 470), cizgiNoktalari(590, 250, 700, 250), cizgiNoktalari(590, 355, 680, 355)],
  j: [birlestir(cizgiNoktalari(680, 250, 680, 420), yayNoktalari(630, 420, 50, 50, 0, 160))],
};

// Her turda küçük mü büyük mü yazılacak: 2. tur büyük harf (küçük, BÜYÜK, küçük)
function harfiYazYollari(harf, buyuk) {
  const tablo = buyuk && BUYUK_HARF_YOLLARI[harf] ? BUYUK_HARF_YOLLARI : HARF_YOLLARI;
  return tablo[harf] || HARF_YOLLARI.a;
}

// Üstteki "Yaz:" panelindeki harfi küçük/büyük yapar
function harfiYazPaneli(sahne, buyuk) {
  const yazi = sahne.hedefPaneli.list[2];
  yazi.setText(buyuk ? sahne.harf.toLocaleUpperCase("tr-TR") : sahne.harf);
  boyaliOrtala(yazi);
  sahne.tweens.add({ targets: sahne.hedefPaneli, scale: 1.15, duration: 160, yoyo: true });
}

const HARFI_CIZ_SEVIYELERI = {
  2: { yol: 46, oklar: true, numara: true, baslangic: true, tolerans: 44, sapma: 100 },
  3: { yol: 28, oklar: false, numara: false, baslangic: true, tolerans: 36, sapma: 85 },
};
const HARFI_CIZ_TEKRAR = 3;

class HarfiCizSahnesi extends MiniOyunSahnesi {
  preload() {
    super.preload();
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = HARFI_CIZ_SEVIYELERI[this.seviye] || HARFI_CIZ_SEVIYELERI[2];
    this.kalpleriKur(3);
    this.ilerlemeKur(HARFI_CIZ_TEKRAR);
    this.hedefPaneli = this.hedefPaneliKur("Yaz:");
    this.yollar = harfiYazYollari(this.harf, false);

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
    this.buyuk = this.ilerleme === 1; // 2. tur büyük harf
    this.yollar = harfiYazYollari(this.harf, this.buyuk);
    harfiYazPaneli(this, this.buyuk);
    this.cizgiNo = 0;
    this.nokta = 0;
    this.yolCiz();
    this.izCiz();
    this.tasiyiciyiKoy();
    // İlk seferde gösteren el ilk çizgi boyunca sürükler (bir kez)
    const ilk = this.yollar[0];
    if (ilk.length > 4) {
      const adim = Math.max(1, Math.floor(ilk.length / 12));
      harfiYazEli(this, "ciz", () => this.elSurukleGoster(ilk.filter((n, i) => i % adim === 0 || i === ilk.length - 1)));
    }
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
    // Çizginin bittiği yerde küçük parıltı
    const son = this.yollar[this.cizgiNo][this.yollar[this.cizgiNo].length - 1];
    this.add.particles(son.x, son.y, "parilti", {
      speed: { min: 60, max: 160 }, lifespan: 380, scale: { start: 0.9, end: 0 },
      tint: [0xffe680, 0xffffff], emitting: false,
    }).setDepth(20).explode(8);
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
    this.ilerlemeArtir(640, 360);
    if (!this.bitti) this.time.delayedCall(1200, () => this.harfiBaslat());
  }

  oyunBitti() {
    this.surukleniyor = false;
  }
}

