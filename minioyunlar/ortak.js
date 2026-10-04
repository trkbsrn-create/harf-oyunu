// Mini oyunların ortak listesi.
//
// Her mini oyun kendi klasöründe durur (minioyunlar/<ad>/oyun.js) ve kendini buraya
// miniOyunKaydet() ile ekler. Mini oyun bir Phaser sahnesidir; açılırken şu bilgiyi alır:
//   { harf: "a", seviye: 1 }
// Bitince sonucu (başardı mı) çağırana bildirir. Kazanınca damla parçası gelir; kaybetmek
// mümkündür (öğretmenin kararı): canlar biterse parça gelmez, "Bir daha dene" çıkar.
//
// PLANLANAN_OYUNLAR: menüde görünen sıra. Henüz yapılmamış olanların kartında "Yakında" yazar.
// etiketler: oyun neyin öğretimine uygun ("harf", "hece" ya da ikisi). İlk dağılımı Claude yaptı;
// öğretmen istedikçe değiştirir. Menüdeki kartın altında küçük etiket olarak görünür.

const PLANLANAN_OYUNLAR = [
  { ad: "damla-yakala", baslik: "Damla Yakalama", etiketler: ["harf", "hece"] },
  { ad: "harf-balonlari", baslik: "Harf Balonları", etiketler: ["harf", "hece"] },
  { ad: "harfi-yaz", baslik: "Harfi Yaz", etiketler: ["harf"] }, // 1. düzey şekillerle, 2-3. düzey çizerek
  { ad: "resimden-ses", baslik: "Resimden Sesi Bul", etiketler: ["harf"] },
  { ad: "hafiza-kartlari", baslik: "Hafıza Kartları", etiketler: ["harf"] },
  { ad: "hece-koprusu", baslik: "Hece Köprüsü", etiketler: ["hece"], gereken: "hece" },
  { ad: "heceyi-bul", baslik: "Heceyi Bul", etiketler: ["hece"], gereken: "hece" },
  // Öğretmenin fikirleri (sırayla yapılacak)
  { ad: "labirent", baslik: "Labirent", etiketler: ["hece"], gereken: "hece" },
  { ad: "seker-patlatma", baslik: "Şeker Patlatma", etiketler: ["hece"], gereken: "hece" },
  { ad: "kayak", baslik: "Kayak", etiketler: ["harf", "hece"] },
  { ad: "elektrik-devresi", baslik: "Elektrik Devresi", etiketler: ["hece"], gereken: "kelime" },
  { ad: "duvardan-gecme", baslik: "Duvardan Geçme", etiketler: ["harf", "hece"] },
  { ad: "hece-muzigi", baslik: "Hece Müziği", etiketler: ["hece"], gereken: "hece" },
  { ad: "scrabble", baslik: "Scrabble", etiketler: ["hece"], gereken: "kelime" },
  { ad: "ordek-vurma", baslik: "Ördek Vurma", etiketler: ["harf", "hece"] },
  { ad: "kazma", baslik: "Kazma", etiketler: ["harf", "hece"] },
  { ad: "altin-madencisi", baslik: "Altın Madencisi", etiketler: ["harf", "hece"] },
  { ad: "kazi-kazan", baslik: "Kazı Kazan", etiketler: ["harf"] },
  { ad: "tombala", baslik: "Tombala", etiketler: ["harf", "hece"] },
  { ad: "arabayi-ulastir", baslik: "Arabayı Ulaştır", etiketler: ["harf", "hece"] },
  { ad: "yakala-yaz", baslik: "Yakala ve Yaz", etiketler: ["hece"], gereken: "kelime" },
  { ad: "kirik-cam", baslik: "Kırık Cam", etiketler: ["harf"] },
  { ad: "bombayi-kurtar", baslik: "Bombayı Kurtar", etiketler: ["harf", "hece"] },
  { ad: "yilan", baslik: "Yılan", etiketler: ["harf", "hece"], gereken: "hece" },
  // Araştırmadan gelen yeni fikirler (taslak)
  { ad: "canavari-besle", baslik: "Canavarı Besle", etiketler: ["harf", "hece"] },
  { ad: "harf-kesme", baslik: "Harf Kesme", etiketler: ["harf"] },
  { ad: "hece-kulesi", baslik: "Hece Kulesi", etiketler: ["hece"], gereken: "hece" },
  { ad: "birlestir-buyut", baslik: "Birleştir Büyüt", etiketler: ["harf", "hece"], gereken: "hece" },
  { ad: "harfle-boya", baslik: "Harfle Boya", etiketler: ["harf"] },
  { ad: "harf-firtinasi", baslik: "Harf Fırtınası", etiketler: ["harf", "hece"] },
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

// Öğretmenin kuralı: harfler sırayla öğrenilir (a, n, e, t, i, l, ...). Hece ve kelime oyunlarında
// yalnızca bu harfe kadar (kendisi dahil) öğretilmiş harfler kullanılır: e'de a, n, e var; t, l yok.
// (Harf oyunlarında yanlış seçenekler için ogrenilmisHarfler kullanılmaya devam eder.)
function bilinenHarfler(harf) {
  const sira = HARFLER.findIndex((h) => h.kucuk === harf);
  return HARFLER.slice(0, sira + 1).map((h) => h.kucuk);
}

// Hece oyunu bu harfte oynanabilir mi: en az üç iki harfli hece gerekir (a'da hiç hece yok,
// n'de yalnızca an, na var; e'den başlar)
function heceOyunuOlur(harf) {
  return heceHavuzu(harf).filter((h) => h.hece.length === 2).length >= 3;
}

// Kelime oyunu bu harfte oynanabilir mi: bilinen harflerle yazılan en az üç kelime (e'den başlar)
function kelimeOyunuOlur(harf) {
  return ogrenilmisKelimeler(harf).length >= 3;
}

// Mini oyun bu harfte oynanabilir mi (PLANLANAN_OYUNLAR'daki gereken: "hece" / "kelime").
// Oynanamayanlar menüde "Bu harfte yok" olur, Şans Çarkı'na girmez.
function miniOyunOlur(ad, harf) {
  const oyun = PLANLANAN_OYUNLAR.find((o) => o.ad === ad);
  if (!oyun || !oyun.gereken) return true;
  return oyun.gereken === "hece" ? heceOyunuOlur(harf) : kelimeOyunuOlur(harf);
}

// Hecelerine ayrılmış kelimeler (yalnızca ilk harf grubunun harfleriyle yazılabilenler; yeni
// harf grupları gelince liste büyüyecek). Elektrik Devresi, Scrabble gibi oyunlar kullanır.
const KELIMELER = [
  ["anne", "an", "ne"], ["nane", "na", "ne"], ["lale", "la", "le"], ["nine", "ni", "ne"],
  ["tane", "ta", "ne"], ["elle", "el", "le"], ["elli", "el", "li"], ["ana", "a", "na"],
  ["ata", "a", "ta"], ["ilan", "i", "lan"], ["inat", "i", "nat"], ["anten", "an", "ten"],
  ["atlet", "at", "let"], ["telli", "tel", "li"], ["anla", "an", "la"], ["ilet", "i", "let"],
].map(([kelime, ...heceler]) => ({ kelime, heceler }));

// Üç heceli anlamlı kelimeler (Elektrik Devresi 3. seviye; öğretmenin isteği: anlamsız üçlü
// olmasın). Yeni harf gruplarıyla dört ve beş heceli kelimeler de eklenecek.
const COK_HECELI_KELIMELER = [
  ["taneli", "ta", "ne", "li"], ["naneli", "na", "ne", "li"], ["laleli", "la", "le", "li"],
  ["antenli", "an", "ten", "li"], ["inatla", "i", "nat", "la"], ["anlatan", "an", "la", "tan"],
  ["anteni", "an", "te", "ni"], ["atletli", "at", "let", "li"],
].map(([kelime, ...heceler]) => ({ kelime, heceler }));

// Bilinen harflerle (bkz. bilinenHarfler) yazılabilen kelimeler; oyunun harfini içerenler önce
function ogrenilmisKelimeler(harf) {
  const ogrenilmis = bilinenHarfler(harf);
  const uygun = KELIMELER.filter((k) => [...k.kelime].every((h) => ogrenilmis.includes(h)));
  const harfli = uygun.filter((k) => k.kelime.includes(harf));
  return harfli.length >= 3 ? harfli : uygun;
}

// Hecenin harf sayısı seviyeye göre (öğretmenin kararı; bütün hece oyunlarında): 1. seviye iki
// harfli (an, na), 2. seviye üç harfli (tat, lal), 3. seviye dört harfli. İlk harf grubunda
// (a n e t i l) dört harfli hece yok; 3. seviyede üç harfli heceler zor seçeneklerle sorulur.
// Yeni harf grupları gelince (ör. "türk" gibi) 3. seviye dört harfliye geçer.
function heceUzunlugu(seviye) {
  return seviye <= 1 ? 2 : 3;
}

// Bilinen harflerle (bkz. bilinenHarfler) kurulabilecek bütün heceler: iki harfli kapalı
// (ünlü+ünsüz: an) ve açık (ünsüz+ünlü: na), üç harfli (ünsüz+ünlü+ünsüz: tat, lal, net).
// u: ünlü, s: ilk ünsüz.
function heceHavuzu(harf) {
  const ogrenilmis = bilinenHarfler(harf).map((h) => HARFLER.find((x) => x.kucuk === h));
  const unluler = ogrenilmis.filter((h) => h.unlu).map((h) => h.kucuk);
  const unsuzler = ogrenilmis.filter((h) => !h.unlu).map((h) => h.kucuk);
  const heceler = [];
  for (const u of unluler) {
    for (const s of unsuzler) {
      heceler.push({ hece: u + s, u, s, acik: false });
      heceler.push({ hece: s + u, u, s, acik: true });
    }
  }
  for (const u of unluler) {
    for (const s of unsuzler) {
      for (const s2 of unsuzler) heceler.push({ hece: s + u + s2, u, s, acik: false });
    }
  }
  return heceler;
}

// Hece sorusu: oyunun harfini içeren, seviyenin uzunluğunda bir hece ve aynı uzunlukta yanlış
// seçenekler. 1. seviye (iki harfli): hiç ortak harfi olmayan seçenekler önce; kapalı ve açık
// hece karışık (acikOrani ile, en az 0.4). 2. seviye (üç harfli): az ortak harfli seçenekler.
// 3. seviye (üç harfli, zor): tek harfi değişen ve ters heceler (tal / lat / tel).
// secenekSayisi: doğru dahil kaç seçenek; onceki: üst üste aynı hece sorulmasın.
function heceSorusu(hepsi, harf, seviye, secenekSayisi, acikOrani, onceki) {
  let uzunluk = heceUzunlugu(seviye);
  // Bu harfte o uzunlukta yeterli hece yoksa (ör. e'de üç harfli yalnızca nan, nen) iki harfli
  // heceler sorulur (yanlış seçenekler yine seviyenin zorluğunda)
  if (hepsi.filter((h) => h.hece.length === uzunluk).length < Math.max(3, secenekSayisi)) uzunluk = 2;
  const havuz = hepsi.filter((h) => h.hece.length === uzunluk);
  const acikOran = Math.max(acikOrani || 0, 0.4);
  const harfli = havuz.filter((h) => h.hece.includes(harf));
  const adaylar = harfli.filter((h) => h.hece !== onceki
    && (uzunluk !== 2 || (Math.random() < acikOran ? h.acik : !h.acik)));
  const hedef = Phaser.Utils.Array.GetRandom(adaylar.length ? adaylar : harfli);
  const digerleri = havuz.filter((h) => h.hece !== hedef.hece);
  const karistir = (dizi) => Phaser.Utils.Array.Shuffle(dizi.slice());
  // Ortak harf sayısı (aynı yerde aynı harf) ve ters hece
  const ortak = (a) => [...a.hece].filter((c, i) => c === hedef.hece[i]).length;
  const ayniHarfler = (a) => [...a.hece].sort().join("") === [...hedef.hece].sort().join("");
  let oncelikli = [];
  if (seviye <= 1) {
    oncelikli = karistir(digerleri.filter((h) => ![...h.hece].some((c) => hedef.hece.includes(c))));
  } else if (seviye === 2) {
    oncelikli = karistir(digerleri.filter((h) => ortak(h) <= 1));
  } else {
    oncelikli = [
      ...karistir(digerleri.filter((h) => ayniHarfler(h))),
      ...karistir(digerleri.filter((h) => ortak(h) === uzunluk - 1)),
    ];
  }
  const secenekler = [];
  for (const h of [...oncelikli, ...karistir(digerleri)]) {
    if (secenekler.length >= secenekSayisi - 1) break;
    if (!secenekler.includes(h.hece)) secenekler.push(h.hece);
  }
  return { hedef: hedef.hece, secenekler: karistir([hedef.hece, ...secenekler]) };
}

// Harfin sesini tarayıcıya okutur. Öğretmenin yeni kararı: ünsüzler de okunsun; tarayıcıya
// harfin adı ("ne") yerine yalnızca sesi verilir (harfler.js'deki okunus: "nnn", "lll", "t").
function harfiSoyle(harf, bitince) {
  const bilgi = HARFLER.find((h) => h.kucuk === harf);
  Sesler.soyle((bilgi && bilgi.okunus) || harf, bitince);
}

// Gösteren el her mini oyunda (sayfa açık kaldıkça) bir kez çıkar
const MINI_OYUN_ELI_GOSTERILDI = {};

// Bütün mini oyunların ortak parçaları: kâğıt zemin, geri düğmesi, canlar (kalpler),
// ilerleme çubuğu ve bitiş penceresi ("Aferin!" ya da "Bir daha dene").
class MiniOyunSahnesi extends Phaser.Scene {
  init(veri) {
    this.harf = veri.harf || "a";
    this.seviye = veri.seviye || 1;
    this.donus = veri.donus || "MiniOyunlarSahnesi";
    this.veri = veri;
    // Zincir: tesisteki varilden damla almak için oyun 1, 2, 3. düzeyde art arda oynanır;
    // 3. düzey bitince ana oyuna dönülür ve damla kazanılır (veri.zincir).
    this.zincir = !!veri.zincir;
    this.bitti = false;
  }

  preload() {
    for (const ad of ["kalp", "kalp-bos", "onay-pencere", "incele-dugmesi", "doku-kagit", "el", "yildiz", "yildiz-bos"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  ortakKur() {
    this.cameras.main.fadeIn(300, 251, 247, 236);
    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0).setDepth(-10);
    const geri = this.add.container(1176, 48, [
      this.add.image(0, 0, "incele-dugmesi").setScale(0.9),
      doodleYazi(this, 0, -3, "Geri", 28).setOrigin(0.5),
    ]).setSize(200, 96).setDepth(900).setInteractive({ useHandCursor: true });
    geri.on("pointerdown", () => this.geriDon());
    if (this.zincir) {
      doodleYazi(this, 1176, 112, `Düzey ${this.seviye} / 3`, 24).setOrigin(0.5).setDepth(900);
    }
    // Uçan yıldız ve parıltı için küçük parçacık
    if (!this.textures.exists("parilti")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(5, 5, 5);
      g.generateTexture("parilti", 10, 10);
      g.destroy();
    }
  }

  // ---- Araştırmadan gelen ortak ilkeler ----
  // "Göster, anlatma": her mini oyunun ilk turunda bir el nereye dokunulacağını gösterir
  // (sayfa açık kaldıkça her oyunda bir kez). hedefler: dokunulacak nesneler/noktalar
  // (sırayla gösterilir; hareket eden nesneyi izler). Çocuk ekrana dokununca el kaybolur.
  elGoster(hedefler) {
    if (MINI_OYUN_ELI_GOSTERILDI[this.sys.settings.key] || this.bitti) return;
    hedefler = (Array.isArray(hedefler) ? hedefler : [hedefler]).filter(Boolean);
    if (!hedefler.length) return;
    MINI_OYUN_ELI_GOSTERILDI[this.sys.settings.key] = true;
    const el = this.add.image(0, 0, "el").setOrigin(32 / 90, 8 / 110).setDepth(950).setAlpha(0);
    const halka = this.add.graphics().setDepth(949);
    let sira = 0;
    let basma = 0; // 0..1 basma hareketi
    const konum = (h) => (h.active === false ? null : { x: h.x, y: h.y + (h.elKaydir || 0) });
    const izle = () => {
      const h = hedefler[sira % hedefler.length];
      const k = konum(h);
      if (!k) { bitir(); return; }
      el.setPosition(k.x + 14, k.y + 30 - basma * 10).setScale(1 - basma * 0.08); // harfi kapatmasın
    };
    const dongu = this.tweens.addCounter({
      from: 0, to: 1, duration: 1100, repeat: -1,
      onUpdate: (t) => {
        const v = t.getValue();
        basma = v < 0.35 ? 0 : v < 0.55 ? (v - 0.35) / 0.2 : v < 0.75 ? 1 - (v - 0.55) / 0.2 : 0;
        halka.clear();
        if (v > 0.5 && v < 0.95) {
          const h = konum(hedefler[sira % hedefler.length]);
          if (h) {
            halka.lineStyle(5, 0xffffff, 1 - (v - 0.5) / 0.45);
            halka.strokeCircle(h.x, h.y + 0, 20 + (v - 0.5) * 120);
          }
        }
      },
      onRepeat: () => { sira++; },
    });
    this.tweens.add({ targets: el, alpha: 1, duration: 300 });
    this.events.on("update", izle);
    const bitir = () => {
      this.events.off("update", izle);
      dongu.remove();
      halka.destroy();
      this.tweens.add({ targets: el, alpha: 0, duration: 200, onComplete: () => el.destroy() });
      this.input.off("pointerdown", bitir);
    };
    this.input.once("pointerdown", bitir);
    this.time.delayedCall(9000, () => { if (el.active) bitir(); });
  }

  // Sürükleme gösteren el (Harfi Çiz gibi): el noktalar boyunca gider, birkaç kez tekrarlar
  elSurukleGoster(noktalar) {
    if (MINI_OYUN_ELI_GOSTERILDI[this.sys.settings.key] || this.bitti || noktalar.length < 2) return;
    MINI_OYUN_ELI_GOSTERILDI[this.sys.settings.key] = true;
    const el = this.add.image(noktalar[0].x, noktalar[0].y, "el").setOrigin(32 / 90, 8 / 110)
      .setDepth(950).setAlpha(0);
    const yol = new Phaser.Curves.Spline(noktalar.map((n) => new Phaser.Math.Vector2(n.x, n.y)));
    const sayac = this.tweens.addCounter({
      from: 0, to: 1, duration: 1800, repeat: -1, repeatDelay: 500,
      onUpdate: (t) => {
        const n = yol.getPoint(t.getValue());
        el.setPosition(n.x, n.y);
        el.setAlpha(t.getValue() < 0.1 ? t.getValue() * 10 : t.getValue() > 0.9 ? (1 - t.getValue()) * 10 : 1);
      },
    });
    const bitir = () => {
      sayac.remove();
      this.tweens.add({ targets: el, alpha: 0, duration: 200, onComplete: () => el.destroy() });
    };
    this.input.once("pointerdown", bitir);
    this.time.delayedCall(9000, () => { if (el.active) bitir(); });
  }

  // Doğru yapılan yerde parıltı ve ilerleme çubuğuna uçan bir yıldız ("juice")
  odulUcur(x, y) {
    this.add.particles(x, y, "parilti", {
      speed: { min: 80, max: 220 }, lifespan: 450, scale: { start: 1, end: 0 },
      tint: [0xffe680, 0xffffff, 0xffc928], emitting: false,
    }).setDepth(940).explode(12);
    const yildiz = this.add.image(x, y, "yildiz").setScale(0.5).setDepth(941);
    const hedefX = 862 + Math.max(26, (196 * Math.min(this.ilerleme, this.ilerlemeHedef)) / this.ilerlemeHedef);
    this.tweens.add({
      targets: yildiz, x: hedefX, y: 45, scale: 0.3, angle: 200, duration: 550, ease: "Cubic.In",
      onComplete: () => {
        yildiz.destroy();
        Sesler.nota(1320, 0, 0.08, 0.06, "sine");
        if (this.ilerlemeCizim) {
          this.tweens.add({ targets: [this.ilerlemeCizim], y: -3, duration: 90, yoyo: true });
        }
      },
    });
  }

  // Yanlıştan sonra nazik ipucu: doğru nesne hafifçe büyüyüp küçülür (2 kez)
  ipucuGoster(nesne) {
    if (!nesne || !nesne.active || this.bitti) return;
    const olcek = nesne.scaleX || 1;
    this.time.delayedCall(700, () => {
      if (!nesne.active || this.bitti) return;
      this.tweens.add({ targets: nesne, scale: olcek * 1.12, duration: 260, yoyo: true, repeat: 1,
        ease: "Sine.InOut", onComplete: () => { if (nesne.active) nesne.setScale(olcek); } });
    });
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

  // Üstte ortada "Yakala: a" gibi panel; dokununca harf yeniden söylenir (yalnızca ünlüde)
  hedefPaneliKur(baslik) {
    const panel = this.add.container(640, 50).setDepth(900);
    const zemin = this.add.graphics();
    zemin.fillStyle(0xfffdf6, 1);
    zemin.fillRoundedRect(-120, -34, 240, 68, 18);
    zemin.lineStyle(4, 0x2b2b2b, 1);
    zemin.strokeRoundedRect(-120, -34, 240, 68, 18);
    const yazi = doodleYazi(this, -40, -2, baslik, 32).setOrigin(0.5);
    const harf = this.add.text(70, 0, this.harf, {
      fontFamily: "Andika", fontSize: "54px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
    });
    boyaliOrtala(titret(harf, 1.5));
    panel.add([zemin, yazi, harf]);
    panel.setSize(240, 68).setInteractive({ useHandCursor: true });
    panel.on("pointerdown", () => harfiSoyle(this.harf));
    return panel;
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
  // x, y verilirse o yerden ilerleme çubuğuna bir yıldız uçar.
  ilerlemeArtir(x, y) {
    if (this.bitti || this.ilerleme >= this.ilerlemeHedef) return;
    this.ilerleme++;
    if (x !== undefined) this.odulUcur(x, y);
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
    // Zincirde kazanınca: "Devam" sıradaki düzeyi açar; 3. düzeyden sonra damla kazanılır
    const zincirDevam = this.zincir && basarili && this.seviye < 3;
    const zincirSon = this.zincir && basarili && this.seviye >= 3;
    const baslikYazi = zincirSon ? "Damla kazandın!" : basarili ? "Aferin!" : "Bir daha dene";
    const baslik = doodleYazi(this, 640, 300, baslikYazi, zincirSon ? 46 : 52,
      basarili ? "mavi" : "beyaz").setOrigin(0.5);
    const solYazi = zincirDevam ? "Devam" : zincirSon ? "Tamam" : "Tekrar";
    const tekrar = doodleYazi(this, 525, 438, solYazi, 38).setOrigin(0.5);
    const geri = doodleYazi(this, 755, 438, "Geri", 38).setOrigin(0.5);
    kap.add([karartma, kart, baslik, tekrar, geri]);
    this.tweens.add({ targets: kap, alpha: 1, duration: 250 });
    if (basarili) {
      // Kalan can kadar yıldız (3 can = 3 yıldız); yıldızlar sırayla zıplayarak gelir
      const kazanilan = Math.max(1, this.canSayisi === undefined ? 3 : this.canSayisi);
      [[560, 214], [640, 196], [720, 214]].forEach(([x, y], i) => {
        const dolu = i < kazanilan;
        const yildiz = this.add.image(x, y, dolu ? "yildiz" : "yildiz-bos").setDepth(1002)
          .setScale(0).setAngle(i === 0 ? -12 : i === 2 ? 12 : 0);
        this.tweens.add({
          targets: yildiz, scale: i === 1 ? 1.15 : 0.95, duration: 380, delay: 350 + i * 280, ease: "Back.Out",
          onStart: () => { if (dolu) Sesler.nota(880 + i * 220, 0, 0.18, 0.12, "triangle"); },
        });
      });
      // Konfeti
      this.add.particles(640, 160, "parilti", {
        speed: { min: 200, max: 520 }, angle: { min: 200, max: 340 }, gravityY: 700, lifespan: 1600,
        scale: { start: 1.2, end: 0.4 }, tint: [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c],
        emitting: false,
      }).setDepth(1003).explode(60);
    }
    const tekrarAlani = this.add.zone(525, 440, 190, 80).setDepth(1001).setInteractive({ useHandCursor: true });
    const geriAlani = this.add.zone(755, 440, 190, 80).setDepth(1001).setInteractive({ useHandCursor: true });
    if (zincirDevam) {
      tekrarAlani.on("pointerdown", () => this.scene.restart({ ...this.veri, seviye: this.seviye + 1 }));
    } else if (zincirSon) {
      tekrarAlani.on("pointerdown", () => this.geriDon(true));
    } else {
      tekrarAlani.on("pointerdown", () => this.scene.restart(this.veri));
    }
    geriAlani.on("pointerdown", () => this.geriDon(zincirSon));
  }

  // Oyunun başında harfi tanıtır, bitince() çağrılır. Harfin sesi söylenir (ünsüz de; harfiSoyle).
  // Hece oyunlarında (heceOyunu) harf tek başına okunmaz; yalnızca hece duyulur (öğretmenin kararı).
  harfiTanit(bitince) {
    const bilgi = HARFLER.find((h) => h.kucuk === this.harf);
    if (bilgi && !this.heceOyunu) {
      harfiSoyle(this.harf);
      this.time.delayedCall(900, bitince);
    } else {
      this.time.delayedCall(300, bitince);
    }
  }

  // Basit doodle hoparlör
  hoparlorCiz(x, y, r) {
    const g = this.add.graphics();
    g.fillStyle(0xc9ecff, 1);
    g.fillCircle(x, y, r);
    g.lineStyle(3.5, 0x2b2b2b, 1);
    g.strokeCircle(x, y, r);
    const k = r / 24;
    g.fillStyle(0xffffff, 1);
    g.beginPath();
    g.moveTo(x - 10 * k, y - 6 * k);
    g.lineTo(x - 4 * k, y - 6 * k);
    g.lineTo(x + 4 * k, y - 14 * k);
    g.lineTo(x + 4 * k, y + 14 * k);
    g.lineTo(x - 4 * k, y + 6 * k);
    g.lineTo(x - 10 * k, y + 6 * k);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.beginPath();
    g.arc(x + 6 * k, y, 9 * k, -0.9, 0.9);
    g.strokePath();
    return g;
  }

  oyunBitti() {}

  // Zincirde ana oyun uyutulmuştur: o uyandırılır, sonuç (damla kazanıldı mı) ona iletilir
  geriDon(kazandi = false) {
    Sesler.sustur();
    if (this.zincir) {
      this.scene.wake(this.donus, { miniOyun: true, harf: this.harf, kazandi });
      this.scene.stop();
      return;
    }
    this.scene.start(this.donus);
  }
}
