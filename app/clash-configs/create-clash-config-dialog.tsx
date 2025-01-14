"use client"

import { useState } from "react"
import { PlusCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { PopupSheet } from "@/components/popup-sheet"
import { ClashConfigForm } from "./clash-config-form"

export function CreateClashConfigDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        添加配置
      </Button>

      <PopupSheet
        open={open}
        onOpenChange={setOpen}
        title="添加 Clash 配置"
      >
        <ClashConfigForm onSuccess={() => setOpen(false)} />
      </PopupSheet>
    </>
  )
} 