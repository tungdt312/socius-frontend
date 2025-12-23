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
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight, ExternalLink,
    LockKeyhole,
    ShieldAlert,
    Unlock
} from "lucide-react"; // Icons cho AccessModifier
import {toast} from "sonner";
import {useDebounce} from "@/hooks/use-rebounce";
import {TablePagination} from "@/components/moderator/FlaggedCommentTable";
import {ModeratorUser} from "@/types/dtos/moderator";
import {getUsers} from "@/services/moderatorService";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Link from "next/link";

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
            accessorKey: "id",
            header: ({column}) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 hover:bg-transparent">
                    ID <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => <div className="text-muted-foreground">{row.original.userId}</div>,
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
            accessorKey: "violationCount",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Số lượng báo cáo <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <p className="font-bold"> {row.original.violationCount}</p>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({row}) => {
                const status = row.original.status;
                const statusConfig: Record<string, any> = {
                    ACTIVE: {label: "Hoạt động", variant: "default", className: "bg-green-600"},
                    BLOCKED: {label: "Đã khóa", variant: "destructive"},
                    PENDING: {label: "Chờ xác nhận", variant: "secondary", className: "bg-yellow-100 text-yellow-800"},
                    NOT_AUTHORIZED: {label: "Chờ cấp quyền", variant: "secondary"},
                    NOT_SOLVED: {label: "Chờ xử lý", variant: "secondary", className: "bg-yellow-100 text-yellow-800"},
                };
                const config = statusConfig[status] || statusConfig["NOT_SOLVED"];
                return <Badge variant={config.variant}
                              className={`capitalize ${config.className}`}>{config.label}</Badge>;
            },
        },{
            accessorKey: "action",
            header: ({ column }) => (
                <div></div>
            ),
            cell: ({ row }) =>
                <Link href={`/moderator/user/${row.original.userId}`} target={"_blank"} > <ExternalLink className={"text-muted-foreground size-4"}/> </Link>,
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
                filter: debouncedSearch ? `displayName=ilike='${debouncedSearch}'` : undefined
            });

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
            console.log(res);
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
                            : table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                </TableRow>
                            )) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Không có dữ liệu.</TableCell></TableRow>
                )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground hidden sm:block">
                    {/* Logic hiển thị row selected chỉ đúng trên trang hiện tại với server-side */}
                    Đã chọn {Object.keys(rowSelection).length} hàng.
                </div>
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
                                <SelectValue placeholder={pagination.pageSize}/>
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
                            <span className="sr-only">Trang đầu</span>
                            <ChevronsLeft className="size-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Trang trước</span>
                            <ChevronLeft className="size-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Trang sau</span>
                            <ChevronRight className="size-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Trang cuối</span>
                            <ChevronsRight className="size-4"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}