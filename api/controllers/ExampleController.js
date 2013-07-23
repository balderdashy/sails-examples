/*---------------------
	:: Example 
	-> controller
---------------------*/
var ExampleController = {

	jQuery: function(req, res) {
		res.view();
	},

	backbone: function(req, res) {
		res.view();
	},

	angular: function(req, res) {
		res.view();
	},

	ember: function(req, res) {
		res.view();
	},

	knockout: function(req, res){
		res.view();
	}
};
module.exports = ExampleController;