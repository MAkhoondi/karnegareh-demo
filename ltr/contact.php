<?php
/**
 * Karnegareh - simple script that emails the contact form
 * ---------------------------------------------------------------
 * How to use:
 *   1) Put your email address in the $to variable.
 *   2) In the HTML file, set the form's action to "contact.php":
 *        <form class="card contact-form" action="contact.php" method="post" data-validate novalidate>
 *   3) Upload the files to a host that supports PHP.
 *
 * Note: some hosts disable the mail() function; in that case use a service
 * such as Formspree (see the documentation).
 */

$to      = 'you@example.com';          // ← put your email address here
$siteName = 'My personal website';

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
$subject = clean($_POST['subject'] ?? 'New message from the website');
$message = trim(strip_tags($_POST['message'] ?? $_POST['comment'] ?? ''));

// hidden anti-spam field (optional): <input type="text" name="website" style="display:none">
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

if ($name === '' || !$email || mb_strlen($message) < 5) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'The form is incomplete.']);
    exit;
}

$body  = "Name: {$name}\n";
$body .= "Email: {$email}\n";
if ($phone !== '') $body .= "Phone: {$phone}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: {$siteName} <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . ">\r\n";
$headers .= "Reply-To: {$email}\r\n";

$encodedSubject = '=?UTF-8?B?' . base64_encode("[{$siteName}] {$subject}") . '?=';

if (@mail($to, $encodedSubject, $body, $headers)) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'The email could not be sent.']);
}
