db.movies.deleteMany({});

db.movies.insertMany([
  {
    title: "Avengers: Endgame",
    description: "Biet doi Avengers tap hop lan cuoi cung de dao nguoc hau qua cua cu snap.",
    duration: 181,
    genre: "Action",
    posterUrl: "https://i1-giaitri.vnecdn.net/2024/05/31/an-khach-1-1717144337.jpg?w=1200&h=0&q=100&dpr=2&fit=crop&s=3LylafZkEcpfH4k0vBPx9A"
  },
  {
    title: "Inception",
    description: "Mot nhom dao trom tham nhap vao giac mo de gieo y tuong vao tiem thuc.",
    duration: 148,
    genre: "Sci-Fi",
    posterUrl: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482763Iqn/anh-mo-ta.png"
  },
  {
    title: "Interstellar",
    description: "Cuoc hanh trinh xuyen khong gian tim kiem noi song moi cho nhan loai.",
    duration: 169,
    genre: "Sci-Fi",
    posterUrl: "https://thanhnien.mediacdn.vn/uploaded/ngocthanh/2020_12_10/da-02_GRXB.jpg?width=500"
  },
  {
    title: "The Dark Knight",
    description: "Batman doi dau Joker trong tran chien giua hon loan va cong ly.",
    duration: 152,
    genre: "Action",
    posterUrl: "https://i1-giaitri.vnecdn.net/2025/08/31/mua-do-top-1-1756596974-4686-1756597005.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=knq9XvXk_HwfOaH6UjSofg"
  },
  {
    title: "Parasite",
    description: "Hai gia dinh o hai tang lop xa hoi cuon vao mot cau chuyen day bat ngo.",
    duration: 132,
    genre: "Thriller",
    posterUrl: "https://thanhnien.mediacdn.vn/Uploaded/minhnguyet/2022_05_23/phim-truyen-hinh-6502.jpg"
  }
]);
