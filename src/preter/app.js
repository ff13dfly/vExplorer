import { useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

import tools from '../lib/tools.js';
import RPC from '../lib/rpc.js';
import Loader from '../lib/loader.js';

function AnchorApp(props) {
    //let [show, setShow] = useState({"display":"block"});

    const self = {
        loadJS: (code) => {
            const scp = document.createElement('script');
            scp.type = 'text/javascript';
            scp.crossOrigin = 'anonymous';
            scp.text = code;
            if (document.head.append) {
                document.head.append(scp);
            } else {
                document.getElementsByTagName('head')[0].appendChild(scp);
            }
            return true;
        },
        loadCSS: (code) => {
            //console.log(code);
            var head = document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            var cmap = document.createTextNode(code);
            style.appendChild(cmap);
            head.appendChild(style);
            return true;
        },
        autoLoad: (code) => {
            if (code.js) self.loadJS(code.js);
            if (code.css) self.loadCSS(code.css);

            setTimeout(()=>{
                const cApp = new Function("agent", "con", "error", props.raw);
                if (!cApp) return false;
                cApp(RPC, 'app_container', code.failed ? code.failed : null);
            },500);
        },
        autoUI:(ck)=>{
            props.UI.autoHide("Search","out",true);
            props.UI.autoHide("Nav","out",true);
            self.showFun();
            ck && ck();
        },
        history:()=>{
            console.log("History list");
        },
        exitApp:(ck)=>{
            //console.log("Exit cApp");
            props.UI.autoShow("Search","out");
            props.UI.autoShow("Nav","out");
            self.hideFuns();
            ck && ck();
        },
        showFun:()=>{
            var el=document.getElementById('exit_con');
            el.style.display="block";
        },
        hideFuns:()=>{
            var el=document.getElementById('exit_con');
            el.style.display="none";
        },
    };

    useEffect(() => {
        self.autoUI(()=>{
            if (RPC.start.gateway === true && RPC.extra.lib) {
                RPC.extra.lib(props.anchor, (code) => {
                    self.autoLoad(code);
                });
            } else {
                if (props.protocol && props.protocol.lib) {
                    Loader(
                        props.protocol.lib,
                        { viewer: RPC.common.view, search: RPC.common.search },
                        (code) => {
                            self.autoLoad(code);
                        }
                    );
                } else {
                    self.autoLoad({ failed: null });
                }
            }
        });
    });

    const owner = tools.shortenAddress(props.owner, 8);
    const cmap={
        color: "red",
        backgroud:"#EEFFFF",
        position:"fixed",
        right:"20px",
        top:"6px",
        border:"1px solid #BBBBBB",
        borderRadius:"16px",
        textAlign:"center",
        width:"72px",
        height:"32px",
        lineHeight:"32px",
        zIndex:999,
    };
    const amap={
        height:((window.outerHeight-40)+'px'),
        width:(window.outerWidth+'px'),
        overFlow:"hidden",
        margin:"0 auto",
    };
    const fmap={
        height:"40px",
        wordWrap: "break-word",
        paddingRight:"14px",
    };

    return (
        <Row>
            <div style={cmap} id="exit_con">
                <span onClick={() => {self.history()}}>H</span> | 
                <span onClick={() => {self.exitApp()}}> C</span>
            </div>
            <Col lg={12} xs={12} id="app_container" style={amap}></Col>
            <Col lg={12} xs={12} style={fmap}>
                <p className='text-end'> cApp on {props.block} , owner : {owner}</p>
            </Col>
        </Row>
    );
}

export default AnchorApp;