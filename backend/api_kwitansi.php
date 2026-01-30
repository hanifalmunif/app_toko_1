<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request (CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  exit(0);
}

include 'koneksi.php';

// Cek folder uploads, jika belum ada buat folder
$target_dir = "uploads/";
if (!file_exists($target_dir)) {
  mkdir($target_dir, 0777, true);
}

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: AMBIL DATA RIWAYAT & PROFIL ---
if ($method == 'GET') {
  $response = [];

  // 1. Ambil Profil Sekolah
  $qProfil = mysqli_query($koneksi, "SELECT * FROM profil_sekolah WHERE id=1 LIMIT 1");
  $profil = mysqli_fetch_assoc($qProfil);
  $response['profil'] = $profil;

  // 2. Ambil Riwayat Kwitansi (50 Terakhir)
  $qRiwayat = mysqli_query($koneksi, "SELECT * FROM kwitansi ORDER BY id DESC LIMIT 50");
  $riwayat = [];
  while ($row = mysqli_fetch_assoc($qRiwayat)) {
    $riwayat[] = $row;
  }
  $response['riwayat'] = $riwayat;

  echo json_encode($response);
  exit;
}

// --- POST: SIMPAN KWITANSI ATAU UPDATE PROFIL ---
if ($method == 'POST') {

  // Cek apakah request berupa FormData (ada $_POST['action']) atau JSON Raw Body
  $inputJSON = json_decode(file_get_contents("php://input"), true);

  // VARIABEL UNTUK MENAMPUNG INPUT
  $action = '';

  if (isset($_POST['action'])) {
    $action = $_POST['action']; // Dari FormData (Upload Profil)
  } elseif (isset($inputJSON['dari'])) {
    $action = 'simpan_kwitansi'; // Dari JSON (Simpan Transaksi)
  }

  // --- LOGIKA 1: UPDATE PROFIL & UPLOAD LOGO ---
  if ($action == 'update_profil') {
    $yayasan = $_POST['yayasan'];
    $nama_sekolah = $_POST['nama_sekolah'];
    $alamat = $_POST['alamat'];

    // Default Query Update (Tanpa Logo)
    $query = "UPDATE profil_sekolah SET yayasan='$yayasan', nama_sekolah='$nama_sekolah', alamat='$alamat' WHERE id=1";

    // Cek apakah ada file gambar diupload
    if (isset($_FILES['logo_img']) && $_FILES['logo_img']['error'] == 0) {
      $fileName = time() . '_' . basename($_FILES["logo_img"]["name"]);
      $targetFilePath = $target_dir . $fileName;
      $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

      // Validasi ekstensi
      $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
      if (in_array($fileType, $allowTypes)) {
        // Upload file ke server
        if (move_uploaded_file($_FILES["logo_img"]["tmp_name"], $targetFilePath)) {
          // Update Query Include Logo
          $query = "UPDATE profil_sekolah SET yayasan='$yayasan', nama_sekolah='$nama_sekolah', alamat='$alamat', logo='$fileName' WHERE id=1";
        }
      }
    }

    if (mysqli_query($koneksi, $query)) {
      echo json_encode(["success" => true, "message" => "Profil update"]);
    } else {
      echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
    }
  }

  // --- LOGIKA 2: SIMPAN TRANSAKSI KWITANSI BARU (TANPA KELAS) ---
  else {
    // Ambil data dari JSON input
    $dari = $inputJSON['dari'];
    $untuk = $inputJSON['untuk'];
    $nominal = $inputJSON['nominal'];
    $tglManual = isset($inputJSON['tglManual']) ? $inputJSON['tglManual'] : date('Y-m-d H:i:s');

    // Generate Nomor Kwitansi Otomatis (Contoh: KW-231025-001)
    // Format: KW-[TAHUN][BULAN][TANGGAL]-[ID_AUTO]
    // Karena ID belum tau sebelum insert, kita insert dulu atau pakai timestamp

    // Cara simpel: Generate dulu string unik
    $prefix = "KW-" . date("ymd");

    // Cek urutan terakhir hari ini (Opsional, agar rapi)
    // Disini kita pakai ID insert terakhir nanti untuk update nomornya agar urut

    $queryInsert = "INSERT INTO kwitansi (dari, untuk, nominal, tgl_kwitansi) VALUES ('$dari', '$untuk', '$nominal', '$tglManual')";

    if (mysqli_query($koneksi, $queryInsert)) {
      $last_id = mysqli_insert_id($koneksi);

      // Format Nomor: KW + ID (Dipad 5 digit) -> KW-00001
      $no_kwitansi = "KW-" . date("Y") . "-" . str_pad($last_id, 5, "0", STR_PAD_LEFT);

      // Update nomor kwitansi ke database
      mysqli_query($koneksi, "UPDATE kwitansi SET no_kwitansi='$no_kwitansi' WHERE id='$last_id'");

      echo json_encode([
        "success" => true,
        "no_kwitansi" => $no_kwitansi,
        "tgl" => $tglManual
      ]);
    } else {
      echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
    }
  }
}
