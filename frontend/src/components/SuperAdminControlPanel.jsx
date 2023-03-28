import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useFetchWrapper } from "../api";
import { NewUniModal } from "./NewUniModal";

export const SuperAdminControlPanel = () => {
    const fetchWrapper = useFetchWrapper();

    const [showNewUniModal, setShowNewUniModal] = useState(false);

    return (
        <>
            <h3>Superadmin controls</h3>

            <Row xs={3} sm={3} md={5} className="g-2">
                <Col>
                <Button variant="primary" onClick={() => setShowNewUniModal(true)}>
                    New university
                </Button>
                </Col>
                <Col>
                    <Button variant="primary">View requests</Button>
                </Col>
            </Row>

            <NewUniModal
                show={showNewUniModal}
                handleClose={() => setShowNewUniModal(false)}
            />
        </>
    );
}
