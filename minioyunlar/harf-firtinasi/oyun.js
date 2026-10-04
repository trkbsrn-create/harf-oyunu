// Mini oyun: Harf Fırtınası (art arda minik görevler, WarioWare tarzı)
// Kısa görevler art arda gelir; her birinin önce adı görünür ("Dokun!", "Patlat!"...), sonra
// birkaç saniyelik süre çubuğu akar. Görevler:
//   Dokun!  : üç daireden istenen harfe dokun
//   Patlat! : yükselen balonlardan istenen harfi patlat
//   Seç!    : söylenen heceyi iki karttan seç
//   Resim!  : resmin ilk sesini iki harften seç
//   Yakala! : düşen damlalardan istenen harfi yere değmeden yakala
// Süre biterse ya da yanlış seçilirse bir can gider, sıradaki göreve geçilir.
// Seviyeler: 1: 8 görev, 6 sn; 2: 10 görev, 5 sn; 3: 12 görev, 4 sn (benzer harfler).

const FIRTINA_SEVIYELERI = {
  1: { hedef: 8, sure: 6000, benzer: false },
  2: { hedef: 10, sure: 5000, benzer: false },
  3: { hedef: 12, sure: 4200, benzer: true },
};

const FIRTINA_GOREVLERI = ["dokun", "patlat", "sec", "resim", "yakala"];
const FIRTINA_BASLIK = { dokun: "Dokun!", patlat: "Patlat!", sec: "Seç!", resim: "Resim!", yakala: "Yakala!" };
const FIRTINA_RENKLERI = [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c, 0xffc58f];

class HarfFirtinasiSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("harf-firtinasi");
  }

  preload() {
    super.preload();
    this.load.svg("balon", "gorseller/balon.svg");
    this.load.svg("damla", "gorseller/damla.svg");
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = FIRTINA_SEVIYELERI[this.seviye] || FIRTINA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.hedef);
    this.heceler = heceHavuzu(this.harf);
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    this.resimliler = HARFLER.filter((h) => h.resim && h.harfKelimeBasinda !== false && ogrenilmis.includes(h.kucuk));
    this.oncekiGorev = null;
    this.gorevKap = null;
    this.baslikYazi = null;
    this.sureCizim = this.add.graphics().setDepth(900);
    this.kalanSure = 0;
    this.gorevde = false;
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniGorev()));
  }

  yanlisHarfler(dogru, sayi) {
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== dogru);
    const benzer = this.ayar.benzer ? (BENZER_HARFLER[dogru] || []).filter((h) => ogrenilmis.includes(h)) : [];
    const sonuc = [];
    for (const h of [...Phaser.Utils.Array.Shuffle(benzer.slice()), ...Phaser.Utils.Array.Shuffle(ogrenilmis.slice())]) {
      if (sonuc.length < sayi && !sonuc.includes(h)) sonuc.push(h);
    }
    return sonuc;
  }

  harfYazi(x, y, harf, boyut) {
    return boyaliOrtala(titret(this.add.text(x, y, harf, {
      fontFamily: "Andika", fontSize: `${boyut}px`, color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: Math.round(boyut / 6.5), padding: { x: 4, y: 4 },
    }), 1.6));
  }

  yeniGorev() {
    if (this.bitti) return;
    if (this.gorevKap) this.gorevKap.destroy();
    if (this.baslikYazi) this.baslikYazi.destroy();
    this.sureCizim.clear();
    let tur;
    // "Seç!" hece görevidir; a ve n'de hece olmadığı için çıkmaz
    const gorevler = FIRTINA_GOREVLERI.filter((g) => g !== "sec" || heceOyunuOlur(this.harf));
    do { tur = Phaser.Utils.Array.GetRandom(gorevler); } while (tur === this.oncekiGorev);
    if (tur === "resim" && !this.resimliler.length) tur = "dokun";
    this.oncekiGorev = tur;
    this.gorevKap = this.add.container(0, 0).setDepth(10);
    this.dusenler = [];

    // Görevin adı büyükçe görünür, sonra görev başlar
    const ad = doodleYazi(this, 640, 330, FIRTINA_BASLIK[tur], 96, "mavi").setOrigin(0.5).setDepth(50).setScale(0);
    Sesler.nota(880, 0, 0.08, 0.1, "square");
    Sesler.nota(1175, 0.1, 0.12, 0.1, "square");
    this.tweens.add({ targets: ad, scale: 1, duration: 220, ease: "Back.Out", hold: 450, yoyo: true,
      onComplete: () => {
        ad.destroy();
        if (this.bitti) return;
        this.baslikYazi = doodleYazi(this, 640, 140, FIRTINA_BASLIK[tur], 44, "mavi").setOrigin(0.5).setDepth(20);
        this[`${tur}Kur`]();
        this.kalanSure = this.ayar.sure;
        this.gorevde = true;
      } });
  }

  // Dokunulabilir seçenek kutusu (daire ya da kart)
  secenek(x, y, icerik, dogru, sekil = "daire") {
    const kap = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(Phaser.Utils.Array.GetRandom(FIRTINA_RENKLERI), 1);
    g.lineStyle(5, 0x2b2b2b, 1);
    if (sekil === "daire") { g.fillCircle(0, 0, 80); g.strokeCircle(0, 0, 80); }
    else { g.fillRoundedRect(-95, -70, 190, 140, 20); g.strokeRoundedRect(-95, -70, 190, 140, 20); }
    kap.add([g, icerik]);
    kap.setSize(190, 170).setInteractive({ useHandCursor: true });
    kap.dogru = dogru;
    kap.on("pointerdown", () => this.cevap(dogru, kap));
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 200, ease: "Back.Out" });
    this.gorevKap.add(kap);
    return kap;
  }

  dokunKur() {
    harfiSoyle(this.harf);
    const harfler = Phaser.Utils.Array.Shuffle([this.harf, ...this.yanlisHarfler(this.harf, 2)]);
    harfler.forEach((h, i) => {
      const k = this.secenek(380 + i * 260, 430, this.harfYazi(0, 0, h, 90), h === this.harf);
      if (h === this.harf) this.elGoster(k);
    });
  }

  patlatKur() {
    harfiSoyle(this.harf);
    const harfler = Phaser.Utils.Array.Shuffle([this.harf, ...this.yanlisHarfler(this.harf, 3)]);
    harfler.forEach((h, i) => {
      const kap = this.add.container(290 + i * 235, 720);
      const resim = this.add.image(0, 23, "balon").setTint(FIRTINA_RENKLERI[i % FIRTINA_RENKLERI.length]).setScale(1.4);
      kap.add([resim, this.harfYazi(0, 0, h, 58)]);
      kap.setSize(120, 130).setInteractive({ useHandCursor: true });
      kap.dogru = h === this.harf;
      kap.on("pointerdown", () => {
        if (h === this.harf) {
          Sesler.pat();
          kap.setVisible(false);
        }
        this.cevap(h === this.harf, kap);
      });
      this.tweens.add({ targets: kap, y: 360 + (i % 2) * 60, duration: 1400, ease: "Sine.Out" });
      this.gorevKap.add(kap);
    });
  }

  secKur() {
    const { hedef, secenekler } = heceSorusu(this.heceler, this.harf, this.seviye, 2, this.seviye >= 3 ? 0.4 : 0, null);
    Sesler.soyle(hedef);
    const hop = this.add.container(640, 250, [this.hoparlorCiz(0, 0, 34)]).setSize(80, 80).setInteractive({ useHandCursor: true });
    hop.on("pointerdown", () => Sesler.soyle(hedef));
    this.gorevKap.add(hop);
    secenekler.forEach((h, i) => this.secenek(500 + i * 280, 460, this.harfYazi(0, 0, h, 70), h === hedef, "kart"));
  }

  resimKur() {
    const bilgi = Phaser.Utils.Array.GetRandom(this.resimliler);
    const r = this.add.image(640, 290, bilgi.resim);
    r.setScale(Math.min(200 / r.width, 170 / r.height));
    this.gorevKap.add(r);
    const harfler = Phaser.Utils.Array.Shuffle([bilgi.kucuk, ...this.yanlisHarfler(bilgi.kucuk, 1)]);
    harfler.forEach((h, i) => this.secenek(500 + i * 280, 540, this.harfYazi(0, 0, h, 80), h === bilgi.kucuk, "kart"));
    this.resimBilgi = bilgi;
  }

  yakalaKur() {
    harfiSoyle(this.harf);
    const harfler = Phaser.Utils.Array.Shuffle([this.harf, ...this.yanlisHarfler(this.harf, 2)]);
    harfler.forEach((h, i) => {
      const kap = this.add.container(380 + i * 260, 250 + ((i * 2) % 3) * 30);
      kap.add([this.add.image(0, 0, "damla").setScale(2.2), this.harfYazi(0, 22, h, 50)]);
      kap.setSize(110, 130).setInteractive({ useHandCursor: true });
      kap.on("pointerdown", () => this.cevap(h === this.harf, kap));
      kap.dogru = h === this.harf;
      this.gorevKap.add(kap);
      this.dusenler.push(kap);
    });
  }

  update(zaman, fark) {
    if (this.bitti || !this.gorevde) return;
    this.kalanSure -= fark;
    // Düşen damlalar: doğru damla yere değerse görev kaçar
    for (const d of this.dusenler) {
      d.y += (480 / this.ayar.sure) * fark;
      if (d.dogru && d.y > 690) { this.cevap(false, null); return; }
    }
    // Süre çubuğu
    const g = this.sureCizim;
    g.clear();
    const oran = Math.max(0, this.kalanSure / this.ayar.sure);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(440, 182, 400, 22, 11);
    g.fillStyle(oran > 0.3 ? 0x7cc4ef : 0xff8a7a, 1);
    if (oran > 0) g.fillRoundedRect(442, 184, Math.max(20, 396 * oran), 18, 9);
    g.lineStyle(3, 0x2b2b2b, 1);
    g.strokeRoundedRect(440, 182, 400, 22, 11);
    if (this.kalanSure <= 0) this.cevap(false, null);
  }

  cevap(dogru, kap) {
    if (this.bitti || !this.gorevde) return;
    this.gorevde = false;
    if (dogru) {
      Sesler.pling();
      if (this.oncekiGorev === "resim") this.time.delayedCall(200, () => Sesler.soyle(this.resimBilgi.kelime));
      if (kap) this.tweens.add({ targets: kap, scale: 1.2, duration: 120, yoyo: true });
      this.ilerlemeArtir(kap ? kap.x : 640, kap ? kap.y : 400);
    } else {
      if (kap) this.tweens.add({ targets: kap, angle: { from: -10, to: 10 }, duration: 60, yoyo: true, repeat: 2 });
      this.kalpEksilt();
    }
    if (!this.bitti) this.time.delayedCall(900, () => this.yeniGorev());
  }

  oyunBitti() {
    this.gorevde = false;
  }
}

miniOyunKaydet("harf-firtinasi", HarfFirtinasiSahnesi);
