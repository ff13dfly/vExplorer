import { useEffect } from 'react';
import { Row,Col } from 'react-bootstrap';

import tools from '../lib/tools.js';
import RPC from '../lib/rpc.js';
import Loader from '../lib/loader.js';

function AnchorApp(props) {
    const self={
        loadJS:(code)=>{
            const scp = document.createElement('script');
            scp.type = 'text/javascript';
            scp.crossOrigin = 'anonymous';
            scp.text=code;
            if (document.head.append) {
                document.head.append(scp);
            } else {
                document.getElementsByTagName('head')[0].appendChild(scp);
            }
        },
        loadCSS:(code)=>{

        },
    }

    useEffect(() => {
        //console.log(props.raw);
        const cApp=new Function("agent", "con", "error", props.raw);
        if(!cApp) return false;

        if(props.protocol && props.protocol.lib){
            Loader(
                props.protocol.lib,
                {viewer:RPC.common.view,search:RPC.common.search},
                (code)=>{
                    //console.log(code);
                    self.loadJS(code.js);
                    cApp(RPC,'#app_container',code.failed);
                }
            );
        }else{
            cApp(RPC,'#app_container',{});
        }
    });

    const cls={
        "wordWrap": "break-word",
    }

    const shorten=tools.shortenAddress;
    const owner=shorten(props.owner,10);

    return ( 
        <Row className = "pt-2" >
            <Col lg = { 12 } xs = { 12 } id="app_container">Anchor application will render here...</Col>
            <Col lg = { 12 } xs = { 12 }><p style={cls}>cApp Owner : {owner}</p></Col>
        </Row>
    );
}

export default AnchorApp;