"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User } from "lucide-react";
import { toast } from "sonner";
import { formatISODate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-rebounce";
import { ModeratorLog } from "@/types/dtos/moderator";
import { ReportableType } from "@/types/dtos/report";
import { getModerratorLog } from "@/services/moderatorService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModeratorLogTableProps {
    targetId?: string;
    targetType?: ReportableType;
}

export default function ModeratorLogTable({ targetId, targetType }: ModeratorLogTableProps) {
    const [data, setData] = useState<ModeratorLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<ModeratorLog>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 hover:bg-transparent">
                    ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-muted-foreground text-sm">{row.original.id}</div>,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Thời gian <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatISODate(row.original.createdAt)}</span>,
        },
        {
            accessorKey: "action",
            header: "Hành động",
            cell: ({ row }) => (
                <Badge variant="outline" className="font-medium">
                    {row.original.action}
                </Badge>
            ),
        },
        {
            accessorKey: "targetType",
            header: "Loại",
            cell: ({ row }) => (
                <Badge variant="secondary" className="text-xs">
                    {targetType}
                </Badge>
            ),
        },
        {
            accessorKey: "targetId",
            header: "ID Mục tiêu",
            cell: ({ row }) =>(
                <div className="text-muted-foreground text-sm">{targetId}</div>
            ),
        },
        {
            accessorKey: "reason",
            header: "Lý do",
            cell: ({ row }) => (
                <div className="max-w-[250px] h-fit whitespace-normal" title={row.original.reason}>
                    {row.original.reason || "—"}
                </div>
            ),
        },
        {
            accessorKey: "actorName",
            header: "Người thực hiện",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                        <AvatarImage src={row.original.actorAvatar} />
                        <AvatarFallback><User size={14} /></AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{row.original.actorName}</span>
                </div>
            ),
        }
    ], []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);
            if (sortStrings.length === 0) sortStrings.push("createdAt,desc");

            const res = await getModerratorLog({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
            }, targetId, targetType);
            console.log(res);
            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải lịch sử hoạt động");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting, targetId, targetType]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, pagination },
        manualPagination: true,
        manualSorting: true,
        rowCount,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div className="w-full space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Lịch sử Kiểm duyệt ({rowCount})</h3>
            <div className="rounded-md border bg-card w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(h => (
                                    <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center h-24">Đang tải...</TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">Không có dữ liệu.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">

                <div className="flex items-center space-x-6 lg:space-x-8 ml-auto">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium hidden sm:block">Hàng/ trang</p>
                        <Select
                            value={`${pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
