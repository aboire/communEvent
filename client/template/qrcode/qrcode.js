 Template.qrcode.rendered = function(){
	this.$('#qrcode').qrcode({
    "text": Router.current().params._id,
     render: 'image',
     size:100,
        ecLevel: 'H',
        fill: "#E33551",
        background: "#fafafa",
        radius: 0.2,
});
this.$('#qrcode image').remove();
};

 Template.qrcode.destroyed = function(){

	this.$('#qrcode image').remove();
};
