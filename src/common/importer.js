
import { Row, Col, Button, Form } from 'react-bootstrap';

import { useState } from 'react';

import { Keyring } from '@polkadot/api';
import STORAGE from '../lib/storage.js';

function Importer(props){
    const self={

      changeFile:(ev)=>{
        try {
          const fa = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (e)=>{
            setFile(e.target.result);
          };
          reader.readAsText(fa);
        }catch (error) {
          console.log(error)
        }
      },
      changePassword:(ev)=>{
        setPassword(ev.target.value);
      },
      save:()=>{
        if(!password) return false;

        const keyring = new Keyring({ type: 'sr25519' });
        const sign=JSON.parse(file);
        const pair = keyring.createFromJson(sign);

        try {
            pair.decodePkcs8(password);
            self.setSignJSON(sign);
            props.fresh();      //父组件传过来的

        } catch (error) {
            console.log(error);
            if(error) return false;
        }

      },
      setSignJSON:(fa)=>{
        STORAGE.setKey("signature",fa);
      }
    }
    
    let [password,setPassword]   =useState('');
    let [file, setFile] = useState('');

    return (
      <Row className = "pt-2" >
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          <Form.Control size = "lg" type = "file" placeholder = "Add Polkadot account JSON file..." onChange = { self.changeFile }/>
        </Col>
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          <Form.Control size = "lg" type = "password" placeholder = "Account password..." onChange = {self.changePassword}/> </Col > 
        <Col lg = { 2 } xs = { 12 } className = "pt-2 text-end" >
          <Button size = "lg" variant = "primary" onClick = { self.save } > Import </Button>{' '}
        </Col >
        </Row>
    );
}
export default Importer;