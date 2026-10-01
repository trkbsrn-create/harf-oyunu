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
  UNLU_DOLUM_SURESI: 6000, // ünlü harf bu kadar milisaniye uzatılmış sesle tamamen dolar
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
      analiz.fftSize = 1024;
      baglam.createMediaStreamSource(akis).connect(analiz);
      this.olcer = { baglam, analiz, veri: new Float32Array(analiz.fftSize) };
      return true;
    } catch (e) {
      return false;
    }
  },

  // Şu an net bir ses var mı? Ortam gürültüsünün epey üstündeki ses "net" sayılır.
  sesVarMi() {
    const s = this.seviye();
    // Taban en sessiz ana iner; ortam gürültüsü artarsa yavaşça yükselir.
    this.taban = Math.min(s, this.taban * 1.002);
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

  // Duyulanlar arasında tam olarak bu kelime var mı? (ipucu kelimesi için)
  kelimeVarMi(metinler, kelime) {
    return metinler.some((m) => m.toLocaleLowerCase("tr-TR")
      .split(/[^a-zçğıöşü]+/u).includes(kelime));
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
