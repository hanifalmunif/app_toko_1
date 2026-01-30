<?php
// backend/koneksi.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_tokokomputer";

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
  die(json_encode(["error" => "Koneksi Database Gagal"]));
}
