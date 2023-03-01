import React, { useState } from "react";
import Alert from 'react-bootstrap/Alert';

export function ErrorAlert({ message }) {
    const [show, setShow] = useState(true);

    if (show) {
        return (
            <div className="in-front position-fixed w-100 top-0 start-0 end-100">
                <Alert variant="danger" dismissible onClose={() => setShow(false)}>
                    {message}
                </Alert>
            </div>
        )
    } else {
        return null;
    }
}
