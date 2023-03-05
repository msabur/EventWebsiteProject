import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useFetchWrapper } from "../api";
import { NewUniModal } from "./NewUniModal";

export const SuperAdminControlPanel = () => {
    const fetchWrapper = useFetchWrapper();

    const [showNewUniModal, setShowNewUniModal] = useState(false);

    const handleCloseNewUniModal = () => setShowNewUniModal(false);
    const handleShowNewUniModal = () => setShowNewUniModal(true);
    const handleSubmitNewUniModal = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }
        fetchWrapper.post("/universities", {
            name: form.universityName.value,
            location: form.universityLocation.value,
            description: form.universityDescription.value,
            num_students: form.universityNumStudents.value,
        })
            .finally(() => {
                handleCloseNewUniModal();
            });
    }

    return (
        <>
            <h3>Superadmin controls</h3>

            <Row xs={3} sm={3} md={5} className="g-2">
                <Col>
                <Button variant="primary" onClick={handleShowNewUniModal}>
                    New university
                </Button>
                </Col>
                <Col>
                    <Button variant="primary">View requests</Button>
                </Col>
            </Row>

            <NewUniModal
                show={showNewUniModal}
                handleClose={handleCloseNewUniModal}
                handleSubmit={handleSubmitNewUniModal}
            />
        </>
    );
}
