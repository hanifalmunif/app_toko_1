<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

// 1. GET DATA
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
  $data = [];

  // Hapus Data
  if (isset($_GET['action']) && $_GET['action'] == 'delete') {
    $id = $_GET['id'];
    mysqli_query($koneksi, "DELETE FROM kwitansi WHERE id='$id'");
    echo json_encode(["success" => true]);
    exit;
  }

  // Ambil Riwayat
  $q = mysqli_query($koneksi, "SELECT * FROM kwitansi ORDER BY id DESC LIMIT 10");
  while ($row = mysqli_fetch_assoc($q)) {
    $data[] = $row;
  }

  // Ambil Profil Sekolah
  $qProfil = mysqli_query($koneksi, "SELECT * FROM profil_sekolah WHERE id=1");
  $profil = mysqli_fetch_assoc($qProfil);

  echo json_encode(["riwayat" => $data, "profil" => $profil]);
  exit;
}

// 2. SIMPAN DATA
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);

  // Update Profil Sekolah
  if (isset($input['action']) && $input['action'] == 'update_profil') {
    $yayasan = $input['yayasan'];
    $sekolah = $input['nama_sekolah'];
    $alamat  = $input['alamat'];

    $q = "UPDATE profil_sekolah SET yayasan='$yayasan', nama_sekolah='$sekolah', alamat='$alamat' WHERE id=1";
    if (mysqli_query($koneksi, $q)) {
      echo json_encode(["success" => true]);
    } else {
      echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
    }
    exit;
  }

  // Simpan Kwitansi Baru
  $prefix = "KW-" . date('ymd') . "-";
  $rand = rand(100, 999);
  $no_kwitansi = $prefix . $rand;

  $dari = $input['dari'];
  $kelas = $input['kelas']; // <--- Tambahan Kelas
  $untuk = $input['untuk'];
  $nominal = $input['nominal'];
  $tgl = date('Y-m-d H:i:s');

  if (!empty($input['tgl_manual'])) {
    $tgl = str_replace('T', ' ', $input['tgl_manual']);
  }

  $q = "INSERT INTO kwitansi (no_kwitansi, dari, kelas, untuk, nominal, tgl_kwitansi) 
          VALUES ('$no_kwitansi', '$dari', '$kelas', '$untuk', '$nominal', '$tgl')";

  if (mysqli_query($koneksi, $q)) {
    echo json_encode(["success" => true, "no_kwitansi" => $no_kwitansi, "tgl" => $tgl]);
  } else {
    echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
  }
}
