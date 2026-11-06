import { NextRequest, NextResponse } from 'next/server';
import nodemailer, { SendMailOptions } from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      cc,
      subject,
      htmlBody,
      documentTitle,
      documentNumber,
      employeeName,
      senderEmail,
      senderPassword,
      senderName,
      companyName,
      smtpHost: requestedHost,
      smtpPort: requestedPort,
      pdfBase64,
      pdfFilename,
    } = body;

    if (!to || !subject || !senderEmail || !senderPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, senderEmail, senderPassword' },
        { status: 400 }
      );
    }

    // Determine Zoho SMTP host based on requested host or Zoho data center
    const smtpHost = requestedHost || (senderEmail.includes('zoho.com') ? 'smtp.zoho.com' : 'smtp.zoho.in');
    const smtpPort = requestedPort || 465;

    // Create Zoho Mail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
    });

    // Build professional HTML email body
    const emailHtml = htmlBody || `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 0;">
        <!-- Header -->
        <div style="background: #000; color: #fff; padding: 24px 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 18px; letter-spacing: 3px; font-weight: 800;">DEEP ROOT STUDIOS</h1>
          <p style="margin: 4px 0 0; font-size: 10px; letter-spacing: 2px; opacity: 0.7; text-transform: uppercase;">
            End-to-End AI Operations Partner
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e5e5; border-top: none;">
          <p style="font-size: 14px; color: #333; margin: 0 0 16px;">
            Dear <strong>${employeeName || 'Team Member'}</strong>,
          </p>
          <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 20px;">
            Please find attached the official document from <strong>${companyName || 'Deep Root Studios Private Limited'}</strong>.
          </p>

          <!-- Document Card -->
          <div style="background: #f9f9f9; border: 1px solid #e0e0e0; border-left: 4px solid #000; padding: 16px 20px; margin: 0 0 20px;">
            <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700;">
              Official Document
            </p>
            <p style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #000;">
              ${documentTitle || 'Company Document'}
            </p>
            <p style="margin: 0; font-size: 12px; color: #666; font-family: monospace;">
              Ref: ${documentNumber || 'N/A'}
            </p>
          </div>

          <p style="font-size: 12px; color: #777; line-height: 1.5; margin: 0 0 24px;">
            This document has been digitally issued through the DRS Management Portal and carries the authorized signature and official company seal. 
            You may verify its authenticity at our verification portal.
          </p>

          <p style="font-size: 13px; color: #333; margin: 0 0 4px;">
            Regards,
          </p>
          <p style="font-size: 13px; color: #000; font-weight: 700; margin: 0 0 2px;">
            ${senderName || 'Human Resources'}
          </p>
          <p style="font-size: 11px; color: #888; margin: 0;">
            ${companyName || 'Deep Root Studios Private Limited'}
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 16px 32px; text-align: center; border: 1px solid #e5e5e5; border-top: none;">
          <p style="margin: 0; font-size: 10px; color: #999;">
            This is an official communication from ${companyName || 'Deep Root Studios Private Limited'}.
          </p>
          <p style="margin: 4px 0 0; font-size: 10px; color: #bbb;">
            Confidential — intended solely for the named recipient.
          </p>
        </div>
      </div>
    `;

    // Build mail options
    const mailOptions: SendMailOptions = {
      from: `"${senderName || companyName || 'Deep Root Studios'}" <${senderEmail}>`,
      to: to,
      cc: cc || undefined,
      subject: subject,
      html: emailHtml,
      attachments: [],
    };

    // Attach PDF if provided
    if (pdfBase64 && pdfFilename) {
      mailOptions.attachments = [
        {
          filename: pdfFilename,
          content: Buffer.from(pdfBase64, 'base64'),
          contentType: 'application/pdf',
        },
      ];
    }

    // Send email via Zoho SMTP
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      message: `Email sent successfully to ${to}`,
    });
  } catch (error: any) {
    console.error('Zoho Mail send error:', error);

    let userMessage = 'Failed to send email. Please check your Zoho Mail credentials.';
    if (error.code === 'EAUTH') {
      userMessage = 'Authentication failed. Please verify your Zoho email and app-specific password. If you have 2FA enabled, generate an App Password from Zoho Mail Settings → Security → App Passwords.';
    } else if (error.code === 'ECONNREFUSED') {
      userMessage = 'Connection to Zoho SMTP server was refused. Please check your network connection.';
    } else if (error.code === 'ETIMEDOUT') {
      userMessage = 'Connection to Zoho SMTP server timed out. Please try again.';
    }

    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}

