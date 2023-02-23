import React from "react";
import { observer } from "mobx-react-lite";
import { AppState } from "../state/AppState";

export const ControlPanelPage = observer(() => {
    return (
        <>
            <p>Welcome to the control panel, {AppState.username}!</p>
            {AppState.isAdmin && <p>You are an admin</p>}
            {AppState.isSuperAdmin && <p>You are a super admin</p>}
        </>
    );
});
