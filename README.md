# 🌤️ Hava Durumu

React + TypeScript + Vite ile yapılmış, API anahtarı gerektirmeyen bir hava durumu uygulaması. Veriler [Open-Meteo](https://open-meteo.com)'dan gelir.

## Özellikler

- Şehir arama (yazdıkça öneriler, Enter ile ilk sonucu seç)
- Anlık sıcaklık, hissedilen, nem ve rüzgar
- 7 günlük tahmin, haftalık min–max aralığını gösteren sıcaklık çubukları
- Yağış olasılığı
- Son seçilen şehri hatırlar (localStorage)
- Açık / koyu tema (sistem ayarına göre), mobil uyumlu

## Çalıştırma

```bash
npm install
npm run dev
```

Üretim derlemesi için `npm run build`.

## Proje yapısı

```
src/
  api.ts         Open-Meteo istekleri + hava kodu → açıklama/ikon
  SearchBox.tsx  Debounce'lu şehir arama kutusu
  App.tsx        Ana ekran
  index.css      Stiller
```
