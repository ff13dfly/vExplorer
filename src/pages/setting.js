import { Container } from 'react-bootstrap';

import Error from '../common/error';
import Server from '../common/server';
import ListNode from '../common/listNode';

import RPC from '../lib/rpc.js';

function Setting(props) {
	//console.log(RPC);
	if(!RPC.ready){
		return (<Error data={'Failed to link any node.'} />);
	}
	if(RPC.empty){
		return (
			<Container>
				<span>No entry anchor , link to local node. </span>
				<ListNode list={[RPC.start.node]} start={RPC.start.node} change={()=>{}}/>
			</Container>
			
		);
	}else{
		return (
			<Container>
				<Server fresh={props.fresh} clean={props.clean}/>
			</Container>
		);
	}
}

export default Setting;