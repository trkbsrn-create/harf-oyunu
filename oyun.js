// Oyunun ana kodu: büyük bir ada ve adada gezen ana karakter.

const DUNYA_GENISLIK = 6400;
const DUNYA_YUKSEKLIK = 3600;
const YURUME_HIZI = 260; // saniyede piksel
const BASLANGIC_X = DUNYA_GENISLIK / 2;
const BASLANGIC_Y = DUNYA_YUKSEKLIK / 2 + 120;
const SENSOR_MENZILI = 1600; // sandığa bu kadar yaklaşınca bip sesi başlar
// Hazine pusulası: dış halka her zaman silik yanar; ortanca halka sandığa bu kadar
// yaklaşınca (yaklaşık bir buçuk ekran), iç halka bu kadar yaklaşınca (yarım ekran) yanar.
const PUSULA_ORTA = 1900;
const PUSULA_YAKIN = 640;
const SANDIK_CIKMA_UZAKLIGI = 110; // sandık ancak saklandığı yerin bu kadar yanında çıkar
// "Oyunu yeniden başlat" deyince sayfa yenilenir; bu tek seferlik not karşılama ekranını atlatır
const HEMEN_BASLA = "harfAvcisiHemenBasla";

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
    for (let i = 1; i <= 3; i++) this.load.svg(`aura-halka${i}`, `gorseller/aura-halka${i}.svg`);
    for (const ad of ["canta-pencere", "dusunce-balonu", "guc-bandi",
      "doku-kagit", "doku-deniz", "doku-kum", "doku-cimen",
      "menu-dugmesi", "menu-kapat", "menu-pencere", "onay-pencere"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
    this.load.svg("mikrofon", "gorseller/mikrofon.svg");
    this.load.svg("ari", "gorseller/ari.svg");
    this.load.svg("nar", "gorseller/nar.svg");
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
    this.menuKur();
    this.cameras.main.fadeIn(400, 251, 247, 236);

    this.input.on("pointerdown", (p) => {
      Sesler.ac();
      if (this.menuTiklamasi(p)) return;
      if (this.cantaTiklamasi(p)) return;
      if (this.sandik && this.sandikGorundu && !this.sandikAcildi
          && this.sandik.getBounds().contains(p.worldX, p.worldY)) {
        this.sandigiAc();
        return;
      }
      this.hedefBelirle(p.worldX, p.worldY, true);
    });
    this.input.on("pointermove", (p) => {
      if (p.isDown && !this.cantaAcik && !this.menuAcik) this.hedefBelirle(p.worldX, p.worldY, false);
    });
    this.input.keyboard.on("keydown", () => Sesler.ac());
    this.input.keyboard.addCapture("SPACE");
    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.menuAcik) this.cantayiAcKapat();
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
        stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
      }).setOrigin(0.5);
      titret(harf, 1.5);
      this.cantaIcerigi.add([resim, harf]);
    });
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
      if (this.cantaAcik) this.cantayiAcKapat();
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

    // Ünlüler (ve öğretmenin kararıyla tek başına denenen ünsüzler): harf,
    // uzatılmış sesle dolan bir çubuğa dönüşür
    // Tınısı tanınabilen ünlüler ("a"): önce harf söylenir ve oyun düşünür; doğruysa
    // "gücünü göster" aşamasında harf uzatılarak doldurulur.
    const tanirim = Boolean(Dinleyici.UNLU_KURALLARI[harf]);
    if (tanirim && await Dinleyici.olcerHazirla()) {
      const sonuc = await this.harfiSoyletVeGucGoster(harfBilgisi, yazi, mikrofon);
      const kaldir = [mikrofon, ...sonuc.ipucu];
      this.tweens.add({ targets: kaldir, scale: 0, alpha: 0, duration: 250,
        onComplete: () => kaldir.forEach((n) => n.destroy()) });
      this.tohumuKazan(harf, yazi, hale, isik, !sonuc.dogru);
      return;
    }

    const uzatilir = harfBilgisi.unlu || harfBilgisi.tekBasinaDenenir;
    if (uzatilir && await Dinleyici.olcerHazirla()) {
      const sonuc = await this.harfiDoldur(harfBilgisi, yazi, mikrofon);
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

  // "a" için iki aşama:
  // 1) Çocuk harfi söyler, oyun "düşünür" (düşünce balonu). Yarım saniye net ses ya da
  //    Chrome'un tanıdığı bir kelime ("araba", ipucundan sonra "arı") doğru sayılır.
  //    (Tını kuralı gerçek seslerde "a"yı reddettiği için şimdilik kullanılmıyor;
  //    mikrofon.html'deki ölçümlerle ayarlanınca yeniden denenebilir.)
  //    3 denemede olmazsa ipucu (resim; kelime de kabul), 5 denemede kendiliğinden onay.
  // 2) Doğruysa "Tohumu kazanmak için gücünü göster!" yazısı çıkar; harf her net sesle
  //    uzatıldıkça dolar (bu aşama titiz değil). 30 sn'de dolmazsa kendiliğinden dolar.
  async harfiSoyletVeGucGoster(harfBilgisi, yazi, mikrofon) {
    const harf = harfBilgisi.kucuk;
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
          if (sesKaresi * 40 >= Dinleyici.ILK_ONAY_SURESI && sessizlik > 350) break; // söyledi, sustu
        }
        mikrofon.setScale(ses ? 1.15 + 0.1 * Math.sin(simdi / 60) : 1);
      }
      mikrofon.setScale(1);

      // Düşünme efekti: oyun sesi tartar (hiç ses yoksa düşünecek bir şey de yok)
      const balon = sesKaresi >= 3 ? this.dusunceBalonu(yazi) : null;
      const [metinler] = await Promise.all([kelimeSozu, this.bekle(balon ? 1100 : 0)]);
      const sesDogru = sesKaresi * 40 >= Dinleyici.ILK_ONAY_SURESI;
      const kelimeDogru = Dinleyici.dogruMu(metinler, harf, harfBilgisi.kelime);
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
      { ipucuYok: true, onaySuresi: 30000, otomatikDogru: true });
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
    }).setOrigin(0.5).setDepth(6001.5).setScale(yazi.scale);
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

      if (sesUygun()) {
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
    const calilar = susler.filter((s) => s.tur === "cali");
    const uzaklik = (s, x, y) => Math.hypot(s.x - x, s.y - y);
    // a: başlangıçtan yaklaşık 2000 px uzakta
    const caliA = calilar.reduce((a, b) =>
      Math.abs(uzaklik(a, BASLANGIC_X, BASLANGIC_Y) - 2000)
        < Math.abs(uzaklik(b, BASLANGIC_X, BASLANGIC_Y) - 2000) ? a : b);
    // n: başlangıçtan da uzak, a'nın sandığından da olabildiğince uzak
    const adaylar = calilar.filter((s) => uzaklik(s, BASLANGIC_X, BASLANGIC_Y) > 1500);
    const caliN = adaylar.reduce((a, b) =>
      uzaklik(a, caliA.x, caliA.y) > uzaklik(b, caliA.x, caliA.y) ? a : b);

    this.sandiklar = [[HARFLER[0], caliA], [HARFLER[1], caliN]].map(([harfBilgisi, cali]) => ({
      harfBilgisi,
      cali,
      nesne: this.add.image(cali.x + 8, cali.y - 24, "sandik-kapali")
        .setOrigin(0.5, 1).setDepth(cali.y - 1).setAlpha(0),
    }));
    this.siradakiSira = 0;
    this.siradakiSandik();
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
    if (isaretGoster) {
      const isaret = this.add.circle(x, y, 14).setStrokeStyle(4, 0x2b2b2b).setDepth(5000);
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

    if (this.donuk || this.cantaAcik || this.menuAcik) {
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

// Karşılama ekranı: denizde küçük bir ada, oyunun adı ve "Oyunu başlat" düğmesi.
// Düğmeye basınca oyunun sesleri açılır ve ada sahnesi başlar.
class KarsilamaSahnesi extends Phaser.Scene {
  constructor() {
    super("KarsilamaSahnesi");
  }

  preload() {
    for (const ad of ["doku-kagit", "doku-deniz", "doku-kum", "doku-cimen",
      "agac-govde", "agac-tepe", "cocuk", "baslik-tabela", "dugme-baslat"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
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

  basla(dugme) {
    if (this.basladi) return;
    this.basladi = true;
    Sesler.ac();
    Sesler.pling();
    this.nabiz.stop();
    this.tweens.add({ targets: dugme, scale: 0.92, duration: 90, yoyo: true });
    this.cameras.main.fadeOut(350, 251, 247, 236);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("AdaSahnesi"));
  }
}

// Yazı tipi yüklendikten sonra oyunu başlat (yoksa yazı yanlış görünür).
document.fonts.load('72px "Andika"').finally(() => {
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
    scene: [KarsilamaSahnesi, AdaSahnesi],
  });
});
