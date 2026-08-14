interface CEP {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

const buscaCep = async (cep: string): Promise<CEP> => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!response.ok) {
    throw new Error(`Erro ao buscar CEP: ${response.statusText}`)
  }

  const data = (await response.json()) as CEP

  if (data.erro) {
    throw new Error('CEP não encontrado')
  }

  return data
}

export { buscaCep }
