"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CollapseDisplay } from "@/components/collapse-display";
import { DateTime } from "@/components/date-time";
import { IdBadge } from "@/components/id-badge";
import { PopupSheet } from "@/components/popup-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Node, type NodeClient, type User } from "@/types";
import { deleteUser } from "./actions";
import { UserForm } from "./user-form";
import { UserNodeClientTable } from "./user-node-client-table";

interface UserTableProps {
  users: User[];
  items: NodeClient[];
  nodes: Node[];
}

export function UserTable({ users, items, nodes }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [baseUrl, setBaseUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  function onDelete(user: User) {
    startTransition(async () => {
      try {
        await deleteUser(user.id);
        toast("删除成功");
        setDeletingUser(null);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  function toggleExpand(id: string) {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id);
    } else {
      newExpandedItems.add(id);
    }
    setExpandedItems(newExpandedItems);
  }

  function getSubscriptionUrl(subscriptionKey: string) {
    return baseUrl ? `${baseUrl}/sub/${subscriptionKey}` : "";
  }

  // Group items by user id
  const itemsByUser = items.reduce(
    (acc, item) => {
      const userId = item.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(item);
      return acc;
    },
    {} as Record<string, NodeClient[]>
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>订阅链接</TableHead>
            <TableHead>订阅转换器</TableHead>
            <TableHead>Clash 配置</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <>
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(user.id)}>
                        {expandedItems.has(user.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="sr-only">展开</span>
                      </Button>
                      <span className="text-sm text-muted-foreground">({itemsByUser[user.id]?.length || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <IdBadge id={user.id} />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{baseUrl && <CollapseDisplay url={getSubscriptionUrl(user.subscriptionKey)} />}</TableCell>
                  <TableCell>{user.subconverterId ? <IdBadge id={user.subconverterId} /> : "-"}</TableCell>
                  <TableCell>{user.mergeConfigId ? <IdBadge id={user.mergeConfigId} /> : "-"}</TableCell>
                  <TableCell>
                    <DateTime date={user.createdAt} />
                  </TableCell>
                  <TableCell>
                    <DateTime date={user.updatedAt} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">编辑</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingUser(user)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">删除</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedItems.has(user.id) && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0 pl-20">
                      <UserNodeClientTable userId={user.id} items={itemsByUser[user.id] || []} nodes={nodes} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </Table>

      <PopupSheet open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)} title="编辑用户">
        <UserForm user={editingUser ?? undefined} onSuccess={() => setEditingUser(null)} />
      </PopupSheet>

      <AlertDialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除用户 {deletingUser?.name} 吗？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingUser) {
                  onDelete(deletingUser);
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
  );
}
