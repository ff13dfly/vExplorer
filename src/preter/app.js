import { useEffect } from 'react';
import { Row,Col } from 'react-bootstrap';
import $ from 'jquery';

function AnchorApp(props) {
    //console.log(props)
    let anchorApp;
    useEffect(() => {
        //const str=';anchorApp=function(pok,con,$){console.log("Anchor Application is ready."+con);$(con).html("<p>Ready to go</p>")};';
        const str=props.tools.hex2str(props.raw);
        //console.log(str);
        eval(str);
        anchorApp(props.agent,'#app_container',$);
    });

    const cls={
        "wordWrap": "break-word",
    }

    return ( 
        <Row className = "pt-2" >
            <Col lg = { 12 } xs = { 12 } id="app_container">Anchor application will render here...</Col>
            <Col lg = { 12 } xs = { 12 }><p style={cls}>App Owner:{props.owner}</p></Col>
        < /Row>
    );
}

export default AnchorApp;