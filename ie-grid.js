/* fake modern grid on IE9,10,11 */
(function(){
    function calccardsize(e) {
        var card, cards, i, ss = document.styleSheets[0],
            domrect = document.querySelector(".agrid").getBoundingClientRect(),
            windowwidth = domrect.width,
            cols = Math.floor(windowwidth/320),
            extra = (windowwidth-(cols*320)-((cols)*14))/cols,
            cardwidth = Math.floor(320+extra);
        cards = document.querySelectorAll(".agrid>.card");
        for (i=0; card = cards[i]; i++)
        card.style.width = cardwidth+"px";//card.style.flex = "0 0 "+cardwidth+"px";
    }
    var ss = document.styleSheets[0];
    //ss.insertRule(".agrid {display: flex; flex-wrap: wrap;}", 0);
    ss.insertRule(".agrid {display: block; }", 0);
    //ss.insertRule(".card {margin: 6px; min-width: 320px}", 0);
    ss.insertRule(".card {display: inline-block; margin: 6px 4px}", 0);
    window.addEventListener("resize", calccardsize, false);
})();
