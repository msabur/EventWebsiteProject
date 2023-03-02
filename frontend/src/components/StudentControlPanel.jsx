import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { JoinRSOModal } from "./JoinRSOModal";
import { ViewRSOsModal } from "./ViewRSOsModal";
import { CreateRSOModal } from "./CreateRSOModal";
import { ViewRSOJoinRequestsModal } from "./ViewRSOJoinRequestsModal";


export const StudentControlPanel = () => {
    const [showJoinRSOModal, setShowJoinRSOModal] = useState(false);
    const [showViewRSOsModal, setShowViewRSOsModal] = useState(false);
    const [showCreateRSOModal, setShowCreateRSOModal] = useState(false);
    const [showViewRSOJoinRequestsModal, setShowViewRSOJoinRequestsModal] = useState(false);

    const handleShowModal = (e) => {
        // get modal name from Button's text
        const modalName = e.target.innerText.toLowerCase().replaceAll(' ', '-');
        if (modalName === 'request-to-join-an-rso') {
            setShowJoinRSOModal(true);
        } else if (modalName === 'view-rsos-i-am-in') {
            setShowViewRSOsModal(true);
        } else if (modalName === 'request-to-create-an-rso') {
            setShowCreateRSOModal(true);
        } else if (modalName === 'view-rso-join-requests') {
            setShowViewRSOJoinRequestsModal(true);
        }
    };

    return (
        <>
            <h3>Student controls</h3>
            <Stack gap={3}>
                <Button variant="success" onClick={handleShowModal}>
                    Request to join an RSO
                </Button>
                <Button variant="success" onClick={handleShowModal}>
                    Request to create an RSO
                </Button>
                <Button variant="primary" onClick={handleShowModal}>
                    View RSOs I am in
                </Button>
                <Button variant="primary" onClick={handleShowModal}>
                    View RSO join requests
                </Button>
            </Stack>

            <JoinRSOModal
                show={showJoinRSOModal}
                handleClose={() => setShowJoinRSOModal(false)}
            />
            <ViewRSOsModal
                show={showViewRSOsModal}
                handleClose={() => setShowViewRSOsModal(false)}
            />
            <CreateRSOModal
                show={showCreateRSOModal}
                handleClose={() => setShowCreateRSOModal(false)}
            />
            <ViewRSOJoinRequestsModal
                show={showViewRSOJoinRequestsModal}
                handleClose={() => setShowViewRSOJoinRequestsModal(false)}
            />
        </>
    );
}
