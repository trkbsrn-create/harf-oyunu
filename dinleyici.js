// Chrome'un konuşma tanıması (tr-TR). Ses kaydı tutulmaz, hiçbir şey saklanmaz.
// Not: Chrome, sesi yazıya çevirmek için Google'ın sunucularını kullanır.
//
// Chrome tek başına söylenen kısa ünlüleri ("a" gibi) çoğu zaman yazıya çevirmez.
// Bu yüzden ayrıca mikrofondaki sesin yüksekliği ölçülür (ses ölçer). Sadece o anki
// yüksekliğe bakılır; ses kaydedilmez, hiçbir yere gönderilmez.

const Dinleyici = {
  Tanima: window.SpeechRecognition || window.webkitSpeechRecognition,
  izinYok: false, // mikrofon izni verilmediyse true olur
  enIyi: "", // son dinlemede en iyi tahmin
  sonSesSuresi: 0, // son dinlemede net ses duyulan toplam süre (milisaniye)
  olcer: null, // ses ölçer (mikrofon izni alınınca kurulur)
  ENAZ_ESIK: 0.04, // bundan sessiz olan her şey "ses yok" sayılır
  DOLUM_SURESI: 3000, // harf bu kadar milisaniye uzatılmış sesle tamamen dolar
  ILK_ONAY_SURESI: 450, // "a" denirken bu kadar milisaniye net ses ilk onay için yeterli
  taban: Infinity, // ortamın en sessiz anı (sınıf gürültüsü)

  // Ses ölçeri bir kez kurar. Mikrofon izni yoksa ya da izin sorusu 8 saniyede
  // cevaplanmazsa sessizce vazgeçer (oyun takılmasın).
  async olcerHazirla() {
    if (this.olcer) return true;
    try {
      const akis = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        }),
        new Promise((_, vazgec) => setTimeout(() => vazgec(new Error("süre doldu")), 8000)),
      ]);
      const Baglam = window.AudioContext || window.webkitAudioContext;
      const baglam = new Baglam();
      const analiz = baglam.createAnalyser();
      analiz.fftSize = 2048;
      analiz.smoothingTimeConstant = 0.3;
      baglam.createMediaStreamSource(akis).connect(analiz);
      this.olcer = {
        baglam, analiz,
        veri: new Float32Array(analiz.fftSize),
        frekans: new Float32Array(analiz.frequencyBinCount),
      };
      return true;
    } catch (e) {
      return false;
    }
  },

  // ---- Sesin tınısı (ünlüyü tanımak için) ----
  // Chrome tek ünlüleri yazıya çeviremediği için ünlüyü sesin tınısından tanırız.
  // Her ünlünün iki belirgin "tını tepesi" vardır (F1 ve F2):
  //   F1 ağzın ne kadar açık olduğunu gösterir ("a"da yüksek, "i"/"u"da düşük),
  //   F2 sesin ne kadar parlak olduğunu gösterir ("e"/"i"de çok yüksek, "o"/"u"da düşük).
  // Kural tahminidir; gerçek seslerle mikrofon.html sayfasından ayarlanır.
  // ŞİMDİLİK OYUNDA KULLANILMIYOR: gerçek seste "a"yı da reddetti (kullanıcı denemesi).
  // Yalnızca mikrofon.html'de ölçüm için gösteriliyor.
  // Çocuk sesi incedir (yüksek "f0"); ince seste tını tepeleri de yukarı kayar, bu
  // yüzden sınır sesin inceliğine göre seçilir.
  UNLU_KURALLARI: {
    a: (f1, f2, f0) => f1 >= (f0 >= 240 ? 900 : 720) && f2 >= 1000 && f2 <= 2300,
  },

  // Şu anki sesi inceler: { ses: net ses var mı, sesli: konuşma sesi mi (alkış ya da
  // hışırtı değil), f1, f2: tını tepeleri (Hz) }.
  sesiIncele() {
    const ses = this.sesVarMi();
    if (!ses) return { ses: false, sesli: false, f0: 0, f1: 0, f2: 0 };
    const o = this.olcer;
    const f0 = this.sesinPerdesi(o.veri, o.baglam.sampleRate);
    if (!f0) return { ses: true, sesli: false, f0: 0, f1: 0, f2: 0 };
    const [f1, f2] = this.tiniTepeleri();
    return { ses: true, sesli: true, f0, f1, f2 };
  },

  // Bu ses, verilen ünlüye benziyor mu? Kuralı olmayan harflerde her sesli ses uyar.
  unluyeBenziyor(inceleme, harf) {
    if (!inceleme.sesli) return false;
    const kural = this.UNLU_KURALLARI[harf];
    return kural ? kural(inceleme.f1, inceleme.f2, inceleme.f0) : true;
  },

  // Konuşma sesi düzenli titreşir (ses telleri); alkış ve hışırtı düzensizdir.
  // Sesin kendisiyle 70–500 Hz aralığında ne kadar örtüştüğüne bakılır. Konuşma
  // sesiyse sesin perdesini (f0, Hz) verir, değilse 0.
  sesinPerdesi(veri, ornekHizi) {
    const enKisa = Math.floor(ornekHizi / 500);
    const enUzun = Math.floor(ornekHizi / 70);
    const n = veri.length - enUzun;
    let enerji = 0;
    for (let i = 0; i < n; i++) enerji += veri[i] * veri[i];
    if (enerji === 0) return 0;
    let enIyi = 0;
    let enIyiGecikme = 0;
    for (let gecikme = enKisa; gecikme <= enUzun; gecikme += 2) {
      let toplam = 0;
      let enerji2 = 0;
      for (let i = 0; i < n; i += 2) {
        toplam += veri[i] * veri[i + gecikme];
        enerji2 += veri[i + gecikme] * veri[i + gecikme];
      }
      const benzerlik = toplam / Math.sqrt((enerji / 2) * enerji2 + 1e-12);
      // Küçük gecikme (ince ses) %5 kadar kayırılır; yoksa perdenin katlarına kayabilir
      const puan = benzerlik * (1 - 0.05 * (gecikme - enKisa) / (enUzun - enKisa));
      if (puan > enIyi) { enIyi = puan; enIyiGecikme = gecikme; }
    }
    return enIyi > 0.5 ? Math.round(ornekHizi / enIyiGecikme) : 0;
  },

  // Sesin iki tını tepesini (F1, F2) bulur. Doğrusal öngörü (LPC) yöntemi: ses
  // ~10 kHz'e indirilir, ağız boşluğunun "şekli" kestirilir ve o şeklin tepeleri
  // aranır. İnce çocuk seslerinde basit frekans ölçümünden daha az şaşırır.
  tiniTepeleri() {
    const o = this.olcer;
    const adim = Math.max(1, Math.round(o.baglam.sampleRate / 10000));
    const hiz = o.baglam.sampleRate / adim;
    // Örnekleri seyrelt (komşuların ortalamasıyla), tizleri biraz güçlendir, pencerele
    const n = Math.floor(o.veri.length / adim);
    const x = new Float32Array(n);
    let onceki = 0;
    for (let i = 0; i < n; i++) {
      let t = 0;
      for (let j = 0; j < adim; j++) t += o.veri[i * adim + j];
      const v = t / adim;
      x[i] = (v - 0.95 * onceki) * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1)));
      onceki = v;
    }
    // Özilinti ve Levinson-Durbin ile LPC katsayıları
    const derece = 10;
    const r = new Float64Array(derece + 1);
    for (let k = 0; k <= derece; k++) {
      for (let i = k; i < n; i++) r[k] += x[i] * x[i - k];
    }
    if (r[0] <= 0) return [0, 0];
    r[0] *= 1.0001;
    let a = new Float64Array(derece + 1);
    a[0] = 1;
    let hata = r[0];
    for (let i = 1; i <= derece; i++) {
      let t = r[i];
      for (let j = 1; j < i; j++) t += a[j] * r[i - j];
      const k = -t / hata;
      const yeni = a.slice();
      for (let j = 1; j < i; j++) yeni[j] = a[j] + k * a[i - j];
      yeni[i] = k;
      a = yeni;
      hata *= 1 - k * k;
      if (hata <= 0) break;
    }
    // Zarfı 0–3800 Hz arasında 25 Hz adımlarla hesapla, tepeleri bul
    const tepeler = [];
    let once2 = 0;
    let once1 = 0;
    for (let f = 0; f <= 3800; f += 25) {
      const w = (2 * Math.PI * f) / hiz;
      let re = 0;
      let im = 0;
      for (let j = 0; j <= derece; j++) {
        re += a[j] * Math.cos(w * j);
        im -= a[j] * Math.sin(w * j);
      }
      const deger = 1 / (re * re + im * im);
      if (f >= 50 && once1 > once2 && once1 > deger && f - 25 >= 200) tepeler.push(f - 25);
      once2 = once1;
      once1 = deger;
    }
    const f1 = tepeler[0] || 0;
    const f2 = tepeler.find((f) => f > f1 + 250) || 0;
    return [f1, f2];
  },

  // Şu an net bir ses var mı? Ortam gürültüsünün epey üstündeki ses "net" sayılır.
  sesVarMi() {
    const s = this.seviye();
    // Taban en sessiz ana hemen iner; ortam gürültüsü artarsa çok yavaş yükselir
    // (uzun ve kesintisiz bir ses, kısa sürede "gürültü" sanılmasın diye).
    this.taban = Math.min(s, this.taban * 1.0005);
    return s > Math.max(this.ENAZ_ESIK, this.taban * 3);
  },

  // Şu anki ses yüksekliği (0 = sessiz). Ölçer yoksa 0.
  seviye() {
    const o = this.olcer;
    if (!o) return 0;
    if (o.baglam.state === "suspended") o.baglam.resume();
    o.analiz.getFloatTimeDomainData(o.veri);
    let toplam = 0;
    for (const v of o.veri) toplam += v * v;
    return Math.sqrt(toplam / o.veri.length);
  },

  get destekleniyor() {
    return Boolean(this.Tanima) && !this.izinYok;
  },

  // Bir kez dinler; duyduğu metinleri (tüm tahminleriyle) bir dizi olarak verir.
  // Tanıma bazen hiç sonuç döndürmez: en geç `sure` milisaniye sonra mutlaka biter.
  // sesleBitir: verilirse, bu kadar milisaniye net ses duyulunca dinleme hemen biter.
  dinle(sure = 6000, sesleBitir = 0) {
    return new Promise((bitir) => {
      this.sonSesSuresi = 0;
      if (!this.destekleniyor) {
        bitir([]);
        return;
      }
      const metinler = [];
      this.enIyi = "";
      let bitti = false;

      // Ses ölçümü. İlk 300 ms ölçülmez (oyunun "şimdi söyle" çanı duyulmasın diye).
      const olcumBasi = Date.now() + 300;
      const olcum = setInterval(() => {
        if (Date.now() < olcumBasi) return;
        if (this.sesVarMi()) {
          this.sonSesSuresi += 50;
          if (sesleBitir && this.sonSesSuresi >= sesleBitir) kapat();
        }
      }, 50);
      const tanima = new this.Tanima();
      tanima.lang = "tr-TR";
      tanima.interimResults = true;
      tanima.maxAlternatives = 5;

      const kapat = () => {
        if (bitti) return;
        bitti = true;
        clearTimeout(zamanAsimi);
        clearInterval(olcum);
        try { tanima.abort(); } catch (e) { /* zaten kapalı */ }
        bitir(metinler);
      };
      const zamanAsimi = setTimeout(kapat, sure);

      tanima.onresult = (olay) => {
        for (let i = olay.resultIndex; i < olay.results.length; i++) {
          for (const tahmin of olay.results[i]) metinler.push(tahmin.transcript);
        }
        // Chrome'un en iyi tahmini: son sonucun ilk seçeneği
        this.enIyi = olay.results[olay.results.length - 1][0].transcript;
        if (this.onDuydu) this.onDuydu(this.enIyi);
      };
      tanima.onerror = (olay) => {
        if (olay.error === "not-allowed" || olay.error === "service-not-allowed") {
          this.izinYok = true;
        }
        kapat();
      };
      // Tanıma hiçbir şey yazmadan biterse ve ölçer varsa, ölçüm sürene kadar beklenir.
      tanima.onend = () => {
        if (metinler.length > 0 || !sesleBitir || !this.olcer) kapat();
      };
      try {
        tanima.start();
      } catch (e) {
        kapat();
      }
    });
  },

  // Duyulanlar arasında bu kelimelerden biri tam olarak var mı? (ipucu kelimesi, hece)
  kelimeVarMi(metinler, kelimeler) {
    const aranan = [].concat(kelimeler);
    return metinler.some((m) => m.toLocaleLowerCase("tr-TR")
      .split(/[^a-zçğıöşü]+/u).some((k) => aranan.includes(k)));
  },

  // Duyulanlar arasında harfin kendisi, o harfle başlayan bir kelime ya da
  // kabul edilen kelime (ipucu kelimesi) var mı?
  // (Ünlüler için. Ünsüzlerde tek başına ses kabul edilmeyecek; o harfe gelince değişecek.)
  dogruMu(metinler, harf, kelime) {
    // Chrome "a" sesini bazen "ha" diye yazar
    const benzerleri = { a: ["ha", "haa", "hah"] };
    for (const metin of metinler) {
      const kelimeler = metin.toLocaleLowerCase("tr-TR").split(/[^a-zçğıöşü]+/u);
      for (const k of kelimeler) {
        if (!k) continue;
        if (k === harf || k.startsWith(harf) || k === kelime) return true;
        if ((benzerleri[harf] || []).includes(k)) return true;
      }
    }
    return false;
  },
};
