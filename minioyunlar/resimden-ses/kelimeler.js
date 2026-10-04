// Resimden Sesi Bul: harfin kelimedeki yerine göre resimli kelimeler (sadece veri).
// bas: harf başında (1. düzey), son: sonunda (2. düzey), orta: ortasında (3. düzey).
// Öğretmenin kuralı: okumada karışabilen sesler (ı/i gibi) soruyu karıştırmasın: "i" sorulurken
// yanlış seçeneklerde "ı" de geçmez (`KARISAN_SESLER`). Öğretmenin eklediği kelimeler de var.
// Resim: harfin kendi ipucu resmi (harfler.js) ya da gorseller/resim-<kelime>.svg (doodle_ciz.py).
const KONUMLU_KELIMELER = {
  a: {
    bas: ["arı", "ayı", "at", "armut", "ay", "ağaç", "ayak", "ayakkabı", "araba", "altın", "ayna",
      "aslan", "ateş"],
    son: ["elma", "kova", "fırça", "çorba", "masa", "çanta", "kumbara", "kurbağa"],
    orta: ["kapı", "balık", "tavuk", "kaşık", "havuç", "yaprak", "bardak", "kalem", "lale", "fare",
      "kale", "kitap", "kiraz", "sincap", "timsah"],
  },
  n: {
    bas: ["nar", "nal", "nohut", "nane", "nine", "nergis", "nehir"],
    son: ["aslan", "koyun", "yorgan", "kazan", "fincan", "zeytin", "balon"],
    orta: ["çanta", "dondurma", "tencere", "anahtar", "yengeç", "fındık", "fener", "sincap"],
  },
  e: {
    bas: ["eşek", "elma", "ev", "el", "erik", "ekmek", "etek", "eldiven", "elbise"],
    son: ["deve", "küpe", "tencere", "kepçe", "iğne", "bilye", "şemsiye", "lale", "fare", "kale"],
    orta: ["kedi", "gemi", "ördek", "sepet", "ceviz", "bebek", "çiçek", "kemik", "kalem", "ateş"],
  },
  t: {
    bas: ["tilki", "top", "tavşan", "tabak", "tavuk", "tarak", "tencere", "terlik", "testere",
      "timsah"],
    son: ["at", "süt", "bulut", "armut", "sepet", "kilit", "kibrit"],
    orta: ["çatal", "kutu", "etek", "fıstık", "yatak", "kartal", "kitap", "ateş"],
  },
  i: {
    bas: ["inek", "ip", "iğne", "incir", "inci", "iplik", "iki", "iguana"],
    son: ["kedi", "gemi", "kirpi", "keçi", "tilki", "hindi"],
    orta: ["fil", "diş", "zil", "biber", "civciv", "çiçek", "pil", "kilit", "kibrit", "kitap",
      "kiraz", "sincap", "timsah"],
  },
  l: {
    bas: ["leylek", "lamba", "lahana", "lokum", "leğen", "lama", "limon", "lahmacun", "lale"],
    son: ["fil", "bal", "gül", "kartal", "çatal", "zil", "nal"],
    orta: ["elma", "balık", "kelebek", "bulut", "kulak", "halı", "silgi", "bilezik", "kalem",
      "kale"],
  },
};

// Okumada birbirine karışabilen sesler: yanlış seçeneklerde bunlar da geçmez
const KARISAN_SESLER = { i: ["ı"], ı: ["i"], o: ["ö"], ö: ["o"], u: ["ü"], ü: ["u"] };

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
