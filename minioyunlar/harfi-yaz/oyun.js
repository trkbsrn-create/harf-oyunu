// Mini oyun: Harfi Yaz. Öğretmenin kararıyla Şekillerle Yazma ve Harfi Çiz birleşti:
// 1. düzey Şekillerle Yazma (şeker makinesiyle, sekiller.js), 2. ve 3. düzey Harfi Çiz (ciz.js).
//
// Phaser her oyun için tek bir sahne nesnesi kurar. Bu yüzden sahne her açılışta (init) düzeye
// göre yöntemlerini o oyunun sınıfından alır: nesnenin prototipi SekillerleYazmaSahnesi ya da
// HarfiCizSahnesi olur. init nesnenin kendi alanıdır, prototip değişse de her açılışta çalışır.

// Gösteren el her bölüm için bir kez (kol, tepsi, çizim): ortak elGoster sahne başına bir kez
// gösterdiği için önce sahnenin işareti silinir.
function harfiYazEli(sahne, bolum, goster) {
  const anahtar = `harfi-yaz:${bolum}`;
  if (MINI_OYUN_ELI_GOSTERILDI[anahtar]) return;
  MINI_OYUN_ELI_GOSTERILDI[anahtar] = true;
  delete MINI_OYUN_ELI_GOSTERILDI[sahne.sys.settings.key];
  goster();
}

class HarfiYazSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("harfi-yaz");
    this.init = (veri) => {
      const sinif = (veri.seviye || 1) <= 1 ? SekillerleYazmaSahnesi : HarfiCizSahnesi;
      Object.setPrototypeOf(this, sinif.prototype);
      MiniOyunSahnesi.prototype.init.call(this, veri);
    };
  }
}

miniOyunKaydet("harfi-yaz", HarfiYazSahnesi);
