"use client"

import { useState } from "react"
import { PlusCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { PopupSheet } from "@/components/popup-sheet"
import { SubscriptionSourceForm } from "./subscription-source-form"

export function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        添加订阅源
      </Button>

      <PopupSheet
        open={open}
        onOpenChange={setOpen}
        title="添加订阅源"
      >
        <SubscriptionSourceForm onSuccess={() => setOpen(false)} />
      </PopupSheet>
    </>
  )
} 