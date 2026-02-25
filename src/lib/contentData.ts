export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  category: "Kelas 10" | "Kelas 11" | "Kelas 12";
  heroImage: string;
  description: string;
  fullContent?: string; // Markdown or HTML string
  status: "Draft" | "Published";
  updatedAt: string;
  timeline?: TimelineItem[];
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export const contentData: ContentItem[] = [
  // Kelas 10
  {
    id: "10-1",
    slug: "konsep-sejarah",
    title: "Konsep Dasar Sejarah",
    category: "Kelas 10",
    heroImage: "/images/hero-konsep.jpg",
    description: "Memahami pengertian sejarah, konsep ruang dan waktu, serta cara berpikir diakronik dan sinkronik.",
    status: "Published",
    updatedAt: "2024-03-10",
  },
  {
    id: "10-2",
    slug: "zaman-praaksara",
    title: "Kehidupan Zaman Praaksara",
    category: "Kelas 10",
    heroImage: "/images/hero-praaksara.jpg",
    description: "Menelusuri jejak kehidupan manusia purba di Indonesia dan hasil kebudayaannya.",
    status: "Published",
    updatedAt: "2024-03-11",
  },
  {
    id: "10-3",
    slug: "kerajaan-hindu-buddha",
    title: "Kerajaan Hindu-Buddha",
    category: "Kelas 10",
    heroImage: "/images/hero-hindu-buddha.jpg",
    description: "Perkembangan kerajaan-kerajaan bercorak Hindu-Buddha dan warisannya di Nusantara.",
    status: "Published",
    updatedAt: "2024-03-12",
  },
  {
    id: "10-4",
    slug: "kerajaan-islam",
    title: "Kerajaan Islam",
    category: "Kelas 10",
    heroImage: "/images/hero-islam.jpg",
    description: "Masuknya Islam dan berdirinya kesultanan-kesultanan di berbagai wilayah Indonesia.",
    status: "Published",
    updatedAt: "2024-03-13",
  },

  // Kelas 11
  {
    id: "11-1",
    slug: "kolonialisme-imperialisme",
    title: "Kolonialisme & Imperialisme",
    category: "Kelas 11",
    heroImage: "/images/hero-kolonial.jpg",
    description: "Dampak kedatangan bangsa Eropa dan praktik kolonialisme di Indonesia.",
    status: "Published",
    updatedAt: "2024-03-14",
  },
  {
    id: "11-2",
    slug: "pergerakan-nasional",
    title: "Pergerakan Nasional",
    category: "Kelas 11",
    heroImage: "/images/hero-pergerakan.jpg",
    description: "Bangkitnya kesadaran nasional dan lahirnya organisasi-organisasi pergerakan.",
    status: "Published",
    updatedAt: "2024-03-15",
  },
  {
    id: "11-3",
    slug: "pendudukan-jepang",
    title: "Pendudukan Jepang",
    category: "Kelas 11",
    heroImage: "/images/hero-jepang.jpg",
    description: "Masa pendudukan Jepang dan dampaknya terhadap persiapan kemerdekaan.",
    status: "Published",
    updatedAt: "2024-03-16",
  },
  {
    id: "11-4",
    slug: "proklamasi-kemerdekaan",
    title: "Proklamasi Kemerdekaan",
    category: "Kelas 11",
    heroImage: "/images/hero-proklamasi.jpg",
    description: "Detik-detik proklamasi kemerdekaan Indonesia dan peristiwa-peristiwa penting di sekitarnya.",
    status: "Published",
    updatedAt: "2024-03-17",
    fullContent: `
# Proklamasi Kemerdekaan Indonesia

Proklamasi Kemerdekaan Indonesia dilaksanakan pada hari Jumat, 17 Agustus 1945 tahun Masehi, atau tanggal 17 Agustus 2605 menurut tahun Jepang, yang dibacakan oleh Soekarno dengan didampingi oleh Mohammad Hatta di sebuah rumah hibah dari Faradj Martak di Jalan Pegangsaan Timur No. 56, Jakarta Pusat.

## Latar Belakang

Peristiwa ini diawali dengan dijatuhkannya bom atom oleh tentara Amerika Serikat di kota Hiroshima pada tanggal 6 Agustus 1945 dan Nagasaki pada tanggal 9 Agustus 1945. Hal ini menyebabkan Jepang menyerah tanpa syarat kepada Sekutu pada tanggal 14 Agustus 1945.

### Peristiwa Rengasdengklok

Golongan muda yang mengetahui kabar kekalahan Jepang mendesak Soekarno dan Hatta untuk segera memproklamasikan kemerdekaan. Namun, golongan tua menginginkan agar proklamasi dilakukan melalui PPKI. Perbedaan pendapat ini memicu peristiwa Rengasdengklok, di mana Soekarno dan Hatta "diamankan" oleh golongan muda ke Rengasdengklok, Karawang.

## Detik-Detik Proklamasi

Pada pagi hari 17 Agustus 1945, di kediaman Soekarno, Jalan Pegangsaan Timur 56 telah hadir antara lain Soewirjo, Wilopo, Gafar Pringgodigdo, Tabrani dan Trimurti. Acara dimulai pada pukul 10.00 dengan pembacaan teks Proklamasi oleh Soekarno dan disambung pidato singkat tanpa teks. Kemudian bendera Merah Putih, yang telah dijahit oleh Ibu Fatmawati, dikibarkan, disusul dengan sambutan oleh Soewirjo, wakil walikota Jakarta saat itu dan Moewardi, pimpinan Barisan Pelopor.

> "Kami bangsa Indonesia dengan ini menyatakan kemerdekaan Indonesia. Hal-hal yang mengenai pemindahan kekuasaan dan lain-lain diselenggarakan dengan cara saksama dan dalam tempo yang sesingkat-singkatnya."
    `,
    timeline: [
      { year: "1945", title: "Proklamasi Kemerdekaan", description: "17 Agustus 1945" },
      { year: "1945", title: "Sidang PPKI I", description: "18 Agustus 1945 - Pengesahan UUD 1945" },
      { year: "1945", title: "Sidang PPKI II", description: "19 Agustus 1945 - Pembentukan Kementerian" },
      { year: "1945", title: "Pembentukan BKR", description: "22 Agustus 1945" },
      { year: "1945", title: "Rapat Raksasa IKADA", description: "19 September 1945" },
    ]
  },

  // Kelas 12
  {
    id: "12-1",
    slug: "perjuangan-mempertahankan-kemerdekaan",
    title: "Perjuangan Mempertahankan Kemerdekaan",
    category: "Kelas 12",
    heroImage: "/images/hero-perjuangan.jpg",
    description: "Upaya diplomasi dan perlawanan fisik dalam mempertahankan kemerdekaan dari Agresi Militer Belanda.",
    status: "Published",
    updatedAt: "2024-03-18",
  },
  {
    id: "12-2",
    slug: "demokrasi-liberal-terpimpin",
    title: "Demokrasi Liberal & Terpimpin",
    category: "Kelas 12",
    heroImage: "/images/hero-demokrasi.jpg",
    description: "Dinamika politik Indonesia pada masa Demokrasi Liberal dan Demokrasi Terpimpin.",
    status: "Published",
    updatedAt: "2024-03-19",
  },
  {
    id: "12-3",
    slug: "orde-baru",
    title: "Orde Baru",
    category: "Kelas 12",
    heroImage: "/images/hero-orba.jpg",
    description: "Masa pemerintahan Orde Baru di bawah kepemimpinan Presiden Soeharto.",
    status: "Published",
    updatedAt: "2024-03-20",
  },
  {
    id: "12-4",
    slug: "reformasi",
    title: "Reformasi",
    category: "Kelas 12",
    heroImage: "/images/hero-reformasi.jpg",
    description: "Gerakan Reformasi 1998 dan perkembangan politik Indonesia pasca-Orde Baru.",
    status: "Published",
    updatedAt: "2024-03-21",
  },
];
