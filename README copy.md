# LMS Instructor Mobile App (Frontend Prototype)

Aplikasi mobile berbasis React Native (Expo) untuk Instruktur LMS (Kelompok 3). Proyek ini berfokus pada fitur frontend/UI untuk Instruktur, termasuk Dashboard, Pembuatan Kuis, dan Melihat Hasil Kuis Mahasiswa.

## Fitur Utama

1.  **Dashboard Instruktur**:
    *   Melihat daftar kuis per kelas (Class A).
    *   Navigasi cepat ke detail skor atau pembuatan kuis baru.
2.  **Create Quiz (Builder)**:
    *   Formulir Judul, Deskripsi, dan Durasi.
    *   UI Builder Soal Pilihan Ganda (Multiple Choice).
3.  **Score List**:
    *   Daftar mahasiswa yang telah mengerjakan kuis.
    *   Progress bar visual untuk nilai skor.
4.  **Student Result Detail**:
    *   Detail jawaban mahasiswa.
    *   Indikator visual (Hijau/Merah) untuk jawaban Benar/Salah.

## Prasyarat

*   Node.js terinstal di komputer.
*   Aplikasi **Expo Go** terinstal di HP Android/iOS (tersedia di Play Store / App Store) untuk pengujian fisik, ATAU Emulator Android/iOS.

## Cara Menjalankan

1.  Masuk ke direktori `frontend`:
    ```bash
    cd frontend
    ```

2.  Instal dependensi (jika belum):
    ```bash
    npm install
    ```

3.  Jalankan server Expo:
    ```bash
    npx expo start
    ```

4.  **Scan QR Code**:
    *   Buka terminal, akan muncul QR Code.
    *   Scan menggunakan aplikasi **Expo Go** (Android) atau Kamera (iOS).
    *   Atau tekan `a` di terminal untuk membuka di Android Emulator, `w` untuk Web.

## Struktur Folder

*   `App.js`: Entry point dan konfigurasi navigasi utama.
*   `src/data/dummyData.js`: Data statis (dummy) untuk simulasi database.
*   `src/screens/`:
    *   `DashboardScreen.js`: Halaman utama.
    *   `CreateQuizScreen.js`: Halaman buat kuis.
    *   `ScoreListScreen.js`: Halaman daftar nilai siswa.
    *   `StudentResultScreen.js`: Halaman detail koreksi jawaban.

## Teknologi

*   React Native
*   Expo
*   React Navigation
