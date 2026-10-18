import { 
  Department, 
  MiningSite, 
  UserProfile, 
  SMKPElement, 
  ISOStandard, 
  DocumentItem, 
  AuditItem, 
  AuditFinding, 
  AppNotification,
  AuditLogItem 
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', code: 'SHE', name: 'Safety, Health & Environment (SHE)', headName: 'Ir. Hendra Wijaya, IPM' },
  { id: 'dept-2', code: 'MINE', name: 'Mining Operations & Engineering', headName: 'Bambang Kusuma, S.T.' },
  { id: 'dept-3', code: 'PLANT', name: 'Coal Processing Plant & Port', headName: 'Dedi Gunawan, S.T.' },
  { id: 'dept-4', code: 'MAINT', name: 'Heavy Equipment Maintenance', headName: 'Rudi Hartono, M.T.' },
  { id: 'dept-5', code: 'LOG', name: 'Supply Chain, Warehouse & Logistics', headName: 'Ratna Sari, S.E.' },
  { id: 'dept-6', code: 'HRGA', name: 'Human Resources & General Affairs', headName: 'Dewi Anggraeni, S.Psi.' },
];

export const INITIAL_SITES: MiningSite[] = [
  { id: 'site-1', code: 'SITE-SANGATTA', name: 'Pit Sangatta Block North', location: 'Kutai Timur, Kalimantan Timur' },
  { id: 'site-2', code: 'SITE-BATULICIN', name: 'Pit Batulicin Coal Mining', location: 'Tanah Bumbu, Kalimantan Selatan' },
  { id: 'site-3', code: 'HO-JAKARTA', name: 'Head Office Jakarta', location: 'Menara Palma Kuningan, Jakarta Selatan' },
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'admin.she@minerba-isms.com',
    password: 'admin123',
    fullName: 'Ir. Hendra Wijaya, IPM (Lead SHE)',
    role: 'ADMIN',
    departmentId: 'dept-1',
    departmentName: 'Safety, Health & Environment (SHE)',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    position: 'SHE Corporate Manager & Certified Lead Auditor SMKP',
    phone: '+62 811-2345-6789',
    isActive: true,
    lastLogin: '2026-10-17 07:15',
  },
  {
    id: 'user-op',
    email: 'bambang.ops@minerba-isms.com',
    password: 'user123',
    fullName: 'Bambang Kusuma, S.T. (Mine Supt)',
    role: 'USER',
    departmentId: 'dept-2',
    departmentName: 'Mining Operations & Engineering',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    position: 'Mining Operations Superintendent (POM Certified)',
    phone: '+62 812-9876-5432',
    isActive: true,
    lastLogin: '2026-10-16 14:30',
  },
  {
    id: 'user-viewer',
    email: 'management.view@minerba-isms.com',
    password: 'viewer123',
    fullName: 'Siti Rahmawati, M.M. (Compliance Viewer)',
    role: 'VIEWER',
    departmentId: 'dept-6',
    departmentName: 'Human Resources & General Affairs',
    siteId: 'site-3',
    siteName: 'Head Office Jakarta',
    position: 'Internal Risk & Compliance Auditor (Read-Only)',
    phone: '+62 813-5555-1234',
    isActive: true,
    lastLogin: '2026-10-15 09:10',
  }
];

// 7 ELEMEN SMKP MINERBA (KEPDIRJEN 185.K/37.04/DJB/2019)
export const INITIAL_SMKP_MASTER: SMKPElement[] = [
  {
    id: 1,
    romanNumber: 'I',
    title: 'Kebijakan',
    weightPercentage: 5.0,
    description: 'Penyusunan, isi, penetapan, komunikasi, dan peninjauan kebijakan keselamatan pertambangan',
    subElements: [
      {
        id: 'smkp-sub-1-1',
        elementId: 1,
        code: 'I.1',
        title: 'Penyusunan Kebijakan',
        criteria: [
          {
            id: 'smkp-crit-1-1-1',
            subElementId: 'smkp-sub-1-1',
            code: '1.1.1',
            requirementText: 'Terdapat Kebijakan Keselamatan Pertambangan tertulis, ditandatangani oleh pimpinan tertinggi perusahaan atau KTT, bertanggal dan disahkan.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian I.1',
            expectedEvidence: 'Dokumen Kebijakan KP bertandatangan Direktur/KTT, papan pengumuman kebijakan, bukti sosialisasi',
            verificationGuidance: 'Verifikasi tanda tangan basah/digital KTT, periksa tanggal pengesahan dan masa berlaku peninjauan berkala'
          },
          {
            id: 'smkp-crit-1-1-2',
            subElementId: 'smkp-sub-1-1',
            code: '1.1.2',
            requirementText: 'Penyusunan Kebijakan KP melibatkan partisipasi dan konsultasi dengan perwakilan pekerja atau Komite KP.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian I.1',
            expectedEvidence: 'Notulensi rapat perumusan kebijakan bersama komite K3/pekerja, daftar hadir perwakilan pekerja',
            verificationGuidance: 'Wawancara perwakilan komite keselamatan tambang tentang keterlibatannya dalam masukan klausul kebijakan'
          }
        ]
      },
      {
        id: 'smkp-sub-1-2',
        elementId: 1,
        code: 'I.2',
        title: 'Isi Kebijakan',
        criteria: [
          {
            id: 'smkp-crit-1-2-1',
            subElementId: 'smkp-sub-1-2',
            code: '1.2.1',
            requirementText: 'Kebijakan mencakup komitmen keselamatan operasi tambang, pencegahan kecelakaan tambang, kejadian berbahaya, dan penyakit akibat kerja.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian I.2',
            expectedEvidence: 'Klausul tertulis komitmen K3 dan Keselamatan Operasi (KO) Tambang pada dokumen kebijakan',
            verificationGuidance: 'Pastikan klausul secara eksplisit memuat komitmen pencegahan dan keselamatan operasi tambang'
          },
          {
            id: 'smkp-crit-1-2-2',
            subElementId: 'smkp-sub-1-2',
            code: '1.2.2',
            requirementText: 'Kebijakan memuat komitmen menaati peraturan perundang-undangan serta standar keselamatan pertambangan yang berlaku.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian I.2',
            expectedEvidence: 'Pernyataan komitmen penaatan hukum Minerba dalam naskah kebijakan',
            verificationGuidance: 'Periksa kesesuaian pernyataan komitmen regulasi terhadap peraturan terbaru'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    romanNumber: 'II',
    title: 'Perencanaan',
    weightPercentage: 15.0,
    description: 'Penelaahan awal, Identifikasi Bahaya Penilaian Risiko dan Pengendalian Risiko (IBPR/HIRADC), kepatuhan hukum, sasaran dan program',
    subElements: [
      {
        id: 'smkp-sub-2-1',
        elementId: 2,
        code: 'II.1',
        title: 'Penelaahan Awal (Baseline Review)',
        criteria: [
          {
            id: 'smkp-crit-2-1-1',
            subElementId: 'smkp-sub-2-1',
            code: '2.1.1',
            requirementText: 'Terdapat dokumen penelaahan awal untuk membandingkan penerapan sistem keselamatan saat ini dengan regulasi SMKP.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian II.1',
            expectedEvidence: 'Laporan Penelaahan Awal Gap Analysis SMKP bertanggal dan disetujui KTT',
            verificationGuidance: 'Periksa dokumentasi gap analysis awal saat penetapan sistem SMKP'
          }
        ]
      },
      {
        id: 'smkp-sub-2-2',
        elementId: 2,
        code: 'II.2',
        title: 'Manajemen Risiko (IBPR/HIRADC)',
        criteria: [
          {
            id: 'smkp-crit-2-2-1',
            subElementId: 'smkp-sub-2-2',
            code: '2.2.1',
            requirementText: 'Perusahaan memiliki SOP Manajemen Risiko (IBPR) yang mencakup identifikasi bahaya, penilaian risiko, dan hierarki pengendalian.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian II.2',
            expectedEvidence: 'SOP IBPR No. SOP-SHE-002, Formulir Risk Register Tambang, bukti penetapan matriks risiko 5x5',
            verificationGuidance: 'Periksa keabsahan matriks risiko dan penerapan hierarki pengendalian (Eliminasi, Substitusi, Rekayasa, Administrasi, APD)'
          },
          {
            id: 'smkp-crit-2-2-2',
            subElementId: 'smkp-sub-2-2',
            code: '2.2.2',
            requirementText: 'Register risiko (IBPR) ditinjau ulang minimal 1 (satu) tahun sekali atau setiap terjadi insiden kecelakaan dan perubahan proses kerja.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian II.2',
            expectedEvidence: 'Notulen review IBPR tahunan, catatan revisi register risiko pasca-insiden investigasi',
            verificationGuidance: 'Cek log tanggal pembaruan register risiko unit penambangan, hauling, dan processing'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    romanNumber: 'III',
    title: 'Organisasi dan Personel',
    weightPercentage: 15.0,
    description: 'Penetapan KTT/PJO, Pengawas Operasional (POP/POM/POU), Pengawas Teknis, Komite Keselamatan Pertambangan, kompetensi dan diklat',
    subElements: [
      {
        id: 'smkp-sub-3-1',
        elementId: 3,
        code: 'III.1',
        title: 'Penetapan KTT dan PJO',
        criteria: [
          {
            id: 'smkp-crit-3-1-1',
            subElementId: 'smkp-sub-3-1',
            code: '3.1.1',
            requirementText: 'KTT (Kepala Teknik Tambang) atau PJO (Penanggung Jawab Operasional) telah memiliki Surat Pengesahan resmi dari KaIT ESDM.',
            regulatoryReference: 'Permen ESDM No. 26/2018 & Kepdirjen 185/2019 Bagian III.1',
            expectedEvidence: 'Salinan SK Pengesahan KTT/PJO dari KaIT, Sertifikat Kompetensi KTT',
            verificationGuidance: 'Verifikasi nomor SK pengesahan KTT pada database Direktorat Jenderal Minerba'
          }
        ]
      },
      {
        id: 'smkp-sub-3-2',
        elementId: 3,
        code: 'III.2',
        title: 'Pengawas Operasional dan Teknis',
        criteria: [
          {
            id: 'smkp-crit-3-2-1',
            subElementId: 'smkp-sub-3-2',
            code: '3.2.1',
            requirementText: 'Seluruh Pengawas Operasional diangkat secara resmi oleh KTT dan memiliki sertifikat kompetensi POP, POM, atau POU.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian III.2',
            expectedEvidence: 'Surat Keputusan (SK) Pengangkatan Pengawas Operasional oleh KTT, Buku Sertifikat POP/POM/POU BNSP',
            verificationGuidance: 'Lakukan sampling SK penunjukan pengawas pit dan bengkel, cocokkan dengan sertifikat BNSP yang valid'
          }
        ]
      }
    ]
  },
  {
    id: 4,
    romanNumber: 'IV',
    title: 'Implementasi',
    weightPercentage: 35.0,
    description: 'Pengelolaan operasional, Standard Operating Procedure (SOP), JSA, izin kerja khusus, K3, Keselamatan Operasi (KO), ERP',
    subElements: [
      {
        id: 'smkp-sub-4-1',
        elementId: 4,
        code: 'IV.1',
        title: 'Pengelolaan Operasional (SOP & JSA)',
        criteria: [
          {
            id: 'smkp-crit-4-1-1',
            subElementId: 'smkp-sub-4-1',
            code: '4.1.1',
            requirementText: 'Perusahaan menyusun dan menetapkan SOP untuk seluruh aktivitas penambangan, pengolahan, pengangkutan, dan bengkel.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian IV.1',
            expectedEvidence: 'Daftar Induk Dokumen SOP terkendali, salinan SOP di unit kerja lapangan, bukti tanda terima dokumen',
            verificationGuidance: 'Verifikasi ketersediaan SOP pengoperasian unit bergerak, peledakan, confined space, isolasi energi LOTO'
          },
          {
            id: 'smkp-crit-4-1-2',
            subElementId: 'smkp-sub-4-1',
            code: '4.1.2',
            requirementText: 'Terdapat Surat Izin Kerja Khusus (Permit to Work) untuk pekerjaan berisiko tinggi (bekerja di ketinggian, panas, ruang terbatas, penggalian).',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian IV.1',
            expectedEvidence: 'Formulir SIKA terbit, formulir JSA terlampir, log book izin kerja berisiko tinggi',
            verificationGuidance: 'Periksa berkas izin kerja aktif di lapangan, apakah telah ditandatangani pengawas yang kompeten'
          }
        ]
      },
      {
        id: 'smkp-sub-4-2',
        elementId: 4,
        code: 'IV.2',
        title: 'Pengelolaan Keadaan Darurat (ERP)',
        criteria: [
          {
            id: 'smkp-crit-4-2-1',
            subElementId: 'smkp-sub-4-2',
            code: '4.2.1',
            requirementText: 'Tersedia Tim Tanggap Darurat (Emergency Response Team/ERT) yang terlatih, bersertifikat, dan sarana penyelamatan yang memadai.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian IV.2',
            expectedEvidence: 'Struktur Tim ERT, jadwal piket regu penyelamat, sertifikat Rescue tambang, inventaris peralatan rescue',
            verificationGuidance: 'Periksa kesiapan pos komando darurat, ambulans 4x4 tambang, dan catatan simulasi drill'
          }
        ]
      }
    ]
  },
  {
    id: 5,
    romanNumber: 'V',
    title: 'Pemantauan, Evaluasi, dan Tindak Lanjut',
    weightPercentage: 15.0,
    description: 'Inspeksi keselamatan terencana, kalibrasi peralatan, audit internal SMKP, investigasi kecelakaan, evaluasi kepatuhan hukum',
    subElements: [
      {
        id: 'smkp-sub-5-1',
        elementId: 5,
        code: 'V.1',
        title: 'Pemantauan & Inspeksi Terencana',
        criteria: [
          {
            id: 'smkp-crit-5-1-1',
            subElementId: 'smkp-sub-5-1',
            code: '5.1.1',
            requirementText: 'Pengawas operasional melaksanakan inspeksi K3 & KO berkala sesuai jadwal yang disahkan KTT.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian V.1',
            expectedEvidence: 'Program tahunan inspeksi, formulir inspeksi pit/workshop/mess, laporan rekapitulasi temuan inspeksi',
            verificationGuidance: 'Verifikasi frekuensi inspeksi dan tindak lanjut temuan bahaya lapangan'
          }
        ]
      },
      {
        id: 'smkp-sub-5-2',
        elementId: 5,
        code: 'V.2',
        title: 'Audit Internal SMKP Minerba',
        criteria: [
          {
            id: 'smkp-crit-5-2-1',
            subElementId: 'smkp-sub-5-2',
            code: '5.2.1',
            requirementText: 'Audit internal SMKP Minerba dilaksanakan minimal 1 (satu) kali setahun oleh auditor internal yang memiliki sertifikasi Auditor SMKP terdaftar KaIT.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian V.2',
            expectedEvidence: 'Sertifikat Auditor SMKP Minerba, SK Tim Audit Internal dari KTT, Laporan Audit Internal SMKP tahunan',
            verificationGuidance: 'Periksa keabsahan registrasi nomor sertifikat auditor SMKP di KaIT ESDM'
          }
        ]
      }
    ]
  },
  {
    id: 6,
    romanNumber: 'VI',
    title: 'Dokumentasi',
    weightPercentage: 5.0,
    description: 'Manual SMKP, pengendalian dokumen, prosedur penyusunan SOP, pengendalian rekaman dan catatan keselamatan pertambangan',
    subElements: [
      {
        id: 'smkp-sub-6-1',
        elementId: 6,
        code: 'VI.1',
        title: 'Pengendalian Dokumen dan Rekaman',
        criteria: [
          {
            id: 'smkp-crit-6-1-1',
            subElementId: 'smkp-sub-6-1',
            code: '6.1.1',
            requirementText: 'Terdapat prosedur pengendalian dokumen yang mengatur pembuatan, peninjauan, persetujuan, penomoran, revisi, dan penarikan dokumen usang.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian VI.1',
            expectedEvidence: 'SOP Pengendalian Dokumen, Daftar Induk Dokumen Aktif, Riwayat Perubahan/Revisi Dokumen',
            verificationGuidance: 'Verifikasi cap "CONTROLLED COPY" atau status validitas digital pada sistem database SOP'
          }
        ]
      }
    ]
  },
  {
    id: 7,
    romanNumber: 'VII',
    title: 'Tinjauan Manajemen dan Peningkatan Kinerja',
    weightPercentage: 10.0,
    description: 'Rapat tinjauan manajemen (RTM) berkala pimpinan puncak, evaluasi kinerja SMKP, dan continual improvement',
    subElements: [
      {
        id: 'smkp-sub-7-1',
        elementId: 7,
        code: 'VII.1',
        title: 'Pelaksanaan Tinjauan Manajemen (RTM)',
        criteria: [
          {
            id: 'smkp-crit-7-1-1',
            subElementId: 'smkp-sub-7-1',
            code: '7.1.1',
            requirementText: 'Pimpinan puncak (Direktur/KTT) menyelenggarakan Rapat Tinjauan Manajemen minimal 1 (satu) kali setahun untuk mengevaluasi efektivitas SMKP.',
            regulatoryReference: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Bagian VII.1',
            expectedEvidence: 'Undangan RTM, Notulen rapat RTM ditandatangani KTT, Daftar hadir Direksi/KTT/PJO, Action plan RTM',
            verificationGuidance: 'Periksa masukan tinjauan manajemen (hasil audit, keluhan, insiden, kepatuhan regulasi) dan tindak lanjutnya'
          }
        ]
      }
    ]
  }
];

// ISO STANDARDS (9001, 14001, 45001) VERIFIED MASTER CLAUSES
export const INITIAL_ISO_STANDARDS: ISOStandard[] = [
  {
    id: 'iso-9001',
    type: 'ISO 9001',
    code: 'ISO 9001:2015',
    name: 'Sistem Manajemen Mutu (Quality Management System)',
    edition: 'Edisi 2015 (Terverifikasi)',
    clauses: [
      {
        id: 'iso9001-c4',
        clauseNumber: 4,
        title: 'Konteks Organisasi',
        requirements: [
          {
            id: 'iso9001-req-4-1',
            clauseId: 'iso9001-c4',
            subClauseCode: '4.1',
            title: 'Memahami Organisasi dan Konteksnya',
            verifiedSummary: 'Menentukan isu eksternal & internal yang relevan dengan tujuan strategis dan kepuasan pelanggan batubara/mineral.',
            expectedEvidence: 'Analisis SWOT/PESTEL perusahaan tambang, register isu eksternal & internal'
          },
          {
            id: 'iso9001-req-4-2',
            clauseId: 'iso9001-c4',
            subClauseCode: '4.2',
            title: 'Kebutuhan & Harapan Pihak Berkepentingan',
            verifiedSummary: 'Menentukan pembeli (buyer), regulator ESDM, masyarakat sekitar, dan pemegang saham.',
            expectedEvidence: 'Matriks Stakeholder Needs & Expectations, survei kepuasan pelanggan'
          }
        ]
      },
      {
        id: 'iso9001-c5',
        clauseNumber: 5,
        title: 'Kepemimpinan',
        requirements: [
          {
            id: 'iso9001-req-5-1',
            clauseId: 'iso9001-c5',
            subClauseCode: '5.1',
            title: 'Kepemimpinan dan Komitmen',
            verifiedSummary: 'Pimpinan puncak memperagakan kepemimpinan dan komitmen terhadap sistem manajemen mutu.',
            expectedEvidence: 'Bukti alokasi sumber daya operasional, keterlibatan direksi dalam pencapaian KPI mutu'
          },
          {
            id: 'iso9001-req-5-2',
            clauseId: 'iso9001-c5',
            subClauseCode: '5.2',
            title: 'Kebijakan Mutu',
            verifiedSummary: 'Menetapkan, menerapkan, dan memelihara kebijakan mutu yang selaras dengan arahan strategis.',
            expectedEvidence: 'Dokumen Kebijakan Mutu terpasang di control room dan pit office'
          }
        ]
      },
      {
        id: 'iso9001-c8',
        clauseNumber: 8,
        title: 'Operasi',
        requirements: [
          {
            id: 'iso9001-req-8-1',
            clauseId: 'iso9001-c8',
            subClauseCode: '8.1',
            title: 'Perencanaan dan Pengendalian Operasional',
            verifiedSummary: 'Merencanakan dan mengendalikan proses penambangan, crushing, dan barging sesuai kriteria mutu.',
            expectedEvidence: 'SOP Coal Processing & Blending, spesifikasi kalori (CV, TM, Ash, TS), flow chart proses'
          },
          {
            id: 'iso9001-req-8-5',
            clauseId: 'iso9001-c8',
            subClauseCode: '8.5',
            title: 'Produksi dan Penyediaan Jasa',
            verifiedSummary: 'Menerapkan kondisi terkendali untuk penambangan, penimbangan jembatan timbang (weighbridge), dan loading tongkang.',
            expectedEvidence: 'Sertifikat kalibrasi jembatan timbang, draft survey report, sertifikat COA (Certificate of Analysis)'
          }
        ]
      },
      {
        id: 'iso9001-c9',
        clauseNumber: 9,
        title: 'Evaluasi Kinerja',
        requirements: [
          {
            id: 'iso9001-req-9-2',
            clauseId: 'iso9001-c9',
            subClauseCode: '9.2',
            title: 'Audit Internal',
            verifiedSummary: 'Melaksanakan audit internal pada interval terencana untuk memastikan kesesuaian persyaratan ISO 9001.',
            expectedEvidence: 'Program audit mutu tahunan, checklist audit ISO 9001, laporan temuan ketidaksesuaian'
          }
        ]
      }
    ]
  },
  {
    id: 'iso-14001',
    type: 'ISO 14001',
    code: 'ISO 14001:2015',
    name: 'Sistem Manajemen Lingkungan (Environmental Management System)',
    edition: 'Edisi 2015 (Terverifikasi)',
    clauses: [
      {
        id: 'iso14001-c6',
        clauseNumber: 6,
        title: 'Perencanaan Lingkungan',
        requirements: [
          {
            id: 'iso14001-req-6-1',
            clauseId: 'iso14001-c6',
            subClauseCode: '6.1.2',
            title: 'Aspek Lingkungan Penting (Aspect-Impact)',
            verifiedSummary: 'Mengidentifikasi aspek lingkungan dari kegiatan tambang (air asam tambang, debu, emisi genset, limbah B3).',
            expectedEvidence: 'Dokumen AMDAL/RKL-RPL, Matriks Aspek dan Dampak Lingkungan (EAI), Neraca Limbah B3'
          },
          {
            id: 'iso14001-req-6-1-3',
            clauseId: 'iso14001-c6',
            subClauseCode: '6.1.3',
            title: 'Kewajiban Penaatan (Persetujuan Lingkungan)',
            verifiedSummary: 'Mengidentifikasi dan memiliki akses terhadap persyaratan hukum lingkungan hidup (PP 22/2021).',
            expectedEvidence: 'Daftar Peraturan Lingkungan Hidup, Izin Pembuangan Air Limbah (IPLC), Izin TPS Limbah B3'
          }
        ]
      },
      {
        id: 'iso14001-c8',
        clauseNumber: 8,
        title: 'Operasi Pengendalian Lingkungan',
        requirements: [
          {
            id: 'iso14001-req-8-1',
            clauseId: 'iso14001-c8',
            subClauseCode: '8.1',
            title: 'Pengendalian Operasional Lingkungan',
            verifiedSummary: 'Menerapkan prosedur pengelolaan settling pond tambang, netralisasi pH air asam tambang, dan reklamasi revegetasi.',
            expectedEvidence: 'SOP Pengelolaan Settling Pond, Log book penambahan kapur tohor, peta kemajuan reklamasi'
          }
        ]
      },
      {
        id: 'iso14001-c9',
        clauseNumber: 9,
        title: 'Evaluasi Kinerja Lingkungan',
        requirements: [
          {
            id: 'iso14001-req-9-1',
            clauseId: 'iso14001-c9',
            subClauseCode: '9.1.2',
            title: 'Evaluasi Penaatan Regulasi Lingkungan',
            verifiedSummary: 'Mengevaluasi pemenuhan baku mutu air limbah tambang, emisi udara, dan kebisingan secara periodik.',
            expectedEvidence: 'Hasil uji laboratorium terakreditasi KAN untuk air outlet settling pond dan cerobong genset'
          }
        ]
      }
    ]
  },
  {
    id: 'iso-45001',
    type: 'ISO 45001',
    code: 'ISO 45001:2018',
    name: 'Sistem Manajemen Keselamatan & Kesehatan Kerja (K3)',
    edition: 'Edisi 2018 (Terverifikasi)',
    clauses: [
      {
        id: 'iso45001-c5',
        clauseNumber: 5,
        title: 'Kepemimpinan dan Partisipasi Pekerja',
        requirements: [
          {
            id: 'iso45001-req-5-4',
            clauseId: 'iso45001-c5',
            subClauseCode: '5.4',
            title: 'Konsultasi dan Partisipasi Pekerja',
            verifiedSummary: 'Menetapkan mekanisme konsultasi dan partisipasi aktif pekerja non-manajerial dalam identifikasi bahaya dan evaluasi K3.',
            expectedEvidence: 'Komite P2K3 tambang, notulensi safety talk/toolbox meeting, kotak saran bahaya (hazard report)'
          }
        ]
      },
      {
        id: 'iso45001-c6',
        clauseNumber: 6,
        title: 'Perencanaan K3',
        requirements: [
          {
            id: 'iso45001-req-6-1',
            clauseId: 'iso45001-c6',
            subClauseCode: '6.1.2',
            title: 'Identifikasi Bahaya dan Penilaian Risiko K3',
            verifiedSummary: 'Mengidentifikasi bahaya rutin & non-rutin, faktor ergonomi, kelelahan kerja (fatigue), dan perilaku manusia.',
            expectedEvidence: 'HIRADC Pertambangan, program fatigue management tambang, hasil pengukuran kebisingan & getaran'
          }
        ]
      },
      {
        id: 'iso45001-c8',
        clauseNumber: 8,
        title: 'Operasi K3',
        requirements: [
          {
            id: 'iso45001-req-8-1',
            clauseId: 'iso45001-c8',
            subClauseCode: '8.1.2',
            title: 'Menghilangkan Bahaya dan Mengurangi Risiko K3',
            verifiedSummary: 'Menerapkan hierarki pengendalian pada area tambang pit, hauling road, dan coal processing.',
            expectedEvidence: 'Pemasangan safety berm jalan tambang (3/4 tinggi ban HD), rambu batas kecepatan, LOTO unit'
          },
          {
            id: 'iso45001-req-8-2',
            clauseId: 'iso45001-c8',
            subClauseCode: '8.2',
            title: 'Kesiapsiagaan dan Tanggap Darurat',
            verifiedSummary: 'Memelihara rencana tanggap darurat untuk insiden longsor lereng, kebakaran alat berat, dan kecelakaan jalan tambang.',
            expectedEvidence: 'Emergency Response Plan (ERP), drill report simulasi penyelamatan operator dump truck'
          }
        ]
      },
      {
        id: 'iso45001-c10',
        clauseNumber: 10,
        title: 'Peningkatan K3 (Continual Improvement)',
        requirements: [
          {
            id: 'iso45001-req-10-2',
            clauseId: 'iso45001-c10',
            subClauseCode: '10.2',
            title: 'Insiden, Ketidaksesuaian, dan Tindakan Korektif',
            verifiedSummary: 'Melaporkan, menginvestigasi insiden hingga ke akar penyebab (RCA), dan memverifikasi efektivitas tindakan koreksi.',
            expectedEvidence: 'Formulir Investigasi Kecelakaan Tambang (Metode ICAM / SCAT), log book status CAPA'
          }
        ]
      }
    ]
  }
];

// INITIAL DOCUMENTS IN DATABASE
export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-001',
    docNumber: 'SOP-SHE-001',
    title: 'SOP Pengendalian Dokumen dan Rekaman ISMS Terintegrasi',
    category: 'SOP',
    departmentId: 'dept-1',
    departmentName: 'Safety, Health & Environment (SHE)',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    businessProcess: 'Tata Kelola Sistem Manajemen Mutu, K3 & Lingkungan',
    sheAspectRisk: 'Risiko penggunaan prosedur kadaluwarsa yang mengakibatkan insiden operasional',
    currentRevision: 'Rev.02',
    status: 'Effective',
    confidentiality: 'Internal',
    effectiveDate: '2025-01-10',
    reviewDueDate: '2027-01-10',
    createdBy: 'user-admin',
    authorName: 'Ir. Hendra Wijaya, IPM',
    reviewerName: 'Bambang Kusuma, S.T.',
    approverName: 'Direktur Operasional',
    fileName: 'SOP-SHE-001_Pengendalian_Dokumen_Rev02.pdf',
    fileSizeKb: 1450,
    changeSummary: 'Pembaruan alur approval digital dan integrasi klausul SMKP Minerba Kepdirjen 185 Elemen VI.',
    versions: [
      {
        id: 'v-001-1',
        versionNumber: 'Rev.00',
        status: 'Obsolete',
        releaseDate: '2023-01-15',
        changeSummary: 'Penerbitan perdana versi integrasi ISO 9001 & ISO 14001',
        fileName: 'SOP-SHE-001_Rev00.pdf',
        fileSizeKb: 1200,
        authorName: 'Hendra Wijaya',
        approverName: 'KTT Sangatta',
        createdAt: '2023-01-10'
      },
      {
        id: 'v-001-2',
        versionNumber: 'Rev.01',
        status: 'Obsolete',
        releaseDate: '2024-02-01',
        changeSummary: 'Penambahan klausul ISO 45001:2018',
        fileName: 'SOP-SHE-001_Rev01.pdf',
        fileSizeKb: 1350,
        authorName: 'Hendra Wijaya',
        approverName: 'KTT Sangatta',
        createdAt: '2024-01-28'
      },
      {
        id: 'v-001-3',
        versionNumber: 'Rev.02',
        status: 'Effective',
        releaseDate: '2025-01-10',
        changeSummary: 'Integrasi penuh SMKP Minerba Kepdirjen 185 Elemen VI Dokumentasi',
        fileName: 'SOP-SHE-001_Pengendalian_Dokumen_Rev02.pdf',
        fileSizeKb: 1450,
        authorName: 'Hendra Wijaya',
        approverName: 'Direktur Operasional',
        createdAt: '2025-01-05'
      }
    ],
    mappedSMKPElements: ['VI.1', 'I.1'],
    mappedISOClauses: ['ISO9001-c4', 'ISO14001-c6', 'iso45001-c5'],
    createdAt: '2025-01-05 10:00',
    updatedAt: '2025-01-10 14:00'
  },
  {
    id: 'doc-002',
    docNumber: 'SOP-MINE-012',
    title: 'SOP Operasi Hauling dan Pengendalian Kecepatan Dump Truck HD785 di Jalan Tambang',
    category: 'SOP',
    departmentId: 'dept-2',
    departmentName: 'Mining Operations & Engineering',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    businessProcess: 'Pengangkutan Overburden & Batubara',
    sheAspectRisk: 'Tabrakan unit HD, blind spot, rem blong, debu pekat jalan tambang',
    currentRevision: 'Rev.01',
    status: 'Effective',
    confidentiality: 'Internal',
    effectiveDate: '2025-03-01',
    reviewDueDate: '2027-03-01',
    createdBy: 'user-op',
    authorName: 'Bambang Kusuma, S.T.',
    reviewerName: 'Ir. Hendra Wijaya, IPM',
    approverName: 'Kepala Teknik Tambang (KTT)',
    fileName: 'SOP-MINE-012_Hauling_HD785_Rev01.pdf',
    fileSizeKb: 2890,
    changeSummary: 'Penyesuaian batas kecepatan maksimum saat kondisi hujan lebat (Slippery condition) menjadi 30 km/jam.',
    versions: [
      {
        id: 'v-002-1',
        versionNumber: 'Rev.01',
        status: 'Effective',
        releaseDate: '2025-03-01',
        changeSummary: 'Revisi spesifikasi safety berm dan panduan fatigue radio call',
        fileName: 'SOP-MINE-012_Hauling_HD785_Rev01.pdf',
        fileSizeKb: 2890,
        authorName: 'Bambang Kusuma, S.T.',
        approverName: 'KTT Sangatta',
        createdAt: '2025-02-20'
      }
    ],
    mappedSMKPElements: ['IV.1'],
    mappedISOClauses: ['iso45001-c8'],
    createdAt: '2025-02-20 08:30',
    updatedAt: '2025-03-01 09:00'
  },
  {
    id: 'doc-003',
    docNumber: 'IK-MAINT-008',
    title: 'Instruksi Kerja Pemasangan Lockout Tagout (LOTO) pada Unit Excavator Komatsu PC2000',
    category: 'IK',
    departmentId: 'dept-4',
    departmentName: 'Heavy Equipment Maintenance',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    businessProcess: 'Perawatan Berkala Alat Berat Tambang',
    sheAspectRisk: 'Pelepasan energi tersimpan mekanikal, hidrolik bertekanan, dan kelistrikan 24V',
    currentRevision: 'Rev.00',
    status: 'Effective',
    confidentiality: 'Internal',
    effectiveDate: '2025-04-15',
    reviewDueDate: '2026-11-15',
    createdBy: 'user-op',
    authorName: 'Rudi Hartono, M.T.',
    reviewerName: 'Ir. Hendra Wijaya, IPM',
    approverName: 'KTT Sangatta',
    fileName: 'IK-MAINT-008_LOTO_PC2000.pdf',
    fileSizeKb: 1820,
    changeSummary: 'Penerbitan baru prosedur isolasi 5 titik sumber energi.',
    versions: [
      {
        id: 'v-003-1',
        versionNumber: 'Rev.00',
        status: 'Effective',
        releaseDate: '2025-04-15',
        changeSummary: 'Penerbitan perdana',
        fileName: 'IK-MAINT-008_LOTO_PC2000.pdf',
        fileSizeKb: 1820,
        authorName: 'Rudi Hartono, M.T.',
        approverName: 'KTT Sangatta',
        createdAt: '2025-04-10'
      }
    ],
    mappedSMKPElements: ['IV.1'],
    mappedISOClauses: ['iso45001-c8'],
    createdAt: '2025-04-10 11:00',
    updatedAt: '2025-04-15 13:00'
  },
  {
    id: 'doc-004',
    docNumber: 'STD-ENV-003',
    title: 'Standar Parameter Baku Mutu Efluen Air Asam Tambang (AAT) dan Emisi Genset',
    category: 'STD',
    departmentId: 'dept-1',
    departmentName: 'Safety, Health & Environment (SHE)',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    businessProcess: 'Pengendalian Dampak Lingkungan Tambang',
    sheAspectRisk: 'Pencemaran sungai sekitar tambang oleh pH < 6 dan logam terlarut Fe, Mn',
    currentRevision: 'Rev.03',
    status: 'Effective',
    confidentiality: 'Publik',
    effectiveDate: '2025-06-01',
    reviewDueDate: '2027-06-01',
    createdBy: 'user-admin',
    authorName: 'Ir. Hendra Wijaya, IPM',
    reviewerName: 'Kepala Dinas Lingkungan Hidup Kab. Kutim',
    approverName: 'KTT Sangatta',
    fileName: 'STD-ENV-003_Baku_Mutu_AAT.pdf',
    fileSizeKb: 980,
    changeSummary: 'Penyesuaian batas baku mutu mengacu PP No. 22 Tahun 2021 Lampiran VI.',
    versions: [
      {
        id: 'v-004-1',
        versionNumber: 'Rev.03',
        status: 'Effective',
        releaseDate: '2025-06-01',
        changeSummary: 'Sinkronisasi dengan PP 22/2021',
        fileName: 'STD-ENV-003_Baku_Mutu_AAT.pdf',
        fileSizeKb: 980,
        authorName: 'Ir. Hendra Wijaya, IPM',
        approverName: 'KTT Sangatta',
        createdAt: '2025-05-25'
      }
    ],
    mappedSMKPElements: ['IV.1', 'V.1'],
    mappedISOClauses: ['iso14001-c6', 'iso14001-c8'],
    createdAt: '2025-05-25 14:00',
    updatedAt: '2025-06-01 10:00'
  },
  {
    id: 'doc-005',
    docNumber: 'JSA-MINE-044',
    title: 'JSA Penggantian Tyre Depan Haul Truck Komatsu HD785 di Lokasi Breakdown Pit',
    category: 'JSA',
    departmentId: 'dept-2',
    departmentName: 'Mining Operations & Engineering',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    businessProcess: 'Tanggap Darurat Kerusakan Alat Tambang',
    sheAspectRisk: 'Unit amblas, tyre meledak karena tekanan angin tinggi, dongkrak hidrolik geser',
    currentRevision: 'Rev.00',
    status: 'Submitted',
    confidentiality: 'Internal',
    effectiveDate: '2026-11-01',
    reviewDueDate: '2027-11-01',
    createdBy: 'user-op',
    authorName: 'Bambang Kusuma, S.T.',
    reviewerName: 'Ir. Hendra Wijaya, IPM',
    approverName: 'Pending Review',
    fileName: 'JSA-MINE-044_Tyre_Replacement_HD785.pdf',
    fileSizeKb: 1120,
    changeSummary: 'Pengajuan dokumen baru untuk mitigasi bahaya pelepasan tyre di lereng pit.',
    versions: [
      {
        id: 'v-005-1',
        versionNumber: 'Rev.00',
        status: 'Submitted',
        releaseDate: '2026-10-14',
        changeSummary: 'Pengajuan perdana',
        fileName: 'JSA-MINE-044_Tyre_Replacement_HD785.pdf',
        fileSizeKb: 1120,
        authorName: 'Bambang Kusuma, S.T.',
        createdAt: '2026-10-14'
      }
    ],
    mappedSMKPElements: ['IV.1', 'II.2'],
    mappedISOClauses: ['iso45001-c6'],
    createdAt: '2026-10-14 16:00',
    updatedAt: '2026-10-14 16:00'
  },
  {
    id: 'doc-006',
    docNumber: 'POL-CORP-001',
    title: 'Kebijakan Terintegrasi Mutu, K3 Pertambangan dan Perlindungan Lingkungan Hidup',
    category: 'POL',
    departmentId: 'dept-1',
    departmentName: 'Safety, Health & Environment (SHE)',
    siteId: 'site-3',
    siteName: 'Head Office Jakarta',
    businessProcess: 'Tata Kelola Korporasi Puncak',
    sheAspectRisk: 'Ketidaksesuaian arah kebijakan korporasi dengan komitmen perlindungan pekerja tambang',
    currentRevision: 'Rev.04',
    status: 'Effective',
    confidentiality: 'Publik',
    effectiveDate: '2025-01-02',
    reviewDueDate: '2026-12-31',
    createdBy: 'user-admin',
    authorName: 'Ir. Hendra Wijaya, IPM',
    reviewerName: 'Direktur SHE & Ops',
    approverName: 'Presiden Direktur & KTT',
    fileName: 'POL-CORP-001_Kebijakan_SHE_2025.pdf',
    fileSizeKb: 850,
    changeSummary: 'Pengesahan tahunan komitmen zero fatality dan dekarbonisasi tambang.',
    versions: [
      {
        id: 'v-006-1',
        versionNumber: 'Rev.04',
        status: 'Effective',
        releaseDate: '2025-01-02',
        changeSummary: 'Penyegaran target penurunan emisi gas rumah kaca',
        fileName: 'POL-CORP-001_Kebijakan_SHE_2025.pdf',
        fileSizeKb: 850,
        authorName: 'Ir. Hendra Wijaya, IPM',
        approverName: 'Presiden Direktur & KTT',
        createdAt: '2024-12-28'
      }
    ],
    mappedSMKPElements: ['I.1', 'I.2'],
    mappedISOClauses: ['iso9001-c5', 'iso14001-c6', 'iso45001-c5'],
    createdAt: '2024-12-28 09:00',
    updatedAt: '2025-01-02 08:00'
  }
];

// AUDITS MASTER DATA
export const INITIAL_AUDITS: AuditItem[] = [
  {
    id: 'audit-001',
    auditNumber: 'AUD-SMKP-2026-001',
    title: 'Audit Internal SMKP Minerba Semester I - Wilayah Pit & Workshop Sangatta',
    auditType: 'SMKP Minerba',
    standards: ['SMKP Minerba Kepdirjen 185.K/37.04/DJB/2019'],
    departmentId: 'dept-2',
    departmentName: 'Mining Operations & Engineering',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    leadAuditor: 'Ir. Hendra Wijaya, IPM (Lead Auditor SMKP)',
    auditors: ['Agus Prasetyo, S.T. (Auditor K3)', 'Citra Lestari, S.Si. (Auditor Lingkungan)'],
    auditeePIC: 'Bambang Kusuma, S.T. (Mine Superintendent)',
    scope: 'Penerapan Elemen I s/d VII SMKP Minerba pada operasional penambangan pit utara dan maintenance alat berat.',
    objective: 'Memverifikasi tingkat kepatuhan implementasi keselamatan pertambangan terhadap regulasi Kepdirjen Minerba 185.',
    status: 'Sedang Berjalan',
    checklists: [
      {
        id: 'chk-001',
        auditId: 'audit-001',
        standardType: 'SMKP',
        code: '1.1.1',
        requirementText: 'Terdapat Kebijakan Keselamatan Pertambangan tertulis, ditandatangani oleh pimpinan tertinggi perusahaan atau KTT, bertanggal dan disahkan.',
        expectedEvidence: 'Dokumen Kebijakan KP bertandatangan Direktur/KTT, papan pengumuman kebijakan, bukti sosialisasi',
        documentRefNumber: 'POL-CORP-001',
        resultStatus: 'Compliant',
        auditorNotes: 'Kebijakan telah ditandatangani KTT pada 2 Januari 2025, terpasang di papan informasi briefing pit.',
        fieldObservation: 'Tersedia di pos komando dan dibacakan saat P5M mingguan.',
        verifiedBy: 'Ir. Hendra Wijaya, IPM',
        verifiedAt: '2026-10-06 09:30'
      },
      {
        id: 'chk-002',
        auditId: 'audit-001',
        standardType: 'SMKP',
        code: '1.2.1',
        requirementText: 'Kebijakan mencakup komitmen keselamatan operasi tambang, pencegahan kecelakaan tambang, kejadian berbahaya, dan penyakit akibat kerja.',
        expectedEvidence: 'Klausul tertulis komitmen K3 dan Keselamatan Operasi (KO) Tambang pada dokumen kebijakan',
        documentRefNumber: 'POL-CORP-001',
        resultStatus: 'Compliant',
        auditorNotes: 'Klausul komitmen lengkap memenuhi kaidah Lampiran I Bagian I.2 Kepdirjen 185.',
        verifiedBy: 'Ir. Hendra Wijaya, IPM',
        verifiedAt: '2026-10-06 10:15'
      },
      {
        id: 'chk-003',
        auditId: 'audit-001',
        standardType: 'SMKP',
        code: '2.2.1',
        requirementText: 'Perusahaan memiliki SOP Manajemen Risiko (IBPR) yang mencakup identifikasi bahaya, penilaian risiko, dan hierarki pengendalian.',
        expectedEvidence: 'SOP IBPR No. SOP-SHE-002, Formulir Risk Register Tambang, bukti penetapan matriks risiko 5x5',
        resultStatus: 'Partial Compliance',
        auditorNotes: 'SOP IBPR tersedia, namun register risiko untuk aktivitas penambangan malam hari belum diperbarui pasca pergantian kontraktor penerangan pit.',
        fieldObservation: 'Penerangan di bench loading 3 masih di bawah standar 20 Lux.',
        verifiedBy: 'Agus Prasetyo, S.T.',
        verifiedAt: '2026-10-07 14:00'
      },
      {
        id: 'chk-004',
        auditId: 'audit-001',
        standardType: 'SMKP',
        code: '3.1.1',
        requirementText: 'KTT (Kepala Teknik Tambang) atau PJO (Penanggung Jawab Operasional) telah memiliki Surat Pengesahan resmi dari KaIT ESDM.',
        expectedEvidence: 'Salinan SK Pengesahan KTT/PJO dari KaIT, Sertifikat Kompetensi KTT',
        resultStatus: 'Compliant',
        auditorNotes: 'SK KaIT No. 452.K/37.04/DJB/2024 terverifikasi valid sampai 2029.',
        verifiedBy: 'Ir. Hendra Wijaya, IPM',
        verifiedAt: '2026-10-06 11:30'
      },
      {
        id: 'chk-005',
        auditId: 'audit-001',
        standardType: 'SMKP',
        code: '4.1.1',
        requirementText: 'Perusahaan menyusun dan menetapkan SOP untuk seluruh aktivitas penambangan, pengolahan, pengangkutan, dan bengkel.',
        expectedEvidence: 'Daftar Induk Dokumen SOP terkendali, salinan SOP di unit kerja lapangan, bukti tanda terima dokumen',
        documentRefNumber: 'SOP-MINE-012',
        resultStatus: 'Noncompliant',
        auditorNotes: 'Ditemukan operator workshop melakukan pengelasan tangki solar tanpa SIKA panas (Hot Work Permit) dan tanpa JSA spesifik.',
        fieldObservation: 'Pekerjaan dihentikan seketika oleh auditor saat verifikasi lapangan di bay 4 workshop.',
        verifiedBy: 'Agus Prasetyo, S.T.',
        verifiedAt: '2026-10-08 10:20'
      },
      {
        id: 'chk-006',
        auditId: 'audit-001',
        standardType: 'SMKP',
        code: '6.1.1',
        requirementText: 'Terdapat prosedur pengendalian dokumen yang mengatur pembuatan, peninjauan, persetujuan, penomoran, revisi, dan penarikan dokumen usang.',
        expectedEvidence: 'SOP Pengendalian Dokumen, Daftar Induk Dokumen Aktif, Riwayat Perubahan/Revisi Dokumen',
        documentRefNumber: 'SOP-SHE-001',
        resultStatus: 'Compliant',
        auditorNotes: 'Sistem database ISMS terpusat memadai dan mencegah pemakaian dokumen revisi lama.',
        verifiedBy: 'Ir. Hendra Wijaya, IPM',
        verifiedAt: '2026-10-08 15:45'
      }
    ],
    createdAt: '2026-10-01 08:00'
  },
  {
    id: 'audit-002',
    auditNumber: 'AUD-INT-2026-002',
    title: 'Audit Surveillance Terintegrasi ISO 9001, ISO 14001, dan ISO 45001',
    auditType: 'Audit Terintegrasi',
    standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
    departmentId: 'dept-1',
    departmentName: 'Safety, Health & Environment (SHE)',
    siteId: 'site-1',
    siteName: 'Pit Sangatta Block North',
    startDate: '2026-11-10',
    endDate: '2026-11-13',
    leadAuditor: 'Citra Lestari, S.Si. (Lead Auditor IRCA)',
    auditors: ['Ir. Hendra Wijaya, IPM', 'Doni Firmansyah, S.T.'],
    auditeePIC: 'Dedi Gunawan, S.T. & Bambang Kusuma, S.T.',
    scope: 'Seluruh proses rantai nilai: Penambangan, Coal Processing Plant (CPP), Pengelolaan Lingkungan Settling Pond, & K3.',
    objective: 'Mempertahankan sertifikasi ISO Terintegrasi dan menilai efektivitas sistem manajemen.',
    status: 'Terjadwal',
    checklists: [
      {
        id: 'chk-007',
        auditId: 'audit-002',
        standardType: 'ISO 9001',
        code: '8.1',
        requirementText: 'Perencanaan dan Pengendalian Operasional Mutu Batubara',
        expectedEvidence: 'SOP Coal Processing, hasil analisa laboratorium kalori CV batubara',
        resultStatus: 'Not Yet Verified'
      },
      {
        id: 'chk-008',
        auditId: 'audit-002',
        standardType: 'ISO 14001',
        code: '6.1.2',
        requirementText: 'Aspek Lingkungan Penting (Air Asam Tambang & Limbah B3)',
        expectedEvidence: 'Matriks Aspek Dampak Lingkungan, Izin TPS Limbah B3, Log book limbah oli bekas',
        resultStatus: 'Not Yet Verified'
      },
      {
        id: 'chk-009',
        auditId: 'audit-002',
        standardType: 'ISO 45001',
        code: '8.1.2',
        requirementText: 'Menghilangkan Bahaya dan Mengurangi Risiko K3 di Pit Tambang',
        expectedEvidence: 'Inspeksi safety berm jalan hauling, kepatuhan batas kecepatan, rekaman fatigue check',
        resultStatus: 'Not Yet Verified'
      }
    ],
    createdAt: '2026-10-10 11:00'
  }
];

// AUDIT FINDINGS & CAR
export const INITIAL_FINDINGS: AuditFinding[] = [
  {
    id: 'fnd-001',
    findingNumber: 'NC-SMKP-2026-001',
    auditId: 'audit-001',
    auditNumber: 'AUD-SMKP-2026-001',
    standardType: 'SMKP Minerba',
    clauseOrElement: 'Elemen IV.1 (Kriteria 4.1.1)',
    title: 'Pelaksanaan Pekerjaan Panas (Pengelasan Tangki) Tanpa SIKA dan JSA',
    conditionDescription: 'Pada tanggal 8 Oktober 2026 pukul 10.15 WITA di Bay 4 Heavy Equipment Workshop, terpantau 2 orang mekanik sedang mengelas bracket tangki bahan bakar pada unit Dozer D375 tanpa dilengkapi Formulir Surat Izin Kerja Panas (Hot Work Permit) dan tanpa dokumen JSA di lokasi kerja.',
    criteriaRequirement: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian IV.1.2 mensyaratkan setiap pekerjaan berisiko tinggi wajib memiliki izin kerja khusus dan JSA yang disetujui pengawas operasional.',
    objectiveEvidence: 'Foto pelaksanaan pengelasan tanpa permit, ketiadaan APAR 6 kg siap pakai di sekitar titik api, ketiadaan lembar SIKA di binder pengawas.',
    category: 'Major Nonconformity',
    riskLevel: 'Tinggi',
    status: 'In Progress',
    picId: 'user-op',
    picName: 'Bambang Kusuma, S.T. (Mine Supt)',
    departmentName: 'Mining Operations & Engineering',
    dueDate: '2026-10-25',
    createdBy: 'Ir. Hendra Wijaya, IPM',
    createdAt: '2026-10-08 11:00',
    
    // CAR
    rootCauseAnalysis: 'Kurangnya sosialisasi prosedur SIKA terbaru kepada mandor pihak ketiga (sub-kontraktor maintenance) serta ketiadaan audit kepatuhan harian oleh pengawas lapangan.',
    rcaMethod: '5-Why Analysis',
    immediateCorrection: 'Pekerjaan seketika disetop. Memasang barikade keselamatan, menyediakan APAR 9kg foam di lokasi, dan memanggil supervisor maintenance.',
    correctiveActionPlan: '1. Pelaksanaan refresher training Hot Work Permit & JSA untuk seluruh mekanik & welder.\n2. Penerapan sistem digital permit check di pintu gerbang workshop sebelum pekerjaan panas diizinkan.',
    preventiveMeasure: 'Inspeksi mingguan mandatori oleh Safety Officer khusus pekerjaan panas & ruang terbatas.',
    submissionDate: '2026-10-12'
  },
  {
    id: 'fnd-002',
    findingNumber: 'OFI-SMKP-2026-002',
    auditId: 'audit-001',
    auditNumber: 'AUD-SMKP-2026-001',
    standardType: 'SMKP Minerba',
    clauseOrElement: 'Elemen II.2 (Kriteria 2.2.1)',
    title: 'Pembaruan Dokumen Register Risiko IBPR untuk Operasi Penambangan Malam Hari',
    conditionDescription: 'Register risiko (IBPR) divisi penambangan terakhir ditinjau pada November 2024. Telah ada penambahan tower lighting otomatis baru tipe LED 4000W di area disposal timur yang belum dimasukkan dalam tabel evaluasi bahaya silau (glare) dan kabel tanah.',
    criteriaRequirement: 'Kepdirjen Minerba 185/2019 Elemen II.2: Manajemen risiko wajib ditinjau ulang secara berkala dan apabila terdapat modifikasi sarana prasarana baru.',
    objectiveEvidence: 'Dokumen Risk Register MINE-IBPR-2024 vs fisik unit tower lamp solar cell baru di disposal.',
    category: 'Opportunity for Improvement (OFI)',
    riskLevel: 'Sedang',
    status: 'Assigned',
    picId: 'user-op',
    picName: 'Bambang Kusuma, S.T.',
    departmentName: 'Mining Operations & Engineering',
    dueDate: '2026-11-05',
    createdBy: 'Agus Prasetyo, S.T.',
    createdAt: '2026-10-08 14:30'
  },
  {
    id: 'fnd-003',
    findingNumber: 'NC-ISO-2025-019',
    auditId: 'audit-002',
    auditNumber: 'AUD-INT-2025-004',
    standardType: 'ISO 14001',
    clauseOrElement: 'Klausul 8.1 (Pengendalian Operasional Lingkungan)',
    title: 'Pengikisan Tanggul Sediment Pond 04 Melebihi Batas Aman Bebas Limpas (Freeboard)',
    conditionDescription: 'Ketinggian freeboard pada kolam pengendapan sedimen (sediment pond 04) hanya tersisa 0.25 meter (standar minimum 0.50 meter). Terdapat sedimentasi lumpur tambang setinggi 65% kapasitas kolam.',
    criteriaRequirement: 'Klausul 8.1 ISO 14001 & Permen LHK: Sarana pengendali erosi tambang wajib dipelihara agar tidak meluap ke badan air penerima.',
    objectiveEvidence: 'Laporan pengukuran batimetri pond 04 dan foto kondisi lumpur sedimentasi.',
    category: 'Minor Nonconformity',
    riskLevel: 'Sedang',
    status: 'Closed',
    picId: 'user-op',
    picName: 'Bambang Kusuma, S.T.',
    departmentName: 'Mining Operations & Engineering',
    dueDate: '2026-08-15',
    createdBy: 'Citra Lestari, S.Si.',
    createdAt: '2026-07-20 09:00',
    rootCauseAnalysis: 'Curah hujan ekstrem bulan Juni melebihi curah hujan rencana 10 tahunan dan jadwal pengerukan (desilting) tertunda karena keterbatasan unit amphibious excavator.',
    rcaMethod: 'Fishbone Diagram',
    immediateCorrection: 'Mobilisasi 1 unit Long-Arm Excavator Komatsu PC300 untuk pengerukan darurat endapan lumpur.',
    correctiveActionPlan: 'Pengerukan menyeluruh kompartemen 1 & 2 serta penambahan batu belah rip-rap pada spillway kolam.',
    preventiveMeasure: 'Jadwal desilting rutin dialihkan dari triwulanan menjadi bulanan selama musim hujan.',
    evidenceFile: 'Laporan_Pengerukan_Sediment_Pond_04_Selesai.pdf',
    evidenceDescription: 'Berita acara penyelesaian pengerukan dan foto elevasi freeboard kembali ke 0.85 meter.',
    submissionDate: '2026-08-10',
    verifierName: 'Ir. Hendra Wijaya, IPM',
    verificationNotes: 'Telah diverifikasi di lapangan pada 12 Agustus 2026. Kolam pengendapan berfungsi optimal, kualitas air efluen pH 7.2 dan TSS 45 mg/L memenuhi baku mutu.',
    effectivenessResult: 'Efektif',
    closureDate: '2026-08-14'
  }
];

// INITIAL AUDIT LOGS
export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-17 07:12:05',
    userName: 'Ir. Hendra Wijaya, IPM',
    userRole: 'ADMIN',
    action: 'LOGIN',
    module: 'Autentikasi & Sesi',
    details: 'Pengguna berhasil masuk ke sistem ISMS melalui IP 10.24.1.88'
  },
  {
    id: 'log-002',
    timestamp: '2026-10-14 16:02:11',
    userName: 'Bambang Kusuma, S.T.',
    userRole: 'USER',
    action: 'DOCUMENT_SUBMIT',
    module: 'Database Dokumen',
    details: 'Mengajukan dokumen baru JSA-MINE-044 Penggantian Tyre Depan HD785 untuk proses review'
  },
  {
    id: 'log-003',
    timestamp: '2026-10-08 11:05:42',
    userName: 'Ir. Hendra Wijaya, IPM',
    userRole: 'ADMIN',
    action: 'AUDIT_FINDING_CREATED',
    module: 'Modul Temuan & CAR',
    details: 'Menerbitkan temuan Major Nonconformity NC-SMKP-2026-001 pengelasan tanpa SIKA'
  },
  {
    id: 'log-004',
    timestamp: '2026-10-06 09:32:00',
    userName: 'Ir. Hendra Wijaya, IPM',
    userRole: 'ADMIN',
    action: 'CHECKLIST_VERIFIED',
    module: 'Audit SMKP Minerba',
    details: 'Memverifikasi kriteria 1.1.1 Audit AUD-SMKP-2026-001 dengan status Compliant'
  }
];

// INITIAL NOTIFICATIONS
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Temuan Mayor Membutuhkan Tindakan (CAR)',
    message: 'Temuan NC-SMKP-2026-001 "Pengelasan Tangki Tanpa SIKA" jatuh tempo dalam 8 hari (25 Okt 2026).',
    type: 'danger',
    timestamp: '2026-10-17 07:00',
    isRead: false,
    linkModule: 'findings'
  },
  {
    id: 'notif-2',
    title: 'Dokumen Menunggu Review',
    message: 'Dokumen JSA-MINE-044 diajukan oleh Bambang Kusuma menunggu verifikasi SHE.',
    type: 'warning',
    timestamp: '2026-10-14 16:05',
    isRead: false,
    linkModule: 'documents'
  },
  {
    id: 'notif-3',
    title: 'Jadwal Audit Terintegrasi Mendatang',
    message: 'Audit Surveillance ISO Terintegrasi AUD-INT-2026-002 dijadwalkan mulai 10 November 2026.',
    type: 'info',
    timestamp: '2026-10-12 09:00',
    isRead: true,
    linkModule: 'audits'
  }
];
