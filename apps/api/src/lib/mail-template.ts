// Templates HTML para emails transacionais
// Responsabilidades:
// - Gerar HTML responsivo e estilizado para emails
// - Fornecer versões em texto plano (fallback)
// - Manter identidade visual da BSY Consultoria
//
// Templates disponíveis:
// 1. Reset de senha
// 2. Alertas de licenças PJ (Pessoa Jurídica)
// 3. Alertas de licenças PF (Pessoa Física)

import { env } from './env'

// Tipo que define os dados necessários para o template de reset de senha
type ResetPasswordTemplateData = {
  userName: string // Nome do usuário que solicitou o reset
  resetUrl: string // URL com token para redefinir a senha
  expiresIn: string // Tempo de expiração formatado (ex: "1 hora", "30 minutos")
}

// Gera HTML estilizado para email de redefinição de senha
//
// Parâmetros:
// @param data - Dados do usuário e link de reset
//
// Retorna: String HTML completa e responsiva
//
// Características:
// - Design responsivo com media queries
// - Botão CTA (Call-to-Action) destacado
// - Link alternativo para casos onde o botão não funciona
// - Aviso de expiração em destaque
// - Logotipo da empresa
// - Rodapé com copyright
const resetPasswordTemplate = (data: ResetPasswordTemplateData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Estilos base para o corpo do email */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    /* Container principal com sombra e bordas arredondadas */
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    /* Área do logotipo centralizada */
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo img {
      max-width: 200px;
      height: auto;
    }
    /* Título principal do email */
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 20px;
    }
    /* Botão de ação (CTA) azul */
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
    /* Efeito hover no botão */
    .button:hover {
      background-color: #0051cc;
    }
    /* Caixa de aviso amarela */
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    /* Rodapé com informações secundárias */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    /* Estilo para exibir código/URL */
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
    <!-- Logotipo da BSY Consultoria -->
    <div class="logo">
      <img src="${env.FRONTEND_URL}/logotipo.png" alt="BSY Consultoria" />
    </div>
    
    <h1>Redefinição de Senha</h1>
    
    <p>Olá ${data.userName},</p>
    
    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
    
    <!-- Botão centralizado para reset de senha -->
    <div style="text-align: center;">
      <a href="${data.resetUrl}" class="button">Redefinir Senha</a>
    </div>
    
    <!-- Aviso de expiração do link -->
    <div class="warning">
      <strong>⚠️ Importante:</strong> Este link expira em <strong>${data.expiresIn}</strong>.
    </div>
    
    <!-- Link alternativo caso o botão não funcione -->
    <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
    <p class="code" style="word-break: break-all;">${data.resetUrl}</p>
    
    <!-- Aviso de segurança -->
    <p><strong>Não solicitou esta alteração?</strong><br>
    Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. Sua senha permanecerá a mesma.</p>
    
    <!-- Rodapé com copyright -->
    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p>&copy; ${new Date().getFullYear()} BSY Consultoria. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Versão em texto plano do template de reset de senha
// Usado como fallback para clientes de email que não suportam HTML
//
// Parâmetros:
// @param data - Dados do usuário e link de reset
//
// Retorna: String de texto plano formatada
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
© ${new Date().getFullYear()} BSY Consultoria. Todos os direitos reservados.
  `
}

export { resetPasswordTemplate, resetPasswordTextTemplate }
export type { ResetPasswordTemplateData }
