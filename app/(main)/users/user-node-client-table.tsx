"use client";

import { useState, useTransition } from "react";
import { ArrowUpDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { type Node as DbNode, type NodeClient } from "@/types";
import { deleteNodeClient } from "../nodes/actions";
import { createColumns } from "./user-node-client-columns";
import { UserNodeClientForm } from "./user-node-client-form";
import { UserNodeClientOrderForm } from "./user-node-client-order-form";

interface UserNodeClientTableProps {
  userId: string;
  items: (NodeClient & { users: { userId: string; enable: boolean; order: number }[] })[];
  nodes: DbNode[];
}

export function UserNodeClientTable({ userId, items, nodes }: UserNodeClientTableProps) {
  const [editingItem, setEditingItem] = useState<NodeClient & { users: { userId: string; enable: boolean; order: number }[] } | null>(null);
  const [deletingItem, setDeletingItem] = useState<NodeClient & { users: { userId: string; enable: boolean; order: number }[] } | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onDelete(item: NodeClient & { users: { userId: string; enable: boolean; order: number }[] }) {
    startTransition(async () => {
      try {
        await deleteNodeClient(item.id);
        toast("删除成功");
        setDeletingItem(null);
      } catch (error) {
        toast("删除失败", {
          description: (error as Error).message,
        });
      }
    });
  }

  const columns = createColumns({
    userId,
    nodes,
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
  });

  return (
    <>
      <div className="py-2">
        <div className="flex mb-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditingOrder(true)}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            编辑顺序
          </Button>
        </div>

        <DataTable 
          columns={columns} 
          data={items.sort((a, b) => {
            const aUser = a.users.find(u => u.userId === userId);
            const bUser = b.users.find(u => u.userId === userId);
            return (aUser?.order ?? 0) - (bUser?.order ?? 0);
          })}
          defaultSorting={[]}
        />
      </div>

      <PopupSheet
        open={Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
          }
        }}
        title="编辑客户端"
      >
        <UserNodeClientForm
          userId={userId}
          nodes={nodes}
          item={editingItem ?? undefined}
          onSuccess={() => {
            setEditingItem(null);
          }}
        />
      </PopupSheet>

      <PopupSheet
        open={isEditingOrder}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingOrder(false);
          }
        }}
        title="编辑顺序"
      >
        <UserNodeClientOrderForm
          userId={userId}
          items={items}
          nodes={nodes}
          onSuccess={() => {
            setIsEditingOrder(false);
          }}
        />
      </PopupSheet>

      <AlertDialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除此客户端吗？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItem) {
                  onDelete(deletingItem);
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
