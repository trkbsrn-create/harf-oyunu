// Bulut Market (öğretmenin fikri; adalar çok hızlı bitiyordu). Bitkisi büyüyen harfin varilinden
// oynanan her oyun o harften bir kumbara damlası verir (Canta.kumbara; her yeni adada sıfırlanır).
// Sırığın tepesindeki tezgâhta (BulutSahnesi) eşyalar o adanın harflerinin damlalarıyla alınır.
// Alınan eşyalar profilde kalır (Dolap). Karakter giyer: şapka ve gözlük karakter resminin üstüne
// çizilir (giyimDokusu), kıyafet karakterin renkli hâlidir (cocuk*-mavi.svg), evcil hayvan arkadan gelir.
// Adalardaki özel kıyafetlerde (kışlık, dalgıç, astronot) kıyafet; dalgıç ve astronotta gözlük,
// astronotta şapka görünmez.

// tur: sapka, gozluk, kiyafet, pet. fiyat: harf -> damla. resim: giyilen resim (karakter ölçüsünde);
// kiyafet için karakter resimlerinin eki. Her adanın marketinde o adanın 4 eşyası (gözlük en ucuz,
// evcil hayvan en pahalı).
const MARKET_ESYALARI = [
  { id: "gozluk-yuvarlak", ada: 1, tur: "gozluk", ad: "Yuvarlak gözlük", resim: "giyim-gozluk-yuvarlak", fiyat: { a: 2, n: 1 } },
  { id: "sapka-kagit", ada: 1, tur: "sapka", ad: "Kâğıt şapka", resim: "giyim-sapka-kagit", fiyat: { e: 2, t: 2, i: 1 } },
  { id: "kiyafet-mavi", ada: 1, tur: "kiyafet", ad: "Mavi tişört", resim: "cocuk-mavi", ek: "mavi", fiyat: { a: 2, l: 2, i: 2, n: 1 } },
  { id: "pet-civciv", ada: 1, tur: "pet", ad: "Civciv", resim: "pet-civciv", fiyat: { a: 2, n: 2, e: 2, t: 2, i: 1, l: 1 } },
];
const MARKET_KIYAFET_EKLERI = ["mavi"];

function marketEsyasi(id) {
  return MARKET_ESYALARI.find((e) => e.id === id) || null;
}

// Sahnenin preload'unda: giyilen resimler (karakter ölçüsünde) ve markette gösterilen büyük hâlleri
function marketResimleriniYukle(sahne) {
  for (const e of MARKET_ESYALARI) {
    if (e.tur === "kiyafet") continue;
    sahne.load.svg(e.resim, `gorseller/${e.resim}.svg`);
    sahne.load.svg(`${e.resim}-buyuk`, `gorseller/${e.resim}.svg`, { scale: e.tur === "pet" ? 2.6 : 3 });
  }
  for (const ek of MARKET_KIYAFET_EKLERI) {
    for (const ad of ["cocuk", "cocuk-adim1", "cocuk-adim2", "cocuk-tirman"]) {
      sahne.load.svg(`${ad}-${ek}`, `gorseller/${ad}-${ek}.svg`);
    }
  }
  sahne.load.svg("market-tezgah", "gorseller/market-tezgah.svg");
  sahne.load.svg("kumbara", "gorseller/kumbara.svg");
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
const GIYIM_UST = 26;
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
    ctx.drawImage(r, (45 - 32) * o, (GIYIM_UST + 18 - 32) * o, 64 * o, 34 * o);
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
function alinabilirMi(e) {
  return Object.entries(e.fiyat).every(([h, n]) => (Canta.kumbara[h] || 0) >= n);
}

// Market penceresi (BulutSahnesi'nde tezgâha dokununca): o adanın 4 eşyası; kumbara üstte.
// Damla yetmeyen eşya soluk; alınca karakter hemen giyer. Alınmış eşyada "Giy" / "Çıkar".
class MarketPaneli {
  constructor(sahne, ada, degisince) {
    this.sahne = sahne;
    this.ada = ada;
    this.degisince = degisince;
    this.kap = null;
  }

  acikMi() { return !!this.kap; }

  ac() {
    if (this.kap || this.kapaniyor) return;
    const s = this.sahne;
    Sesler.canta(true);
    const kap = s.add.container(0, 0).setDepth(9000).setScrollFactor(0);
    const perde = s.add.rectangle(640, 360, 1280, 720, 0x000000, 0.35).setInteractive();
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(110, 70, 1080, 610, 34);
    g.fillStyle(0xfbf4e2, 1);
    g.fillRoundedRect(100, 60, 1080, 610, 34);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(100, 60, 1080, 610, 34);
    const baslik = doodleYazi(s, 640, 102, "Bulut Market", 46, "mavi").setOrigin(0.5);
    const kapat = s.add.circle(1150, 88, 30, 0xff8a7a).setStrokeStyle(4, 0x2b2b2b).setInteractive({ useHandCursor: true });
    const carpi = s.add.text(1150, 86, "✕", { fontFamily: "Andika", fontSize: "34px", color: "#ffffff" }).setOrigin(0.5);
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
    // Kumbara: bu adanın harfleri ve damlaları
    const harfler = ADALAR[this.ada] ? HARFLER.filter((h) => h.grup === ADALAR[this.ada].grup).map((h) => h.kucuk) : [];
    const kumbara = s.add.image(170, 172, "kumbara").setScale(0.9);
    this.icerik.add(kumbara);
    harfler.forEach((h, i) => {
      this.icerik.add(damlaRozeti(s, 250 + i * 110, 172, h, Canta.kumbara[h] || 0, this.ada));
    });
    const esyalar = MARKET_ESYALARI.filter((e) => e.ada === this.ada);
    esyalar.forEach((e, i) => this.kartCiz(e, 140 + i * 255, 225));
  }

  kartCiz(e, x, y) {
    const s = this.sahne;
    const alindi = Dolap.varMi(e.id);
    const yeter = alinabilirMi(e);
    const kart = s.add.container(x, y);
    const g = s.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 235, 420, 24);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(0, 0, 235, 420, 24);
    kart.add(g);
    const resim = e.tur === "kiyafet"
      ? s.add.image(117, 120, e.resim).setScale(1.25)
      : s.add.image(117, 112, `${e.resim}-buyuk`);
    const ad = s.add.text(117, 210, e.ad, { fontFamily: "Andika", fontSize: "26px", color: "#2b2b2b" }).setOrigin(0.5);
    kart.add([resim, ad]);
    // Fiyat: iki sütun damla rozeti (alınmışsa "Senin!")
    if (alindi) kart.add(s.add.text(117, 280, "Senin!", { fontFamily: "Andika", fontSize: "30px", color: "#2e9e3a" }).setOrigin(0.5));
    else Object.entries(e.fiyat).forEach(([h, n], j) => {
      const var_ = (Canta.kumbara[h] || 0) >= n;
      kart.add(damlaRozeti(s, 46 + (j % 2) * 100, 252 + Math.floor(j / 2) * 40, h, n, this.ada, var_ ? "#2e9e3a" : "#c0392b")
        .setScale(0.85));
    });
    // Düğme
    const yazi = alindi ? (Dolap.giyiliMi(e.id) ? "Çıkar" : "Giy") : "Al";
    const renk = alindi ? 0x9be3dc : 0xffe680;
    const dugme = s.add.container(117, 385);
    const d = s.add.graphics();
    d.fillStyle(renk, 1);
    d.fillRoundedRect(-80, -26, 160, 52, 26);
    d.lineStyle(4, 0x2b2b2b, 1);
    d.strokeRoundedRect(-80, -26, 160, 52, 26);
    dugme.add([d, s.add.text(0, -2, yazi, { fontFamily: "Andika", fontSize: "28px", color: "#2b2b2b" }).setOrigin(0.5)]);
    kart.add(dugme);
    if (!alindi && !yeter) {
      resim.setAlpha(0.45);
      dugme.setAlpha(0.45);
    }
    const alan = s.add.zone(117, 210, 235, 420).setInteractive({ useHandCursor: true });
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
    } else if (alinabilirMi(e)) {
      for (const [h, n] of Object.entries(e.fiyat)) Canta.kumbara[h] -= n;
      Dolap.al(e.id);
      Sesler.dogru();
      s.add.particles(kart.x + 117, kart.y + 120, "parilti", {
        speed: { min: 120, max: 320 }, lifespan: 700, scale: { start: 1, end: 0 },
        tint: [0xffe680, 0xff9c8a, 0x9be3dc], emitting: false,
      }).setDepth(9500).setScrollFactor(0).explode(24);
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
