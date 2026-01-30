<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'koneksi.php';

// Terima Data JSON dari React
$input = file_get_contents("php://input");
$data = json_decode($input);

if (!$data) {
  echo json_encode(["success" => false, "message" => "Data kosong"]);
  exit;
}

// 1. Ambil data dari JSON (Sesuai nama di React)
$id       = $data->id;
$nama     = $data->nama;      // Dari React: formData.nama
$merk     = $data->merk;
$kategori = $data->kategori;
$modal    = $data->modal;
$harga    = $data->harga;
$stok     = $data->stok;
$satuan   = $data->satuan;

// 2. QUERY UPDATE (Sesuaikan bagian KIRI dengan Nama Kolom di Database kamu)
// Asumsi: Nama kolom di tabel database kamu adalah:
// id, nama_produk, merk, kategori, harga_modal, harga, stok, satuan
// JIKA NAMA KOLOM BEDA, GANTI YANG SEBELAH KIRI TANDA SAMA DENGAN (=)

$query = "UPDATE produk SET 
            nama_produk = '$nama', 
            merk        = '$merk',
            kategori    = '$kategori',
            modal       = '$modal',    
            harga       = '$harga',
            stok        = '$stok',
            satuan      = '$satuan'
          WHERE id = '$id'";

// --- CATATAN PENTING ---
// Jika di database kolom kamu namanya 'harga_beli' (bukan modal), ubah jadi:
// harga_beli = '$modal'

$result = mysqli_query($koneksi, $query);

if ($result) {
  echo json_encode(["success" => true, "message" => "Update Berhasil"]);
} else {
  // Tampilkan error asli MySQL biar ketahuan salahnya dimana
  echo json_encode(["success" => false, "message" => "Error SQL: " . mysqli_error($koneksi)]);
}
