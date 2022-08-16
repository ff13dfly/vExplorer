
import { Row, Col,Container } from 'react-bootstrap';

//import { useState } from 'react';

import Data from '../preter/data';
import NFT from '../preter/NFT';
import AnchorApp from '../preter/app';
import Creation from '../preter/creation';

function Detail(props) {


  let dom='';

  //console.log(props);
  const name=props.anchor;
  const owner=props.owner;
  const block=parseInt(props.block);
  const raw=props.raw;

  switch (props.protocol.type) {
    case 'data':
      dom=(<Data anchor={name} raw={raw} owner={owner} block={block}/>);
    break;

    case 'NFT':
      dom=(<NFT anchor={name} raw={raw} owner={owner} block={block} tools={props.tools}/>);
    break;

    case 'creation': 
      dom=(<Creation raw={props.raw} owner={props.owner} block={props.block} protocol={props.protocol} tools={props.tools}/>);
    break;

    case 'app':
      dom=(<AnchorApp 
        anchor={name} 
        raw={raw} 
        owner={owner} 
        block={block}
        protocol={props.protocol}
        agent={props.agent}/>
      );
    break;
            
    default:
      dom='Unexpect anchor ['+name+'] data : '+JSON.stringify(props.raw);
    break;
  }

  return (
    <Container>
      <Row className = "pt-2" >
        <Col lg = { 12 } xs = { 12 } className = "pt-2" >{dom}</Col>
      </Row>
    </Container>
  );
}
export default Detail;