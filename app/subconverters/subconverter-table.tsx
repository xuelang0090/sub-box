"use client"

import { useState, useTransition } from "react"
import { Edit2, Trash2 } from 'lucide-react'
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { type Subconverter } from "@/types"
import { IdBadge } from "@/components/id-badge"
import { DateTime } from "@/components/date-time"
import { CollapseDisplay } from "@/components/collapse-display"

import { deleteSubconverter } from "./actions"
import { SubconverterForm } from "./subconverter-form"

interface SubconverterTableProps {
  subconverters: Subconverter[]
}

export function SubconverterTable({ subconverters }: SubconverterTableProps) {
  const [editingItem, setEditingItem] = useState<Subconverter | null>(null)
  const [deletingItem, setDeletingItem] = useState<Subconverter | null>(null)
  const [isPending, startTransition] = useTransition()

  function onDelete(item: Subconverter) {
    startTransition(async () => {
      try {
        await deleteSubconverter(item.id)
        toast("删除成功")
        setDeletingItem(null)
      } catch (error) {
        toast.error((error as Error).message)
      }
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>选项</TableHead>
            <TableHead>默认</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subconverters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            subconverters.map((item) => (
              <TableRow key={item.id}>
                <TableCell><IdBadge id={item.id} /></TableCell>
                <TableCell>{item.url}</TableCell>
                <TableCell><CollapseDisplay url={item.options} maxLength={50} /></TableCell>
                <TableCell>{item.isDefault ? "是" : "否"}</TableCell>
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
            ))
          )}
        </TableBody>
      </Table>

      <PopupSheet
        open={Boolean(editingItem)}
        onOpenChange={(open) => !open && setEditingItem(null)}
        title="编辑订阅转换器"
      >
        <SubconverterForm
          subconverter={editingItem ?? undefined}
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
              确定要删除此订阅转换器吗？此操作不可撤销。
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