// Chrome'un konuşma tanıması (tr-TR). Ses kaydı tutulmaz, hiçbir şey saklanmaz.
// Not: Chrome, sesi yazıya çevirmek için Google'ın sunucularını kullanır.

const Dinleyici = {
  Tanima: window.SpeechRecognition || window.webkitSpeechRecognition,
  izinYok: false, // mikrofon izni verilmediyse true olur
  enIyi: "", // son dinlemede en iyi tahmin

  get destekleniyor() {
    return Boolean(this.Tanima) && !this.izinYok;
  },

  // Bir kez dinler; duyduğu metinleri (tüm tahminleriyle) bir dizi olarak verir.
  // Tanıma bazen hiç sonuç döndürmez: en geç `sure` milisaniye sonra mutlaka biter.
  dinle(sure = 6000) {
    return new Promise((bitir) => {
      if (!this.destekleniyor) {
        bitir([]);
        return;
      }
      const metinler = [];
      this.enIyi = "";
      let bitti = false;
      const tanima = new this.Tanima();
      tanima.lang = "tr-TR";
      tanima.interimResults = true;
      tanima.maxAlternatives = 5;

      const kapat = () => {
        if (bitti) return;
        bitti = true;
        clearTimeout(zamanAsimi);
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
      tanima.onend = kapat;
      try {
        tanima.start();
      } catch (e) {
        kapat();
      }
    });
  },

  // Duyulanlar arasında harfin kendisi, o harfle başlayan bir kelime ya da
  // kabul edilen kelime (ipucu kelimesi) var mı?
  // (Ünlüler için. Ünsüzlerde tek başına ses kabul edilmeyecek; o harfe gelince değişecek.)
  dogruMu(metinler, harf, kelime) {
    for (const metin of metinler) {
      const kelimeler = metin.toLocaleLowerCase("tr-TR").split(/[^a-zçğıöşü]+/u);
      for (const k of kelimeler) {
        if (!k) continue;
        if (k === harf || k.startsWith(harf) || k === kelime) return true;
      }
    }
    return false;
  },
};
