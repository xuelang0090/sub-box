"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";

import { CollapseDisplay } from "@/components/collapse-display";
import { DateTime } from "@/components/date-time";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { IdBadge } from "@/components/id-badge";
import { Button } from "@/components/ui/button";
import { type Node, type NodeClient, type User } from "@/types";

interface NodeClientActionsProps {
  client: NodeClient;
  onEdit: (client: NodeClient) => void;
  onDelete: (client: NodeClient) => void;
}

function NodeClientActions({ client, onEdit, onDelete }: NodeClientActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => onEdit(client)}>
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">编辑</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(client)}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">删除</span>
      </Button>
    </div>
  );
}

interface CreateColumnsOptions {
  nodes: Node[];
  users: User[];
  onEdit: (client: NodeClient) => void;
  onDelete: (client: NodeClient) => void;
}

export function createColumns({ nodes: _, users, onEdit, onDelete }: CreateColumnsOptions): ColumnDef<NodeClient, unknown>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <IdBadge id={row.original.id} />,
      meta: {
        title: "ID",
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="用户" />,
      cell: ({ row }) => users.find((u) => u.id === row.original.userId)?.name || "-",
      meta: {
        title: "用户",
      },
    },
    {
      accessorKey: "url",
      header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
      cell: ({ row }) => <CollapseDisplay url={row.original.url} />,
      meta: {
        title: "URL",
      },
    },
    {
      accessorKey: "enable",
      header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
      cell: ({ row }) => (row.original.enable ? "启用" : "禁用"),
      meta: {
        title: "状态",
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="更新时间" />,
      cell: ({ row }) => <DateTime date={row.original.updatedAt} />,
      meta: {
        title: "更新时间",
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => <NodeClientActions client={row.original} onEdit={onEdit} onDelete={onDelete} />,
      meta: {
        title: "操作",
      },
      enableHiding: false,
    },
  ];
} 