<?php
// Izinkan download
header("Access-Control-Allow-Origin: *");
if (isset($_GET['action']) && $_GET['action'] == 'download') {
  include 'koneksi.php';

  $tables = array();
  $result = mysqli_query($koneksi, "SHOW TABLES");
  while ($row = mysqli_fetch_row($result)) {
    $tables[] = $row[0];
  }

  $sqlScript = "";
  foreach ($tables as $table) {
    // Struktur Tabel
    $result = mysqli_query($koneksi, "SHOW CREATE TABLE $table");
    $row = mysqli_fetch_row($result);
    $sqlScript .= "\n\n" . $row[1] . ";\n\n";

    // Isi Data
    $result = mysqli_query($koneksi, "SELECT * FROM $table");
    $columnCount = mysqli_num_fields($result);

    for ($i = 0; $i < $columnCount; $i++) {
      while ($row = mysqli_fetch_row($result)) {
        $sqlScript .= "INSERT INTO $table VALUES(";
        for ($j = 0; $j < $columnCount; $j++) {
          $row[$j] = $row[$j];
          if (isset($row[$j])) {
            $sqlScript .= '"' . mysqli_real_escape_string($koneksi, $row[$j]) . '"';
          } else {
            $sqlScript .= '""';
          }
          if ($j < ($columnCount - 1)) {
            $sqlScript .= ',';
          }
        }
        $sqlScript .= ");\n";
      }
    }
    $sqlScript .= "\n";
  }

  $filename = 'backup_toko_' . date('Y-m-d_His') . '.sql';

  header('Content-Type: application/octet-stream');
  header('Content-Disposition: attachment; filename=' . $filename);
  echo $sqlScript;
  exit;
}
