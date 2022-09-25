import { Container } from 'react-bootstrap';
import { useState } from 'react';

import Importer from '../common/importer';
import AccountAdd from '../common/accountAdd';
import User from '../common/user';

import STORAGE from '../lib/storage.js';

function Account(props) {
	const acc=STORAGE.getKey("signature");

	const self={
		init:()=>{

		},
		fresh:()=>{
			setDom(self.getComponent());
			setAdd(self.getAdd());
		},
		getComponent:()=>{
			return acc===null?
			(<Importer fresh={self.fresh}/>):
			(<User fresh={self.fresh} balance={props.balance}/>);
		},
		getAdd:()=>{
			return acc===null?
			(<AccountAdd fresh={self.fresh}/>):
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