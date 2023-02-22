import React from "react";
import { observer } from "mobx-react-lite";
import { AuthState } from "../state/AuthState";

export const ControlPanelPage = observer(() => {
    return (
        <>
            <p>Welcome to the control panel, {AuthState.username}!</p>
            {AuthState.isAdmin && <p>You are an admin</p>}
            {AuthState.isSuperAdmin && <p>You are a super admin</p>}
        </>
    );
});
