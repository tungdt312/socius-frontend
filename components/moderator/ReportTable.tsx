// ReportTable.tsx
"use client";

import React, {useEffect, useMemo, useState} from "react";
import {ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable,} from "@tanstack/react-table";
import {ArrowUpDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {toast} from "sonner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {formatISODate} from "@/lib/utils";
import {ComplaintStatus, ReportableType, ReportReason, ReportResponse, ReportStatus} from "@/types/dtos/report";
import {getReportsByContent} from "@/services/moderatorService";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";

interface ReportTableProps {
    targetId: string;
    targetType: ReportableType;
}

// Map để hiển thị trạng thái báo cáo bằng tiếng Việt
const REPORT_STATUS_CONFIG: Record<ReportStatus, { label: string, variant: 'default' | 'destructive' | 'secondary' }> = {
    PENDING: {label: "Đang chờ xử lý", variant: "secondary"},
    APPROVED: {label: "Đã xử lý", variant: "default"},
    REJECTED: {label: "Đã từ chối", variant: "destructive"},
};

// Map để hiển thị lý do báo cáo bằng tiếng Việt
// (Sử dụng lại REASON_LABELS từ ví dụ trước)
const REASON_LABELS: Record<ReportReason, string> = {
    [ReportReason.SPAM]: 'Tin rác (Spam)',
    [ReportReason.HATE_SPEECH]: 'Ngôn từ thù địch',
    [ReportReason.HARASSMENT]: 'Quấy rối',
    [ReportReason.NUDITY]: 'Ảnh khỏa thân / Khiêu dâm',
    [ReportReason.VIOLENCE]: 'Bạo lực',
    [ReportReason.TERRORISM]: 'Khủng bố',
    [ReportReason.COPYRIGHT_VIOLATION]: 'Vi phạm bản quyền',
    [ReportReason.OTHER]: 'Vấn đề khác',
};


export const ReportTable = ({targetId, targetType}: ReportTableProps) => {
    const [data, setData] = useState<ReportResponse[]>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10});
    const [sorting, setSorting] = useState<SortingState>([{id: 'createdAt', desc: true}]);


    const columns: ColumnDef<ReportResponse>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => {
                // 1. Lấy danh sách các hàng ở trang hiện tại có trạng thái PENDING
                const rows = table.getRowModel().rows;
                const pendableRows = rows.filter(row => row.original.status === ReportStatus.PENDING);

                // 2. Kiểm tra xem tất cả các hàng PENDING đã được chọn chưa
                const isAllPendableSelected =
                    pendableRows.length > 0 &&
                    pendableRows.every(row => row.getIsSelected());

                // 3. Kiểm tra trạng thái "chọn một phần" (indeterminate)
                const isSomePendableSelected =
                    pendableRows.some(row => row.getIsSelected()) && !isAllPendableSelected;

                return (
                    <Checkbox
                        checked={isAllPendableSelected}
                        // Sử dụng thuộc tính này để hiện dấu "-" khi chọn một phần (nếu thư viện UI hỗ trợ)
                        // indeterminate={isSomePendableSelected}
                        onCheckedChange={(value) => {
                            // 4. Chỉ thực hiện toggle trên những hàng thỏa mãn điều kiện PENDING
                            pendableRows.forEach(row => row.toggleSelected(!!value));
                        }}
                        // Disable nút chọn tất cả nếu không có hàng nào là PENDING
                        disabled={pendableRows.length === 0}
                        aria-label="Chọn tất cả hàng đang chờ"
                    />
                );
            },
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    // Chỉ cho phép chọn thủ công hàng nếu ở trạng thái PENDING
                    disabled={row.original.status !== ReportStatus.PENDING}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Chọn hàng"
                />)
        },
        {
            accessorKey: "reporterName",
            header: "Người báo cáo",
            cell: ({row}) => (
                <div className="flex items-center gap-2 text-foreground">
                    {row.original.reporterName && <Avatar className="size-8">
                        <AvatarImage src={row.original.reporterAvatar} className={"object-cover"}/>
                        <AvatarFallback>{row.original.reporterName?.charAt(0)}</AvatarFallback>
                    </Avatar> }
                    <span className="text-sm font-medium">{row.original.reporterName || "AI hệ thống"} </span>
                </div>
            ),
        },
        {
            accessorKey: "reason",
            header: "Lý do",
            cell: ({row}) => {
                const reason = row.original.reason;
                const customReason = row.original.customReason;
                const label = REASON_LABELS[reason] || reason;
                return (
                    <div className="flex flex-col max-w-xs">
                        <span className="font-semibold">{label}</span>
                        {customReason && <span className="text-xs text-muted-foreground italic">({customReason})</span>}
                    </div>
                );
            },
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
                const config = REPORT_STATUS_CONFIG[row.original.status] || REPORT_STATUS_CONFIG.PENDING;
                return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>;
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const isPending = row.original.status === "PENDING";
                if (!isPending) return null;

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8 bg-green-600 text-white"
                            onClick={() => handleUpdateStatus([row.original.id], ReportStatus.APPROVED)}
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8 bg-red-600 text-white"
                            onClick={() => handleUpdateStatus([row.original.id], ReportStatus.REJECTED)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
        // Thêm cột Action để Moderation có thể xử lý (tùy chọn)
    ], []);

    const handleUpdateStatus = async (ids: string[], status: ReportStatus) => {
        try {
            setIsLoading(true);
            // Gọi service update ở đây (Ví dụ: updateReportStatus(ids, status))
            toast.success(`Đã ${status === ReportStatus.APPROVED ? "chấp nhận" : "từ chối"} ${ids.length} báo cáo`);
            setRowSelection({}); // Reset chọn hàng
            await fetchData();
        } catch (error) {
            toast.error("Thao tác thất bại");
        } finally {
            setIsLoading(false);
        }
    };
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);

            const res = await getReportsByContent(targetId, targetType, {
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
                // Không thêm filter vì bảng này chỉ lọc theo targetId/targetType
            });

            console.log(res);
            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải danh sách báo cáo");
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
        data, columns,
        manualPagination: true, manualSorting: true, rowCount,
        onPaginationChange: setPagination, onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id,
        state: { sorting, pagination, rowSelection },
        onRowSelectionChange: setRowSelection,
    });


    return (
        <div className="w-full space-y-4 pt-6 ov">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Danh sách Báo cáo ({rowCount})</h3>
                {/* Nút thao tác hàng loạt */}
                {Object.keys(rowSelection).length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <span className="text-sm text-muted-foreground mr-2">
                            Đã chọn {Object.keys(rowSelection).length} mục:
                        </span>
                        <Button size="sm" variant="default"
                                onClick={() => handleUpdateStatus(table.getSelectedRowModel().rows.map(r => r.original.id), ReportStatus.APPROVED)}>
                            Chấp nhận
                        </Button>
                        <Button size="sm" variant="destructive"
                                onClick={() => handleUpdateStatus(table.getSelectedRowModel().rows.map(r => r.original.id), ReportStatus.REJECTED)}>
                            Từ chối
                        </Button>
                    </div>
                )}
            </div>
            <div className="rounded-md border bg-card overflow-x-auto">
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
                                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">Không có báo cáo nào.</TableCell></TableRow>
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