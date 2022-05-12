
import { Container,Button } from 'react-bootstrap';


function Onsell(props) {
  const self={

  };
  
  return (
    <Container>
      <Button className="nextButton" onClick = { props.buyTarget} >Buy it ( cost {props.cost})</Button>
    </Container>
  );
}
export default Onsell;