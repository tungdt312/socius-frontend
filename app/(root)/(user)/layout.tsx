import React from 'react'

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col w-full h-screen scroll-auto bg-accent"}>
            {children}
        </div>
    )
}
export default Layout
