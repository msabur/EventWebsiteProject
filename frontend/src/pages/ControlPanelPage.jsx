import React from "react";
import { observer } from "mobx-react-lite";
import { AppState } from "../state/AppState";
import { SuperAdminControlPanel  } from "../components/SuperAdminControlPanel";
import { AdminControlPanel } from "../components/AdminControlPanel";
import { StudentControlPanel } from "../components/StudentControlPanel";

export const ControlPanelPage = observer(() => {
    // if superadmin return only superadmin controls
    // otherwise student controls
    // and admin sees both student controls and admin controls
    if (AppState.isSuperAdmin) {
        return <SuperAdminControlPanel />;
    } else if (AppState.isAdmin === "admin") {
        return (
            <>
                <AdminControlPanel />
                <StudentControlPanel />
            </>
        );
    } else {
        return (
            <StudentControlPanel />
        );
    }
});
