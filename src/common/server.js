import { Row, Col,Form,Button} from 'react-bootstrap';
import { useEffect,useState } from 'react';

import ListNode from './listNode';
import ListGateway from './listGateway';

import RPC from '../lib/rpc.js';


let list=null;
let selected_node='';      //保存当前选择的node
let selected_gateway='';   //保存当前选择的gateway
let enable=false;         //保存enalbe gateway的状态

function Server(props) {

  let [node, setNode] = useState('');
  let [gateway, setGateway] = useState('');
  let [info, setInfo] = useState('');
  
  const self={
    changeNode:(res)=>{
      selected_node=res.target.innerHTML;
      setNode((<ListNode change = {self.changeNode} list={list.node} start={selected_node}/>));  
    },
    changeGateway:(res)=>{
      selected_gateway=res.target.innerHTML;
      setGateway((<ListGateway change = {self.changeGateway} list={list.gateway} start={selected_gateway}/>));
    },
    clean:()=>{
      props.clean();
    },
    fresh:()=>{
      if(enable===false) selected_gateway='';
      if(selected_gateway==='') enable=false;
      
      const obj={
        node:selected_node,
        gateway:enable,
        server:selected_gateway,
      }
      props.fresh(obj);
    },
    switcher:(res)=>{
      enable=res.target.checked;
      if(enable){
        setGateway((<ListGateway change = {self.changeGateway} list={list.gateway} start={selected_gateway}/>));
      }else{
        setGateway('');
        selected_gateway='';
      }
    },
  };

  useEffect(() => {
      if(RPC.ready){
        list=RPC.server;
        if(list.node){
          //setNode(RPC.start.node);
          selected_node=RPC.start.node;
          setNode((<ListNode change = {self.changeNode} list={list.node} start={RPC.start.node}/>));
        }

        if(RPC.start.gateway && list.gateway){
          enable=true;
          selected_gateway=RPC.start.server;
          setGateway((<ListGateway change = {self.changeGateway} list={list.gateway} start={RPC.start.server}/>));
        }
      }else{
        setInfo('No server linked yet...');
      }
  }, []);

  return (
      <Row  className = "pt-2">
        <Col lg = { 12 } xs = { 12 }>{info}</Col>
        <Col lg = { 12 } xs = { 12 } className = "pt-2" >
          <label>Select direct link node</label>
          {node}
        </Col>
        <Col lg = { 12 } xs = { 12 } className = "pt-2" >
        <Form.Check type="switch" label="Enable vGateway" size="lg" defaultChecked={RPC.start.gateway} onClick = {self.switcher}/>
        </Col>
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          {gateway}
        </Col>
        <Col lg = { 6 } xs = { 6 } className = "pt-4">
          <Button size = "lg" variant = "primary" onClick = { self.clean } > Clean </Button>{' '}
        </Col> 
        <Col lg = { 6 } xs = { 6 } className = "pt-4 text-end">
          <Button size = "lg" variant = "warning" onClick = { self.fresh } > Fresh </Button>{' '}
        </Col> 
      </Row>
  );
}
export default Server;