
import { Row, Col,Button,Container } from 'react-bootstrap';

//import { useState } from 'react';

function Buy(props) {
  const self={
    buyAnchor:()=>{
      props.buy(props.anchor);
    },
  };
  
  return (
    <Container>
    <Row className = "pt-2" >
      <Col lg = { 7 } xs = { 7 } className = "pt-2" >
        <Row>
          <Col lg = { 12 } xs = { 12 }  > <h2>{props.anchor}</h2></Col>
          <Col lg = { 12 } xs = { 12 } >Anchor is avalid.</Col>
        </Row>
      </Col>
      <Col lg = { 5 } xs = { 5 } className="text-end  pt-4">
        <Button className="nextButton" onClick = { ()=>{self.buyAnchor()} } >Buy</Button>
      </Col>
    </Row>
    </Container>
  );
}
export default Buy;