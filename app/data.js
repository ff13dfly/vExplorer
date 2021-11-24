(function() {
    var self = {
        show: function(proto, raw, block, owner) {
            //console.log(raw);
            //console.log(proto)
            var dom = `<hr><p>Data anchor on block ${block} owned by ${owner}</p>`;
            dom += `<div class="row gy-2">
			<div class="col-md-12 col-lg-12 col-xs-12"><textarea disabled="disabled" cols="3" style="width:100%">${raw}</textarea></div>
			</div>
		</div>`;

            return { dom: dom, auto: self.auto };
        },
        auto: function(linker) {
            //console.log('ready to go');
        },
    };

    window.vex = self;
})();