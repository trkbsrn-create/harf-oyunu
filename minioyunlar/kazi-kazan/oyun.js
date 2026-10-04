// Mini oyun: Kazı Kazan (resmi kazı, harfin yerini bul)
// Gümüş kaplı bir kart var. Çocuk parmağıyla kartı kazır; altından oyunun harfinin geçtiği bir
// resim çıkar (kelimeler Resimden Sesi Bul'un listesinden: KONUMLU_KELIMELER). Kartın yaklaşık
// yarısı kazınınca resmin adı okunur ve altta seçenekler belirir: her seçenekte üç kutu var, harf
// başta, ortada ya da sondaki kutuda (öğretmenin isteği: Resimden Sesi Bul'un tersi). Çocuk harfin
// kelimedeki yerini seçer. Doğruysa kartın kalanı açılır, ad yeniden okunur. Yanlış seçim can götürür.
// Yalnızca harfin tek bir yerde geçtiği kelimeler sorulur ("araba" gibi her yerde olanlar sorulmaz);
// karışabilen ses (i/ı) geçen kelimeler de sorulmaz.
// Seviyeler: 1: 4 kart, başında / sonunda; 2: 5 kart, başında / ortasında / sonunda; 3: 6 kart, üçü.

const KAZI_SEVIYELERI = {
  1: { tur: 4, yerler: ["bas", "son"] },
  2: { tur: 5, yerler: ["bas", "orta", "son"] },
  3: { tur: 6, yerler: ["bas", "orta", "son"] },
};
const KAZI_YER_KUTUSU = { bas: 0, orta: 1, son: 2 };

// Harfin kelimedeki yeri: "bas", "orta", "son"; harf birden çok yerde geçiyorsa null
function harfinYeri(kelime, harf) {
  const yerler = new Set();
  [...kelime].forEach((h, i) => {
    if (h === harf) yerler.add(i === 0 ? "bas" : i === kelime.length - 1 ? "son" : "orta");
  });
  return yerler.size === 1 ? [...yerler][0] : null;
}

const KART = { x: 640, y: 330, en: 400, boy: 300 };
const KAZI_FIRCA = 34;
const KAZI_HUCRE = 25; // kazınan oranı ölçmek için küçük kareler

class KaziKazanSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("kazi-kazan");
  }

  preload() {
    super.preload();
    for (const k of this.kelimeleriSec()) {
      const ad = kelimeResmi(k.kelime);
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  // Sorulabilecek kelimeler: harf tek yerde geçer, karışan ses yok, yer bu seviyede soruluyor
  kelimeleriSec() {
    const ayar = KAZI_SEVIYELERI[this.seviye] || KAZI_SEVIYELERI[1];
    const liste = KONUMLU_KELIMELER[this.harf] || KONUMLU_KELIMELER.a;
    const harf = KONUMLU_KELIMELER[this.harf] ? this.harf : "a";
    const karisan = KARISAN_SESLER[harf] || [];
    const kelimeler = [...new Set([...liste.bas, ...liste.son, ...liste.orta])];
    return kelimeler.map((kelime) => ({ kelime, yer: harfinYeri(kelime, harf) }))
      .filter((k) => k.yer && ayar.yerler.includes(k.yer) && !karisan.some((h) => k.kelime.includes(h)));
  }

  create() {
    this.ortakKur();
    this.ayar = KAZI_SEVIYELERI[this.seviye] || KAZI_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.hedefPaneliKur("Harf:");
    this.kelimeler = this.kelimeleriSec();
    this.sira = [];
    this.sorulan = null;
    this.turNo = 0;
    this.secenekler = [];
    this.resim = null;
    this.kaplama = null;
    this.acildi = false;
    this.cevaplandi = false;

    if (!this.textures.exists("kazi-firca")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(KAZI_FIRCA, KAZI_FIRCA, KAZI_FIRCA);
      g.generateTexture("kazi-firca", KAZI_FIRCA * 2, KAZI_FIRCA * 2);
      g.destroy();
    }
    if (!this.textures.exists("kazi-toz")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 6, 6);
      g.generateTexture("kazi-toz", 6, 6);
      g.destroy();
    }

    // Kartın çerçevesi
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(KART.x - KART.en / 2 - 14, KART.y - KART.boy / 2 - 10, KART.en + 36, KART.boy + 36, 26);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(KART.x - KART.en / 2 - 20, KART.y - KART.boy / 2 - 20, KART.en + 40, KART.boy + 40, 26);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(KART.x - KART.en / 2 - 20, KART.y - KART.boy / 2 - 20, KART.en + 40, KART.boy + 40, 26);

    // Kartın yanında hoparlör: resmin adı yeniden okunur (resim çıkınca)
    this.hoparlor = this.add.container(KART.x + KART.en / 2 + 70, KART.y - KART.boy / 2 + 20, [this.hoparlorCiz(0, 0, 32)])
      .setDepth(10).setSize(84, 84).setInteractive({ useHandCursor: true }).setAlpha(0.35);
    this.hoparlor.on("pointerdown", () => { if (this.acildi) Sesler.soyle(this.sorulan.kelime); });

    this.input.on("pointerdown", (p) => this.kazi(p));
    this.input.on("pointermove", (p) => { if (p.isDown) this.kazi(p); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniKart()));
  }

  yeniKart() {
    if (this.bitti) return;
    for (const s of this.secenekler) s.destroy();
    this.secenekler = [];
    if (this.resim) this.resim.destroy();
    if (this.kaplama) this.kaplama.destroy();
    this.acildi = false;
    this.cevaplandi = false;
    this.kazinan = new Set();
    this.toplamHucre = Math.ceil(KART.en / KAZI_HUCRE) * Math.ceil(KART.boy / KAZI_HUCRE);

    // Sorulan resim: kolay başlangıç ilk kart "başında"; sonra yerler karışık, aynı kelime tekrar etmez
    if (!this.sira.length) this.sira = Phaser.Utils.Array.Shuffle(this.kelimeler.slice());
    let i = this.turNo === 0 ? this.sira.findIndex((k) => k.yer === "bas") : this.sira.findIndex((k) => k.yer !== (this.sorulan && this.sorulan.yer));
    if (i < 0) i = 0;
    this.sorulan = this.sira.splice(i, 1)[0];
    this.turNo++;
    this.hoparlor.setAlpha(0.35);
    this.resim = this.add.image(KART.x, KART.y, kelimeResmi(this.sorulan.kelime)).setDepth(2);
    this.resim.setScale(Math.min((KART.en - 40) / this.resim.width, (KART.boy - 30) / this.resim.height));

    // Gümüş kaplama: kazındıkça silinir
    this.kaplama = this.add.renderTexture(KART.x, KART.y, KART.en, KART.boy).setDepth(3);
    const k = this.make.graphics({ add: false });
    k.fillStyle(0xb8b8b8, 1);
    k.fillRoundedRect(0, 0, KART.en, KART.boy, 18);
    k.lineStyle(3, 0xd6d6d6, 1);
    for (let x = -KART.boy; x < KART.en; x += 16) k.lineBetween(x, KART.boy, x + KART.boy, 0);
    k.fillStyle(0x9e9e9e, 1);
    for (let i = 0; i < 4; i++) k.fillCircle(60 + i * 95, KART.boy / 2, 22);
    k.fillStyle(0xfffdf6, 1);
    for (let i = 0; i < 4; i++) k.fillCircle(60 + i * 95, KART.boy / 2, 10);
    this.kaplama.draw(k, 0, 0);
    k.destroy();
    this.time.delayedCall(300, () => this.elSurukleGoster([
      { x: KART.x - 120, y: KART.y - 60 }, { x: KART.x + 60, y: KART.y - 20 },
      { x: KART.x - 80, y: KART.y + 40 }, { x: KART.x + 120, y: KART.y + 70 }]));
  }

  kazi(p) {
    if (this.bitti || !this.kaplama || this.acildi && this.cevaplandi) return;
    const yx = p.x - (KART.x - KART.en / 2);
    const yy = p.y - (KART.y - KART.boy / 2);
    if (yx < -20 || yy < -20 || yx > KART.en + 20 || yy > KART.boy + 20) return;
    this.kaplama.erase("kazi-firca", yx - KAZI_FIRCA, yy - KAZI_FIRCA);
    if (Math.random() < 0.35) Sesler.nota(1800 + Math.random() * 600, 0, 0.03, 0.02, "sawtooth");
    if (Math.random() < 0.3) {
      this.add.particles(p.x, p.y, "kazi-toz", {
        speed: { min: 40, max: 120 }, lifespan: 300, scale: { start: 1, end: 0 }, tint: 0x9e9e9e,
        gravityY: 300, emitting: false,
      }).setDepth(4).explode(3);
    }
    // Fırçanın altındaki hücreler kazınmış sayılır
    for (let dx = -KAZI_FIRCA; dx <= KAZI_FIRCA; dx += KAZI_HUCRE / 2) {
      for (let dy = -KAZI_FIRCA; dy <= KAZI_FIRCA; dy += KAZI_HUCRE / 2) {
        if (dx * dx + dy * dy > KAZI_FIRCA * KAZI_FIRCA) continue;
        const c = Math.floor((yx + dx) / KAZI_HUCRE);
        const r = Math.floor((yy + dy) / KAZI_HUCRE);
        if (c >= 0 && r >= 0 && c < KART.en / KAZI_HUCRE && r < KART.boy / KAZI_HUCRE) this.kazinan.add(c + "," + r);
      }
    }
    if (!this.acildi && this.kazinan.size / this.toplamHucre > 0.45) this.secenekleriGoster();
  }

  // Seçenekler: üç kutu, harf başta / ortada / sondaki kutuda. Resmin adı okunur.
  secenekleriGoster() {
    this.acildi = true;
    Sesler.pling();
    this.hoparlor.setAlpha(1);
    this.time.delayedCall(300, () => Sesler.soyle(this.sorulan.kelime));
    const yerler = this.ayar.yerler;
    yerler.forEach((yer, i) => {
      const x = 640 + (i - (yerler.length - 1) / 2) * 290;
      const kap = this.add.container(x, 615).setDepth(10);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.12);
      g.fillRoundedRect(-122, -48, 250, 102, 20);
      g.fillStyle(0xfffdf6, 1);
      g.fillRoundedRect(-126, -52, 250, 102, 20);
      g.lineStyle(4, 0x2b2b2b, 1);
      g.strokeRoundedRect(-126, -52, 250, 102, 20);
      kap.add(g);
      // Üç küçük kutu; harfin kutusu sarı
      for (let k = 0; k < 3; k++) {
        const kx = (k - 1) * 72 - 1;
        const dolu = k === KAZI_YER_KUTUSU[yer];
        const kg = this.add.graphics();
        kg.fillStyle(dolu ? 0xffe680 : 0xffffff, 1);
        kg.fillRoundedRect(kx - 30, -36, 60, 70, 12);
        kg.lineStyle(4, 0x2b2b2b, 1);
        kg.strokeRoundedRect(kx - 30, -36, 60, 70, 12);
        kap.add(kg);
        if (dolu) {
          kap.add(boyaliOrtala(this.add.text(kx, -1, this.harf, {
            fontFamily: "Andika", fontSize: "50px", color: "#2b2b2b", padding: { x: 4, y: 4 },
          })));
        }
      }
      kap.cizim = g;
      kap.secenek = { yer, dogru: yer === this.sorulan.yer };
      kap.setSize(260, 120).setInteractive({ useHandCursor: true });
      kap.on("pointerdown", () => this.sec(kap));
      kap.setScale(0);
      this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: i * 90, ease: "Back.Out" });
      this.secenekler.push(kap);
    });
    this.time.delayedCall(1200, () => this.elGoster(this.secenekler.find((s) => s.secenek.dogru)));
  }

  sec(kap) {
    if (this.bitti || this.cevaplandi || kap.secenek.secildi) return;
    kap.secenek.secildi = true;
    const g = kap.cizim;
    if (kap.secenek.dogru) {
      this.cevaplandi = true;
      g.lineStyle(9, 0x8fd16a, 1);
      g.strokeRoundedRect(-126, -52, 250, 102, 20);
      // Kaplamanın kalanı açılır, resmin adı okunur
      this.tweens.add({ targets: this.kaplama, alpha: 0, duration: 400 });
      Sesler.pling();
      this.time.delayedCall(300, () => Sesler.soyle(this.sorulan.kelime));
      this.ilerlemeArtir(KART.x, KART.y);
      if (!this.bitti) this.time.delayedCall(2000, () => this.yeniKart());
    } else {
      g.lineStyle(9, 0xff8a7a, 1);
      g.strokeRoundedRect(-126, -52, 250, 102, 20);
      kap.setAlpha(0.55);
      this.tweens.add({ targets: kap, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.ipucuGoster(this.secenekler.find((s) => s.secenek.dogru));
    }
  }

  oyunBitti() {
    for (const s of this.secenekler) s.disableInteractive();
  }
}

miniOyunKaydet("kazi-kazan", KaziKazanSahnesi);
