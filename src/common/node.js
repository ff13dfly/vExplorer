
import { useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

function NodeInput(props) {
	const self={
		changeFile:(ev)=>{

		},
	}

	useEffect(() => {

    },[]);

	return (
		<Row className = "pt-4" >
			<Col lg = { 12 } xs = { 12 } className = "pt-2" >
				<Form.Control size = "lg" type = "text" placeholder = "Add target anchor node ..." onChange = { self.changeFile }/>
			</Col>
        </Row>
	);
}
export default NodeInput;