/*jslint browser: true*/
/*global $, window, document, classie, MLMenu */

// Function - check width
var $window = $(window), $responsiveMenuContent = $('#responsiveMenuContent');
var checkWidth = function () {
    'use strict';
    var windowSize = $window.width();
    if (windowSize < 1248) {
        $responsiveMenuContent.removeClass('col-md-9').addClass('col-md-12');
    } else {
        $responsiveMenuContent.removeClass('col-md-12').addClass('col-md-9');
    }
};

// Function Call
checkWidth();
$(window).resize(checkWidth);

var menuEl = document.getElementById('ml-menu'),
    mlmenu = new MLMenu(menuEl, {
        breadcrumbsCtrl : true, // show breadcrumbs
        initialBreadcrumb : 'dashboard', // initial breadcrumb text
        backCtrl : true,//, // show back button
        itemsDelayInterval : 10, // delay between each menu item sliding animation
        onItemClick: function () {
            closeMenu();
        }
        //onItemClick: loadDummyData // callback: item that doesn´t have a submenu gets clicked - onItemClick([event], [inner HTML of the clicked item])
    });

// mobile menu toggle
var openMenuCtrl = document.querySelector('.action--open'),
    closeMenuCtrl = document.querySelector('.action--close');

function openMenu() {
    'use strict';
    classie.add(menuEl, 'menu--open');
    closeMenuCtrl.focus();
}

function closeMenu() {
    'use strict';
    classie.remove(menuEl, 'menu--open');
    openMenuCtrl.focus();
}

openMenuCtrl.addEventListener('click', openMenu);
closeMenuCtrl.addEventListener('click', closeMenu);

// simulate grid content loading
//var gridWrapper = document.querySelector('.content');

//function loadDummyData(ev) {
//    'use strict';
//    ev.preventDefault();
//
//    closeMenu();
//    gridWrapper.innerHTML = '';
//    classie.add(gridWrapper, 'content--loading');
//    $.setTimeout(function () {
//        classie.remove(gridWrapper, 'content--loading');
//        gridWrapper.innerHTML = '<ul class="products">' + dummyData[itemName] + '<ul>';
//    }, 700);
//}