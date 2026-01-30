<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'koneksi.php';

$today = date('Y-m-d');

// 1. Hitung Omzet Penjualan HARI INI
$queryOmzet = mysqli_query($koneksi, "SELECT SUM(total_belanja) as total FROM transaksi WHERE DATE(tgl_transaksi) = '$today'");
$dataOmzet = mysqli_fetch_assoc($queryOmzet);
$omzetHariIni = $dataOmzet['total'] ? $dataOmzet['total'] : 0;

// 2. Hitung Jumlah Servis yang BELUM Selesai (Masuk/Proses/Nunggu Part)
$queryServis = mysqli_query($koneksi, "SELECT COUNT(*) as total FROM service WHERE status IN ('Masuk', 'Proses', 'Menunggu Sparepart')");
$dataServis = mysqli_fetch_assoc($queryServis);
$servisAktif = $dataServis['total'];

// 3. Hitung Produk yang Stoknya KRITIS (<= 3)
$queryStok = mysqli_query($koneksi, "SELECT COUNT(*) as total FROM produk WHERE stok <= 3");
$dataStok = mysqli_fetch_assoc($queryStok);
$stokKritis = $dataStok['total'];

// 4. Ambil 5 Transaksi Terakhir
$recentTrx = [];
$qTrx = mysqli_query($koneksi, "SELECT * FROM transaksi ORDER BY tgl_transaksi DESC LIMIT 5");
while ($row = mysqli_fetch_assoc($qTrx)) {
  $recentTrx[] = $row;
}

// 5. Ambil 5 Produk dengan Stok Paling Sedikit (Untuk ditampilkan detailnya)
$lowStockItems = [];
$qLow = mysqli_query($koneksi, "SELECT * FROM produk WHERE stok <= 3 ORDER BY stok ASC LIMIT 5");
while ($row = mysqli_fetch_assoc($qLow)) {
  $lowStockItems[] = $row;
}

echo json_encode([
  "omzet_hari_ini" => $omzetHariIni,
  "servis_aktif" => $servisAktif,
  "jumlah_stok_kritis" => $stokKritis,
  "transaksi_terbaru" => $recentTrx,
  "barang_habis" => $lowStockItems
]);
