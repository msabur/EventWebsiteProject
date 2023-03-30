import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useFetchWrapper } from "../../api";

export const ViewRSORequestsModal = ({ show, handleClose }) => {
  const fetchWrapper = useFetchWrapper();

  const [rsoRequests, setRsoRequests] = useState([]);

  useEffect(() => {
    if (show) {
      fetchWrapper.get('/pending-rsos')
        .then((data) => {
          setRsoRequests(data);
        })
    }
  }, [show]);

  const handleAction = (ownerName, rsoName, action) => {
    fetchWrapper.post('/pending-rsos', {
      owner_name: ownerName,
      rso_name: rsoName,
      accept: action === 'allow',
    })
      .then(() => {
        setRsoRequests(rsoRequests.filter((r) => (
            r.owner_name !== ownerName || r.rso_name !== rsoName
        )));
      });
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Requests to create RSOs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {rsoRequests.length === 0 ? (
          <p className="text-center">There are no requests</p>
        ) : (
          <Table hover>
            <thead>
              <tr>
                <th>Owner</th>
                <th>RSO</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rsoRequests.map(({ owner_name, rso_name }) => (
                <tr key={[owner_name, rso_name].join('-')}>
                  <td>
                    <p>{owner_name}</p>
                  </td>
                  <td>
                    <p>{rso_name}</p>
                  </td>
                  <td>
                    <Button variant="success" className="me-2"
                      onClick={() => handleAction(owner_name, rso_name, 'allow')}
                    >
                      Yes
                    </Button>
                    <Button variant="danger"
                      onClick={() => handleAction(owner_name, rso_name, 'deny')}
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
