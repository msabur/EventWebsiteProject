import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ReactStars from "react-rating-stars-component";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'
import { formatTime } from "../utils";
import { useFetchWrapper } from "../api";

import "leaflet/dist/leaflet.css"

export const EventPage = observer(({ params }) => {
    const [event, setEvent] = useState({});
    const [feedbacks, setFeedbacks] = useState([]);
    const [commentEntry, setCommentEntry] = useState("");
    const [ratingEntry, setRatingEntry] = useState(3);
    const [feedbackRefreshIndicator, setRefreshFeedbackIndicator] = useState(false);
    const [error, setError] = useState(null);

    const fetchWrapper = useFetchWrapper()

    useEffect(() => {
        console.log("EventPage useEffect")
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

    const handleCommentEntry = (e) => {
        setCommentEntry(e.target.value);
    };

    const handleRatingEntry = (newRating) => {
        setRatingEntry(newRating);
    };

    const submitFeedback = (e) => {
        e.preventDefault();
        fetchWrapper.post(`/events/${params.id}/feedbacks`, {
            comment: commentEntry,
            rating: ratingEntry,
        })
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
                <h4>Contact:</h4>
                <p>Phone: {event.phone_number}</p>
                <p>Email: {event.email_address}</p>
                <h4>Event type:</h4>
                <p>{event.type}</p>
                <h4>Event category:</h4>
                <p>{event.category}</p>

                <h4>Give feedback:</h4>
                <div className="mb-3">
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicComment">
                            <Form.Label>Your comment</Form.Label>
                            <Form.Control type="text" placeholder="Enter a comment"
                                value={commentEntry} onChange={handleCommentEntry}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicRating">
                            <Form.Label>Your rating</Form.Label>
                            <ReactStars
                                count={5}
                                value={ratingEntry}
                                onChange={handleRatingEntry}
                                size={24}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" onClick={submitFeedback}>
                            Submit
                        </Button>
                    </Form>
                </div>
                <h4>Feedback:</h4>
                {feedbacks.length == 0 ?
                    <p>No feedback yet!</p>
                    : feedbacks.map((comment) => (
                        // attributes: comment, rating, username
                        // nicely display the feedback as comment + rating
                        <Card key={comment.id} className="mb-3" bg={"light"}>
                            <Card.Header>
                                {comment.username}
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {comment.comment}
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <ReactStars
                                    count={5}
                                    value={comment.rating}
                                    size={24}
                                    edit={false}
                                    isHalf={true}
                                />
                            </Card.Footer>
                        </Card>
                    ))
                }
            </>
        )
    }
});
