import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ReactStars from "react-rating-stars-component";
import Table from 'react-bootstrap/Table';
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'
import { formatTime } from "../utils";
import { useFetchWrapper } from "../api";
import { FeedbackForm } from "../components/FeedbackForm";
import { FeedbackEditModal } from "../components/FeedbackEditModal";

import "leaflet/dist/leaflet.css"

export const EventPage = observer(({ params }) => {
    const [event, setEvent] = useState({});
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackRefreshIndicator, setRefreshFeedbackIndicator] = useState(false);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [idOfFeedbackToEdit, setidOfFeedbackToEdit] = useState(null);

    const fetchWrapper = useFetchWrapper()

    useEffect(() => {
        fetchWrapper.get("/events/" + params.id)
            .then((data) => {
                setEvent(data.event);
            })
            .catch((error) => {
                setError(error);
            });
    }, []);

    useEffect(() => {
        fetchWrapper.get("/events/" + params.id + "/feedbacks")
            .then((data) => {
                setFeedbacks(data.feedbacks);
            });
    }, [feedbackRefreshIndicator]);

    const submitFeedback = (comment, rating) => {
        fetchWrapper.post(`/events/${params.id}/feedbacks`,
            { comment, rating, }
        )
            .then(() => {
                setRefreshFeedbackIndicator(!feedbackRefreshIndicator);
            })
    };

    const onDeleteFeedback = (feedbackId) => {
        fetchWrapper.delete(`/events/${params.id}/feedbacks/${feedbackId}`)
            .then(() => {
                setRefreshFeedbackIndicator(!feedbackRefreshIndicator);
            })
    };

    const onEditFeedback = (comment, rating, feedbackId) => {
        fetchWrapper.put(`/events/${params.id}/feedbacks/${feedbackId}`,
            { comment, rating }
        )
            .then(() => {
                setRefreshFeedbackIndicator(!feedbackRefreshIndicator);
            })
    };

    if (error) {
        return (
            <>
                <p>{error.message}</p>
            </>
        )
    } else if (!event.location_latitude) {
        return (
            <>
                <p>Loading...</p>
            </>
        )
    } else {
        event.type = (event.host_rso_id) ? "RSO" : (event.host_university_id) ? "Private" : "Public";
        return (
            <>
                <h1>{[event.event_name]}</h1>
                <h4>{formatTime(event.start_time)} - {formatTime(event.end_time)}</h4>
                <p>{event.description}</p>
                <h4>Location: {event.location_name}</h4>
                <MapContainer
                    center={[event.location_latitude, event.location_longitude]}
                    zoom={13}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[event.location_latitude, event.location_longitude]} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })} />
                </MapContainer>
                <h4>More information</h4>
                <Table bordered hover>
                    <tbody>
                        <tr>
                            <td>Event type</td>
                            <td>{event.type}</td>
                        </tr>
                        <tr>
                            <td>Event category</td>
                            <td>{event.category}</td>
                        </tr>
                        <tr>
                            <td>Contact phone</td>
                            <td>{event.phone_number}</td>
                        </tr>
                        <tr>
                            <td>Contact email</td>
                            <td>{event.email_address}</td>
                        </tr>
                    </tbody>
                </Table>

                <hr />
                <h4>Give feedback:</h4>
                <div className="mb-3">
                    <FeedbackForm
                        handler={submitFeedback}
                    />
                </div>
                <hr />

                <h4>Feedback:</h4>
                {feedbacks.length == 0 ?
                    <p>No feedback yet!</p>
                    : feedbacks.map((feedback) => (
                        <Card key={feedback.id} className="mb-3" bg={"light"}>
                            <Card.Header>
                                {feedback.username}
                                {/*  delete button */}
                                {feedback.is_mine &&
                                    <Button variant="danger" size="sm" className="float-end"
                                        onClick={() => onDeleteFeedback(feedback.id)}
                                    >
                                        Delete
                                    </Button>
                                }
                                {/* edit button */}
                                {feedback.is_mine &&
                                    <Button variant="primary" size="sm" className="float-end me-2"
                                        onClick={() => {
                                            setidOfFeedbackToEdit(feedback.id)
                                            setShowEditModal(true)
                                        }}
                                    >
                                        Edit
                                    </Button>
                                }
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>{feedback.comment}</Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <ReactStars
                                    count={5}
                                    value={feedback.rating}
                                    size={24}
                                    edit={false}
                                    isHalf={true}
                                />
                            </Card.Footer>
                        </Card>
                    ))
                }

                <FeedbackEditModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    feedbackId={idOfFeedbackToEdit}
                    handleSubmit={onEditFeedback}
                />
            </>
        )
    }
});
