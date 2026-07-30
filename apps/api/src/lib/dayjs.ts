// Configuração centralizada do Day.js para manipulação de datas
// Responsabilidades:
// - Configurar plugins necessários (UTC, Timezone)
// - Definir locale padrão (pt-BR)
// - Fornecer utilitários para parsing de datas do Google Calendar
// - Fornecer utilitários para conversão e validação de datas
// - Fornecer funções de formatação APENAS para PDFs e E-mails (não para respostas de API)

import dayjs from 'dayjs'
import ptBR from 'dayjs/locale/pt-br.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

import { env } from './env'

// Estende o dayjs com plugin UTC
// Permite trabalhar com datas em UTC antes de converter para timezone local
dayjs.extend(utc)

// Estende o dayjs com plugin de timezone
// Permite converter datas entre diferentes timezones
dayjs.extend(timezone)

// Define o locale padrão como Português do Brasil
// Afeta formatação de datas, nomes de meses, dias da semana, etc.
dayjs.locale(ptBR)

// Faz parsing de datas retornadas pela API do Google Calendar
// O Google Calendar retorna datas de formas diferentes dependendo do tipo de evento:
// - Eventos de dia inteiro: retorna apenas a data (sem hora) no formato YYYY-MM-DD
// - Eventos com horário: retorna data e hora no formato ISO 8601 com timezone
//
// Parâmetros:
// @param dateString - String de data retornada pelo Google Calendar
// @param isAllDayEvent - Indica se é um evento de dia inteiro
// @param isEndDate - Indica se é a data de fim do evento (padrão: false)
//
// Retorna: Objeto Date convertido para o timezone da aplicação
//
// Comportamento:
// 1. Para eventos de dia inteiro:
//    - Data de início: início do dia no timezone da aplicação
//    - Data de fim: fim do dia ANTERIOR (Google Calendar usa exclusive end dates)
// 2. Para eventos com horário: converte diretamente para Date
const parseGoogleCalendarDate = (
  dateString: string,
  isAllDayEvent: boolean,
  isEndDate: boolean = false
) => {
  // Eventos de dia inteiro precisam de tratamento especial
  if (isAllDayEvent) {
    const date = dayjs(dateString)

    // Para datas de fim, o Google Calendar usa "exclusive end dates"
    // Exemplo: evento de 01/01 a 02/01 significa apenas o dia 01/01
    // Por isso subtraímos 1 dia e pegamos o fim do dia resultante
    if (isEndDate) {
      return date
        .subtract(1, 'day')
        .tz(env.APPLICATION_TIMEZONE, true)
        .endOf('day')
        .toDate()
    }

    // Para datas de início, pega o início do dia no timezone da aplicação
    return date.tz(env.APPLICATION_TIMEZONE, true).startOf('day').toDate()
  }

  // Eventos com horário específico já vêm com timezone, apenas converte para Date
  return dayjs(dateString).toDate()
}

// Converte uma string de data ou objeto Date para UTC
//
// Parâmetros:
// @param dateString - String de data ou objeto Date a ser convertido
//
// Retorna: Objeto Date em UTC
//
// Lança erro se a data for inválida
//
// Fluxo:
// 1. Converte string para Date usando dayjs
// 2. Valida se a data é válida
// 3. Retorna o objeto Date
const parseToUTC = (dateString: string | Date): Date => {
  const date = dayjs(dateString)

  if (!date.isValid()) {
    throw new Error(`Invalid date: ${dateString}`)
  }

  return date.toDate()
}

// Formata uma data para o padrão brasileiro (dd/MM/yyyy)
// ⚠️ USO RESTRITO: Apenas para PDFs e E-mails
// NÃO usar em respostas de API - o frontend é responsável por formatar datas
//
// Parâmetros:
// @param date - String de data ou objeto Date a ser formatado
//
// Retorna: String formatada (ex: "18/02/2026")
//
// Usa o timezone da aplicação para garantir consistência em documentos
const formatDateBR = (date: string | Date): string => {
  return dayjs(date).tz(env.APPLICATION_TIMEZONE).format('DD/MM/YYYY')
}

// Formata uma data e hora para o padrão brasileiro (dd/MM/yyyy HH:mm:ss)
// ⚠️ USO RESTRITO: Apenas para PDFs e E-mails
// NÃO usar em respostas de API - o frontend é responsável por formatar datas
//
// Parâmetros:
// @param date - String de data ou objeto Date a ser formatado
//
// Retorna: String formatada (ex: "18/02/2026 14:30:00")
//
// Usa o timezone da aplicação para garantir consistência em documentos
const formatDateTimeBR = (date: string | Date): string => {
  return dayjs(date).tz(env.APPLICATION_TIMEZONE).format('DD/MM/YYYY HH:mm:ss')
}

export {
  dayjs,
  parseGoogleCalendarDate,
  parseToUTC,
  formatDateBR,
  formatDateTimeBR,
}
