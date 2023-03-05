import { observer } from 'mobx-react-lite';
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import { AppState } from '../state/AppState'
import { formatTime } from '../utils';

export const EventsListPage = observer(() => {
  const [events, setEvents] = useState([]);

  const typeToBadge = {
    public: 'primary',
    private: 'secondary',
    rso: 'success',
  }

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
      }
      );
  }, []);

  return (
    <>
      <p>Welcome, {AppState.username}!</p>
      <p>Here are the events:</p>
      <Row xs={1} md={2} lg={3} className="g-4">
        {events.map((event) => (
          <Col key={event.id}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <Link href={`/events/${event.id}`} event={event}>
                    <Card.Link>{event.event_name}</Card.Link>
                  </Link>
                </Card.Title>
                <Card.Text>
                  {event.description}
                </Card.Text>
              </Card.Body>

              <ListGroup className="list-group-flush">
                <ListGroup.Item>📌 {event.location_name}</ListGroup.Item>
                <ListGroup.Item>
                  <Badge bg={typeToBadge[event.type]}>{event.type}</Badge>
                </ListGroup.Item>
              </ListGroup>

              <Card.Footer>
                📅 {formatTime(event.start_time)}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
});
