import { observer } from 'mobx-react-lite';
import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'wouter';
import { AuthState } from '../state/AuthState'

export const EventsListPage = observer(() => {
  const [events, setEvents] = useState([]);

  // event fields: id, contact email, category, phone, description, timestamp, name, location

  const sampleEvents = [
    {
      id: 1,
      name: 'Event 1',
      description: 'This is the first event',
      location: 'Student Union',
      timestamp: '2021-04-01 12:00:00',
      category: 'RSO Event'
    },
    {
      id: 2,
      name: 'Event 2',
      description: 'This is the second event',
      location: 'Health Center',
      timestamp: '2021-04-02 12:00:00',
      category: 'Public Event',
    },
    {
      id: 3,
      name: 'Event 3',
      description: 'This is the third event',
      location: 'Business Building',
      timestamp: '2021-04-03 12:00:00',
      category: 'Private Event',
    },
  ];

  useEffect(() => {
    setEvents(sampleEvents);
  }, []);

  return (
    <>
      <p>Welcome to the events page!</p>
      <p>Here are the events:</p>
      {/* table format with React-Bootstrap */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Location</th>
            <th>Timestamp</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              {/* event name links to /events/:id */}
              <td>
                <Link href={`/event/${event.id}`}>
                  <a>{event.name}</a>
                </Link>
              </td>
              <td>{event.description}</td>
              <td>{event.location}</td>
              <td>{event.timestamp}</td>
              <td>{event.category}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
});
