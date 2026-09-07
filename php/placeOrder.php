<?php

// Load Midtrans library
require_once dirname(__FILE__) . '/midtrans-php-master/Midtrans.php';

// Load .env
$envPath = dirname(__DIR__) . '/.env';

if (!file_exists($envPath)) {
    die('File .env tidak ditemukan.');
}

$env = parse_ini_file($envPath);

if ($env === false || empty($env['MIDTRANS_SERVER_KEY'])) {
    die('MIDTRANS_SERVER_KEY belum dikonfigurasi.');
}

// Set Merchant Server Key
\Midtrans\Config::$serverKey = $env['MIDTRANS_SERVER_KEY'];

// Sandbox environment
\Midtrans\Config::$isProduction = false;

// Sanitization
\Midtrans\Config::$isSanitized = true;

// 3DS
\Midtrans\Config::$is3ds = true;

$params = array(
    'transaction_details' => array(
        'order_id' => rand(),
        'gross_amount' => $_POST['total'],
    ),
    'item_details' => json_decode($_POST['items'], true),
    'customer_details' => array(
        'first_name' => $_POST['name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
    ),
);

$snapToken = \Midtrans\Snap::getSnapToken($params);

echo $snapToken;