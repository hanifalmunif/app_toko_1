<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

if (isset($_FILES['file_sql'])) {
  $file = $_FILES['file_sql']['tmp_name'];

  // Baca isi file
  $sqlContent = file_get_contents($file);

  // Pecah berdasarkan titik koma
  $queries = explode(';', $sqlContent);

  // Matikan check foreign key sementara biar tidak error urutan
  mysqli_query($koneksi, "SET FOREIGN_KEY_CHECKS = 0");

  foreach ($queries as $query) {
    $query = trim($query);
    if (!empty($query)) {
      // Hapus tabel jika ada di query create table
      if (strpos($query, 'CREATE TABLE') !== false) {
        $tableName =  explode('`', $query)[1];
        mysqli_query($koneksi, "DROP TABLE IF EXISTS $tableName");
      }
      mysqli_query($koneksi, $query);
    }
  }

  mysqli_query($koneksi, "SET FOREIGN_KEY_CHECKS = 1");

  echo json_encode(["message" => "Restore Berhasil! Silakan Refresh."]);
} else {
  echo json_encode(["message" => "File tidak ditemukan"]);
}
