"use client";

import { useState, useTransition } from "react";
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
import { type Subconverter } from "@/types";
import { deleteSubconverter } from "./actions";
import { createColumns } from "./columns";
import { SubconverterForm } from "./subconverter-form";

interface SubconverterTableProps {
  subconverters: Subconverter[];
}

export function SubconverterTable({ subconverters }: SubconverterTableProps) {
  const [editingItem, setEditingItem] = useState<Subconverter | null>(null);
  const [deletingItem, setDeletingItem] = useState<Subconverter | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete(item: Subconverter) {
    startTransition(async () => {
      try {
        await deleteSubconverter(item.id);
        toast("删除成功");
        setDeletingItem(null);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  const columns = createColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
  });

  return (
    <>
      <DataTable 
        columns={columns} 
        data={subconverters} 
        enableColumnVisibility
        enableGlobalSearch
      />

      <PopupSheet open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)} title="编辑订阅转换器">
        <SubconverterForm subconverter={editingItem ?? undefined} onSuccess={() => setEditingItem(null)} />
      </PopupSheet>

      <AlertDialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除此订阅转换器吗？此操作不可撤销。</AlertDialogDescription>
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
