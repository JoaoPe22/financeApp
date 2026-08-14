'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { toast } from 'sonner'

import { authClient } from '@/auth/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCroppedImage } from '@/lib/crop-image'

const lerComoDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const iniciais = (nome?: string) =>
  nome
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('') || '?'

const AvatarUploader = () => {
  const { data: session } = authClient.useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const user = session?.user

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const dataUrl = await lerComoDataUrl(file)
    setImageToCrop(dataUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleSaveCrop = async () => {
    if (!imageToCrop || !croppedArea) return

    setIsUploading(true)
    try {
      const croppedDataUrl = await getCroppedImage(imageToCrop, croppedArea)
      await authClient.updateUser({ image: croppedDataUrl })
      toast.success('Foto de perfil atualizada com sucesso!')
      setImageToCrop(null)
    } catch {
      toast.error('Não foi possível atualizar a foto de perfil')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    setIsUploading(true)
    try {
      await authClient.updateUser({ image: null })
      toast.success('Foto de perfil removida')
    } catch {
      toast.error('Não foi possível remover a foto de perfil')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl rounded-xl shadow-xl">
      <CardContent className="flex items-center gap-4">
        <Avatar
          className={`size-16 ${user?.image ? 'cursor-pointer' : ''}`}
          onClick={() => user?.image && setShowPreview(true)}
        >
          <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
          <AvatarFallback className="text-lg">
            {iniciais(user?.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-1">
          <span className="font-medium">{user?.name}</span>
          <span className="text-muted-foreground text-sm">{user?.email}</span>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Alterar foto
          </Button>
          {user?.image && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isUploading}
              onClick={handleRemove}
            >
              Remover foto
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog
        open={!!imageToCrop}
        onOpenChange={(open) => !open && setImageToCrop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar foto</DialogTitle>
          </DialogHeader>

          <div className="relative h-80 w-full bg-black/20">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            )}
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageToCrop(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isUploading}
              onClick={handleSaveCrop}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>Foto de perfil</DialogTitle>
          </DialogHeader>
          {user?.image && (
            <Image
              width={100}
              height={100}
              priority
              quality={100}
              src={user.image}
              alt={user.name}
              className="aspect-3/4 w-full rounded-md object-cover"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export { AvatarUploader }
