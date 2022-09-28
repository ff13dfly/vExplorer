const tools = {
	shortenAddress: (address, n) => {
		if (n === undefined) n = 10;
		return address.substr(0, n) + '...' + address.substr(address.length - n, n);
	},
	hex2str: (hex) => {
		//can not solve utf8
		if (!hex) return false;
		var trimedStr = hex.trim();
		var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
		var len = rawStr.length;
		if (len % 2 !== 0) { alert("Illegal Format ASCII Code!"); return ""; }
		var curCharCode;
		var resultStr = [];
		for (var i = 0; i < len; i = i + 2) {
			curCharCode = parseInt(rawStr.substr(i, 2), 16);
			resultStr.push(String.fromCharCode(curCharCode));
		}
		return resultStr.join("");
	},
	hex2UTF8:(hex)=>{
		return decodeURIComponent(hex.slice(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
	},
	hex2ab: (hex) => {
		const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
			return parseInt(h, 16)
		}));
		return typedArray.buffer;
	},
	u8toString: (arr) => {
		let str = '0x';
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] < 16) str += '0';
			str += arr[i].toString(16);
		}
		return str;
	},
	strToU8:(str)=>{
		const code = encodeURIComponent(str);
		const bytes = [];
		for (var i = 0; i < code.length; i++) {
			const c = code.charAt(i);
			if (c === '%') {
				const hex = code.charAt(i + 1) + code.charAt(i + 2);
				const hexVal = parseInt(hex, 16);
				bytes.push(hexVal);
				i += 2;
			} else bytes.push(c.charCodeAt(0));
		}
		//console.log(bytes);
		return bytes;
	},
	encodeUTF8:(str) => {
		return str;
	},
	decodeUTF8:(str) => {
		return decodeURIComponent(str.slice(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
	},
};

export default tools;