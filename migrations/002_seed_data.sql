-- ==============================================================================
-- ISMS: Seed Data for SMKP Minerba Kepdirjen 185 and ISO Standards
-- ==============================================================================

-- 1. SEED DEPARTMENTS & SITES
INSERT INTO departments (id, code, name, head_name) VALUES
('d1111111-1111-1111-1111-111111111111', 'SHE', 'Safety, Health & Environment', 'Ir. Hendra Wijaya, IPM'),
('d2222222-2222-2222-2222-222222222222', 'MINE', 'Mining Operation & Engineering', 'Bambang Kusuma, S.T.'),
('d3333333-3333-3333-3333-333333333333', 'PLANT', 'Coal Processing & Plant', 'Dedi Gunawan, S.T.'),
('d4444444-4444-4444-4444-444444444444', 'MAINT', 'Plant & Heavy Equipment Maintenance', 'Rudi Hartono, M.T.'),
('d5555555-5555-5555-5555-555555555555', 'LOG', 'Supply Chain, Warehouse & Logistics', 'Ratna Sari, S.E.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO sites (id, code, name, location) VALUES
('s1111111-1111-1111-1111-111111111111', 'SITE-KALTIM', 'Pit Sangatta Block North', 'Kutai Timur, Kalimantan Timur'),
('s2222222-2222-2222-2222-222222222222', 'SITE-KALSEL', 'Pit Batulicin Coal Mining', 'Tanah Bumbu, Kalimantan Selatan'),
('s3333333-3333-3333-3333-333333333333', 'HO-JKT', 'Head Office Jakarta', 'Kuningan, Jakarta Selatan')
ON CONFLICT (code) DO NOTHING;

-- 2. SEED SMKP MINERBA (7 ELEMEN SESUAI KEPDIRJEN 185/2019)
INSERT INTO smkp_elements (id, number_roman, title, weight_percentage, description) VALUES
(1, 'I', 'Kebijakan', 5.00, 'Penyusunan, penetapan, komunikasi, dan peninjauan kebijakan keselamatan pertambangan'),
(2, 'II', 'Perencanaan', 15.00, 'Penelaahan awal, IBPR (Manajemen Risiko), kepatuhan regulasi, sasaran & program kerja'),
(3, 'III', 'Organisasi dan Personel', 15.00, 'Struktur KTT, PJO, Pengawas Operasional (POP/POM/POU), Komite KP, kompetensi & pelatihan'),
(4, 'IV', 'Implementasi', 35.00, 'Pelaksanaan operasional, SPI, JSA, izin kerja khusus, K3, KO, pengelolaan lingkungan, ERP'),
(5, 'V', 'Pemantauan, Evaluasi, dan Tindak Lanjut', 15.00, 'Inspeksi terencana, audit internal SMKP, investigasi insiden, kalibrasi, evaluasi kepatuhan hukum'),
(6, 'VI', 'Dokumentasi', 5.00, 'Pengendalian manual, SOP, IK, standar parameter, formulir, rekaman K3, dan retensi arsip'),
(7, 'VII', 'Tinjauan Manajemen dan Peningkatan Kinerja', 10.00, 'Rapat tinjauan manajemen (RTM) berkala, evaluasi efektivitas SMKP, dan continual improvement')
ON CONFLICT (id) DO NOTHING;

-- SUBELEMENTS & CRITERIA EXAMPLES
INSERT INTO smkp_subelements (id, element_id, code, title, description) VALUES
('sub-1-1', 1, 'I.1', 'Penyusunan Kebijakan', 'Proses perumusan kebijakan keselamatan pertambangan secara tertulis'),
('sub-1-2', 1, 'I.2', 'Isi Kebijakan', 'Komitmen manajemen terhadap visi, kepatuhan, pencegahan kecelakaan & penyakit'),
('sub-2-1', 2, 'II.1', 'Penelaahan Awal', 'Evaluasi status implementasi sistem sebelumnya'),
('sub-2-2', 2, 'II.2', 'Manajemen Risiko (IBPR/HIRADC)', 'Identifikasi bahaya, penilaian dan pengendalian risiko tambang'),
('sub-3-1', 3, 'III.1', 'Penetapan KTT / PJO', 'Penetapan Kepala Teknik Tambang & Penanggung Jawab Operasional berlisensi'),
('sub-4-1', 4, 'IV.1', 'Pelaksanaan Pengelolaan Operasional', 'Prosedur kerja aman (SOP), Instruksi Kerja, dan JSA operasional tambang'),
('sub-4-2', 4, 'IV.2', 'Pengelolaan Keadaan Darurat (ERP)', 'Tim Tanggap Darurat (ERT), peralatan rescue, dan simulasi penanggulangan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO smkp_criteria (id, subelement_id, code, requirement_text, regulatory_reference, expected_evidence) VALUES
('crit-1-1-1', 'sub-1-1', '1.1.1', 'Perusahaan memiliki Kebijakan Keselamatan Pertambangan tertulis, ditandatangani oleh pimpinan tertinggi (Direktur/KTT), bertanggal dan disahkan.', 'Kepdirjen Minerba 185/2019 Lampiran I Bagian I.1', 'Dokumen Kebijakan KP bertanda tangan basah/digital Direksi, terpasang di seluruh area kerja'),
('crit-1-2-1', 'sub-1-2', '1.2.1', 'Kebijakan mencakup komitmen keselamatan operasi, pencegahan kecelakaan, penyakit akibat kerja, kerusakan lingkungan, dan kepatuhan perundangan.', 'Kepdirjen Minerba 185/2019 Lampiran I Bagian I.2', 'Klausul komitmen tertulis di dokumen Kebijakan'),
('crit-2-2-1', 'sub-2-2', '2.2.1', 'Perusahaan menetapkan metodologi dan melaksanakan proses Identifikasi Bahaya, Penilaian Risiko dan Pengendalian Risiko (IBPR/HIRADC) untuk seluruh aktivitas.', 'Kepdirjen Minerba 185/2019 Lampiran I Bagian II.2', 'Prosedur IBPR, Formulir Risk Assessment komprehensif, daftar risiko signifikan dan matriks mitigasi'),
('crit-3-1-1', 'sub-3-1', '3.1.1', 'Perusahaan menunjuk KTT / PJO yang telah disahkan oleh KaIT (Kepala Inspektur Tambang) ESDM.', 'Permen ESDM 26/2018 & Kepdirjen 185/2019 Lampiran I Bagian III.1', 'Surat Pengesahan KTT dari Dirjen Minerba / KaIT dan sertifikat kompetensi POM/POU'),
('crit-4-1-1', 'sub-4-1', '4.1.1', 'Setiap tahapan pekerjaan berisiko tinggi memiliki Standar Operasional Prosedur (SOP), JSA, dan izin kerja khusus (Permit to Work).', 'Kepdirjen Minerba 185/2019 Lampiran I Bagian IV.1', 'Daftar induk SOP operasional, rekaman JSA di lapangan, dokumen Surat Izin Kerja Aman (SIKA)')
ON CONFLICT (id) DO NOTHING;
