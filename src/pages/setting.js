import { Container,Col,Row,Button } from 'react-bootstrap';
import { useEffect,useState } from 'react';

import Server from '../common/server';
import ListNode from '../common/listNode';

import RPC from '../lib/rpc.js';

let selected_node='';



function Setting(props) {
	let [node, setNode] = useState('');

	const self={
		change:(res)=>{
			selected_node=res.target.innerHTML;
			const list=self.nodeList(RPC.start.node);
			setNode(self.getDom(list,selected_node,RPC.ready?'Linked.':'Linking...'));
		},
		nodeList:(start)=>{
			const list=[start];
			const defNode='ws://localhost:9944';
			if(defNode!==start) list.push(defNode);
			return list;
		},
		getDom:(list,selected,info)=>{
			return (
				<Row >
					<Col lg = { 12 } xs = { 12 } className = "pt-2 mb-2">{info}</Col>
					<Col lg = { 12 } xs = { 12 }>
						<ListNode list={list} start={selected} change={self.change}/>
					</Col>
					<Col lg = { 6 } xs = { 6 } className = "pt-4">
						<Button size = "lg" variant = "primary" onClick = { self.clean } > Clean </Button>{' '}
					</Col> 
					<Col lg = { 6 } xs = { 6 } className = "pt-4 text-end">
						<Button size = "lg" variant = "warning" onClick = { self.fresh } > Fresh </Button>{' '}
					</Col>
				</Row>
			)
		},
		clean:()=>{
			props.clean();
		},
		fresh:()=>{
			const obj={
			  node:selected_node,
			}
			props.fresh(obj);
		},
	}

	useEffect(() => {
		selected_node=RPC.start.node;
		if(RPC.empty){
			const list=self.nodeList(RPC.start.node);
			setNode(self.getDom(list,RPC.start.node,RPC.ready?'Linked.':'Linking...'));
		}else{
			setNode((<Server fresh={props.fresh} clean={props.clean}/>));
		}
	},[]);


	return  (<Container>{node}</Container>);
}

export default Setting;