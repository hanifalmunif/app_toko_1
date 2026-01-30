<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
  $result = mysqli_query($koneksi, "SELECT * FROM toko ORDER BY is_pusat DESC, id ASC");
  $data = [];
  while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
  }
  echo json_encode($data);
}

if ($method == 'POST') {
  $input = json_decode(file_get_contents("php://input"));

  $nama = $input->nama_toko;
  $alamat = $input->alamat;
  $telp = $input->no_telp;
  $footer = $input->footer_struk;

  if (isset($input->id) && $input->id != '') {
    // UPDATE
    $id = $input->id;
    $query = "UPDATE toko SET nama_toko='$nama', alamat='$alamat', no_telp='$telp', footer_struk='$footer' WHERE id='$id'";
  } else {
    // INSERT BARU
    $query = "INSERT INTO toko (nama_toko, alamat, no_telp, footer_struk) VALUES ('$nama', '$alamat', '$telp', '$footer')";
  }

  if (mysqli_query($koneksi, $query)) {
    echo json_encode(["success" => true]);
  } else {
    echo json_encode(["success" => false, "message" => mysqli_error($koneksi)]);
  }
}

if ($method == 'DELETE') {
  $id = $_GET['id'];
  mysqli_query($koneksi, "DELETE FROM toko WHERE id='$id'");
  echo json_encode(["success" => true]);
}
