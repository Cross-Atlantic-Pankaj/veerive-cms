$( document ).ready(function() {

    console.log( "PayNXT360 Insight" );

    $( ".closeSearchBox" ).click(function() {
      $( "#searchBox" ).slideUp( "slow", function() {
        // Animation complete.
      });
    });

    $( ".searchIcon" ).click(function() {
      $( "#searchBox" ).slideDown( "slow", function() {
        // Animation complete.
      });
    });

    const swiper = new Swiper('.mainNewsWrapper', {
      // Optional parameters
      slidesPerView: 1,
      loop: true,

      // If we need pagination
      pagination: {
        el: '.mainNewsWrapper-pagination',
        clickable: true
      },

      // Navigation arrows
      navigation: {
        nextEl: '.mainNewsWrapper-next',
        prevEl: '.mainNewsWrapper-prev',
      },
    });

});