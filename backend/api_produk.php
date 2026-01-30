<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. AMBIL DATA (GET)
if ($method == 'GET') {
  if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $res = mysqli_query($koneksi, "DELETE FROM produk WHERE id=$id");
    echo json_encode(["success" => $res]);
    exit;
  }

  $result = mysqli_query($koneksi, "SELECT * FROM produk ORDER BY id DESC");
  $data = [];
  while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
  }
  echo json_encode($data);
}

// 2. SIMPAN DATA LENGKAP (POST)
elseif ($method == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);

  $nama     = $input['nama'] ?? '';
  $merk     = $input['merk'] ?? '-';     // Baru
  $kategori = $input['kategori'] ?? 'Aksesoris';
  $modal    = $input['modal'] ?? 0;      // Baru
  $harga    = $input['harga'] ?? 0;
  $stok     = $input['stok'] ?? 0;
  $satuan   = $input['satuan'] ?? 'Unit'; // Baru

  if ($nama && $harga) {
    $query = "INSERT INTO produk (nama_produk, merk, kategori, modal, harga, stok, satuan) 
                  VALUES ('$nama', '$merk', '$kategori', '$modal', '$harga', '$stok', '$satuan')";

    $res = mysqli_query($koneksi, $query);

    if ($res) {
      echo json_encode(["message" => "Berhasil disimpan"]);
    } else {
      // Tampilkan error jika SQL gagal (berguna untuk debugging)
      echo json_encode(["message" => "Gagal: " . mysqli_error($koneksi)]);
    }
  }
}
