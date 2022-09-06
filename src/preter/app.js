import { useEffect } from 'react';
import { Row,Col } from 'react-bootstrap';

import tools from '../lib/tools.js';
import RPC from '../lib/rpc.js';

function AnchorApp(props) {
    const self={
        getLibs:(list,ck,cache)=>{
            console.log(`Start:${JSON.stringify(list)}`);
            if(!cache) cache={};
            const row=list.shift();
            const anchor=(Array.isArray(row)?row[0]:row).toLocaleLowerCase();
            const block=Array.isArray(row)?row[1]:0;

            if(cache[anchor]) return self.getLibs(list,ck,cache);


            //2.get target anchor
            self.getAnchor(anchor,block,(an,res)=>{
                cache[an]=!res?{error:'no such anchor'}:res;
                if(res.protocol && res.protocol.ext){
                    for(let i=res.protocol.ext.length;i>0;i--) list.unshift(res.protocol.ext[i-1]);
                }

                if(res.protocol && res.protocol.lib){
                    for(let i=0;i<res.protocol.lib.length;i++) list.unshift(res.protocol.lib[i]);
                }

                if(list.length===0) return ck && ck(cache);
                self.getLibs(list,ck,cache);
            });
        },
        getAnchor:(anchor,block,ck)=>{
            //console.log(anchor);
            if(!anchor) return ck && ck(anchor,'');
            const search=RPC.common.search;
            const viewer=RPC.common.view;
            search(anchor, (res)=>{
                if(!res || (!res.owner)) return ck && ck(anchor,'');
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
                const failed={};
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
                ck && ck(failed);
            });
        },
    }

    useEffect(() => {
        //console.log(props.raw);
        const cApp=new Function("agent", "con", "error", props.raw);
        if(!cApp) return false;

        if(props.protocol && props.protocol.lib){
            self.loadLib(props.protocol.lib,(failed)=>{
                cApp(RPC,'#app_container',failed);
            });
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