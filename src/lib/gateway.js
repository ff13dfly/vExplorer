import $ from 'jquery';		//JSONP的实现

const self = {
	request:function(){
        $.ajax();
    },
};

const Gateway={
	search:function(anchor,ck){},
	view:function(anchor,ck){},
	write:function(anchor,data,ck){},
	history:function(anchor,ck){},
    sell:function(){},
    buy:function(){},
}
export default Gateway;