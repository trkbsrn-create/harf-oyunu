// Resimden Sesi Bul: harfin kelimedeki yerine göre resimli kelimeler (sadece veri).
// bas: harf başında (1. düzey), son: sonunda (2. düzey), orta: ortasında (3. düzey).
// Öğretmenin kuralı: okumada karışabilen sesler (ı/i gibi) soruyu karıştırmasın: "i" sorulurken
// yanlış seçeneklerde "ı" de geçmez (`KARISAN_SESLER`). Öğretmenin eklediği ve istediği yabancı
// kökenli kelimeler (pizza, tren, otobüs...) de var.
// Resim: harfin kendi ipucu resmi (harfler.js) ya da gorseller/resim-<kelime>.svg (doodle_ciz.py).
const KONUMLU_KELIMELER = {
  a: {
    bas: ["arı", "ayı", "at", "armut", "ay", "ağaç", "ayak", "ayakkabı", "araba", "altın", "ayna",
      "aslan", "ateş", "ağ", "ağız", "ahtapot", "ampul"],
    son: ["elma", "kova", "fırça", "çorba", "masa", "çanta", "kumbara", "kurbağa", "pizza",
      "panda", "nota", "bina", "yonca", "para", "kupa", "vida", "yuva", "jandarma", "tuğla", "boğa", "çikolata", "kamera", "karınca", "olta", "pusula", "toka", "zımba"],
    orta: ["kapı", "balık", "tavuk", "kaşık", "havuç", "yaprak", "bardak", "kalem", "lale", "fare",
      "kale", "kitap", "kiraz", "sincap", "timsah", "kanguru", "patates", "ocak", "japon balığı", "garaj", "bagaj", "plaj", "yağ", "bağ", "soğan", "yağmur", "sağ", "bayrak", "baykuş", "çorap", "çadır", "dolap", "gökkuşağı", "gazete", "hamburger", "karpuz", "kalp", "mıknatıs", "palyaço", "patlıcan", "paten", "saksı", "salatalık", "salyangoz", "traktör", "terazi", "takvim", "taç", "vantilatör", "yılan", "yelpaze", "zarf"],
  },
  n: {
    bas: ["nar", "nal", "nohut", "nane", "nine", "nergis", "nehir", "nota"],
    son: ["aslan", "koyun", "yorgan", "kazan", "fincan", "zeytin", "balon", "tren", "soğan", "düğün", "öğretmen", "fırın", "merdiven", "mikrofon", "patlıcan", "paten", "televizyon", "yılan"],
    orta: ["çanta", "dondurma", "tencere", "anahtar", "yengeç", "fındık", "fener", "sincap",
      "kanguru", "panda", "bina", "yonca", "jandarma", "japon balığı", "huni", "karınca", "mıknatıs", "pencere", "peynir", "salyangoz", "vantilatör", "vinç", "zincir"],
  },
  e: {
    bas: ["eşek", "elma", "ev", "el", "erik", "ekmek", "etek", "eldiven", "elbise", "emzik"],
    son: ["deve", "küpe", "tencere", "kepçe", "iğne", "bilye", "şemsiye", "lale", "fare", "kale", "bere", "pide", "düğme", "oje", "gazete", "hediye", "midye", "pencere", "süpürge", "yelpaze"],
    orta: ["kedi", "gemi", "ördek", "sepet", "ceviz", "bebek", "çiçek", "kemik", "kalem", "ateş",
      "tren", "patates", "ceket", "kek", "börek", "jet", "çiğdem", "öğretmen", "bisiklet", "cetvel", "çilek", "çekiç", "helikopter", "hamburger", "kamera", "merdiven", "peynir", "paten", "televizyon", "terazi", "tekerlek"],
  },
  t: {
    bas: ["tilki", "top", "tavşan", "tabak", "tavuk", "tarak", "tencere", "terlik", "testere",
      "timsah", "tren", "tost", "tuğla", "traktör", "televizyon", "toka", "tırtıl", "terazi", "tekerlek", "takvim", "tüy", "taç"],
    son: ["at", "süt", "bulut", "armut", "sepet", "kilit", "kibrit", "ceket", "şort", "flüt", "jet", "yoğurt", "ahtapot", "bisiklet"],
    orta: ["çatal", "kutu", "etek", "fıstık", "yatak", "kartal", "kitap", "ateş", "nota", "otobüs",
      "patates", "motor", "öğretmen", "cetvel", "çikolata", "gazete", "helikopter", "koltuk", "mıknatıs", "olta", "patlıcan", "paten", "salatalık", "vantilatör"],
  },
  i: {
    bas: ["inek", "ip", "iğne", "incir", "inci", "iplik", "iki", "iguana"],
    son: ["kedi", "gemi", "kirpi", "keçi", "tilki", "hindi", "kivi", "huni", "terazi"],
    orta: ["fil", "diş", "zil", "biber", "civciv", "çiçek", "pil", "kilit", "kibrit", "kitap",
      "kiraz", "sincap", "timsah", "pizza", "bina", "pide", "polis", "vida", "jip", "çiğdem", "bisiklet", "çilek", "çekiç", "çikolata", "emzik", "helikopter", "hediye", "merdiven", "mikrofon", "midye", "peynir", "televizyon", "takvim", "vantilatör", "vinç", "zincir"],
  },
  l: {
    bas: ["leylek", "lamba", "lahana", "lokum", "leğen", "lama", "limon", "lahmacun", "lale"],
    son: ["fil", "bal", "gül", "kartal", "çatal", "zil", "nal", "ampul", "cetvel", "tırtıl"],
    orta: ["elma", "balık", "kelebek", "bulut", "kulak", "halı", "silgi", "bilezik", "kalem",
      "kale", "polis", "flüt", "japon balığı", "plaj", "tuğla", "bisiklet", "çilek", "çikolata", "dolap", "helikopter", "koltuk", "kalp", "musluk", "olta", "palyaço", "patlıcan", "pusula", "salatalık", "salyangoz", "televizyon", "tekerlek", "vantilatör", "yılan", "yelpaze"],
  },
  // 2. harf grubu (o, k, u, r, ı, m)
  o: {
    bas: ["otobüs", "ok", "odun", "oklava", "on", "ocak", "oje", "olta"],
    son: ["piyano", "radyo", "domino", "flamingo", "avokado", "judo", "palyaço"],
    orta: ["kova", "koyun", "top", "nohut", "lokum", "balon", "yorgan", "çorba", "dondurma", "nota", "motor", "tost", "yonca", "şort", "polis", "fok", "japon balığı", "soğan", "yoğurt", "boğa", "ahtapot", "çorap", "çikolata", "dolap", "helikopter", "koltuk", "mikrofon", "salyangoz", "televizyon", "toka"],
  },
  k: {
    bas: ["kedi", "kova", "koyun", "kale", "kalem", "kapı", "kartal", "kaşık", "kazan", "keçi",
      "kelebek", "kibrit", "kilit", "kiraz", "kirpi", "kitap", "kumbara", "kurbağa", "kuzu", "kuyu", "kaykay", "kafes", "kek", "kız", "kupa", "kivi", "kuğu", "karpuz", "kamera", "koltuk", "karınca", "kalp"],
    son: ["balık", "bebek", "çiçek", "erik", "etek", "fındık", "fıstık", "iplik", "yaprak", "bardak",
      "tavuk", "uçak", "ıspanak", "börek", "ocak", "sucuk", "fok", "bayrak", "çilek", "emzik", "musluk", "salatalık", "tekerlek", "yüzük"],
    orta: ["iki", "lokum", "ayakkabı", "şeker", "akvaryum", "makas", "bisiklet", "baykuş", "çekiç", "çikolata", "gökkuşağı", "helikopter", "mıknatıs", "mikrofon", "saksı", "traktör", "toka", "takvim"],
  },
  u: {
    bas: ["uçak", "un", "uçurtma", "ut", "uzaylı", "uydu"],
    son: ["kutu", "kanguru", "boru", "kuyu", "kuzu", "kuğu"],
    orta: ["bulut", "nohut", "armut", "lokum", "kulak", "tavuk", "kumbara", "kurbağa", "dondurma", "sucuk", "kupa", "yuva", "ruj", "judo", "yoğurt", "yağmur", "tuğla", "ampul", "baykuş", "gökkuşağı", "hamburger", "huni", "karpuz", "koltuk", "musluk", "pusula"],
  },
  r: {
    bas: ["robot", "radyo", "roket", "raket", "rende", "reçel", "ruj"],
    son: ["anahtar", "biber", "fener", "nehir", "nar", "şeker", "motor", "yağmur", "çadır", "helikopter", "hamburger", "peynir", "traktör", "vantilatör", "zincir"],
    orta: ["armut", "araba", "kartal", "kurbağa", "kiraz", "kirpi", "terlik", "erik", "kibrit", "tarak",
      "bardak", "çorba", "fırça", "ördek", "bere", "börek", "şort", "para", "jandarma", "garaj", "yoğurt", "öğretmen", "bayrak", "çorap", "fırın", "karpuz", "kamera", "karınca", "merdiven", "mikrofon", "pencere", "süpürge", "tırtıl", "terazi", "tekerlek", "zarf"],
  },
  ı: {
    bas: ["ıspanak", "ıslık", "ızgara", "ıstakoz"],
    son: ["kapı", "ayı", "halı", "ayakkabı", "arı", "fıçı", "japon balığı", "gökkuşağı", "saksı"],
    orta: ["balık", "fındık", "fıstık", "fırça", "kaşık", "altın", "kız", "ağız", "çadır", "fırın", "karınca", "mıknatıs", "patlıcan", "salatalık", "tırtıl", "yılan", "zımba"],
  },
  m: {
    bas: ["maymun", "masa", "muz", "mum", "mantar", "makas", "motor", "mıknatıs", "merdiven", "mikrofon", "musluk", "midye"],
    son: ["lokum", "kalem", "üzüm", "akvaryum", "çim", "çiğdem", "takvim"],
    orta: ["limon", "lamba", "kumbara", "timsah", "ekmek", "lahmacun", "dondurma", "kemik", "elma", "lama", "düğme", "jandarma", "yağmur", "öğretmen", "ampul", "emzik", "hamburger", "kamera", "zımba"],
  },
  // 3. harf grubu (ü, s, ö, y, d, z). ö ve d ile biten resimli kelime yok (bkz. konumSec)
  ü: {
    bas: ["üzüm", "ütü", "üç", "üçgen"],
    son: ["köprü", "örgü"],
    orta: ["gül", "süt", "küpe", "otobüs", "güneş", "gözlük", "dürbün", "düğme", "flüt", "düğün", "süpürge", "tüy", "yüzük"],
  },
  s: {
    bas: ["sincap", "süt", "sepet", "silgi", "saat", "sandalye", "simit", "sabun", "sinek", "salıncak", "sucuk", "soğan", "sağ", "saksı", "salatalık", "süpürge", "salyangoz"],
    son: ["otobüs", "patates", "nergis", "makas", "kaktüs", "ananas", "polis", "mıknatıs"],
    orta: ["aslan", "masa", "elbise", "timsah", "fıstık", "ıspanak", "tost", "bisiklet", "musluk", "pusula"],
  },
  ö: {
    bas: ["ördek", "örümcek", "ödül", "örgü", "önlük", "öğretmen"],
    son: [],
    orta: ["göz", "köpek", "dört", "böcek", "gözlük", "köprü", "börek", "çöp", "gökkuşağı", "traktör", "vantilatör"],
  },
  y: {
    bas: ["yunus", "yaprak", "yatak", "yengeç", "yorgan", "yumurta", "yonca", "yuva", "yağ", "yoğurt", "yağmur", "yılan", "yüzük", "yelpaze"],
    son: ["ay", "çay", "saray", "kaykay", "tüy"],
    orta: ["ayak", "ayı", "ayna", "ayakkabı", "koyun", "bilye", "şemsiye", "maymun", "bayrak", "baykuş", "hediye", "midye", "palyaço", "peynir", "salyangoz", "televizyon", "uydu"],
  },
  d: {
    bas: ["deve", "dondurma", "diş", "davul", "domates", "dinozor", "dürbün", "düğme", "düğün", "dolap"],
    son: [],
    orta: ["bardak", "fındık", "kedi", "ördek", "yıldız", "pide", "vida", "jandarma", "judo", "çiğdem", "çadır", "hediye", "merdiven", "midye", "uydu"],
  },
  z: {
    bas: ["zürafa", "zeytin", "zil", "zar", "zarf", "zımba", "zincir"],
    son: ["kiraz", "ceviz", "muz", "buz", "yıldız", "kız", "ağız", "karpuz", "salyangoz"],
    orta: ["üzüm", "bilezik", "ızgara", "uzaylı", "kuzu", "kazan", "emzik", "gazete", "televizyon", "terazi", "yüzük", "yelpaze"],
  },
  // 4. harf grubu (ç, b, g, c, ş). b, g ve c ile biten resimli kelime yok (bkz. konumSec)
  ç: {
    bas: ["çekirge", "çanta", "çatal", "çiçek", "çorba", "çay", "çim", "çeşme", "çöp", "çiğdem", "çilek", "çorap", "çekiç", "çadır", "çikolata"],
    son: ["ağaç", "havuç", "yengeç", "üç", "taç", "vinç"],
    orta: ["kepçe", "fırça", "keçi", "uçak", "uçurtma", "fıçı", "palyaço"],
  },
  b: {
    bas: ["balık", "balon", "bal", "bardak", "bebek", "biber", "bilye", "bulut", "buz", "böcek", "bere", "bina", "börek", "bagaj", "bağ", "boğa", "bayrak", "bisiklet", "baykuş"],
    son: [],
    orta: ["ayakkabı", "kumbara", "kibrit", "otobüs", "robot", "çorba", "elbise", "japon balığı", "hamburger", "zımba"],
  },
  g: {
    bas: ["güvercin", "gemi", "gül", "güneş", "gözlük", "göz", "gitar", "geyik", "gömlek", "garaj", "gökkuşağı", "gazete"],
    son: [],
    orta: ["silgi", "nergis", "iguana", "yorgan", "kanguru", "bagaj", "hamburger", "süpürge", "salyangoz"],
  },
  c: {
    bas: ["ceviz", "civciv", "ceket", "cüzdan", "ciklet", "cetvel"],
    son: [],
    orta: ["fincan", "lahmacun", "incir", "inci", "sincap", "örümcek", "ocak", "yonca", "sucuk", "karınca", "patlıcan", "pencere", "zincir"],
  },
  ş: {
    bas: ["şemsiye", "şeker", "şahin", "şişe", "şato", "şimşek", "şort"],
    son: ["ateş", "diş", "güneş", "baykuş"],
    orta: ["kaşık", "tavşan", "eşek", "çeşme", "gökkuşağı"],
  },
  // 5. harf grubu (p, h, v, ğ, f, j). ğ kelime başında gelmez; h ve f ile biten resimli kelime yok
  // (bkz. konumSec)
  p: {
    bas: ["penguen", "patates", "panda", "pil", "pizza", "para", "pide", "polis", "plaj", "palyaço", "patlıcan", "pencere", "peynir", "paten", "pusula"],
    son: ["kitap", "top", "ip", "çöp", "jip", "çorap", "dolap", "kalp"],
    orta: ["kirpi", "iplik", "kapı", "kepçe", "yaprak", "sepet", "kupa", "japon balığı", "ahtapot", "ampul", "helikopter", "karpuz", "süpürge", "yelpaze"],
  },
  h: {
    bas: ["horoz", "hindi", "halı", "havuç", "helikopter", "hamburger", "hediye", "huni"],
    son: [],
    orta: ["lahana", "lahmacun", "anahtar", "ahtapot"],
  },
  v: {
    bas: ["vapur", "vazo", "valiz", "vida", "vantilatör", "vinç"],
    son: ["ev"],
    orta: ["havuç", "tavşan", "tavuk", "kova", "deve", "eldiven", "ceviz", "civciv", "güvercin", "yuva", "kivi", "cetvel", "merdiven", "televizyon", "takvim"],
  },
  ğ: {
    bas: [],
    son: ["dağ", "ağ", "yağ", "bağ", "sağ"],
    orta: ["ağaç", "leğen", "iğne", "kurbağa", "düğme", "japon balığı", "soğan", "yoğurt", "yağmur", "ağız", "tuğla", "çiğdem", "boğa", "kuğu", "düğün", "öğretmen", "gökkuşağı"],
  },
  f: {
    bas: ["fil", "fare", "fener", "fincan", "fındık", "fıstık", "fırça", "fok", "fıçı", "flüt", "fırın"],
    son: ["zarf"],
    orta: ["zürafa", "telefon", "kafes", "mikrofon"],
  },
  j: {
    bas: ["jelibon", "jaguar", "jöle", "jet", "jandarma", "japon balığı", "jip", "judo"],
    son: ["ruj", "garaj", "bagaj", "plaj"],
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
  return "resim-" + kelime.replace(/[çğıöşü]/g, (h) => TR[h]).replace(/ /g, "-");
}

// Bütün resimli kelimeler (yanlış seçenekler buradan, harfi hiç içermeyenlerden seçilir)
const RESIMLI_KELIMELER = [...new Set(Object.values(KONUMLU_KELIMELER)
  .flatMap((k) => [...k.bas, ...k.son, ...k.orta]))];
