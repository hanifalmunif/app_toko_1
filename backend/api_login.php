<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $input = json_decode(file_get_contents('php://input'), true);
  $username = mysqli_real_escape_string($koneksi, $input['username']);
  $password = md5($input['password']); // Enkripsi input dengan MD5 biar cocok dengan database

  $query = "SELECT * FROM pengguna WHERE username='$username' AND password='$password'";
  $result = mysqli_query($koneksi, $query);

  if (mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);
    echo json_encode([
      "success" => true,
      "message" => "Login Berhasil",
      "data" => [
        "id" => $user['id'],
        "nama" => $user['nama_lengkap'],
        "username" => $user['username']
      ]
    ]);
  } else {
    echo json_encode([
      "success" => false,
      "message" => "Username atau Password Salah!"
    ]);
  }
}
