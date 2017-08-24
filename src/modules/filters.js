'use strict';

(function () {
    var app = angular.module('app.filters', [])

        .filter("ajaxMethod", ['CONFIG', function (CONFIG) {
            return function () {
                var method = CONFIG.test ? 'GET' : 'POST';
                return method;
            };
        }])

        .filter("fenToYuan", function () {
            return function (fen) {
                var s = fen + '';
                if (s.length == 1) {
                    s = '00' + s;
                }
                else if (s.length == 2) {
                    s = '0' + s;
                }
                var s1 = s.slice(0, -2);
                var s2 = s.slice(-2);
                return s1 + '.' + s2;
            };
        })

        .filter("subtitlePercentComplete", function () {
            return function (subtitlePercentComplete) {
                if (subtitlePercentComplete) {
                    if (subtitlePercentComplete == '失败') {
                        return subtitlePercentComplete;
                    }
                    else {
                        return subtitlePercentComplete + '%';
                    }
                }
                else {
                    return '无'
                }
            }
        })

        .filter("fileSize", function () {
            return function (input) {
                if(input >= 1073741824){
                    return parseFloat(input/1073741824 ).toFixed(2)+ 'GB'
                }else if(input >= 1048576){
                    return parseFloat(input/1048576 ).toFixed(2)+ 'MB'
                }else if(input >= 1024){
                    return parseFloat(input/1024).toFixed(2) +'KB'
                }else if(input >= 0){
                    return parseFloat(input).toFixed(2) + 'B'
                }
            };
        })

        //time
        .filter("videoTime", function () {
            return function (input) {
                var hour = '00',
                    minute = '00',
                    sec = '00';
                var format = function (item) {
                    if(item<10 && item !== '00'){
                        item = '0' + item;

                    }
                    return item;
                }
                if(input >= 3600){
                    hour = Math.floor(input/3600);
                    minute = Math.floor((input%3600)/60);
                    sec = input%3600%60;
                }else if(input >= 60){
                    minute = Math.floor(input/60);
                    sec = input%60;
                }else if(input >= 0) {
                    if(input){
                        sec = input
                    }
                }
                hour = format(hour);
                minute = format(minute);
                sec = format(sec);
                return hour+':'+minute+':'+sec;
            };
        })

})();