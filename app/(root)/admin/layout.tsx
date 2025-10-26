import React from 'react'
import Image from 'next/image'

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-secondary ">
            {children}
        </div>
    )
}
export default Layout
