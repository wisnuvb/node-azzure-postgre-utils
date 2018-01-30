const db = require('./db.js');
var azure = require('azure-storage');
const config = require('./config');

function testUpload() {
	// set parameter input for azure credentials
	const azure_account = config.STORAGE_ACCOUNT;
	const azure_storage_access_key = config.STORAGE_KEY;
	const azure_container = config.CONTAINER;
	var bs = azure.createBlobService(azure_account, azure_storage_access_key);

	db.any('SELECT company_id, logo FROM tenant_company ORDER BY company_id DESC')
		.then(function(data, done) {
			// loop through all rows
			// Promise.map is also an option here to control how many concurrent connections we want
			// see http://bluebirdjs.com/docs/api/promise.map.html
			data.forEach((row) => {
		   	// row.logo is a buffer containing byte array
				// convert buffer to stream
				// upload to azure storage using createBlockBlobFromStream
				// save resulting url to logo_url

				const buf_logo = Buffer.from(row.logo);
				streamLogo = buf_logo.toString('base64');
				
				bs.createAppendBlobFromText(azure_container, row.company_id+".png", streamLogo, function(error, result, response) {
					if(!error){
				  	var urlHasil = bs.getUrl(azure_container, row.company_id+".png", azure_storage_access_key);
				  	db.none('UPDATE tenant_company SET logo_url=$1 WHERE company_id=$2', [urlHasil, row.company_id])
					  	.then(function () {
					      console.log("company_id ("+row.company_id+") = sudah diproses ke "+urlHasil);
					      if (numCompletedCalls == data.length){
					      	console.log("Done all calls!");
					      	return;
					      }
					    })
					    .catch(function (err) {
					      return (err);
					    });
				  }
				});

			})
		});
}

// call main function
testUpload();