#!/usr/bin/env python3
"""Oyunun sözlerini Azure'un yapay zekâ sesleriyle seslendirir (sesler/*.mp3 ve sesler/liste.js).

Öğretmenin seçimi: harf, hece, kelime ve kutlamalar Elif (heyecanlı); hikâye ve genel sözler Ava.
Söz listesi araclar/ses-listesi.js'den gelir. Yalnızca eksik dosyalar üretilir (--hepsi: hepsi).

Anahtar dosyaya yazılmaz, depoya konmaz; çalıştırırken ortam değişkeniyle verilir:
  AZURE_TTS_KEY=... AZURE_TTS_BOLGE=northeurope python3 araclar/seslendir.py
Sessizlik kesilir, ses yüksekliği eşitlenir (ffmpeg).
"""
import json
import os
import subprocess
import sys
import tempfile
import time
from xml.sax.saxutils import escape

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
KLASOR = os.path.join(KOK, "sesler")

SESLER = {
    "elif": ("tr-TR-Elif:MAI-Voice-2.1", "excited", False),
    "ava": ("en-US-AvaMultilingualNeural", None, True),
}


def ssml(metin, ses):
    ad, stil, cok_dilli = SESLER[ses]
    ic = escape(metin)
    if stil:
        ic = f"<mstts:express-as style='{stil}'>{ic}</mstts:express-as>"
    if cok_dilli:
        ic = f"<lang xml:lang='tr-TR'>{ic}</lang>"
    return ("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' "
            "xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='tr-TR'>"
            f"<voice name='{ad}'>{ic}</voice></speak>")


def uret(metin, ses, hedef, anahtar, bolge):
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as ham:
        ham_yol = ham.name
    for deneme in range(5):
        kod = subprocess.run([
            "curl", "-sS", "-o", ham_yol, "-w", "%{http_code}", "-X", "POST",
            f"https://{bolge}.tts.speech.microsoft.com/cognitiveservices/v1",
            "-H", f"Ocp-Apim-Subscription-Key: {anahtar}",
            "-H", "Content-Type: application/ssml+xml",
            "-H", "X-Microsoft-OutputFormat: audio-24khz-96kbitrate-mono-mp3",
            "-H", "User-Agent: harf-oyunu",
            "--data-binary", ssml(metin, ses),
        ], capture_output=True, text=True).stdout.strip()
        if kod == "200":
            break
        print(f"  {metin}: {kod}, bekleniyor...", flush=True)
        time.sleep(10 * (deneme + 1))
    else:
        raise SystemExit(f"Üretilemedi: {metin}")
    # Baştaki ve sondaki sessizliği kes, ses yüksekliğini eşitle
    suzgec = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
              "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
              "loudnorm=I=-16:TP=-1.5:LRA=11,adelay=40")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", ham_yol, "-af", suzgec,
                    "-ar", "24000", "-ac", "1", "-b:a", "48k", hedef], check=True)
    os.unlink(ham_yol)


def main():
    liste = json.loads(subprocess.run(["node", os.path.join(KOK, "araclar", "ses-listesi.js")],
                                      capture_output=True, text=True, check=True).stdout)
    os.makedirs(KLASOR, exist_ok=True)
    eksikler = [o for o in liste if "--hepsi" in sys.argv
                or not os.path.exists(os.path.join(KLASOR, o["dosya"] + ".mp3"))]
    if eksikler:
        anahtar = os.environ.get("AZURE_TTS_KEY")
        if not anahtar:
            raise SystemExit("AZURE_TTS_KEY verilmedi.")
        bolge = os.environ.get("AZURE_TTS_BOLGE", "northeurope")
        for i, o in enumerate(eksikler):
            print(f"{i + 1}/{len(eksikler)} {o['dosya']} ({o['ses']})", flush=True)
            uret(o["metin"], o["ses"], os.path.join(KLASOR, o["dosya"] + ".mp3"), anahtar, bolge)
            time.sleep(3.1)  # ücretsiz katman: dakikada en çok 20 istek
    # Oyunun okuduğu söz → dosya listesi
    eslesme = {o["metin"]: o["dosya"] for o in liste}
    with open(os.path.join(KLASOR, "liste.js"), "w", encoding="utf-8") as f:
        f.write("// Seslendirilmiş sözler: söz → sesler/<dosya>.mp3 (araclar/seslendir.py üretir).\n")
        f.write("// Burada olmayan sözleri tarayıcının Türkçe sesi okur.\n")
        f.write("const SES_DOSYALARI = " + json.dumps(eslesme, ensure_ascii=False, indent=1) + ";\n")
    print(f"Bitti: {len(liste)} söz.")


if __name__ == "__main__":
    main()
