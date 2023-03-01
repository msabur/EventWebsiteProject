import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

export const NewUniModal = ({ show, handleClose, handleSubmit }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="universityName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            placeholder="Anytown University"
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="universityLocation">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            placeholder="Anytown"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="universityDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="universityNumStudents">
                        <Form.Label>Number of Students</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="1000"
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">Submit</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
