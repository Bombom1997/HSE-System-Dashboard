# Integrated SHE Management System (ISMS)
## SOP & Audit Management (SMKP Minerba & ISO 9001, 14001, 45001 Terintegrasi)

ISMS adalah platform enterprise manajemen keselamatan pertambangan, kesehatan kerja, lingkungan, dan mutu (SHE & Q) yang dirancang sesuai regulasi **Kepdirjen Minerba No. 185.K/37.04/DJB/2019** serta standar internasional **ISO 9001:2015**, **ISO 14001:2015**, dan **ISO 45001:2018**.

---

### Fitur Utama

1. **Role-Based Access Control (RBAC)**:
   - **ADMIN**: Akses penuh tata kelola dokumen, master SMKP/ISO, jadwal audit, persetujuan dan penutupan temuan (CAR).
   - **USER**: Pemilik dokumen (SOP/IK/JSA), penanggung jawab tindakan perbaikan (PIC), pengisi checklist audit, pengunggah bukti.
   - **VIEWER**: Akses baca dokumen resmi berlaku, ringkasan dashboard, dan status temuan.

2. **Database Dokumen Terpadu (14+ Kategori)**:
   - Standar Operasional Prosedur (SOP), Standar Parameter, Instruksi Kerja (IK), JSA/JHA, Formulir, Rekaman, Kebijakan, Pedoman, Regulasi.
   - Version Control (Rev.00, Rev.01, dst), perbandingan catatan perubahan, riwayat approval multi-tier.
   - Workflow Siklus Hidup: `Draft` ➔ `Submitted` ➔ `Under Review` ➔ `Approved` ➔ `Effective` ➔ `Periodic Review` ➔ `Obsolete/Archived`.

3. **Pemetaan Kebutuhan Multi-Standar (Compliance Matrix)**:
   - Hubungkan setiap dokumen SOP dengan Elemen SMKP Minerba, Klausul ISO 9001/14001/45001, dan regulasi pemerintah.
   - Indikator kesenjangan (*gap analysis*): Terpenuhi, Sebagian, Belum Tersedia.

4. **Master SMKP Minerba & ISO Terverifikasi**:
   - 7 Elemen SMKP Minerba (Kebijakan, Perencanaan, Organisasi, Implementasi, Evaluasi, Dokumentasi, Tinjauan Manajemen).
   - Klausul 4 s/d 10 ISO 9001, 14001, dan 45001 dengan referensi klausul dan bukti objektif yang dipersyaratkan.

5. **Modul Audit Terintegrasi**:
   - Program dan penjadwalan audit tim (Lead Auditor, Team, Auditee).
   - Checklist dinamis dengan status: *Compliant*, *Noncompliant*, *Partial Compliance*, *Not Applicable*, *Not Yet Verified*.
   - Perhitungan capaian kepatuhan berbasis kriteria aktif.
   - Pengelolaan Temuan (*Findings*): Major Nonconformity, Minor Nonconformity, Observation, Opportunity for Improvement (OFI).
   - Corrective Action (CAPA): 5-Why/Fishbone RCA, koreksi langsung, tindakan korektif, unggah bukti perbaikan, verifikasi efektivitas.

6. **Ekspor & Integrasi**:
   - Ekspor laporan berformat Excel (`.xlsx`) dan ringkasan audit profesional siap cetak/PDF.
   - Impor master data dokumen dan checklist via Excel dengan validasi format.

---

### Struktur Database & Migrasi SQL

File DDL dan data awal tersedia di folder:
- `/migrations/001_initial_schema.sql` (Skema tabel, relasi, index, dan Row Level Security)
### Konfigurasi Supabase Backend Database

Aplikasi telah terhubung ke proyek Supabase terkelola:
- **Project Name**: HSE System Dashboard
- **Project ID**: `bxohfhunsnbmktyvttuh`
- **URL**: `https://bxohfhunsnbmktyvttuh.supabase.co`

#### Langkah Migrasi SQL di Supabase:
1. Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/bxohfhunsnbmktyvttuh/sql).
2. Salin dan jalankan script SQL dari file `/migrations/001_initial_schema.sql` atau melalui tombol **"Salin Script SQL Migration"** di modal Supabase dalam aplikasi.
3. Klik tombol **"Upload / Sinkron Data Lokal ke Supabase"** di header untuk menyinkronkan seluruh SOP, master, dan temuan audit.

---

### Menjalankan Aplikasi Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

### Konfigurasi Vercel Deployment

1. Sambungkan repositori GitHub ke Vercel Dashboard.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variables di menu Vercel Settings (lihat `.env.example`).
5. File `vercel.json` telah dikonfigurasi untuk menangani SPA rewrites sehingga seluruh rute URL tetap aktif setelah refresh halaman.
