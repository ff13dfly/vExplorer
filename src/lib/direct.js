let wsAPI = null;
let account = '';
let unlistening = null;	//listening的回调；

//export data format
const format = { owner: null, block: 0, name: null,cost:0,target:null, data: {}, empty: true };

const self = {
	setAccount: function (acc) {
		account = acc;
	},
	setWebsocket: (ws) => {
		wsAPI = ws;
	},
	
	latest: (anchor, ck) => {
		anchor = anchor.toLocaleLowerCase();
		let unsub=null;
		wsAPI.query.anchor.anchorOwner(anchor, (res) =>{
			const result = { owner: null, block: 0, name: null,cost:0,target:null, data: {}, empty: true };
			if (res.isEmpty){
				//console.log(`[function Latest]: ${anchor} empty`);
				return ck && ck(result);
			} 
			const owner = res.value[0].toHuman();
			const block = res.value[1].words[0];
			unsub();
			self.target(anchor,block,ck,owner);
		}).then((un) => {
			unsub = un;
		});
	},
	view: (anchor,block,owner,ck)=>{
		self.target(anchor,block,ck,owner);
	},
	target:(anchor,block,ck,owner)=>{
		//console.log(`[function Target]: ${anchor} on ${block}, owner:${owner}`);
		anchor = anchor.toLocaleLowerCase();
		if (anchor.substr(0, 2).toLowerCase() === '0x') {
			anchor = self.decodeUTF8(anchor);
		}
		const result = { owner: owner, block:block, name: anchor,cost:0,target:null,data: {}, empty: true };
		if(owner===null || owner===undefined){
			return wsAPI.query.anchor.anchorOwner(anchor, (res) =>{
				if (res.isEmpty) return ck && ck(result);
				const own=res.value[0].toHuman();
				self.target(anchor,block,ck,own);
			});
		}
		
		let unlist = null;
		wsAPI.rpc.chain.getBlockHash(result.block, (res) => {
			const hash = res.toHex();
			if (!hash) return ck && ck(result);
			wsAPI.rpc.chain.getBlock(hash).then((dt) => {
				if (dt.block.extrinsics.length === 1) return ck && ck(result);
				const exs = self.filter(dt, 'setAnchor');
				for (let i = 0; i < exs.length; i++) {
					const data = exs[i].args;
					if (data.key.substr(0, 2).toLowerCase() === '0x') {
						if (self.decodeUTF8(data.key) !== anchor) continue;
					} else {
						if (data.key.toLocaleLowerCase() !== anchor) continue;
					}

					if (data.raw.substr(0, 2).toLowerCase() === '0x') {
						data.raw = self.decodeUTF8(data.raw);
					}

					if (data.protocol) data.protocol = JSON.parse(data.protocol);
					if (data.protocol.type === "data" && data.protocol.format === "JSON") data.raw = JSON.parse(data.raw);

					result.data = data;
				}
				result.empty = false;

				wsAPI.query.anchor.sellList(anchor, (dt) => {
					unlist();
					if (dt.value.isEmpty) return ck && ck(result);
					result.cost = dt.value[1].words[0];		//selling cost
					result.target=dt.value[2].words[0];		//selling target 
					return ck && ck(result);
				}).then((uu) => {
					unlist = uu;
				});
			});
		});
	},
	filter: (exs, method) => {
		let arr = [];
		exs.block.extrinsics.forEach((ex, index) => {
			const dt = ex.toHuman();
			//console.log(dt);
			if (index !== 0 && dt.method.method === method) {
				const res = dt.method;
				res.owner = dt.signer.Id;
				arr.push(dt.method);
			}
		});
		return arr;
	},
	multi: (list, ck) => {
		let len = list.length;
		let count = 0;
		let map={};
		for (let i = 0; i < list.length; i++) {
			const row = list[i];
			//console.log('Before calling:'+count);
			if (typeof (row) == 'string') {
				//console.log(`Get latest anchor of ${row}`);
				self.latest(row,(data)=>{
					const kk=row;
					map[kk]=data;
					count++;
					//console.log('Latest call:'+count);
					if(count===len) return ck && ck(self.groupMulti(list,map));
				});
			} else {
				//console.log(`Get target anchor of ${row[0]} on ${row[1]}`);
				self.target(row[0],row[1],(data)=>{
					//console.log(JSON.stringify(data));
					const kk=row[0]+'_'+row[1];
					map[kk]=data;
					count++;
					//console.log('Target call:'+count);
					if(count===len) return ck && ck(self.groupMulti(list,map));
				});
			}
		}
	},
	groupMulti:(list,map)=>{
		//console.log(JSON.stringify(map));
		const arr=[];
		for (let i = 0; i < list.length; i++) {
			const row = list[i];
			const kk=(typeof (row) == 'string')?row:(row[0]+'_'+row[1]);
			arr.push(map[kk]);
		}
		
		return arr;
	},
	history: (anchor, ck, limit) => {
		anchor = anchor.toLocaleLowerCase();
		let unsub = null;
		wsAPI.query.anchor.anchorOwner(anchor, (res) => {
			if (res.isEmpty) return ck && ck(false);
			const block = res.value[1].words[0];

			self.loop(anchor, block, limit, function (list) {
				ck && ck(list);
				unsub();
			});
		}).then(function (un) {
			unsub = un;
		});
	},
	loop: (anchor, block, limit, ck, list) => {
		limit = !limit ? 0 : limit;
		if (!list) list = [];
		wsAPI.rpc.chain.getBlockHash(block, function (res) {
			const hash = res.toHex();
			//获取anchor的内容，会出现同一block里保存了多个anchor的情况，需要按名称进行筛选
			wsAPI.rpc.chain.getBlock(hash).then((dt) => {
				if (dt.block.extrinsics.length === 1) return ck && ck(false);
				const exs = self.filter(dt, 'setAnchor');

				let raw = null;
				for (let i = 0; i < exs.length; i++) {
					const data = exs[i].args;
					if (data.key.toLocaleLowerCase() !== anchor)
						if (data.protocol) data.protocol = JSON.parse(data.protocol);

					if (data.raw.substr(0, 2).toLowerCase() === '0x') {
						data.raw = self.decodeUTF8(data.raw);
					}

					if (data.protocol.format === 'JSON') data.raw = JSON.parse(data.raw);
					raw = data;
				}

				wsAPI.query.system.events.at(hash, function (events) {
					events.forEach(({ event }) => {
						const info = self.decodeEvent(event, preter);
						//console.log(`${block}:${JSON.stringify(info)}`);
						if (info === false) return false;

						info.block = block;
						if (raw != null) info.data = raw;

						list.push(info);

						if (info.pre === limit || info.pre === 0) return ck && ck(list);
						else return self.loop(anchor, info.pre, limit, ck, list);
					});
				});
			});
		});
	},
	decodeEvent: (event, preter) => {
		const method = event.method;
		if (!preter[method]) return false;
		return preter[method](event.data);
	},
	deSet: (data) => {
		const dt = data.toHuman();
		return {
			owner: dt[0],
			pre: parseInt(dt[1].replace(/,/gi, '')),
			action: 'set',
		};
	},
	deSell: (data) => {
		const dt = data.toHuman();
		return {
			owner: dt[0],
			pre: parseInt(dt[3].replace(/,/gi, '')),
			action: 'sell',
			extra: {
				price: dt[1].replace(/,/gi, ''),
				to: dt[2],
			}
		};
	},
	deBuy: (data) => {
		const dt = data.toHuman();
		return {
			owner: dt[0],
			pre: parseInt(dt[3].replace(/,/gi, '')),
			action: 'buy',
			extra: {
				from: dt[1],
				price: dt[2].replace(/,/gi, ''),
			}
		};
	},
	deUnsell: (data) => {
		const dt = data.toHuman();
		return {
			owner: dt[0],
			pre: parseInt(dt[1].replace(/,/gi, '')),
			action: 'unsell',
		}
	},
	decodeUTF8:(str) => {
		return decodeURIComponent(str.slice(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
	},
	write: (pair, anchor, raw, protocol, ck) => {
		if (wsAPI === null) return ck && ck(false);
		if (typeof protocol !== 'string') protocol = JSON.stringify(protocol);
		if (typeof raw !== 'string') raw = JSON.stringify(raw);
		return wsAPI.tx.anchor.setAnchor(anchor, raw, protocol).signAndSend(pair, (res) => {
			ck && ck(res);
		})
	},
	market: (ck) => {
		if (wsAPI === null) return ck && ck(false);
		wsAPI.query.anchor.sellList.entries().then((arr) => {
			ck && ck(arr);
		});
	},
	sell: (pair, anchor, cost, ck) => {
		anchor = anchor.toLocaleLowerCase();
		if (wsAPI === null) return ck && ck(false);
		wsAPI.tx.anchor.sellAnchor(anchor, cost).signAndSend(pair, (res) => {
			ck && ck(res);
		});
	},
	unsell:(pair, anchor, ck) => {
		anchor = anchor.toLocaleLowerCase();
		if (wsAPI === null) return ck && ck(false);
		wsAPI.tx.anchor.unsellAnchor(anchor).signAndSend(pair, (res) => {
			ck && ck(res);
		});
	},
	buy: (pair, anchor, ck) => {
		anchor = anchor.toLocaleLowerCase();
		if (wsAPI === null) return ck && ck(false);
		try {
			wsAPI.tx.anchor.buyAnchor(anchor).signAndSend(pair, (result) => {
				ck && ck(result);
			});
		} catch (error) {
			ck && ck(error);
		}
	},
	owner: (anchor, ck) => {
		anchor = anchor.toLocaleLowerCase();
		if (wsAPI === null) return ck && ck(false);
		wsAPI.query.anchor.anchorOwner.entries().then((arr) => {
			ck && ck(arr);
		});
	},
	balance: (account, ck) => {
		if (wsAPI === null) return ck && ck(false);
		wsAPI.query.system.account(account, (res) => {
			ck && ck(res);
		})
	},
	clean: () => {
		if (unlistening != null) {
			unlistening();
			unlistening = null;
		}
		return true;
	},
	listening: (ck) => {
		if (wsAPI === null) return ck && ck(false);

		if (unlistening != null) {
			unlistening();
			unlistening = null;
		}

		wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
			const lastHash = lastHeader.hash.toHex();
			wsAPI.rpc.chain.getBlock(lastHash).then((dt) => {
				if (dt.block.extrinsics.length === 1) return ck && ck(false);
				const exs = self.filter(dt, 'setAnchor');
				const list = [];
				for (let i = 0; i < exs.length; i++) {
					const result = { owner: null, block:0, name:null,cost:0,target:null,data: {}, empty: true };
					const data = exs[i].args;
					if (data.protocol) data.protocol = JSON.parse(data.protocol);

					if (data.raw.substr(0, 2).toLowerCase() === '0x') {
						data.raw = self.decodeUTF8(data.raw);
					}

					if (data.key.substr(0, 2).toLowerCase() === '0x') {
						data.key = self.decodeUTF8(data.key);
					}

					if (data.protocol.type === "data" && data.protocol.format === "JSON") data.raw = JSON.parse(data.raw);
					result.block = parseInt(lastHeader.number.toHuman().replace(/,/gi, ''));
					result.owner = exs[i].owner;
					result.name = data.key;
					result.data= data;
					list.push(result);
				}
				ck && ck(list);
			});
		}).then((un) => {
			unlistening = un;
		});
	},
};

const preter = {
	"AnchorSet": self.deSet,
	"AnchorToSell": self.deSell,
	"AnchorSold": self.deBuy,
	"AnchorUnSell": self.deUnsell,
};

const Direct = {
	set: {
		account: self.setAccount,
		websocket: self.setWebsocket,
	},
	common: {
		balance: self.balance,
		search: self.latest,
		view: self.view,
		multi: self.multi,
		target:self.target,
		history: self.history,
		write: self.write,
		sell: self.sell,
		unsell:self.unsell,
		buy: self.buy,
		market: self.market,
		subscribe: self.listening,
		clean: self.clean,
	},
}

export default Direct;