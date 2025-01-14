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
import { type User } from "@/types"
import { IdBadge } from "@/components/id-badge"
import { DateTime } from "@/components/date-time"

import { deleteUser } from "./actions"
import { UserForm } from "./user-form"

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function onDelete(user: User) {
    startTransition(async () => {
      try {
        await deleteUser(user.id)
        toast({
          description: "删除成功",
        })
        setDeletingUser(null)
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
            <TableHead>订阅转换器</TableHead>
            <TableHead>Clash 配置</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell><IdBadge id={user.id} /></TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.subconverterId ? <IdBadge id={user.subconverterId} /> : "-"}</TableCell>
              <TableCell>{user.mergeConfigId ? <IdBadge id={user.mergeConfigId} /> : "-"}</TableCell>
              <TableCell><DateTime date={user.createdAt} /></TableCell>
              <TableCell><DateTime date={user.updatedAt} /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">编辑</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingUser(user)}
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
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
        title="编辑用户"
      >
        <UserForm
          user={editingUser ?? undefined}
          onSuccess={() => setEditingUser(null)}
        />
      </PopupSheet>

      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 {deletingUser?.name} 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingUser) {
                  onDelete(deletingUser)
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

