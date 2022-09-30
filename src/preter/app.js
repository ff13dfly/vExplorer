import { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';

import RPC from '../lib/rpc.js';
import Loader from '../lib/loader.js';

const hash=function(n) { return Math.random().toString(36).substr(n != undefined ? n : 6) };

function AnchorApp(props) {
    const pre='app_';
    const config={
        "dialog":pre+hash(),
        "app":pre+hash(),
        "exit":pre+hash(),
        "nav":pre+hash(),
        "foot":pre+hash(),
    };
    let dialog=false;

    const self = {
        history:()=>{
            if(!dialog){
                self.showDialog();
                const load=`<div class="col-12 gy-2 text-center">
                    <h2>Loading cApp history...</h2>
                </div>`;
                document.getElementById(config.dialog).innerHTML=load;
                const anchor=props.anchor;
                RPC.common.history(anchor,(list)=>{
                    self.decodeHistory(list);
                });
            }else{
                self.hideDialog();
            }
        },
        decodeHistory:(list)=>{
            let txt='';
            for(let i=0;i<list.length;i++){
                const row=list[i];
                const proto=JSON.parse(row.data.protocol);
                txt+=`<div class="col-12">cApp size : ${row.data.raw.length} , version ${proto.ver} , on block : ${row.block}</div>`;
            }

            const dom= `<div class="row">${txt}</div>`;
            document.getElementById(config.dialog).innerHTML=dom;
        },
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
                let raw='';
                if(props.raw.substr(0, 2).toLowerCase()==='0x'){
                    raw=decodeURIComponent(props.raw.slice(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
                }else{
                    raw=props.raw;
                }
                const cApp = new Function("agent", "con", "error", raw);
                if (!cApp) return false;
                cApp(RPC, config.app, code.failed ? code.failed : null);
            },0);
        },
        autoUI:(ck)=>{
            props.UI.autoHide("Search","out",true);
            props.UI.autoHide("Nav","out",true);
            self.showFun();
            ck && ck();
        },
        exitApp:(ck)=>{
            //console.log("Exit cApp");
            props.UI.autoShow("Search","out");
            props.UI.autoShow("Nav","out");
            self.hideDialog();
            self.hideFuns();
            self.cleanApp();
            ck && ck();
        },
        cleanApp:()=>{
            document.getElementById(config.app).innerHTML="";
            //document.getElementById('footer_con').innerHTML='';     
        },
        showDialog:()=>{
            dialog=true;
            document.getElementById(config.dialog).style.display="block";
        },
        hideDialog:()=>{
            dialog=false;
            document.getElementById(config.dialog).style.display="none";
        },
        showFun:()=>{
            document.getElementById(config.exit).style.display="block";
            document.getElementById(config.nav).style.display="block";
            document.getElementById(config.foot).style.display="block";
        },
        hideFuns:()=>{
            document.getElementById(config.exit).style.display="none";
            document.getElementById(config.nav).style.display="none";
            document.getElementById(config.foot).style.display="none";
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
    };

    const mmap={
        height:((window.outerHeight-40)+'px'),
        width:(window.outerWidth+'px'),
        display:"none",
        position:"fixed",
        left:"0px",
        top:"40px",
        overFlow:"hidden",
        margin:"0 auto",
        background:"#BBFAFA",
        zIndex:1999,
    };

    return (
        <Row>
            <div style={cmap} id={config.exit}>
                <span onClick={() => {self.history()}}>H</span> | 
                <span onClick={() => {self.exitApp()}}> C</span>
            </div>
            <div style={hmap} id={config.nav}></div>
            <Col lg={12} xs={12} id={config.app} style={amap}>
            </Col>
            <Col lg={12} xs={12} id={config.dialog} style={mmap}></Col>
            <Col lg={12} xs={12} style={fmap} id={config.foot}>
                <p> cApp on {props.block} , owner :<br />{props.owner}</p>
            </Col>
        </Row>
    );
}

export default AnchorApp;