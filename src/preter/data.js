//import { useState } from 'react';
import { Row,Col, Form } from 'react-bootstrap';
import tools from '../lib/tools.js';

function Data(props){
    const cls={
        "wordWrap": "break-word",
    }
    console.log(props);
    const pt=props.protocol;
    const txt=pt.format && pt.format==="JSON"?JSON.stringify(props.raw):props.raw;

    return ( <Row className = "pt-2" >
        < Form >
        <Form.Group>
            <Form.Label > Data anchor on { props.block } </Form.Label>
            <Form.Control as = "textarea" rows = { 3 } value = { txt } disabled = "disabled" /></Form.Group>
        </Form>
        <Col lg = { 12 } xs = { 12 }><p style={cls}>owner:{tools.shortenAddress(props.owner)}</p></Col>
    </Row>);
}

export default Data;