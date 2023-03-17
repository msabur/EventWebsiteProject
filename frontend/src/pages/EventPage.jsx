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
import { CommentForm } from "../components/CommentForm";
import { CommentEditModal } from "../components/CommentEditModal";

import "leaflet/dist/leaflet.css"

export const EventPage = observer(({ params }) => {
    const [event, setEvent] = useState({});
    const [comments, setComments] = useState([]);
    const [commentRefreshIndicator, setCommentFeedbackIndicator] = useState(false);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [idOfCommentToEdit, setidOfCommentToEdit] = useState(null);

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
        fetchWrapper.get("/events/" + params.id + "/comments")
            .then((data) => {
                setComments(data.comments);
            });
    }, [commentRefreshIndicator]);

    const submitComment = (text) => {
        fetchWrapper.post(`/events/${params.id}/comments`,
            { text }
        )
            .then(() => {
                setCommentFeedbackIndicator(!commentRefreshIndicator);
            })
    };

    const onDeleteComment = (commentId) => {
        fetchWrapper.delete(`/events/${params.id}/comments/${commentId}`)
            .then(() => {
                setCommentFeedbackIndicator(!commentRefreshIndicator);
            })
    };

    const onEditComment = (text, commentId) => {
        fetchWrapper.put(`/events/${params.id}/comments/${commentId}`,
            { text }
        )
            .then(() => {
                setCommentFeedbackIndicator(!commentRefreshIndicator);
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
                <h4>Write a comment:</h4>
                <div className="mb-3">
                    <CommentForm
                        handler={submitComment}
                    />
                </div>
                <hr />

                <h4>Comments:</h4>
                {comments.length == 0 ?
                    <p>No comments yet! Feel free to add one.</p>
                    : comments.map((comment) => (
                        <Card key={comment.id} className="mb-3" bg={"light"}>
                            <Card.Header>
                                {comment.username}
                                {/*  delete button */}
                                {comment.is_mine &&
                                    <Button variant="danger" size="sm" className="float-end"
                                        onClick={() => onDeleteComment(comment.id)}
                                    >
                                        Delete
                                    </Button>
                                }
                                {/* edit button */}
                                {comment.is_mine &&
                                    <Button variant="primary" size="sm" className="float-end me-2"
                                        onClick={() => {
                                            setidOfCommentToEdit(comment.id)
                                            setShowEditModal(true)
                                        }}
                                    >
                                        Edit
                                    </Button>
                                }
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>{comment.text}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))
                }

                <CommentEditModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    feedbackId={idOfCommentToEdit}
                    handleSubmit={onEditComment}
                />
            </>
        )
    }
});
