"use client"

import { useState } from "react"
import { PlusCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { PopupSheet } from "@/components/popup-sheet"

import { UserForm } from "./user-form"

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        创建用户
      </Button>

      <PopupSheet
        open={open}
        onOpenChange={setOpen}
        title="创建用户"
      >
        <UserForm onSuccess={() => setOpen(false)} />
      </PopupSheet>
    </>
  )
}

