'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useDeleteAccount } from '@/hooks/use-delete-account'

const DeleteAccountButton = () => {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const { deleteAccount, isDeleting } = useDeleteAccount()

  const onConfirmar = () => {
    if (!password) return
    deleteAccount(password)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(novoOpen) => {
        setOpen(novoOpen)
        if (novoOpen) setPassword('')
      }}
    >
      <Button
        type="button"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 />
        Excluir conta
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir sua conta</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm">
          Essa ação é permanente e apaga todos os seus dados — despesas,
          receitas, parcelamentos, investimentos, objetivos e reservas. Não é
          possível desfazer.
        </p>

        <Field>
          <FieldLabel htmlFor="delete-account-password">
            Confirme sua senha
          </FieldLabel>
          <Input
            id="delete-account-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isDeleting}
          />
        </Field>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || !password}
            onClick={onConfirmar}
          >
            {isDeleting && <Loader2 className="animate-spin" />}
            Excluir permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteAccountButton }
