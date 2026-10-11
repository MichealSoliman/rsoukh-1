<?php
/**
 * ==========================================================================
 * ملف إعدادات البريد الإلكتروني - رسوخ العمرانية
 * Rosookh Al Omraniyah - Email & Server Configuration
 * ==========================================================================
 */

return [
    /**
     * 1. عنوان البريد الإلكتروني المستلم (هام جداً):
     * أدخل البريد الإلكتروني الذي ترغب في استقبال طلبات التسجيل عليه.
     * مثال: 'info@rosookh.com' أو 'yourname@gmail.com'
     */
    'recipient_email' => 'rswkhalmranyt@gmail.com',
    'web3forms_key'   => '88af864b-908a-4bc9-b362-860d522e4a40',

    /**
     * 2. طريقة الإرسال:
     * - 'mail': استخدام دالة mail() الافتراضية في خادم الاستضافة (الأنسب لمعظم استضافات cPanel/Apache).
     * - 'smtp': استخدام خادم SMTP مباشر (يوفر وصولاً موثوقاً لصندوق الوارد، مناسب لـ Gmail, Zoho, Hostinger, Outlook).
     */
    'mailer_type' => 'mail',

    /**
     * 3. إعدادات SMTP (تُستخدم فقط إذا تم اختيار 'mailer_type' => 'smtp' أعلاه):
     */
    'smtp' => [
        'host'       => 'smtp.example.com', // خادم SMTP
        'port'       => 465,                // 465 لـ SSL أو 587 لـ TLS
        'username'   => 'your-email@example.com',
        'password'   => 'your-password-or-app-key',
        'encryption' => 'ssl',              // 'ssl' أو 'tls'
        'timeout'    => 15,
    ],

    /**
     * 4. تفاصيل الرسالة الافتراضية:
     */
    'from_name'     => 'رسوخ العمرانية - الحمراء',
    'from_email'    => '', // اتركه فارغاً ليتم استخدام noreply@ اسم النطاق تلقائياً، أو حدد بريد نطاقك
    'email_subject' => 'بيانات العميل بالحمراء - مستشفي الملك فهد حي الحمراء',
    'project_title' => 'بيانات العميل بالحمراء',
    'project_loc'   => 'مستشفي الملك فهد حي الحمراء',
    'timezone'      => 'Asia/Riyadh',
];
