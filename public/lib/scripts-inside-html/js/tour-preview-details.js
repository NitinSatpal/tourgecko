
//read more for home page
$(function readmore() {
$('.read-more-content').addClass('hide')

.before('<a class="read-more-show" href="#">Read More</a>')  
.append(' <a class="read-more-hide" href="#">Read Less</a>');

$('.read-more-show').on('click', function(e) {
  $(this).next('.read-more-content').removeClass('hide');
  $(this).addClass('hide');
  e.preventDefault();
});

$('.read-more-hide').on('click', function(e) {
  $(this).parent('.read-more-content').addClass('hide').parent().children('.read-more-show').removeClass('hide');
  e.preventDefault();
});

});    
//***********////***********////***********////***********////***********////***********////***********////***********//


/* //RHS
$(function fixed-rhs() {
$('.target').pushpin({
      top: 400,
        offset: 400,
    });
  });

$('.right-bar').each(function() {
    var $this = $(this);
    var $target = $('#' + $(this).attr('data-target'));
    $this.pushpin({
      top: $target.offset().top,
      bottom: $target.offset().top + $target.outerHeight() - $this.height()
    });
});*/

//***********////***********////***********////***********////***********////***********////***********////***********//


//display coupon
$(function revealCoupon() {
 $("#display-coupon").click(function() {  
         $("#apply-coupon").css('display', 'block');
 });
});
//***********////***********////***********////***********////***********////***********////***********////***********//


//buttons styles
$(function () {
var el = document.getElementsByClassName("buttonPrevious");
el.classList.add("btn");    
});
//***********////***********////***********////***********////***********////***********////***********////***********//


//auto complete
$(function () {
$('input.autocomplete').autocomplete({
    data: {
        "Jan 01": 01,
        "Feb 02": 02,
        "Mar 03": 03,
        "Apr 04": 04,
        "May 05": 05,
        "Jun 06": 06,
        "Jul 07": 07,
        "Aug 08": 08,
        "Sep 09": 09,
        "Oct 10": 10,
        "Nov 11": 11,
        "Dec 12": 12,
    }
  });
});    
//***********////***********////***********////***********////***********////***********////***********////***********//


//disable wheel in numeric input field
$(function () {
$(':input[type=number]').on('mousewheel', function(e){
    e.preventDefault();
});
});
//***********////***********////***********////***********////***********////***********////***********////***********//
