$(".button-collapse").sideNav();
$("#profile-list").dropdown();
$("#profile-list-mobile").dropdown();
$('.tooltipped').tooltip({delay: 50});
$('select').material_select();

$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 50 // Creates a dropdown of 15 years to control year
});

//slider
$(document).ready(function(){
    // initializing slider in controller because if it's been initialized here, there can be case that slider images won't appear.
    // The slider will initialise first and then the data will be returned from http get.
});
