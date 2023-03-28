import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useFetchWrapper } from "../api";
import { NewUniModal } from "./NewUniModal";
import { ViewRSORequestsModal } from "./ViewRSORequestsModal";

export const SuperAdminControlPanel = () => {
    const [showNewUniModal, setShowNewUniModal] = useState(false);
    const [showViewRSORequestsModal, setShowViewRSORequestsModal] = useState(false);

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
                    <Button variant="primary" onClick={() => setShowViewRSORequestsModal(true)}>
                        View RSO requests
                    </Button>
                </Col>
            </Row>

            <NewUniModal
                show={showNewUniModal}
                handleClose={() => setShowNewUniModal(false)}
            />
            <ViewRSORequestsModal
                show={showViewRSORequestsModal}
                handleClose={() => setShowViewRSORequestsModal(false)}
            />
        </>
    );
}
