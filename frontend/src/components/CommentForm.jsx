import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

export const CommentForm = ({ handler }) => {
    const [commentEntry, setCommentEntry] = useState("");

    const handleCommentEntry = (e) => {
        setCommentEntry(e.target.value);
    };

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();
            setCommentEntry("");
            handler(commentEntry)
        }}>
            <Form.Group className="mb-3" controlId="formBasicComment">
                <Form.Label>Your comment</Form.Label>
                <Form.Control type="text" placeholder="Enter a comment"
                    value={commentEntry} onChange={handleCommentEntry}
                />
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    )
}
