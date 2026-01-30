<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

// 1. GET TOKO
if (isset($_GET['action']) && $_GET['action'] == 'get_toko') {
  $q = mysqli_query($koneksi, "SELECT * FROM toko LIMIT 1");
  $data = mysqli_fetch_assoc($q);
  // Jika kosong, kirim default agar frontend tidak error
  if (!$data) {
    $data = [
      'nama_toko' => 'NAMA TOKO ANDA',
      'alamat_toko' => 'Alamat Toko',
      'no_hp' => '-',
      'footer_struk' => 'Terima Kasih'
    ];
  }
  echo json_encode($data);
  exit;
}

// 2. SAVE TOKO
if (isset($_GET['action']) && $_GET['action'] == 'save_toko') {
  $input = json_decode(file_get_contents('php://input'), true);
  $nama = $input['nama_toko'];
  $alamat = $input['alamat_toko'];
  $hp = $input['no_hp'];
  $footer = $input['footer_struk'];

  $cek = mysqli_query($koneksi, "SELECT * FROM toko");
  if (mysqli_num_rows($cek) > 0) {
    mysqli_query($koneksi, "UPDATE toko SET nama_toko='$nama', alamat_toko='$alamat', no_hp='$hp', footer_struk='$footer'");
  } else {
    mysqli_query($koneksi, "INSERT INTO toko (nama_toko, alamat_toko, no_hp, footer_struk) VALUES ('$nama', '$alamat', '$hp', '$footer')");
  }
  echo json_encode(["success" => true]);
  exit;
}

// 3. DELETE
if (isset($_GET['action']) && $_GET['action'] == 'delete') {
  $no = $_GET['no_nota'];
  mysqli_query($koneksi, "DELETE FROM transaksi_detail WHERE no_nota='$no'");
  mysqli_query($koneksi, "DELETE FROM transaksi WHERE no_nota='$no'");
  echo json_encode(["success" => true]);
  exit;
}

// 4. POST TRANSAKSI (Perbaikan disini agar tidak Undefined Index)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);

  // Validasi data masuk
  if (!isset($input['id_pelanggan']) || !isset($input['nama_pelanggan'])) {
    echo json_encode(["success" => false, "message" => "Data tidak lengkap"]);
    exit;
  }

  $no_nota = "PLN-" . date('ymd') . rand(100, 999);

  // Handle Tanggal Manual
  $tgl = empty($input['tgl_manual']) ? date('Y-m-d H:i:s') : str_replace('T', ' ', $input['tgl_manual']);
  if (strlen($tgl) == 16) $tgl .= ":00";

  $total = $input['nominal'] + $input['admin'];

  // Rumus KWH Sederhana (Bisa disesuaikan)
  $kwh = number_format($input['nominal'] / 1352, 1, ',', '.');

  // Generate Token Acak
  $token = trim(chunk_split(substr(str_shuffle("01234567890123456789"), 0, 20), 4, ' '));

  // Simpan Detail lengkap untuk kebutuhan cetak ulang
  $detail = json_encode([
    "id" => $input['id_pelanggan'],
    "nama" => $input['nama_pelanggan'],
    "tarif" => $input['tarif'],
    "daya" => $input['daya'],
    "kwh" => $kwh,
    "token" => $token,
    "nominal_asli" => $input['nominal'],
    "admin_asli" => $input['admin']
  ]);

  mysqli_query($koneksi, "INSERT INTO transaksi (no_nota, tgl_transaksi, total_belanja, uang_bayar, kembalian) VALUES ('$no_nota', '$tgl', '$total', '$total', 0)");
  mysqli_query($koneksi, "INSERT INTO transaksi_detail (no_nota, nama_produk, harga_satuan, qty, subtotal) VALUES ('$no_nota', '$detail', '$total', 1, '$total')");

  // Ambil Data Toko untuk respon balik
  $qToko = mysqli_query($koneksi, "SELECT * FROM toko LIMIT 1");
  $toko = mysqli_fetch_assoc($qToko);

  echo json_encode([
    "success" => true,
    "data_cetak" => [
      "toko" => $toko, // Kirim data toko balik ke frontend
      "no_nota" => $no_nota,
      "tgl" => $tgl,
      "id_pel" => $input['id_pelanggan'],
      "nama" => $input['nama_pelanggan'],
      "tarif" => $input['tarif'],
      "daya" => $input['daya'],
      "nominal" => $input['nominal'],
      "total" => $total,
      "kwh" => $kwh,
      "token" => $token
    ]
  ]);
  exit;
}

// 5. GET RIWAYAT
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
  $data = [];
  $q = mysqli_query($koneksi, "SELECT t.*, td.nama_produk FROM transaksi t JOIN transaksi_detail td ON t.no_nota = td.no_nota WHERE t.no_nota LIKE 'PLN-%' ORDER BY t.tgl_transaksi DESC LIMIT 10");
  while ($row = mysqli_fetch_assoc($q)) {
    $data[] = $row;
  }
  echo json_encode($data);
  exit;
}
