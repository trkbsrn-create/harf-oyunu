// Bulut Market (öğretmenin fikri; adalar çok hızlı bitiyordu). Bitkisi büyüyen harfin varilinden
// oynanan her oyun o harften bir kumbara damlası verir (Canta.kumbara; her yeni adada sıfırlanır).
// Sırığın tepesindeki tezgâhta (BulutSahnesi) bütün kostümler o adanın harflerinin damlalarıyla alınır.
// Alınan eşyalar profilde kalır (Dolap); ada ekranındaki dolap simgesinden giyilir ya da çıkarılır. Karakter giyer: şapka ve gözlük karakter resminin üstüne
// çizilir (giyimDokusu), kıyafet karakterin renkli hâlidir (cocuk*-<renk>.svg), evcil hayvan arkadan gelir.
// Adalardaki özel kıyafetlerde (kışlık, dalgıç, astronot) kıyafet; dalgıç ve astronotta gözlük,
// astronotta şapka görünmez.

// Öğretmenin isteği: çok sayıda kostüm, çocuk istediğini alsın. Bütün eşyalar her adanın marketinde
// satılır; fiyat o adanın harflerinin damlalarıyla (deger: toplam damla; fiyatHesapla harflere böler).
// tur: sapka, gozluk, kiyafet, pet. resim: giyilen resim (karakter ölçüsünde); kiyafet için ek
// (karakter resimleri cocuk*-<ek>.svg).
const MARKET_TURLERI = [
  { tur: "sapka", ad: "Şapka" }, { tur: "gozluk", ad: "Gözlük" },
  { tur: "kiyafet", ad: "Kıyafet" }, { tur: "pet", ad: "Evcil hayvan" },
];
const MARKET_ESYALARI = [
  ["gozluk", "yuvarlak", "Yuvarlak gözlük", 3], ["gozluk", "gunes", "Güneş gözlüğü", 4],
  ["gozluk", "kalp", "Kalp gözlük", 4], ["gozluk", "yildiz", "Yıldız gözlük", 5],
  ["gozluk", "korsan", "Korsan bandı", 5], ["gozluk", "uzay", "Uzay gözlüğü", 6],
  ["sapka", "kagit", "Kâğıt şapka", 4], ["sapka", "kep", "Kep", 5], ["sapka", "parti", "Parti şapkası", 5],
  ["sapka", "cicek", "Çiçek tacı", 6], ["sapka", "tavsan", "Tavşan kulağı", 6], ["sapka", "asci", "Aşçı şapkası", 6],
  ["sapka", "kovboy", "Kovboy şapkası", 7], ["sapka", "korsan", "Korsan şapkası", 7],
  ["sapka", "kaptan", "Kaptan şapkası", 7], ["sapka", "sihirbaz", "Sihirbaz şapkası", 9], ["sapka", "tac", "Taç", 10],
  ["kiyafet", "mavi", "Mavi tişört", 6], ["kiyafet", "yesil", "Yeşil tişört", 6], ["kiyafet", "kirmizi", "Kırmızı tişört", 6],
  ["kiyafet", "turuncu", "Turuncu tişört", 6], ["kiyafet", "pembe", "Pembe tişört", 6], ["kiyafet", "mor", "Mor tişört", 7],
  ["kiyafet", "denizci", "Denizci tişörtü", 8], ["kiyafet", "gece", "Gece mavisi", 8], ["kiyafet", "altin", "Altın kıyafet", 12],
  ["pet", "civciv", "Civciv", 8], ["pet", "kedi", "Kedi", 10], ["pet", "kopek", "Köpek", 10], ["pet", "tavsan", "Tavşan", 10],
  ["pet", "kaplumbaga", "Kaplumbağa", 11], ["pet", "penguen", "Penguen", 11], ["pet", "robot", "Robot", 13],
  ["pet", "ejderha", "Ejderha", 15],
].map(([tur, ad, isim, deger]) => ({
  id: `${tur}-${ad}`, tur, ad: isim, deger, ek: ad,
  resim: tur === "pet" ? `pet-${ad}` : tur === "kiyafet" ? `cocuk-${ad}` : `giyim-${tur}-${ad}`,
}));
const MARKET_KIYAFET_EKLERI = MARKET_ESYALARI.filter((e) => e.tur === "kiyafet").map((e) => e.ek);

function marketEsyasi(id) {
  return MARKET_ESYALARI.find((e) => e.id === id) || null;
}

// Fiyat: eşyanın değeri o adanın harflerine bölünür (her eşya hep aynı harflerden; en çok 3 damla bir harf)
function fiyatHesapla(e, ada) {
  const harfler = HARFLER.filter((h) => h.grup === ((ADALAR[ada] && ADALAR[ada].grup) || 1)).map((h) => h.kucuk);
  const parca = Math.min(harfler.length, Math.max(1, Math.ceil(e.deger / 3)));
  let tohum = 0;
  for (const c of e.id) tohum = (tohum * 31 + c.charCodeAt(0)) % 9973;
  const fiyat = {};
  for (let i = 0; i < parca; i++) {
    const h = harfler[(tohum + i) % harfler.length];
    fiyat[h] = Math.floor(e.deger / parca) + (i < e.deger % parca ? 1 : 0);
  }
  return fiyat;
}

// Sahnenin preload'unda: giyilen resimler (karakter ölçüsünde), markette gösterilen büyük hâlleri
// ve kıyafetli karakter resimleri
function marketResimleriniYukle(sahne) {
  for (const e of MARKET_ESYALARI) {
    if (e.tur === "kiyafet") continue;
    sahne.load.svg(e.resim, `gorseller/${e.resim}.svg`);
    sahne.load.svg(`${e.resim}-buyuk`, `gorseller/${e.resim}.svg`, { scale: e.tur === "pet" ? 2.4 : 2.6 });
  }
  for (const ek of MARKET_KIYAFET_EKLERI) {
    for (const ad of ["cocuk", "cocuk-adim1", "cocuk-adim2", "cocuk-tirman", "kiz", "kiz-adim1", "kiz-adim2", "kiz-tirman"]) {
      sahne.load.svg(`${ad}-${ek}`, `gorseller/${ad}-${ek}.svg`);
    }
  }
  sahne.load.svg("market-tezgah", "gorseller/market-tezgah.svg");
  sahne.load.svg("kumbara", "gorseller/kumbara.svg");
  sahne.load.svg("dolap", "gorseller/dolap.svg");
}

// Alınan ve giyilen eşyalar: profil seçiliyse profilde saklanır (eşyalar adalar boyunca kalır)
const Dolap = {
  alinanlar: [],
  giyilen: {}, // tur -> id

  yukle() {
    const p = Profil.aktifId && Profil.oku().profiller[Profil.aktifId];
    const d = (p && p.dolap) || {};
    if (p) {
      this.alinanlar = d.alinanlar || [];
      this.giyilen = d.giyilen || {};
    }
  },

  kaydet() {
    Profil.degistir((p) => { p.dolap = { alinanlar: this.alinanlar, giyilen: this.giyilen }; });
  },

  varMi(id) { return this.alinanlar.includes(id); },

  al(id) {
    if (!this.varMi(id)) this.alinanlar.push(id);
    this.giy(id);
  },

  giy(id) {
    const e = marketEsyasi(id);
    if (!e) return;
    this.giyilen[e.tur] = id;
    this.kaydet();
  },

  cikar(id) {
    const e = marketEsyasi(id);
    if (e && this.giyilen[e.tur] === id) delete this.giyilen[e.tur];
    this.kaydet();
  },

  giyiliMi(id) {
    const e = marketEsyasi(id);
    return !!e && this.giyilen[e.tur] === id;
  },
};

// Karakter resmi + giyilenler. Şapka ve gözlük için resmin üstüne çizilmiş yeni doku üretilir
// (üstte şapkaya yer: GIYIM_UST px; karakterin orijini alt orta olduğu için yeri kaymaz).
const GIYIM_UST = 30;
function giyimDokusu(sahne, ad) {
  const g = Dolap.giyilen;
  const ozel = /-(kis|dalgic|astronot)$/.test(ad);
  const kiyafet = g.kiyafet && !ozel && marketEsyasi(g.kiyafet);
  let govde = ad;
  if (kiyafet && sahne.textures.exists(`${ad}-${kiyafet.ek}`)) govde = `${ad}-${kiyafet.ek}`;
  const sapka = g.sapka && !/-astronot$/.test(ad) ? marketEsyasi(g.sapka) : null;
  const gozluk = g.gozluk && !/-(dalgic|astronot)$/.test(ad) && !ad.includes("tirman") ? marketEsyasi(g.gozluk) : null;
  if (!sapka && !gozluk) return govde;
  const anahtar = `${govde}+${sapka ? sapka.id : ""}+${gozluk ? gozluk.id : ""}`;
  if (sahne.textures.exists(anahtar)) return anahtar;
  if (!sahne.textures.exists(govde) || (sapka && !sahne.textures.exists(sapka.resim))
      || (gozluk && !sahne.textures.exists(gozluk.resim))) return govde;
  const kaynak = sahne.textures.get(govde).getSourceImage();
  const en = kaynak.width;
  const boy = kaynak.height;
  const o = en / 90; // karakter 90 px genişliğinde çizildi (baş (45, 36) r 23)
  const tuval = sahne.textures.createCanvas(anahtar, en, boy + GIYIM_UST * o);
  const ctx = tuval.getContext();
  ctx.drawImage(kaynak, 0, GIYIM_UST * o, en, boy);
  if (gozluk) {
    const r = sahne.textures.get(gozluk.resim).getSourceImage();
    ctx.drawImage(r, (45 - 22) * o, (GIYIM_UST + 38 - 9) * o, 44 * o, 18 * o);
  }
  if (sapka) {
    const r = sahne.textures.get(sapka.resim).getSourceImage();
    ctx.drawImage(r, (45 - 32) * o, (GIYIM_UST + 20 - 44) * o, 64 * o, 48 * o);
  }
  tuval.refresh();
  return anahtar;
}

// Evcil hayvan: karakterin arkasından gelir, adım attıkça hafifçe zıplar
function petKur(sahne) {
  if (sahne.pet) sahne.pet.destroy();
  sahne.pet = null;
  const e = Dolap.giyilen.pet && marketEsyasi(Dolap.giyilen.pet);
  if (!e || !sahne.cocuk || !sahne.textures.exists(e.resim)) return;
  const c = sahne.cocuk;
  sahne.pet = sahne.add.image(c.x - 50, c.y, e.resim).setOrigin(0.5, 1).setDepth(c.depth);
  sahne.pet.adim = 0;
}

function petGuncelle(sahne, zaman, fark) {
  const pet = sahne.pet;
  if (!pet) return;
  const c = sahne.cocuk;
  pet.setVisible(c.visible && c.alpha > 0.5 && !sahne.tirmaniyor);
  const yon = c.flipX ? 1 : -1; // karakterin arkası
  const hx = c.x + yon * 52;
  const hy = c.y - 2;
  const k = 1 - Math.exp(-fark / 220);
  if (pet.tabanY === undefined) pet.tabanY = c.y;
  const dx = (hx - pet.x) * k;
  pet.x += dx;
  pet.tabanY += (hy - pet.tabanY) * k;
  const hareket = Math.hypot(hx - pet.x, hy - pet.tabanY) > 4;
  pet.adim = hareket ? pet.adim + fark : 0;
  pet.y = pet.tabanY - (hareket ? Math.abs(Math.sin(pet.adim / 110)) * 8 : 0);
  if (Math.abs(dx) > 0.2) pet.setFlipX(dx < 0);
  pet.setDepth(c.depth - 0.01);
}

// Damla resmi (adaya göre damla, kabarcık, yıldız tozu) ve içinde harf: fiyat ve kumbara rozetleri
function damlaRozeti(sahne, x, y, harf, sayi, ada, renk) {
  const r = ADALAR[ada] && ADALAR[ada].damlaResmi;
  const kap = sahne.add.container(x, y);
  const damla = sahne.add.image(0, 0, r || "damla").setScale(0.9);
  const yazi = sahne.add.text(0, 6, harf, {
    fontFamily: "Andika", fontSize: "22px", color: "#2b2b2b", stroke: "#ffffff", strokeThickness: 4,
  }).setOrigin(0.5);
  const adet = sahne.add.text(22, 10, `×${sayi}`, {
    fontFamily: "Andika", fontSize: "22px", color: renk || "#2b2b2b",
  }).setOrigin(0, 0.5);
  kap.add([damla, yazi, adet]);
  return kap;
}

// Bir eşyanın alınıp alınamayacağı (kumbarada her harften yeterli damla var mı)
function alinabilirMi(e, ada) {
  return Object.entries(fiyatHesapla(e, ada)).every(([h, n]) => (Canta.kumbara[h] || 0) >= n);
}

// Market penceresi (BulutSahnesi'nde tezgâha dokununca) ya da dolap (ada ekranında dolap simgesi; yalnızca
// alınanlar). Üstte sekmeler (şapka, gözlük, kıyafet, evcil hayvan), altta kartlar (6 x 2). Kartın kendisine
// dokunulur: alınmamışsa alınır (damla yetmezse sallanır; öğretmenin kararı: peri bir şey söylemez),
// alınmışsa giyilir ya da çıkarılır.
class MarketPaneli {
  constructor(sahne, ada, degisince, dolap = false) {
    this.sahne = sahne;
    this.ada = ada;
    this.degisince = degisince;
    this.dolap = dolap;
    this.kap = null;
    this.sekme = "sapka";
  }

  acikMi() { return !!this.kap; }

  ac() {
    if (this.kap || this.kapaniyor) return;
    const s = this.sahne;
    Sesler.canta(true);
    const kap = s.add.container(0, 0).setDepth(9700).setScrollFactor(0);
    const perde = s.add.rectangle(640, 360, 1280, 720, 0x000000, 0.35).setInteractive().setScrollFactor(0);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(90, 30, 1100, 670, 34);
    g.fillStyle(0xfbf4e2, 1);
    g.fillRoundedRect(80, 20, 1100, 670, 34);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(80, 20, 1100, 670, 34);
    const baslik = doodleYazi(s, 640, 58, this.dolap ? "Dolabım" : "Bulut Market", 42, "mavi").setOrigin(0.5);
    const kapat = s.add.circle(1150, 48, 28, 0xff8a7a).setStrokeStyle(4, 0x2b2b2b).setInteractive({ useHandCursor: true }).setScrollFactor(0); // kayan ada ekranında da dokunma yeri doğru olsun
    const carpi = s.add.text(1150, 46, "✕", { fontFamily: "Andika", fontSize: "32px", color: "#ffffff" }).setOrigin(0.5);
    kapat.on("pointerdown", () => this.kapat());
    kap.add([perde, g, baslik, kapat, carpi]);
    this.kap = kap;
    this.icerik = s.add.container(0, 0);
    kap.add(this.icerik);
    this.ciz();
    kap.setAlpha(0);
    s.tweens.add({ targets: kap, alpha: 1, duration: 200 });
  }

  kapat() {
    if (!this.kap || this.kapaniyor) return;
    Sesler.canta(false);
    const kap = this.kap;
    this.kapaniyor = true;
    // Kapatma dokunuşu sahneye de geçer: pencere biraz sonra kapalı sayılır (karakter oraya yürümesin)
    this.sahne.tweens.add({ targets: kap, alpha: 0, duration: 160, onComplete: () => {
      kap.destroy();
      this.kap = null;
      this.kapaniyor = false;
    } });
  }

  ciz() {
    const s = this.sahne;
    this.icerik.removeAll(true);
    // Kumbara: bu adanın harfleri ve damlaları (dolapta yok)
    if (!this.dolap) {
      const harfler = HARFLER.filter((h) => h.grup === ((ADALAR[this.ada] && ADALAR[this.ada].grup) || 1)).map((h) => h.kucuk);
      this.icerik.add(s.add.image(150, 112, "kumbara").setScale(0.8));
      harfler.forEach((h, i) => this.icerik.add(damlaRozeti(s, 225 + i * 105, 112, h, Canta.kumbara[h] || 0, this.ada)));
    }
    // Sekmeler
    MARKET_TURLERI.forEach((t, i) => {
      const x = 245 + i * 263;
      const secili = this.sekme === t.tur;
      const d = s.add.graphics();
      d.fillStyle(secili ? 0xffe680 : 0xffffff, 1);
      d.fillRoundedRect(x - 118, 145, 236, 50, 24);
      d.lineStyle(secili ? 5 : 3, 0x2b2b2b, 1);
      d.strokeRoundedRect(x - 118, 145, 236, 50, 24);
      const yazi = s.add.text(x, 168, t.ad, { fontFamily: "Andika", fontSize: "28px", color: "#2b2b2b" }).setOrigin(0.5);
      const alan = s.add.zone(x, 170, 236, 50).setInteractive({ useHandCursor: true }).setScrollFactor(0); // kayan ada ekranında da dokunma yeri doğru olsun
      alan.on("pointerdown", () => {
        if (this.sekme === t.tur) return;
        this.sekme = t.tur;
        Sesler.nota(660, 0, 0.08, 0.1);
        this.ciz();
      });
      this.icerik.add([d, yazi, alan]);
    });
    let esyalar = MARKET_ESYALARI.filter((e) => e.tur === this.sekme);
    if (this.dolap) esyalar = esyalar.filter((e) => Dolap.varMi(e.id));
    if (!esyalar.length) {
      this.icerik.add(s.add.text(640, 420, "Henüz yok.\nBulut Market'ten alabilirsin!", {
        fontFamily: "Andika", fontSize: "34px", color: "#9a8f78", align: "center",
      }).setOrigin(0.5));
      return;
    }
    esyalar.slice(0, 12).forEach((e, i) => this.kartCiz(e, 106 + (i % 6) * 177, 212 + Math.floor(i / 6) * 236));
  }

  kartCiz(e, x, y) {
    const s = this.sahne;
    const alindi = Dolap.varMi(e.id);
    const giyili = Dolap.giyiliMi(e.id);
    const yeter = alinabilirMi(e, this.ada);
    const kart = s.add.container(x, y);
    const g = s.add.graphics();
    g.fillStyle(giyili ? 0xeaf8e0 : 0xffffff, 1);
    g.fillRoundedRect(0, 0, 165, 224, 20);
    g.lineStyle(giyili ? 6 : 4, giyili ? 0x2e9e3a : 0x2b2b2b, 1);
    g.strokeRoundedRect(0, 0, 165, 224, 20);
    kart.add(g);
    const resim = s.add.image(82, 72, e.tur === "kiyafet" ? karakterDokusu(e.resim) : `${e.resim}-buyuk`);
    resim.setScale(Math.min(1, 140 / resim.width, 110 / resim.height));
    const ad = s.add.text(82, 140, e.ad, { fontFamily: "Andika", fontSize: "21px", color: "#2b2b2b" }).setOrigin(0.5);
    kart.add([resim, ad]);
    if (alindi) {
      kart.add(s.add.text(82, 186, giyili ? "Giyili ✓" : "Giy", {
        fontFamily: "Andika", fontSize: "26px", color: giyili ? "#2e9e3a" : "#2b2b2b",
      }).setOrigin(0.5));
    } else {
      Object.entries(fiyatHesapla(e, this.ada)).forEach(([h, n], j) => {
        const var_ = (Canta.kumbara[h] || 0) >= n;
        kart.add(damlaRozeti(s, 22 + (j % 3) * 52, 178 + Math.floor(j / 3) * 30, h, n, this.ada, var_ ? "#2e9e3a" : "#c0392b")
          .setScale(0.62));
      });
      if (!yeter) resim.setAlpha(0.45);
    }
    const alan = s.add.zone(82, 112, 165, 224).setInteractive({ useHandCursor: true }).setScrollFactor(0); // kayan ada ekranında da dokunma yeri doğru olsun
    alan.on("pointerdown", () => this.dokun(e, kart));
    kart.add(alan);
    this.icerik.add(kart);
  }

  dokun(e, kart) {
    const s = this.sahne;
    if (Dolap.varMi(e.id)) {
      if (Dolap.giyiliMi(e.id)) Dolap.cikar(e.id);
      else Dolap.giy(e.id);
      Sesler.pling();
    } else if (!this.dolap && alinabilirMi(e, this.ada)) {
      for (const [h, n] of Object.entries(fiyatHesapla(e, this.ada))) Canta.kumbara[h] -= n;
      Dolap.al(e.id);
      Sesler.dogru();
      s.add.particles(kart.x + 82, kart.y + 80, "parilti", {
        speed: { min: 120, max: 320 }, lifespan: 700, scale: { start: 1, end: 0 },
        tint: [0xffe680, 0xff9c8a, 0x9be3dc], emitting: false,
      }).setDepth(9800).setScrollFactor(0).explode(24);
    } else {
      // Damla yetmiyor: kart hafifçe sallanır (öğretmenin kararı: peri bir şey söylemez)
      s.tweens.add({ targets: kart, x: kart.x + 8, duration: 60, yoyo: true, repeat: 2 });
      Sesler.nota(330, 0, 0.12, 0.12);
      return;
    }
    this.ciz();
    if (this.degisince) this.degisince();
  }
}
