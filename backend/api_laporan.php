<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

// Ambil parameter tanggal dari URL
$tgl_mulai = isset($_GET['start']) ? $_GET['start'] . ' 00:00:00' : date('Y-m-d 00:00:00');
$tgl_akhir = isset($_GET['end']) ? $_GET['end'] . ' 23:59:59' : date('Y-m-d 23:59:59');
$tipe = isset($_GET['tipe']) ? $_GET['tipe'] : 'penjualan'; // 'penjualan' atau 'servis'

$data = [];

if ($tipe == 'penjualan') {
  // Ambil data dari tabel Transaksi Kasir
  $query = "SELECT * FROM transaksi 
              WHERE tgl_transaksi BETWEEN '$tgl_mulai' AND '$tgl_akhir' 
              ORDER BY tgl_transaksi DESC";
  $result = mysqli_query($koneksi, $query);
  while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
  }
} else {
  // Ambil data dari tabel Service (Hanya yang sudah Selesai/Diambil dan ada biayanya)
  $query = "SELECT * FROM service 
              WHERE (status='Selesai' OR status='Diambil') 
              AND biaya > 0
              AND tgl_masuk BETWEEN '$tgl_mulai' AND '$tgl_akhir' 
              ORDER BY tgl_masuk DESC";
  $result = mysqli_query($koneksi, $query);
  while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
  }
}

echo json_encode($data);
