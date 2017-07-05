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
                url: '/app?appId',
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
            .state('app.user.add', {
                url: '/add',
                templateUrl: 'pages/userAdd.html'
            })
            .state('app.user.list', {
                url: '/list',
                templateUrl: 'pages/userList.html'
            })
            .state('app.user.section', {
                url: '/section',
                templateUrl: 'pages/section.html'
            })
            .state('app.user.version', {
                url: '/version',
                templateUrl: 'pages/version.html'
            })
            //插播管理
            .state('app.innerCut', {
                url: '/innerCut',
                templateUrl: 'pages/innerCut.html'
            })
            .state('app.innerCut.plan', {
                url: '/plan',
                templateUrl: 'pages/innerCutPlan.html'
            })
            .state('app.innerCut.search', {
                url: '/search',
                templateUrl: 'pages/innerCutSearch.html'
            })
            //终端管理
            .state('app.terminal', {
                url: '/terminal',
                templateUrl: 'pages/terminal.html'
            })
            //医嘱提醒
            .state('app.doctorAdvice', {
                url: '/doctorAdvice',
                templateUrl: 'pages/doctorAdvice.html'
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
