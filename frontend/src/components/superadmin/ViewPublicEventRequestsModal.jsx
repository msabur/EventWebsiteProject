import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useFetchWrapper } from "../../api";

export const ViewPublicEventRequestsModal = ({ show, handleClose }) => {
  const fetchWrapper = useFetchWrapper();

  const [publicEventRequests, setPublicEventRequests] = useState([]);

  useEffect(() => {
    if (show) {
      fetchWrapper.get('/events/public-pending')
        .then((data) => {
          setPublicEventRequests(data);
          console.log(data);
        })
    }
  }, [show]);

  const handleAction = (eventId, approve) => {
    fetchWrapper.post('/events/public-pending', {
        eventId,
        approve
    })
      .then(() => {
        setPublicEventRequests(publicEventRequests.filter((r) => (
            r.id !== eventId
        )));
      });
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Requests to create public events</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {publicEventRequests.length === 0 ? (
          <p className="text-center">There are no requests</p>
        ) : (
          <Table hover>
            <thead>
              <tr>
                <th>Event name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publicEventRequests.map(({ id, name }) => (
                <tr key={id}>
                  <td>
                    <p>{name}</p>
                  </td>
                  <td>
                    <Button variant="success" className="me-2"
                      onClick={() => handleAction(id, true)}
                    >
                      Yes
                    </Button>
                    <Button variant="danger"
                      onClick={() => handleAction(id, false)}
                    >
                      No
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

      </Modal.Body>
    </Modal>
  );
}
