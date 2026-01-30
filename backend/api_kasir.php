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

if ($method == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);

  // 1. Generate No Nota Unik
  $no_nota = "TRX-" . date('ymd') . rand(100, 999);

  // 2. Ambil Tanggal Manual
  // Jika user kirim tanggal, pakai itu + jam sekarang. Jika tidak, pakai waktu server.
  $tgl = isset($input['tanggal']) && $input['tanggal'] != ''
    ? $input['tanggal'] . ' ' . date('H:i:s')
    : date('Y-m-d H:i:s');

  $total = $input['total'];
  $bayar = $input['bayar'];
  $kembalian = $input['kembalian'];
  $keranjang = $input['keranjang'];

  // 3. Simpan Header Transaksi
  $query = "INSERT INTO transaksi (no_nota, tgl_transaksi, total_belanja, uang_bayar, kembalian) 
              VALUES ('$no_nota', '$tgl', '$total', '$bayar', '$kembalian')";

  if (mysqli_query($koneksi, $query)) {

    // 4. Loop Keranjang: Simpan Detail & Kurangi Stok
    foreach ($keranjang as $item) {
      $id_produk = $item['id'];
      $nama = $item['nama_produk'];
      $harga = $item['harga'];
      $qty = $item['qty'];
      $subtotal = $harga * $qty;

      // Simpan detail
      mysqli_query($koneksi, "INSERT INTO transaksi_detail (no_nota, nama_produk, harga_satuan, qty, subtotal) 
                                    VALUES ('$no_nota', '$nama', '$harga', '$qty', '$subtotal')");

      // POTONG STOK OTOMATIS
      mysqli_query($koneksi, "UPDATE produk SET stok = stok - $qty WHERE id = $id_produk");
    }

    echo json_encode(["message" => "Transaksi Sukses", "no_nota" => $no_nota]);
  } else {
    echo json_encode(["message" => "Gagal: " . mysqli_error($koneksi)]);
  }
}
