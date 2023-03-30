import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { NewEventModal } from "./NewEventModal";

export const AdminControlPanel = () => {
    const [showNewUniModal, setShowNewUniModal] = useState(false);
    
    return (
        <>
            <h3>Admin controls</h3>

            <Row xs={3} sm={3} md={5} className="g-2">
                <Col>
                    <Button variant="primary" onClick={() => setShowNewUniModal(true)}>
                        New event
                    </Button>
                </Col>
            </Row>

            <NewEventModal
                show={showNewUniModal}
                handleClose={() => setShowNewUniModal(false)}
            />
        </>
    );
}
