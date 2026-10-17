# Yapay zekâyla üretilen hece dizisini (ElevenLabs; "an. na. ok. ..." bir dosyada) sessizliklerden
# böler, her heceyi hece-<ad>.wav olarak yazar (öğretmenin kararı: heceler yapay sesle, cümleler
# öğretmenin sesiyle). Parça sayısı hece sayısını tutmazsa hiçbir şey yazmaz (yanlış eşleşme olmasın).
# Kullanım: python3 araclar/hece_bol.py <ses.mp3> <çıktı klasörü> hece1 hece2 ...
# Sonra: bash araclar/peri_efekti.sh <çıktı klasörü> sesler   (heceler az yankılı peri efekti alır)
import re, subprocess, sys, os

AYRI = {"ç": "cx", "ğ": "gx", "ı": "ix", "ö": "ox", "ş": "sx", "ü": "ux"}


def ad(hece):
    s = "".join(AYRI.get(h, h) for h in hece.lower())
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def bol(dosya, cikis, heceler, esik=-38, sure=0.28):
    cikti = subprocess.run(["ffmpeg", "-i", dosya, "-af", f"silencedetect=noise={esik}dB:d={sure}", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    bas = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", cikti)]
    son = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", cikti)]
    toplam = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", cikti).group(3)) + \
        60 * int(re.search(r"Duration: (\d+):(\d+)", cikti).group(2))
    # Konuşma parçaları: bir sessizliğin sonundan sonrakinin başına kadar
    sinirlar = [0.0] + son
    parcalar = []
    for i, b in enumerate(sinirlar):
        e = bas[i] if i < len(bas) else toplam
        if e - b > 0.12:
            parcalar.append((b, e))
    if len(parcalar) != len(heceler):
        return len(parcalar)
    os.makedirs(cikis, exist_ok=True)
    for (b, e), h in zip(parcalar, heceler):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", dosya, "-ss", f"{max(0, b - 0.06):.3f}", "-to", f"{e + 0.08:.3f}",
                        "-ar", "24000", "-ac", "1", os.path.join(cikis, f"hece-{ad(h)}.wav")], check=True)
    return 0


if __name__ == "__main__":
    sonuc = bol(sys.argv[1], sys.argv[2], sys.argv[3:])
    print("tamam" if sonuc == 0 else f"UYMADI: {sonuc} parça, {len(sys.argv) - 3} hece")
