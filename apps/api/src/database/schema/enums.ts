import { z } from 'zod'

const tipoRendaEnum = z.enum(['SALARIO', 'AUTONOMO', 'RENDIMENTO', 'OUTRO'])
type TipoRenda = z.infer<typeof tipoRendaEnum>

// Classifica para qual tipo de lançamento a categoria vale (uma categoria de
// despesa não pode ser usada numa receita, por exemplo) — o nome específico
// (Alimentação, Saúde...) fica livre no campo `nome` da tabela categoria.
const tipoCategoriaEnum = z.enum(['RECEITA', 'DESPESA', 'INVESTIMENTO'])
type TipoCategoria = z.infer<typeof tipoCategoriaEnum>

const statusPlanejamentoEnum = z.enum(['ABERTO', 'FECHADO'])
type StatusPlanejamento = z.infer<typeof statusPlanejamentoEnum>

const statusParcelaEnum = z.enum(['PENDENTE', 'PAGA', 'ATRASADA'])
type StatusParcela = z.infer<typeof statusParcelaEnum>

const statusObjetivoEnum = z.enum(['ATIVO', 'CONCLUIDO', 'CANCELADO'])
type StatusObjetivo = z.infer<typeof statusObjetivoEnum>

export { tipoCategoriaEnum, tipoRendaEnum, statusPlanejamentoEnum, statusParcelaEnum, statusObjetivoEnum }

export type { TipoCategoria, TipoRenda, StatusPlanejamento, StatusParcela, StatusObjetivo }
