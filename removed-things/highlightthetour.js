/* it was used for showing which tour is edited. But now we are not redirecting the user to the tourlist page after tour save or edit
 * In case, in future some requirements changes, we can use such type of functionality
*/
vm.tourReallyEdited = $window.localStorage.getItem('successfullyEditedId');
vm.highlightEditedTour = function (tourIndex) {
    if (vm.products[tourIndex]._id == vm.tourReallyEdited) {
        $window.localStorage.setItem('successfullyEditedId', 'Null');
        vm.tourReallyEdited = $window.localStorage.getItem('successfullyEditedId')
        var scrollTo = 0;
        var otherElementHeights = 63 + 55 + 20;
        for (var index = 0; index < tourIndex; index++)
            scrollTo = scrollTo + document.getElementById('tourListItem'+index).offsetHeight;
        $('#tourListItem'+tourIndex).css('opacity', '0');
        console.log(scrollTo);
        $('html, body').scrollTop(scrollTo + otherElementHeights);
        var opacityCounter = 0.1;
        var intervalCounter = 0;
        var interval = $interval(function() {
            $('#tourListItem'+tourIndex).css('opacity', opacityCounter);
            opacityCounter = opacityCounter + 0.1;
            intervalCounter = intervalCounter + 1;
            if(intervalCounter == 10) {
                $('#tourListItem'+tourIndex).css('opacity', '');
                $interval.cancel(interval);
            }
        }, 300);
    } else
        return;
}
/* The above function will be called from html  like this*/
<div style="display: none" ng-if="vm.tourReallyEdited != 'Null'">{{vm.highlightEditedTour($index)}}</div>