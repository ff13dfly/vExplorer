import $ from 'jquery';     //使用其中的JSONP，后面考虑替代

let account='';
let endpoint='';
let spam='';  

let dServers={};
let oServers={};

const self = {
    setEndpoint:(uri)=>{
        endpoint=uri;
    },
    setAccount:(acc)=>{
        account=acc;
    },
    basic: function(ck) {
        const rpc = {
            "method":"system_access",
            "params":{
                "spam":spam,
            }
        };
        self.request(rpc,ck);
    },
    spam:(ck)=>{
        const rpc = {
            "method":"spam",
            "params":{"app":"vExplorer"}
        };
        self.request(rpc,function(res){
            //console.log(`Spam method: ${JSON.stringify(res)}`);
            if(!res.spam) return ck && ck(false);
            spam=res.spam;
            ck && ck();
        });
    },
    pass:(params,ck)=>{
        const json={
            "id":"",
            "method":"call",
            "params":params,
        };
        self.request(json,ck);
    },
    order:(params,index,ck)=>{
        //1.从
    },


    view:(anchor,ck)=>{
        const params={
            fun:"view",
            service:"vHistory",
            anchor:anchor,
            spam:spam,
        };
        self.pass(params,(res)=>{
            //console.log(res);
            if(!res || !res.data) return ck && ck(false);
            const an={
                anchor:anchor,
                block:res.data.block,
                owner:res.data.owner,
                raw:{
                    key:res.data.key,
                    protocol:res.data.protocol,
                    raw:res.data.raw,
                }
            }
            ck && ck(an);
        });
        
    },
    target:(block, anchor, owner,ck)=>{
        const params={
            fun:"target",
            service:"vHistory",
            anchor:anchor,
            block:block,
            spam:spam,
        };
        self.pass(params,(res)=>{
            ck && ck(res.data);
        });
    },
    free:(anchor,raw,ck)=>{
        const params={
            fun:"free",
            service:"vFree",
            anchor:anchor,
            raw:raw,
            protocol:JSON.stringify({type:"data",format:"JSON"}),
            spam:spam,
        };
        self.pass(params,(res)=>{
            ck && ck(res);
        });
    },
    history:(anchor,ck,cfg)=>{
        const params={
            fun:"history",
            service:"vHistory",
            anchor:anchor,
            spam:spam,
        };
        //console.log(cfg);
        if(cfg!==undefined){
            const ss=cfg.step===undefined?10:parseInt(cfg.step);
            const pp=cfg.page===undefined?1:parseInt(cfg.page);
            params.step=ss;
            params.page=pp;
        }else{
            params.step=20;
            params.page=1;
        }    
        self.pass(params,(res)=>{
            ck && ck(res.data);
        });
    }, 
    request:(json,ck)=>{
        //console.log(`Request:${JSON.stringify(json)}`);
        //if(json.method==='system_basic' && !!spam) return console.log('Ok');
        if(!account) return ck && ck(false);
        if(!spam && json.method!=='spam'){
            return self.spam(()=>{
                json.params.spam=spam;      //把spam填充到请求里;
                return self.request(json,ck);
            });
        }

        json.jsonrpc="2.0";
        if(!json.id) json.id=account;       //默认设置一个值
        self.jsonp(endpoint, json, function(res) {
            //console.log(`RPC data:${JSON.stringify(res)}`);
            if(!res.result){
                if(res.code && res.code===44){
                    spam='';
                    return self.request(json,ck);
                }else{
                    ck && ck(res);
                }
            }else{
                ck && ck(res.result);
            }
        });
    },
    jsonp:(server,data,ck)=>{
        var uri=server+'?';
        if(data.id) uri += `id=${data.id}&`;
        if(data.method) uri += `method=${data.method}&`;
        for(var k in data.params) uri += `${k}=${data.params[k]}&`;
        uri+='callback=?';
        console.log(uri);
        $.getJSON({type:'get',url:uri,async:false,success:function(res){
            if(!res.result || !res.result.success){
                console.log('server failed,messsage:'+res.error.message);
            } 
            ck && ck(res);
        }});
    },
    init:(ck)=>{
        dServers={};
        oServers={};
        //console.log('ready to get avalid methods, endpoint:'+endpoint);
        self.basic((res)=>{
            const list=res.list;
            for(var k in list){
                const row=list[k];
                for(var kk in row){
                    const p=row[kk];
                    //console.log(p);
                    if(p.type==='direct'){
                        if(dServers===null || !dServers[k]) dServers[k]={active:[],funs:{}};
                        dServers[k].active.push(kk);
                        for(var fun in p.fn){
                            dServers[k].funs[fun]=p.fn[fun];
                        }
                    }

                    if(p.type==='order'){

                    }                 
                }
            }
            Gateway.vservice.pass=dServers;
            Gateway.vservice.order=oServers;
            //console.log(dServers);
            //console.log(oServers);
        });
        ck && ck();
    },
};

const Gateway={
    set:{
        init:self.init,
        account:self.setAccount,
        endpoint:self.setEndpoint,
        spam:self.spam,
    },
    common:{
        search:self.view,
        view:self.target,
        history:self.history,
    },
    vservice:{
        pass:{},
        order:{},
    },
    extra:{
        free:self.free,
    },
};

export default Gateway;