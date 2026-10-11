<?php
/**
 * مرسل بريد إلكتروني مستقل عبر SMTP في PHP (بدون مكتبات خارجية)
 * Pure PHP SMTP Client - Rosookh Al Omraniyah
 */

class SimpleSmtpMailer
{
    private $host;
    private $port;
    private $username;
    private $password;
    private $encryption;
    private $timeout;
    private $lastError = '';

    public function __construct(string $host, int $port, string $username, string $password, string $encryption = 'tls', int $timeout = 15)
    {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->encryption = strtolower($encryption);
        $this->timeout = $timeout;
    }

    public function getLastError(): string
    {
        return $this->lastError;
    }

    public function send(string $fromEmail, string $fromName, string $toEmail, string $subject, string $htmlBody): bool
    {
        $socketHost = ($this->encryption === 'ssl') ? 'ssl://' . $this->host : $this->host;
        
        $socket = @stream_socket_client(
            $socketHost . ':' . $this->port,
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT
        );

        if (!$socket) {
            $this->lastError = "فشل الاتصال بخادم SMTP ({$this->host}:{$this->port}): $errstr ($errno)";
            return false;
        }

        stream_set_timeout($socket, $this->timeout);

        $response = $this->readResponse($socket);
        if (substr($response, 0, 3) !== '220') {
            $this->lastError = "خطأ في استجابة ترحيب الخادم: " . trim($response);
            fclose($socket);
            return false;
        }

        // إرسال EHLO
        $clientDomain = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
        $this->sendCommand($socket, "EHLO $clientDomain");
        $ehloResponse = $this->readResponse($socket);

        // تفعيل STARTTLS عند الحاجة
        if ($this->encryption === 'tls') {
            $this->sendCommand($socket, "STARTTLS");
            $tlsResp = $this->readResponse($socket);
            if (substr($tlsResp, 0, 3) !== '220') {
                $this->lastError = "فشل بدء تشفير TLS: " . trim($tlsResp);
                fclose($socket);
                return false;
            }

            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                $this->lastError = "فشل تشفير الاتصال عبر TLS.";
                fclose($socket);
                return false;
            }

            $this->sendCommand($socket, "EHLO $clientDomain");
            $this->readResponse($socket);
        }

        // المصادقة AUTH LOGIN
        if (!empty($this->username) && !empty($this->password)) {
            $this->sendCommand($socket, "AUTH LOGIN");
            $authResp = $this->readResponse($socket);
            if (substr($authResp, 0, 3) !== '334') {
                $this->lastError = "طلب المصادقة غير مدعوم: " . trim($authResp);
                fclose($socket);
                return false;
            }

            $this->sendCommand($socket, base64_encode($this->username));
            $userResp = $this->readResponse($socket);
            if (substr($userResp, 0, 3) !== '334') {
                $this->lastError = "اسم مستخدم SMTP غير صحيح: " . trim($userResp);
                fclose($socket);
                return false;
            }

            $this->sendCommand($socket, base64_encode($this->password));
            $passResp = $this->readResponse($socket);
            if (substr($passResp, 0, 3) !== '235') {
                $this->lastError = "فشلت مصادقة كلمة المرور لـ SMTP: " . trim($passResp);
                fclose($socket);
                return false;
            }
        }

        // MAIL FROM
        $this->sendCommand($socket, "MAIL FROM:<$fromEmail>");
        $fromResp = $this->readResponse($socket);
        if (substr($fromResp, 0, 3) !== '250') {
            $this->lastError = "رفض بريد الإرسال: " . trim($fromResp);
            fclose($socket);
            return false;
        }

        // RCPT TO
        $this->sendCommand($socket, "RCPT TO:<$toEmail>");
        $toResp = $this->readResponse($socket);
        if (substr($toResp, 0, 3) !== '250') {
            $this->lastError = "رفض بريد المستلم: " . trim($toResp);
            fclose($socket);
            return false;
        }

        // DATA
        $this->sendCommand($socket, "DATA");
        $dataResp = $this->readResponse($socket);
        if (substr($dataResp, 0, 3) !== '354') {
            $this->lastError = "رفض استقبال نص الرسالة: " . trim($dataResp);
            fclose($socket);
            return false;
        }

        // ترويسات ومحتوى البريد
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

        $headers = [];
        $headers[] = "Date: " . date('r');
        $headers[] = "To: <$toEmail>";
        $headers[] = "From: $encodedFromName <$fromEmail>";
        $headers[] = "Subject: $encodedSubject";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: text/html; charset=UTF-8";
        $headers[] = "Content-Transfer-Encoding: 8bit";
        $headers[] = "X-Mailer: Rosookh-Mailer/1.0";

        $fullPayload = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
        $this->sendCommand($socket, $fullPayload);

        $sentResp = $this->readResponse($socket);
        $this->sendCommand($socket, "QUIT");
        fclose($socket);

        if (substr($sentResp, 0, 3) === '250') {
            return true;
        }

        $this->lastError = "فشل تأكيد إرسال الرسالة من الخادم: " . trim($sentResp);
        return false;
    }

    private function sendCommand($socket, string $command): void
    {
        fwrite($socket, $command . "\r\n");
    }

    private function readResponse($socket): string
    {
        $response = '';
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    }
}
