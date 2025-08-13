-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resend_api_key TEXT,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  reply_to_email TEXT,
  email_signature TEXT DEFAULT '',
  is_configured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('invoice', 'proposal', 'payment_reminder')),
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_type)
);

-- Create email_history table
CREATE TABLE IF NOT EXISTS email_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  related_id UUID, -- invoice_id or proposal_id
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
  resend_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_settings
CREATE POLICY "Users can view their own email settings" ON email_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email settings" ON email_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email settings" ON email_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email settings" ON email_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for email_templates
CREATE POLICY "Users can view their own email templates" ON email_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email templates" ON email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates" ON email_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates" ON email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for email_history
CREATE POLICY "Users can view their own email history" ON email_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email history" ON email_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default email templates
INSERT INTO email_templates (user_id, template_type, subject_template, html_template, text_template)
SELECT 
  auth.uid(),
  'invoice',
  'Invoice {{invoice_number}} from {{sender_name}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Invoice {{invoice_number}}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From {{sender_name}}</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{client_name}},</p>
    
    {{#if custom_message}}
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
      <p style="margin: 0; font-style: italic;">{{custom_message}}</p>
    </div>
    {{/if}}
    
    <p>Please find your invoice attached to this email. Here are the details:</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Invoice Number:</td>
          <td style="padding: 8px 0;">{{invoice_number}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">{{invoice_date}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
          <td style="padding: 8px 0;">{{due_date}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #667eea;">Total Amount:</td>
          <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #667eea;">${{total_amount}}</td>
        </tr>
      </table>
    </div>
    
    <p>If you have any questions about this invoice, please don''t hesitate to contact me.</p>
    
    <p>Thank you for your business!</p>
    
    {{#if email_signature}}
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
      {{{email_signature}}}
    </div>
    {{/if}}
  </div>
</body>
</html>',
  'Hi {{client_name}},

{{#if custom_message}}
{{custom_message}}

{{/if}}

Please find your invoice attached to this email. Here are the details:

Invoice Number: {{invoice_number}}
Date: {{invoice_date}}
Due Date: {{due_date}}
Total Amount: ${{total_amount}}

If you have any questions about this invoice, please don''t hesitate to contact me.

Thank you for your business!

{{#if email_signature}}
{{email_signature}}
{{/if}}'
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates 
  WHERE user_id = auth.uid() AND template_type = 'invoice'
);

INSERT INTO email_templates (user_id, template_type, subject_template, html_template, text_template)
SELECT 
  auth.uid(),
  'proposal',
  'Proposal from {{sender_name}} - {{proposal_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">New Proposal</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From {{sender_name}}</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{client_name}},</p>
    
    {{#if custom_message}}
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
      <p style="margin: 0; font-style: italic;">{{custom_message}}</p>
    </div>
    {{/if}}
    
    <p>I''m excited to share a new proposal with you. Please find the detailed proposal attached to this email.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Project:</td>
          <td style="padding: 8px 0;">{{proposal_title}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">{{proposal_date}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #667eea;">Total Value:</td>
          <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #667eea;">${{total_amount}}</td>
        </tr>
      </table>
    </div>
    
    <p>I''m looking forward to discussing this opportunity with you. Please review the proposal and let me know if you have any questions.</p>
    
    <p>Thank you for considering my services!</p>
    
    {{#if email_signature}}
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
      {{{email_signature}}}
    </div>
    {{/if}}
  </div>
</body>
</html>',
  'Hi {{client_name}},

{{#if custom_message}}
{{custom_message}}

{{/if}}

I''m excited to share a new proposal with you. Please find the detailed proposal attached to this email.

Project: {{proposal_title}}
Date: {{proposal_date}}
Total Value: ${{total_amount}}

I''m looking forward to discussing this opportunity with you. Please review the proposal and let me know if you have any questions.

Thank you for considering my services!

{{#if email_signature}}
{{email_signature}}
{{/if}}'
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates 
  WHERE user_id = auth.uid() AND template_type = 'proposal'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_settings_user_id ON email_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(user_id, template_type);
CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_related_id ON email_history(related_id);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON email_history(sent_at);
