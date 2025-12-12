"use client";

import { useState, useMemo, useEffect } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter,
    CheckCircle,
    XCircle,
    RotateCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

// IMPORTS TỪ PROJECT CỦA BẠN
import { ReportDTO, ReportStatus, ReportableType } from "@/types/dtos/report";
import { PageRequest } from "@/types/dtos/base";
import { getReport, reviewReport } from "@/services/reportService";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportActionMenu } from "./ReportActionMenu"; // Import file vừa tạo ở trên

// --- CONFIG HIỂN THỊ ---
const TARGET_TYPE_LABELS: Record<ReportableType, string> = {
    [ReportableType.USER]: 'Người dùng',
    [ReportableType.POST]: 'Bài viết',
    [ReportableType.COMMENT]: 'Bình luận',
    [ReportableType.MESSAGE]: 'Tin nhắn',
};

const REPORT_REASON_LABELS: Record<string, string> = {
    SPAM: 'Spam / Tin rác',
    HATE_SPEECH: 'Ngôn từ thù địch',
    HARASSMENT: 'Quấy rối',
    NUDITY: 'Hình ảnh nhạy cảm',
    VIOLENCE: 'Bạo lực',
    TERRORISM: 'Khủng bố',
    COPYRIGHT_VIOLATION: 'Vi phạm bản quyền',
    OTHER: 'Khác',
};

export default function ReportTable() {
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [data, setData] = useState<ReportDTO[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // 2. STATE QUẢN LÝ BẢNG & FILTER
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

    // Filter riêng biệt
    const [activeTab, setActiveTab] = useState<ReportStatus>(ReportStatus.PENDING);
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    // 3. ĐỊNH NGHĨA CỘT
    const columns: ColumnDef<ReportDTO>[] = useMemo(() => [
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
            size: 30,
            enableSorting: false,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
                    Ngày tạo <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-xs text-muted-foreground">{format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}</div>,
        },
        {
            accessorKey: "targetType",
            header: "Loại",
            cell: ({ row }) => <Badge variant="outline">{TARGET_TYPE_LABELS[row.original.targetType]}</Badge>,
        },
        {
            accessorKey: "reason",
            header: "Lý do báo cáo",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[250px]">
                    <span className="font-medium text-sm">{REPORT_REASON_LABELS[row.original.reason] ?? row.original.reason}</span>
                    {row.original.customReason && (
                        <span className="text-xs text-muted-foreground italic truncate" title={row.original.customReason}>
                            "{row.original.customReason}"
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "reporterName",
            header: "Người báo cáo",
            cell: ({ row }) => <span className="text-sm">{row.original.reporterName}</span>,
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const s = row.original.status;
                if (s === ReportStatus.APPROVED) return <Badge variant="destructive">Vi phạm</Badge>;
                if (s === ReportStatus.REJECTED) return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Đã bỏ qua</Badge>;
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Chờ xử lý</Badge>;
            },
        },
        {
            accessorKey: "reviewerId",
            header: "Người xử lý",
            cell: ({ row }) => {
                const id = row.original.reviewerId;
                // Nếu null (Status PENDING) thì hiện dấu gạch
                if (!id) return <span className="text-muted-foreground">-</span>;

                // Nếu có ID, hiển thị (hoặc gọi API lấy tên Mod nếu cần)
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-mono">ID: {id}</span>
                    </div>
                );
            },
        },

        // Cột Ghi chú của Mod
        {
            accessorKey: "moderatorNotes",
            header: "Ghi chú xử lý",
            cell: ({ row }) => {
                const note = row.original.moderatorNotes;
                if (!note) return <span className="text-muted-foreground text-xs italic">Không có</span>;

                return (
                    <div className="max-w-[200px] truncate text-sm" title={note}>
                        {note}
                    </div>
                );
            },
        },

        // Cột Thời gian xử lý
        {
            accessorKey: "reviewedAt",
            header: "Ngày xử lý",
            cell: ({ row }) => {
                const date = row.original.reviewedAt;
                if (!date) return <span className="text-muted-foreground">-</span>;
                return <span className="text-xs">{format(new Date(date), "dd/MM/yyyy HH:mm")}</span>;
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => <ReportActionMenu report={row.original} onSuccess={fetchData} />,
        },
    ], []);

    // 4. HÀM FETCH DATA (QUAN TRỌNG)
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Chuyển đổi Sorting State -> API format (VD: "createdAt,desc")
            const sortParams = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);

            // Xây dựng Filter String (VD: "targetType=='POST'")
            let filterString = "";
            if (typeFilter !== "ALL") {
                filterString = `targetType=='${typeFilter}'`;
            }

            // Tạo Request Object
            const request: PageRequest = {
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortParams,
                filter: filterString || undefined
            };

            // Gọi API
            const res = await getReport(activeTab, request);

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu báo cáo");
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger fetch khi thay đổi bất kỳ điều kiện nào
    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting, activeTab, typeFilter]);

    // 5. HÀM XỬ LÝ HÀNG LOẠT (BULK ACTION)
    const handleBulkAction = async (status: ReportStatus) => {
        const ids = Object.keys(rowSelection);
        if (ids.length === 0) return;

        // Dùng Promise.all để gọi song song (nếu chưa có API bulk)
        await Promise.all(ids.map(id => reviewReport(id, {
            status,
            moderatorNotes: `Xử lý hàng loạt: ${status}`
        })));

        toast.success(`Đã xử lý xong ${ids.length} báo cáo`);
        setRowSelection({});
        fetchData();
    };

    // 6. CẤU HÌNH TABLE
    const table = useReactTable({
        data,
        columns,
        state: { sorting, rowSelection, pagination },
        manualPagination: true, // Server-side Pagination
        manualSorting: true,    // Server-side Sorting
        rowCount: rowCount,     // Tổng số dòng từ Server
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div className="w-full space-y-4 pt-6">
            <Tabs
                value={activeTab}
                className="w-full flex-col justify-start gap-6"
                onValueChange={(val) => {
                    setActiveTab(val as ReportStatus);
                    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset về trang 1 khi đổi Tab
                    setRowSelection({});
                }}
            >
                {/* TOOLBAR */}
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <TabsList>
                        <TabsTrigger value={ReportStatus.PENDING}>Chờ xử lý</TabsTrigger>
                        <TabsTrigger value={ReportStatus.APPROVED}>Lịch sử Vi phạm</TabsTrigger>
                        <TabsTrigger value={ReportStatus.REJECTED}>Lịch sử Bỏ qua</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* Filter Loại */}
                        <Select value={typeFilter} onValueChange={(val) => {
                            setTypeFilter(val);
                            setPagination(prev => ({ ...prev, pageIndex: 0 }));
                        }}>
                            <SelectTrigger className="w-[160px]">
                                <div className="flex items-center gap-2">
                                    <Filter className="size-4" />
                                    <SelectValue placeholder="Loại đối tượng" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả</SelectItem>
                                {Object.values(ReportableType).map(t => (
                                    <SelectItem key={t} value={t}>{TARGET_TYPE_LABELS[t]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Nút Refresh */}
                        <Button variant="outline" size="icon" onClick={() => fetchData()} title="Tải lại">
                            <RotateCcw className={`size-4 ${isLoading ? "animate-spin" : ""}`}/>
                        </Button>

                        {/* Bulk Actions - Chỉ hiện khi chọn dòng & ở Tab Pending */}
                        {Object.keys(rowSelection).length > 0 && activeTab === ReportStatus.PENDING && (
                            <>
                                <ConfirmDialog
                                    title="Duyệt vi phạm hàng loạt"
                                    description={`Bạn có chắc muốn đánh dấu ${Object.keys(rowSelection).length} báo cáo là VI PHẠM?`}
                                    onConfirm={() => handleBulkAction(ReportStatus.APPROVED)}
                                >
                                    <Button variant="destructive" size="sm" className="animate-in fade-in zoom-in">
                                        <CheckCircle className="mr-2 size-4"/> Duyệt ({Object.keys(rowSelection).length})
                                    </Button>
                                </ConfirmDialog>

                                <ConfirmDialog
                                    title="Bỏ qua hàng loạt"
                                    description={`Bạn có chắc muốn BỎ QUA ${Object.keys(rowSelection).length} báo cáo này?`}
                                    onConfirm={() => handleBulkAction(ReportStatus.REJECTED)}
                                >
                                    <Button variant="outline" size="sm" className="animate-in fade-in zoom-in">
                                        <XCircle className="mr-2 size-4"/> Bỏ qua ({Object.keys(rowSelection).length})
                                    </Button>
                                </ConfirmDialog>
                            </>
                        )}
                    </div>
                </div>

                {/* TABLE */}
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
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader2 className="animate-spin inline-block mr-2" /> Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Không có dữ liệu báo cáo nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {Object.keys(rowSelection).length > 0 && `Đã chọn ${Object.keys(rowSelection).length} dòng.`}
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </div>
                        <div className="flex items-center space-x-2">
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
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}