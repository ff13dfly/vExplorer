//import { useState } from 'react';
import { Row,Col, Form } from 'react-bootstrap';

function Data(props) {
    const shorten=props.tools.shortenAddress;
    const toStr=props.tools.hex2str

    const cls={
        "wordWrap": "break-word",
    }

    return ( <Row className = "pt-2" >
        < Form >
        <Form.Group>
            <Form.Label > Data anchor on { props.block } < /Form.Label>
            <Form.Control as = "textarea" rows = { 3 } value = { toStr(props.raw) } disabled = "disabled" / ></Form.Group>
        </Form>
        <Col lg = { 12 } xs = { 12 }><p style={cls}>owner:{shorten(props.owner)}</p></Col>
    < /Row>);
}

export default Data;