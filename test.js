//var module = require('module')

// doit commencer par test

exports.testSomething = function(test){
	test.expect(1);
	test.ok(false,'this should fail');
	test.done();
}


//@TODO exemple à travailler avec function add qui est dans module
exports.testSomething = function(test){
	test.expect(10);
	test.ok(false,'this should fail');
	test.done();
}