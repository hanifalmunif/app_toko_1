<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  exit(0);
}

include 'koneksi.php';

// Buat folder uploads jika belum ada
$target_dir = "uploads/";
if (!file_exists($target_dir)) {
  mkdir($target_dir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: AMBIL DATA ATAU HAPUS DATA ---
if ($method == 'GET') {

  // 1. CEK APAKAH ADA ACTION DELETE? (INI YANG KITA TAMBAHKAN)
  if (isset($_GET['action']) && $_GET['action'] == 'delete') {
    $no_kwitansi = $_GET['no_kwitansi'];

    // Mencegah SQL Injection sederhana
    $no_kwitansi = mysqli_real_escape_string($koneksi, $no_kwitansi);

    // Hapus berdasarkan no_kwitansi
    $del = mysqli_query($koneksi, "DELETE FROM kwitansi WHERE no_kwitansi='$no_kwitansi'");

    if ($del) {
      echo json_encode(["success" => true, "message" => "Berhasil dihapus"]);
    } else {
      echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
    }
    exit; // PENTING: Berhenti di sini agar tidak lanjut meload data
  }

  // 2. JIKA TIDAK ADA ACTION, MAKA AMBIL DATA (LOAD DEFAULT)
  $response = [];

  // Ambil Profil
  $qProfil = mysqli_query($koneksi, "SELECT * FROM profil_sekolah WHERE id=1");
  $response['profil'] = mysqli_fetch_assoc($qProfil);

  // Ambil Riwayat (50 Terakhir)
  $qRiwayat = mysqli_query($koneksi, "SELECT * FROM kwitansi ORDER BY id DESC LIMIT 50");
  $data = [];
  while ($row = mysqli_fetch_assoc($qRiwayat)) {
    $data[] = $row;
  }
  $response['riwayat'] = $data;

  echo json_encode($response);
  exit;
}

// --- POST: SIMPAN DATA ---
if ($method == 'POST') {

  // Cek apakah ini Update Profil (FormData) atau Simpan Kwitansi (JSON)
  $action = isset($_POST['action']) ? $_POST['action'] : '';

  // 1. UPDATE PROFIL & UPLOAD LOGO
  if ($action == 'update_profil') {
    $yayasan = $_POST['yayasan'];
    $nama_sekolah = $_POST['nama_sekolah'];
    $alamat = $_POST['alamat'];

    // Default query tanpa ganti logo
    $query = "UPDATE profil_sekolah SET yayasan='$yayasan', nama_sekolah='$nama_sekolah', alamat='$alamat' WHERE id=1";

    // Cek jika ada file gambar diupload
    if (isset($_FILES['logo_img']) && $_FILES['logo_img']['error'] == 0) {
      $fileName = time() . '_' . basename($_FILES["logo_img"]["name"]);
      $targetFilePath = $target_dir . $fileName;
      $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

      $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
      if (in_array($fileType, $allowTypes)) {
        if (move_uploaded_file($_FILES["logo_img"]["tmp_name"], $targetFilePath)) {
          // Update query dengan logo baru
          $query = "UPDATE profil_sekolah SET yayasan='$yayasan', nama_sekolah='$nama_sekolah', alamat='$alamat', logo='$fileName' WHERE id=1";
        }
      }
    }

    if (mysqli_query($koneksi, $query)) {
      echo json_encode(["success" => true, "message" => "Profil berhasil diupdate"]);
    } else {
      echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
    }
  }

  // 2. SIMPAN KWITANSI BARU (JSON)
  else {
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['dari'])) {
      $dari = $input['dari'];
      $untuk = $input['untuk'];
      $nominal = $input['nominal'];
      $tgl = date('Y-m-d H:i:s');

      // Insert dulu untuk dapat ID
      $ins = mysqli_query($koneksi, "INSERT INTO kwitansi (dari, untuk, nominal, tgl_kwitansi) VALUES ('$dari', '$untuk', '$nominal', '$tgl')");

      if ($ins) {
        $last_id = mysqli_insert_id($koneksi);
        // Generate Nomor: KW-[TAHUN]-[ID 5 DIGIT] -> KW-2024-00001
        $no_kwitansi = "KW-" . date("Y") . "-" . str_pad($last_id, 5, "0", STR_PAD_LEFT);

        // Update nomor kwitansi
        mysqli_query($koneksi, "UPDATE kwitansi SET no_kwitansi='$no_kwitansi' WHERE id=$last_id");

        echo json_encode(["success" => true, "no_kwitansi" => $no_kwitansi, "tgl" => $tgl]);
      } else {
        echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
      }
    }
  }
}
