import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthState } from "../state/AuthState";

export function LogoutPage() {
    const [, setLocation] = useLocation();
    useEffect(() => {
        AuthState.onLogout();
        setLocation("/");
    })
    return <p>Logging out...</p>;
}
