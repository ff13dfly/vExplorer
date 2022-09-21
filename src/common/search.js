import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

import { useEffect } from 'react';

function Search(props) {
	const self = {
		onSave: () => {
			props.onCheck(anchor.toLocaleLowerCase());
		},
		onChange: (event) => {
			if (!event.target.value) return false;
			setAnchor(event.target.value.trim());
		},
	};


	let [anchor, setAnchor] = useState('');
	
	props.UI.regComponent("Search","search_con");

	useEffect(() => {
		//const UI=props.UI;
		//UI.autoHide("wow","animate__backOutUp",true);
	}, []);

	return (
		<Container className="search_con" data-wow-delay="1s" data-wow-duration="4s">
			<Row>
				<Col lg={10} xs={8} className="text-end pt-4" >
					<Form.Control size="lg" type="text" placeholder="Anchor name..." onChange={(ev) => { self.onChange(ev) }} />
				</Col>
				<Col lg={2} xs={4} className="text-end pt-4" >
					<Button size="lg" variant="primary" onClick={() => { self.onSave() }} > Search </Button>
				</Col >
			</Row>
		</Container>
	);
}

export default Search;