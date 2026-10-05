#!/bin/bash
# Öğretmenin kayıtlarına (kayit.html'den inen zip: sesler/<anahtar>.wav) efekt verip oyunun ses
# klasörüne mp3 olarak yazar. Kullanım: bash araclar/peri_efekti.sh <wav klasörü> <çıktı klasörü>
# Peri efekti: ses biraz incelir, hafif koro ve yankı. Heceler ve harf seslerinde yankı azdır (net
# duyulsun). Fırtına ve ada sözlerinde peri yok: rüzgâr / dalga sesi. Hepsi aynı ses yüksekliğine getirilir.
GIRIS="$1"; CIKIS="$2"; mkdir -p "$CIKIS"
PERI="asetrate=24000*1.18,aresample=24000,atempo=0.847,chorus=0.7:0.9:40|55:0.35|0.3:0.3|0.45:1.8|2.4,aecho=0.8:0.6:70|140:0.25|0.15"
KISA="asetrate=24000*1.18,aresample=24000,atempo=0.847,chorus=0.7:0.9:40|55:0.3|0.25:0.3|0.45:1.8|2.4,aecho=0.8:0.4:45:0.1"
ARA="$CIKIS/.ara.wav"
for f in "$GIRIS"/*.wav; do
  k=$(basename "$f" .wav)
  case $k in
    soz-buyuk-bir-firtina-cikti)
      ffmpeg -v error -y -i "$f" -f lavfi -t 3.7 -i "anoisesrc=color=brown:amplitude=0.5:sample_rate=24000" -f lavfi -t 1.6 -i "anoisesrc=color=brown:amplitude=1:sample_rate=24000" \
        -filter_complex "[0]aecho=0.8:0.6:120:0.25,adelay=450|450,volume=1.6[v];[1]lowpass=f=500,tremolo=f=0.4:d=0.7,volume=0.35,afade=t=in:d=0.5,afade=t=out:st=2.9:d=0.8[w];[2]lowpass=f=140,volume=2.2,afade=t=in:d=0.05,afade=t=out:st=0.2:d=1.4[g];[v][w][g]amix=inputs=3:normalize=0:duration=longest" -ac 1 "$ARA" ;;
    soz-bir-adaya-dustun)
      ffmpeg -v error -y -i "$f" -f lavfi -t 3.6 -i "anoisesrc=color=pink:amplitude=0.4:sample_rate=24000" \
        -filter_complex "[0]adelay=400|400,volume=1.5[v];[1]lowpass=f=900,highpass=f=120,tremolo=f=0.35:d=0.9,volume=0.5,afade=t=in:d=0.5,afade=t=out:st=2.8:d=0.8[d];[v][d]amix=inputs=2:normalize=0:duration=longest" -ac 1 "$ARA" ;;
    hece-*|harf-*) ffmpeg -v error -y -i "$f" -af "$KISA" -ac 1 "$ARA" ;;
    *) ffmpeg -v error -y -i "$f" -af "$PERI" -ac 1 "$ARA" ;;
  esac
  m=$(ffmpeg -i "$ARA" -af volumedetect -f null - 2>&1 | grep -oE "mean_volume: [-0-9.]+" | grep -oE "[-0-9.]+$")
  g=$(python3 -c "print(round(-18-($m),1))")
  ffmpeg -v error -y -i "$ARA" -af "volume=${g}dB,alimiter=limit=0.85:level=false" -ac 1 -ar 24000 -b:a 64k "$CIKIS/$k.mp3"
done
rm -f "$ARA"
