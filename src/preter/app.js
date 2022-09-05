import { useEffect } from 'react';
import { Row,Col } from 'react-bootstrap';

import tools from '../lib/tools.js';
import RPC from '../lib/rpc.js';

function AnchorApp(props) {
    const failed={};
    const loaded={};

    const self={
        getLibs:(list,ck)=>{
            const len=list.length;
            const cache={};
            for(let i=0;i<len;i++){
                if(Array.isArray(list[i])){
                    cache[list[i][0]]='';
                }else{
                    cache[list[i]]='';
                }
            }
            
            let count=0;
            for(let i=0;i<len;i++){
                const row=list[i];
                if(Array.isArray(row)){
                    self.getAnchor(row[0],row[1],(an,res)=>{
                        if(!res) failed[row[0]]={error:'no such anchor'};
                        cache[an]=res;
                        count++;
                        if(count==len) ck && ck(cache);
                    });
                }else{
                    self.getAnchor(row,0,(an,res)=>{
                        if(!res) failed[row]={error:'no such anchor'};

                        cache[an]=res;
                        count++;
                        if(count==len) ck && ck(cache);
                    });
                }
            }
        },
        getAnchor:(anchor,block,ck)=>{
            //console.log(anchor);
            if(!anchor) return ck && ck(anchor,'');
            const search=RPC.common.search;
            const viewer=RPC.common.view;
            search(anchor, (res)=>{
                if(!res || (!res.owner)) return ck && ck(anchor,'');
                //console.log(res);
                viewer(block===0?res.blocknumber:block,anchor,res.owner,(rs)=>{
                    ck && ck(anchor,rs.raw);
                });
            });
        },
        loadLib:(list,ck)=>{
            const scp = document.createElement('script');
            scp.type = 'text/javascript';
            scp.crossOrigin = 'anonymous';
            let txt='';
            self.getLibs(list,(dt)=>{
                console.log(dt);
                const len=list.length;
                for(let i=0;i<len;i++){
                    const row=list[i];
                    if(Array.isArray(row)){
                        txt+=!dt[row[0]]?'':dt[row[0]];
                    }else{
                        txt+=!dt[row]?'':dt[row];
                    }
                }

                scp.text=txt;
                if (document.head.append) {
                    document.head.append(scp);
                } else {
                    document.getElementsByTagName('head')[0].appendChild(scp);
                }
                ck && ck();
            });
        },
    }

    useEffect(() => {
        //console.log(props.raw);
        const cApp=new Function("agent", "con", "error", props.raw);
        if(!cApp) return false;

        if(props.protocol && props.protocol.lib){
            self.loadLib(props.protocol.lib,()=>{
                console.log(failed);
                cApp(RPC,'#app_container',failed);
            });
        }else{
            cApp(RPC,'#app_container',failed);
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