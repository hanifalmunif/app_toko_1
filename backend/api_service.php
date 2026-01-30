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
  // Hapus Data
  if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    mysqli_query($koneksi, "DELETE FROM service WHERE id=$id");
    echo json_encode(["success" => true]);
    exit;
  }

  // Ambil Semua Data (Urutkan dari yang terbaru)
  $result = mysqli_query($koneksi, "SELECT * FROM service ORDER BY id DESC");
  $data = [];
  while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
  }
  echo json_encode($data);
}

// 2. SIMPAN DATA BARU / UPDATE STATUS (POST)
// ... (bagian atas tetap sama)

// 2. SIMPAN DATA BARU / UPDATE STATUS (POST)
elseif ($method == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);

  if (isset($input['id'])) {
    // --- UPDATE STATUS & BIAYA ---
    $id = $input['id'];
    $status = $input['status'];
    $biaya = $input['biaya'];

    $query = "UPDATE service SET status='$status', biaya='$biaya' WHERE id=$id";
    mysqli_query($koneksi, $query);
    echo json_encode(["message" => "Status berhasil diupdate"]);
  } else {
    // --- INPUT SERVIS BARU ---
    $nama = $input['nama_pelanggan'];
    $telp = $input['no_telp'];
    $barang = $input['nama_barang'];
    $keluhan = $input['keluhan'];

    // Ambil tanggal dari input, kalau kosong pakai waktu sekarang
    $tgl = isset($input['tgl_masuk']) && $input['tgl_masuk'] != ''
      ? $input['tgl_masuk']
      : date('Y-m-d H:i:s');

    $query = "INSERT INTO service (tgl_masuk, nama_pelanggan, no_telp, nama_barang, keluhan) 
                VALUES ('$tgl', '$nama', '$telp', '$barang', '$keluhan')";

    if (mysqli_query($koneksi, $query)) {
      echo json_encode(["message" => "Servis masuk berhasil dicatat"]);
    } else {
      echo json_encode(["message" => "Gagal: " . mysqli_error($koneksi)]);
    }
  }
}
