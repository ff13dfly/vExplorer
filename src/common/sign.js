
import { Row, Col,Container,Form,Button } from 'react-bootstrap';

import { Keyring } from '@polkadot/api';

import { useState,useEffect } from 'react';

function Sign(props) {
	console.log('Sign dialog');
	console.log(props);
	
	const k=props.accountKey;
	const dt=localStorage.getItem(k);
	const acc=JSON.parse(dt);
	
	//console.log(props);
	
	const self={
    	changePassword:(ev)=>{
    		setPassword(ev.target.value);
    	},
    	checkPassword:()=>{
    		if(!password) return false;

	        const keyring = new Keyring({ type: 'sr25519' });
	        const pair = keyring.createFromJson(acc);
	        //const encry=acc.encoding.content[0];
	        try {
	            pair.decodePkcs8(password);
	            return pair
	        } catch (error) {
	            return false;
	        }
    	},
    	vertify:()=>{
    		//console.log('call sign.vertify');
    		const pair=self.checkPassword();
    		if(pair===false){
				//setPassword('');
    		}else{
    			//setPassword('');
    			props.callback(pair,props.anchor,props.extend);
    			//props.close();
    		}
    	},
    	changeExtend:(ev,dt)=>{
    		props.extend[dt]=ev.target.value;
    	},
	}

	let [password,setPassword]   =useState('');
	let [extend,setExtend]   =useState('');

	const cls = {
		"wordWrap": "break-word",
	}

	
	useEffect(() => {
        let exDom='';
		if(props.extend!==undefined){
			exDom=Object.keys(props.extend).map((dt,index)=>(
				<Row key={index}>
				<Col lg = { 3 } xs = { 3 } className="pt-3" > {dt}</ Col>
				<Col lg = { 9 } xs = { 9 } className="pt-2" >
					<Form.Control size = "lg" type = {dt==='sell'?"number":"text"} placeholder={'Input '+dt+' value...'} onChange = {(ev)=>{self.changeExtend(ev,dt)}}/>
				</Col>
				</ Row>
			));
		}
		setExtend(exDom);
    },[]);

	return (
		<Container>
			<Row >
				<Col lg = { 3 } xs = { 3 }>
					<p style={cls}>Your<br />Account </p>
				</Col>
				<Col lg = { 9 } xs = { 9 }>
					<p style={cls} className="text-warning">{acc.address}</p>
				</Col>
				<Col lg = { 12 } xs = { 12 }>
				{extend}
				</ Col>
				<Col lg = { 12 } xs = { 12 } className="pt-2">
					<Form.Control size = "lg" type = "password" placeholder = "Account password..." onChange = {(ev)=>{self.changePassword(ev)}}/>
				</Col>
				
				<Col lg = { 12 } xs = { 12 } className = "pt-2 text-end" >
					<Button size = "lg" variant="primary" onClick={()=>{self.vertify()}}>Sign</Button>
				</Col>
			</Row>
		</Container>
	);
}

export default Sign;