import { useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

import tools from '../lib/tools.js';
import RPC from '../lib/rpc.js';
import Loader from '../lib/loader.js';

function AnchorApp(props) {
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

            const cApp = new Function("agent", "con", "error", props.raw);
            if (!cApp) return false;
            cApp(RPC, 'app_container', code.failed ? code.failed : null);
            return true;
        },
        requestFullscreen: (id) => {
            const docElm = document.getElementById(id);
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen()
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen()
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen()
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen()
            }
        },
        exitFullScreen: () => {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen()
            }
        },
    };

    useEffect(() => {
        //console.log(RPC)
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

    const cls = {
        "wordWrap": "break-word",
    }

    const shorten = tools.shortenAddress;
    const owner = shorten(props.owner, 10);

    return (
        <Row className="pt-2" >
            <Col lg={6} xs={6}>
                <Button size="sm" variant="primary" onClick={() => {self.exitFullScreen();}}>Exit</Button>
            </Col>
            <Col lg={6} xs={6} className="text-end">
                <Button size="sm" variant="primary" onClick={() => {self.requestFullscreen("app_container");}}>Fullscreen</Button>
            </Col>
            <Col lg={12} xs={12} id="app_container">Anchor application will render here...</Col>
            <Col lg={12} xs={12}><p style={cls}>cApp Owner : {owner}</p></Col>
        </Row>
    );
}

export default AnchorApp;