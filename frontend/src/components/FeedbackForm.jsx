import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";

export const FeedbackForm = ({ handler }) => {
    const [commentEntry, setCommentEntry] = useState("");
    const [ratingEntry, setRatingEntry] = useState(3);

    const handleCommentEntry = (e) => {
        setCommentEntry(e.target.value);
    };

    const handleRatingEntry = (newRating) => {
        setRatingEntry(newRating);
    };

    return (
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
            <Button variant="primary" onClick={ () => {
                setCommentEntry("");
                setRatingEntry(3);
                handler(commentEntry, ratingEntry)
            }}>
                Submit
            </Button>
        </Form>
    )
}
