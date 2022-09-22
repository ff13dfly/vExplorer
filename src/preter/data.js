//import { useState } from 'react';
import { Row,Col, Form,Container } from 'react-bootstrap';
import tools from '../lib/tools.js';

function Data(props){
    const cls={
        "wordWrap": "break-word",
    };

    const self={
        calcRows:(len)=>{
            const r=Math.floor(len*0.04);
            return r>20?20:r;
        },
    }
    //console.log(props);
    const pt=props.protocol;
    
    //let raw=props.raw.substr(0, 2).toLowerCase()==='0x'?tools.hex2str(props.raw) :props.raw;
    let raw='';
    if(typeof props.raw === 'string' && props.raw.substr(0, 2).toLowerCase()==='0x'){
        raw=decodeURIComponent(props.raw.slice(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
    }else{
        raw=props.raw;
    }
    const txt=pt.format && pt.format==="JSON"?JSON.stringify(raw):raw;
    const count=self.calcRows(txt.length);

    
    return (
    <Container>
    <Row className = "pt-2" >
        < Form >
        <Form.Group>
            <Form.Label > Data anchor on { props.block } </Form.Label>
            <Form.Control as = "textarea" rows = {count} value = { txt } disabled = "disabled" /></Form.Group>
        </Form>
        <Col lg = { 12 } xs = { 12 }><p style={cls}>owner:{tools.shortenAddress(props.owner)}</p></Col>
    </Row>
    </Container>);
}

export default Data;