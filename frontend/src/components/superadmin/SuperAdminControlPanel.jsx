import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { NewUniModal } from "./NewUniModal";
import { ViewRSORequestsModal } from "./ViewRSORequestsModal";
import { ViewPublicEventRequestsModal } from "./ViewPublicEventRequestsModal";

export const SuperAdminControlPanel = () => {
    const [showNewUniModal, setShowNewUniModal] = useState(false);
    const [showViewRSORequestsModal, setShowViewRSORequestsModal] = useState(false);
    const [showViewPublicEventRequestsModal, setShowViewPublicEventRequestsModal] = useState(false);

    return (
        <>
            <h3>Superadmin controls</h3>

            <Stack gap={3}>
                <Button variant="primary" onClick={() => setShowNewUniModal(true)}>
                    New university
                </Button>
                <Button variant="primary" onClick={() => setShowViewRSORequestsModal(true)}>
                    View RSO requests
                </Button>
                <Button variant="primary" onClick={() => setShowViewPublicEventRequestsModal(true)}>
                    View public event requests
                </Button>
            </Stack>

            <NewUniModal
                show={showNewUniModal}
                handleClose={() => setShowNewUniModal(false)}
            />
            <ViewRSORequestsModal
                show={showViewRSORequestsModal}
                handleClose={() => setShowViewRSORequestsModal(false)}
            />
            <ViewPublicEventRequestsModal
                show={showViewPublicEventRequestsModal}
                handleClose={() => setShowViewPublicEventRequestsModal(false)}
            />
        </>
    );
}
