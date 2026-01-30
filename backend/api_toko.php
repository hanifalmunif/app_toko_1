<?php
// --- BAGIAN INI SANGAT PENTING (CORS HEADERS) ---
// Mengizinkan siapapun (termasuk React di port 5173) untuk mengakses file ini
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Jika browser hanya bertanya "Boleh masuk gak?" (Preflight Request), jawab BOLEH & berhenti.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}
// ------------------------------------------------

include 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. JIKA REACT MINTA DATA (GET)
if ($method == 'GET') {
  // Jika ada parameter ?action=delete&id=1, maka hapus
  if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $res = mysqli_query($koneksi, "DELETE FROM toko WHERE id=$id");
    echo json_encode(["success" => $res]);
    exit;
  }

  // Jika tidak, tampilkan semua data
  $result = mysqli_query($koneksi, "SELECT * FROM toko ORDER BY id DESC");
  $data = [];
  while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
  }
  echo json_encode($data);
}

// 2. JIKA REACT KIRIM DATA BARU (POST)
elseif ($method == 'POST') {
  // Baca data JSON yang dikirim React
  $input = json_decode(file_get_contents('php://input'), true);

  // Cegah error jika input kosong
  $nama = isset($input['nama']) ? $input['nama'] : '';
  $alamat = isset($input['alamat']) ? $input['alamat'] : '';
  $telp = isset($input['telp']) ? $input['telp'] : '';

  if ($nama && $alamat) {
    $query = "INSERT INTO toko (nama_toko, alamat, telp) VALUES ('$nama', '$alamat', '$telp')";
    $res = mysqli_query($koneksi, $query);

    if ($res) {
      echo json_encode(["message" => "Berhasil disimpan"]);
    } else {
      echo json_encode(["message" => "Gagal menyimpan"]);
    }
  } else {
    echo json_encode(["message" => "Data tidak lengkap"]);
  }
}
