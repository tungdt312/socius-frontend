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
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight, ExternalLink,
    Loader,
    MoreHorizontal,
    User
} from "lucide-react";
import {toast} from "sonner";
import {formatISODate} from "@/lib/utils";
import {useDebounce} from "@/hooks/use-rebounce";
import {CommentResponse} from "@/types/dtos/post";
import {getComments} from "@/services/moderatorService";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Link from "next/link"; // Giả định util này

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
            accessorKey: "id",
            header: ({column}) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 hover:bg-transparent">
                    ID <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => <div className="text-muted-foreground">{row.original.id}</div>,
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
            accessorKey: "action",
            header: ({ column }) => (
                <div></div>
            ),
            cell: ({ row }) =>
                <Link href={`/moderator/reports/comment/${row.original.id}`} target={"_blank"} > <ExternalLink className={"text-muted-foreground size-4"}/> </Link>,
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