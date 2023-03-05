import React from "react";
import Modal from "react-bootstrap/Modal";
import { FeedbackForm } from "./FeedbackForm";

export const FeedbackEditModal = ({ show, handleClose, handleSubmit, feedbackId }) => {
    const handleEditFeedback = (comment, rating) => {
        handleSubmit(comment, rating, feedbackId);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit your feedback</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FeedbackForm handler={handleEditFeedback} />
            </Modal.Body>
        </Modal>
    )
}
