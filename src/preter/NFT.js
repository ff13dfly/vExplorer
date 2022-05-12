//import { useState } from 'react';
import { Row,Form } from 'react-bootstrap';

function NFT(props) {
	const shorten=props.tools.shortenAddress;
    const toStr=props.tools.hex2str;

	const bs64=btoa(toStr(props.raw));
	const img='data:image/'+props.protocol.format+';base64,'+bs64;

    return ( 
		<Row className="pt-4">
			<Form>
			  <Form.Group className="mb-3">
			    <Form.Label>Data anchor on {props.block} , ownered by {shorten(props.owner)}</Form.Label>
			    <img src={img} alt="" width="100%"/>
			  </Form.Group>
			</Form>
		</Row>
    );
}

export default NFT;