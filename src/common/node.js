
import { useState} from 'react';
import { Row, Col, Form,Button } from 'react-bootstrap';

function NodeInput(props) {
	let [node, setNode] = useState('');

	const self={
		changeURI:(ev)=>{
			setNode(ev.target.value);
		},
		saveNode:()=>{
			let uri=node.trim();
			
			//check uri here;
			props.save(uri);
		},
	};

	return (
		<Row className = "pt-4" >
			<Col lg = { 9 } xs = { 9 } className = "pt-2" >
				<Form.Control size = "lg" type = "text" placeholder = "Add target anchor node ..." onChange = { self.changeURI }/>
			</Col>
			<Col lg = { 3 } xs = { 3 } className = "pt-2 text-end" >
				<Button size = "md" className = "mt-1" variant = "primary" onClick = { self.saveNode } > Save </Button>
			</Col>
        </Row>
	);
}
export default NodeInput;