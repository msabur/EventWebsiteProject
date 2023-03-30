import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useFetchWrapper } from "../../api";

import "leaflet/dist/leaflet.css"

export const NewEventModal = ({ show, handleClose }) => {
    /* Required fields in form:
        * - category
        * - event name
        * - phone number
        * - description
        * - location name
        * - location coordinates
        * - start time
        * - end time
    */

    const categories = ["Choose...", "Technology", "Sports", "Academic", "Social", "Other"];
    const fetchWrapper = useFetchWrapper();
    
    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }
        fetchWrapper.post("/events", {
            name: form.universityName.value,
            location: form.universityLocation.value,
            description: form.universityDescription.value,
            num_students: form.universityNumStudents.value,
        })
            .finally(() => {
                handleClose();
            });
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formEventName">
                        <Form.Label>Event name</Form.Label>
                        <Form.Control type="text" placeholder="Enter event name" required />
                    </Form.Group>
                    <Form.Group controlId="formEventCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Control as="select" required>
                            {categories.map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formEventDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} required />
                    </Form.Group>
                    <Form.Group controlId="formEventLocationName">
                        <Form.Label>Location name</Form.Label>
                        <Form.Control type="text" placeholder="Enter location name" required />
                    </Form.Group>
                    <Form.Group controlId="formEventLocationCoordinates">
                        <Form.Label>Location coordinates</Form.Label>
                        <Form.Control type="text" placeholder="Enter location coordinates (TODO map)" required />
                    </Form.Group>
                    <Form.Group controlId="formEventStartTime">
                        <Form.Label>Start time</Form.Label>
                        <Form.Control type="datetime-local" required />
                    </Form.Group>
                    <Form.Group controlId="formEventEndTime">
                        <Form.Label>End time</Form.Label>
                        <Form.Control type="datetime-local" required />
                    </Form.Group>
                    <Form.Group controlId="formEventPhoneNumber">
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control type="text" placeholder="Enter phone number" required />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
