// Mini oyunların ortak listesi.
//
// Her mini oyun kendi klasöründe durur (minioyunlar/<ad>/oyun.js) ve kendini buraya
// miniOyunKaydet() ile ekler. Mini oyun bir Phaser sahnesidir; açılırken şu bilgiyi alır:
//   { harf: "a", seviye: 1 }
// Bitince sonucu (başardı mı) çağırana bildirir. Kazanınca damla parçası gelir; kaybetmek
// mümkündür (öğretmenin kararı): canlar biterse parça gelmez, "Bir daha dene" çıkar.
//
// PLANLANAN_OYUNLAR: menüde görünen sıra. Henüz yapılmamış olanların kartında "Yakında" yazar.

const PLANLANAN_OYUNLAR = [
  { ad: "damla-yakala", baslik: "Damla Yakalama" },
  { ad: "harf-balonlari", baslik: "Harf Balonları" },
  { ad: "harfi-ciz", baslik: "Harfi Çiz" },
  { ad: "resimden-ses", baslik: "Resimden Sesi Bul" },
  { ad: "hafiza-kartlari", baslik: "Hafıza Kartları" },
  { ad: "hece-koprusu", baslik: "Hece Köprüsü" },
  { ad: "heceyi-bul", baslik: "Heceyi Bul" },
];

// Yapılmış mini oyunlar: ad -> sahne sınıfı
const MINI_OYUNLAR = {};

function miniOyunKaydet(ad, sahneSinifi) {
  MINI_OYUNLAR[ad] = sahneSinifi;
}

// Benzer (karışabilen) harfler: zor seviyelerde yanlış seçenek olarak çıkar. Yalnızca
// öğrenilmiş harflerden seçilir (bkz. ogrenilmisHarfler).
const BENZER_HARFLER = {
  a: ["e", "o"], e: ["a", "o"], i: ["l", "ı", "t"], l: ["i", "t", "ı"], t: ["l", "i"],
  n: ["m", "u", "r"], o: ["a", "e", "ö"], k: ["t", "l"], u: ["n", "ü"], r: ["n"],
};

// Bu harfin grubuna kadar öğrenilmiş harfler (o harfin kendisi dahil)
function ogrenilmisHarfler(harf) {
  const grup = HARFLER.find((h) => h.kucuk === harf).grup;
  return HARFLER.filter((h) => h.grup <= grup).map((h) => h.kucuk);
}

// Ünlüler tek başına söylenir. Ünsüzün tek başına okunuşu (tarayıcı "ne", "te" der) ses
// esaslı yönteme uymadığı için ünsüzde kapalı hecesi söylenir ("an", "at", "al").
function harfiSoyle(harf, bitince) {
  const bilgi = HARFLER.find((h) => h.kucuk === harf);
  if (!bilgi) return;
  Sesler.soyle(bilgi.unlu || !bilgi.hece ? harf : bilgi.hece, bitince);
}

const UNSUZ_ACIKLAMASI = "Bu sesi tek başına okumam kolay değil, o yüzden biraz yardım almam gerekiyor.";

// Bütün mini oyunların ortak parçaları: kâğıt zemin, geri düğmesi, canlar (kalpler),
// ilerleme çubuğu ve bitiş penceresi ("Aferin!" ya da "Bir daha dene").
class MiniOyunSahnesi extends Phaser.Scene {
  init(veri) {
    this.harf = veri.harf || "a";
    this.seviye = veri.seviye || 1;
    this.donus = veri.donus || "MiniOyunlarSahnesi";
    this.veri = veri;
    this.bitti = false;
  }

  preload() {
    for (const ad of ["kalp", "kalp-bos", "onay-pencere", "incele-dugmesi", "doku-kagit"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  ortakKur() {
    this.cameras.main.fadeIn(300, 251, 247, 236);
    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0).setDepth(-10);
    const geri = this.add.container(1180, 46, [
      this.add.image(0, 0, "incele-dugmesi").setScale(0.8),
      doodleYazi(this, 0, -3, "Geri", 26).setOrigin(0.5),
    ]).setSize(140, 46).setDepth(900).setInteractive({ useHandCursor: true });
    geri.on("pointerdown", () => this.geriDon());
  }

  // Sol üstte canlar
  kalpleriKur(sayi = 3) {
    this.canSayisi = sayi;
    this.kalpler = [];
    for (let i = 0; i < sayi; i++) {
      this.kalpler.push(this.add.image(40 + i * 52, 44, "kalp").setDepth(900));
    }
  }

  // Bir can gider. Can kalmadıysa oyun biter (kaybetme).
  kalpEksilt() {
    if (this.bitti || this.canSayisi <= 0) return;
    this.canSayisi--;
    const kalp = this.kalpler[this.canSayisi];
    kalp.setTexture("kalp-bos");
    this.tweens.add({ targets: kalp, scale: 1.4, duration: 120, yoyo: true });
    this.cameras.main.shake(150, 0.004);
    Sesler.yanlis();
    if (this.canSayisi === 0) this.time.delayedCall(500, () => this.bitir(false));
  }

  // Sağ üstte (geri düğmesinin solunda) ilerleme çubuğu: kaç doğru yapıldı
  ilerlemeKur(hedef) {
    this.ilerlemeHedef = hedef;
    this.ilerleme = 0;
    this.ilerlemeCizim = this.add.graphics().setDepth(900);
    this.ilerlemeYazi = this.add.text(960, 76, "", {
      fontFamily: "Andika", fontSize: "22px", color: "#6b6b6b",
    }).setOrigin(0.5).setDepth(900);
    this.ilerlemeyiCiz();
  }

  ilerlemeyiCiz() {
    const g = this.ilerlemeCizim;
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(860, 30, 200, 30, 15);
    g.fillStyle(0x7cc4ef, 1);
    const en = (196 * this.ilerleme) / this.ilerlemeHedef;
    if (en > 0) g.fillRoundedRect(862, 32, Math.max(en, 26), 26, 13);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(860, 30, 200, 30, 15);
    this.ilerlemeYazi.setText(`${this.ilerleme} / ${this.ilerlemeHedef}`);
  }

  // Bir doğru daha. Hedefe varınca oyun biter (kazanma).
  ilerlemeArtir() {
    if (this.bitti) return;
    this.ilerleme++;
    this.ilerlemeyiCiz();
    if (this.ilerleme >= this.ilerlemeHedef) this.time.delayedCall(400, () => this.bitir(true));
  }

  // Oyun biter: "Aferin!" ya da "Bir daha dene"; "Tekrar" ve "Geri" düğmeleri
  bitir(basarili) {
    if (this.bitti) return;
    this.bitti = true;
    this.oyunBitti(basarili); // her oyun kendi hareketlerini durdurur
    if (basarili) Sesler.dogru();
    const kap = this.add.container(0, 0).setDepth(1000).setAlpha(0);
    const karartma = this.add.graphics();
    karartma.fillStyle(0x000000, 0.35);
    karartma.fillRect(0, 0, 1280, 720);
    // onay-pencere.svg: 540x320, düğmeler (155,240) ve (385,240)
    const kart = this.add.image(370, 200, "onay-pencere").setOrigin(0);
    const baslik = doodleYazi(this, 640, 300, basarili ? "Aferin!" : "Bir daha dene", 52,
      basarili ? "mavi" : "beyaz").setOrigin(0.5);
    const tekrar = doodleYazi(this, 525, 438, "Tekrar", 38).setOrigin(0.5);
    const geri = doodleYazi(this, 755, 438, "Geri", 38).setOrigin(0.5);
    kap.add([karartma, kart, baslik, tekrar, geri]);
    this.tweens.add({ targets: kap, alpha: 1, duration: 250 });
    const tekrarAlani = this.add.zone(525, 440, 190, 80).setDepth(1001).setInteractive({ useHandCursor: true });
    const geriAlani = this.add.zone(755, 440, 190, 80).setDepth(1001).setInteractive({ useHandCursor: true });
    tekrarAlani.on("pointerdown", () => this.scene.restart(this.veri));
    geriAlani.on("pointerdown", () => this.geriDon());
  }

  // Oyunun başında harfi tanıtır, bitince() çağrılır. Ünlüde harf söylenir. Ünsüzde önce
  // açıklama yazılır ve söylenir; sonra hecenin öbür harfi ("a") yay çizerek gelip ünsüzün
  // önüne yerleşir ve oluşan kapalı hece söylenir.
  harfiTanit(bitince) {
    const bilgi = HARFLER.find((h) => h.kucuk === this.harf);
    if (!bilgi || bilgi.unlu || !bilgi.hece) {
      harfiSoyle(this.harf);
      this.time.delayedCall(900, bitince);
      return;
    }
    const kap = this.add.container(0, 0).setDepth(950);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(250, 150, 780, 420, 30);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(250, 150, 780, 420, 30);
    const aciklama = this.add.text(640, 235, UNSUZ_ACIKLAMASI, {
      fontFamily: "Andika", fontSize: "32px", color: "#2b2b2b", align: "center",
      wordWrap: { width: 700 },
    }).setOrigin(0.5);
    const harfStili = {
      fontFamily: "Andika", fontSize: "140px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 16, padding: { x: 6, y: 6 },
    };
    const unsuz = boyaliOrtala(titret(this.add.text(640, 430, this.harf, harfStili), 2.5));
    kap.add([g, aciklama, unsuz]).setAlpha(0);
    this.tweens.add({ targets: kap, alpha: 1, duration: 250 });

    // Hecede ünsüzün yanındaki harf (kapalı hecede önde: "a" + "n")
    const yardimci = bilgi.hece.replace(this.harf, "");
    const yardimciOnde = bilgi.hece.indexOf(yardimci) === 0;
    Sesler.soyle(UNSUZ_ACIKLAMASI, () => {
      if (!kap.active) return;
      const gelen = boyaliOrtala(titret(this.add.text(yardimciOnde ? 140 : 1140, 300, yardimci, harfStili), 2.5));
      gelen.setScale(0.4).setAngle(-200);
      kap.add(gelen);
      const hedefX = yardimciOnde ? 588 : 692;
      this.tweens.add({ targets: unsuz, x: yardimciOnde ? 692 : 588, duration: 500, ease: "Cubic.Out" });
      this.tweens.add({ targets: gelen, x: hedefX, scale: 1, angle: 0, duration: 900, ease: "Back.Out" });
      this.tweens.add({ targets: gelen, y: 250, duration: 450, ease: "Quad.Out", yoyo: true,
        onComplete: () => gelen.setY(430) });
      Sesler.pling();
      this.time.delayedCall(1000, () => {
        if (!kap.active) return;
        // Hece birleşti: ikisi birlikte zıplar, hece söylenir
        this.tweens.add({ targets: [gelen, unsuz], scale: 1.15, duration: 160, yoyo: true });
        Sesler.soyle(bilgi.hece, () => {
          if (!kap.active) return; // bu arada oyundan çıkıldıysa
          this.time.delayedCall(500, () => {
            this.tweens.add({ targets: kap, alpha: 0, duration: 300, onComplete: () => {
              kap.destroy();
              bitince();
            } });
          });
        });
      });
    });
  }

  oyunBitti() {}

  geriDon() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.scene.start(this.donus);
  }
}
