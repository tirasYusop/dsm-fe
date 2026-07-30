"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";


export default function LogoutButton() {

    const router = useRouter();


    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        router.push("/login");

    };


    return (

        <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-2"
        >

            <LogOut className="h-4 w-4" />

            Logout

        </Button>

    );
}