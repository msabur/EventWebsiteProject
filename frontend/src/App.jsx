import { Link, useLocation } from "wouter";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { observer } from "mobx-react-lite";
import { AppState } from "./state/AppState";
import { ErrorAlert } from "./components/ErrorAlert";

import { BaseRouter } from "./routers/BaseRouter";

const homeNav = [
  ['/', 'Events'],
  ['/controlPanel', 'Control Panel'],
  ['/logout', 'Logout'],
]

const authNav = [
  ['/', 'Login'],
  ['/register', 'Register'],
]

const App = observer(() => {
  const [location] = useLocation()
  const nav = AppState.loggedIn ? homeNav : authNav

  return (
    <>
      <Navbar sticky="top" expand="sm" collapseOnSelect>
        <Container>
          <Link href="/">
            <Navbar.Brand>Events Website</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {nav.map(([href, text], i) => (
                <Link href={href} key={i}>
                  <Nav.Link active={location === href}>{text}</Nav.Link>
                </Link>
              ))}
              </Nav>
              <Nav>
              {/* dark/light toggle button */}
              <Nav.Link className="ms-auto" onClick={() => {
                const theme = document.documentElement.getAttribute('data-bs-theme')
                document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'light' : 'dark')
              }}>
                Dark/Light
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {AppState.errorMessage && (<ErrorAlert message={AppState.errorMessage} />)}
        <BaseRouter />
      </Container>
    </>
  )
})

export default App
