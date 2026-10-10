// Resimden Sesi Bul: harfin kelimedeki yerine göre resimli kelimeler (sadece veri).
// bas: harf başında (1. düzey), son: sonunda (2. düzey), orta: ortasında (3. düzey).
// Öğretmenin kuralı: okumada karışabilen sesler (ı/i gibi) soruyu karıştırmasın: "i" sorulurken
// yanlış seçeneklerde "ı" de geçmez (`KARISAN_SESLER`). Öğretmenin eklediği ve istediği yabancı
// kökenli kelimeler (pizza, tren, otobüs...) de var.
// Resim: harfin kendi ipucu resmi (harfler.js) ya da gorseller/resim-<kelime>.svg (doodle_ciz.py).
const KONUMLU_KELIMELER = {
  a: {
    bas: ["arı", "ayı", "at", "armut", "ay", "ağaç", "ayak", "ayakkabı", "araba", "altın", "ayna",
      "aslan", "ateş"],
    son: ["elma", "kova", "fırça", "çorba", "masa", "çanta", "kumbara", "kurbağa", "pizza",
      "panda", "nota", "bina", "yonca", "para", "kupa", "vida", "yuva"],
    orta: ["kapı", "balık", "tavuk", "kaşık", "havuç", "yaprak", "bardak", "kalem", "lale", "fare",
      "kale", "kitap", "kiraz", "sincap", "timsah", "kanguru", "patates", "ocak"],
  },
  n: {
    bas: ["nar", "nal", "nohut", "nane", "nine", "nergis", "nehir", "nota"],
    son: ["aslan", "koyun", "yorgan", "kazan", "fincan", "zeytin", "balon", "tren"],
    orta: ["çanta", "dondurma", "tencere", "anahtar", "yengeç", "fındık", "fener", "sincap",
      "kanguru", "panda", "bina", "yonca"],
  },
  e: {
    bas: ["eşek", "elma", "ev", "el", "erik", "ekmek", "etek", "eldiven", "elbise"],
    son: ["deve", "küpe", "tencere", "kepçe", "iğne", "bilye", "şemsiye", "lale", "fare", "kale", "bere", "pide", "düğme", "oje"],
    orta: ["kedi", "gemi", "ördek", "sepet", "ceviz", "bebek", "çiçek", "kemik", "kalem", "ateş",
      "tren", "patates", "ceket", "kek", "börek"],
  },
  t: {
    bas: ["tilki", "top", "tavşan", "tabak", "tavuk", "tarak", "tencere", "terlik", "testere",
      "timsah", "tren", "tost"],
    son: ["at", "süt", "bulut", "armut", "sepet", "kilit", "kibrit", "ceket", "şort", "flüt"],
    orta: ["çatal", "kutu", "etek", "fıstık", "yatak", "kartal", "kitap", "ateş", "nota", "otobüs",
      "patates", "motor"],
  },
  i: {
    bas: ["inek", "ip", "iğne", "incir", "inci", "iplik", "iki", "iguana"],
    son: ["kedi", "gemi", "kirpi", "keçi", "tilki", "hindi", "kivi"],
    orta: ["fil", "diş", "zil", "biber", "civciv", "çiçek", "pil", "kilit", "kibrit", "kitap",
      "kiraz", "sincap", "timsah", "pizza", "bina", "pide", "polis", "vida"],
  },
  l: {
    bas: ["leylek", "lamba", "lahana", "lokum", "leğen", "lama", "limon", "lahmacun", "lale"],
    son: ["fil", "bal", "gül", "kartal", "çatal", "zil", "nal"],
    orta: ["elma", "balık", "kelebek", "bulut", "kulak", "halı", "silgi", "bilezik", "kalem",
      "kale", "polis", "flüt"],
  },
  // 2. harf grubu (o, k, u, r, ı, m)
  o: {
    bas: ["otobüs", "ok", "odun", "oklava", "on", "ocak", "oje"],
    son: ["piyano", "radyo", "domino", "flamingo", "avokado"],
    orta: ["kova", "koyun", "top", "nohut", "lokum", "balon", "yorgan", "çorba", "dondurma", "nota", "motor", "tost", "yonca", "şort", "polis", "fok"],
  },
  k: {
    bas: ["kedi", "kova", "koyun", "kale", "kalem", "kapı", "kartal", "kaşık", "kazan", "keçi",
      "kelebek", "kibrit", "kilit", "kiraz", "kirpi", "kitap", "kumbara", "kurbağa", "kuzu", "kuyu", "kaykay", "kafes", "kek", "kız", "kupa", "kivi"],
    son: ["balık", "bebek", "çiçek", "erik", "etek", "fındık", "fıstık", "iplik", "yaprak", "bardak",
      "tavuk", "uçak", "ıspanak", "börek", "ocak", "sucuk", "fok"],
    orta: ["iki", "lokum", "ayakkabı", "şeker", "akvaryum", "makas"],
  },
  u: {
    bas: ["uçak", "un", "uçurtma", "ut", "uzaylı"],
    son: ["kutu", "kanguru", "boru", "kuyu", "kuzu"],
    orta: ["bulut", "nohut", "armut", "lokum", "kulak", "tavuk", "kumbara", "kurbağa", "dondurma", "sucuk", "kupa", "yuva", "ruj"],
  },
  r: {
    bas: ["robot", "radyo", "roket", "raket", "rende", "reçel", "ruj"],
    son: ["anahtar", "biber", "fener", "nehir", "nar", "şeker", "motor"],
    orta: ["armut", "araba", "kartal", "kurbağa", "kiraz", "kirpi", "terlik", "erik", "kibrit", "tarak",
      "bardak", "çorba", "fırça", "ördek", "bere", "börek", "şort", "para"],
  },
  ı: {
    bas: ["ıspanak", "ıslık", "ızgara", "ıstakoz"],
    son: ["kapı", "ayı", "halı", "ayakkabı", "arı", "fıçı"],
    orta: ["balık", "fındık", "fıstık", "fırça", "kaşık", "altın", "kız"],
  },
  m: {
    bas: ["maymun", "masa", "muz", "mum", "mantar", "makas", "motor"],
    son: ["lokum", "kalem", "üzüm", "akvaryum", "çim"],
    orta: ["limon", "lamba", "kumbara", "timsah", "ekmek", "lahmacun", "dondurma", "kemik", "elma", "lama", "düğme"],
  },
  // 3. harf grubu (ü, s, ö, y, d, z). ö ve d ile biten resimli kelime yok (bkz. konumSec)
  ü: {
    bas: ["üzüm", "ütü", "üç", "üçgen"],
    son: ["köprü", "örgü"],
    orta: ["gül", "süt", "küpe", "otobüs", "güneş", "gözlük", "dürbün", "düğme", "flüt"],
  },
  s: {
    bas: ["sincap", "süt", "sepet", "silgi", "saat", "sandalye", "simit", "sabun", "sinek", "salıncak", "sucuk"],
    son: ["otobüs", "patates", "nergis", "makas", "kaktüs", "ananas", "polis"],
    orta: ["aslan", "masa", "elbise", "timsah", "fıstık", "ıspanak", "tost"],
  },
  ö: {
    bas: ["ördek", "örümcek", "ödül", "örgü", "önlük"],
    son: [],
    orta: ["göz", "köpek", "dört", "böcek", "gözlük", "köprü", "börek", "çöp"],
  },
  y: {
    bas: ["yunus", "yaprak", "yatak", "yengeç", "yorgan", "yumurta", "yonca", "yuva"],
    son: ["ay", "çay", "saray", "kaykay"],
    orta: ["ayak", "ayı", "ayna", "ayakkabı", "koyun", "bilye", "şemsiye", "maymun"],
  },
  d: {
    bas: ["deve", "dondurma", "diş", "davul", "domates", "dinozor", "dürbün", "düğme"],
    son: [],
    orta: ["bardak", "fındık", "kedi", "ördek", "yıldız", "pide", "vida"],
  },
  z: {
    bas: ["zürafa", "zeytin", "zil", "zar"],
    son: ["kiraz", "ceviz", "muz", "buz", "yıldız", "kız"],
    orta: ["üzüm", "bilezik", "ızgara", "uzaylı", "kuzu", "kazan"],
  },
  // 4. harf grubu (ç, b, g, c, ş). b, g ve c ile biten resimli kelime yok (bkz. konumSec)
  ç: {
    bas: ["çekirge", "çanta", "çatal", "çiçek", "çorba", "çay", "çim", "çeşme", "çöp"],
    son: ["ağaç", "havuç", "yengeç", "üç"],
    orta: ["kepçe", "fırça", "keçi", "uçak", "uçurtma", "fıçı"],
  },
  b: {
    bas: ["balık", "balon", "bal", "bardak", "bebek", "biber", "bilye", "bulut", "buz", "böcek", "bere", "bina", "börek"],
    son: [],
    orta: ["ayakkabı", "kumbara", "kibrit", "otobüs", "robot", "çorba", "elbise"],
  },
  g: {
    bas: ["güvercin", "gemi", "gül", "güneş", "gözlük", "göz", "gitar", "geyik", "gömlek"],
    son: [],
    orta: ["silgi", "nergis", "iguana", "yorgan", "kanguru"],
  },
  c: {
    bas: ["ceviz", "civciv", "ceket", "cüzdan", "ciklet"],
    son: [],
    orta: ["fincan", "lahmacun", "incir", "inci", "sincap", "örümcek", "ocak", "yonca", "sucuk"],
  },
  ş: {
    bas: ["şemsiye", "şeker", "şahin", "şişe", "şato", "şimşek", "şort"],
    son: ["ateş", "diş", "güneş"],
    orta: ["kaşık", "tavşan", "eşek", "çeşme"],
  },
  // 5. harf grubu (p, h, v, ğ, f, j). ğ kelime başında gelmez; h, f, j ile biten resimli kelime yok
  // (bkz. konumSec)
  p: {
    bas: ["penguen", "patates", "panda", "pil", "pizza", "para", "pide", "polis"],
    son: ["kitap", "top", "ip", "çöp"],
    orta: ["kirpi", "iplik", "kapı", "kepçe", "yaprak", "sepet", "kupa"],
  },
  h: {
    bas: ["horoz", "hindi", "halı", "havuç"],
    son: [],
    orta: ["lahana", "lahmacun", "anahtar"],
  },
  v: {
    bas: ["vapur", "vazo", "valiz", "vida"],
    son: ["ev"],
    orta: ["havuç", "tavşan", "tavuk", "kova", "deve", "eldiven", "ceviz", "civciv", "güvercin", "yuva", "kivi"],
  },
  ğ: {
    bas: [],
    son: ["dağ"],
    orta: ["ağaç", "leğen", "iğne", "kurbağa", "düğme"],
  },
  f: {
    bas: ["fil", "fare", "fener", "fincan", "fındık", "fıstık", "fırça", "fok", "fıçı", "flüt"],
    son: [],
    orta: ["zürafa", "telefon", "kafes"],
  },
  j: {
    bas: ["jelibon", "jaguar", "jöle"],
    son: ["ruj"],
    orta: ["pijama", "oje"],
  },
};

// Bu harfte bu konumda yeterli resimli kelime yoksa (ö ve d ile biten kelime yok) başka konum
// sorulur: önce orta, sonra baş
function konumSec(harf, konum) {
  const k = KONUMLU_KELIMELER[harf] || KONUMLU_KELIMELER.a;
  if (k[konum] && k[konum].length >= 2) return konum;
  return ["orta", "bas", "son"].find((x) => k[x] && k[x].length >= 2);
}

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
