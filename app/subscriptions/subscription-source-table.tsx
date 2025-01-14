"use client"

import { useState, useTransition } from "react"
import { Edit2, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PopupSheet } from "@/components/popup-sheet"
import { type SubscriptionSource } from "@/types"
import { IdBadge } from "@/components/id-badge"
import { DateTime } from "@/components/date-time"

import { deleteSubscriptionSource } from "./actions"
import { SubscriptionSourceForm } from "./subscription-source-form"

interface SubscriptionSourceTableProps {
  sources: SubscriptionSource[]
}

export function SubscriptionSourceTable({ sources }: SubscriptionSourceTableProps) {
  const [editingItem, setEditingItem] = useState<SubscriptionSource | null>(null)
  const [deletingItem, setDeletingItem] = useState<SubscriptionSource | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function onDelete(item: SubscriptionSource) {
    startTransition(async () => {
      try {
        await deleteSubscriptionSource(item.id)
        toast({
          description: "删除成功",
        })
        setDeletingItem(null)
      } catch (error) {
        toast({
          variant: "destructive",
          description: (error as Error).message,
        })
      }
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>入站协议</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>最后更新</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((item) => (
            <TableRow key={item.id}>
              <TableCell><IdBadge id={item.id} /></TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.inboundProtocol}</TableCell>
              <TableCell>{item.ip || "-"}</TableCell>
              <TableCell>{item.url || "-"}</TableCell>
              <TableCell>{item.lastUpdate ? <DateTime date={item.lastUpdate} /> : "-"}</TableCell>
              <TableCell><DateTime date={item.createdAt} /></TableCell>
              <TableCell><DateTime date={item.updatedAt} /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">编辑</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingItem(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">删除</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PopupSheet
        open={Boolean(editingItem)}
        onOpenChange={(open) => !open && setEditingItem(null)}
        title="编辑订阅源"
      >
        <SubscriptionSourceForm
          source={editingItem ?? undefined}
          onSuccess={() => setEditingItem(null)}
        />
      </PopupSheet>

      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除订阅源 {deletingItem?.name} 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItem) {
                  onDelete(deletingItem)
                }
              }}
              disabled={isPending}
            >
              {isPending ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 