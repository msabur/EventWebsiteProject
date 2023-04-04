import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useFetchWrapper } from "../../api";
import { NewUniModal } from "./NewUniModal";
import { ViewRSORequestsModal } from "./ViewRSORequestsModal";
import { ViewPublicEventRequestsModal } from "./ViewPublicEventRequestsModal";
import sampleEvents from "./sampleData.json"

export const SuperAdminControlPanel = () => {
    const [showNewUniModal, setShowNewUniModal] = useState(false);
    const [showViewRSORequestsModal, setShowViewRSORequestsModal] = useState(false);
    const [showViewPublicEventRequestsModal, setShowViewPublicEventRequestsModal] = useState(false);

    const fetchWrapper = useFetchWrapper();

    const addSampleEvents = () => {
        sampleEvents.forEach(event => {
            fetchWrapper.post("/events", {
                name: event.name,
                type: event.type,
                rso: event.rso,
                category: event.category,
                description: event.description,
                latitude: event.latitude,
                longitude: event.longitude,
                radius: event.radius,
                startTime: event.startTime,
                endTime: event.endTime,
                phoneNumber: event.phoneNumber
            })
        });
        console.log("Sample events added");
    }

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
                <Col>
                    <Button variant="primary" onClick={() => setShowViewPublicEventRequestsModal(true)}>
                        View public event requests
                    </Button>
                </Col>
                <Col>
                    <Button variant="danger" onClick={() => addSampleEvents()}>
                        Add sample events
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
            <ViewPublicEventRequestsModal
                show={showViewPublicEventRequestsModal}
                handleClose={() => setShowViewPublicEventRequestsModal(false)}
            />
        </>
    );
}
