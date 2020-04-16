//Prepare data as json and sent it to server through /api/smiles_to_sdf route
$(document).ready(function () {
  $('#smiles_form').on('submit', function(e) {
      
      e.preventDefault();
	console.log('entre: alignment');

      //Wait for the respons of the POST call
      $(this).ajaxSubmit({
          error: function(xhr) {
            alert('Error alignment: ' + xhr.status);
          },
          success: function(response) {
	    console.log(response);
	    console.log('tengo response: alignment');

            //The /api/smiles_to_sdf route should return a JSON with SDF records
            console.log('Parsed json alignment:');
            var obj = JSON.parse(response);
            console.log(obj)

          }
      });
  });
});

//Prepare data as json and sent it to server through /api/new_compound route
$(document).ready(function () {
  $('#new_compound_form').on('submit', function(e) {
      
      e.preventDefault();
	console.log('entre: new compound');

      //Wait for the respons of the POST call
      $(this).ajaxSubmit({
          error: function(xhr) {
            alert('Error new compound: ' + xhr.status);
          },
          success: function(response) {
	    console.log(response);
	    console.log('tengo response: new compound');

            //The /api/smiles_to_sdf route should return a JSON with SDF records
            console.log('Parsed json new compound:');
            var obj = JSON.parse(response);
            console.log(obj)

          }
      });
  });
});
