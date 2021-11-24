(function() {
    var self = {
        show: function(proto, raw, block, owner) {
            //console.log(raw);
            //console.log(proto)
            var dom = `<hr><p>NFT anchor on block ${block} owned by ${owner}</p>`;
            dom += `<div class="row gy-2">
			<div class="col-md-12 col-lg-12 col-xs-12">
                <img src="data:image/${proto.format};base64,${btoa(raw)}">
            </div>
            <div class="col-md-12 col-lg-12 col-xs-12">
                <p>This is an authorized image, please do not use it for commercial purposes.</p>
            </div>
			</div>
		</div>`;

            return { dom: dom, auto: self.auto };
        },
        auto: function(linker) {

        },
    };

    window.vex = self;
})();