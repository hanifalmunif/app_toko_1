<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

// --- 1. AMBIL DATA (GET) ---
if ($method == 'GET') {

  // A. HAPUS DATA
  if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $query = "DELETE FROM service WHERE id=$id";
    if (mysqli_query($koneksi, $query)) {
      echo json_encode(["success" => true, "message" => "Data berhasil dihapus"]);
    } else {
      echo json_encode(["success" => false, "message" => "Gagal: " . mysqli_error($koneksi)]);
    }
    exit;
  }

  // B. AMBIL DATA SERVICE (JOIN DENGAN TABEL TOKO)
  // Kita ambil nama, alamat, dan telp toko agar nota bisa dinamis
  $queryService = "
        SELECT service.*, 
               toko.nama_toko, 
               toko.alamat AS alamat_toko, 
               toko.no_telp AS telp_toko,
               toko.footer_struk
        FROM service 
        LEFT JOIN toko ON service.toko_id = toko.id 
        ORDER BY service.id DESC
    ";

  $result = mysqli_query($koneksi, $queryService);
  $services = [];
  if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
      $services[] = $row;
    }
  }

  // C. AMBIL DATA TOKO (UNTUK DROPDOWN)
  // Sesuai gambar tabel kamu: id, nama_toko
  $queryToko = mysqli_query($koneksi, "SELECT * FROM toko ORDER BY nama_toko ASC");
  $stores = [];
  if ($queryToko) {
    while ($row = mysqli_fetch_assoc($queryToko)) {
      $stores[] = $row;
    }
  }

  // Kirim Data
  echo json_encode([
    "success"  => true,
    "services" => $services,
    "stores"   => $stores
  ]);
}

// --- 2. SIMPAN / UPDATE DATA (POST) ---
elseif ($method == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);

  if (isset($input['id'])) {
    // --- UPDATE STATUS & BIAYA ---
    $id = intval($input['id']);
    $status = mysqli_real_escape_string($koneksi, $input['status']);
    $biaya = intval($input['biaya']);

    $query = "UPDATE service SET status='$status', biaya='$biaya' WHERE id=$id";

    if (mysqli_query($koneksi, $query)) {
      echo json_encode(["success" => true, "message" => "Status berhasil diupdate"]);
    } else {
      echo json_encode(["success" => false, "message" => "Gagal update: " . mysqli_error($koneksi)]);
    }
  } else {
    // --- INPUT SERVIS BARU ---
    $nama = mysqli_real_escape_string($koneksi, $input['nama_pelanggan']);
    $telp = mysqli_real_escape_string($koneksi, $input['no_telp']);
    $barang = mysqli_real_escape_string($koneksi, $input['nama_barang']);
    $keluhan = mysqli_real_escape_string($koneksi, $input['keluhan']);

    // Simpan ID Toko yang dipilih
    $toko_id = isset($input['toko_id']) ? intval($input['toko_id']) : 0;

    $status = "Masuk";
    $biaya = 0;
    $tgl = (isset($input['tgl_masuk']) && $input['tgl_masuk'] != '')
      ? mysqli_real_escape_string($koneksi, $input['tgl_masuk'])
      : date('Y-m-d');

    $query = "INSERT INTO service (tgl_masuk, toko_id, nama_pelanggan, no_telp, nama_barang, keluhan, status, biaya) 
                  VALUES ('$tgl', '$toko_id', '$nama', '$telp', '$barang', '$keluhan', '$status', '$biaya')";

    if (mysqli_query($koneksi, $query)) {
      echo json_encode(["success" => true, "message" => "Servis berhasil disimpan"]);
    } else {
      echo json_encode(["success" => false, "message" => "Gagal simpan: " . mysqli_error($koneksi)]);
    }
  }
}
