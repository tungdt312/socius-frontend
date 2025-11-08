// components/ui/ConfirmDialog.tsx
"use client"

import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";

interface ConfirmDialogProps {
    children: React.ReactNode;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
}

export const ConfirmDialog = ({
                                  children,
                                  title,
                                  description,
                                  onConfirm
                              }: ConfirmDialogProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn hành vi mặc định
        setIsLoading(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error("Hành động trong ConfirmDialog thất bại:", error);
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={"text-center"}>{title}</AlertDialogTitle>
                    <Separator/>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className={"w-1/2"}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAction}
                        disabled={isLoading}
                        className="w-1/2 bg-destructive text-white hover:bg-destructive/90"
                    >
                        {isLoading ? "Đang xử lý..." : "Xác nhận"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};