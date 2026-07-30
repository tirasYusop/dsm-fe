"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Props = {
    children: React.ReactNode;
    allowedRoles: string[];
};


export default function RoleGuard({
    children,
    allowedRoles,
}: Props) {

    const router = useRouter();

    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");


        if (!token) {
            router.replace("/login");
            return;
        }
        if (!allowedRoles.includes(role ?? "")) {
            router.replace("/login");
            return;
        }
        setAuthorized(true);
    }, [router, allowedRoles]);
    if (!authorized) {
        return null;
    }
    return children;
}