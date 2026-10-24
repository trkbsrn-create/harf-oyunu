// Mini oyun: Resimden Sesi Bul (harf kelimenin neresinde?)
// Öğretmenin isteği: düzeye göre harfin kelimedeki yeri sorulur. 1. düzey: harf başında,
// 2. düzey: sonunda, 3. düzey: ortasında olan resmi bul. Kelimeler kelimeler.js'de.
// Oyun başında önce harf büyükçe gelir ve sesi söylenir, sonra üç kutudan harfin yeri gösterilir
// ve söylenir ("Başında a olan resimleri bul!"; ünsüzde cümlede "bu harf" denir).
// Sonra harf ve kutular üstteki panele küçülür, sorular başlar. Her soruda bir doğru resim var;
// yanlış resimlerde o harf (ve onunla karışan ses: i/ı) hiç geçmez. Kartın köşesindeki hoparlör
// resmin adını okur.
// Yanlış resim bir can götürür.

const RESIMDEN_SES_SEVIYELERI = {
  1: { konum: "bas", tur: 6, kart: 3 },
  2: { konum: "son", tur: 6, kart: 3 },
  3: { konum: "orta", tur: 6, kart: 4 },
};
const KONUM_KUTUSU = { bas: 0, orta: 1, son: 2 };

class ResimdenSesSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("resimden-ses");
  }

  preload() {
    super.preload();
    for (const k of RESIMLI_KELIMELER) {
      const ad = kelimeResmi(k);
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.ortakKur();
    this.ayar = RESIMDEN_SES_SEVIYELERI[this.seviye] || RESIMDEN_SES_SEVIYELERI[1];
    // "Tekrar" ile yeniden açılınca eski turdan kalmasın
    this.cevaplandi = false;
    this.basladi = false;
    this.kartlar = [];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.konum = konumSec(this.harf, this.ayar.konum);
    const liste = (KONUMLU_KELIMELER[this.harf] || KONUMLU_KELIMELER.a)[this.konum];
    this.dogrular = Phaser.Utils.Array.Shuffle(liste.slice());
    this.dogruSira = 0;
    // Yanlış resimlerde harf (ve onunla karışabilen ses, ör. i için ı) hiç geçmez
    const yasak = [this.harf, ...(KARISAN_SESLER[this.harf] || [])];
    this.yanlislar = RESIMLI_KELIMELER.filter((k) => !yasak.some((h) => k.includes(h)));
    const bilgi = HARFLER.find((h) => h.kucuk === this.harf);
    this.yonerge = `${KONUM_ADLARI[this.konum]} ${bilgi && bilgi.unlu ? this.harf : "bu harf"} olan resimleri bul!`;

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.hoparlor) Sesler.soyle(nesne.hoparlor);
      else if (nesne.kart) this.kartaDokun(nesne);
      else if (nesne === this.soru && this.basladi) Sesler.soyle(this.yonerge);
    });
    this.time.delayedCall(400, () => this.tanit());
  }

  // Harf ve yeri: üç kutu, harf kendi kutusunda (sarı). olcek: kutu boyu
  kutularYap(boy) {
    const kap = this.add.container(0, 0);
    const en = boy * 0.84;
    const aralik = en + boy * 0.18;
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * aralik;
      const dolu = i === KONUM_KUTUSU[this.konum];
      const g = this.add.graphics();
      g.fillStyle(dolu ? 0xffe680 : 0xfffdf6, 1);
      g.fillRoundedRect(x - en / 2, -boy / 2, en, boy, boy * 0.18);
      g.lineStyle(Math.max(4, boy * 0.05), 0x2b2b2b, 1);
      g.strokeRoundedRect(x - en / 2, -boy / 2, en, boy, boy * 0.18);
      kap.add(g);
      if (dolu) {
        kap.harfYazisi = boyaliOrtala(this.add.text(x, 0, this.harf, {
          fontFamily: "Andika", fontSize: `${Math.round(boy * 0.72)}px`, color: "#2b2b2b", padding: { x: 4, y: 4 },
        }));
        kap.add(kap.harfYazisi);
      }
    }
    return kap;
  }

  // Oyun başı: önce harf, sonra yeri söylenir; sonra üstteki panele küçülür ve sorular başlar
  tanit() {
    const harf = boyaliOrtala(titret(this.add.text(640, 260, this.harf, {
      fontFamily: "Andika", fontSize: "170px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 16, padding: { x: 6, y: 6 },
    }), 3)).setDepth(20).setScale(0);
    this.tweens.add({ targets: harf, scale: 1, duration: 380, ease: "Back.Out" });
    harfiSoyle(this.harf);
    const kutular = this.kutularYap(110).setPosition(640, 470).setDepth(20).setAlpha(0);
    const kutuHarfi = kutular.harfYazisi;
    // Harf kutusuna büyük harften iner
    this.time.delayedCall(1100, () => {
      this.tweens.add({ targets: kutular, alpha: 1, duration: 250 });
      const hedefX = kutular.x + kutuHarfi.x;
      kutuHarfi.setVisible(false);
      const ucan = boyaliOrtala(this.add.text(harf.x, harf.y, this.harf, {
        fontFamily: "Andika", fontSize: "79px", color: "#2b2b2b", padding: { x: 4, y: 4 },
      })).setDepth(21).setScale(2);
      this.tweens.add({ targets: ucan, x: hedefX, y: kutular.y + kutuHarfi.y, scale: 1, duration: 600, ease: "Cubic.InOut",
        onComplete: () => {
          ucan.destroy();
          kutuHarfi.setVisible(true);
          Sesler.nota(880, 0, 0.12, 0.12);
          this.tweens.add({ targets: kutuHarfi, scale: 1.25, duration: 160, yoyo: true });
          Sesler.soyle(this.yonerge, () => this.time.delayedCall(300, () => panele()));
        } });
    });
    // Panele küçül: üstte hoparlör ve kutular kalır
    const panele = () => {
      if (this.bitti || this.basladi) return;
      this.basladi = true;
      this.tweens.add({ targets: harf, alpha: 0, scale: 0.5, duration: 300, onComplete: () => harf.destroy() });
      this.soru = this.add.container(640, 175).setDepth(5).setScale(0.6).setAlpha(0);
      const zemin = this.add.graphics();
      zemin.fillStyle(0xfffdf6, 1);
      zemin.fillRoundedRect(-200, -62, 400, 124, 24);
      zemin.lineStyle(5, 0x2b2b2b, 1);
      zemin.strokeRoundedRect(-200, -62, 400, 124, 24);
      this.soru.add([zemin, this.hoparlorCiz(-140, 0, 34), this.kutularYap(84).setPosition(40, 0)]);
      this.soru.setSize(400, 124).setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: kutular, x: 680, y: 175, scale: 84 / 110, alpha: 0, duration: 400, ease: "Cubic.InOut",
        onComplete: () => kutular.destroy() });
      this.tweens.add({ targets: this.soru, scale: 1, alpha: 1, duration: 350, delay: 200, ease: "Back.Out",
        onComplete: () => this.yeniTur() });
    };
    // Söz hiç bitmezse de oyun başlasın
    this.time.delayedCall(7000, () => panele());
  }

  yeniTur() {
    if (this.bitti) return;
    for (const k of this.kartlar) k.destroy();
    this.kartlar = [];
    // Doğru kelime: karışık listeden sırayla (liste biterse yeniden karıştırılır)
    if (this.dogruSira >= this.dogrular.length) {
      const son = this.dogrular[this.dogrular.length - 1];
      this.dogrular = Phaser.Utils.Array.Shuffle(this.dogrular.slice());
      if (this.dogrular[0] === son && this.dogrular.length > 1) this.dogrular.push(this.dogrular.shift());
      this.dogruSira = 0;
    }
    const dogru = this.dogrular[this.dogruSira++];
    const yanlislar = Phaser.Utils.Array.Shuffle(this.yanlislar.slice()).slice(0, this.ayar.kart - 1);
    const secenekler = Phaser.Utils.Array.Shuffle([dogru, ...yanlislar]);
    const aralik = this.ayar.kart === 4 ? 260 : 300;
    secenekler.forEach((k, i) => {
      const x = 640 + (i - (secenekler.length - 1) / 2) * aralik;
      this.kartlar.push(this.kartYap(x, 470, k, k === dogru, i * 90));
    });
    this.tweens.add({ targets: this.soru, scale: 1.08, duration: 160, yoyo: true });
    // İlk turda gösteren el doğru kartı gösterir (bir kez)
    this.time.delayedCall(secenekler.length * 90 + 500, () => this.elGoster(this.kartlar.find((k) => k.kart.dogru)));
  }

  kartYap(x, y, kelime, dogru, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-104, -98, 216, 204, 22);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-110, -104, 216, 204, 22);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(-110, -104, 216, 204, 22);
    const resim = this.add.image(-2, -8, kelimeResmi(kelime));
    resim.setScale(Math.min(160 / resim.width, 150 / resim.height));
    const hoparlor = this.add.container(78, 72, [this.hoparlorCiz(0, 0, 20)]).setSize(72, 72)
      .setInteractive({ useHandCursor: true });
    hoparlor.hoparlor = kelime;
    kap.add([g, resim, hoparlor]);
    kap.cerceve = g;
    kap.setSize(216, 204).setInteractive({ useHandCursor: true });
    kap.kart = { dogru, kelime };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 280, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  kartaDokun(kap) {
    if (this.bitti || this.cevaplandi || kap.kart.secildi) return;
    kap.kart.secildi = true;
    const g = kap.cerceve;
    if (kap.kart.dogru) {
      this.cevaplandi = true;
      g.lineStyle(9, 0x8fd16a, 1);
      g.strokeRoundedRect(-110, -104, 216, 204, 22);
      Sesler.pling();
      this.tweens.add({ targets: kap, scale: 1.1, duration: 160, yoyo: true });
      this.time.delayedCall(500, () => Sesler.soyle(kap.kart.kelime));
      this.ilerlemeArtir(kap.x, kap.y);
      this.time.delayedCall(1700, () => {
        this.cevaplandi = false;
        this.yeniTur();
      });
    } else {
      g.lineStyle(9, 0xff8a7a, 1);
      g.strokeRoundedRect(-110, -104, 216, 204, 22);
      this.tweens.add({ targets: kap, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => kap.setAngle(0) });
      kap.setAlpha(0.55);
      this.kalpEksilt();
      this.ipucuGoster(this.kartlar.find((k) => k.kart.dogru));
    }
  }

  oyunBitti() {
    for (const k of this.kartlar) k.disableInteractive();
  }
}

miniOyunKaydet("resimden-ses", ResimdenSesSahnesi);
