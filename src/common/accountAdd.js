
import { Row, Col,Button } from 'react-bootstrap';

//import { useState } from 'react';

function AccountAdd(props) {

  const self={
    init:()=>{

    },
    addAccount:()=>{
      console.log('add new account');
    }
  }

  return (
    <Row className = "pt-2" >
      <Col lg = { 12 } xs = { 12 } className = "pt-2 text-center" ><hr /></Col> 
      <Col lg = { 12 } xs = { 12 } className = "pt-2 text-center" >
        <Button size = "lg" variant = "primary" onClick = { self.addAccount } >New Account</Button>{' '}
      </Col> 
    </Row>
  );
}
export default AccountAdd;