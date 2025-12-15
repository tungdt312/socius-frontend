"use client";
// ... Imports ...

import React, {useEffect, useMemo, useState} from "react";
import {ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable,} from "@tanstack/react-table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ArrowUpDown, LockKeyhole, ShieldAlert, Unlock} from "lucide-react"; // Icons cho AccessModifier
import {toast} from "sonner";
import {useDebounce} from "@/hooks/use-rebounce";
import {TablePagination} from "@/components/moderator/FlaggedCommentTable";
import {ModeratorUser} from "@/types/dtos/moderator";
import {getUsers} from "@/services/moderatorService";

export default function ModeratorUserTable() {
    // States
    const [data, setData] = useState<ModeratorUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<ModeratorUser>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />
            ),
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            size: 40,
        },
        {
            accessorKey: "displayName",
            header: "Người dùng",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 border">
                        <AvatarImage src={row.original.avatar} />
                        <AvatarFallback>{row.original.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{row.original.displayName}</span>
                        <span className="text-xs text-muted-foreground">@{row.original.username}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="text-muted-foreground">{row.original.email}</div>,
        },
        {
            accessorKey: "reportCount",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Số lượng báo cáo <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <ShieldAlert className={`size-4 ${row.original.reportCount > 5 ? "text-red-500" : "text-yellow-500"}`} />
                    <span className="font-bold">{row.original.reportCount}</span>
                </div>
            ),
        },
        {
            accessorKey: "locked",
            header: "Trạng thái",
            cell: ({ row }) => (
                row.original.locked ? (
                    <Badge variant="destructive" className="flex w-fit items-center gap-1"><LockKeyhole className="size-3" /> Đang khóa</Badge>
                ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex w-fit items-center gap-1"><Unlock className="size-3" /> Hoạt động</Badge>
                )
            ),
        },
        // Thêm cột Action để xử lý Mở khóa/Khóa nhanh
    ], []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);
            // Mặc định sort theo số lượng report giảm dần để Mod dễ xử lý
            if (sortStrings.length === 0) sortStrings.push("reportCount,desc");

            const res = await getUsers({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
                filter: debouncedSearch ? `displayName~'${debouncedSearch}'` : undefined
            });

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch]);

    const table = useReactTable({
        data, columns, state: { sorting, pagination, rowSelection },
        manualPagination: true, manualSorting: true, rowCount,
        onPaginationChange: setPagination, onSortingChange: setSorting, onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.userId, // Lưu ý ID là userId
    });

    return (
        <div className="w-full space-y-4 pt-6">
            <Input placeholder="Tìm theo tên hiển thị..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={columns.length} className="text-center h-24">Đang tải...</TableCell></TableRow>
                            : table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
            <TablePagination table={table} />
        </div>
    );
}