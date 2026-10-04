// Mini oyun: Birleştir Büyüt (kaydır birleştir, 2048 tarzı)
// 4x4 tahtada harf taşları var. Çocuk parmağını sağa, sola, yukarı ya da aşağı kaydırır (ya da
// ok tuşları); bütün taşlar o yöne kayar. Okuma yönünde yan yana gelen bir ünlü ile bir ünsüz
// birleşip hece olur (a + n = an). Hece olunca okunur, yıldız kazandırır (ilerleme).
// 3. seviyede heceler tahtada kalır; iki hece birleşip kelime olursa (an + ne = anne) kelime
// okunur, fazladan ilerleme verir. Her kaydırıştan sonra yeni bir harf gelir. Tahta dolarsa
// en eski taşlar uçup gider (takılma yok). Can yok, kaybetmek yok.
// Seviyeler: 1: 5 hece; 2: 7 hece; 3: 8 puan (hece 1, kelime 2), heceler kalır.

const BIRLESTIR_SEVIYELERI = {
  1: { hedef: 5, heceKalir: false },
  2: { hedef: 7, heceKalir: false },
  3: { hedef: 8, heceKalir: true },
};

const TAHTA_N = 4;
const HUCRE = 130;
const TAHTA_SOL = 640 - (TAHTA_N * HUCRE) / 2;
const TAHTA_UST = 160;

class BirlestirBuyutSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("birlestir-buyut");
  }

  create() {
    this.ortakKur();
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = BIRLESTIR_SEVIYELERI[this.seviye] || BIRLESTIR_SEVIYELERI[1];
    this.ilerlemeKur(this.ayar.hedef);
    const bilgi = (h) => HARFLER.find((x) => x.kucuk === h);
    this.harfler = bilinenHarfler(this.harf);
    this.unluler = this.harfler.filter((h) => bilgi(h).unlu);
    this.unsuzler = this.harfler.filter((h) => !bilgi(h).unlu);
    this.tahta = Array.from({ length: TAHTA_N }, () => Array(TAHTA_N).fill(null));
    this.hareketli = false;
    this.basladi = false;
    this.sayac = 0;

    // Tahta zemini
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xd8cdb8, 1);
    g.fillRoundedRect(TAHTA_SOL - 14, TAHTA_UST - 14, TAHTA_N * HUCRE + 28, TAHTA_N * HUCRE + 28, 24);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(TAHTA_SOL - 14, TAHTA_UST - 14, TAHTA_N * HUCRE + 28, TAHTA_N * HUCRE + 28, 24);
    g.fillStyle(0xf3ead8, 1);
    for (let c = 0; c < TAHTA_N; c++) {
      for (let r = 0; r < TAHTA_N; r++) g.fillRoundedRect(TAHTA_SOL + c * HUCRE + 6, TAHTA_UST + r * HUCRE + 6, HUCRE - 12, HUCRE - 12, 14);
    }

    // Kaydırma
    this.input.on("pointerdown", (p) => { this.basla = { x: p.x, y: p.y }; });
    this.input.on("pointerup", (p) => {
      if (!this.basla) return;
      const dx = p.x - this.basla.x;
      const dy = p.y - this.basla.y;
      this.basla = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
      if (Math.abs(dx) > Math.abs(dy)) this.kaydir(dx > 0 ? 1 : -1, 0);
      else this.kaydir(0, dy > 0 ? 1 : -1);
    });
    this.input.keyboard.on("keydown", (e) => {
      const yon = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
      if (yon) this.kaydir(...yon);
    });

    this.time.delayedCall(400, () => this.harfiTanit(() => {
      // Başlangıç: birleşebilecek iki harf yan yana olmadan, üç taş
      this.tasKoy(this.harf);
      this.tasKoy();
      this.tasKoy();
      this.basladi = true;
      this.elSurukleGoster([{ x: 560, y: 420 }, { x: 720, y: 420 }]);
    }));
  }

  hucreKonum(c, r) {
    return { x: TAHTA_SOL + c * HUCRE + HUCRE / 2, y: TAHTA_UST + r * HUCRE + HUCRE / 2 };
  }

  tasYap(c, r, metin) {
    const { x, y } = this.hucreKonum(c, r);
    const kap = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    const tur = metin.length === 1 ? "harf" : KELIMELER.some((k) => k.kelime === metin) ? "kelime" : "hece";
    const renk = tur === "harf" ? (this.unluler.includes(metin) ? 0xff9c8a : 0x9be3dc) : tur === "hece" ? 0xffe680 : 0xb5e48c;
    g.fillStyle(renk, 1);
    g.fillRoundedRect(-HUCRE / 2 + 8, -HUCRE / 2 + 8, HUCRE - 16, HUCRE - 16, 16);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-HUCRE / 2 + 8, -HUCRE / 2 + 8, HUCRE - 16, HUCRE - 16, 16);
    const boyut = metin.length === 1 ? 64 : metin.length === 2 ? 52 : 38;
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, metin, {
      fontFamily: "Andika", fontSize: `${boyut}px`, color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    kap.tas = { metin, sira: this.sayac++ };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 180, ease: "Back.Out" });
    this.tahta[c][r] = kap;
    return kap;
  }

  // Yeni harf: çoğu zaman tahtadaki bir harfle hece kurabilecek olan (oyunun harfi sık gelir)
  tasKoy(zorunlu) {
    const boslar = [];
    for (let c = 0; c < TAHTA_N; c++) for (let r = 0; r < TAHTA_N; r++) if (!this.tahta[c][r]) boslar.push([c, r]);
    if (!boslar.length) return false;
    let harf = zorunlu;
    if (!harf) {
      const tekler = [];
      for (const sutun of this.tahta) for (const t of sutun) if (t && t.tas.metin.length === 1) tekler.push(t.tas.metin);
      const r = Math.random();
      if (r < 0.4) harf = this.harf;
      else if (tekler.length && r < 0.85) {
        const t = Phaser.Utils.Array.GetRandom(tekler);
        harf = Phaser.Utils.Array.GetRandom(this.unluler.includes(t) ? this.unsuzler : this.unluler);
      } else harf = Phaser.Utils.Array.GetRandom(this.harfler);
    }
    const [c, r] = Phaser.Utils.Array.GetRandom(boslar);
    this.tasYap(c, r, harf);
    return true;
  }

  // İki taş birleşebilir mi? (okuma yönünde soldaki/üstteki önce)
  birlesim(ilk, ikinci) {
    if (ilk.length === 1 && ikinci.length === 1) {
      const birUnlu = this.unluler.includes(ilk) !== this.unluler.includes(ikinci);
      return birUnlu ? { metin: ilk + ikinci, tur: "hece" } : null;
    }
    if (!this.ayar.heceKalir) return null;
    const kelime = KELIMELER.find((k) => k.heceler.length === 2 && k.heceler[0] === ilk && k.heceler[1] === ikinci);
    return kelime ? { metin: kelime.kelime, tur: "kelime" } : null;
  }

  kaydir(dc, dr) {
    if (this.bitti || this.hareketli || !this.basladi) return;
    let oynadi = false;
    const birlesenler = [];
    const sira = [...Array(TAHTA_N).keys()];
    const ckSira = dc > 0 ? sira.slice().reverse() : sira;
    const rkSira = dr > 0 ? sira.slice().reverse() : sira;
    const birlesti = new Set();
    for (const c of ckSira) {
      for (const r of rkSira) {
        const tas = this.tahta[c][r];
        if (!tas) continue;
        let nc = c;
        let nr = r;
        while (true) {
          const sc = nc + dc;
          const sr = nr + dr;
          if (sc < 0 || sr < 0 || sc >= TAHTA_N || sr >= TAHTA_N) break;
          const komsu = this.tahta[sc][sr];
          if (!komsu) { nc = sc; nr = sr; continue; }
          if (!birlesti.has(komsu)) {
            // Okuma yönü: sağa/aşağı kayan taş önce gelir, sola/yukarı kayanda komşu önce gelir
            const ileri = dc > 0 || dr > 0;
            const sonuc = ileri ? this.birlesim(tas.tas.metin, komsu.tas.metin) : this.birlesim(komsu.tas.metin, tas.tas.metin);
            if (sonuc) {
              this.tahta[c][r] = null;
              birlesti.add(komsu);
              birlesenler.push({ tas, komsu, sonuc, c: sc, r: sr });
              oynadi = true;
              nc = null;
            }
          }
          break;
        }
        if (nc === null) continue;
        if (nc !== c || nr !== r) {
          this.tahta[c][r] = null;
          this.tahta[nc][nr] = tas;
          const k = this.hucreKonum(nc, nr);
          this.tweens.add({ targets: tas, x: k.x, y: k.y, duration: 120 });
          oynadi = true;
        }
      }
    }
    if (!oynadi) {
      Sesler.nota(220, 0, 0.06, 0.06, "sine");
      return;
    }
    Sesler.nota(500, 0, 0.05, 0.06, "sine");
    this.hareketli = true;
    // Birleşenler: kayan taş komşunun üstüne gider, ikisi tek taşa dönüşür
    for (const b of birlesenler) {
      const k = this.hucreKonum(b.c, b.r);
      this.tweens.add({ targets: b.tas, x: k.x, y: k.y, duration: 120, onComplete: () => b.tas.destroy() });
    }
    this.time.delayedCall(140, () => {
      for (const b of birlesenler) {
        b.komsu.destroy();
        const yeni = this.tasYap(b.c, b.r, b.sonuc.metin);
        this.birlesmeKutla(yeni, b.sonuc);
      }
      if (!this.tasKoy()) this.yerAc();
      else if (this.dolu()) this.yerAc();
      this.hareketli = false;
    });
  }

  birlesmeKutla(tas, sonuc) {
    Sesler.pling();
    Sesler.soyle(sonuc.metin);
    this.tweens.add({ targets: tas, scale: 1.2, duration: 140, yoyo: true, delay: 180 });
    if (sonuc.tur === "kelime") {
      this.ilerlemeArtir(tas.x, tas.y);
      if (!this.bitti) this.ilerlemeArtir(tas.x, tas.y);
      this.time.delayedCall(900, () => this.tasiUcur(tas));
    } else {
      this.ilerlemeArtir(tas.x, tas.y);
      // Heceler 1-2. seviyede uçup gider (yer açılır); 3. seviyede kalır, kelimeye dönüşebilir
      if (!this.ayar.heceKalir) this.time.delayedCall(700, () => this.tasiUcur(tas));
    }
  }

  tasiUcur(tas) {
    for (let c = 0; c < TAHTA_N; c++) for (let r = 0; r < TAHTA_N; r++) if (this.tahta[c][r] === tas) this.tahta[c][r] = null;
    this.tweens.add({ targets: tas, y: tas.y - 80, alpha: 0, scale: 0.6, duration: 350, onComplete: () => tas.destroy() });
  }

  dolu() {
    return this.tahta.every((sutun) => sutun.every(Boolean));
  }

  // Tahta dolunca en eski üç taş uçup gider (çocuk takılmasın)
  yerAc() {
    const taslar = [];
    for (const sutun of this.tahta) for (const t of sutun) if (t) taslar.push(t);
    taslar.sort((a, b) => a.tas.sira - b.tas.sira).slice(0, 3).forEach((t) => this.tasiUcur(t));
  }

  oyunBitti() {
    this.basladi = false;
  }
}

miniOyunKaydet("birlestir-buyut", BirlestirBuyutSahnesi);
