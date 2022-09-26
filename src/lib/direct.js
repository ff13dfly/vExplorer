let wsAPI = null;
let account='';
let unlistening=null;	//listening的回调；

const self = {
    setAccount:function(acc){
        account=acc;
    },
	setWebsocket: (ws) => {
		wsAPI=ws;
	},
	search: (anchor, ck) => {
		anchor=anchor.toLocaleLowerCase();
		if(wsAPI===null) return ck && ck(false);
		let unsub=null;
		let unlist=null;

		wsAPI.query.anchor.anchorOwner(anchor, (res) => {
			if (res.isEmpty) {
				ck && ck({ owner: 0, blocknumber: 0, anchor: anchor });
			} else {
				const data = res.toHuman();
				const owner = data[0];
				const block = res.value[1].words[0];
				let result = { owner: owner, blocknumber: block, anchor: anchor };
				wsAPI.query.anchor.sellList(anchor, (dt) => {
					unlist();
					if (dt.value.isEmpty) return ck && ck(result);
					const cost = dt.value[1].words[0];
					result.cost = cost;
					ck && ck(result);
				}).then((uu)=>{
					unlist=uu;
				});
			}
			unsub();
		}).then((un)=>{
			unsub=un;
		});
	},
	view:(block, anchor, owner, ck) => {
		anchor=anchor.toLocaleLowerCase();
		if(wsAPI===null) return ck && ck(false);
		wsAPI.rpc.chain.getBlockHash(block, (res) => {
			const hash = res.toHex();
			if (!hash) return ck && ck(false);
			let result = { owner: owner, blocknumber: block, name: anchor,raw:{} };
			wsAPI.rpc.chain.getBlock(hash).then((dt) => {                      
				if (dt.block.extrinsics.length === 1) return ck && ck(false);
				const exs = self.filter(dt,'setAnchor');
				let raw=null;
				for (let i = 0; i < exs.length; i++) {
					const data = exs[i].args;
					if(data.key.toLocaleLowerCase()!== anchor) continue;
					if(data.protocol) data.protocol=JSON.parse(data.protocol);
					if(data.protocol.type === "data" && data.protocol.format === "JSON") data.raw=JSON.parse(data.raw);
					//hex2str
					
					result.raw=data;
				}
				ck && ck(result);
			});
		});
	},
	filter: (exs, method) => {
		let arr = [];
        exs.block.extrinsics.forEach((ex, index) => {
            const dt=ex.toHuman();
			//console.log(dt);
            if (index !== 0 && dt.method.method === method){
				const res=dt.method;
				res.owner=dt.signer.Id;
                arr.push(dt.method);
            }
        });
        return arr;
	},
	history:(anchor,ck,limit)=>{
		anchor=anchor.toLocaleLowerCase();
        let unsub=null;
        wsAPI.query.anchor.anchorOwner(anchor, (res) => {
            if (res.isEmpty) return ck && ck(false);
            const block = res.value[1].words[0];

            self.loop(anchor,block,limit,function(list){
                ck && ck(list);
                unsub();
            });
        }).then(function(un){
            unsub=un;
        });
    },
	loop:(anchor,block,limit,ck,list)=>{
		limit=!limit?0:limit;
        if(!list) list=[];
        wsAPI.rpc.chain.getBlockHash(block,function(res){
            const hash = res.toHex();
            //获取anchor的内容，会出现同一block里保存了多个anchor的情况，需要按名称进行筛选
            wsAPI.rpc.chain.getBlock(hash).then((dt) => {
                if (dt.block.extrinsics.length === 1) return ck && ck(false);
                const exs = self.filter(dt,'setAnchor');
				
                let raw=null;
                for (let i = 0; i < exs.length; i++) {
                    const data = exs[i].args;
                    if(data.key.toLocaleLowerCase()!== anchor)
                    if(data.protocol) data.protocol=JSON.parse(data.protocol);
					if(data.protocol.format==='JSON') data.raw=JSON.parse(data.raw);
                    raw= data;
                }

                wsAPI.query.system.events.at(hash,function(events){
                    events.forEach(({event}) => {
                        const info=self.decodeEvent(event,preter);
                        //console.log(`${block}:${JSON.stringify(info)}`);
                        if(info===false) return false;

                        info.block=block;
                        if(raw!=null)info.data=raw;

                        list.push(info);

                        if(info.pre===limit || info.pre===0) return ck && ck(list);
                        else return self.loop(anchor,info.pre,limit,ck,list);
                    });
                });
            });
        });
    },
	decodeEvent:(event,preter)=>{
        const method=event.method;
        if(!preter[method]) return false;
        return preter[method](event.data);
    },
    deSet:(data)=>{
        const dt=data.toHuman();
        return {
            owner:dt[0],
            pre:parseInt(dt[1].replace(/,/gi, '')),
            action:'set',
        };
    },
    deSell:(data)=>{
        const dt=data.toHuman();
        return {
            owner:dt[0],
            pre:parseInt(dt[3].replace(/,/gi, '')),
            action:'sell',
            extra:{
                price:dt[1].replace(/,/gi, ''),
                to:dt[2],
            }
        };
    },
	deBuy:(data)=>{
        const dt=data.toHuman();
        return {
            owner:dt[0],
            pre:parseInt(dt[3].replace(/,/gi, '')),
            action:'buy',
            extra:{
                from:dt[1],
                price:dt[2].replace(/,/gi, ''),
            }
        };
    },
    deUnsell:(data)=>{
        const dt=data.toHuman();
        return {
            owner:dt[0],
            pre:parseInt(dt[1].replace(/,/gi, '')),
            action:'unsell',
        }
    },
	write:(pair,anchor,raw,protocol,ck)=>{
		anchor=anchor.toLocaleLowerCase();
		if(wsAPI===null) return ck && ck(false);
		if(typeof protocol !== 'string') protocol=JSON.stringify(protocol);
		if(typeof raw !== 'string') raw=JSON.stringify(raw);
		wsAPI.tx.anchor.setAnchor(anchor, raw, protocol).signAndSend(pair,(res) => {
			ck && ck(res);
		});
	},
	market:(ck)=>{
		if(wsAPI===null) return ck && ck(false);
		wsAPI.query.anchor.sellList.entries().then((arr) => {
			ck && ck(arr);
		});
	},
	sell:(pair,anchor,cost,ck)=>{
		anchor=anchor.toLocaleLowerCase();
		if(wsAPI===null) return ck && ck(false);
		wsAPI.tx.anchor.sellAnchor(anchor, cost).signAndSend(pair, (res) => {
			ck && ck(res);
		});
	},
	buy:(pair,anchor,ck)=>{
		anchor=anchor.toLocaleLowerCase();
		if(wsAPI===null) return ck && ck(false);
		try {
			wsAPI.tx.anchor.buyAnchor(anchor).signAndSend(pair, (result) => {
				ck && ck(result);
			});
		} catch (error) {
			ck && ck(error);
		}
	},
	owner:(anchor,ck)=>{
		anchor=anchor.toLocaleLowerCase();
		if(wsAPI===null) return ck && ck(false);
		wsAPI.query.anchor.anchorOwner.entries().then((arr) => {
			ck && ck(arr);
		});
	},
	balance: (account, ck) => {
		if(wsAPI===null) return ck && ck(false);
		wsAPI.query.system.account(account,(res) => {
			ck && ck(res);
		})
	},
	clean:()=>{
		if(unlistening!=null){
			unlistening();
			unlistening=null;
		}
		return true;
	},
	listening: (ck) => {
		if(wsAPI===null) return ck && ck(false);
		
		if(unlistening!=null){
			unlistening();
			unlistening=null;
		}

		wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
			const lastHash = lastHeader.hash.toHex();
			//console.log(lastHeader);
			//let result = { owner: owner, blocknumber: block, name: anchor,raw:{} };
			wsAPI.rpc.chain.getBlock(lastHash).then((dt) => {

				if (dt.block.extrinsics.length === 1) return ck && ck(false);
				const exs = self.filter(dt,'setAnchor');
				
				const list = [];
				for (let i = 0; i < exs.length; i++) {
					const data = exs[i].args;
					if(data.protocol) data.protocol=JSON.parse(data.protocol);
					if(data.protocol.type === "data" && data.protocol.format === "JSON") data.raw=JSON.parse(data.raw);
					data.block=parseInt(lastHeader.number.toHuman().replace(/,/gi, ''));
					data.account=exs[i].owner;
					data.anchor=data.key;
					delete data.key;
					list.push(data);
				}
				ck && ck(list);
			});
		}).then((un)=>{
			unlistening=un;
		});
	},
};

const  preter={
	"AnchorSet":self.deSet,
	"AnchorToSell":self.deSell,
	"AnchorSold":self.deBuy,
	"AnchorUnSell":self.deUnsell,
};

const Direct={
	set:{
        account:self.setAccount,
        websocket:self.setWebsocket,
    },
	common:{
		balance:self.balance,
		search:self.search,
		view:self.view,
		history:self.history,
		write:self.write,
		sell:self.sell,
		buy:self.buy,
		market:self.market,
		subscribe:self.listening,
		clean:self.clean,
	},
}

export default Direct;