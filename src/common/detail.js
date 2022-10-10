
import { Row, Col } from 'react-bootstrap';

import Data from '../preter/data';
import NFT from '../preter/NFT';
import AnchorApp from '../preter/app';
import Creation from '../preter/creation';
import History from './history';

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
      dom=(<AnchorApp anchor={name} raw={raw} owner={owner} block={block} protocol={protocol} UI={props.UI}/>);
    break;
            
    default:
      dom='Unexpect anchor ['+name+'] data : '+JSON.stringify(props.raw);
    break;
  }
  //<Container>
  //</Container>
  return (
      <Row>
        <Col lg = { 12 } xs = { 12 }>{dom}</Col>
        <Col lg = { 12 } xs = { 12 }>
          <History anchor={name} protocol={protocol}/>
        </Col>
      </Row>
  );
}
export default Detail;