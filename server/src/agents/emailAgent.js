const specLoader = require('../utils/specLoader');

/**
 * Email Agent
 * Formats email notifications using specs templates.
 */
class EmailAgent {
  /**
   * Generates email contents for the specified template.
   * @param {string} templateType - 'interview' or 'rejection'
   * @param {object} variables - Values to interpolate (e.g. { candidate_name: 'John', job_title: 'Developer' })
   * @returns {object} Formatted subject and body.
   */
  static formatEmail(templateType, variables) {
    console.log(`📩 [EmailAgent] Loading email template '${templateType}' from specs/email/templates.json...`);
    const templates = specLoader.loadEmailTemplates();
    const template = templates[templateType];

    if (!template) {
      throw new Error(`Email template not found: ${templateType}`);
    }

    let subject = template.subject || '';
    let body = template.body || '';

    // Interpolate variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    console.log(`✉️ [EmailAgent] Interpolated email variables -> Subject: "${subject}"`);

    return {
      success: true,
      data: {
        subject,
        body
      }
    };
  }

  /**
   * Simulates/Sends the email (using Resend mock or real client).
   */
  static async send(to, subject, body) {
    const apiKey = process.env.RESEND_API_KEY;
    const isPlaceholder = !apiKey || apiKey.includes('your_') || apiKey.trim() === '';

    if (isPlaceholder) {
      console.log(`[Email MOCK] Sending email to ${to}...`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${body}\n`);
      return { success: true, mock: true };
    }

    // Example actual Resend request
    try {
      console.log(`🚀 [EmailAgent] Dispatching email to "${to}" via Resend API...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev', // Resend default verified testing sender
          to: [to],
          subject: subject,
          text: body
        })
      });

      if (response.ok) {
        const resData = await response.json().catch(() => ({}));
        console.log(`✅ [EmailAgent] Email successfully delivered via Resend API (ID: ${resData.id || 'ok'}).`);
        return { success: true, sent: true, id: resData.id };
      }
      const errText = await response.text();
      console.warn(`⚠️ [EmailAgent] Resend API notice: ${errText}`);
      return { success: true, mock: true, warning: errText };
    } catch (error) {
      console.error('Email API send failed. Falling back to mock logging.', error.message);
      return { success: true, mock: true, error: error.message };
    }
  }
}

module.exports = EmailAgent;
