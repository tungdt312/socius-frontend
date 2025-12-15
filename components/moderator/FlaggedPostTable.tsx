"use client";
import React, {useEffect, useMemo, useState} from "react";
import {ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable,} from "@tanstack/react-table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ArrowUpDown, Globe, Lock, User, Users} from "lucide-react"; // Icons cho AccessModifier
import {toast} from "sonner";
import {formatISODate} from "@/lib/utils";
import {useDebounce} from "@/hooks/use-rebounce";
import { PostResponse } from "@/types/dtos/post";
import {getPosts} from "@/services/moderatorService";
import {TablePagination} from "@/components/moderator/FlaggedCommentTable";

export default function FlaggedPostTable() {
    // States (Giống bảng trên)
    const [data, setData] = useState<PostResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [rowSelection, setRowSelection] = useState({});

    // Helper render icon quyền truy cập
    const getAccessIcon = (modifier: string) => {
        switch (modifier) {
            case "PUBLIC": return <Globe className="size-3" />;
            case "PRIVATE": return <Lock className="size-3" />;
            default: return <Users className="size-3" />;
        }
    };

    const columns: ColumnDef<PostResponse>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />
            ),
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            size: 40,
            enableSorting: false,
        },
        {
            accessorKey: "content",
            header: "Nội dung bài viết",
            cell: ({ row }) => (
                <div className="max-w-[350px]">
                    {/* Nếu là bài chia sẻ thì hiển thị khác */}
                    {row.original.sharedPost ? (
                        <div className="text-xs border p-2 rounded bg-muted/50 mb-1">
                            <span className="font-semibold">Chia sẻ bài viết của: {row.original.sharedPost.authorName}</span>
                        </div>
                    ) : null}
                    <p className="truncate font-medium">{row.original.content || "Không có tiêu đề"}</p>
                    {row.original.media && row.original.media.length > 0 && (
                        <div className="flex gap-1 mt-1">
                            <Badge variant="secondary" className="text-[10px] h-5">Media: {row.original.media.length}</Badge>
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "authorName",
            header: "Tác giả",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                        <AvatarImage src={row.original.authorAvatar} />
                        <AvatarFallback><User size={14}/></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.original.authorName}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getAccessIcon(row.original.accessModifier)}
                            <span className="capitalize">{row.original.accessModifier?.toLowerCase()}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "stats",
            header: "Thống kê",
            cell: ({ row }) => (
                <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="font-normal">👍 {row.original.reactCount}</Badge>
                    <Badge variant="outline" className="font-normal">💬 {row.original.commentCount}</Badge>
                    <Badge variant="outline" className="font-normal">🔗 {row.original.shareCount}</Badge>
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Ngày đăng <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-muted-foreground">{formatISODate(row.original.createdAt)}</span>,
        },
    ], []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sortStrings = sorting.map(s => `${s.id},${s.desc ? 'desc' : 'asc'}`);
            if (sortStrings.length === 0) sortStrings.push("createdAt,desc");

            const res = await getPosts({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sort: sortStrings,
                filter: debouncedSearch ? `content~'${debouncedSearch}'` : undefined
            });

            setData(res.content || []);
            setRowCount(res.totalElements || 0);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải bài viết");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch]);

    const table = useReactTable({
        data, columns, state: { sorting, pagination, rowSelection },
        manualPagination: true, manualSorting: true, rowCount,
        onPaginationChange: setPagination, onSortingChange: setSorting, onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id,
    });

    return (
        <div className="w-full space-y-4 pt-6">
            <Input placeholder="Tìm nội dung bài viết..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
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