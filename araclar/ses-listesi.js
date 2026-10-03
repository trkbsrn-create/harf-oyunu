// Oyunda sesli okunan bütün sözlerin listesi (seslendir.py kullanır).
// Çalıştırma: node araclar/ses-listesi.js  → JSON yazar: [{ dosya, metin, ses }]
// ses: "harper" (harf, hece, kelime), "elif" (kutlama) ya da "ava" (hikâye ve genel sözler) – öğretmenin seçimi.

const fs = require("fs");
const vm = require("vm");
const path = require("path");

const kok = path.join(__dirname, "..");
const baglam = { Phaser: { Scene: class {} }, console };
vm.createContext(baglam);
for (const dosya of ["harfler.js", "minioyunlar/ortak.js"]) {
  vm.runInContext(fs.readFileSync(path.join(kok, dosya), "utf8"), baglam);
}
const { HARFLER, KELIMELER, PLANLANAN_OYUNLAR, heceHavuzu } = vm.runInContext(
  "({ HARFLER, KELIMELER, PLANLANAN_OYUNLAR, heceHavuzu })", baglam);

// Hikâye sözleri oyun.js'den alınır (HIKAYE_KARELERI); final ve kutlama sözleri burada yazılı.
const oyun = fs.readFileSync(path.join(kok, "oyun.js"), "utf8");
const hikaye = [...oyun.slice(oyun.indexOf("const HIKAYE_KARELERI")).split("];")[0]
  .matchAll(/soz: "([^"]+)"/g)].map((m) => m[1]);
const finalSozleri = ["Haydi, yola çıkalım!", "Hoşça kal, ilk ada!", "2. ada seni bekliyor!"];
const kutlamalar = ["Yelkenli hazır! Aferin!"];

const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
const kisalt = (m) => m.toLocaleLowerCase("tr-TR").replace(/[çğıöşüâîû]/g, (h) => TR[h])
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const liste = [];
const goruldu = new Set();
const ekle = (tur, metin, ses) => {
  if (goruldu.has(metin)) return; // aynı söz tek dosya ("a" hem harf hem hece)
  goruldu.add(metin);
  liste.push({ dosya: `${tur}-${kisalt(metin)}`, metin, ses });
};

const grup1 = HARFLER.filter((h) => h.grup === 1);
// Ünsüzler oyunda okunmaz (öğretmenin kararı); yalnızca ünlüler
grup1.filter((h) => h.unlu).forEach((h) => ekle("harf", h.kucuk, "harper"));
heceHavuzu("a").forEach((h) => ekle("hece", h.hece, "harper"));
KELIMELER.forEach((k) => k.heceler.forEach((h) => ekle("hece", h, "harper")));
grup1.forEach((h) => ekle("kelime", h.kelime, "harper"));
KELIMELER.forEach((k) => ekle("kelime", k.kelime, "harper"));
kutlamalar.forEach((m) => ekle("soz", m, "elif"));
hikaye.forEach((m) => ekle("soz", m, "ava"));
finalSozleri.forEach((m) => ekle("soz", m, "ava"));
PLANLANAN_OYUNLAR.forEach((o) => ekle("oyun", o.baslik, "ava"));

process.stdout.write(JSON.stringify(liste, null, 1));
