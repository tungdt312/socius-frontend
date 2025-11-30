"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import {toast} from "sonner";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Tabs, TabsList, TabsTrigger,} from "@/components/ui/tabs";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {UserViewResponse} from "@/types/dtos/userview";
import {
    AlertTriangle,
    ArrowUpDown,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Columns2,
    Loader,
    Trash,
    User,
    X
} from "lucide-react";
import {deleteUser, getUserViewList, putUserView} from "@/services/userviewService";
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {
    Command,CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "../ui/command";
import {cn} from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "../ui/alert-dialog";
import {CreateUserDrawer} from "@/components/admin/CreateUserDrawer";

const AVAILABLE_ROLES = [
    { value: "ADMIN", label: "Quản trị viên" },
    { value: "MODERATOR", label: "Kiểm duyệt viên" },
    { value: "USER", label: "Người dùng" },
];
// --- Components ---
function RoleMultiSelect({
                             selected,
                             onChange
                         }: {
    selected: string[];
    onChange: (roles: string[]) => void;
}) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (roleValue: string) => {
        if (selected.includes(roleValue)) {
            // Nếu đã có thì bỏ chọn
            onChange(selected.filter((r) => r !== roleValue));
        } else {
            // Chưa có thì thêm vào
            onChange([...selected, roleValue]);
        }
    };

    const handleRemove = (roleValue: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn mở popover khi click nút xóa
        onChange(selected.filter((r) => r !== roleValue));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-10 px-3 py-2 hover:bg-background"
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length > 0 ? (
                            selected.map((role) => (
                                <Badge variant="secondary" key={role} className="mr-1 mb-1">
                                    {role}
                                    <Button
                                        className="h-4 w-4 aspect-square ml-1 ring-offset-background rounded-full text-white outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleRemove(role, e as any);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => handleRemove(role, e)}
                                    >
                                        <X className="h-3 w-3 text-white hover:text-foreground" />
                                    </Button>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground font-normal">Chọn quyền...</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Tìm kiếm quyền..." />
                    <CommandList>
                        <CommandEmpty>Không tìm thấy quyền.</CommandEmpty>
                        <CommandGroup>
                            {AVAILABLE_ROLES.map((role) => (
                                <CommandItem
                                    key={role.value}
                                    onSelect={() => handleSelect(role.value)}
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            selected.includes(role.value)
                                                ? "bg-primary text-white"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <Check className={cn("h-4 w-4 text-white")} />
                                    </div>
                                    <span>{role.label}</span>
                                    <span className="ml-auto text-muted-foreground text-xs font-mono">
                                        {role.value}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
// Drawer hiển thị chi tiết User
function UserDrawer({user,
                    onSuccess
}: {
    user: UserViewResponse;
    onSuccess?: () => void; // Prop mới: Hàm reload dữ liệu
}) {
    const [currentRoles, setCurrentRoles] = React.useState<string[]>(user.roles || []);
    const [currentStatus, setCurrentStatus] = React.useState(user.status);
    const [isLoading, setIsLoading] = React.useState(false);
    React.useEffect(() => {
        setCurrentRoles(user.roles || []);
        setCurrentStatus(user.status);
    }, [user]);
    const handleSave = async () => {
        try {
            setIsLoading(true);
            // Giả lập gọi API
            const res = await putUserView({
                displayName: user.displayName,
                roles: currentRoles,
                status: currentStatus
            }, user.id)
            console.log("Saving changes:", {id: user.id, roles: currentRoles, status: currentStatus});
            toast.success("Cập nhật thông tin thành công!");
            onSuccess?.();
        } catch (error) {
            toast.error((error as Error).message ?? "Không thể chỉnh sửa người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try{

        setIsLoading(true);
        // Giả lập gọi API xóa
        const res = await deleteUser(user.id)
        console.log("Deleting user:", user.id);
        onSuccess?.();
        } catch (error) {
            toast.error((error as Error).message ?? "Không thể khoá người dùng");
        } finally {
            setIsLoading(false);
        }
        // Cần thêm logic đóng drawer và reload bảng ở đây
    };
    return (
        <Drawer direction={"right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-fit px-0 text-left font-medium hover:no-underline">
                    {user.displayName}
                </Button>
            </DrawerTrigger>
            <DrawerContent
                className="h-full max-h-[90vh] md:max-h-full md:w-[400px] md:ml-auto rounded-none md:rounded-l-xl">
                <DrawerHeader className="gap-1 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={user.avatarUrl} alt={user.displayName} className="object-cover"/>
                            <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DrawerTitle>{user.displayName}</DrawerTitle>
                            <DrawerDescription>{user.email}</DrawerDescription>
                        </div>
                    </div>
                </DrawerHeader>

                <div className="flex flex-col gap-6 overflow-y-auto p-6 flex-1">
                    <div className="flex flex-col gap-5">
                        {/* ID & Username (Read-only) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">ID</Label>
                                <Input value={user.id} readOnly className="bg-muted/50 font-mono text-xs" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Tên tài khoản</Label>
                                <Input value={user.username} readOnly className="bg-muted/50" />
                            </div>
                        </div>

                        {/* MultiSelect Box cho Roles */}
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wider font-semibold">Phân quyền (Roles)</Label>
                            <RoleMultiSelect
                                selected={currentRoles}
                                onChange={setCurrentRoles}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Chỉ định các quyền truy cập cho người dùng này.
                            </p>
                        </div>

                        {/* Status Select */}
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wider font-semibold">Trạng thái</Label>
                            <Select value={currentStatus} onValueChange={setCurrentStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">
                                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500"/> Hoạt động (Active)</div>
                                    </SelectItem>
                                    <SelectItem value="BLOCKED">
                                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500"/> Đã khóa (Blocked)</div>
                                    </SelectItem>
                                    <SelectItem value="PENDING">
                                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-yellow-500"/> Chờ duyệt (Pending)</div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Footer chứa nút Save và Delete */}
                <DrawerFooter className="border-t pt-4 bg-muted/10 flex-none">
                    <div className="flex flex-col gap-3 w-full">
                        <Button onClick={handleSave} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                            Lưu thay đổi
                        </Button>

                        <div className="flex gap-3 mt-2">
                            <DrawerClose asChild>
                                <Button variant="outline" className="flex-1">Đóng</Button>
                            </DrawerClose>

                            {/* Alert Dialog cho nút Xóa */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 shadow-none">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Khóa tài khoản
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <div className="flex items-center gap-2 text-destructive">
                                            <AlertTriangle className="h-5 w-5" />
                                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                        </div>
                                        <AlertDialogDescription>
                                            Hành động này không thể hoàn tác. Tài khoản <strong>{user.username}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống và dữ liệu liên quan có thể bị mất.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Xóa vĩnh viễn
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// --- Columns Definition ---


// --- Main Component ---
export default function UserTable() {
    const [data, setData] = React.useState<UserViewResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Table States
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({pageIndex: 0, pageSize: 10});
    const columns: ColumnDef<UserViewResponse>[] = [
        {
            id: "select",
            header: ({table}) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({row}) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: ({column}
            ) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
            cell: ({row}) => (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{row.original.id}</span>
                </div>
            ),
            meta: {
                label: "ID"
            },
        },
        {
            accessorKey: "displayName",
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Người dùng
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
            cell:
                ({row}) => <UserDrawer user={row.original} onSuccess={fetchData}/>,
            meta: {
                label: "Người dùng"
            },
        },
        {
            accessorKey: "username",
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Tên tài khoản
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
            cell:
                ({row}) => (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="size-3.5"/>
                        <span>{row.original.username}</span>
                    </div>
                ),
            meta:
                {
                    label: "Tên tài khoản",

                }
        }
        ,
        {
            accessorKey: "email",
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
            cell:
                ({row}) => (
                    <div className="flex items-center gap-1 text-muted-foreground truncate max-w-[200px]"
                         title={row.original.email}>
                        <span>{row.original.email}</span>
                    </div>
                ),
            meta: {
                label: "Email"
            },
        }
        ,
        {
            accessorKey: "roles",
            header:
                "Vai trò",
            cell:
                ({row}) => (
                    <div className="flex items-start justify-start gap-1 text-muted-foreground flex-wrap max-w-[200px]"
                         title={row.original.email}>
                        {row.original.roles.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                    </div>
                ),
            meta: {
                label: "Vai trò"
            },
        }
        ,
        {
            accessorKey: "status",
            header:
                "Trạng thái",
            cell:
                ({row}) => {
                    const status = row.original.status;
                    const statusConfig: Record<
                        string,
                        {
                            label: string;
                            variant: "default" | "destructive" | "secondary" | "outline";
                            className?: string;
                        }
                    > = {
                        ACTIVE: {
                            label: "Hoạt động",
                            variant: "default",
                            className: "bg-green-600 hover:bg-green-700 border-transparent text-white",
                        },
                        BLOCKED: {
                            label: "Đã khóa",
                            variant: "destructive",
                        },
                        PENDING: {
                            label: "Chờ xác nhận",
                            variant: "secondary",
                            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
                        },
                        NOT_AUTHORIZED: {
                            label: "Chờ cấp quyền",
                            variant: "secondary",
                        },
                        NOT_SOLVED: {
                            label: "Chờ xử lý",
                            variant: "secondary",
                            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
                        },
                    };

                    const config = statusConfig[status] || statusConfig["NOT_SOLVED"];

                    return (
                        <Badge
                            variant={config.variant}
                            className={`capitalize ${config.className || ""}`}
                        >
                            {config.label}
                        </Badge>
                    );
                },
            // Cần thiết để chức năng filter theo Tab hoạt động chính xác
            filterFn:
                (row, id, value) => {
                    return value.includes(row.getValue(id));
                },
            meta: {
                label: "Trạng thái"
            },
        }
        ,
    ]
    // Fetch Data
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await getUserViewList();
            setData(res.content || []);
        } catch (e) {
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };
    React.useEffect(() => {
        fetchData();
    }, []);

    const table = useReactTable({
        data,
        columns,
        state: {sorting, columnVisibility, rowSelection, columnFilters, pagination},
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    // Xử lý khi chuyển Tab để lọc dữ liệu thực tế
    const handleTabChange = (value: string) => {
        if (value === "all") {
            table.getColumn("status")?.setFilterValue(undefined);
        } else if (value === "active") {
            table.getColumn("status")?.setFilterValue(["ACTIVE"]);
        } else if (value === "blocked") {
            table.getColumn("status")?.setFilterValue(["BLOCKED"]);
        } else if (value === "pending") {
            table.getColumn("status")?.setFilterValue(["PENDING"]);
        } else if (value === "not_authorized") {
            table.getColumn("status")?.setFilterValue(["NOT_AUTHORIZED"]);
        } else if (value === "not_solved") {
            table.getColumn("status")?.setFilterValue(["NOT_SOLVED"]);
        }
    };

    return (
        <div className="w-full space-y-4 pt-6">
            <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6" onValueChange={handleTabChange}>
                {/* Toolbar Header */}
                <div className="flex flex-col items-start justify-between gap-4 w-full ">
                    <TabsList
                        className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 h-fit w-full overflow-auto justify-start">
                        <TabsTrigger value="all">Tất cả <Badge variant="secondary"
                                                               className="ml-2">{data.length}</Badge></TabsTrigger>
                        <TabsTrigger value="active">
                            Hoạt động <Badge variant="secondary"
                                             className="ml-2">{data.filter(u => u.status === 'ACTIVE').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            Chờ xác nhận <Badge variant="secondary"
                                                className="ml-2">{data.filter(u => u.status === 'PENDING').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="blocked">
                            Bị khóa <Badge variant="secondary"
                                           className="ml-2">{data.filter(u => u.status === 'BLOCKED').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="not_authorized">
                            Chờ cấp quyền <Badge variant="secondary"
                                                 className="ml-2">{data.filter(u => u.status === 'NOT_AUTHORIZED').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="not_solved">
                            Chờ xử lý <Badge variant="secondary"
                                             className="ml-2">{data.filter(u => u.status === 'NOT_SOLVED').length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2 w-full ">
                        <Input
                            placeholder="Tìm người dùng..."
                            value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("displayName")?.setFilterValue(event.target.value)}
                            className="h-8 w-full"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Columns2 className="mr-2 size-4"/>
                                    Xem
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {table.getAllColumns().filter(c => c.getCanHide()).map(column => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {(column.columnDef.meta as any).label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <CreateUserDrawer onSuccess={fetchData} />
                    </div>
                </div>

                {/* Main Table Area - Chỉ cần 1 bảng duy nhất, dữ liệu thay đổi theo bộ lọc */}
                <div className="rounded-md border bg-card">
                    <Table>
                        {!(isLoading || !table.getRowModel().rows?.length) && <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>}
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader className="animate-spin inline-block mr-2"/> Tải dữ liệu...
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
                                        Không có dữ liệu.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Pagination */}
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        Đã
                        chọn {table.getFilteredSelectedRowModel().rows.length} trên {table.getFilteredRowModel().rows.length} hàng.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8 ml-auto">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium hidden sm:block">Hàng/ trang</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize}/>
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
            </Tabs>
        </div>
    );
}