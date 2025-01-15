"use client";

import { useState, useTransition } from "react";
import { PlusCircle } from "lucide-react";
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
import { type Node, type NodeClient, type User } from "@/types";
import { deleteNodeClient } from "./actions";
import { createColumns } from "./node-client-columns";
import { NodeClientForm } from "./node-client-form";
import { BatchImportNodeClientDialog } from "./batch-import-node-client-dialog";

interface NodeClientTableProps {
  userId?: string;
  nodeId?: string;
  node?: Node;
  items: NodeClient[];
  nodes: Node[];
  users: User[];
}

export function NodeClientTable({ userId, nodeId: _, node, items, nodes, users }: NodeClientTableProps) {
  const [editingItem, setEditingItem] = useState<NodeClient | null>(null);
  const [deletingItem, setDeletingItem] = useState<NodeClient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onDelete(item: NodeClient) {
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
    nodes,
    users,
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
  });

  return (
    <>
      <div className="py-2">
        <div className="flex gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加客户端
          </Button>
          <BatchImportNodeClientDialog
            userId={userId}
            node={node}
            nodes={nodes}
            users={users}
          />
        </div>

        <DataTable 
          columns={columns} 
          data={items} 
        />
      </div>

      <PopupSheet
        open={Boolean(editingItem) || isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setIsCreating(false);
          }
        }}
        title={editingItem ? "编辑客户端" : "添加客户端"}
      >
        <NodeClientForm
          userId={userId}
          nodes={node ? [node] : nodes}
          users={users}
          item={editingItem ?? undefined}
          onSuccess={() => {
            setEditingItem(null);
            setIsCreating(false);
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
