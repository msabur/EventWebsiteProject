import React, { useState, useCallback, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { MapContainer, TileLayer } from "react-leaflet";
import { useFetchWrapper } from "../../api";

import "leaflet/dist/leaflet.css"

export const NewEventModal = ({ show, handleClose }) => {
    /* Required fields in form:
        * - category
        * - event name
        * - event type (public/private/RSO)
        * - phone number
        * - description
        * - location coordinates
        * - start time
        * - end time
    */

    const makkahCoordinates = { lat: 21.4225, lng: 39.8261 }

    const [map, setMap] = useState(null)
    const [latitude, setLatitude] = useState(makkahCoordinates.lat);
    const [longitude, setLongitude] = useState(makkahCoordinates.lng);

    const [ownedApprovedRSOs, setOwnedApprovedRSOs] = useState([]);

    const [eventType, setEventType] = useState("public");

    const [hadError, setHadError] = useState(false);

    const categories = ["Technology", "Sports", "Academic", "Social", "Talks", "Other"];

    const fetchWrapper = useFetchWrapper();

    const onMove = useCallback(() => {
        const { lat, lng } = map.getCenter()
        setLatitude(lat.toFixed(4))
        setLongitude(lng.toFixed(4))
    }, [map])

    useEffect(() => {
        if (!map) return
        map.on('move', onMove)
        return () => {
            map.off('move', onMove)
        }
    }, [map, onMove])

    const fetchOwnedApprovedRSOs = () => {
        // add dummy entry indicating loading
        setOwnedApprovedRSOs([{ id: -1, name: "Loading..." }]);
        fetchWrapper.get("/my-rsos/owned-approved")
            .then((data) => {
                setOwnedApprovedRSOs(data);
                console.log(data)
            });
    }

    const handleSubmit = (event) => {
        setHadError(false);
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }
        const [eventLatitude, eventLongitude] = eventLocationCoordinates.value.split(" ")

        fetchWrapper.post("/events", {
            name: form.eventName.value,
            type: eventType,
            rso: (eventType === "rso" ? form.eventRSO.value : null),
            category: form.eventCategory.value,
            description: form.eventDescription.value,
            latitude: eventLatitude,
            longitude: eventLongitude,
            radius: form.eventRadius.value,
            startTime: form.eventStartTime.value,
            endTime: form.eventEndTime.value,
            phoneNumber: form.eventPhoneNumber.value
        })
            .then(() => {
                handleClose();
            })
            .catch(() => {
                setHadError(true);
            })
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="eventName">
                        <Form.Label>Event name</Form.Label>
                        <Form.Control type="text" placeholder="Enter event name" required />
                    </Form.Group>
                    <Form.Group controlId="eventType">
                        <Form.Label>Event type</Form.Label>
                        <Form.Check type="radio"
                            label="Public"
                            name="eventType"
                            checked={eventType === "public"}
                            onChange={() => setEventType("public")}
                            required
                        />
                        <Form.Check type="radio"
                            label="Private"
                            name="eventType"
                            checked={eventType === "private"}
                            onChange={() => setEventType("private")}
                            required
                        />
                        <Form.Check type="radio"
                            label="RSO"
                            name="eventType"
                            checked={eventType === "rso"}
                            onChange={() => {
                                fetchOwnedApprovedRSOs();
                                setEventType("rso")
                            }
                            }
                            required
                        />
                    </Form.Group>
                    {eventType === "rso" && (
                        <Form.Group controlId="eventRSO">
                            <Form.Label>RSO</Form.Label>
                            <Form.Select>
                                {ownedApprovedRSOs.map(({ id, name }) => (
                                    <option key={id}>{name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                    <Form.Group controlId="eventCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Select>
                            {categories.map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="eventDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} required />
                    </Form.Group>
                    <Form.Group controlId="eventLocationCoordinates">
                        <Form.Label>Coordinates</Form.Label>
                        <Form.Control type="text" required readOnly
                            placeholder="use map to select location"
                            value={latitude == -1 ? "" : `${latitude} ${longitude}`}
                        />
                    </Form.Group>
                    <Form.Group controlId="eventRadius">
                        <Form.Label>Radius (in meters)</Form.Label>
                        <Form.Control type="number" defaultValue={15} required />
                    </Form.Group>
                    <MapContainer
                        center={makkahCoordinates}
                        zoom={2}
                        ref={setMap}
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <div id="map-crosshair">+</div>
                    </MapContainer>
                    <Form.Group controlId="eventStartTime">
                        <Form.Label>Start time</Form.Label>
                        <Form.Control type="datetime-local" required />
                    </Form.Group>
                    <Form.Group controlId="eventEndTime">
                        <Form.Label>End time</Form.Label>
                        <Form.Control type="datetime-local" required />
                    </Form.Group>
                    <Form.Group controlId="eventPhoneNumber">
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control type="text" placeholder="Enter phone number" required />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                    {hadError && (
                        <p className="newEventError">
                            Error occurred while creating event
                        </p>
                    )}
                </Form>
            </Modal.Body>
        </Modal>
    );
}
