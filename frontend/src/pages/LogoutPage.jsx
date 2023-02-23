import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { AppState } from "../state/AppState";

export function LogoutPage() {
    const [, setLocation] = useLocation();
    useEffect(() => {
        AppState.onLogout();
        setLocation("/");
    })
    return <p>Logging out...</p>;
}
