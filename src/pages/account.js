import { Container } from 'react-bootstrap';
import { useState } from 'react';

import Importer from '../common/importer';
import AccountAdd from '../common/accountAdd';
import User from '../common/user';

function Account(props) {
	const k=props.keys.jsonFile;

	const self={
		init:()=>{

		},
		fresh:()=>{
			setDom(self.getComponent());
			setAdd(self.getAdd());
		},
		getComponent:()=>{
			return localStorage.getItem(k)==null?
			(<Importer storageKey={k} fresh={self.fresh}/>):
			(<User storageKey={k} fresh={self.fresh} balance={props.balance}/>);
		},
		getAdd:()=>{
			return localStorage.getItem(k)==null?
			(<AccountAdd storageKey={k} fresh={self.fresh}/>):
			'';
		},
	}
	
	let [dom,setDom]=useState(self.getComponent());
	let [add,setAdd]=useState(self.getAdd());

    return (
    	<Container>
    		{dom}
			{add}
    	</Container>
    );
}

export default Account;