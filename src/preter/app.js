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
            self.cleanApp();
            ck && ck();
        },
        cleanApp:()=>{
            document.getElementById('app_container').innerHTML="";
            //document.getElementById('footer_con').innerHTML='';     
        },
        showFun:()=>{
            document.getElementById('exit_con').style.display="block";
            document.getElementById('nav_con').style.display="block";
            document.getElementById('footer_con').style.display="block";
        },
        hideFuns:()=>{
            document.getElementById('exit_con').style.display="none";
            document.getElementById('nav_con').style.display="none";
            document.getElementById('footer_con').style.display="none";
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

    //float operation button container
    const cmap={
        color: "red",
        background:"#FFFFFF",
        position:"fixed",
        right:"20px",
        top:"6px",
        border:"1px solid #DDDDDD",
        borderRadius:"16px",
        textAlign:"center",
        width:"72px",
        height:"32px",
        lineHeight:"32px",
        zIndex:999,
    };

    // app container css map
    const amap={
        height:((window.outerHeight-40)+'px'),
        width:(window.outerWidth+'px'),
        overFlow:"hidden",
        margin:"0 auto",
    };

    //footer css map
    const fmap={
        height:"42px",
        position:"fixed",
        fontSize:"12px",
        left:"0px",
        background:"#FAFAFA",
        top:((window.outerHeight-42)+'px'),
        wordWrap: "break-word",
        paddingRight:"30px",
        paddingTop:"3px",
        zIndex:999,
    };

    //default header css
    const hmap={
        width:"100%",
        height:"45px",
        background:"#EEEEEE",
        position:"fixed",
        top:"0px",
        left:"0px",
    }

    return (
        <Row>
            <div style={cmap} id="exit_con">
                <span onClick={() => {self.history()}}>H</span> | 
                <span onClick={() => {self.exitApp()}}> C</span>
            </div>
            <div style={hmap} id="nav_con"></div>
            <Col lg={12} xs={12} id="app_container" style={amap}>
            </Col>
            <Col lg={12} xs={12} style={fmap} id="footer_con">
                <p> cApp on {props.block} , owner :<br />{props.owner}</p>
            </Col>
        </Row>
    );
}

export default AnchorApp;