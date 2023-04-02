import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useFetchWrapper } from '../../api';

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

    const handleLeaveRSO = (rsoId) => {
        fetchWrapper.post(`/rso/${rsoId}/leave`)
            .then(() => {
                setRSOs(rsos.filter((rso) => rso.id !== rsoId));
            })
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>My RSOs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table hover>
                    <thead>
                        <tr>
                            <th>RSO Name</th>
                            <th>Owned by me?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rsos.map((rso) => (
                            <tr key={rso.id}>
                                <td>
                                    <p>{rso.name}</p>
                                </td>
                                <td>
                                    <p>{rso.is_mine ? "Yes" : "No"}</p>
                                </td>
                                <td>
                                    {rso.is_mine ? (
                                        <></>
                                    ) : (
                                        <Button variant="danger"
                                            onClick={() => handleLeaveRSO(rso.id)}
                                        >
                                            Leave
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
}
