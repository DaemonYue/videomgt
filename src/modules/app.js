'use strict';

(function () {
    var app = angular.module('openvod', [
        'ui.router',
        'pascalprecht.translate',
        'app.controllers',
        'app.filters',
        'app.directives',
        'app.services',
        'angular-md5',
        'ngCookies',
        'ngTable'
    ])
    
    .config(['$translateProvider', function ($translateProvider) {
        var lang = navigator.language.indexOf('zh') > -1 ? 'zh-CN' : 'en-US';
        $translateProvider.preferredLanguage(lang);
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });
    }])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'pages/login.html'
            })
            .state('app', {
                url: '/app',
                templateUrl: 'pages/app.html'
            })
            //多媒体库
            .state('app.video', {
                url: '/video',
                templateUrl: 'pages/video.html'
            })
            .state('app.video.transcodingList', {
                url: '/transcodingList',
                templateUrl: 'pages/transcodingList.html'
            })
            .state('app.video.notEditedList', {
                url: '/notEditedList',
                templateUrl: 'pages/notEditedList.html'
            })
            .state('app.video.editedList', {
                url: '/editedList',
                templateUrl: 'pages/editedList.html'
            })
            .state('app.video.musicLibrary', {
                url: '/musicLibrary',
                templateUrl: 'pages/musicLibrary.html'
            })
            //用户管理
            .state('app.user', {
                url: '/user',
                templateUrl: 'pages/userManagement.html'
            })
            //插播管理
            .state('app.innerCut', {
                url: '/innerCut',
                templateUrl: 'pages/innerCut.html'
            })

    }])


    .constant('CONFIG', {
        serverUrl: 'http://192.168.17.88/backend_movie/v1/',
        uploadImgUrl: 'http://192.168.17.88/upload',
        uploadVideoUrl: 'http://192.168.17.88/videoupload',
        testUrl: 'test/',
        test: false
    })

})();
