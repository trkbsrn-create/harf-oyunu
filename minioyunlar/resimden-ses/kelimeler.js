// Resimden Sesi Bul: harfin kelimedeki yerine göre resimli kelimeler (sadece veri).
// bas: harf başında (1. düzey), son: sonunda (2. düzey), orta: ortasında (3. düzey).
// Öğretmenin kararı: Türkçe kurallarına uygun kelimeler (büyük ünlü uyumu, başta iki ünsüz yok,
// yabancı kelime yok); öğretmenin eklediği limon, lama, lahmacun, iki, iguana da var.
// Resim: harfin kendi ipucu resmi (harfler.js) ya da gorseller/resim-<kelime>.svg (doodle_ciz.py).
const KONUMLU_KELIMELER = {
  a: {
    bas: ["arı", "ayı", "at", "armut", "ay", "ağaç", "ayak", "ayakkabı", "araba", "altın", "ayna", "aslan"],
    son: ["kova", "fırça", "çorba", "masa", "çanta", "kumbara", "kurbağa"],
    orta: ["kapı", "balık", "tavuk", "kaşık", "havuç", "yaprak", "bardak"],
  },
  n: {
    bas: ["nar", "nal", "nohut", "nane", "nine", "nergis", "nehir"],
    son: ["aslan", "koyun", "yorgan", "kazan", "fincan", "zeytin", "balon"],
    orta: ["çanta", "dondurma", "tencere", "anahtar", "yengeç", "fındık", "fener"],
  },
  e: {
    bas: ["eşek", "ev", "el", "erik", "ekmek", "etek", "eldiven", "elbise"],
    son: ["deve", "küpe", "tencere", "kepçe", "iğne", "bilye", "şemsiye"],
    orta: ["kedi", "gemi", "ördek", "sepet", "ceviz", "bebek", "çiçek", "kemik"],
  },
  t: {
    bas: ["tilki", "top", "tavşan", "tabak", "tavuk", "tarak", "tencere", "terlik", "testere"],
    son: ["at", "süt", "bulut", "armut", "sepet", "kilit", "kibrit"],
    orta: ["çatal", "kutu", "etek", "fıstık", "yatak", "kartal"],
  },
  i: {
    bas: ["inek", "ip", "iğne", "incir", "inci", "iplik", "iki", "iguana"],
    son: ["kedi", "gemi", "kirpi", "keçi", "tilki", "hindi"],
    orta: ["fil", "diş", "zil", "biber", "civciv", "çiçek", "pil", "kilit", "kibrit"],
  },
  l: {
    bas: ["leylek", "lamba", "lahana", "lokum", "leğen", "lama", "limon", "lahmacun"],
    son: ["fil", "bal", "gül", "kartal", "çatal", "zil", "nal"],
    orta: ["balık", "kelebek", "bulut", "kulak", "halı", "silgi", "bilezik"],
  },
};

const KONUM_ADLARI = { bas: "Başında", son: "Sonunda", orta: "Ortasında" };

// Kelimenin resim dokusunun adı
function kelimeResmi(kelime) {
  const harf = HARFLER.find((h) => h.kelime === kelime && h.resim);
  if (harf) return harf.resim;
  const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  return "resim-" + kelime.replace(/[çğıöşü]/g, (h) => TR[h]);
}

// Bütün resimli kelimeler (yanlış seçenekler buradan, harfi hiç içermeyenlerden seçilir)
const RESIMLI_KELIMELER = [...new Set(Object.values(KONUMLU_KELIMELER)
  .flatMap((k) => [...k.bas, ...k.son, ...k.orta]))];
