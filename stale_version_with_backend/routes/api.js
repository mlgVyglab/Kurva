const spawn = require('child_process').spawn;

exports.smiles_to_sdf = smiles_to_sdf;
exports.new_compound = new_compound;

function smiles_to_sdf(req, res) {

	//Split the SMILES formulas by comma
	var smiles_to_process = req.body.smiles.replace(/\s/g, '').split(',');
	//TODO refedine the format for testing the input
  	var format = /^[a-zA-Z 0-9\.\-\=\#\$\:\/\\\[\]\(\)\+\@]*$/;

  	var allFormulas = '{ "formulas" : [';

  	//Test each formula and append it to the array
	for (var i = 0; i < smiles_to_process.length; i++) {
		if (!format.test(smiles_to_process[i])) {
		  return res.end(smiles_to_process[i] + " is not a valid SMILES formula.");
		}

		allFormulas = allFormulas + '{ "index": \"' + i + '\" , "smiles": \"' + smiles_to_process[i] + '\"},'

	}

	allFormulas = allFormulas.slice(0, -1) + ']}';

	//Strongify array into a JSON object for the python script input
	// var jsonString= JSON.stringify(allFormulas);
	
	var spawnSync = require('child_process').spawnSync;
	var result = spawnSync('python', [ 'public/smiles_to_sdf.py', allFormulas ], {
	    cwd: process.cwd(),
	    env: process.env,
	    stdio: 'pipe',
	    encoding: 'utf-8'
	});
	var savedOutput = result.stdout;

	// console.log(String(savedOutput));

	res.send(String(savedOutput))

	return
}


function new_compound(req, res) {

	// get SMILES formula
	var smiles_to_process = req.body.compound.replace(/\s/g, '');
	var dataset = req.body.dataset.replace(/\s/g, '');
	// parse SMILES: basic syntax check
  	var format = /^[a-zA-Z 0-9\.\-\=\#\$\:\/\\\[\]\(\)\+\@]*$/;
	var compound = '{ "compound" : ';

  	//There should be only one formula!
	if (!format.test(smiles_to_process)) {
		return res.end(smiles_to_process + " is not a valid SMILES formula.");
	}
	compound = compound + '{ "smiles": \"' + smiles_to_process + '\", "dataset": \"' + dataset + '\" }}' 
	//									     "P-glycoprotein" }}' // aca hardcodee el dataset

	//res.send(String(compound));
	//return

	var spawnSync = require('child_process').spawnSync;
	var result = spawnSync('python', [ 'public/new_compound.py', compound ], {
	    cwd: process.cwd(),
	    env: process.env,
	    stdio: 'pipe',
	    encoding: 'utf-8'
	});
	
	var savedOutput = result.stdout;
	res.send(String(savedOutput))

	return
}
