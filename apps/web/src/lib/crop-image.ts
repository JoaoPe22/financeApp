interface CroppedArea {
  x: number
  y: number
  width: number
  height: number
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })

const getCroppedImage = async (
  imageSrc: string,
  area: CroppedArea,
): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível processar a imagem')

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  )

  return canvas.toDataURL('image/jpeg', 1)
}

export { getCroppedImage }
export type { CroppedArea }
