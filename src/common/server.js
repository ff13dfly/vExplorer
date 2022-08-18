import { Row, Col,Form,Button} from 'react-bootstrap';
import { useEffect,useState } from 'react';

import ListNode from './listNode';
import ListGateway from './listGateway';

import RPC from '../lib/rpc.js';

const self={
  changeNode:(res)=>{
    console.log(res.target.innerHTML);
  },
  changeGateway:(res)=>{
    console.log(res.target.innerHTML);
  },
  fresh:()=>{
    console.log('ready to link to new node');
  },
};

function Server(props) {

  let [node, setNode] = useState('');
  let [gateway, setGateway] = useState('');

  useEffect(() => {
    RPC.init((dt)=>{
      const list=dt.data.raw;
      console.log(list);
      setNode((<ListNode change = {self.changeNode} list={list.node} start={RPC.getStart()}/>));
      setGateway((<ListGateway change = {self.changeNode} list={list.gateway} start={RPC.getStart()}/>));
    });
  }, []);

  return (
      <Row  className = "pt-2">
        <Col lg = { 12 } xs = { 12 } className = "pt-2" >
          <label>Select direct link node</label>
          {node}
        </Col>
        <Col lg = { 12 } xs = { 12 } className = "pt-4" ></Col>
        <Col lg = { 12 } xs = { 12 } className = "pt-4" >
        <Form.Check 
        type="switch"
        id="custom-switch"
        label="Enable vGateway" 
        size="lg"
      />
        </Col>
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          {gateway}
        </Col>
        <Col lg = { 12 } xs = { 12 } className = "pt-4 text-center">
          <Button size = "lg" variant = "primary" onClick = { self.fresh } > Fresh </Button>{' '}
        </Col> 
      </Row>
  );
}
export default Server;