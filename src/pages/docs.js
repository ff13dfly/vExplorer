import { Container,Row,Col } from 'react-bootstrap';

function Docs(props) {
	localStorage.setItem('hello','world');
	const store=localStorage.getItem('hello');

    return (
    <Container>	
	    <Row  className = "pt-2">
	      <Col lg = { 6 } xs = { 12 }> hello  world docs page. {store}</Col>
	    </Row>
	</Container>
    );
}

export default Docs;