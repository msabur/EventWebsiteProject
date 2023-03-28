import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useFetchWrapper } from "../api";

export const ViewRSOJoinRequestsModal = ({ show, handleClose }) => {
  const fetchWrapper = useFetchWrapper();

  const [rsoJoinRequests, setRSOJoinRequests] = useState([]);

  useEffect(() => {
    if (show) {
      fetchWrapper.get('/my-rsos/pending-memberships')
        .then((data) => {
          setRSOJoinRequests(data);
        })
    }
  }, [show]);

  const handleAction = (username, rsoName, action) => {
    console.log(username, rsoName, action);
    console.log(rsoJoinRequests);

    fetchWrapper.post('/my-rsos/pending-memberships', {
      username,
      rso_name: rsoName,
      accept: action === 'allow',
    })
      .then(() => {
        setRSOJoinRequests(rsoJoinRequests.filter((r) => (
          r.username !== username || r.rso_name !== rsoName
        )));
      });
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Requests to join your RSOs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {rsoJoinRequests.length === 0 ? (
          <p className="text-center">There are no requests</p>
        ) : (
          <Table hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>RSO Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rsoJoinRequests.map(({ username, rso_name }) => (
                <tr key={[username, rso_name].join('-')}>
                  <td>
                    <p>{username}</p>
                  </td>
                  <td>
                    <p>{rso_name}</p>
                  </td>
                  <td>
                    <Button variant="success" className="me-2"
                      onClick={() => handleAction(username, rso_name, 'allow')}
                    >
                      Yes
                    </Button>
                    <Button variant="danger"
                      onClick={() => handleAction(username, rso_name, 'deny')}
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
