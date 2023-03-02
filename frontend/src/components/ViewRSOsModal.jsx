import React, { useState, useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useFetchWrapper } from '../api';

export const ViewRSOsModal = ({ show, handleClose }) => {
    const fetchWrapper = useFetchWrapper();

    const [rsos, setRSOs] = useState([]);

    useEffect(() => {
        if (!show) {
            return; // to prevent unnecessary API calls since we use show as a dependency
        }
        fetchWrapper.get('/my-rsos')
            .then((data) => {
                setRSOs(data);
            })
    }, [show]);

        const handleSubmit = (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (form.checkValidity() === false) {
                return;
            }
            handleClose();
        }

        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>My RSOs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup as="ol" numbered className="scrollingListGroup">
                        {rsos.map((rso, index) => (
                            <ListGroup.Item as="li" key={index}>
                                <p>{rso.name}</p>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        );
    }
