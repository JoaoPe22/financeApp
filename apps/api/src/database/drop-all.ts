// Script de limpeza total do banco
// Responsabilidades:
// - Truncar todas as tabelas (dados e logs)
// - Manter ordem segura por dependencias
// - Encerrar o processo com status apropriado

import { log } from 'console'
import { sql } from 'drizzle-orm'

import { db } from '@/database'
import {
  account,
  categoria,
  chatMensagem,
  despesaFixa,
  despesaMensal,
  investimento,
  objetivo,
  parcela,
  parcelamento,
  perfil,
  planejamentoMensal,
  reserva,
  session,
  user,
  verification,
} from '@/database/schema'

// Executa a limpeza total com logs
const dropAll = async () => {
  try {
    // Notifica o início do processo de remoção dos dados do banco
    console.log('🗑️  Iniciando drop de todas as tabelas...\n')

    // Remove em cascata todos os registros de logs antes dos dados principais para evitar violação de integridade
    console.log('📋 Deletando logs...')
    await db.execute(sql`TRUNCATE TABLE ${log} CASCADE`)
    console.log('✅ Logs deletados')

    // Limpa entidades principais depois dos logs para respeitar dependências
    console.log('📋 Deletando dados principais...')
    await db.execute(sql`TRUNCATE TABLE ${user} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${session} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${account} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${verification} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${categoria} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${objetivo} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${reserva} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${chatMensagem} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${planejamentoMensal} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${perfil} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${parcela} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${parcelamento} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${objetivo} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${log} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${investimento} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${despesaFixa} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${despesaMensal} CASCADE`)

    console.log('✅ Dados principais deletados')

    // Remove contas e sessões ao final para evitar vínculos pendentes
    console.log('📋 Deletando dados de autenticação...')
    await db.execute(sql`TRUNCATE TABLE ${verification} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${session} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${account} CASCADE`)
    await db.execute(sql`TRUNCATE TABLE ${user} CASCADE`)
    console.log('✅ Dados de autenticação deletados')

    console.log('\n🎉 Todas as tabelas foram limpas com sucesso!\n')
    // Encerra o processo explicitamente para scripts de CLI
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar drop:', error)
    // Garante status de falha para pipelines
    process.exit(1)
  }
}

dropAll() // Dispara o script ao executar o arquivo
