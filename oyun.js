// Oyunun ana kodu: büyük bir ada ve adada gezen ana karakter.

// Oyunun sürümü: her güncellemede (çekme isteği numarasıyla) artırılır. Karşılama
// ekranının sağ üstünde görünür; öğretmen son güncellemenin gelip gelmediğini anlar.
const SURUM = 134;

const DUNYA_GENISLIK = 6400;
// Dünya adadan uzun: altta iskele ve su tesisi için geniş deniz var. Ada, üstteki
// 6400x3600'lük alanın ortasındadır (ADA_YUKSEKLIK).
const DUNYA_YUKSEKLIK = 4200;
const ADA_YUKSEKLIK = 3600;
const YURUME_HIZI = 260; // saniyede piksel
const BASLANGIC_X = DUNYA_GENISLIK / 2;
const BASLANGIC_Y = ADA_YUKSEKLIK / 2 + 120;
// Tarla: karakterin başladığı yerin hemen üstünde; 6 kare yan yana, oyun açılınca tamamı
// ekranda görünür (gorseller/tarla.svg, 870x220).
// Kareler: sol üst köşeler (45 + 132i, 52), her biri 118x104.
const TARLA_X = BASLANGIC_X - 435;
const TARLA_Y = BASLANGIC_Y - 330;
// Bu alanda süs yok. Alt pay büyük: ağaçlar tabanından yukarı uzanır, tarlayı örtmesin.
const TARLA_ALANI = new Phaser.Geom.Rectangle(TARLA_X - 60, TARLA_Y - 60, 870 + 120, 220 + 60 + 240);

// Tırmanma ve inme: karakter arkası dönük (cocuk-tirman.svg), sırığa sarılmış; her
// basamakta öbür kolu yukarı uzanır (resim yatay çevrilir), çekinip bir basamak çıkar ya
// da iner, kısa bir an durur. hedefY'ye varınca bitince() çağrılır.
const TIRMANMA_BASAMAGI = 34;
function tirmanmaHareketi(sahne, cocuk, hedefY, bitince) {
  const merkezX = cocuk.x;
  let sag = false;
  cocuk.setTexture("cocuk-tirman").setAngle(0).setScale(1);
  const basamak = () => {
    const kalan = hedefY - cocuk.y;
    if (Math.abs(kalan) < 1) {
      cocuk.setX(merkezX).setFlipX(false);
      bitince();
      return;
    }
    sag = !sag;
    cocuk.setTexture("cocuk-tirman").setFlipX(sag);
    Sesler.adim(sag);
    sahne.tweens.add({
      targets: cocuk,
      y: cocuk.y + Math.sign(kalan) * Math.min(TIRMANMA_BASAMAGI, Math.abs(kalan)),
      x: merkezX + (sag ? 3 : -3),
      duration: 240, ease: kalan < 0 ? "Quad.Out" : "Quad.In",
      onComplete: () => sahne.time.delayedCall(90, basamak),
    });
  };
  basamak();
}
// Su arıtma tesisi: başlangıç yerinin güneyinde, alt kıyıda (gorseller/su-tesisi.svg,
// 240x(364 + ISKELE_EK)). TESIS_Y resmin üst kenarı; üstteki uzun iskele kıyıdan gelir,
// karakter iskelede yürüyebilir. ISKELE_EK araclar/doodle_ciz.py'deki ile aynı olmalı.
const TESIS_X = BASLANGIC_X;
const TESIS_Y = 3240;
const ISKELE_EK = 560;
const ISKELE_ALANI = new Phaser.Geom.Rectangle(TESIS_X - 22, TESIS_Y - 40, 44, 128 + ISKELE_EK);
const ISKELE_BASI = { x: TESIS_X, y: TESIS_Y - 15 };
const ISKELE_SONU = { x: TESIS_X, y: TESIS_Y + ISKELE_EK + 82 };
const TESIS_ALANI = new Phaser.Geom.Rectangle(TESIS_X - 160, TESIS_Y - 260, 320, 600); // süs yok
// Harf varilleri (gorseller/varil.svg; gövdenin üst ortası resimde (52, 14)). Her harfin
// varili, o harfin tohumu tarlaya ekilince belirir. Güvertedeki küçük varillerin yerleri
// su-tesisi.svg'deki boru ağızlarıyla, paneldekiler tesis-pencere.svg'dekilerle aynı.
// Yelkenli: iskelenin sağındaki kumsalda kızakta durur; adadan kurtulmak için parçaları
// toplanır. Bütün yelkenli resimleri aynı 680x440 tuvalde (araclar/doodle_ciz.py), sol üst
// köşeleri (YELKENLI_X, YELKENLI_Y). Her harfin parçası (öğretmenin kararı) ve harf
// yuvarlağının tuvaldeki yeri. Parça takılmadan önce silik (kesik çizgili) görünür.
const YELKENLI_X = TESIS_X + 460;
const YELKENLI_Y = 2910;
// kutu: parçanın tuvaldeki yeri (x, y, en, boy; doodle_ciz.py'deki YELKENLI_KUTU ile aynı)
const YELKENLI_PARCALARI = [
  { harf: "a", ad: "govde", x: 250, y: 325, kutu: [70, 285, 360, 80] },
  { harf: "n", ad: "direk", x: 295, y: 130, kutu: [246, 55, 10, 230] },
  { harf: "e", ad: "bayrak", x: 320, y: 20, kutu: [256, 21, 46, 48] },
  { harf: "t", ad: "dumen", x: 490, y: 335, kutu: [428, 300, 30, 70] },
  { harf: "i", ad: "kurek", x: 20, y: 310, kutu: [26, 260, 96, 128] },
  { harf: "l", ad: "yelken", x: 320, y: 230, kutu: [262, 70, 100, 200] },
];
// Yelkenli kartına dokununca karakter buraya (kızağın soluna, kumsala) yürür
const YELKENLI_DURAK = { x: YELKENLI_X - 30, y: YELKENLI_Y + 310 };
const YELKENLI_ALANI = new Phaser.Geom.Rectangle(YELKENLI_X - 60, YELKENLI_Y - 60, 800, 520); // süs yok
const VARIL_HARFLERI = HARFLER.filter((h) => h.grup === 1).map((h) => h.kucuk);
const VARIL_ORTA = { x: 52 / 120, y: 14 / 150 };
const VARIL_YERI = (i) => ({ x: TESIS_X - 120 + 36 + 34 * i, y: TESIS_Y + ISKELE_EK + 262 });
const PANEL_VARIL_YERI = (i) => ({ x: 290 + 150 + 88 * i, y: 120 + 212 });
const PANEL_VARIL_OLCEK = 0.82;
const SENSOR_MENZILI = 1600; // sandığa bu kadar yaklaşınca bip sesi başlar
// Hazine pusulası: dış halka her zaman silik yanar; ortanca halka sandığa bu kadar
// yaklaşınca (yaklaşık bir buçuk ekran), iç halka bu kadar yaklaşınca (yarım ekran) yanar.
const PUSULA_ORTA = 1900;
const PUSULA_YAKIN = 640;
const SANDIK_CIKMA_UZAKLIGI = 110; // sandık ancak saklandığı yerin bu kadar yanında çıkar
// "Oyunu yeniden başlat" deyince sayfa yenilenir; bu tek seferlik not karşılama ekranını atlatır
const HEMEN_BASLA = "harfAvcisiHemenBasla";
// Uzatılamayan ünsüzler ("t"): ilk aşamada bu kadar net ses yeter (ms);
// güç aşamasında harf bu kadar ayrı kısa sesle dolar
const KISA_SES_SURESI = 120;
// Tohum her damlada bir aşama büyür: 0 ekili tohum, 1 filiz, 2 küçük ağaç, 3 gökyüzüne
// uzanan fasulye sırığı (tepesi bulutlarda)
const BUYUME_ASAMASI = 3;
const BITKI_RESIMLERI = [null, "bitki-filiz", "bitki-fidan", "bitki-sirik"];
// Adadaki sırık kısa ve yukarı doğru solar; karakter bu kadar tırmanıp gökyüzünde kaybolur
const SIRIK_TIRMANMA = 330;
// Bulutların üstünde karakterin yürüyebildiği bant (ekran koordinatı)
const BULUT_YURUME = new Phaser.Geom.Rectangle(80, 500, 1120, 150);
// Sırıkta karakterin ayağının bulut zemininin üstüne çıktığı yer (ekran y'si)
const BULUT_UST = 470;
const KESIK_SES_ADIMI = 6;

// ---- Doodle yazılar ----
// Harflerin biçimi değişmez (Andika, dik temel harf). Yazının kenarı titrek kalem gibi
// oynar; başlık, düğme ve pencere yazılarının içi ayrıca boya kalemiyle taranır.
// Öğretilen harfler (sandık harfi, çantadaki harfler) taranmaz, sadece titrer.
const KALEM_RENGI = "#2b2b2b";
const TARAMA_RENKLERI = {
  beyaz: ["#ffffff", "#e9e2d0"],
  mavi: ["#c9ecff", "#7cc4ef"],
};
const taramaDesenleri = {};

// Boya kalemi taraması: çapraz çizgili küçük bir kare, yazının içine döşenir
function taramaDeseni(ad) {
  if (!taramaDesenleri[ad]) {
    const [zemin, cizgi] = TARAMA_RENKLERI[ad];
    const kare = document.createElement("canvas");
    kare.width = 8;
    kare.height = 8;
    const c = kare.getContext("2d");
    c.fillStyle = zemin;
    c.fillRect(0, 0, 8, 8);
    c.strokeStyle = cizgi;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(-2, 10); c.lineTo(10, -2); // döşenince kesintisiz devam eden çizgiler
    c.moveTo(-2, 2); c.lineTo(2, -2);
    c.moveTo(6, 10); c.lineTo(10, 6);
    c.stroke();
    taramaDesenleri[ad] = c.createPattern(kare, "repeat");
  }
  return taramaDesenleri[ad];
}

// Yazıyı titrek kalem çizgisi gibi oynatır (piksel: en çok ne kadar kayacağı).
// Yazının resmi bir kez, oluşturulurken bükülür. Aynı yazı ve boyut hep aynı
// şekilde bükülür; böylece sandık harfinin sarı dolgusu harfin tam üstüne oturur.
function titret(yazi, piksel) {
  const tuval = yazi.canvas;
  const en = tuval.width;
  const boy = tuval.height;
  if (!en || !boy) return yazi;
  const c = tuval.getContext("2d");
  const kaynak = c.getImageData(0, 0, en, boy).data;
  const hedef = c.createImageData(en, boy);

  // Yumuşak gürültü: 22 piksellik ızgaranın köşelerine rastgele kayma, arası yumuşak geçiş
  const HUCRE = 22;
  const sx = Math.ceil(en / HUCRE) + 2;
  const sy = Math.ceil(boy / HUCRE) + 2;
  const rastgele = new Phaser.Math.RandomDataGenerator([`${yazi.text}-${en}-${boy}`]);
  const kx = [];
  const ky = [];
  for (let i = 0; i < sx * sy; i++) {
    kx.push(rastgele.realInRange(-1, 1));
    ky.push(rastgele.realInRange(-1, 1));
  }
  const ornek = (dizi, x, y) => {
    const gx = x / HUCRE;
    const gy = y / HUCRE;
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    let fx = gx - ix;
    let fy = gy - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = dizi[iy * sx + ix];
    const b = dizi[iy * sx + ix + 1];
    const d = dizi[(iy + 1) * sx + ix];
    const e = dizi[(iy + 1) * sx + ix + 1];
    return a + (b - a) * fx + (d - a) * fy + (a - b - d + e) * fx * fy;
  };

  for (let y = 0; y < boy; y++) {
    for (let x = 0; x < en; x++) {
      const kaynakX = Math.round(x + ornek(kx, x, y) * piksel);
      const kaynakY = Math.round(y + ornek(ky, x, y) * piksel);
      if (kaynakX < 0 || kaynakY < 0 || kaynakX >= en || kaynakY >= boy) continue;
      const k = (kaynakY * en + kaynakX) * 4;
      const h = (y * en + x) * 4;
      hedef.data[h] = kaynak[k];
      hedef.data[h + 1] = kaynak[k + 1];
      hedef.data[h + 2] = kaynak[k + 2];
      hedef.data[h + 3] = kaynak[k + 3];
    }
  }
  c.putImageData(hedef, 0, 0);
  // Ekran kartına (WebGL) yeni resmi gönder
  if (yazi.renderer && yazi.renderer.gl) {
    yazi.frame.source.glTexture = yazi.renderer.canvasToTexture(tuval, yazi.frame.source.glTexture, true);
  }
  return yazi;
}

// Yazının dönme noktasını harfin gerçekten boyalı kısmının ortasına koyar.
// (Yazı kutusunda harfin üstünde boşluk olduğu için "a" gibi harfler aşağıda kalır.)
function boyaliOrtala(yazi) {
  const tuval = yazi.canvas;
  const piksel = tuval.getContext("2d").getImageData(0, 0, tuval.width, tuval.height).data;
  let sol = tuval.width;
  let sag = -1;
  let ust = tuval.height;
  let alt = -1;
  for (let y = 0; y < tuval.height; y++) {
    for (let x = 0; x < tuval.width; x++) {
      if (piksel[(y * tuval.width + x) * 4 + 3] > 0) {
        sol = Math.min(sol, x);
        sag = Math.max(sag, x);
        ust = Math.min(ust, y);
        alt = Math.max(alt, y);
      }
    }
  }
  if (sag < 0) return yazi.setOrigin(0.5);
  return yazi.setOrigin((sol + sag + 1) / 2 / tuval.width, (ust + alt + 1) / 2 / tuval.height);
}

// Boya kalemiyle taranmış, kalemle çevrelenmiş, titrek doodle yazı
function doodleYazi(sahne, x, y, metin, boy, tarama = "beyaz") {
  const yazi = sahne.add.text(x, y, metin, {
    fontFamily: "Andika", fontSize: `${boy}px`, color: taramaDeseni(tarama),
    stroke: KALEM_RENGI, strokeThickness: Math.max(5, Math.round(boy / 14)),
    padding: { x: 4, y: 4 },
  });
  return titret(yazi, Math.max(1.5, boy / 24));
}

// Adanın kıyı çizgisi: dalgalı bir oval. Aynı şekil her açılışta aynı çıkar.
function adaNoktalari(olcek) {
  const noktalar = [];
  const merkezX = DUNYA_GENISLIK / 2;
  const merkezY = ADA_YUKSEKLIK / 2;
  const yaricapX = DUNYA_GENISLIK / 2 - 260;
  const yaricapY = ADA_YUKSEKLIK / 2 - 220;
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
    const y = rastgele.between(0, ADA_YUKSEKLIK);
    if (!cimen.contains(x, y)) continue;
    if (Math.hypot(x - BASLANGIC_X, y - BASLANGIC_Y) < 260) continue;
    if (susler.some((s) => Math.hypot(s.x - x, s.y - y) < 190)) continue;
    susler.push({ tur: rastgele.pick(turler), x, y });
  }
  // Tarlanın üstünde ağaç, çalı, kaya olmasın
  return susler.filter((s) => !TARLA_ALANI.contains(s.x, s.y) && !TESIS_ALANI.contains(s.x, s.y)
    && !YELKENLI_ALANI.contains(s.x, s.y));
}

class AdaSahnesi extends Phaser.Scene {
  constructor() {
    super("AdaSahnesi");
  }

  preload() {
    this.load.svg("cocuk", "gorseller/cocuk.svg");
    this.load.svg("cocuk-adim1", "gorseller/cocuk-adim1.svg");
    this.load.svg("cocuk-adim2", "gorseller/cocuk-adim2.svg");
    this.load.svg("cocuk-tirman", "gorseller/cocuk-tirman.svg");
    this.load.svg("agac-govde", "gorseller/agac-govde.svg");
    this.load.svg("agac-tepe", "gorseller/agac-tepe.svg");
    this.load.svg("cali", "gorseller/cali.svg");
    this.load.svg("kaya", "gorseller/kaya.svg");
    this.load.svg("sandik-kapali", "gorseller/sandik-kapali.svg");
    this.load.svg("sandik-acik", "gorseller/sandik-acik.svg");
    this.load.svg("canta", "gorseller/canta.svg");
    this.load.svg("tohum", "gorseller/tohum.svg");
    for (let i = 1; i <= 3; i++) this.load.svg(`aura-halka${i}`, `gorseller/aura-halka${i}.svg`);
    for (const ad of ["canta-pencere", "dusunce-balonu", "guc-bandi",
      "doku-kagit", "doku-deniz", "doku-kum", "doku-cimen",
      "menu-dugmesi", "menu-kapat", "menu-pencere", "onay-pencere"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
    this.load.svg("mikrofon", "gorseller/mikrofon.svg");
    this.load.svg("ari", "gorseller/ari.svg");
    this.load.svg("nar", "gorseller/nar.svg");
    this.load.svg("tarla", "gorseller/tarla.svg");
    this.load.svg("harita-karti", "gorseller/harita-karti.svg");
    for (const ad of ["su-tesisi", "tesis-pencere", "damla", "damla-bos", "sise",
      "incele-dugmesi", "sise-pencere", "varil", "bitki-filiz", "bitki-fidan", "bitki-sirik", "harf-tabela"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
    this.load.svg("ekili-tohum", "gorseller/ekili-tohum.svg");
    this.load.svg("yelkenli-kizak", "gorseller/yelkenli-kizak.svg");
    for (const p of YELKENLI_PARCALARI) {
      this.load.svg(`yelkenli-${p.ad}`, `gorseller/yelkenli-${p.ad}.svg`);
      this.load.svg(`yelkenli-${p.ad}-silik`, `gorseller/yelkenli-${p.ad}-silik.svg`);
      this.load.svg(`yelkenli-${p.ad}-simge`, `gorseller/yelkenli-${p.ad}-simge.svg`);
    }
    for (const ad of ["esek", "tilki", "inek", "leylek"]) this.load.svg(ad, `gorseller/${ad}.svg`);
    for (const ad of ["cicek-kirmizi", "cicek-mor", "cicek-beyaz", "ot", "kelebek", "kus"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  // veri.tanriModu: karşılama ekranındaki "God mode" düğmesiyle (deneme için) bütün
  // sandıklar açılmış ve tohumlar çantada başlar
  create(veri = {}) {
    this.dokulariUret();
    this.denizKur();
    this.adayiCiz();
    this.tarlaKur();
    this.tesisKur();
    this.yelkenliKur();

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
    if (veri.tanriModu) this.hepsiniAc();
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
    this.menuKur();
    this.haritaKur();
    this.yelkenliKartiKur();
    this.tesisPaneliKur();
    // God mode: ekili harflerin varilleri tesiste hazır durur
    for (const k of this.tarlaKareleri) if (k.ekili) this.varilGetir(k.ekili.harf, true);
    this.siseKur();
    this.cameras.main.fadeIn(400, 251, 247, 236);
    this.tirmaniyor = false;
    this.sirigaGidiyor = null;
    this.events.on("wake", (sys, veri) => {
      if (veri && veri.miniOyun) this.miniOyundanDon(veri);
      else if (veri && veri.final) {
        this.input.enabled = true;
        this.cameras.main.fadeIn(500, 251, 247, 236);
      } else this.siriktanIn(veri);
    });

    this.input.on("pointerdown", (p) => {
      Sesler.ac();
      if (this.tirmaniyor) return; // sırıkta tırmanırken dokunuş beklenmez
      if (this.menuTiklamasi(p)) return;
      if (this.tesisTiklamasi(p)) return;
      if (!this.cantaAcik && this.yolaCikAlani && this.yolaCikAlani.contains(p.worldX, p.worldY)) {
        this.yolaCik();
        return;
      }
      if (!this.cantaAcik && this.yelkenliKartAlani.contains(p.x, p.y)) {
        this.tweens.add({ targets: this.yelkenliKarti, scale: 0.92, duration: 90, yoyo: true });
        this.hedefBelirle(YELKENLI_DURAK.x, YELKENLI_DURAK.y, true);
        return;
      }
      if (!this.cantaAcik && this.haritaAlani.contains(p.x, p.y)) return; // haritaya dokununca yürümez
      if (this.cantaTiklamasi(p)) return;
      if (this.tesis.getBounds().contains(p.worldX, p.worldY)) {
        this.tesiseGit();
        return;
      }
      // Tırmanmak için sırığın dikildiği toprak karesine dokunulur (sırıklar üst üste
      // binebilir ama kareler binmez)
      const sirik = this.tarlaKareleri.find((k) => k.asama === BUYUME_ASAMASI
        && k.alan.contains(p.worldX, p.worldY));
      if (sirik) {
        this.sirigaGit(sirik);
        return;
      }
      if (this.sandik && this.sandikGorundu && !this.sandikAcildi
          && this.sandik.getBounds().contains(p.worldX, p.worldY)) {
        this.sandigiAc();
        return;
      }
      this.hedefBelirle(p.worldX, p.worldY, true);
    });
    this.input.on("pointermove", (p) => {
      // Şişeye dokunulup parmak kaydırıldıysa şişe taşınmaya başlar
      if (this.siseBasili && Math.hypot(p.x - this.siseBasili.x, p.y - this.siseBasili.y) > 14) {
        this.siseyiTasimayaBasla(p);
      }
      if (this.siseTasinan) {
        this.siseyiTasi(p);
        return;
      }
      if (this.tasinan) {
        this.tohumuTasi(p);
        return;
      }
      if (this.parcaTasinan) {
        this.parcayiTasi(p);
        return;
      }
      if (p.isDown && !this.cantaAcik && !this.menuAcik && !this.tesisAcik) this.hedefBelirle(p.worldX, p.worldY, false);
    });
    this.input.on("pointerup", (p) => this.birak(p));
    this.input.on("pointerupoutside", (p) => this.birak(p));
    this.input.keyboard.on("keydown", () => Sesler.ac());
    this.input.keyboard.addCapture("SPACE");
    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.menuAcik && !this.tesisAcik) this.cantayiAcKapat();
    });
  }

  // ---- Çanta (envanter) ----

  cantaKur() {
    this.cantaAcik = false;
    // Sağ üst köşede her zaman duran çanta düğmesi
    this.cantaDugmesi = this.add.image(1280 - 80, 80, "canta")
      .setScrollFactor(0).setDepth(9000);

    // Çanta açılınca görünen pencere
    const pencere = this.add.container(0, 0).setScrollFactor(0).setDepth(9100).setVisible(false);
    // Arkadaki karartma ve doodle pencere çizimi (gorseller/canta-pencere.svg).
    // Çizimdeki kutucuklar ve çarpı aşağıdaki konumlarla aynı yerdedir.
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRect(0, 0, 1280, 720);
    const pencereResmi = this.add.image(300, 120, "canta-pencere").setOrigin(0);
    this.kutucuklar = [];
    for (let i = 0; i < Canta.BOYUT; i++) {
      this.kutucuklar.push({ x: 410 + (i % 4) * 147, y: 315 + Math.floor(i / 4) * 150 });
    }
    this.kapatmaAlani = new Phaser.Geom.Circle(925, 165, 36);
    this.pencereAlani = new Phaser.Geom.Rectangle(320, 150, 620, 420);

    const baslik = doodleYazi(this, 630, 190, "Çantam", 46).setOrigin(0.5);
    this.cantaIcerigi = this.add.container(0, 0);
    pencere.add([g, pencereResmi, baslik, this.cantaIcerigi]);
    this.cantaPenceresi = pencere;
  }

  // Dokunuş çantayla ilgiliyse işler ve true döner.
  cantaTiklamasi(p) {
    if (this.cantaAcik) {
      if (this.siseAcik) { // şişenin içi açıksa: çarpı ya da dışarısı kapatır
        if (this.siseKapatmaAlani.contains(p.x, p.y) || !this.sisePencereAlani.contains(p.x, p.y)) {
          this.siseyiAcKapat();
        }
        return true;
      }
      if (this.inceleDugmesi.visible && this.inceleAlani.contains(p.x, p.y)) {
        this.inceleDugmesi.setVisible(false);
        this.siseyiAcKapat();
        return true;
      }
      this.inceleDugmesi.setVisible(false);
      if (this.siseyiTut(p)) return true; // şişeye dokunuldu (bırakınca "İncele" çıkar)
      if (this.tohumuTut(p)) return true; // tohum tarlaya sürüklenmeye başladı
      if (this.parcayiTut(p)) return true; // yelkenli parçası yelkenliye sürüklenmeye başladı
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
    if (this.tasinan || this.siseTasinan || this.sulaniyor) return; // sürüklerken çanta kapanmaz
    if (this.siseAcik) { // önce şişenin içi kapanır
      this.siseyiAcKapat();
      return;
    }
    this.inceleDugmesi.setVisible(false);
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
    this.kutucukNesneleri = [];
    Canta.esyalar.forEach((esya, i) => {
      const k = this.kutucuklar[i];
      if (!k) return;
      if (esya.tur === "sise") {
        const sise = this.add.image(k.x, k.y, "sise");
        this.cantaIcerigi.add(sise);
        this.kutucukNesneleri[i] = [sise];
        return;
      }
      if (esya.tur === "parca") {
        const parca = this.add.image(k.x, k.y, `yelkenli-${esya.ad}-simge`).setScale(0.85);
        this.cantaIcerigi.add(parca);
        this.kutucukNesneleri[i] = [parca];
        return;
      }
      if (esya.tur !== "tohum") return;
      const resim = this.add.image(k.x, k.y - 8, "tohum");
      // Harf, tohumun gövdesinin tam ortasına (gövde resmin ortasından 12 px aşağıda)
      const harf = this.add.text(k.x, k.y + 4, esya.harf, {
        fontFamily: "Andika", fontSize: "38px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
      });
      boyaliOrtala(titret(harf, 1.5));
      this.cantaIcerigi.add([resim, harf]);
      this.kutucukNesneleri[i] = [resim, harf];
    });
  }

  // ---- Sihirli su şişesi ----
  // Çantadaki şişeye dokununca altında "İncele" düğmesi çıkar. İncele'ye basınca şişenin
  // içi açılır: her harfin bölmesinde o harf için toplanan damlalar görünür.

  siseKur() {
    this.inceleDugmesi = this.add.container(0, 0, [
      this.add.image(0, 0, "incele-dugmesi"),
      doodleYazi(this, 0, -3, "İncele", 34).setOrigin(0.5),
    ]).setVisible(false);
    this.cantaPenceresi.add(this.inceleDugmesi);
    this.inceleAlani = new Phaser.Geom.Rectangle(0, 0, 180, 70);
    this.siseBasili = null; // şişeye dokunuldu, parmak henüz kalkmadı
    this.siseTasinan = null; // tarlaya sürüklenen şişe
    this.sulaniyor = false; // şişe eğilmiş, damla dökülüyor

    this.siseAcik = false;
    const SX = 390;
    const SY = 170;
    const pencere = this.add.container(0, 0).setScrollFactor(0).setDepth(9300).setVisible(false);
    const karartma = this.add.graphics();
    karartma.fillStyle(0x000000, 0.35);
    karartma.fillRect(0, 0, 1280, 720);
    // Çizimdeki bölmeler ve çarpı aşağıdaki konumlarla aynı yerdedir (sise-pencere.svg)
    const resim = this.add.image(SX, SY, "sise-pencere").setOrigin(0);
    const baslik = doodleYazi(this, 640, 128, "Sihirli Su Şişesi", 46, "mavi").setOrigin(0.5);
    pencere.add([karartma, resim, baslik]);
    this.siseBolmeleri = HARFLER.filter((h) => h.grup === 1).map((h, i) => {
      const x = SX + 44 + 218 * (i % 2);
      const y = SY + 124 + 128 * Math.floor(i / 2);
      const yazi = this.add.text(x + 42, y + 56, h.kucuk, {
        fontFamily: "Andika", fontSize: "60px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
      });
      boyaliOrtala(titret(yazi, 2));
      const damlalar = [0, 1, 2].map((j) => this.add.image(x + 94 + 36 * j, y + 56, "damla-bos").setScale(0.8));
      pencere.add([yazi, ...damlalar]);
      return { harf: h.kucuk, damlalar };
    });
    this.siseKapatmaAlani = new Phaser.Geom.Circle(SX + 470, SY + 92, 36);
    this.sisePencereAlani = new Phaser.Geom.Rectangle(SX + 14, SY, 472, 510);
    this.sisePenceresi = pencere;
  }

  // Çanta açıkken şişeye dokunuldu mu? Dokunulduysa true döner.
  siseyiTut(p) {
    const sira = this.kutucuklar.findIndex((k, i) => Canta.esyalar[i]
      && Canta.esyalar[i].tur === "sise" && Math.abs(p.x - k.x) < 60 && Math.abs(p.y - k.y) < 60);
    if (sira < 0) return false;
    if (!this.sulaniyor) this.siseBasili = { sira, x: p.x, y: p.y };
    return true;
  }

  // Parmak kalkınca: şişeye dokunulmuşsa "İncele" düğmesi çıkar; şişe ya da tohum
  // taşınıyorsa bırakılır
  birak(p) {
    if (this.siseTasinan) {
      this.siseyiBirak(p);
      return;
    }
    if (this.siseBasili) {
      const k = this.kutucuklar[this.siseBasili.sira];
      this.siseBasili = null;
      // Üst sıradaki kutucukta düğme altta, alt sıradakinde üstte çıkar
      const y = k.y < 400 ? k.y + 82 : k.y - 82;
      this.inceleDugmesi.setPosition(k.x, y).setVisible(true).setScale(0);
      this.inceleAlani.setPosition(k.x - 90, y - 35);
      this.tweens.add({ targets: this.inceleDugmesi, scale: 1, duration: 200, ease: "Back.Out" });
      Sesler.nota(660, 0, 0.08, 0.12);
      return;
    }
    if (this.parcaTasinan) {
      this.parcayiBirak(p);
      return;
    }
    this.tohumuBirak(p);
  }

  // ---- Sulama: şişe tarladaki tohuma sürüklenir, o harfin damlası varsa bir damla dökülür ----

  siseyiTasimayaBasla(p) {
    const sira = this.siseBasili.sira;
    this.siseBasili = null;
    const k = this.kutucuklar[sira];
    const kap = this.add.container(p.x, p.y, [this.add.image(0, 0, "sise")])
      .setScrollFactor(0).setDepth(9600).setScale(1.1);
    this.siseTasinan = { kap, geriX: k.x, geriY: k.y };
    this.inceleDugmesi.setVisible(false);
    this.kutucukNesneleri[sira].forEach((n) => n.setAlpha(0.25));
    this.tweens.add({ targets: this.cantaPenceresi, alpha: 0.12, duration: 200 });
    Sesler.nota(660, 0, 0.08, 0.12);
  }

  // Sulanabilecek kare: tohum ekili, henüz büyük ağaç olmamış ve o harfin damlası var
  sulanabilirKare(x, y) {
    return this.tarlaKareleri.find((k) => k.ekili && k.asama < BUYUME_ASAMASI
      && Canta.damlaSayisi(k.ekili.harf) > 0 && k.alan.contains(x, y)) || null;
  }

  siseyiTasi(p) {
    this.siseTasinan.kap.setPosition(p.x, p.y);
    this.kareIsigi.clear();
    const kare = this.sulanabilirKare(p.worldX, p.worldY);
    if (kare) {
      const a = kare.alan;
      this.kareIsigi.fillStyle(0xc9ecff, 0.5);
      this.kareIsigi.fillRoundedRect(a.x, a.y, a.width, a.height, 12);
      this.kareIsigi.lineStyle(6, 0x7cc4ef, 1);
      this.kareIsigi.strokeRoundedRect(a.x, a.y, a.width, a.height, 12);
    }
  }

  // Sulanabilir bir karede bırakılırsa şişe eğilir, damla dökülür, bitki büyür; şişe
  // sonra çantaya döner. Değilse doğrudan çantaya döner.
  siseyiBirak(p) {
    const t = this.siseTasinan;
    this.siseTasinan = null;
    this.kareIsigi.clear();
    const geriDon = () => {
      this.tweens.add({
        targets: t.kap, x: t.geriX, y: t.geriY, scale: 1, angle: 0, duration: 280, ease: "Cubic.Out",
        onComplete: () => {
          t.kap.destroy();
          this.sulaniyor = false;
          this.cantaIceriginiCiz();
          this.tweens.add({ targets: this.cantaPenceresi, alpha: 1, duration: 250 });
        },
      });
    };
    const kare = this.sulanabilirKare(p.worldX, p.worldY);
    if (!kare) {
      geriDon();
      return;
    }
    this.sulaniyor = true;
    const kamera = this.cameras.main;
    // Şişe karenin sağ üstüne gelir ve ağzı bitkiye bakacak şekilde eğilir
    const sx = kare.alan.centerX + 55 - kamera.scrollX;
    const sy = kare.alan.y - 10 - kamera.scrollY;
    this.tweens.chain({
      targets: t.kap,
      tweens: [
        { x: sx, y: sy, scale: 1, duration: 220, ease: "Cubic.Out" },
        { angle: -110, duration: 260, ease: "Sine.InOut" },
      ],
      onComplete: () => {
        // Şişenin ağzından üç damla toprağa düşer
        const agizX = t.kap.x + kamera.scrollX - 29;
        const agizY = t.kap.y + kamera.scrollY + 11;
        for (let i = 0; i < 3; i++) {
          const damla = this.add.image(agizX, agizY, "damla").setScale(0.45).setDepth(6000);
          this.tweens.add({
            targets: damla, x: kare.alan.centerX + Phaser.Math.Between(-10, 10),
            y: kare.alan.bottom - 18, duration: 320, delay: i * 140, ease: "Quad.In",
            onStart: () => Sesler.damla(),
            onComplete: () => {
              damla.destroy();
              const sicrama = this.add.circle(kare.alan.centerX, kare.alan.bottom - 16, 6, 0x7cc4ef).setDepth(6000);
              this.tweens.add({ targets: sicrama, scale: 3, alpha: 0, duration: 300, onComplete: () => sicrama.destroy() });
            },
          });
        }
        this.time.delayedCall(800, () => {
          Canta.damlaKullan(kare.ekili.harf);
          this.bitkiyiBuyut(kare);
          this.tweens.add({ targets: t.kap, angle: 0, duration: 200, onComplete: geriDon });
        });
      },
    });
  }

  // Bitki bir aşama büyür: eskisi küçülüp kaybolur, yenisi topraktan fırlar, yapraklar uçuşur
  bitkiyiBuyut(kare) {
    kare.asama++;
    const eski = kare.nesneler;
    this.tweens.add({ targets: eski, scale: 0, alpha: 0, duration: 220,
      onComplete: () => eski.forEach((n) => n.destroy()) });
    kare.nesneler = this.bitkiCiz(kare);
    const [bitki, tabela, harf] = kare.nesneler;
    bitki.setScale(1, 0);
    tabela.setScale(0);
    harf.setScale(0);
    // Fasulye sırığı gökyüzüne doğru daha uzun sürede fışkırır
    const sirik = kare.asama === BUYUME_ASAMASI;
    this.tweens.add({ targets: bitki, scaleY: 1, duration: sirik ? 1400 : 500, delay: 150,
      ease: sirik ? "Cubic.Out" : "Back.Out",
    });
    this.tweens.add({ targets: [tabela, harf], scale: 1, duration: 350, delay: 350, ease: "Back.Out" });
    this.add.particles(kare.alan.centerX, kare.alan.bottom - 40, "parilti", {
      speed: { min: 80, max: 200 }, lifespan: 700, scale: { start: 0.7, end: 0 },
      tint: [0x8fd16a, 0xc9eba7, 0xfff3b0], emitting: false,
    }).setDepth(6000).explode(18);
    Sesler.buyume();
  }

  // ---- Fasulye sırığına tırmanma: bulutların üstüne (BulutSahnesi) ----

  // Karakter sırığın dibine yürür, varınca tırmanır
  sirigaGit(kare) {
    // Seçilen sırık bir an parlar
    const bitki = kare.nesneler[0];
    bitki.setTint(0xfff3b0);
    this.time.delayedCall(350, () => bitki.clearTint());
    Sesler.pling();
    const dip = this.sirikDibi(kare);
    if (Phaser.Math.Distance.BetweenPoints(this.cocuk, dip) < 12) {
      this.sirigaTirman(kare);
      return;
    }
    this.hedefBelirle(dip.x, dip.y, false);
    this.sirigaGidiyor = kare;
  }

  sirikDibi(kare) {
    return { x: kare.alan.centerX + 10, y: kare.alan.bottom };
  }


  sirigaTirman(kare) {
    this.tirmaniyor = true;
    this.hedef = null;
    const c = this.cocuk;
    const dip = this.sirikDibi(kare);
    c.setPosition(dip.x, dip.y).setDepth(dip.y + 10).setFlipX(false).setScale(1);
    // Sırık boyunca yukarı; sırık gibi karakter de gökyüzünde solarak kaybolur
    this.tweens.add({ targets: c, alpha: 0, duration: 1000, delay: 2000 });
    tirmanmaHareketi(this, c, dip.y - SIRIK_TIRMANMA, () => {
      const kamera = this.cameras.main;
      kamera.fadeOut(500, 255, 255, 255);
      kamera.once("camerafadeoutcomplete", () => {
        this.scene.sleep();
        this.scene.run("BulutSahnesi", { harf: kare.ekili.harf, kare: this.tarlaKareleri.indexOf(kare) });
      });
    });
  }

  // Bulutlardan dönüş: karakter sırığın üstünden aşağı iner
  siriktanIn(veri) {
    const kare = this.tarlaKareleri[veri.kare];
    const c = this.cocuk;
    const dip = this.sirikDibi(kare);
    this.tirmaniyor = true;
    c.setPosition(dip.x, dip.y - SIRIK_TIRMANMA).setDepth(dip.y + 10).setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 900 });
    this.cameras.main.centerOn(c.x, c.y);
    this.cameras.main.fadeIn(500, 255, 255, 255);
    tirmanmaHareketi(this, c, dip.y, () => {
      c.setTexture("cocuk");
      this.tirmaniyor = false;
    });
  }

  // Karenin şu anki aşamasına göre bitkiyi ve harf tabelasını çizer; nesneleri verir.
  // Bitki karenin dibinde biraz sağda, tabela sol altta durur.
  bitkiCiz(kare) {
    const ad = BITKI_RESIMLERI[kare.asama];
    const taban = kare.alan.bottom - 6;
    const bitki = this.add.image(kare.alan.centerX + 10, taban, ad).setOrigin(0.5, 1).setDepth(taban);
    const tabelaX = kare.alan.x + 22;
    const tabela = this.add.image(tabelaX, taban + 2, "harf-tabela").setOrigin(0.5, 1).setDepth(taban + 0.5);
    // Levhanın ortası tabelanın alt ortasından 41 px yukarıda (gorseller/harf-tabela.svg)
    const harf = this.add.text(tabelaX, taban + 2 - 41, kare.ekili.harf, {
      fontFamily: "Andika", fontSize: "26px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 5, padding: { x: 3, y: 3 },
    }).setDepth(taban + 0.6);
    boyaliOrtala(titret(harf, 1.2));
    return [bitki, tabela, harf];
  }

  siseyiAcKapat() {
    this.siseAcik = !this.siseAcik;
    Sesler.canta(this.siseAcik);
    this.sisePenceresi.setVisible(this.siseAcik);
    this.cantaPenceresi.setVisible(!this.siseAcik); // arkada çanta görünüp kalabalık etmesin
    if (!this.siseAcik) return;
    for (const b of this.siseBolmeleri) {
      const sayi = Canta.damlaSayisi(b.harf);
      b.damlalar.forEach((d, j) => d.setTexture(j < sayi ? "damla" : "damla-bos"));
    }
    this.sisePenceresi.setScale(0.9).setAlpha(0);
    this.tweens.add({ targets: this.sisePenceresi, scale: 1, alpha: 1, duration: 200, ease: "Back.Out" });
    // Dolu damlalar sırayla hafifçe zıplar
    let gecikme = 200;
    for (const b of this.siseBolmeleri) {
      const sayi = Canta.damlaSayisi(b.harf);
      b.damlalar.slice(0, sayi).forEach((d) => {
        this.tweens.add({ targets: d, scale: 1, duration: 140, yoyo: true, delay: gecikme });
        gecikme += 60;
      });
    }
  }

  // ---- Tarla: çantadaki tohumlar sürüklenip buraya ekilir ----

  tarlaKur() {
    this.add.image(TARLA_X, TARLA_Y, "tarla").setOrigin(0).setDepth(-0.9);
    this.tarlaKareleri = [];
    for (let i = 0; i < 6; i++) {
      this.tarlaKareleri.push({
        alan: new Phaser.Geom.Rectangle(
          TARLA_X + 45 + 132 * i, TARLA_Y + 52, 118, 104),
        ekili: null, // ekilen tohum (çantadaki eşya bilgisi)
      });
    }
    this.kareIsigi = this.add.graphics().setDepth(-0.7); // sürüklerken hedef kare parlar
    this.tasinan = null; // şu an sürüklenen tohum
  }

  // Çanta açıkken bir tohuma dokunulursa tohum parmağa gelir, çanta silikleşir
  // (arkadaki tarla görünsün). Dokunuş bir tohumdaysa true döner.
  tohumuTut(p) {
    const sira = this.kutucuklar.findIndex((k, i) => Canta.esyalar[i]
      && Canta.esyalar[i].tur === "tohum" && Math.abs(p.x - k.x) < 60 && Math.abs(p.y - k.y) < 60);
    if (sira < 0) return false;
    const esya = Canta.esyalar[sira];
    const k = this.kutucuklar[sira];
    // Kutucuktaki gibi: tohum resmi ve gövdesinin ortasında harf
    const resim = this.add.image(0, -12, "tohum");
    const harf = this.add.text(0, 0, esya.harf, {
      fontFamily: "Andika", fontSize: "38px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
    });
    boyaliOrtala(titret(harf, 1.5));
    const kap = this.add.container(p.x, p.y, [resim, harf])
      .setScrollFactor(0).setDepth(9600).setScale(1.2);
    this.tasinan = { kap, sira, esya, geriX: k.x, geriY: k.y + 4 };
    this.kutucukNesneleri[sira].forEach((n) => n.setAlpha(0.25));
    this.tweens.add({ targets: this.cantaPenceresi, alpha: 0.12, duration: 200 });
    Sesler.nota(660, 0, 0.08, 0.12);
    return true;
  }

  // Tohum parmakla gider; altındaki boş kare parlar
  tohumuTasi(p) {
    this.tasinan.kap.setPosition(p.x, p.y);
    this.kareIsigi.clear();
    const kare = this.bosKare(p.worldX, p.worldY);
    if (kare) {
      const a = kare.alan;
      this.kareIsigi.fillStyle(0xfff3b0, 0.45);
      this.kareIsigi.fillRoundedRect(a.x, a.y, a.width, a.height, 12);
      this.kareIsigi.lineStyle(6, 0xffcf3f, 1);
      this.kareIsigi.strokeRoundedRect(a.x, a.y, a.width, a.height, 12);
    }
  }

  // Boş bir karenin üstünde bırakılırsa tohum ekilir; değilse (kare dolu, tarla
  // uzakta) tohum çantadaki yerine geri döner.
  tohumuBirak(p) {
    const t = this.tasinan;
    if (!t) return;
    this.tasinan = null;
    this.kareIsigi.clear();
    this.tweens.add({ targets: this.cantaPenceresi, alpha: 1, duration: 250 });
    const kare = this.bosKare(p.worldX, p.worldY);
    if (!kare) {
      this.tweens.add({
        targets: t.kap, x: t.geriX, y: t.geriY, scale: 1, duration: 250, ease: "Cubic.Out",
        onComplete: () => { t.kap.destroy(); this.cantaIceriginiCiz(); },
      });
      return;
    }
    Canta.cikar(t.sira);
    kare.ekili = t.esya;
    this.cantaIceriginiCiz();
    const kamera = this.cameras.main;
    this.tweens.add({
      targets: t.kap, x: kare.alan.centerX - kamera.scrollX, y: kare.alan.centerY - kamera.scrollY,
      scale: 0.7, duration: 200, ease: "Cubic.In",
      onComplete: () => { t.kap.destroy(); this.tohumuEk(kare); },
    });
  }

  bosKare(x, y) {
    return this.tarlaKareleri.find((k) => !k.ekili && k.alan.contains(x, y)) || null;
  }

  // Tohum toprağa girer: tümsek, filiz ve harf belirir, biraz toprak sıçrar
  tohumuEk(kare) {
    const x = kare.alan.centerX;
    const y = kare.alan.centerY - 4; // toprak yığını karenin içinde kalsın
    const resim = this.add.image(x, y, "ekili-tohum").setDepth(-0.8).setScale(0);
    // Harf, tohumun topraktan görünen üst kısmının ortasına: resmin ortasından 3 px
    // aşağıda (gorseller/ekili-tohum.svg)
    const harf = this.add.text(x, y + 3, kare.ekili.harf, {
      fontFamily: "Andika", fontSize: "26px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 5, padding: { x: 3, y: 3 },
    }).setDepth(-0.79).setScale(0);
    boyaliOrtala(titret(harf, 1.2));
    this.tweens.add({ targets: [resim, harf], scale: 1, duration: 400, ease: "Back.Out" });
    kare.asama = 0; // sulandıkça büyür (bitkiyiBuyut)
    kare.nesneler = [resim, harf];
    this.varilGetir(kare.ekili.harf); // tesiste bu harfin varili belirir
    for (let i = 0; i < 8; i++) {
      const toz = this.add.circle(x, y + 20, Phaser.Math.Between(5, 9), 0x8e6340).setDepth(-0.78);
      const aci = Phaser.Math.FloatBetween(Math.PI, Math.PI * 2);
      this.tweens.add({
        targets: toz, x: x + Math.cos(aci) * 50, y: y + 20 + Math.sin(aci) * 34,
        alpha: 0, scale: 0.4, duration: 450, ease: "Cubic.Out", onComplete: () => toz.destroy(),
      });
    }
    Sesler.tohum();
  }

  // ---- Yelkenli (sahilde kızakta) ----
  // Adadan kurtulmanın hedefi baştan görünsün: bütün parçalar silik, her parçanın yanında
  // harfi silik bir yuvarlakta. (Parçayı bulutlardan getirip takmak sonraki adım.)
  yelkenliKur() {
    this.parcaTasinan = null; // çantadan yelkenliye sürüklenen parça
    this.yolaCikAlani = null; // yelkenli tamamlanınca "Yola çık" düğmesi
    const derinlik = YELKENLI_Y + 380; // kızağın alt kenarı: önünden geçen karakter önde görünür
    this.add.image(YELKENLI_X, YELKENLI_Y, "yelkenli-kizak").setOrigin(0).setDepth(derinlik - 1);
    this.yelkenliParcalari = YELKENLI_PARCALARI.map((p) => {
      const silik = this.add.image(YELKENLI_X, YELKENLI_Y, `yelkenli-${p.ad}-silik`).setOrigin(0).setDepth(derinlik);
      const dolu = this.add.image(YELKENLI_X, YELKENLI_Y, `yelkenli-${p.ad}`).setOrigin(0).setDepth(derinlik)
        .setVisible(false);
      const x = YELKENLI_X + p.x;
      const y = YELKENLI_Y + p.y;
      const yuvarlak = this.add.graphics().setDepth(derinlik + 1);
      yuvarlak.fillStyle(0xffffff, 0.55);
      yuvarlak.fillCircle(x, y, 22);
      yuvarlak.lineStyle(2.5, 0x9a9a9a, 1);
      yuvarlak.strokeCircle(x, y, 22);
      const yazi = boyaliOrtala(this.add.text(x, y, p.harf, {
        fontFamily: "Andika", fontSize: "32px", color: "#b5b5b5", padding: { x: 3, y: 3 },
      })).setDepth(derinlik + 2);
      // Parça bu alana bırakılınca takılır (yerinin çevresi, parmak için geniş)
      const [kx, ky, ken, kboy] = p.kutu;
      const alan = new Phaser.Geom.Rectangle(YELKENLI_X + kx - 80, YELKENLI_Y + ky - 80, ken + 160, kboy + 160);
      return { ...p, silik, dolu, yuvarlak, yazi, alan, takildi: false };
    });
  }

  // Parça yerine oturur: dolu hâli görünür, harf yuvarlağı koyulaşır, parıltı
  parcayiTak(parca) {
    parca.takildi = true;
    parca.silik.setVisible(false);
    parca.dolu.setVisible(true).setAlpha(0);
    this.tweens.add({ targets: parca.dolu, alpha: 1, duration: 400 });
    const x = YELKENLI_X + parca.x;
    const y = YELKENLI_Y + parca.y;
    parca.yuvarlak.clear();
    parca.yuvarlak.fillStyle(0xfbf4e2, 1);
    parca.yuvarlak.fillCircle(x, y, 22);
    parca.yuvarlak.lineStyle(3, 0x2b2b2b, 1);
    parca.yuvarlak.strokeCircle(x, y, 22);
    parca.yazi.setColor("#ffffff").setStroke("#3b2a1a", 6);
    boyaliOrtala(titret(parca.yazi, 1.2));
    this.tweens.add({ targets: parca.yazi, scale: 1.5, duration: 200, yoyo: true });
    const [kx, ky, ken, kboy] = parca.kutu;
    this.add.particles(YELKENLI_X + kx + ken / 2, YELKENLI_Y + ky + kboy / 2, "parilti", {
      speed: { min: 80, max: 260 }, lifespan: 800, scale: { start: 1.3, end: 0 },
      tint: [0xffe680, 0xffffff, 0xffc928], emitting: false,
    }).setDepth(YELKENLI_Y + 400).explode(30);
    Sesler.buyume();
    this.yelkenliKartiniCiz();
    if (this.yelkenliParcalari.every((y) => y.takildi)) this.time.delayedCall(900, () => this.yelkenliHazir());
  }

  // Final 1: altı parça takıldı. Kutlama; yelkenlinin üstünde "Yola çık" düğmesi parlar
  // (öğretmenin seçimi B: çocuk basınca yola çıkılır).
  yelkenliHazir(sessiz = false) {
    const x = YELKENLI_X + 300; // yelkenlinin altında, denizde
    const y = YELKENLI_Y + 490;
    if (!sessiz) {
      Sesler.dogru();
      Sesler.soyle("Yelkenli hazır! Aferin!");
      this.add.particles(x, YELKENLI_Y + 150, "parilti", {
        speed: { min: 200, max: 520 }, angle: { min: 200, max: 340 }, gravityY: 700, lifespan: 1600,
        scale: { start: 1.3, end: 0.4 }, tint: [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c],
        emitting: false,
      }).setDepth(YELKENLI_Y + 500).explode(70);
    }
    const dugme = this.add.container(x, y, [
      this.add.image(0, 0, "incele-dugmesi"),
      doodleYazi(this, 0, -3, "Yola çık", 34).setOrigin(0.5),
    ]).setDepth(YELKENLI_Y + 500).setScale(0);
    this.tweens.add({ targets: dugme, scale: 1, duration: 400, ease: "Back.Out", onComplete: () => {
      this.tweens.add({ targets: dugme, scale: 1.12, duration: 600, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    } });
    this.yolaCikDugmesi = dugme;
    this.yolaCikAlani = new Phaser.Geom.Rectangle(x - 100, y - 45, 200, 90);
  }

  // "Yola çık": ada uyur, final sahnesi açılır (dönünce ada kaldığı gibi uyanır)
  yolaCik() {
    this.hedef = null;
    this.input.enabled = false;
    Sesler.pling();
    this.cameras.main.fadeOut(500, 251, 247, 236);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.sleep();
      this.scene.run("FinalSahnesi");
    });
  }

  // ---- Yelkenli kartı (sağ üstte, çantanın altında): takılan parçalar renkli, "2 / 6" ----
  // Karta dokununca karakter yelkenliye yürür.
  yelkenliKartiKur() {
    const X = 1280 - 160;
    const Y = 160;
    const kap = this.add.container(X, Y).setScrollFactor(0).setDepth(8900);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(6, 8, 150, 130, 16);
    g.fillStyle(0xfbf4e2, 1);
    g.fillRoundedRect(0, 0, 150, 130, 16);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(0, 0, 150, 130, 16);
    kap.add(g);
    // Küçük yelkenli: aynı resimler 0.2 ölçekte (tuval 680x440 -> 136x88)
    this.kartParcalari = YELKENLI_PARCALARI.map((p) => {
      const silik = this.add.image(7, 4, `yelkenli-${p.ad}-silik`).setOrigin(0).setScale(0.2);
      const dolu = this.add.image(7, 4, `yelkenli-${p.ad}`).setOrigin(0).setScale(0.2).setVisible(false);
      kap.add([silik, dolu]);
      return { silik, dolu };
    });
    this.kartSayi = this.add.text(75, 112, "0 / 6", {
      fontFamily: "Andika", fontSize: "22px", color: "#555555",
    }).setOrigin(0.5);
    kap.add(this.kartSayi);
    this.yelkenliKarti = kap;
    this.yelkenliKartAlani = new Phaser.Geom.Rectangle(X, Y, 150, 130);
  }

  yelkenliKartiniCiz() {
    let sayi = 0;
    this.yelkenliParcalari.forEach((p, i) => {
      this.kartParcalari[i].silik.setVisible(!p.takildi);
      this.kartParcalari[i].dolu.setVisible(p.takildi);
      if (p.takildi) sayi++;
    });
    this.kartSayi.setText(`${sayi} / 6`);
    this.tweens.add({ targets: this.yelkenliKarti, scale: 1.1, duration: 150, yoyo: true });
  }

  // ---- Parçayı çantadan yelkenliye sürükleme (tohum eker gibi) ----
  parcayiTut(p) {
    const sira = this.kutucuklar.findIndex((k, i) => Canta.esyalar[i]
      && Canta.esyalar[i].tur === "parca" && Math.abs(p.x - k.x) < 60 && Math.abs(p.y - k.y) < 60);
    if (sira < 0) return false;
    const esya = Canta.esyalar[sira];
    const k = this.kutucuklar[sira];
    const kap = this.add.container(p.x, p.y, [this.add.image(0, 0, `yelkenli-${esya.ad}-simge`)])
      .setScrollFactor(0).setDepth(9600).setScale(1.2);
    const parca = this.yelkenliParcalari.find((y) => y.ad === esya.ad);
    this.parcaTasinan = { kap, sira, esya, parca, geriX: k.x, geriY: k.y };
    this.kutucukNesneleri[sira].forEach((n) => n.setAlpha(0.25));
    this.tweens.add({ targets: this.cantaPenceresi, alpha: 0.12, duration: 200 });
    // Yelkenlide parçanın yeri sarı parlar
    parca.silik.setTintFill(0xffcf3f);
    this.tweens.add({ targets: parca.silik, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });
    Sesler.nota(660, 0, 0.08, 0.12);
    return true;
  }

  parcayiTasi(p) {
    const t = this.parcaTasinan;
    t.kap.setPosition(p.x, p.y);
    t.kap.setScale(t.parca.alan.contains(p.worldX, p.worldY) ? 1.45 : 1.2);
  }

  // Yerinin üstüne bırakılırsa takılır; değilse çantadaki yerine döner
  parcayiBirak(p) {
    const t = this.parcaTasinan;
    this.parcaTasinan = null;
    this.tweens.killTweensOf(t.parca.silik);
    t.parca.silik.clearTint().setAlpha(1);
    this.tweens.add({ targets: this.cantaPenceresi, alpha: 1, duration: 250 });
    if (!t.parca.alan.contains(p.worldX, p.worldY)) {
      this.tweens.add({
        targets: t.kap, x: t.geriX, y: t.geriY, scale: 1, duration: 250, ease: "Cubic.Out",
        onComplete: () => { t.kap.destroy(); this.cantaIceriginiCiz(); },
      });
      return;
    }
    Canta.cikar(t.sira);
    this.cantaIceriginiCiz();
    const [kx, ky, ken, kboy] = t.parca.kutu;
    const kamera = this.cameras.main;
    this.tweens.add({
      targets: t.kap, x: YELKENLI_X + kx + ken / 2 - kamera.scrollX, y: YELKENLI_Y + ky + kboy / 2 - kamera.scrollY,
      scale: 0.6, alpha: 0.3, duration: 220, ease: "Cubic.In",
      onComplete: () => { t.kap.destroy(); this.parcayiTak(t.parca); },
    });
  }

  // ---- Su arıtma tesisi ----
  // Tesise dokununca karakter iskelenin ucuna yürür ve panel açılır. Panelde her harf
  // için bir düğme var: dokununca o harf için sihirli şişeye bir damla su gelir.

  tesisKur() {
    // Karakter iskelede yürürken tesisin önünde görünsün
    this.tesis = this.add.image(TESIS_X, TESIS_Y, "su-tesisi").setOrigin(0.5, 0).setDepth(TESIS_Y - 40);
    this.yolSirasi = []; // sırayla gidilecek noktalar
    this.tesiseGidiyor = false;
    this.guverteVarilleri = {}; // harf -> güvertedeki küçük varil
  }

  // Boş varilin ağzı: içi koyu görünür (suyu tanktan gelince kalkar). s: varilin ölçeği
  varilKapagi(s) {
    const g = this.add.graphics();
    g.fillStyle(0x6b4a2b, 1);
    g.fillEllipse(0, 0, 76 * s, 20 * s);
    g.lineStyle(Math.max(1.5, 3 * s), 0x2b2b2b, 1);
    g.strokeEllipse(0, 0, 76 * s, 20 * s);
    return g;
  }

  // Varilin dolu/boş görünümü (güvertede ve panelde)
  varilDolu(dugme, dolu) {
    dugme.dolu = dolu;
    dugme.kapak.setVisible(!dolu);
    const guverte = this.guverteVarilleri[dugme.harf];
    if (guverte) guverte.kapak.setVisible(!dolu);
  }

  // Tohum ekilince o harfin varili tesiste belirir: güvertede küçük varil, panelde büyük varil
  // (panel sonraki açılışta varili borudan indirerek gösterir).
  varilGetir(harf, hemen = false) {
    const i = VARIL_HARFLERI.indexOf(harf);
    if (i < 0 || this.guverteVarilleri[harf]) return;
    const yer = VARIL_YERI(i);
    const kap = this.add.container(yer.x, yer.y).setDepth(TESIS_Y - 39);
    const resim = this.add.image(0, 0, "varil").setOrigin(VARIL_ORTA.x, VARIL_ORTA.y).setScale(0.3);
    const yazi = boyaliOrtala(titret(this.add.text(0, 19, harf, {
      fontFamily: "Andika", fontSize: "17px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 4, padding: { x: 2, y: 2 },
    }), 0.8));
    kap.kapak = this.varilKapagi(0.3);
    kap.add([resim, kap.kapak, yazi]);
    this.guverteVarilleri[harf] = kap;
    const panelVarili = this.tesisDugmeleri.find((d) => d.harf === harf);
    panelVarili.aktif = true;
    panelVarili.yeni = !hemen;
    panelVarili.kap.setVisible(true);
    panelVarili.noktalar.forEach((n) => n.setVisible(true));
    this.tesisIpucu.setVisible(false);
    if (hemen) return;
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 500, ease: "Back.Out" });
    for (let j = 0; j < 6; j++) {
      const p = this.add.image(yer.x, yer.y + 10, "parilti").setDepth(TESIS_Y - 38).setTint(0xffe680);
      const aci = (Math.PI * 2 * j) / 6;
      this.tweens.add({ targets: p, x: yer.x + Math.cos(aci) * 40, y: yer.y + 10 + Math.sin(aci) * 30,
        alpha: 0, duration: 700, ease: "Cubic.Out", onComplete: () => p.destroy() });
    }
  }

  tesisPaneliKur() {
    this.tesisAcik = false;
    const pencere = this.add.container(0, 0).setScrollFactor(0).setDepth(9100).setVisible(false);
    const karartma = this.add.graphics();
    karartma.fillStyle(0x000000, 0.35);
    karartma.fillRect(0, 0, 1280, 720);
    // Çizimdeki düğmeler ve çarpı aşağıdaki konumlarla aynı yerdedir (tesis-pencere.svg)
    const resim = this.add.image(290, 120, "tesis-pencere").setOrigin(0);
    const baslik = doodleYazi(this, 630, 190, "Su Arıtma Tesisi", 44, "mavi").setOrigin(0.5);
    pencere.add([karartma, resim, baslik]);
    // Borunun altındaki varil yerleri: varil yalnızca o harfin tohumu ekilince görünür
    this.tesisDugmeleri = VARIL_HARFLERI.map((h, i) => {
      const { x, y } = PANEL_VARIL_YERI(i);
      const kap = this.add.container(x, y).setVisible(false);
      const resim = this.add.image(0, 0, "varil").setOrigin(VARIL_ORTA.x, VARIL_ORTA.y).setScale(PANEL_VARIL_OLCEK);
      const yazi = boyaliOrtala(titret(this.add.text(0, 52, h, {
        fontFamily: "Andika", fontSize: "44px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
      }), 1.6));
      const kapak = this.varilKapagi(PANEL_VARIL_OLCEK);
      kap.add([resim, kapak, yazi]);
      // Altında üç küçük damla: şişede bu harf için kaç damla var
      const noktalar = [0, 1, 2].map((j) => this.add.image(x - 26 + 26 * j, y + 130, "damla-bos")
        .setScale(0.42).setVisible(false));
      pencere.add([kap, ...noktalar]);
      return { harf: h, x, y, kap, kapak, noktalar, aktif: false, yeni: false, dolu: false,
        alan: new Phaser.Geom.Rectangle(x - 42, y - 20, 90, 170) };
    });
    this.tesisIpucu = this.add.text(700, 380, "Tarlaya tohum ekince\nvarili buraya gelir.", {
      fontFamily: "Andika", fontSize: "30px", color: "#9a8f78", align: "center",
    }).setOrigin(0.5);
    pencere.add(this.tesisIpucu);
    this.tesisKapatmaAlani = new Phaser.Geom.Circle(290 + 625, 120 + 45, 36);
    this.tesisPencereAlani = new Phaser.Geom.Rectangle(310, 150, 620, 420);
    this.tesisPenceresi = pencere;
  }

  // Karakter iskelenin ucunda değilse oraya yürür (önce iskelenin başına), varınca panel açılır
  tesiseGit() {
    if (Phaser.Math.Distance.BetweenPoints(this.cocuk, ISKELE_SONU) < 40) {
      this.tesisiAcKapat();
      return;
    }
    this.hedef = { ...ISKELE_BASI };
    this.yolSirasi = [{ ...ISKELE_SONU }];
    this.tesiseGidiyor = true;
  }

  tesisiAcKapat() {
    this.tesisAcik = !this.tesisAcik;
    this.hedef = null;
    Sesler.canta(this.tesisAcik);
    this.tesisPenceresi.setVisible(this.tesisAcik);
    if (this.tesisAcik) {
      this.damlaNoktalariniCiz();
      this.tesisPenceresi.setScale(0.9).setAlpha(0);
      this.tweens.add({ targets: this.tesisPenceresi, scale: 1, alpha: 1, duration: 180, ease: "Back.Out" });
      this.yeniVarilleriIndir();
    }
  }

  // Yeni gelen varil borunun ağzından aşağı süzülüp yerine oturur, parıldar
  yeniVarilleriIndir() {
    this.tesisDugmeleri.filter((d) => d.yeni).forEach((d, j) => {
      d.yeni = false;
      this.tweens.killTweensOf(d.kap);
      d.kap.setY(d.y - 70).setAlpha(0).setScale(0.6);
      this.tweens.add({ targets: d.kap, y: d.y, alpha: 1, scale: 1, duration: 600, delay: 250 + j * 200,
        ease: "Bounce.Out", onComplete: () => {
          Sesler.pling();
          for (let k = 0; k < 8; k++) {
            const p = this.add.image(d.x, d.y + 60, "parilti").setScrollFactor(0).setDepth(9600).setTint(0xffe680);
            const aci = (Math.PI * 2 * k) / 8;
            this.tweens.add({ targets: p, x: d.x + Math.cos(aci) * 80, y: d.y + 60 + Math.sin(aci) * 80,
              alpha: 0, duration: 600, ease: "Cubic.Out", onComplete: () => p.destroy() });
          }
        } });
    });
  }

  damlaNoktalariniCiz() {
    for (const d of this.tesisDugmeleri) {
      const sayi = Canta.damlaSayisi(d.harf);
      d.noktalar.forEach((n, j) => n.setTexture(j < sayi ? "damla" : "damla-bos"));
    }
  }

  // Dokunuş tesis paneliyle ilgiliyse işler ve true döner.
  tesisTiklamasi(p) {
    if (!this.tesisAcik) return false;
    if (this.tesisKapatmaAlani.contains(p.x, p.y) || !this.tesisPencereAlani.contains(p.x, p.y)) {
      this.tesisiAcKapat();
      return true;
    }
    const dugme = this.tesisDugmeleri.find((d) => d.aktif && d.alan.contains(p.x, p.y));
    if (dugme) this.varileDokun(dugme);
    return true;
  }

  // Varile dokununca iki aşama (öğretmenin tarifi):
  // 1) Varil boşsa ana tanktan boru boyunca bir damla gelir, varil dolar.
  // 2) Varil doluysa Şans Çarkı açılır; çıkan mini oyun 1, 2, 3. düzeyde art arda oynanır,
  //    hepsi bitince varilden şişeye bir damla akar (miniOyundanDon).
  // Şişede o harf için 3 damla varsa varil yalnızca sallanır.
  varileDokun(dugme) {
    if (dugme.yeni || this.tweens.isTweening(dugme.kap) || this.varilDoluyor) return;
    if (Canta.damlaSayisi(dugme.harf) >= Canta.DAMLA_SINIRI) {
      this.tweens.add({ targets: dugme.kap, angle: { from: -5, to: 5 }, duration: 80,
        yoyo: true, repeat: 2, onComplete: () => dugme.kap.setAngle(0) });
      return;
    }
    if (!dugme.dolu) this.tanktanVarile(dugme);
    else this.carkiAc(dugme);
  }

  // Tankın tepesinden çıkan damla boru boyunca varilin üstüne gider ve içine düşer
  // (tesis-pencere.svg: tank tepesi (74, 165), boru y=185)
  tanktanVarile(dugme) {
    this.varilDoluyor = true;
    const boruY = 120 + 185;
    const damla = this.add.image(290 + 74, 120 + 175, "damla").setScrollFactor(0).setDepth(9600).setScale(0.45);
    Sesler.nota(520, 0, 0.1, 0.1, "sine");
    this.tweens.chain({
      targets: damla,
      tweens: [
        { y: boruY - 4, duration: 200, ease: "Quad.Out" },
        { x: dugme.x, duration: 250 + (dugme.x - 364) * 1.2, ease: "Sine.InOut" },
        { y: dugme.y + 6, scale: 0.3, duration: 260, ease: "Quad.In" },
      ],
      onComplete: () => {
        damla.destroy();
        this.varilDoluyor = false;
        this.varilDolu(dugme, true);
        Sesler.damla();
        this.tweens.add({ targets: dugme.kap, scaleY: 0.92, duration: 90, yoyo: true });
        for (let k = 0; k < 6; k++) {
          const p = this.add.image(dugme.x, dugme.y, "parilti").setScrollFactor(0).setDepth(9600).setTint(0x7cc4ef);
          const aci = Math.PI + (Math.PI * k) / 5;
          this.tweens.add({ targets: p, x: dugme.x + Math.cos(aci) * 40, y: dugme.y + Math.sin(aci) * 30,
            alpha: 0, duration: 450, ease: "Cubic.Out", onComplete: () => p.destroy() });
        }
      },
    });
  }

  // Şans Çarkı ada sahnesinin üstünde açılır; çıkan oyuna gidilir (ada uyur, durumu korunur)
  carkiAc(dugme) {
    this.input.enabled = false;
    // Bu harfte oynanamayan hece/kelime oyunları çarka girmez (a, n'de hece yok)
    const oyunlar = PLANLANAN_OYUNLAR.filter((o) => MINI_OYUNLAR[o.ad] && miniOyunOlur(o.ad, dugme.harf));
    this.scene.launch("SansCarkiSahnesi", { harf: dugme.harf, oyunlar, bitince: (ad) => {
      const kamera = this.cameras.main;
      kamera.fadeOut(400, 251, 247, 236);
      kamera.once("camerafadeoutcomplete", () => {
        this.scene.sleep();
        this.scene.run(ad, { harf: dugme.harf, seviye: 1, donus: "AdaSahnesi", zincir: true });
      });
    } });
  }

  // Mini oyundan dönüş: üç düzey bittiyse varilden şişeye bir damla akar
  miniOyundanDon(veri) {
    this.input.enabled = true;
    this.cameras.main.fadeIn(400, 251, 247, 236);
    if (!veri.kazandi) return;
    const dugme = this.tesisDugmeleri.find((d) => d.harf === veri.harf);
    this.time.delayedCall(600, () => this.siseyeDamla(dugme));
  }

  // Varilin musluğundan bir damla çıkar ve çantaya (şişeye) uçar
  siseyeDamla(dugme) {
    if (!Canta.damlaEkle(dugme.harf)) return;
    this.varilDolu(dugme, false);
    Sesler.damla();
    this.tweens.add({ targets: dugme.kap, scaleY: 0.93, duration: 80, yoyo: true });
    this.damlaNoktalariniCiz();
    // Damla varilin musluğundan çıkar (varil.svg'de musluk ağzı (108, 106))
    const muslukX = dugme.x + (108 - 52) * PANEL_VARIL_OLCEK;
    const muslukY = dugme.y + (106 - 14) * PANEL_VARIL_OLCEK;
    const damla = this.add.image(muslukX, muslukY, "damla").setScrollFactor(0).setDepth(9600).setScale(0.3);
    this.tweens.chain({
      targets: damla,
      tweens: [
        { scale: 0.8, y: muslukY + 30, duration: 220, ease: "Quad.In" },
        { x: this.cantaDugmesi.x, y: this.cantaDugmesi.y, scale: 0.5, duration: 550, ease: "Cubic.In" },
      ],
      onComplete: () => {
        damla.destroy();
        this.tweens.add({ targets: this.cantaDugmesi, scale: 1.2, duration: 110, yoyo: true });
      },
    });
  }

  // ---- Mini harita (sol alt) ----
  // Kart, ada ve tarla sabit bir resim (gorseller/harita-karti.svg). Üstüne her karede
  // karakter, ekranda görünen bölge ve açılmış sandıklar çizilir. Kapalı sandıklar
  // haritada görünmez (arama heyecanı bozulmasın).

  haritaKur() {
    const kartX = 12;
    const kartY = 720 - 12 - 175;
    this.add.image(kartX, kartY, "harita-karti").setOrigin(0).setScrollFactor(0).setDepth(8900);
    this.haritaCizim = this.add.graphics().setScrollFactor(0).setDepth(8901);
    // Kartın içindeki harita alanı (15,15)'ten başlar; dünya 220/6400 ölçeğinde
    this.haritaX = kartX + 15;
    this.haritaY = kartY + 15;
    this.haritaOlcek = 220 / DUNYA_GENISLIK;
    this.haritaAlani = new Phaser.Geom.Rectangle(kartX, kartY, 250, 175);
  }

  haritayiGuncelle(zaman) {
    const g = this.haritaCizim;
    const o = this.haritaOlcek;
    const hx = (x) => this.haritaX + x * o;
    const hy = (y) => this.haritaY + y * o;
    g.clear();

    // Ekranda görünen bölge
    const gorunen = this.cameras.main.worldView;
    g.lineStyle(2, 0x2b2b2b, 0.55);
    g.strokeRoundedRect(hx(gorunen.x), hy(gorunen.y), gorunen.width * o, gorunen.height * o, 3);

    // Açılmış sandıklar: kırmızı çarpı
    g.lineStyle(3.5, 0xe0533d, 1);
    for (const s of this.sandiklar) {
      if (!s.acildi) continue;
      const x = hx(s.nesne.x);
      const y = hy(s.nesne.y);
      g.lineBetween(x - 5, y - 5, x + 5, y + 5);
      g.lineBetween(x + 5, y - 5, x - 5, y + 5);
    }

    // Karakter: sarı nokta ve çevresinde atan halka
    const x = hx(this.cocuk.x);
    const y = hy(this.cocuk.y);
    const nabiz = (zaman % 1200) / 1200;
    g.lineStyle(2.5, 0xff7a59, 0.8 * (1 - nabiz));
    g.strokeCircle(x, y, 7 + nabiz * 9);
    g.fillStyle(0xffc928, 1);
    g.fillCircle(x, y, 6);
    g.lineStyle(2.5, 0x2b2b2b, 1);
    g.strokeCircle(x, y, 6);
  }

  // ---- Menü (sol üst): oyunu yeniden başlat ----

  menuKur() {
    this.menuAcik = false;
    this.menuDugmesi = this.add.image(64, 64, "menu-dugmesi")
      .setScrollFactor(0).setDepth(9200);

    // Açılınca düğmenin altında "Oyunu yeniden başlat" satırı çıkar
    this.menuPenceresi = this.add.container(0, 0).setScrollFactor(0).setDepth(9200).setVisible(false);
    const satir = this.add.image(20, 118, "menu-pencere").setOrigin(0);
    const yazi = doodleYazi(this, 114, 168, "Oyunu yeniden başlat", 36).setOrigin(0, 0.5);
    this.menuPenceresi.add([satir, yazi]);
    this.yenidenBaslatAlani = new Phaser.Geom.Rectangle(26, 124, 480, 90);

    // Kazara basılmasın diye önce sorulur
    this.onayPenceresi = this.add.container(0, 0).setScrollFactor(0).setDepth(9300).setVisible(false);
    const karartma = this.add.graphics();
    karartma.fillStyle(0x000000, 0.35);
    karartma.fillRect(0, 0, 1280, 720);
    const kart = this.add.image(370, 200, "onay-pencere").setOrigin(0);
    const soru = doodleYazi(this, 640, 290, "Baştan başlasın mı?", 48).setOrigin(0.5);
    const not = titret(this.add.text(640, 348, "Çanta boşalır.", {
      fontFamily: "Andika", fontSize: "28px", color: "#6b6b6b",
    }).setOrigin(0.5), 1.2);
    const evet = doodleYazi(this, 525, 438, "Evet", 42).setOrigin(0.5);
    const hayir = doodleYazi(this, 755, 438, "Hayır", 42).setOrigin(0.5);
    this.onayPenceresi.add([karartma, kart, soru, not, evet, hayir]);
    this.evetAlani = new Phaser.Geom.Rectangle(430, 400, 190, 80);
    this.hayirAlani = new Phaser.Geom.Rectangle(660, 400, 190, 80);
  }

  // Dokunuş menüyle ilgiliyse işler ve true döner.
  menuTiklamasi(p) {
    if (this.onayPenceresi.visible) {
      if (this.evetAlani.contains(p.x, p.y)) {
        this.oyunuYenidenBaslat();
      } else if (this.hayirAlani.contains(p.x, p.y)) {
        this.onayPenceresi.setVisible(false);
        this.menuyuAcKapat();
      }
      return true;
    }
    if (this.menuDugmesi.getBounds().contains(p.x, p.y)) {
      if (this.siseAcik) this.siseyiAcKapat();
      if (this.cantaAcik) this.cantayiAcKapat();
      if (this.tesisAcik) this.tesisiAcKapat();
      this.menuyuAcKapat();
      return true;
    }
    if (this.menuAcik) {
      if (this.yenidenBaslatAlani.contains(p.x, p.y)) {
        Sesler.pling();
        this.onayPenceresi.setVisible(true).setAlpha(0);
        this.tweens.add({ targets: this.onayPenceresi, alpha: 1, duration: 180 });
      } else {
        this.menuyuAcKapat(); // menünün dışına dokununca kapanır
      }
      return true;
    }
    return false;
  }

  menuyuAcKapat() {
    this.menuAcik = !this.menuAcik;
    this.hedef = null;
    Sesler.canta(this.menuAcik);
    this.menuDugmesi.setTexture(this.menuAcik ? "menu-kapat" : "menu-dugmesi");
    this.menuPenceresi.setVisible(this.menuAcik);
    if (this.menuAcik) {
      this.menuPenceresi.setAlpha(0).setY(-12);
      this.tweens.add({ targets: this.menuPenceresi, alpha: 1, y: 0, duration: 180, ease: "Back.Out" });
    }
  }

  // Sayfa yeniden yüklenir: çanta boşalır, sandıklar kapanır, mikrofon da baştan
  // kurulur. Karşılama ekranı bu sefer atlanır (tek seferlik not; ilerleme saklanmaz).
  oyunuYenidenBaslat() {
    try {
      sessionStorage.setItem(HEMEN_BASLA, "1");
    } catch (e) {
      // Not tutulamazsa karşılama ekranı yeniden görünür; sorun değil
    }
    this.cameras.main.fadeOut(300, 251, 247, 236);
    this.cameras.main.once("camerafadeoutcomplete", () => window.location.reload());
  }

  // ---- Ses doğrulama (3 basamak) ----
  // 1) Chrome dinler. 2) 3 denemeden sonra ipucu resmi çıkar, ipucu kelimesi de
  // kabul edilir. 3) Hâlâ olmazsa oyun kendiliğinden onaylar ve harf "tekrar
  // edilecek" diye not edilir. Hata mesajı ya da başarısızlık ekranı yok.
  async harfiDinle(harfBilgisi, yazi, hale, isik) {
    const harf = harfBilgisi.kucuk;
    const kelime = harfBilgisi.kelime;
    const mikrofon = this.add.image(yazi.x + 160, yazi.y - 10, "mikrofon")
      .setDepth(6002).setScale(0);
    this.tweens.add({ targets: mikrofon, scale: 1, duration: 300, ease: "Back.Out" });

    // Ünlüler ve öğretmenin kararıyla tek başına denenen ünsüzler ("a", "n"): önce harf
    // söylenir ve oyun düşünür; doğruysa "gücünü göster" aşamasında harf uzatılarak doldurulur.
    const uzatilir = harfBilgisi.unlu || harfBilgisi.tekBasinaDenenir;
    if (uzatilir && await Dinleyici.olcerHazirla()) {
      const sonuc = await this.harfiSoyletVeGucGoster(harfBilgisi, yazi, mikrofon);
      const kaldir = [mikrofon, ...sonuc.ipucu];
      this.tweens.add({ targets: kaldir, scale: 0, alpha: 0, duration: 250,
        onComplete: () => kaldir.forEach((n) => n.destroy()) });
      this.tohumuKazan(harf, yazi, hale, isik, !sonuc.dogru);
      return;
    }

    let ipucu = [];
    let dogru = false;
    for (let deneme = 1; deneme <= 5 && Dinleyici.destekleniyor; deneme++) {
      Sesler.dinle();
      const nabiz = this.tweens.add({ targets: mikrofon, scale: 1.15, duration: 380,
        yoyo: true, repeat: -1, ease: "Sine.InOut" });
      const baslangic = Date.now();
      const metinler = await Dinleyici.dinle(6000);
      nabiz.stop();
      mikrofon.setScale(1);
      if (Dinleyici.dogruMu(metinler, harf, kelime)
          || (ipucu.length && Dinleyici.kelimeVarMi(metinler, this.heceYazimlari(harfBilgisi.hece)))) {
        dogru = true;
        break;
      }
      // Yanlış ya da boş: sadece harf hafifçe sallanır ("bir daha söyle")
      this.tweens.add({ targets: yazi, angle: { from: -8, to: 8 }, duration: 90,
        yoyo: true, repeat: 2, onComplete: () => yazi.setAngle(0) });
      if (deneme === 3) ipucu = this.ipucuGoster(yazi, harfBilgisi);
      // Tanıma hemen bittiyse biraz bekle, çocuk hazırlansın
      const gecen = Date.now() - baslangic;
      await this.bekle(Math.max(800, 1500 - gecen));
    }

    if (dogru) {
      Sesler.dogru();
      this.tweens.add({ targets: yazi, scale: 1.35, duration: 180, yoyo: true, repeat: 1 });
      this.add.particles(yazi.x, yazi.y, "yildiz", {
        speed: { min: 150, max: 350 }, lifespan: 900, scale: { start: 0.8, end: 0 },
        tint: [0xffcf3f, 0xffffff, 0x9fe870], emitting: false,
      }).setDepth(6003).explode(25);
      await this.bekle(700);
    } else {
      // 3. basamak: birkaç saniye sonra kendiliğinden onay
      await this.bekle(2500);
    }

    const kaldir = [mikrofon, ...ipucu];
    this.tweens.add({ targets: kaldir, scale: 0, alpha: 0, duration: 250,
      onComplete: () => kaldir.forEach((n) => n.destroy()) });
    this.tohumuKazan(harf, yazi, hale, isik, !dogru);
  }

  // "a" ve "n" için iki aşama:
  // 1) Çocuk harfi söyler, oyun "düşünür" (düşünce balonu). Yarım saniye net ses ya da
  //    Chrome'un tanıdığı bir kelime ("araba", "nar"; ipucundan sonra hece "an") doğru sayılır.
  //    (Tını kuralı gerçek seslerde "a"yı reddettiği için şimdilik kullanılmıyor;
  //    mikrofon.html'deki ölçümlerle ayarlanınca yeniden denenebilir.)
  //    3 denemede olmazsa ipucu (resim, ünsüzde hece de; kelime ve hece de kabul),
  //    5 denemede kendiliğinden onay.
  // 2) Doğruysa "Tohumu kazanmak için gücünü göster!" yazısı çıkar; harf her net sesle
  //    uzatıldıkça dolar (bu aşama titiz değil). 30 sn'de dolmazsa kendiliğinden dolar.
  async harfiSoyletVeGucGoster(harfBilgisi, yazi, mikrofon) {
    const harf = harfBilgisi.kucuk;
    // Uzatılamayan ünsüzde ("t") kısa, net bir ses yeter (öğretmenin kararı: basit doğrulama)
    const onaySuresi = harfBilgisi.kisaSes ? KISA_SES_SURESI : Dinleyici.ILK_ONAY_SURESI;
    let ipucu = [];
    let dogru = false;

    for (let deneme = 1; deneme <= 5 && !dogru; deneme++) {
      Sesler.dinle();
      await this.bekle(400); // çan sesi mikrofona girmesin
      // Chrome da paralel dinler (kelimeler: "araba", ipucundan sonra "arı" ...)
      const kelimeSozu = Dinleyici.dinle(5000);
      const baslangic = Date.now();
      let onceki = baslangic;
      let sesKaresi = 0; // net ses duyulan 40 ms'lik kareler
      let sessizlik = 0;
      while (Date.now() - baslangic < 5000) {
        await this.bekle(40);
        const simdi = Date.now();
        const fark = simdi - onceki;
        onceki = simdi;
        const ses = Dinleyici.sesVarMi();
        if (ses) {
          sesKaresi++;
          sessizlik = 0;
        } else {
          sessizlik += fark;
          if (sesKaresi * 40 >= onaySuresi && sessizlik > 350) break; // söyledi, sustu
        }
        mikrofon.setScale(ses ? 1.15 + 0.1 * Math.sin(simdi / 60) : 1);
      }
      mikrofon.setScale(1);

      // Düşünme efekti: oyun sesi tartar (hiç ses yoksa düşünecek bir şey de yok)
      const balon = sesKaresi >= 3 ? this.dusunceBalonu(yazi) : null;
      const [metinler] = await Promise.all([kelimeSozu, this.bekle(balon ? 1100 : 0)]);
      const sesDogru = sesKaresi * 40 >= onaySuresi;
      const kelimeDogru = Dinleyici.dogruMu(metinler, harf, harfBilgisi.kelime)
        || (ipucu.length > 0
          && Dinleyici.kelimeVarMi(metinler, this.heceYazimlari(harfBilgisi.hece)));
      dogru = sesDogru || kelimeDogru;
      if (balon) await this.balonuBitir(balon, dogru);

      if (!dogru) {
        // Hata yok: harf hafifçe "bir daha" der gibi sallanır
        this.tweens.add({ targets: yazi, angle: { from: -8, to: 8 }, duration: 90,
          yoyo: true, repeat: 2, onComplete: () => yazi.setAngle(0) });
        if (deneme === 3) ipucu = this.ipucuGoster(yazi, harfBilgisi);
        await this.bekle(700);
      }
    }

    if (!dogru) {
      await this.bekle(1500); // 3. basamak: kendiliğinden onay, güç aşaması yok
      return { dogru: false, ipucu };
    }

    // 2. aşama: güç
    const yazi2 = this.gucYazisiGoster();
    await this.harfiDoldur(harfBilgisi, yazi, mikrofon,
      { ipucuYok: true, onaySuresi: 30000, otomatikDogru: true, kesikSes: harfBilgisi.kisaSes });
    this.tweens.add({ targets: yazi2, alpha: 0, y: yazi2.y - 30, duration: 400,
      onComplete: () => yazi2.destroy() });
    return { dogru: true, ipucu };
  }

  // Harfin sağ üstünde, içinde üç noktanın sırayla zıpladığı bir düşünce balonu
  dusunceBalonu(yazi) {
    const x = yazi.x + 120;
    const y = yazi.y - 150;
    const kap = this.add.container(x, y).setDepth(6004).setScale(0);
    // Doodle balon çizimi; balonun ortası kabın ortasına gelir
    kap.add(this.add.image(0, 0, "dusunce-balonu").setOrigin(88 / 180, 58 / 150));
    const noktalar = [-28, 0, 28].map((nx, i) => {
      const n = this.add.circle(nx, 0, 9, 0x3b2a1a);
      this.tweens.add({ targets: n, y: -12, duration: 260, yoyo: true, repeat: -1,
        delay: i * 140, ease: "Sine.InOut" });
      return n;
    });
    kap.add(noktalar);
    kap.noktalar = noktalar;
    this.tweens.add({ targets: kap, scale: 1, duration: 250, ease: "Back.Out" });
    return kap;
  }

  // Balon, doğruysa yeşil bir onay işaretine dönüşür; değilse söner.
  async balonuBitir(balon, dogru) {
    balon.noktalar.forEach((n) => { this.tweens.killTweensOf(n); n.destroy(); });
    if (dogru) {
      const g = this.add.graphics();
      g.fillStyle(0x6cc05a);
      g.fillCircle(0, 0, 30);
      g.lineStyle(9, 0xffffff);
      g.beginPath();
      g.moveTo(-14, 0);
      g.lineTo(-3, 12);
      g.lineTo(16, -12);
      g.strokePath();
      balon.add(g);
      Sesler.pling();
      this.tweens.add({ targets: balon, scale: 1.2, duration: 150, yoyo: true });
      await this.bekle(900);
    }
    await new Promise((bitti) => this.tweens.add({ targets: balon, scale: 0, alpha: 0,
      duration: 250, onComplete: () => { balon.destroy(); bitti(); } }));
  }

  // Ekranın üstünde: "Tohumu kazanmak için gücünü göster!" (yanında şimşek)
  gucYazisiGoster() {
    const kap = this.add.container(640, 70).setScrollFactor(0).setDepth(9050).setScale(0);
    // Doodle kâğıt şerit, bant ve şimşek (gorseller/guc-bandi.svg)
    const g = this.add.image(0, 0, "guc-bandi").setOrigin(0.5, 62 / 120);
    const metin = doodleYazi(this, 40, 0, "Tohumu kazanmak için gücünü göster!", 40).setOrigin(0.5);
    kap.add([g, metin]);
    this.tweens.add({ targets: kap, scale: 1, duration: 350, ease: "Back.Out" });
    this.tweens.add({ targets: kap, angle: { from: -1.5, to: 1.5 }, duration: 500,
      yoyo: true, repeat: -1, ease: "Sine.InOut", delay: 350 });
    return kap;
  }

  // Harfin dolumu. Çocuk sesini uzattıkça harfin içi aşağıdan yukarı altın
  // sarısıyla dolar. Ses kesilince önce yavaşça geri boşalır; birkaç kesintiden
  // sonra kaldığı yerde durur. 20 sn'de dolmazsa ipucu çıkar (kelimenin resmi,
  // ünsüzde ayrıca hece) ve o kelime ya da hece de kabul edilir; 40 sn'de oyun
  // kendiliğinden onaylar.
  // Dolum sırasında oyun ses çıkarmaz (oyunun sesi mikrofona girip harfi doldurmasın).
  // secenek.sesUygun: hangi sesin harfi dolduracağı (verilmezse her net ses),
  // secenek.ipucuYok: ipucu çıkmasın, secenek.onaySuresi: kendiliğinden bitme süresi,
  // secenek.otomatikDogru: süre dolunca da "doğru" sayılsın.
  async harfiDoldur(harfBilgisi, yazi, mikrofon, secenek = {}) {
    const DOLUM = Dinleyici.DOLUM_SURESI;
    const BOSALMA_HIZI = 0.08; // saniyede (dolgunun oranı olarak)
    const ZORLU_KESINTI = 3; // bu kadar kesintiden sonra dolgu artık boşalmaz
    const IPUCU_SURESI = 20000;
    const ONAY_SURESI = secenek.onaySuresi || 40000;
    const sesUygun = secenek.sesUygun || (() => Dinleyici.sesVarMi());

    // Harfin kıpırdamasını durdur, üstüne altın sarısı kopyasını koy
    this.tweens.killTweensOf(yazi);
    yazi.setAngle(0);
    const dolgu = this.add.text(yazi.x, yazi.y, yazi.text, {
      fontFamily: "Andika", fontSize: "180px", color: "#ffcf3f",
      stroke: "#3b2a1a", strokeThickness: 14, padding: { x: 4, y: 4 },
    }).setOrigin(yazi.originX, yazi.originY).setDepth(6001.5).setScale(yazi.scale);
    titret(dolgu, 3); // altındaki harfle aynı titreme, tam üstüne oturur
    const genislik = dolgu.width;
    const yukseklik = dolgu.height;
    // Yazının çevresinde boşluk var: harfin gerçekten boyalı olduğu satırları bul,
    // dolum yalnızca bu aralıkta ilerlesin (yarı dolu = harfin yarısı sarı).
    const piksel = dolgu.canvas.getContext("2d")
      .getImageData(0, 0, dolgu.canvas.width, dolgu.canvas.height);
    let ust = dolgu.canvas.height;
    let alt = 0;
    for (let y = 0; y < piksel.height; y++) {
      for (let x = 0; x < piksel.width; x++) {
        if (piksel.data[(y * piksel.width + x) * 4 + 3] > 0) {
          ust = Math.min(ust, y);
          alt = Math.max(alt, y);
          break;
        }
      }
    }
    const oranY = yukseklik / dolgu.canvas.height; // tuval ile görünen boyut farkı
    const harfUst = ust * oranY;
    const harfAlt = (alt + 1) * oranY;
    const dolguyuCiz = (oran) => {
      const cizgi = harfAlt - (harfAlt - harfUst) * oran; // dolgunun üst kenarı
      dolgu.setCrop(0, cizgi, genislik, yukseklik - cizgi);
    };
    dolguyuCiz(0);
    const parilti = this.add.particles(0, 0, "parilti", {
      lifespan: 600, speedY: { min: -60, max: -20 }, speedX: { min: -30, max: 30 },
      scale: { start: 0.6, end: 0 }, tint: [0xfff3b0, 0xffcf3f, 0xffffff],
      frequency: 60, emitting: false,
    }).setDepth(6003);

    Sesler.dinle();
    await this.bekle(400); // çan sesi bitsin, mikrofon onu duymasın

    let oran = 0;
    let kesinti = 0;
    let sesVardi = false;
    let sessizlik = 0;
    let ipucu = [];
    let tanimaCalisiyor = false;
    let kelimeDuyuldu = false;
    const baslangic = Date.now();
    let onceki = Date.now();

    while (oran < 1 && !kelimeDuyuldu) {
      await this.bekle(40);
      const simdi = Date.now();
      const fark = simdi - onceki;
      onceki = simdi;
      const gecen = simdi - baslangic;

      if (secenek.kesikSes) {
        // "t t t": her yeni kısa ses harfin altıda birini doldurur, dolgu boşalmaz
        if (sesUygun()) {
          if (!sesVardi) oran = Math.min(1, oran + 1 / KESIK_SES_ADIMI);
          sesVardi = true;
          sessizlik = 0;
        } else {
          sessizlik += fark;
          if (sessizlik > 150) sesVardi = false;
        }
      } else if (sesUygun()) {
        oran = Math.min(1, oran + fark / DOLUM);
        sesVardi = true;
        sessizlik = 0;
      } else {
        sessizlik += fark;
        if (sesVardi && sessizlik > 400) {
          kesinti++; // çocuk nefes aldı ya da sesi kesti
          sesVardi = false;
        }
        if (kesinti < ZORLU_KESINTI && sessizlik > 400) {
          oran = Math.max(0, oran - (BOSALMA_HIZI * fark) / 1000);
        }
      }
      dolguyuCiz(oran);

      // Görsel geri bildirim: ses varken harf titrer, mikrofon büyür, parıltı çıkar
      const dolarken = sessizlik === 0;
      yazi.setAngle(dolarken ? Phaser.Math.FloatBetween(-2, 2) : 0);
      dolgu.setAngle(yazi.angle);
      mikrofon.setScale(dolarken ? 1.15 + 0.1 * Math.sin(simdi / 60) : 1);
      parilti.emitting = dolarken;
      if (dolarken) {
        parilti.setPosition(yazi.x + Phaser.Math.Between(-50, 50),
          yazi.y - yukseklik / 2 + harfAlt - (harfAlt - harfUst) * oran);
      }

      // 2. basamak: ipucu çıkar; kelime (ve varsa hece) de kabul edilir
      if (!secenek.ipucuYok && !ipucu.length && gecen > IPUCU_SURESI) {
        ipucu = this.ipucuGoster(yazi, harfBilgisi);
      }
      if (ipucu.length && !tanimaCalisiyor && Dinleyici.destekleniyor) {
        tanimaCalisiyor = true;
        const kabul = [harfBilgisi.kelime, ...this.heceYazimlari(harfBilgisi.hece)];
        Dinleyici.dinle(6000).then((metinler) => {
          if (Dinleyici.kelimeVarMi(metinler, kabul)) kelimeDuyuldu = true;
          tanimaCalisiyor = false;
        });
      }
      // 3. basamak: kendiliğinden onay
      if (gecen > ONAY_SURESI) break;
    }

    parilti.emitting = false;
    yazi.setAngle(0);
    dolgu.setAngle(0);
    const dogru = oran >= 1 || kelimeDuyuldu || Boolean(secenek.otomatikDogru);
    // Dolgu kısa bir animasyonla tamamlanır
    const tamamla = { oran };
    await new Promise((bitti) => this.tweens.add({
      targets: tamamla, oran: 1, duration: dogru ? 250 : 800,
      onUpdate: () => dolguyuCiz(tamamla.oran), onComplete: bitti,
    }));
    if (dogru) {
      Sesler.dogru();
      this.tweens.add({ targets: [yazi, dolgu], scale: 1.35, duration: 180, yoyo: true, repeat: 1 });
      this.add.particles(yazi.x, yazi.y, "yildiz", {
        speed: { min: 150, max: 350 }, lifespan: 900, scale: { start: 0.8, end: 0 },
        tint: [0xffcf3f, 0xffffff, 0x9fe870], emitting: false,
      }).setDepth(6003).explode(30);
    }
    await this.bekle(700);
    this.tweens.add({ targets: dolgu, alpha: 0, duration: 300,
      onComplete: () => { dolgu.destroy(); parilti.destroy(); } });
    return { dogru, ipucu };
  }

  // İpucu: harfin kelimesinin resmi (kelimede öğrenilmemiş harfler olduğu için yazı
  // değil). Ünsüzde ayrıca çantadaki tohum uçup gelir ve harfle hece kurar (a + n = an).
  // Ekranda oluşan nesneleri dizi olarak verir.
  ipucuGoster(yazi, harfBilgisi) {
    const nesneler = [];
    const hece = harfBilgisi.hece;
    const resimX = hece ? yazi.x - 330 : yazi.x - 190;
    const resim = this.add.image(resimX, yazi.y + 10, harfBilgisi.resim).setDepth(6002).setScale(0);
    this.tweens.add({ targets: resim, scale: 1.2, duration: 400, ease: "Back.Out" });
    this.tweens.add({ targets: resim, y: resim.y - 12, duration: 600, yoyo: true,
      repeat: -1, ease: "Sine.InOut", delay: 400 });
    nesneler.push(resim);
    Sesler.pling();

    if (hece) {
      // Hecenin öbür harfi (a), çantadan tohum olarak uçup harfin soluna gelir
      const oburHarf = hece.replace(harfBilgisi.kucuk, "");
      const hedefX = yazi.x - 120;
      const kamera = this.cameras.main;
      const tohum = this.add.image(
        this.cantaDugmesi.x + kamera.scrollX, this.cantaDugmesi.y + kamera.scrollY, "tohum")
        .setDepth(6002).setScale(0.5);
      const harf = this.add.text(hedefX, yazi.y, oburHarf, {
        fontFamily: "Andika", fontSize: "180px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 14, padding: { x: 4, y: 4 },
      }).setOrigin(0.5).setDepth(6001).setScale(0);
      titret(harf, 3);
      this.tweens.add({ targets: this.cantaDugmesi, scale: 1.2, duration: 120, yoyo: true });
      this.tweens.add({
        targets: tohum, x: hedefX, y: yazi.y, scale: 1, angle: 360, duration: 800, ease: "Cubic.Out",
        onComplete: () => {
          tohum.destroy();
          this.tweens.add({ targets: harf, scale: 1, duration: 300, ease: "Back.Out" });
          this.tweens.add({ targets: yazi, x: yazi.x + 10, duration: 120, yoyo: true });
        },
      });
      nesneler.push(harf);
    }
    return nesneler;
  }

  // Chrome'un bir heceyi yazabileceği şekiller ("an" bazen "han" yazılır)
  heceYazimlari(hece) {
    if (!hece) return [];
    return [hece, "h" + hece, hece.replace(/^(.)/, "$1h")];
  }

  bekle(ms) {
    return new Promise((devam) => this.time.delayedCall(ms, devam));
  }

  // Harf tohuma dönüşür ve çantaya uçar; açılmış sandık küçülüp sönükleşir.
  tohumuKazan(harf, yazi, hale, isik, tekrarEdilecek) {
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
        Canta.tohumEkle(harf, tekrarEdilecek);
        this.siradakiSandik();
        this.donuk = false;
        kamera.startFollow(this.cocuk, true, 0.05, 0.05);
        if (this.cantaAcik) this.cantaIceriginiCiz();
        this.tweens.add({ targets: this.cantaDugmesi, scale: 1.25, duration: 120, yoyo: true });
      },
    });

    // Açılmış sandık adada kalır: küçük ve sönük
    const acilan = this.sandik;
    this.tweens.add({ targets: acilan, scale: 0.65, alpha: 0.6, duration: 600 });
    acilan.setTint(0xc8bca8);
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
    // Denizdeki küçük dalga kıvrımı (kalem çizgisi)
    g.lineStyle(3.5, 0x2b2b2b, 1);
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
    // Üç halka × dört yön (yukarı, sağ, aşağı, sol) parça. Halka 1 dışta, 3 içte.
    this.pusula = [];
    for (let halka = 1; halka <= 3; halka++) {
      [0, 90, 180, 270].forEach((aci) => {
        const parca = this.add.image(this.cocuk.x, this.cocuk.y - 60, `aura-halka${halka}`)
          .setAngle(aci).setAlpha(0);
        this.pusula.push({ parca, halka, aci });
      });
    }
    this.pusulaGorunurluk = 1; // sandık çıkınca pusula yavaşça söner
    this.titremeSayaci = 0; // doodle çizgilerin kıpırdaması için
    this.kivilcimSayaci = 0; // sandığın yönüne fırlayan yıldızcıklar için
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
    // Sandık yoksa ya da ortaya çıktıysa pusula söner
    const calisiyor = this.sandik && !this.sandikGorundu && !this.sandikAcildi;
    this.pusulaGorunurluk = Phaser.Math.Clamp(
      this.pusulaGorunurluk + (calisiyor ? 1 : -1) * fark / 500, 0, 1);
    if (!calisiyor) {
      this.pusulaCiz(0, 0, 0, fark);
      this.auraParilti.emitting = false;
      return;
    }
    const dx = this.saklanmaYeri.x - this.cocuk.x;
    const dy = this.saklanmaYeri.y - this.cocuk.y;
    const uzaklik = Math.hypot(dx, dy);
    // 0 = çok uzak, 1 = sandığın yanında
    const yakinlik = Phaser.Math.Clamp(1 - (uzaklik - 70) / (SENSOR_MENZILI - 70), 0, 1);
    const seviye = uzaklik < PUSULA_YAKIN ? 3 : uzaklik < PUSULA_ORTA ? 2 : 1;

    this.auraFaz += fark * (0.003 + yakinlik * 0.012);
    this.pusulaCiz(Math.atan2(dy, dx), seviye, this.auraFaz, fark);

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

  // Pusulanın parçalarını yerleştirir, parlaklıklarını ve hareketlerini ayarlar.
  // yon: sandığın yönü (radyan), seviye: kaç halka yanıyor (0 = hiçbiri),
  // faz: nabzın ilerleyişi (yaklaştıkça hızlanır), fark: geçen süre (ms)
  pusulaCiz(yon, seviye, faz, fark) {
    const x = this.cocuk.x;
    const y = this.cocuk.y - 60;
    // Doodle çizgiler her ~120 ms'de hafifçe kıpırdar (her an yeniden çiziliyormuş gibi)
    this.titremeSayaci += fark;
    const titret = this.titremeSayaci > 120;
    if (titret) this.titremeSayaci = 0;

    for (const p of this.pusula) {
      // Parçanın baktığı yön: 0° yukarı, 90° sağ ... (Phaser'da yukarı = -90°)
      const parcaYonu = Phaser.Math.DegToRad(p.aci - 90);
      const hizalama = Math.max(0, Math.cos(yon - parcaYonu)); // 1 = tam sandığa bakıyor
      // Radar dalgası: iç halkadan dışa doğru sırayla parlar (sandığa dalga gönderir gibi)
      const sira = 3 - p.halka; // iç halka 0, dış halka 2
      const dalga = 0.5 + 0.5 * Math.sin(faz * 1.6 - sira * 1.3);
      let alfa;
      let olcek = 1;
      if (p.halka <= seviye) {
        const acik = [0.55, 0.8, 1][seviye - 1];
        const taban = 0.14 + (acik - 0.14) * hizalama;
        // Yanan parçalar dalgayla yanıp söner ve hafifçe büyüyüp küçülür
        alfa = taban * (1 - 0.6 * hizalama * (1 - dalga));
        olcek = 1 + 0.08 * hizalama * dalga;
      } else {
        alfa = 0.05 + 0.07 * hizalama; // henüz yanmamış halka: çok silik bir iz
      }
      if (titret) p.titreme = Phaser.Math.FloatBetween(-2.5, 2.5);
      p.parca.setPosition(x, y).setDepth(this.cocuk.depth - 0.5)
        .setAngle(p.aci + (p.titreme || 0)).setScale(olcek)
        .setAlpha(alfa * this.pusulaGorunurluk);
    }

    // Kıvılcımlar: sandığın yönüne küçük yıldızlar fırlar; yaklaştıkça sıklaşır
    if (seviye > 0 && this.pusulaGorunurluk > 0.5) {
      this.kivilcimSayaci += fark;
      const aralik = [700, 380, 160][seviye - 1];
      if (this.kivilcimSayaci >= aralik) {
        this.kivilcimSayaci = 0;
        const sapma = yon + Phaser.Math.FloatBetween(-0.3, 0.3);
        const basla = 100 + Phaser.Math.Between(0, 40);
        const yildiz = this.add.image(x + Math.cos(sapma) * basla, y + Math.sin(sapma) * basla, "yildiz")
          .setTint(Phaser.Utils.Array.GetRandom([0xffd84d, 0xffc928, 0xffffff]))
          .setScale(0.35 + 0.1 * seviye).setDepth(this.cocuk.depth + 1);
        const yol = 90 + 30 * seviye;
        this.tweens.add({
          targets: yildiz,
          x: yildiz.x + Math.cos(sapma) * yol, y: yildiz.y + Math.sin(sapma) * yol,
          angle: 180, alpha: 0, scale: 0.1, duration: 650, ease: "Cubic.Out",
          onComplete: () => yildiz.destroy(),
        });
      }
    }
  }

  // Harf sandıklarını çalıların arkasına saklar (şimdilik a ve n). Sandıklar sırayla
  // açılır: bir sandığın tohumu çantaya girmeden sıradaki sandık ortaya çıkmaz.
  sandigiSakla(susler) {
    // Sandık çalının yanından fırlar; fırladığı yer de karada kalsın
    const kara = new Phaser.Geom.Polygon(adaNoktalari(0.85));
    const calilar = susler.filter((s) => s.tur === "cali"
      && kara.contains(s.x, s.y) && kara.contains(s.x + 100, s.y + 45));
    const uzaklik = (s, x, y) => Math.hypot(s.x - x, s.y - y);
    const harfler = HARFLER.filter((h) => h.grup === 1); // ilk sürüm: a n e t i l
    // a: başlangıçtan yaklaşık 2000 px uzakta
    const secilen = [calilar.reduce((a, b) =>
      Math.abs(uzaklik(a, BASLANGIC_X, BASLANGIC_Y) - 2000)
        < Math.abs(uzaklik(b, BASLANGIC_X, BASLANGIC_Y) - 2000) ? a : b)];
    // Sonrakiler: başlangıçtan uzak, önceki sandıkların hepsinden olabildiğince uzak
    // (adaya dağılsınlar)
    const enYakin = (s) => Math.min(...secilen.map((o) => uzaklik(s, o.x, o.y)));
    while (secilen.length < harfler.length) {
      const adaylar = calilar.filter((s) => !secilen.includes(s)
        && uzaklik(s, BASLANGIC_X, BASLANGIC_Y) > 1500);
      secilen.push(adaylar.reduce((a, b) => (enYakin(a) > enYakin(b) ? a : b)));
    }

    this.sandiklar = harfler.map((harfBilgisi, i) => [harfBilgisi, secilen[i]]).map(([harfBilgisi, cali]) => ({
      harfBilgisi,
      cali,
      nesne: this.add.image(cali.x + 8, cali.y - 24, "sandik-kapali")
        .setOrigin(0.5, 1).setDepth(cali.y - 1).setAlpha(0),
    }));
    this.siradakiSira = 0;
    this.siradakiSandik();
  }

  // "God mode": bütün sandıklar açılmış (sönük, çalının yanında); altı harfin tohumu
  // tarlaya ekilmiş ve fasulye sırığına dönüşmüş, altı yelkenli parçası çantada olarak
  // başlar (a n e t i l sırayla)
  hepsiniAc() {
    this.sandiklar.forEach((s, i) => {
      s.acildi = true;
      s.nesne.setTexture("sandik-acik").setPosition(s.cali.x + 100, s.cali.y + 45)
        .setDepth(s.cali.y + 45).setAlpha(0.6).setScale(0.65).setTint(0xc8bca8);
      const kare = this.tarlaKareleri[i];
      kare.ekili = { tur: "tohum", harf: s.harfBilgisi.kucuk, tekrarEdilecek: false };
      kare.asama = BUYUME_ASAMASI;
      kare.nesneler = this.bitkiCiz(kare);
    });
    this.siradakiSira = this.sandiklar.length;
    this.siradakiSandik(); // sandık kalmadı: pusula susar
    // Altı harfin yelkenli parçası da bulutlardan alınmış, çantada (öğretmenin isteği)
    for (const p of YELKENLI_PARCALARI) if (!Canta.alinanParcalar[p.harf]) Canta.parcaEkle(p.harf, p.ad);
  }

  // Sıradaki sandığı devreye alır (sensör onu gösterir). Sandık kalmadıysa sensör susar.
  siradakiSandik() {
    const s = this.sandiklar[this.siradakiSira++];
    this.sandik = s ? s.nesne : null;
    this.saklanmaYeri = s ? s.cali : null;
    this.aktifHarf = s ? s.harfBilgisi : null;
    this.sandikGorundu = false;
    this.sandikHazir = false; // çıkma hareketi bitti mi (üstüne yürüyünce açılabilir)
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
        this.sandikHazir = true;
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
    const acilan = this.sandiklar.find((s) => s.nesne === this.sandik);
    if (acilan) acilan.acildi = true; // mini haritada çarpıyla görünür
    this.donuk = true;
    this.hedef = null;
    if (this.sandikZipla) this.sandikZipla.stop();
    if (this.sandikParilti) this.sandikParilti.stop();
    this.auraParilti.emitting = false;

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
    const harf = this.aktifHarf.kucuk;
    const hale = this.add.circle(x, y - 210, 110, 0xffffff, 0.6).setDepth(6000).setScale(0);
    const yazi = this.add.text(x, y, harf, {
      fontFamily: "Andika", fontSize: "180px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 14, padding: { x: 4, y: 4 },
    }).setOrigin(0.5).setDepth(6001).setScale(0);
    titret(yazi, 3);
    this.tweens.add({
      targets: yazi, y: y - 210, scale: 1, duration: 900, ease: "Back.Out",
      onComplete: () => {
        this.tweens.add({ targets: yazi, y: y - 225, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
      },
    });
    this.tweens.add({ targets: hale, scale: 1, duration: 900, ease: "Back.Out" });
    this.tweens.add({ targets: hale, alpha: 0.3, duration: 700, yoyo: true, repeat: -1, delay: 900 });

    // Karakter, harf söylenip tohum çantaya girene kadar bekler (bkz. tohumuKazan)
    this.time.delayedCall(2000, () => this.harfiDinle(this.aktifHarf, yazi, hale, isik));
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
    // Doodle: kareli defter kâğıdının üstüne boya kalemiyle taranmış deniz
    this.add.tileSprite(0, 0, DUNYA_GENISLIK, DUNYA_YUKSEKLIK, "doku-kagit")
      .setOrigin(0).setDepth(-6);
    this.add.tileSprite(0, 0, DUNYA_GENISLIK, DUNYA_YUKSEKLIK, "doku-deniz")
      .setOrigin(0).setDepth(-5).setAlpha(0.85);

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
      const y = rastgele.between(0, ADA_YUKSEKLIK);
      if (!cimen.contains(x, y)) continue;
      const tur = rastgele.pick(turler);
      const faz = rastgele.frac() * Math.PI * 2;
      if (TARLA_ALANI.contains(x, y) || TESIS_ALANI.contains(x, y) || YELKENLI_ALANI.contains(x, y)) continue; // tarlada, tesiste, yelkenlide yok
      const nesne = this.add.image(x, y, tur).setOrigin(0.5, 1).setDepth(y);
      this.sallananlar.push({ nesne, tur: "cicek", faz });
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
    const merkezY = ADA_YUKSEKLIK / 2;
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

  // Doodle ada: kum ve çimen boya kalemi taramasıyla boyanır (taranmış doku, ada
  // şeklinde kesilir), kıyı kalemle iki kez, hafif titrek çizilir.
  adayiCiz() {
    const kum = adaNoktalari(1);
    const cimen = adaNoktalari(0.93);
    const boya = (noktalar, doku, derinlik) => {
      const kalip = this.make.graphics({ add: false });
      kalip.fillStyle(0xffffff);
      kalip.fillPoints(noktalar, true);
      this.add.tileSprite(0, 0, DUNYA_GENISLIK, DUNYA_YUKSEKLIK, doku)
        .setOrigin(0).setDepth(derinlik).setMask(kalip.createGeometryMask());
    };
    boya(kum, "doku-kum", -1.5);
    boya(cimen, "doku-cimen", -1.4);

    const g = this.add.graphics().setDepth(-1);
    const rastgele = new Phaser.Math.RandomDataGenerator(["kiyi"]);
    const titrek = (noktalar, oynama) => noktalar.map((n) => ({
      x: n.x + rastgele.realInRange(-oynama, oynama),
      y: n.y + rastgele.realInRange(-oynama, oynama),
    }));
    g.lineStyle(6, 0x2b2b2b, 1);
    g.strokePoints(titrek(kum, 3), true);
    g.lineStyle(2.5, 0x2b2b2b, 0.6);
    g.strokePoints(titrek(kum, 7), true); // ikinci, eskiz gibi çizgi
  }

  hedefBelirle(x, y, isaretGoster) {
    this.hedef = { x, y };
    this.yolSirasi = [];
    this.tesiseGidiyor = false;
    this.sirigaGidiyor = null;
    if (isaretGoster) {
      const isaret = this.add.circle(x, y, 14).setStrokeStyle(4, 0x2b2b2b).setDepth(5000);
      this.tweens.add({
        targets: isaret, scale: 1.8, alpha: 0, duration: 450,
        onComplete: () => isaret.destroy(),
      });
    }
  }

  update(zaman, fark) {
    this.haritayiGuncelle(zaman);
    this.canlandir(zaman, fark);
    this.kelebekleriUcur(zaman, fark);
    this.kuslariUcur(zaman, fark);
    this.bulutlariKaydir(fark);
    let dx = 0;
    let dy = 0;

    if (this.tirmaniyor) return; // sırıkta tırmanırken karakteri tırmanma hareketi yönetir
    if (this.donuk || this.cantaAcik || this.menuAcik || this.tesisAcik) {
      this.cocuk.setAngle(0).setScale(1).setTexture("cocuk");
      return;
    }

    if (this.tuslar.left.isDown) dx -= 1;
    if (this.tuslar.right.isDown) dx += 1;
    if (this.tuslar.up.isDown) dy -= 1;
    if (this.tuslar.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      this.hedef = null; // tuşlar dokunmaya göre önceliklidir
      this.yolSirasi = [];
      this.tesiseGidiyor = false;
      this.sirigaGidiyor = null;
    } else if (this.hedef) {
      dx = this.hedef.x - this.cocuk.x;
      dy = this.hedef.y - this.cocuk.y;
      if (Math.hypot(dx, dy) < 6) {
        this.hedef = null;
        dx = 0;
        dy = 0;
        // Yolun sıradaki noktası (ör. tesise giderken önce iskelenin başı, sonra sonu)
        if (this.yolSirasi.length) {
          this.hedef = this.yolSirasi.shift();
        } else if (this.tesiseGidiyor) {
          this.tesiseGidiyor = false;
          this.tesisiAcKapat();
        } else if (this.sirigaGidiyor) {
          const kare = this.sirigaGidiyor;
          this.sirigaGidiyor = null;
          this.sirigaTirman(kare);
        }
      }
    }
    // Sırığa yeni vardı ve tırmanmaya başladı: bu karede yürüme resmi koyma
    if (this.tirmaniyor) return;

    const uzunluk = Math.hypot(dx, dy);
    let yuruyor = false;

    if (uzunluk > 0) {
      let adim = (YURUME_HIZI * fark) / 1000;
      // Hedefe kalan yoldan uzun adım atma (yavaş cihazda hedefin çevresinde gidip gelmesin)
      if (this.hedef) adim = Math.min(adim, uzunluk);
      const ax = (dx / uzunluk) * adim;
      const ay = (dy / uzunluk) * adim;
      yuruyor = this.ilerle(ax, ay);
      if (!yuruyor) { // kıyıya dayandı
        this.hedef = null;
        this.yolSirasi = [];
        this.tesiseGidiyor = false;
        this.sirigaGidiyor = null;
      }
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
    if (!this.sandik || this.sandikAcildi) return;
    const uzaklik = Phaser.Math.Distance.Between(
      this.cocuk.x, this.cocuk.y, this.sandik.x, this.sandik.y);
    if (!this.sandikGorundu && uzaklik < SANDIK_CIKMA_UZAKLIGI) {
      this.sandigiGoster();
    } else if (this.sandikHazir && uzaklik < 70) {
      this.sandigiAc();
    }
  }

  // Adım adadaysa yürü; değilse kıyı boyunca kaymayı dene.
  ilerle(ax, ay) {
    const x = this.cocuk.x;
    const y = this.cocuk.y;
    // Ada ya da iskele
    const alan = { contains: (px, py) => this.yuruyusAlani.contains(px, py) || ISKELE_ALANI.contains(px, py) };
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

// Karşılama ekranı: denizde küçük bir ada, oyunun adı ve "Oyunu başlat" düğmesi.
// Düğmeye basınca oyunun sesleri açılır ve ada sahnesi başlar.
class KarsilamaSahnesi extends Phaser.Scene {
  constructor() {
    super("KarsilamaSahnesi");
  }

  preload() {
    for (const ad of ["doku-kagit", "doku-deniz", "doku-kum", "doku-cimen",
      "agac-govde", "agac-tepe", "cocuk", "baslik-tabela", "dugme-baslat", "incele-dugmesi"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.basladi = false; // menüden geri dönülünce düğmeler yeniden çalışsın
    // "Oyunu yeniden başlat"tan geliyorsak doğrudan adaya geç
    let hemen = false;
    try {
      hemen = sessionStorage.getItem(HEMEN_BASLA) === "1";
      sessionStorage.removeItem(HEMEN_BASLA);
    } catch (e) {
      hemen = false;
    }
    if (hemen) {
      this.scene.start("AdaSahnesi");
      return;
    }

    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0);
    this.deniz = this.add.tileSprite(0, 0, 1280, 720, "doku-deniz").setOrigin(0).setAlpha(0.85);
    this.adaCiz(640, 440);

    const govde = this.add.image(500, 450, "agac-govde").setOrigin(0.5, 1);
    this.tepe = this.add.image(500, 365, "agac-tepe").setOrigin(0.5, 115 / 140);
    this.cocuk = this.add.image(700, 500, "cocuk").setOrigin(0.5, 1).setScale(1.25);
    this.tweens.add({ targets: this.cocuk, scaleY: 1.29, duration: 700, yoyo: true,
      repeat: -1, ease: "Sine.InOut" });

    const tabela = this.add.container(640, 110, [
      this.add.image(0, 0, "baslik-tabela"),
      doodleYazi(this, 0, 4, "Harf Avcısı", 92, "mavi").setOrigin(0.5),
    ]);
    doodleYazi(this, 1262, 14, `Sürüm ${SURUM}`, 30).setOrigin(1, 0);
    this.tweens.add({ targets: tabela, angle: { from: -1.2, to: 1.2 }, duration: 1800,
      yoyo: true, repeat: -1, ease: "Sine.InOut" });

    const dugme = this.add.container(640, 630, [
      this.add.image(0, 0, "dugme-baslat"),
      doodleYazi(this, 40, -6, "Oyunu başlat", 46).setOrigin(0.5),
    ]).setSize(396, 92).setInteractive({ useHandCursor: true });
    this.nabiz = this.tweens.add({ targets: dugme, scale: 1.06, duration: 650, yoyo: true,
      repeat: -1, ease: "Sine.InOut" });
    dugme.on("pointerdown", () => this.basla(dugme));
    this.input.keyboard.on("keydown-ENTER", () => this.basla(dugme));
    this.input.keyboard.on("keydown-SPACE", () => this.basla(dugme));

    // Deneme için: bütün sandıklar açılmış, tohumlar çantada başlar
    const tanri = this.add.container(110, 46, [
      this.add.image(0, 0, "incele-dugmesi"),
      doodleYazi(this, 0, -3, "God mode", 30).setOrigin(0.5),
    ]).setSize(170, 56).setInteractive({ useHandCursor: true });
    tanri.on("pointerdown", () => this.basla(tanri, true));

    // Mini oyunları ayrı ayrı açıp denemek için menü (minioyunlar/menu.js)
    const mini = this.add.container(110, 116, [
      this.add.image(0, 0, "incele-dugmesi"),
      doodleYazi(this, 0, -3, "Mini Games", 28).setOrigin(0.5),
    ]).setSize(170, 56).setInteractive({ useHandCursor: true });
    mini.on("pointerdown", () => {
      if (this.basladi) return;
      this.basladi = true;
      Sesler.ac();
      Sesler.pling();
      this.cameras.main.fadeOut(300, 251, 247, 236);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("MiniOyunlarSahnesi"));
    });
  }

  // Küçük doodle ada: taranmış kum ve çimen, titrek kalem kıyısı
  adaCiz(x, y) {
    const oval = (rx, ry, oynama, tohum) => {
      const r = new Phaser.Math.RandomDataGenerator([tohum]);
      const noktalar = [];
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        noktalar.push({ x: x + Math.cos(a) * rx + r.realInRange(-oynama, oynama),
          y: y + Math.sin(a) * ry + r.realInRange(-oynama, oynama) });
      }
      return noktalar;
    };
    const boya = (noktalar, doku) => {
      const kalip = this.make.graphics({ add: false });
      kalip.fillStyle(0xffffff);
      kalip.fillPoints(noktalar, true);
      this.add.tileSprite(0, 0, 1280, 720, doku).setOrigin(0).setMask(kalip.createGeometryMask());
    };
    const kum = oval(330, 150, 0, "kum");
    boya(kum, "doku-kum");
    boya(oval(270, 112, 0, "cimen"), "doku-cimen");
    const g = this.add.graphics();
    g.lineStyle(6, 0x2b2b2b, 1);
    g.strokePoints(oval(330, 150, 1.5, "kiyi1"), true);
    g.lineStyle(2.5, 0x2b2b2b, 0.6);
    g.strokePoints(oval(332, 151, 3.5, "kiyi2"), true);
  }

  update(zaman) {
    this.deniz.tilePositionX = zaman * 0.012;
    this.deniz.tilePositionY = Math.sin(zaman / 1500) * 6;
    this.tepe.setAngle(Math.sin(zaman / 700) * 2.5);
  }

  basla(dugme, tanriModu = false) {
    if (this.basladi) return;
    this.basladi = true;
    Sesler.ac();
    Sesler.pling();
    this.nabiz.stop();
    this.tweens.add({ targets: dugme, scale: 0.92, duration: 90, yoyo: true });
    this.cameras.main.fadeOut(350, 251, 247, 236);
    // Öğretmenin deneme düğmesi (God mode) hikâyeyi atlar
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (tanriModu) this.scene.start("AdaSahnesi", { tanriModu });
      else this.scene.start("HikayeSahnesi");
    });
  }
}

// Açılış hikâyesi (öğretmenin seçimi A: kısa canlı sahne, yaklaşık 15 sn, "Geç" düğmesi).
// Okuma yok; sözleri tarayıcı sesli okur. 1) fırtına, 2) sal kırılır, 3) kumsalda uyanma,
// 4) çocuk silik yelkenliyi görür. Bitince ada sahnesi açılır.
const HIKAYE_KARELERI = [
  { soz: "Büyük bir fırtına çıktı!", sure: 4200 },
  { soz: "Salın kırıldı...", sure: 3800 },
  { soz: "Bir adaya düştün.", sure: 3800 },
  { soz: "Yelkenliyi tamamla, adadan kurtul!", sure: 4800 },
];

// Final (öğretmenin seçimi B): "Yola çık"a basınca. 2) çocuk biner, yelkenli suya kayar,
// 3) gün batımında ada uzakta kalır, 4) adalar haritası: "2. ada yakında". Sözler sesli.
// Sonunda "Adaya dön" ile uyuyan ada sahnesi kaldığı gibi uyanır.
class FinalSahnesi extends Phaser.Scene {
  constructor() {
    super("FinalSahnesi");
  }

  preload() {
    for (const ad of ["hikaye-kumsal", "hikaye-gunbatimi", "hikaye-harita", "cocuk", "incele-dugmesi"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  // Tam yelkenli: altı parçanın dolu resimleri üst üste (tuval 680x440)
  yelkenliYap(x, y, olcek) {
    const kap = this.add.container(x, y);
    for (const p of YELKENLI_PARCALARI) kap.add(this.add.image(0, 0, `yelkenli-${p.ad}`).setOrigin(0));
    return kap.setScale(olcek);
  }

  create() {
    this.onDalga = null;
    this.cameras.main.fadeIn(500, 251, 247, 236);
    // 2) Kumsal: çocuk biner, yelkenli suya kayar
    const kumsal = this.add.image(0, 0, "hikaye-kumsal").setOrigin(0);
    const tekne = this.yelkenliYap(330, 150, 0.85);
    // Denizin ön kısmı teknenin önünde: gövdenin altı suyun içinde kalır (yüzüyor görünsün)
    const onSu = this.add.image(0, 0, "hikaye-kumsal").setOrigin(0).setCrop(0, 580, 1280, 140).setDepth(2);
    const cocuk = this.add.image(250, 480, "cocuk").setOrigin(0.5, 1);
    Sesler.soyle("Haydi, yola çıkalım!");
    this.tweens.chain({ targets: cocuk, tweens: [
      { x: 520, y: 400, duration: 700, ease: "Quad.Out" },
      { y: 390, scale: 0.85, duration: 200 },
    ], onComplete: () => {
      tekne.add(cocuk.setPosition(250, 290).setScale(1));
      // Kızaktan suya kayar; gövdenin altı (tuvalde y 365) su çizgisinin altına iner
      this.tweens.add({ targets: tekne, x: 760, y: 598 - 365 * 0.85, duration: 2600, ease: "Sine.In",
        onComplete: () => this.tweens.add({ targets: tekne, y: tekne.y + 8, duration: 700, yoyo: true, repeat: -1, ease: "Sine.InOut" }) });
    } });
    // 3) Gün batımı: ada uzakta kalır
    this.time.delayedCall(4500, () => {
      this.cameras.main.flash(500, 255, 233, 194);
      kumsal.destroy();
      tekne.destroy();
      onSu.destroy();
      this.add.image(0, 0, "hikaye-gunbatimi").setOrigin(0);
      // Tekne ufukta yüzer: gövdenin altı hep su çizgisinin (y 380) biraz altında, önündeki
      // dalgalar gövdeyi örter; uzaklaştıkça küçülür
      const kucuk = this.yelkenliYap(420, 0, 0.22);
      this.onDalga = this.add.image(0, 0, "hikaye-gunbatimi").setOrigin(0).setCrop(0, 388, 1280, 332).setDepth(2);
      const yol = { t: 0 };
      this.tweens.add({ targets: yol, t: 1, duration: 3800, onUpdate: () => {
        const olcek = 0.22 - 0.1 * yol.t;
        const dalga = Math.sin(this.time.now / 300) * 2;
        kucuk.setScale(olcek).setPosition(420 + 480 * yol.t, 396 - 365 * olcek + dalga);
      } });
      Sesler.soyle("Hoşça kal, ilk ada!");
    });
    // 4) Harita: "2. ada yakında"
    this.time.delayedCall(8800, () => {
      this.cameras.main.flash(500, 251, 244, 226);
      if (this.onDalga) this.onDalga.destroy();
      this.add.image(0, 0, "hikaye-harita").setOrigin(0);
      doodleYazi(this, 310, 400, "1", 60).setOrigin(0.5);
      const soru = doodleYazi(this, 980, 320, "?", 70).setOrigin(0.5);
      this.tweens.add({ targets: soru, scale: 1.2, duration: 600, yoyo: true, repeat: -1 });
      const kucuk = this.yelkenliYap(470, 340, 0.1);
      this.tweens.add({ targets: kucuk, x: 760, y: 250, duration: 2500, ease: "Sine.InOut" });
      doodleYazi(this, 640, 560, "2. ada yakında", 56, "mavi").setOrigin(0.5);
      Sesler.soyle("2. ada seni bekliyor!");
      this.add.particles(640, 160, "parilti", {
        speed: { min: 200, max: 520 }, angle: { min: 200, max: 340 }, gravityY: 700, lifespan: 1600,
        scale: { start: 1.2, end: 0.4 }, tint: [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c],
        emitting: false,
      }).explode(60);
      Sesler.dogru();
      const don = this.add.container(1140, 660, [
        this.add.image(0, 0, "incele-dugmesi"),
        doodleYazi(this, 0, -3, "Adaya dön", 30).setOrigin(0.5),
      ]).setSize(200, 90).setInteractive({ useHandCursor: true }).setAlpha(0);
      this.tweens.add({ targets: don, alpha: 1, duration: 500, delay: 1500 });
      don.on("pointerdown", () => {
        Sesler.sustur();
        this.cameras.main.fadeOut(400, 251, 247, 236);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.wake("AdaSahnesi", { final: true });
          this.scene.stop();
        });
      });
    });
  }
}

class HikayeSahnesi extends Phaser.Scene {
  constructor() {
    super("HikayeSahnesi");
  }

  preload() {
    for (const ad of ["hikaye-firtina", "hikaye-kumsal", "hikaye-sal", "hikaye-tahta", "hikaye-simsek",
      "cocuk", "incele-dugmesi"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
    for (const p of YELKENLI_PARCALARI) this.load.svg(`yelkenli-${p.ad}-silik`, `gorseller/yelkenli-${p.ad}-silik.svg`);
  }

  create() {
    this.bitti = false;
    this.yagmurVar = true;
    this.dagilanlar = []; // kırılan salın tahtaları (kumsalda kaldırılır)
    this.cameras.main.fadeIn(400, 251, 247, 236);
    this.firtina = this.add.image(0, 0, "hikaye-firtina").setOrigin(0);
    this.kumsal = this.add.image(0, 0, "hikaye-kumsal").setOrigin(0).setVisible(false);
    this.simsek = this.add.image(930, 70, "hikaye-simsek").setOrigin(0.5, 0).setDepth(4).setAlpha(0);
    this.parlama = this.add.rectangle(0, 0, 1280, 720, 0xffffff).setOrigin(0).setDepth(6).setAlpha(0);

    // Sal ve üstündeki çocuk dalgalarda sallanır
    this.sal = this.add.container(640, 470).setDepth(3);
    this.salResmi = this.add.image(0, 0, "hikaye-sal").setOrigin(0.5, 215 / 230);
    this.cocuk = this.add.image(-70, -26, "cocuk").setOrigin(0.5, 1).setScale(0.9);
    this.sal.add([this.salResmi, this.cocuk]);
    this.tweens.add({ targets: this.sal, angle: { from: -9, to: 9 }, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.tweens.add({ targets: this.sal, y: 495, duration: 700, yoyo: true, repeat: -1, ease: "Sine.InOut" });

    // Yağmur
    this.yagmur = this.add.graphics().setDepth(5);
    this.damlalar = Array.from({ length: 70 }, () => ({
      x: Phaser.Math.Between(0, 1400), y: Phaser.Math.Between(-720, 720) }));

    // "Geç" düğmesi (mini oyunlardaki "Geri" gibi)
    const gec = this.add.container(1176, 48, [
      this.add.image(0, 0, "incele-dugmesi").setScale(0.9),
      doodleYazi(this, 0, -3, "Geç", 28).setOrigin(0.5),
    ]).setSize(200, 96).setDepth(10).setInteractive({ useHandCursor: true });
    gec.on("pointerdown", () => this.bitir());

    let zaman = 0;
    HIKAYE_KARELERI.forEach((k, i) => {
      this.time.delayedCall(zaman, () => {
        if (this.bitti) return;
        Sesler.soyle(k.soz);
        this[`kare${i + 1}`]();
      });
      zaman += k.sure;
    });
    this.time.delayedCall(zaman, () => this.bitir());
  }

  // 1) Fırtına: şimşek çakar, gök gürler
  kare1() {
    [500, 2600].forEach((ms) => this.time.delayedCall(ms, () => this.simsekCak()));
  }

  simsekCak() {
    if (this.bitti) return;
    this.simsek.setAlpha(1);
    this.parlama.setAlpha(0.6);
    this.tweens.add({ targets: this.parlama, alpha: 0, duration: 300 });
    this.tweens.add({ targets: this.simsek, alpha: 0, duration: 500, delay: 250 });
    Sesler.nota(70, 0.15, 0.7, 0.22, "sawtooth");
    Sesler.nota(55, 0.3, 0.8, 0.18, "triangle");
  }

  // 2) Büyük dalga: sal yan yatar, "çat!", tahtalar dağılır, çocuk dalgalara karışır
  kare2() {
    this.simsekCak();
    this.tweens.killTweensOf(this.sal);
    this.tweens.add({ targets: this.sal, angle: 28, y: 450, duration: 500, ease: "Quad.Out", onComplete: () => {
      Sesler.pat();
      const cat = doodleYazi(this, 860, 300, "çat!", 64).setOrigin(0.5).setDepth(7).setScale(0);
      this.tweens.add({ targets: cat, scale: 1, duration: 300, ease: "Back.Out", hold: 900, yoyo: true });
      this.salResmi.setVisible(false);
      [[-160, -40, -200], [40, -120, 160], [180, -20, 260]].forEach(([dx, dy, aci]) => {
        const t = this.add.image(this.sal.x, this.sal.y - 20, "hikaye-tahta").setDepth(3);
        this.dagilanlar.push(t);
        this.tweens.add({ targets: t, x: this.sal.x + dx * 2, y: this.sal.y + dy, angle: aci, duration: 700, ease: "Cubic.Out" });
        this.tweens.add({ targets: t, y: 760, delay: 700, duration: 900, ease: "Quad.In" });
      });
      this.tweens.add({ targets: this.cocuk, x: 260, y: 200, angle: 400, alpha: 0, duration: 1500, ease: "Quad.In" });
    } });
  }

  // 3) Kumsal: çocuk uyuyor, yanında kırık tahtalar
  kare3() {
    this.parlama.setAlpha(1);
    this.tweens.add({ targets: this.parlama, alpha: 0, duration: 900 });
    this.yagmurVar = false;
    this.yagmur.clear();
    this.firtina.setVisible(false);
    this.simsek.setVisible(false);
    this.sal.setVisible(false);
    this.dagilanlar.forEach((t) => t.destroy());
    this.kumsal.setVisible(true);
    [[360, 470, 12], [930, 490, -18]].forEach(([x, y, a]) => this.add.image(x, y, "hikaye-tahta").setAngle(a).setDepth(2));
    this.uyuyan = this.add.image(640, 460, "cocuk").setOrigin(0.5, 1).setAngle(-80).setDepth(3);
    this.zzz = doodleYazi(this, 720, 330, "z z z", 40).setOrigin(0.5).setDepth(4);
    this.tweens.add({ targets: this.zzz, y: 300, alpha: 0.4, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  // 4) Çocuk uyanır, kumsaldaki silik yelkenliyi görür
  kare4() {
    this.tweens.killTweensOf(this.zzz);
    this.zzz.destroy();
    this.tweens.add({ targets: this.uyuyan, angle: 0, x: 420, y: 470, duration: 700, ease: "Back.Out" });
    const yelkenli = YELKENLI_PARCALARI.map((p) =>
      this.add.image(720, 130, `yelkenli-${p.ad}-silik`).setOrigin(0).setScale(0.75).setAlpha(0).setDepth(2));
    this.tweens.add({ targets: yelkenli, alpha: 0.9, duration: 1200, delay: 700 });
    this.time.delayedCall(800, () => {
      const soru = doodleYazi(this, 420, 300, "?!", 60, "beyaz").setOrigin(0.5).setDepth(5).setScale(0);
      this.tweens.add({ targets: soru, scale: 1, duration: 350, ease: "Back.Out" });
      Sesler.pling();
    });
  }

  update(zaman, fark) {
    if (!this.yagmurVar) return;
    const g = this.yagmur;
    g.clear();
    g.lineStyle(3, 0xe6eef3, 0.8);
    for (const d of this.damlalar) {
      d.y += fark * 0.9;
      d.x -= fark * 0.25;
      if (d.y > 740) { d.y = -20; d.x = Phaser.Math.Between(0, 1400); }
      g.lineBetween(d.x, d.y, d.x - 8, d.y + 22);
    }
  }

  bitir() {
    if (this.bitti) return;
    this.bitti = true;
    Sesler.sustur();
    this.cameras.main.fadeOut(400, 251, 247, 236);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("AdaSahnesi"));
  }
}

// Bulutların üstü: fasulye sırığına tırmanınca varılan yer. Her harfin kendi bölgesi var
// (şimdilik bölgede harfin büyük tabelası duruyor; içeriği sonra eklenecek). Karakter bulut
// zemininde gezer; sırığa dokununca aşağı iner ve adaya döner.
class BulutSahnesi extends Phaser.Scene {
  // harfiDoldur ve bekle, AdaSahnesi'ndekiyle aynıdır (sınıf tanımının altında aktarılır)
  constructor() {
    super("BulutSahnesi");
  }

  preload() {
    this.load.svg("bulut", "gorseller/bulut.svg");
    this.load.svg("bulut-zemin", "gorseller/bulut-zemin.svg");
    this.load.svg("bulut-sirik", "gorseller/bulut-sirik.svg");
  }

  create(veri) {
    this.harf = veri.harf;
    this.kareSira = veri.kare;
    this.cameras.main.fadeIn(600, 255, 255, 255);

    this.add.rectangle(0, 0, 1280, 720, 0xd7efff).setOrigin(0);
    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0).setAlpha(0.35);
    // Uzakta süzülen bulutlar
    this.bulutlar = [];
    for (let i = 0; i < 7; i++) {
      const b = this.add.image(Phaser.Math.Between(0, 1280), Phaser.Math.Between(40, 360), "bulut")
        .setScale(Phaser.Math.FloatBetween(0.5, 1.1)).setAlpha(0.9);
      this.bulutlar.push({ nesne: b, hiz: Phaser.Math.FloatBetween(8, 22) });
    }
    doodleYazi(this, 640, 64, "Bulutların Üstü", 52, "mavi").setOrigin(0.5).setDepth(5);

    // Sırık zeminin altından gelir, tepesi bulutta
    this.sirik = this.add.image(300, 130, "bulut-sirik").setOrigin(0.5, 0).setDepth(1);
    this.add.image(640, 720, "bulut-zemin").setOrigin(0.5, 1).setDepth(2);

    // Harfin bölgesi: büyük tabela
    const tabelaX = 960;
    const tabelaY = 560;
    this.add.image(tabelaX, tabelaY, "harf-tabela").setOrigin(0.5, 1).setScale(2.6).setDepth(3);
    // Levhanın ortası tabelanın alt ortasından 41 px yukarıda (2.6 kat büyütüldü)
    // Harf 180 px yazılıp küçültülür: harfiDoldur'daki altın dolgu aynı boyda üstüne oturur
    const yazi = this.add.text(tabelaX, tabelaY - 41 * 2.6, this.harf, {
      fontFamily: "Andika", fontSize: "180px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 14, padding: { x: 4, y: 4 },
    }).setDepth(3.1).setScale(64 / 180);
    boyaliOrtala(titret(yazi, 3));
    this.harfYazi = yazi;
    this.tabelaX = tabelaX;

    // Yelkenli parçası: tabelanın üstünde köpük balonun içinde süzülür (alınmadıysa)
    this.parca = YELKENLI_PARCALARI.find((p) => p.harf === this.harf);
    this.balon = null;
    this.dinliyor = false;
    if (this.parca && !Canta.alinanParcalar[this.harf]) this.balonKur(tabelaX, 240);

    // Karakter bulutun altından, görünmeden sırığa tırmanır (zeminin arkasında); bulutun
    // üstüne çıkınca zıplayıp buluta basar
    this.cocuk = this.add.image(this.sirik.x, 820, "cocuk-tirman").setOrigin(0.5, 1).setDepth(1.5);
    this.hazir = false;
    this.hedef = null;
    tirmanmaHareketi(this, this.cocuk, BULUT_UST, () => {
      this.ziplat(this.sirik.x + 50, BULUT_YURUME.y + 40, () => {
        this.hazir = true;
        Sesler.pling();
      });
    });

    this.tuslar = this.input.keyboard.createCursorKeys();
    this.input.on("pointerdown", (p) => {
      Sesler.ac();
      if (!this.hazir) return;
      // Sırığa dokununca: dibine yürür ve aşağı iner
      if (Math.abs(p.x - this.sirik.x) < 80 && p.y > 130 && p.y < 480) {
        this.inecek = true;
        this.hedef = { x: this.sirik.x + 50, y: BULUT_YURUME.y + 40 };
        return;
      }
      this.inecek = false;
      this.hedef = {
        x: Phaser.Math.Clamp(p.x, BULUT_YURUME.x, BULUT_YURUME.right),
        y: Phaser.Math.Clamp(p.y, BULUT_YURUME.y, BULUT_YURUME.bottom),
      };
    });
  }

  update(zaman, fark) {
    for (const b of this.bulutlar) {
      b.nesne.x += (b.hiz * fark) / 1000;
      if (b.nesne.x > 1400) b.nesne.x = -120;
    }
    if (!this.hazir) return;
    if (this.balon && !this.dinliyor && Math.abs(this.cocuk.x - this.tabelaX) < 170) {
      this.parcayiAl();
      return;
    }

    let dx = 0;
    let dy = 0;
    if (this.tuslar.left.isDown) dx -= 1;
    if (this.tuslar.right.isDown) dx += 1;
    if (this.tuslar.up.isDown) dy -= 1;
    if (this.tuslar.down.isDown) dy += 1;
    if (dx || dy) {
      this.hedef = null;
      this.inecek = false;
    } else if (this.hedef) {
      dx = this.hedef.x - this.cocuk.x;
      dy = this.hedef.y - this.cocuk.y;
    }
    const uzunluk = Math.hypot(dx, dy);
    if (this.hedef && uzunluk < 4) {
      this.hedef = null;
      if (this.inecek) this.asagiIn();
      this.cocuk.setTexture("cocuk").setScale(1);
      return;
    }
    if (uzunluk === 0) {
      this.cocuk.setTexture("cocuk").setScale(1);
      return;
    }
    let adim = (YURUME_HIZI * fark) / 1000;
    if (this.hedef) adim = Math.min(adim, uzunluk);
    this.cocuk.x = Phaser.Math.Clamp(this.cocuk.x + (dx / uzunluk) * adim, BULUT_YURUME.x, BULUT_YURUME.right);
    this.cocuk.y = Phaser.Math.Clamp(this.cocuk.y + (dy / uzunluk) * adim, BULUT_YURUME.y, BULUT_YURUME.bottom);
    if (dx) this.cocuk.setFlipX(dx < 0);
    this.cocuk.setTexture(Math.floor(zaman / 230) % 2 ? "cocuk-adim1" : "cocuk-adim2");
  }

  // Köpük balonu: yarı saydam mavi daire, parlaklık, içinde parçanın simgesi; hafifçe süzülür
  balonKur(x, y) {
    const kap = this.add.container(x, y).setDepth(3.5);
    const ic = this.add.graphics();
    ic.fillStyle(0xd8f0ff, 0.45);
    ic.fillCircle(0, 0, 110);
    const g = this.add.graphics();
    g.lineStyle(4, 0x7cc4ef, 1);
    g.strokeCircle(0, 0, 110);
    g.lineStyle(10, 0xffffff, 0.9);
    g.beginPath();
    g.arc(0, 0, 84, Math.PI * 1.1, Math.PI * 1.45);
    g.strokePath();
    const parca = this.add.image(0, 0, `yelkenli-${this.parca.ad}-simge`).setScale(1.5);
    kap.add([ic, parca, g]);
    kap.parca = parca;
    this.tweens.add({ targets: kap, y: y - 14, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.tweens.add({ targets: parca, angle: { from: -6, to: 6 }, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.balon = kap;
  }

  // Karakter tabelaya gelince mikrofon çıkar; harf sesle dolar (tek aşama: sandıktaki
  // "gücünü göster" gibi). Dolunca balon patlar, parça çantaya girer. Mikrofon yoksa ya da
  // 30 sn'de dolmazsa oyun kendiliğinden onaylar (başarısızlık yok).
  async parcayiAl() {
    this.dinliyor = true;
    this.hazir = false;
    this.hedef = null;
    this.cocuk.setTexture("cocuk").setScale(1).setFlipX(false);
    const yazi = this.harfYazi;
    const mikrofon = this.add.image(yazi.x - 200, yazi.y - 120, "mikrofon").setDepth(6002).setScale(0);
    this.tweens.add({ targets: mikrofon, scale: 1, duration: 300, ease: "Back.Out" });
    const bant = this.add.container(640, 150).setDepth(9050).setScale(0);
    bant.add([this.add.image(0, 0, "guc-bandi").setOrigin(0.5, 62 / 120),
      doodleYazi(this, 40, 0, "Parçayı almak için gücünü göster!", 40).setOrigin(0.5)]);
    this.tweens.add({ targets: bant, scale: 1, duration: 350, ease: "Back.Out" });
    const bilgi = HARFLER.find((h) => h.kucuk === this.harf);
    if (await Dinleyici.olcerHazirla()) {
      await this.harfiDoldur(bilgi, yazi, mikrofon,
        { ipucuYok: true, onaySuresi: 30000, otomatikDogru: true, kesikSes: bilgi.kisaSes });
    } else {
      await this.bekle(1500);
    }
    this.tweens.add({ targets: [mikrofon, bant], scale: 0, alpha: 0, duration: 250,
      onComplete: () => { mikrofon.destroy(); bant.destroy(); } });
    this.balonuPatlat();
  }

  // Balon "pat" diye patlar; parça parıldayarak sağ üst köşeye (çantaya) uçar
  balonuPatlat() {
    const b = this.balon;
    this.balon = null;
    this.tweens.killTweensOf(b);
    this.tweens.killTweensOf(b.parca);
    Sesler.pat();
    this.add.particles(b.x, b.y, "parilti", {
      speed: { min: 120, max: 320 }, lifespan: 700, scale: { start: 1.2, end: 0 },
      tint: [0xffffff, 0xc9ecff, 0xffe680], emitting: false,
    }).setDepth(6005).explode(30);
    const parca = b.parca;
    b.remove(parca);
    parca.setPosition(b.x, b.y).setDepth(6006);
    b.destroy();
    Canta.parcaEkle(this.parca.harf, this.parca.ad);
    this.tweens.chain({ targets: parca, tweens: [
      { scale: 2, duration: 350, ease: "Back.Out" },
      { x: 1200, y: 70, scale: 0.6, angle: 360, duration: 800, delay: 400, ease: "Cubic.In" },
    ], onComplete: () => {
      parca.destroy();
      Sesler.tohum();
      this.dinliyor = false;
      this.hazir = true;
    } });
  }

  // Karakter yay çizerek zıplar: önden resim, zeminin önünde (buluta basma)
  ziplat(x, y, bitince, sirigaDogru = false) {
    const c = this.cocuk;
    if (!sirigaDogru) c.setTexture("cocuk").setDepth(4).setFlipX(false);
    const tepe = Math.min(c.y, y) - 40;
    Sesler.adim(true);
    this.tweens.add({ targets: c, x, duration: 420, ease: "Linear" });
    this.tweens.chain({ targets: c, tweens: [
      { y: tepe, duration: 210, ease: "Quad.Out" },
      { y, duration: 210, ease: "Quad.In" },
    ], onComplete: () => {
      Sesler.adim(false);
      bitince();
    } });
  }

  // Sırığa zıplayıp tutunur, bulutun arkasına doğru iner; görünmez olunca adaya döner
  asagiIn() {
    this.hazir = false;
    this.cocuk.setTexture("cocuk-tirman").setFlipX(false);
    this.ziplat(this.sirik.x, BULUT_UST, () => this.sirikBoyuncaIn(), true);
  }

  sirikBoyuncaIn() {
    this.cocuk.setDepth(1.5); // artık bulut zemininin arkasında: inerken bulut onu örter
    tirmanmaHareketi(this, this.cocuk, 840, () => {
      this.cameras.main.fadeOut(400, 255, 255, 255);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.stop();
        this.scene.wake("AdaSahnesi", { kare: this.kareSira });
      });
    });
  }
}
BulutSahnesi.prototype.harfiDoldur = AdaSahnesi.prototype.harfiDoldur;
BulutSahnesi.prototype.bekle = AdaSahnesi.prototype.bekle;

// Yazı tipi (index.html'deki yaziTipiHazir) yüklendikten sonra oyunu başlat (yoksa yazı yanlış görünür).
(window.yaziTipiHazir || Promise.resolve()).then(() => document.fonts.load('72px "Andika"')).finally(() => {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "oyun",
    width: 1280,
    height: 720,
    backgroundColor: "#fbf7ec",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [KarsilamaSahnesi, HikayeSahnesi, AdaSahnesi, FinalSahnesi, BulutSahnesi, MiniOyunlarSahnesi, SansCarkiSahnesi, ...Object.values(MINI_OYUNLAR)],
  });
});
