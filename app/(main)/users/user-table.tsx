"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
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
import { type Node, type NodeClient, type User, type ClashConfig } from "@/types";
import { deleteUser } from "./actions";
import { createColumns } from "./columns";
import { UserForm } from "./user-form";
import { UserNodeClientTable } from "./user-node-client-table";

interface UserTableProps {
  users: User[];
  items: NodeClient[];
  nodes: Node[];
  clashConfigs: ClashConfig[];
}

export function UserTable({ users, items, nodes, clashConfigs }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
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

  const columns = createColumns({
    baseUrl,
    onEdit: setEditingUser,
    onDelete: setDeletingUser,
    clashConfigs,
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        expandedContent={(user) => (
          <UserNodeClientTable userId={user.id} items={itemsByUser[user.id] || []} nodes={nodes} />
        )}
        expandedTitle={(user) => {
          const count = itemsByUser[user.id]?.length || 0;
          return `用户 ${user.name} 的客户端列表 (${count})`;
        }}
        enableColumnVisibility
        enableGlobalSearch
        getItemCount={(user) => itemsByUser[user.id]?.length || 0}
      />

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
