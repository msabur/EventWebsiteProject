import React, { useEffect, useState } from "react";
import { AppState } from "../state/AppState";
import { observer } from "mobx-react-lite";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { formatTime } from "../utils";
import { useFetchWrapper } from "../api";

import "leaflet/dist/leaflet.css"

export const EventPage = observer(({ params }) => {
    const [event, setEvent] = useState({});
    const [feedbacks, setFeedbacks] = useState([]);
    const [commentEntry, setCommentEntry] = useState("");
    const [ratingEntry, setRatingEntry] = useState(5);
    const [feedbackRefreshIndicator, setRefreshFeedbackIndicator] = useState(false);
    const [error, setError] = useState(null);

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

    const handleCommentEntry = (e) => {
        setCommentEntry(e.target.value);
    };

    const handleRatingEntry = (e) => {
        setRatingEntry(e.target.value);
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
                    <Marker position={[event.location_latitude, event.location_longitude]} />
                </MapContainer>
                <h4>Contact:</h4>
                <p>Phone: {event.phone_number}</p>
                <p>Email: {event.email_address}</p>
                <h4>Event type:</h4>
                <p>{event.type}</p>
                <h4>Event category:</h4>
                <p>{event.category}</p>

                <h4>Feedback:</h4>
                {feedbacks.length == 0 ?
                    <p>No feedback yet!</p>
                    : feedbacks.map((comment) => (
                        <div key={comment.id}>
                            <p>{comment.comment}</p>
                            <p>Author: {comment.username}</p>
                            <p>Rating: {comment.rating}</p>
                        </div>
                    ))
                }
                <h4>Leave a feedback:</h4>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicComment">
                        <Form.Label>Your comment</Form.Label>
                        <Form.Control type="text" placeholder="Enter a comment"
                            value={commentEntry} onChange={handleCommentEntry}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicRating">
                        <Form.Label>Your rating</Form.Label>
                        <Form.Control type="number" min="1" max="5" placeholder="Rating"
                            value={ratingEntry} onChange={handleRatingEntry} />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={submitFeedback}>
                        Submit
                    </Button>
                </Form>
            </>
        )
    }
});
