"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    ColumnDef,
    getCoreRowModel,
    PaginationState,
    SortingState,
    VisibilityState,
    useReactTable,
    flexRender,
} from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft, ChevronsRight,
    FileImage,
    Loader,
    MessageSquareWarning,
    User
} from "lucide-react";
import { toast } from "sonner";
import { formatISODate } from "@/lib/utils";
// Import Type và API của bạn
import Image from "next/image";
import {ModeratorMessage} from "@/types/dtos/moderator";
import {useDebounce} from "@/hooks/use-rebounce";
import {getMessageById, getMessages} from "@/services/moderatorService";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

// --- 1. Sub-component: Xem chi tiết tin nhắn (Drawer) ---
const MessageDetailSheet = ({ messageId, onClose }: { messageId: string, onClose: () => void }) => {
    const [detail, setDetail] = useState<ModeratorMessage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messageId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await getMessageById(messageId);
                setDetail(res);
            } catch (error) {
                toast.error("Không thể tải chi tiết tin nhắn");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [messageId, onClose]);

    if (!messageId) return null;

    return (
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="mb-6">
                <SheetTitle>Chi tiết tin nhắn vi phạm</SheetTitle>
                <SheetDescription>ID: {messageId}</SheetDescription>
            </SheetHeader>

            {loading ? (
                <div className="flex justify-center py-10"><Loader className="animate-spin" /></div>
            ) : detail ? (
                <div className="space-y-6">
                    {/* Thông tin người gửi */}
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                        <Avatar className="size-12">
                            <AvatarImage src={detail.senderAvatar} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{detail.senderName}</div>
                            <div className="text-xs text-muted-foreground">ID: {detail.senderId}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Gửi lúc: {formatISODate(detail.sentAt)}
                            </div>
                        </div>
                    </div>

                    {/* Nội dung tin nhắn */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Nội dung văn bản</h4>
                        <div className="p-4 bg-secondary/30 rounded-md text-sm whitespace-pre-wrap border">
                            {detail.content || <span className="italic text-muted-foreground">Không có nội dung văn bản</span>}
                        </div>
                    </div>

                    {/* Media đính kèm */}
                    {detail.media && detail.media.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Tệp đính kèm ({detail.media.length})</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {detail.media.map((m, index) => (
                                    <div key={index} className="relative aspect-video rounded-md overflow-hidden border bg-black">
                                        {/* Giả sử PostMedia có field url và type */}
                                        {(m as any).type === 'video' ? (
                                            <video src={(m as any).url} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <Image
                                                src={(m as any).url}
                                                alt="Attachment"
                                                fill
                                                className="object-contain"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata hội thoại */}
                    <div className="text-xs text-muted-foreground pt-4 border-t">
                        Conversation ID: {detail.conversationId}
                    </div>
                </div>
            ) : null}
            <SheetFooter className="mt-6">
                {/* Thêm các nút hành động duyệt/xóa tại đây nếu cần */}
            </SheetFooter>
        </SheetContent>
    );
};

// --- 2. Main Component: Bảng tin nhắn ---
export default function FlaggedMessageTable() {
    // Data States
    const [data, setData] = useState<ModeratorMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);

    // Control States
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Detail View State
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    // Define Columns
    const columns: ColumnDef<ModeratorMessage>[] = useMemo(() => [
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
            accessorKey: "senderName",
            header: "Người gửi",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                        <AvatarImage src={row.original.senderAvatar} />
                        <AvatarFallback><User size={14} /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.original.senderName}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "content",
            header: "Nội dung",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 max-w-[350px]">
                    <div className="truncate text-sm font-medium">
                        {row.original.content ? row.original.content : <span className="italic text-muted-foreground">Đã gửi tệp đính kèm</span>}
                    </div>
                    {row.original.media && row.original.media.length > 0 && (
                        <Badge variant="secondary" className="w-fit text-[10px] h-5 px-1 gap-1">
                            <FileImage size={10} /> {row.original.media.length} media
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "sentAt",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
                    Thời gian gửi <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatISODate(row.original.sentAt)}</div>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMessageId(row.original.id)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ], []);

    // Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);
            if (sortStrings.length === 0) sortStrings.push("sentAt,desc");

            const res = await getMessages({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
                // Filter search theo nội dung hoặc tên người gửi
                filter: debouncedSearch ? `(content=ilike='${debouncedSearch}' or senderName=ilike='${debouncedSearch}')` : undefined
            });

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải danh sách tin nhắn");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch]);

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
                <div className="relative w-full max-w-sm">
                    <MessageSquareWarning className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm nội dung hoặc người gửi..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, pageIndex: 0 })); }}
                        className="pl-9"
                    />
                </div>
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
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Loader className="animate-spin inline-block mr-2" /> Đang tải tin nhắn...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
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
                                    Không có tin nhắn nào bị báo cáo.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
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

            {/* Detail Drawer - Controlled by open prop */}
            <Sheet open={!!selectedMessageId} onOpenChange={(open) => !open && setSelectedMessageId(null)}>
                <MessageDetailSheet
                    messageId={selectedMessageId!}
                    onClose={() => setSelectedMessageId(null)}
                />
            </Sheet>
        </div>
    );
}