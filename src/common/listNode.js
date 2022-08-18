
import { useState,useEffect } from 'react';

import { ListGroup} from 'react-bootstrap';

function ListNode(props) {
	//console.log(props.start);
	let [list, setList] = useState([]);

	useEffect(() => {
        setList(props.list);
    },[]);

	return (
		<ListGroup as="ol">
		{list.map((item,index) => (
			<ListGroup.Item as="li" active={item===props.start?true:false} key={index} onClick={props.change}>
				{item}
			</ListGroup.Item >
		))}
    	</ListGroup>
	);
}
export default ListNode;