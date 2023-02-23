import { observer } from "mobx-react-lite";
import React from "react";

export const EventPage = ({params}) => {
    // dummy event
    const event = {
        id: 0,
        event_name: "",
        description: "",
        location_name: "",
        time: "",
        category: "",
        phone_number: "",
        email_address: "",
        location_latitude: "",
        location_longitude: ""
    }
    return (
        <>
            <p>Event info</p>
            <p>{event.event_name}</p>
            <p>{event.description}</p>
            <p>{event.location_name}</p>
            <p>{event.time}</p>
            <p>{event.category}</p>
            <p>{event.phone_number}</p>
            <p>{event.email_address}</p>
            <p>{event.location_latitude}</p>
            <p>{event.location_longitude}</p>
        </>
    )
}
