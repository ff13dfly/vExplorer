
import { Row, Col,Button,Container,Form } from 'react-bootstrap';

import { useState } from 'react';
import STORAGE from '../lib/storage.js';

function ImportAnchor(props) {
  const self={
    changeAnchor:(ev)=>{
      setAnchor(ev.target.value);
    },
    add:()=>{
      props.onCheck(anchor,(res)=>{
        if(res===false) return setInfo('Load failed.');
        const list=self.getList();
        list[anchor]=res;
        STORAGE.setKey("mine",list);
        props.fresh();
      });
    },
    saveList:(k,v)=>{
      localStorage.setItem(k,JSON.stringify(v));
    },
    getList:()=>{
      const list=STORAGE.getKey("mine");
			if (list === null) return {};
			return list;
    }
  }

  let [anchor,setAnchor]=useState('');
  let [info, setInfo] =useState('');

  return (
    <Container>
    <Row className = "pt-2" >
      <Col lg = { 7 } xs = { 7 } className = "pt-2" >
        <Form.Control size = "lg" type = "text" placeholder = "Anchor name..." onChange = {self.changeAnchor}/>
      </Col>
      <Col lg = { 5 } xs = { 5 } className = "pt-2 text-end" >
        <Button size = "lg" variant = "primary" onClick = { self.add } > Import </Button>{' '}
      </Col>
      <Col lg = { 12 } xs = { 12 }>{info}</Col>
    </Row>
    
    </Container>
  );
}
export default ImportAnchor;