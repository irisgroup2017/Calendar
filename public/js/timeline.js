var downArrow = document.getElementById("btn1");
var upArrow = document.getElementById("btn2");

downArrow.onclick = function () {
    'use strict';
    document.getElementById("first-list").style = "top:-620px";
    document.getElementById("second-list").style = "top:-620px";
    downArrow.style = "display:none";
    upArrow.style = "display:block";
};

upArrow.onclick = function () {
    'use strict';
    document.getElementById("first-list").style = "top:0";
    document.getElementById("second-list").style = "top:80px";
    upArrow.style = "display:none";
    downArrow.style = "display:block";
};

//example

/*
<div class="box">
            <ul id="first-list">
                <li>
                    <span></span>
                    <div class="title">comment #01</div>
                    <div class="info">the best animation , the best toturials you would ever see .</div>
                    <div class="name">- dr. mohamed -</div>
                    <div class="time">
                        <span>JUN, 17<sup>th</sup></span>
                        <span>12:00 AM</span>
                    </div>
                </li>
                <li>
                    <span></span>
                    <div class="title">summery #01</div>
                    <div class="info">the best animation , the best toturials you would ever see here only . you can learn how to animate and how to use SVG . even else you can add your own animations .</div>
                    <div class="name">- eng. amr -</div>
                    <div class="time">
                        <span>JUN, 29<sup>th</sup></span>
                        <span>11:36 AM</span>
                    </div>
                </li>
                <li>
                    <span></span>
                    <div class="title">comment #02</div>
                    <div class="info">the best animation , the best toturials you would ever see . what about canvas ?? do you like it ..</div>
                    <div class="name">- dr. ahmed -</div>
                    <div class="time">
                        <span>FEB, 2<sup>nd</sup></span>
                        <span>02:00 PM</span>
                    </div>
                </li>
                
                <div class="arrow" id="btn1">
            
            <ul id="second-list">
                <li>
                    <span></span>
                    <div class="title">comment #03</div>
                    <div class="info">the best animation , the best toturials you would ever see .</div>
                    <div class="name">- mohamed -</div>
                    <div class="time">
                        <span>MAR, 21<sup>st</sup></span>
                        <span>03:49 PM</span>
                    </div>
                </li>
                <li>
                    <span></span>
                    <div class="title">summery #02</div>
                    <div class="info">the best animation , the best toturials you would ever see here only . you can learn how to animate and how to use SVG . even else you can add your own animations .</div>
                    <div class="name">- mohamed -</div>
                    <div class="time">
                        <span>MAY, 13<sup>rd</sup></span>
                        <span>09:23 AM</span>
                    </div>
                </li>
                <li>
                    <span></span>
                    <div class="title">comment #04</div>
                    <div class="info">the best animation , the best toturials you would ever see . what about canvas ?? do you like it ..</div>
                    <div class="name">- mohamed -</div>
                    <div class="time">
                        <span>OCT, 15<sup>th</sup></span>
                        <span>08:30 PM</span>
                    </div>
                </li>
                
                <div class="arrow" id="btn2">
            
        </div>
*/