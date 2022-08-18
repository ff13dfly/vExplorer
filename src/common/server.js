import { Row, Col,Form,Button} from 'react-bootstrap';
import { useEffect,useState } from 'react';

import ListNode from './listNode';
import ListGateway from './listGateway';

import RPC from '../lib/rpc.js';


let list=null;
let selected_node='';      //保存当前选择的node
let selected_gateway='';   //保存当前选择的gateway
let start='';     //保存切换之前的入口node
let enable=false; //保存enalbe gateway的状态

function Server(props) {

  let [node, setNode] = useState('');
  let [gateway, setGateway] = useState('');

  
  const self={
    changeNode:(res)=>{
      selected_node=res.target.innerHTML;
      setNode((<ListNode change = {self.changeNode} list={list.node} start={selected_node}/>));  
    },
    changeGateway:(res)=>{
      selected_gateway=res.target.innerHTML;
      console.log(res.target.innerHTML);
      setGateway((<ListGateway change = {self.changeGateway} list={list.gateway} start={selected_gateway}/>));
    },
    fresh:()=>{
      console.log('ready to link to new node');
    },
    switcher:(res)=>{
      enable=res.target.checked;
      if(enable){
        setGateway((<ListGateway change = {self.changeGateway} list={list.gateway} start={selected_gateway}/>));
      }else{
        setGateway('');
      }
    },
  };

  useEffect(() => {
    RPC.init((dt)=>{
      list=dt.data.raw;
      start=RPC.getStart();
      //console.log(start);
      setNode((<ListNode change = {self.changeNode} list={list.node} start={start}/>));      
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
        <Form.Check type="switch" label="Enable vGateway" size="lg" onClick = {self.switcher}/>
        </Col>
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          {gateway}
        </Col>
        <Col lg = { 12 } xs = { 12 } className = "pt-4 text-center">
          <Button size = "lg" variant = "warning" onClick = { self.fresh } > Fresh </Button>{' '}
        </Col> 
      </Row>
  );
}
export default Server;