//Prepare data as json and sent it to server through /api/smiles_to_sdf route
$(document).ready(function () {
  $('#smiles_form').on('submit', function(e) {
      
      e.preventDefault();

      //Wait for the respons of the POST call
      $(this).ajaxSubmit({
          error: function(xhr) {
            alert('Error: ' + xhr.status);
          },
          success: function(response) {

            //The /api/smiles_to_sdf route should return a JSON with SDF records
            console.log('Parsed json:');
            var obj = JSON.parse(response);
            console.log(obj)

          }
      });
  });
});