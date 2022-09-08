import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

function Search(props) {
	const self={
		onSave:()=>{
			props.onCheck(anchor.toLocaleLowerCase());
		},
		onChange:(event)=>{
			if(!event.target.value) return false;
			setAnchor(event.target.value);
		},
	}

    let [anchor, setAnchor]=useState('');

    return (
    	<Container>
		<Row className = "pt-2" >
        <Col lg = { 10 } xs = { 8 } className = "text-end pt-2" >
			<Form.Control size = "lg" type = "text" placeholder = "Anchor name..." onChange = {(ev)=>{self.onChange(ev)}}/>
	    </Col>

        <Col lg = { 2 } xs = { 4 } className = "text-end pt-2" >
        	<Button size = "lg"  variant = "primary" onClick = {()=>{self.onSave()}} > Search < /Button>
        </Col >
        </Row>
        </Container>
    );
}

export default Search;