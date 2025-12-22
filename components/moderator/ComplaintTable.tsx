// ComplaintTable.tsx
"use client";

import React, {useEffect, useMemo, useState} from "react";
import {ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable,} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    MessageCircle, User
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {toast} from "sonner"; // Giả định service
import {formatISODate} from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ComplaintResponse, ComplaintStatus, ReportableType } from "@/types/dtos/report";
import {getComplaintsByContent} from "@/services/moderatorService";

interface ComplaintTableProps {
    targetId: string;
    targetType: ReportableType;
}

// Map để hiển thị trạng thái khiếu nại bằng tiếng Việt
const COMPLAINT_STATUS_CONFIG: Record<ComplaintStatus, { label: string, variant: 'default' | 'destructive' | 'secondary' }> = {
    PENDING: {label: "Đang chờ phản hồi", variant: "secondary"},
    APPROVED_RESTORE: {label: "Đã phản hồi", variant: "default"},
    REJECTED_KEEP: {label: "Không hợp lệ", variant: "destructive"},
};


export const ComplaintTable = ({targetId, targetType}: ComplaintTableProps) => {
    const [data, setData] = useState<ComplaintResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10});
    const [sorting, setSorting] = useState<SortingState>([{id: 'createdAt', desc: true}]);


    const columns: ColumnDef<ComplaintResponse>[] = useMemo(() => [
        {
            accessorKey: "userDisplayName",
            header: "Người khiếu nại",
            cell: ({row}) => (
                <div className="flex items-center gap-1">
                    <User className="size-4 text-muted-foreground"/>
                    <span className="text-sm font-medium">{row.original.userDisplayName}</span>
                </div>
            ),
        },
        {
            accessorKey: "content",
            header: "Nội dung khiếu nại",
            cell: ({row}) => (
                <div className="flex flex-col max-w-md">
                    <span className="text-sm line-clamp-2" title={row.original.content}>{row.original.content}</span>
                    {row.original.adminResponse && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-blue-600 dark:text-blue-400 italic bg-blue-50 dark:bg-gray-800 p-1 rounded">
                            <MessageCircle className="size-3 flex-shrink-0 mt-0.5"/>
                            <span className="line-clamp-1" title={row.original.adminResponse}>{row.original.adminResponse}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({column}) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 hover:bg-transparent">
                    Thời gian <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => <div className="text-muted-foreground text-sm">{formatISODate(row.original.createdAt)}</div>,
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({row}) => {
                const config = COMPLAINT_STATUS_CONFIG[row.original.status] || COMPLAINT_STATUS_CONFIG.PENDING;
                return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>;
            },
        },
        // Thêm cột Action để Admin/Mod có thể phản hồi
    ], []);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);

            // Dùng hàm fetch Complaint đã sửa đường dẫn
            const res = await getComplaintsByContent(targetId, targetType, {
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
            });

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải danh sách khiếu nại");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (targetId && targetType) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageIndex, pagination.pageSize, sorting, targetId, targetType]);


    const table = useReactTable({
        data, columns, state: {sorting, pagination},
        manualPagination: true, manualSorting: true, rowCount,
        onPaginationChange: setPagination, onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id,
    });


    return (
        <div className="w-full space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Danh sách Khiếu nại ({rowCount})</h3>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={columns.length} className="text-center h-24">
                                <Loader2 className="animate-spin inline-block mr-2"/> Đang tải...
                            </TableCell></TableRow>
                            : table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">Không có khiếu nại nào.</TableCell></TableRow>
                            )}
                    </TableBody>
                </Table>
            </div>
            {/* Giả định component TablePagination hoạt động với tanstack table */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground hidden sm:block">
                    {/* Logic hiển thị row selected chỉ đúng trên trang hiện tại với server-side */}
                    {/*Đã chọn {Object.keys(rowSelection).length} hàng.*/}
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