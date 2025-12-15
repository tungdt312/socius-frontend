"use client";

import React, {useEffect, useMemo, useState} from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ArrowUpDown, Loader, MoreHorizontal, User} from "lucide-react";
import {toast} from "sonner";
import {formatISODate} from "@/lib/utils";
import {useDebounce} from "@/hooks/use-rebounce";
import {CommentResponse} from "@/types/dtos/post";
import {getComments} from "@/services/moderatorService"; // Giả định util này

export default function FlaggedCommentTable() {
    // 1. Data States
    const [data, setData] = useState<CommentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);

    // 2. Control States
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // 3. Define Columns
    const columns: ColumnDef<CommentResponse>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                />
            ),
            size: 40,
            enableSorting: false,
        },
        {
            accessorKey: "content",
            header: "Nội dung",
            cell: ({ row }) => (
                <div className="max-w-[300px] space-y-1">
                    <p className="truncate font-medium">{row.original.content || "Chỉ có hình ảnh/video"}</p>
                    {row.original.media && row.original.media.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">Có đính kèm file</Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "authorName",
            header: "Người đăng",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                        <AvatarImage src={row.original.authorAvatar} />
                        <AvatarFallback><User size={12} /></AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{row.original.authorName}</span>
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
                    Ngày tạo <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-muted-foreground text-sm">{formatISODate(row.original.createdAt)}</div>,
        },
        {
            accessorKey: "stats",
            header: "Tương tác",
            cell: ({ row }) => (
                <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>❤️ {row.original.reactCount}</span>
                    <span>💬 {row.original.childrenCount}</span>
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="ghost" size="icon"><MoreHorizontal className="size-4"/></Button>
                // Thêm Dropdown menu actions (Xóa, Bỏ qua báo cáo) ở đây
            ),
        },
    ], []);

    // 4. Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Mapping sort state sang string array cho API
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);

            // Nếu không sort thì mặc định mới nhất trước
            if (sortStrings.length === 0) sortStrings.push("createdAt,desc");

            const res = await getComments({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
                // Giả định API hỗ trợ filter search content
                filter: debouncedSearch ? `content=ilike='${debouncedSearch}'` : undefined
            });

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải danh sách bình luận");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch]);

    // 5. Setup Table
    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, pagination },
        manualPagination: true,
        manualSorting: true,
        rowCount,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div className="w-full space-y-4 pt-6">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Tìm nội dung bình luận..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, pageIndex: 0 })); }}
                    className="max-w-sm"
                />
                {/* Cột hiển thị & Actions khác */}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><Loader className="animate-spin inline-block mr-2" /> Đang tải...</TableCell></TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Không có dữ liệu.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Control (Tái sử dụng code pagination từ UserTable) */}
            <TablePagination table={table} />
        </div>
    );
}

// Component Pagination dùng chung để code gọn hơn
export function TablePagination({ table }: { table: any }) {
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} hàng đang chọn.
            </div>
            <div className="space-x-2 flex items-center">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Trước</Button>
                <div className="text-sm">Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</div>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Sau</Button>
            </div>
        </div>
    )
}