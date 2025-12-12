"use client"
import React from 'react'
import {RoleProvider} from "@/components/RoleContext";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (  <RoleProvider>{children}</RoleProvider>
    )
}
export default Layout
