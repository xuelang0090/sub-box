"use client"

import { useState, useTransition } from "react"
import * as React from "react"
import { Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
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
import { type SubscriptionSource, type User } from "@/types"
import { IdBadge } from "@/components/id-badge"
import { DateTime } from "@/components/date-time"
import { cn } from "@/lib/utils"

import { deleteSubscriptionSource } from "./actions"
import { SubscriptionSourceForm } from "./subscription-source-form"
import { SubscriptionSourceItemTable } from "./subscription-source-item-table"

interface SubscriptionSourceTableProps {
  sources: (SubscriptionSource & { items: any[] })[]
  users: User[]
}

export function SubscriptionSourceTable({ sources, users }: SubscriptionSourceTableProps) {
  const [editingItem, setEditingItem] = useState<SubscriptionSource | null>(null)
  const [deletingItem, setDeletingItem] = useState<SubscriptionSource | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(sources.map(source => source.id))
  )
  const [isPending, startTransition] = useTransition()

  function onDelete(item: SubscriptionSource) {
    startTransition(async () => {
      try {
        await deleteSubscriptionSource(item.id)
        toast("删除成功")
        setDeletingItem(null)
      } catch (error) {
        toast("删除失败", {
          description: (error as Error).message,
        })
      }
    })
  }

  function toggleExpand(id: string) {
    const newExpandedItems = new Set(expandedItems)
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id)
    } else {
      newExpandedItems.add(id)
    }
    setExpandedItems(newExpandedItems)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>入站协议</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            sources.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="sr-only">展开</span>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        ({item.items.length})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell><IdBadge id={item.id} /></TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.inboundProtocol}</TableCell>
                  <TableCell>{item.ip || "-"}</TableCell>
                  <TableCell>{item.url || "-"}</TableCell>
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
                {expandedItems.has(item.id) && (
                  <TableRow>
                    <TableCell colSpan={9} className="p-0 pl-20">
                      <SubscriptionSourceItemTable
                        sourceId={item.id}
                        source={item}
                        items={item.items}
                        users={users}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
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