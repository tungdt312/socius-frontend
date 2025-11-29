import React, {ForwardedRef, JSX} from "react";
import {LucideProps} from "lucide-react";

export type NavItem = {
    name: string
    url: string
    icon:  React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
}