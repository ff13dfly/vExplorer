
import { Container,Row,Col } from 'react-bootstrap';

function Error(props){
  return (
  	<Container>
	  	<Row>
	    <Col lg = { 12 }xs = { 12 } className = "pt-2">{props.data}</Col>
	  	</Row>
  	</Container>
  );
}

export default Error;