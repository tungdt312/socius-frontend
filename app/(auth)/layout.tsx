import React from 'react'
import Image from 'next/image'

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-secondary ">
            <section className={"bg-primary px-10 hidden overflow-auto md:block md:w-1/2 lg:w-2/5 rounded-r-2xl"}>
                <div className="flex flex-col justify-around min-h-screen max-w-[480] mx-auto py-10 ">
                    <Image
                        src="/Logo-full-white.svg"
                        alt={"logo"}
                        height={100}
                        width={200}
                        className="h-auto"
                    />
                    <div className="space-y-5 text-primary-foreground">
                        <h1 className="heading1">
                            Kết nối - Sẻ chia - Cảm hứng
                        </h1>
                        <p className={"body1"}>
                            Trên Socius, mọi khoảnh khắc đều đáng chia sẻ – vì mỗi kết nối đều có thể trở thành nguồn cảm hứng.
                        </p>
                    </div>
                    <Image
                        src={"/Group.svg"}
                        alt={"file"}
                        height={350}
                        width={350}
                        className="mx-auto transition-all hover:scale-105 text-primary-foreground "/>
                </div>
            </section>
            <section className="text-secondary-foreground flex flex-col overflow-auto min-h-screen items-center justify-center w-full md:w-1/2 lg:w-3/5 px-5 py-10">
                <div className="mb-16 w-full md:hidden p-2 rounded-lg bg-primary">
                    <Image
                        src="/Logo-full-white.svg"
                        alt={"logo"}
                        height={150}
                        width={150}
                        className="h-auto mx-auto"
                    />
                </div>
                {children}
            </section>
        </div>
    )
}
export default Layout
