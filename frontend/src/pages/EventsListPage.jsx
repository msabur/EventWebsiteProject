import { observer } from 'mobx-react-lite';
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { AppState } from '../state/AppState'

export const EventsListPage = observer(() => {
  const [events, setEvents] = useState([]);

  // event fields: id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude

  // const sampleEvents = [
  //   {
  //     id: 1,
  //     name: 'Event 1',
  //     description: 'This is the first event',
  //     location: 'Student Union',
  //     timestamp: '2021-04-01 12:00:00',
  //     category: 'RSO Event'
  //   },
  //   {
  //     id: 2,
  //     name: 'Event 2',
  //     description: 'This is the second event',
  //     location: 'Health Center',
  //     timestamp: '2021-04-02 12:00:00',
  //     category: 'Public Event',
  //   },
  //   {
  //     id: 3,
  //     name: 'Event 3',
  //     description: 'This is the third event',
  //     location: 'Business Building',
  //     timestamp: '2021-04-03 12:00:00',
  //     category: 'Private Event',
  //   },
  // ];

  useEffect(() => {
    fetch('http://localhost:3000/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setEvents(data.events);
        AppState.setEvents(data.events);
      }
      );
  }, []);

  return (
    <>
      <p>Welcome to the events page!</p>
      <p>Here are the events:</p>
      <Row xs={1} md={2} lg={3} className="g-4">
        {events.map((event) => (
          <Col key={event.id}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <Link href={`/event/:${event.id}`} event={event}>
                    <Card.Link>{event.event_name}</Card.Link>
                  </Link>
                </Card.Title>
                <Card.Text>
                  {event.description}
                </Card.Text>
              </Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroup.Item>📌 {event.location_name}</ListGroup.Item>
              </ListGroup>
              <Card.Footer>
                📅 {event.time}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
});
