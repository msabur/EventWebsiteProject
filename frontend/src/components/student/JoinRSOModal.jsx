import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useFetchWrapper } from "../../api";

export const JoinRSOModal = ({ show, handleClose }) => {
    const [foundRSOs, setFoundRSOs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWrapper = useFetchWrapper();

    useEffect(() => {
        if (show) {
            setLoading(true);
            fetchWrapper.get('/joinable-rsos')
                .then((data) => {
                    setFoundRSOs(data);
                    setLoading(false);
                })
            }
    }, [show]);
            

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }
        let selectedRSOs = [];
        for (let i = 0; i < form.length; i++) {
            if (form[i].checked) {
                selectedRSOs.push(foundRSOs[i]);
            }
        }

        for (let i = 0; i < selectedRSOs.length; i++) {
            const rso = selectedRSOs[i];
            fetchWrapper.post(`/rso/${rso.id}/join`)
                .then((data) => {
                    console.log(data);
                })
        }
        handleClose();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Join an RSO</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        {/* list */}
                        {foundRSOs.map((rso) => (
                            <Form.Group key={rso.id} className="mb-3" controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" label={rso.name} />
                            </Form.Group>
                        ))}
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
}
