import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import { useFetchWrapper } from "../../api";

export const CreateRSOModal = ({ show, handleClose }) => {
    const fetchWrapper = useFetchWrapper();

    const [name, setName] = useState('');
    const [available, setAvailable] = useState(false);
    const [checkVariant, setCheckVariant] = useState('primary');

    const onNameChange = (e) => {
        setAvailable(false);
        setCheckVariant("primary");
        setName(e.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }

        // do fetch
        fetchWrapper.post('/rso', { name })
            .finally(() => {
                setName('');
                setAvailable(false);
                handleClose();
            });
    }

    const checkAvailability = async (event) => {
        event.preventDefault();
        if (name === '') {
            return;
        }

        // do fetch, then conditionally setAvailable
        fetchWrapper.get(`/rso/available/${name}`)
            .then(data => {
                setAvailable(data.available);
                setCheckVariant(data.available ? 'success' : 'danger');
            });
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create an RSO</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="rsoName">
                        <Stack direction="horizontal" gap={2}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                placeholder="Top Hat RSO"
                                value={name}
                                onChange={onNameChange}
                                autoFocus
                            />
                            <Button variant={checkVariant} className="ms-5" onClick={checkAvailability}>
                                Check
                            </Button>
                        </Stack>
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={!available}>Submit</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
