"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";

import { CollapseDisplay } from "@/components/collapse-display";
import { DateTime } from "@/components/date-time";
import { IdBadge } from "@/components/id-badge";
import { Button } from "@/components/ui/button";
import { type User } from "@/types";

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function UserActions({ user, onEdit, onDelete }: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">编辑</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">删除</span>
      </Button>
    </div>
  );
}

interface CreateColumnsOptions {
  baseUrl: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function createColumns({ baseUrl, onEdit, onDelete }: CreateColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <IdBadge id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: "名称",
    },
    {
      accessorKey: "subscriptionKey",
      header: "订阅链接",
      cell: ({ row }) => baseUrl && <CollapseDisplay url={`${baseUrl}/sub/${row.original.subscriptionKey}`} />,
    },
    {
      accessorKey: "subconverterId",
      header: "订阅转换器",
      cell: ({ row }) => (row.original.subconverterId ? <IdBadge id={row.original.subconverterId} /> : "-"),
    },
    {
      accessorKey: "mergeConfigId",
      header: "Clash 配置",
      cell: ({ row }) => (row.original.mergeConfigId ? <IdBadge id={row.original.mergeConfigId} /> : "-"),
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => <DateTime date={row.original.createdAt} />,
    },
    {
      accessorKey: "updatedAt",
      header: "更新时间",
      cell: ({ row }) => <DateTime date={row.original.updatedAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <UserActions user={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
} 