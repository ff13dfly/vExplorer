import { Container } from 'react-bootstrap';

import Server from '../common/server';

function Setting(props) {

    return (
    	<Container>
			<Server fresh={props.fresh}/>
    	</Container>
    );
}

export default Setting;