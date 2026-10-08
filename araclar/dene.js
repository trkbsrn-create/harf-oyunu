// Mini oyun deneme aracı (Claude'un testleri için; oyunun parçası değil).
// Kullanım: node araclar/dene.js <oyun> [harf] [seviye] [bekleme_ms] ["kod"] [sonra_ms]
//   oyun: mini oyunun adı (kazma, hece-muzigi...), "menu" (Mini Games) ya da "ana" (karşılama)
//   kod: bekleme bittikten sonra sahnede çalışır; s = sahne (ör. "s.ilerleme"), sonucu yazılır
//   sonra_ms: koddan sonra ekran görüntüsüne kadar beklenecek süre (varsayılan 500)
// Kendi küçük sunucusunu açar, işi bitince kapatır. Çıktı: hatalar, söylenen sözler,
// araclar/cikti/<oyun>.png ekran görüntüsü.
// Kurulum (bir kez): npm install --prefix araclar --no-save playwright phaser@3.90.0
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const [oyun = "ana", harf = "a", seviye = "1", bekleme = "4000", kod, sonra = "500"] = process.argv.slice(2);
const KOK = path.join(__dirname, "..");
const PHASER = path.join(__dirname, "node_modules/phaser/dist/phaser.min.js");
const TURLER = { ".html": "text/html", ".js": "application/javascript", ".svg": "image/svg+xml",
  ".png": "image/png", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".json": "application/json" };

const sunucu = http.createServer((istek, cevap) => {
  let yol = decodeURIComponent(istek.url.split("?")[0]);
  if (yol.endsWith("/")) yol += "index.html";
  const dosya = path.join(KOK, yol);
  if (!dosya.startsWith(KOK) || !fs.existsSync(dosya)) { cevap.writeHead(404); cevap.end(); return; }
  cevap.writeHead(200, { "Content-Type": TURLER[path.extname(dosya)] || "application/octet-stream" });
  fs.createReadStream(dosya).pipe(cevap);
});

(async () => {
  await new Promise((r) => sunucu.listen(0, r));
  const adres = `http://localhost:${sunucu.address().port}/`;
  const tarayici = await chromium.launch(fs.existsSync("/opt/pw-browsers/chromium")
    ? { executablePath: "/opt/pw-browsers/chromium" } : {});
  const sayfa = await (await tarayici.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  const hatalar = [];
  sayfa.on("pageerror", (e) => hatalar.push(e.message));
  sayfa.on("console", (m) => { if (m.type() === "error") hatalar.push("konsol: " + m.text()); });
  if (fs.existsSync(PHASER)) {
    await sayfa.route("https://cdn.jsdelivr.net/**", (r) => r.fulfill({ path: PHASER, contentType: "application/javascript" }));
  }
  await sayfa.addInitScript(() => {
    // Sesli okuma: söylenenler kaydedilir, söz kısa sürede biter
    window.__sozler = [];
    if (window.speechSynthesis) {
      window.speechSynthesis.speak = (s) => { window.__sozler.push(s.text); setTimeout(() => s.onend && s.onend(), 200); };
    }
    Object.defineProperty(window, "Phaser", { configurable: true, set(v) {
      const Asil = v.Game;
      v.Game = function (ayar) { const g = new Asil(ayar); window.__oyun = g; return g; };
      Object.defineProperty(window, "Phaser", { value: v, writable: true });
    } });
  });
  await sayfa.goto(adres);
  await sayfa.waitForTimeout(2500);
  if (oyun !== "ana") {
    await sayfa.evaluate(([oyun, harf, seviye]) => {
      const g = window.__oyun;
      g.scene.getScenes(true).forEach((x) => g.scene.stop(x.scene.key));
      if (oyun === "menu") g.scene.start("MiniOyunlarSahnesi");
      else g.scene.start(oyun, { harf, seviye: Number(seviye), donus: "MiniOyunlarSahnesi" });
    }, [oyun, harf, seviye]);
  }
  await sayfa.waitForTimeout(Number(bekleme));
  if (kod) {
    const sonuc = await sayfa.evaluate(([oyun, kod]) => {
      const s = window.__oyun.scene.getScene(oyun === "menu" ? "MiniOyunlarSahnesi" : oyun === "ana" ? "KarsilamaSahnesi" : oyun);
      try { return JSON.stringify(eval(kod)); } catch (e) { return "kod hatası: " + e.message; }
    }, [oyun, kod]);
    console.log("kod sonucu:", sonuc);
    await sayfa.waitForTimeout(Number(sonra));
  }
  fs.mkdirSync(path.join(__dirname, "cikti"), { recursive: true });
  const resim = path.join(__dirname, "cikti", `${oyun}.png`);
  await sayfa.screenshot({ path: resim });
  console.log("söylenenler:", (await sayfa.evaluate(() => window.__sozler)).join(" | ") || "-");
  console.log("hatalar:", hatalar.length ? hatalar.join("\n") : "yok");
  console.log("ekran görüntüsü:", path.relative(KOK, resim));
  await tarayici.close();
  sunucu.close();
})().catch((e) => { console.error(e); sunucu.close(); process.exit(1); });
