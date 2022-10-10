import { useState,useEffect } from 'react';

import { Row,Col,Container} from 'react-bootstrap';
import RPC from '../lib/rpc.js';

function History(props) {
	console.log(props.protocol);
	let [list, setList] = useState([]);

	useEffect(() => {
		if(props.protocol.type==='app') return true;
		RPC.common.history(props.anchor,(list)=>{
			//console.log(list);
			setList(list);
		});
    },[]);

	return (
		<Container>
		<Row>
		<Col lg = { 12 } xs = { 12 } ></Col>
		{list.map((item,index) => (
			<Col lg = { 12 } xs = { 12 } key={index} >
				{index+1} : On block {item.block} , action "{item.action}"
			</Col>
		))}
    	</Row>
		</Container>
	);
}
export default History;