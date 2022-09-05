
import { Row, Col,Container } from 'react-bootstrap';

import Data from '../preter/data';
import NFT from '../preter/NFT';
import AnchorApp from '../preter/app';
import Creation from '../preter/creation';

function Detail(props) {

  let dom='';
  const name=props.anchor;
  const owner=props.owner;
  const block=parseInt(props.block);
  const raw=props.raw;
  const protocol=props.protocol;

  switch (props.protocol.type) {
    case 'data':
      dom=(<Data anchor={name} raw={raw} owner={owner} block={block} protocol={protocol}/>);
    break;

    case 'NFT':
      dom=(<NFT anchor={name} raw={raw} owner={owner} block={block} protocol={protocol}/>);
    break;

    case 'creation': 
      dom=(<Creation anchor={name} raw={raw} owner={owner} block={block} protocol={protocol}/>);
    break;

    case 'app':
      dom=(<AnchorApp anchor={name} raw={raw} owner={owner} block={block} protocol={protocol}/>);
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