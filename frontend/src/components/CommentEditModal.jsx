import React from "react";
import Modal from "react-bootstrap/Modal";
import { CommentForm } from "./CommentForm";

export const CommentEditModal = ({ show, handleClose, handleSubmit, commentId }) => {
    const handleEditComment = (text) => {
        handleSubmit(text, commentId);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit your comment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CommentForm handler={handleEditComment} />
            </Modal.Body>
        </Modal>
    )
}
