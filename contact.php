<?php
/**
 * Karnegareh (کارنگاره) - اسکریپت ساده ارسال فرم تماس به ایمیل
 * ---------------------------------------------------------------
 * نحوه استفاده:
 *   1) ایمیل خود را در متغیر $to وارد کنید.
 *   2) در فایل HTML، مقدار action فرم را به "contact.php" تغییر دهید:
 *        <form class="card contact-form" action="contact.php" method="post" data-validate novalidate>
 *   3) فایل‌ها را روی هاستی که از PHP پشتیبانی می‌کند آپلود کنید.
 *
 * نکته: برخی هاست‌ها تابع mail() را غیرفعال کرده‌اند؛ در این صورت از
 * سرویس‌هایی مثل Formspree استفاده کنید (راهنما در فایل documentation).
 */

$to      = 'you@example.com';          // ← ایمیل خود را اینجا بنویسید
$siteName = 'وب‌سایت شخصی من';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

function clean($v) {
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', strip_tags($v ?? '')));
}

$name    = clean($_POST['name'] ?? '');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone   = clean($_POST['phone'] ?? '');
$subject = clean($_POST['subject'] ?? 'پیام جدید از وب‌سایت');
$message = trim(strip_tags($_POST['message'] ?? $_POST['comment'] ?? ''));

// فیلد مخفی ضد اسپم (اختیاری): <input type="text" name="website" style="display:none">
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

if ($name === '' || !$email || mb_strlen($message) < 5) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'اطلاعات فرم کامل نیست.']);
    exit;
}

$body  = "نام: {$name}\n";
$body .= "ایمیل: {$email}\n";
if ($phone !== '') $body .= "تلفن: {$phone}\n";
$body .= "موضوع: {$subject}\n\n";
$body .= "پیام:\n{$message}\n";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: {$siteName} <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . ">\r\n";
$headers .= "Reply-To: {$email}\r\n";

$encodedSubject = '=?UTF-8?B?' . base64_encode("[{$siteName}] {$subject}") . '?=';

if (@mail($to, $encodedSubject, $body, $headers)) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'ارسال ایمیل با خطا مواجه شد.']);
}
