// Templates HTML/texto dos emails de redefinição de senha, usados por src/auth/index.ts
import { envServer as env } from './env-server'

type ResetPasswordTemplateData = {
  userName: string
  resetUrl: string
  expiresIn: string
}

const resetPasswordTemplate = (data: ResetPasswordTemplateData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo img { max-width: 200px; height: auto; }
    h1 { color: #1a1a1a; font-size: 24px; margin-bottom: 20px; }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="${env.BETTER_AUTH_URL}/logotipo.png" alt="Projeto Saas" />
    </div>
    <h1>Redefinição de Senha</h1>
    <p>Olá ${data.userName},</p>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
    <div style="text-align: center;">
      <a href="${data.resetUrl}" class="button">Redefinir Senha</a>
    </div>
    <div class="warning">
      <strong>⚠️ Importante:</strong> Este link expira em <strong>${data.expiresIn}</strong>.
    </div>
    <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
    <p class="code" style="word-break: break-all;">${data.resetUrl}</p>
    <p><strong>Não solicitou esta alteração?</strong><br>
    Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. Sua senha permanecerá a mesma.</p>
    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p>&copy; ${new Date().getFullYear()} Projeto Saas. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `
}

const resetPasswordTextTemplate = (data: ResetPasswordTemplateData) => {
  return `
Olá ${data.userName},

Recebemos uma solicitação para redefinir a senha da sua conta.

Para redefinir sua senha, clique no link abaixo:
${data.resetUrl}

⚠️ IMPORTANTE: Este link expira em ${data.expiresIn}.

Não solicitou esta alteração?
Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.

---
Este é um email automático, por favor não responda.
© ${new Date().getFullYear()} Projeto Saas. Todos os direitos reservados.
  `
}

export { resetPasswordTemplate, resetPasswordTextTemplate }
export type { ResetPasswordTemplateData }
