import { useState } from 'react';

function Server(props) {

    return (
        <Row>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="#home">Meta Anchor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home" onClick = { self.routerHome }>Home</Nav.Link>
                <Nav.Link href="#account" onClick = { self.routerAccount }>Account</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Col lg = { 12 } xs = { 12 } className = "pt-2" >{dom}</Col>
        </Row>
    );
}
export default Server;