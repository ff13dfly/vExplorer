// const keys = {
//     jsonFile: 'js_file_name',
//     anchorList: 'anchor_list',
//     startNode: 'start_node',
//     historyNode: 'history_node',
// };

const map={};

const STORAGE={
	setMap:(obj) => {
		for(var k in obj){
			map[k]=obj[k];
		}
		return true;
	},
	removeKey:(name) => {
		if(!map[name]) return false;
		const key=map[name];
		localStorage.removeItem(key);
		return true;
	},

	//key-value
	getKey:(name) => {
		if(!map[name]) return false;
		const key = map[name];
		const str = localStorage.getItem(key);
		if(str === null) return false;
		return JSON.parse(str);
	},
	setKey:(name,val) => {
		if(!map[name]) return false;
		const key=map[name];
		//const str=?;
		localStorage.setItem(key,val);
	},

	//key-queue
	getQueue:(name)=>{
		if(!map[name]) return [];
		const key=map[name];
		const str=localStorage.getItem(key);
		if(str===null) return [];
		return JSON.parse(str);
	},
	footQueue:(name,atom)=>{
		if(!map[name]) return [];
		const key=map[name];
		const qu=STORAGE.getQueue(name);
		qu.push(atom);
		localStorage.setItem(key,JSON.stringify(qu));
		return true;
	},
	headQueue:(name,atom)=>{
		if(!map[name]) return [];
		const key=map[name];
		const qu=STORAGE.getQueue(name);
		qu.unshift(atom);
		localStorage.setItem(key,JSON.stringify(qu));
		return true;
	},
};

export default STORAGE;