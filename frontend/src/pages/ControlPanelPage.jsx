import React from "react";
import { observer } from "mobx-react-lite";
import { AppState } from "../state/AppState";
import { SuperAdminControlPanel  } from "../components/superadmin/SuperAdminControlPanel";
import { AdminControlPanel } from "../components/admin/AdminControlPanel";
import { StudentControlPanel } from "../components/student/StudentControlPanel";

export const ControlPanelPage = observer(() => {
    // if superadmin return only superadmin controls
    // otherwise student controls
    // and admin sees both student controls and admin controls
    if (AppState.isSuperAdmin) {
        return <SuperAdminControlPanel />;
    } else if (AppState.isAdmin) {
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
