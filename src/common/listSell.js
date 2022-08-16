
import { useState,useEffect } from 'react';

import { Container,Button,Row,Col } from 'react-bootstrap';

import tools from '../lib/tools.js';

function ListSell(props) {
	const shorten=tools.shortenAddress;
	let [list, setList] = useState([]);

	useEffect(() => {
        setList(props.list);
    },[]);

	return (
    <Container>
		{list.map((item,index) => (
			<Row key={index}>
			<Col lg = { 9 } xs = { 9 } >
				<h4>{item[0].args[0].toUtf8()} <span>{item[1].value[1].words[0]}</span> </h4>
				<p> Owner: { shorten(item[1].value[0].toString())}</p>
			</Col>
			<Col lg = { 3 } xs = { 3 } className="text-end">
				<Button size = "md" variant = "primary" onClick = { ()=>{
					props.buy(item[0].args[0].toUtf8(),item[1].value[1].words[0]);
				} } > Buy </Button>{' '}
			</Col>
			</Row>
		))}
      	
    </Container>
	);
}
export default ListSell;