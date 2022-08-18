
import { Row, Col,Button } from 'react-bootstrap';

import { useState,useEffect } from 'react';

//import { formatBalance } from '@polkadot/util';

function User(props) {
  let [amount,setAmount]=useState(0);

  const self={
    init:()=>{

    },
    remove:()=>{
      localStorage.removeItem(props.storageKey);
      props.fresh();      //父组件传过来的
    },
    charge:()=>{
      console.log('ready to call vGateway');
    },
  }

  const fa=localStorage.getItem(props.storageKey);
  const account=JSON.parse(fa);

  const cls = {
    "wordWrap": "break-word",
  }

  useEffect(() => {
    props.balance(account.address,(res)=>{
      if(res===false){
        setAmount('unknown');
      }else{
        setAmount(res.data.free.toHuman());
      }
    });
  });
  
  return (
    <Row className = "pt-2" >
      <Col lg = { 5 } xs = { 5 } className = "pt-2" >
        <h3>{account.meta.name}</h3>
        <p>{amount}</p>
      </Col>
      <Col lg = { 7 } xs = { 7 } className = "pt-2 text-end" >
        <Button size = "sm" variant = "danger" onClick = { self.remove } > Remove </Button>{' '}
      </Col> 
      <Col lg = { 8 } xs = { 8 } className = "text-start" ><p className="text-justify" style={cls}>{account.address}</p></Col>
      <Col lg = { 4 } xs = { 4 } className = "text-end" >
        <Button size = "lg" variant = "primary" onClick = { self.charge } > Charge </Button>{' '}
      </Col>
    </Row>
  );
}
export default User;