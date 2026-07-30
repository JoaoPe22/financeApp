// Serviço de envio de emails via SMTP
// Responsabilidades:
// - Configurar transporter do Nodemailer
// - Enviar emails HTML e texto plano
// - Gerenciar erros de envio

import nodemailer from 'nodemailer'

import { env } from './env'

// Transporter do Nodemailer configurado com credenciais SMTP
// Reutilizado para todos os envios de email da aplicação
//
// Configurações:
// - host: Servidor SMTP (ex: smtp.gmail.com, smtp.sendgrid.net)
// - port: Porta SMTP (587 para STARTTLS, 465 para SSL)
// - auth: Credenciais de autenticação (usuário e senha)
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

// Tipo que define as opções para envio de email
type SendEmailOptions = {
  to: string // Endereço de email do destinatário
  subject: string // Assunto do email
  html: string // Conteúdo HTML do email
  text?: string // Versão em texto plano (fallback para clientes que não suportam HTML)
}

// Envia um email usando o transporter configurado
//
// Parâmetros:
// @param options - Objeto contendo destinatário, assunto e conteúdo do email
//
// Retorna:
// - { success: true, messageId: string } em caso de sucesso
// - { success: false, error: unknown } em caso de erro
//
// Fluxo:
// 1. Tenta enviar email via transporter
// 2. Loga o messageId em caso de sucesso
// 3. Captura e loga erros em caso de falha
// 4. Retorna objeto com status da operação
//
// Observações:
// - Não lança exceções, sempre retorna objeto com status
// - Erros são apenas logados no console, não interrompem a aplicação
const sendEmail = async (options: SendEmailOptions) => {
  try {
    // Envia o email usando Nodemailer
    const info = await transporter.sendMail({
      // Remetente formatado: "Nome <email@example.com>"
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    // Loga sucesso com ID da mensagem (útil para rastreamento)
    console.log('Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    // Loga erro sem interromper aplicação
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

export { sendEmail }
