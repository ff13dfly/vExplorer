import { Row, Col,Form} from 'react-bootstrap';
import { useEffect } from 'react';

import RPC from '../lib/rpc.js';

const self={
  changeWay:()=>{

  },
  changeEndpoint:()=>{

  },
};

function Server(props) {
  console.log(props.setEntry)

  useEffect(() => {
    RPC.init((dt)=>{
      const list=dt.data.raw;
      console.log(list);
    });
  }, []);

  return (
      <Row  className = "pt-2">
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
        <Form.Control as="select"  onChange={self.changeWay}>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="black">Black</option>
          <option value="orange">Orange</option>
        </Form.Control>
        </Col>
        <Col lg = { 7 } xs = { 12 } className = "pt-2" >
          <Form.Control size = "lg" type = "text" placeholder = "Anchor name..."/>
        </Col>
      </Row>
  );
}
export default Server;