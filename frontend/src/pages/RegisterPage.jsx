import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'wouter';

export const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [universities, setUniversities] = useState([]);
    const [universityName, setUniversityName] = useState('');
    const [error, setError] = useState('');
    const [, setLocation] = useLocation();

    useEffect(() => {
        fetch('http://localhost:3000/universities')
            .then((res) => res.json())
            .then((data) => {
                setUniversities(data);
            });
    }, []);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleUniversityChange = (e) => {
        setUniversityName(e.target.value);
    };

    const register = () => {
        // check if username and password and email were entered
        if (!username || !password || !email || !universityName) {
            setError('Missing username, password, email or university');
            return;
        }

        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email, universityName }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.error) {
                    setError(data.error);
                } else {
                    setError('');
                    setLocation('/'); // redirect to login page
                };
            })
            .catch(err => {
                setError(err.message);
            });
    };

    return (
        <Form>
            <h3>Register</h3>
            <Form.Group controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </Form.Group>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={handleEmailChange}
                />
            </Form.Group>
            <Form.Group controlId="formBasicUniversity">
                <Form.Label>University</Form.Label>
                <Form.Select onChange={handleUniversityChange}>
                    <option>Select your university</option>
                    {universities.map((university) => (
                        <option key={university.id}>
                            {university.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Button variant="primary" type="button" onClick={register}>
                Register
            </Button>
            {/* error message */}
            {error && <p className='loginError'>{error}</p>}
        </Form>
    );
};

