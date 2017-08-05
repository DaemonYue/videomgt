'use strict';

(function () {
    var app = angular.module('app.controllers', [])

        .controller('indexController', ['$scope',
            function ($scope) {
                var self = this;
                self.init = function () {
                    this.maskUrl = '';
                    console.log('index');

                    //上传层
                    self.showUpload = false;
                    self.uploadMaskUrl = 'pages/videoUpload.html';
                    self.maskParams = {};
                };

                //显示上传页面
                self.showUploadHideMask = function (bool) {
                    self.showUpload = bool
                };

            }
        ])

        .controller('loginController', ['$scope', '$http', '$state', '$filter', 'md5', 'util',
            function ($scope, $http, $state, $filter, md5, util) {
                console.log('loginController')
                var self = this;
                self.init = function () {
                    console.log(md5.createHash('dddd'));

                }

                self.login = function () {
                    self.loading = true;

                    var data = JSON.stringify({
                        username: self.userName,
                        password: md5.createHash(self.password)
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('logon', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            util.setParams('token', msg.token);
                            util.setParams('account', self.userName);
                            self.getEditLangs();
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }
                //
                self.getEditLangs = function () {
                    $http({
                        method: 'GET',
                        url: util.getApiUrl('', 'editLangs.json', 'local')
                    }).then(function successCallback(response) {
                        util.setParams('editLangs', response.data.editLangs);
                        $state.go('app');
                    }, function errorCallback(response) {

                    });
                }

            }
        ])

        .controller('appController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    /*if (util.getParams("projectDes")) {
                     this.projectDes = util.getParams("projectDes")
                     } else {
                     alert("访问超时，请重新登录")
                     $state.go('login')
                     }*/
                    //获取用户账号
                    self.account = util.getParams('account');

                     // app 页面展开desktop
                    self.showMaskClass = false;
                    if ($state.current.name !== 'app') {
                        self.appPhase = 2;
                    }
                    // 其他页面收起desktop
                    else {
                        self.appPhase = 1;
                    }
                    self.appFramePhase = 1;

                    // 弹窗层
                    self.maskUrl = '';
                    self.maskParams = {};

                    //初始化ajax的数控
                    self.data = {
                        "token": util.getParams('token'),
                        "user": self.account
                    };

                    util.setObject('ajaxData',self.data);

                    // 读取applists
                    self.loading = true;
                    $http({
                        method: 'GET',
                        url: util.getApiUrl('', 'apps.json', 'local')
                    }).then(function successCallback(data, status, headers, config) {
                        $scope.appList = data.data.apps;
                        // 如果有指定appid focus
                        if ($stateParams.appId) {
                            self.setFocusApp($stateParams.appId);
                        }
                    }, function errorCallback(data, status, headers, config) {

                    }).finally(function (value) {
                        self.loading = false;
                    });
                    // console.log(util.getParams('editLangs'))
                }

                self.feedback = function () {
                    $scope.app.showHideMask(true, 'pages/feedback.html');
                }

                self.setFocusApp = function (id) {
                    var l = $scope.appList;
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].id == id) {
                            self.activeAppName = l[i].name;
                            self.activeAppIcon = l[i].icon_top;
                            self.activeAppBgColor = l[i].bgColor;
                            self.activeAppThemeColor = l[i].themeColor;

                            break;
                        }
                    }
                }

                // 1:酒店客房，2:酒店客房订单 3:移动商城，4:商城订单，5:tv界面, 6:终端管理
                self.switchApp = function (n) {
                    // 收起桌面
                    self.appPhase = 2;

                    // 缩小导航栏
                    self.appFramePhase = 1;
                    self.setFocusApp(n);

                    switch (n) {
                        case 1:
                            if (!$state.includes('app.innerCut')) {
                                $state.go('app.innerCut', {'appId': n});
                            }
                            break;
                        case 2:
                            if (!$state.includes('app.terminal')) {
                                $state.go('app.terminal', {'appId': n});
                            }
                            break;
                        case 3:
                            if (!$state.includes('app.video')) {
                                $state.go('app.video', {'appId': n});
                            }
                            break;
                        case 4:
                            if (!$state.includes('app.doctorAdvice')) {
                                $state.go('app.doctorAdvice', {'appId': n});
                            }
                            break;
                        case 5:
                            if (!$state.includes('app.user')) {
                                $state.go('app.user', {'appId': n});
                            }
                            break;
                        /* case 6:
                         if(!$state.includes('app.version')){
                         $state.go('app.version', {'appId': n});
                         }
                         break;
                         case 7:
                         $state.go('app.wxUser', {'appId': n});
                         break;
                         case 8:
                         if (!$state.includes('app.projectConfig')) {
                         $state.go('app.projectConfig', {'appId': n});
                         }
                         break;
                         case 9:
                         $state.go('app.realTimeCommand', {'appId': n});
                         break;*/
                        default:
                            break;

                    }
                }

                self.showDesktop = function () {
                    self.appPhase = 1;
                    setTimeout(function () {
                        self.appFramePhase = 1;
                    }, 530)
                }

                //app选中样式
                self.focusAppIcon = function (scop, ele) {
                    var url = 'url(' + scop['icon_focus'] + ')';
                    var child = ele.nextElementSibling;
                    child.style.color = 'white';
                    ele.style.backgroundImage = url;
                    ele.style.width = '210px';
                    ele.style.height = '252px';
                    //ele.style.transitionDuration = '.5s';
                }

                //app未选中样式
                self.blurAppIcon = function (scop, ele) {
                    var url = 'url(' + scop['icon'] + ')';
                    var child = ele.nextElementSibling;
                    child.style.color = '#468ed2';
                    ele.style.backgroundImage = url;
                    ele.style.width = '188px';
                    ele.style.height = '219px';
                    // ele.style.transitionDuration = '.5s';
                }

                self.focusLauncher = function () {
                    self.appFramePhase = 2;
                }

                self.focusApp = function () {
                    self.appFramePhase = 1;
                }

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                }

                // 添加 删除 弹窗，增加一个样式的class
                self.showHideMask = function (bool, url) {
                    // bool 为true时，弹窗出现
                    if (bool) {
                        self.maskUrl = url;
                        self.showMaskClass = true;
                    } else {
                        self.maskUrl = '';
                        self.showMaskClass = false;
                    }

                };
                

                //图片上传
                self.uploadLists = function() {
                    this.data = [];
                    this.maxId = 0;
                };

                self.uploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                               // self.movieInfo.PicSize = ret.size;
                                // alert('上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id);
                                xhr.abort();
                            }
                        );
                    }
                };

                //视频上传
                function UploadLists() {
                    this.data = [
                        /*{
                         "id":0,
                         "video":{
                         "name": "星际迷航", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         },
                         "subtitle":{
                         "name": "星际迷航－字幕", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         }
                         }*/
                    ];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (video, subtitle) {
                        this.data.push({"video": video, "subtitle": subtitle, "id": this.maxId});
                        return this.maxId++;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 视频
                                if (l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 字幕
                                if (l[i].subtitle.percentComplete != undefined && l[i].subtitle.percentComplete < 100 && l[i].subtitle.percentComplete != '失败') {
                                    l[i].subtitle.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    judgeCompleted: function (id, o) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果视频和字幕都上传完毕
                                if ((l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete == undefined) ||
                                    (l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete >= 100)) {
                                    o.transcode(id, o);
                                }
                                break;
                            }
                        }
                    },
                    transcode: function (id, o) {
                        var o = o;
                        var id = id;
                        var l = this.data;
                        var source = {};
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                source = l[i];
                                break;
                            }
                        }
                        // 转码
                        var data = JSON.stringify({
                            "action": "submitTranscodeTask",
                            "token": util.getParams('token'),
                            "rescode": "200",
                            "data": {
                                "movie": {
                                    "oriFileName": source.video.name,
                                    "filePath": source.video.src
                                },
                                "subtitle": {
                                    "oriFileName": source.subtitle.name,
                                    "filePath": source.subtitle.src
                                }
                            }
                        })
                        console && console.log(data);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('tanscodetask', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                console && console.log('转码 ' + id);
                                // 从列表中删除
                                o.deleteById(id);
                            }
                            else if (msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            }
                            else {
                                // 转码申请失败后再次调用
                                console && console.log('转码申请失败后再次调用');
                                setTimeout(function () {
                                    o.transcode(id, o);
                                }, 5000);

                            }
                        }, function errorCallback(response) {
                            // 转码申请失败后再次调用
                            console && console.log('转码申请失败后再次调用');
                            console && console.log(response);
                            setTimeout(function () {
                                o.transcode(id, o);
                            }, 5000);
                        });
                    },
                    uploadFile: function (videoFile, subtitleFile, o) {
                        // 上传后台地址
                        var uploadUrl = CONFIG.uploadVideoUrl;

                        // 电影对象
                        var videoXhr = new XMLHttpRequest();
                        var video = {
                            "name": videoFile.name,
                            "size": videoFile.size,
                            "percentComplete": 0,
                            "xhr": videoXhr
                        };

                        // 字幕对象
                        var subtitle = {};
                        if (subtitleFile) {
                            var subtitleXhr = new XMLHttpRequest();
                            subtitle = {
                                "name": subtitleFile.name,
                                "size": subtitleFile.size,
                                "percentComplete": 0,
                                "xhr": subtitleXhr
                            };
                        }

                        // 添加data，并获取id
                        var id = this.add(video, subtitle);

                        // 上传视频
                        util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('video', id, percentComplete);
                                    }
                                });
                            },
                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('video', id, ret.filePath, ret.size);
                                    o.judgeCompleted(id, o);
                                });
                            },
                            // 上传失败
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.setPercentById('video', id, '失败');
                                });
                                xhr.abort();
                            }
                        );

                        // 上传字幕
                        if (subtitle.percentComplete != undefined) {
                            util.uploadFileToUrl(subtitle.xhr, subtitleFile, uploadUrl, 'normal',
                                // 上传中
                                function (evt) {
                                    $scope.$apply(function () {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                            // 更新上传进度
                                            o.setPercentById('subtitle', id, percentComplete);
                                        }
                                    });
                                },
                                // 上传成功
                                function (xhr) {
                                    var ret = JSON.parse(xhr.responseText);
                                    console && console.log(ret);
                                    $scope.$apply(function () {
                                        o.setSrcSizeById('subtitle', id, ret.filePath, ret.size);
                                        o.judgeCompleted(id, o);
                                    });
                                },
                                // 上传失败
                                function (xhr) {
                                    $scope.$apply(function () {
                                        o.setPercentById('subtitle', id, '失败');
                                    });
                                    xhr.abort();
                                }
                            );
                        }
                    }
                }

            }
        ])

        //视频上传
        .controller('videoUploadController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', '$filter', 'md5',
            function ($http, $scope, $state, $stateParams, util, CONFIG, $filter, md5) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    // 初始化上传列表对象
                    self.uploadList = new UploadLists();


                };

                self.cancel = function () {
                    $scope.index.showUploadHideMask(false);
                };

                self.add = function () {
                    //self.uploadList = new UploadLists();
                    var Type = $scope.index.maskParams.type
                    self.uploadList.uploadFile($scope.myFileMovie,  self.uploadList, Type);
                };

                function UploadLists() {
                    this.data = [];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (video) {
                        this.data.push({"video": video, "id": this.maxId});
                        return this.maxId++;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size, picHttpUrl, picUrl) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                this.data[i][type].phu = picHttpUrl;
                                this.data[i][type].pu = picUrl;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 视频
                                if (l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    judgeCompleted: function (id, o, type) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果视频和字幕都上传完毕
                                if (l[i].video.percentComplete >= 100)  {
                                    o.transcode(id, o, type);
                                }
                                break;
                            }
                        }
                    },
                    transcode: function (id, o, type) {
                        var l = this.data;
                        var source = {};
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                source = l[i];
                                break;
                            }
                        }
                        // 转码
                        var data = JSON.stringify({          //加type
                            "action": "submitTranscodeTask",
                            "token": util.getParams('token'),
                            "rescode": "200",
                            "data": {
                                "Type": type,
                                "movie": {
                                    "oriFileName": source.video.name,
                                    "filePath": source.video.src,
                                    "PicURL": source.video.pu,
                                    "PicURL_ABS": source.video.phu
                                }
                            }
                        })
                        console && console.log(data);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('tanscodetask', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                console && console.log('转码 ' + id);
                                // 从列表中删除
                                o.deleteById(id);
                            }
                            else if (msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            }
                            else {
                                // 转码申请失败后再次调用
                                console && console.log('转码申请失败后再次调用');
                                setTimeout(function () {
                                    o.transcode(id, o, type);
                                }, 5000);

                            }
                        }, function errorCallback(response) {
                            // 转码申请失败后再次调用
                            console && console.log('转码申请失败后再次调用');
                            console && console.log(response);
                            setTimeout(function () {
                                o.transcode(id, o, type);
                            }, 5000);
                        });
                    },
                    uploadFile: function (videoFile, o, type) {
                        // 上传后台地址
                        var uploadUrl = CONFIG.uploadVideoUrl;

                        // 电影对象
                        var videoXhr = new XMLHttpRequest();
                        var video = {
                            "name": videoFile.name,
                            "size": videoFile.size,
                            "percentComplete": 0,
                            "xhr": videoXhr
                        };


                        // 添加data，并获取id
                        var id = this.add(video);

                        // 上传视频
                        util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('video', id, percentComplete);
                                    }
                                });
                            },
                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('video', id, ret.filePath, ret.size, ret.thumbnail_http_path, ret.thumbnail_path);
                                    o.judgeCompleted(id, o, type);
                                });
                            },
                            // 上传失败
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.setPercentById('video', id, '失败');
                                });
                                xhr.abort();
                            }
                        );
                    }
                }

            }
        ])

        .controller('videoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {

                    // 上传页面加载页面url
                    self.uploadListUrl = '';

                    // 不显示上传页面
                    self.showUploadList = false;

                    // 显示上传页面
                    self.gotoPage('app.video.transcodingList');

                    // 弹窗层
                    self.maskUrl = '';
                    self.maskParams = {};

                    // 初始化上传列表对象
                    self.uploadList = new UploadLists();

                }

                self.gotoPage = function (pageName) {
                    // 上传列表页
                 /*   if (pageName == 'uploadList') {
                        // 上传页面不是第一次加载
                        if (self.uploadListUrl !== '') {

                        }
                        // 第一次加载上传页面
                        else {
                            self.uploadListUrl = 'pages/uploadList.html';
                        }
                        self.showUploadList = false;
                    }

                    //其他页
                    else {
                        self.showUploadList = false;
                        $state.go(pageName);
                    }
*/                  switch (pageName){
                        case 'app.video.transcodingList':
                            self.current = 1;
                            break;
                        case 'app.video.notEditedList':
                            self.current = 2;
                            break;
                        case 'app.video.editedList':
                            self.current = 3;
                            break;
                        default:
                            break;
                    }
                    self.showUploadList = false;

                    $state.go(pageName);
                };

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                }

                self.upload = function () {
                    self.maskUrl = "pages/addMovie.html";
                    // $scope.app.showHideMask(true, "pages/addMovie.html");
                };

                function UploadLists() {
                    this.data = [
                        /*{
                         "id":0,
                         "video":{
                         "name": "星际迷航", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         },
                         "subtitle":{
                         "name": "星际迷航－字幕", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         }
                         }*/
                    ];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (video, subtitle) {
                        this.data.push({"video": video, "subtitle": subtitle, "id": this.maxId});
                        return this.maxId++;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 视频
                                if (l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 字幕
                                if (l[i].subtitle.percentComplete != undefined && l[i].subtitle.percentComplete < 100 && l[i].subtitle.percentComplete != '失败') {
                                    l[i].subtitle.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    judgeCompleted: function (id, o) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果视频和字幕都上传完毕
                                if ((l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete == undefined) ||
                                    (l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete >= 100)) {
                                    o.transcode(id, o);
                                }
                                break;
                            }
                        }
                    },
                    transcode: function (id, o) {
                        var o = o;
                        var id = id;
                        var l = this.data;
                        var source = {};
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                source = l[i];
                                break;
                            }
                        }
                        // 转码
                        var data = JSON.stringify({          //加type
                            "action": "submitTranscodeTask",
                            "token": util.getParams('token'),
                            "rescode": "200",
                            "data": {
                                "movie": {
                                    "oriFileName": source.video.name,
                                    "filePath": source.video.src
                                },
                                "subtitle": {
                                    "oriFileName": source.subtitle.name,
                                    "filePath": source.subtitle.src
                                }
                            }
                        })
                        console && console.log(data);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('tanscodetask', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                console && console.log('转码 ' + id);
                                // 从列表中删除
                                o.deleteById(id);
                            }
                            else if (msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            }
                            else {
                                // 转码申请失败后再次调用
                                console && console.log('转码申请失败后再次调用');
                                setTimeout(function () {
                                    o.transcode(id, o);
                                }, 5000);

                            }
                        }, function errorCallback(response) {
                            // 转码申请失败后再次调用
                            console && console.log('转码申请失败后再次调用');
                            console && console.log(response);
                            setTimeout(function () {
                                o.transcode(id, o);
                            }, 5000);
                        });
                    },
                    uploadFile: function (videoFile, subtitleFile, o) {
                        // 上传后台地址
                        var uploadUrl = CONFIG.uploadVideoUrl;

                        // 电影对象
                        var videoXhr = new XMLHttpRequest();
                        var video = {
                            "name": videoFile.name,
                            "size": videoFile.size,
                            "percentComplete": 0,
                            "xhr": videoXhr
                        };

                        // 字幕对象
                        var subtitle = {};
                        if (subtitleFile) {
                            var subtitleXhr = new XMLHttpRequest();
                            subtitle = {
                                "name": subtitleFile.name,
                                "size": subtitleFile.size,
                                "percentComplete": 0,
                                "xhr": subtitleXhr
                            };
                        }

                        // 添加data，并获取id
                        var id = this.add(video, subtitle);

                        // 上传视频
                        util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('video', id, percentComplete);
                                    }
                                });
                            },
                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('video', id, ret.filePath, ret.size);
                                    o.judgeCompleted(id, o);
                                });
                            },
                            // 上传失败
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.setPercentById('video', id, '失败');
                                });
                                xhr.abort();
                            }
                        );

                        // 上传字幕
                        if (subtitle.percentComplete != undefined) {
                            util.uploadFileToUrl(subtitle.xhr, subtitleFile, uploadUrl, 'normal',
                                // 上传中
                                function (evt) {
                                    $scope.$apply(function () {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                            // 更新上传进度
                                            o.setPercentById('subtitle', id, percentComplete);
                                        }
                                    });
                                },
                                // 上传成功
                                function (xhr) {
                                    var ret = JSON.parse(xhr.responseText);
                                    console && console.log(ret);
                                    $scope.$apply(function () {
                                        o.setSrcSizeById('subtitle', id, ret.filePath, ret.size);
                                        o.judgeCompleted(id, o);
                                    });
                                },
                                // 上传失败
                                function (xhr) {
                                    $scope.$apply(function () {
                                        o.setPercentById('subtitle', id, '失败');
                                    });
                                    xhr.abort();
                                }
                            );
                        }
                    }
                }

            }
        ])

        //转码
        .controller('transcodingListController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                console.log('transcodingListController');
                var self = this;
                self.init = function () {
                    // 隐藏上传列表
                    $scope.video.showUploadList = false;
                    self.getTranscodeTaskList(1);
                };

                //  获取正在转码的列表
                self.getTranscodeTaskList = function (id) {
                    self.current = id;
                    self.taskList = [];
                    self.noData = false;
                    self.loading = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTranscodeTaskList",
                        "status": "working",
                        "Type": id  //type   1是电影，2是视频
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('tanscodetask', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            if (msg.data.taskList.length == 0) {
                                self.noData = true;
                                return;
                            }
                            self.taskList = msg.data.taskList;
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }

                // 刷新当前state
                self.refresh = function () {
                    self.getTranscodeTaskList(self.current);
                   // $state.reload('app.video.transcodingList');
                };
                
                // 上传视频
                self.upload = function () {
                    $scope.index.showUploadHideMask(true);
                    $scope.index.maskParams = {'type':self.current}
                }
            }
        ])

        //待入库
        .controller('notEditedListController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                console.log('notEditedListController')
                var self = this;
                self.init = function () {
                    // 隐藏上传列表
                    $scope.video.showUploadList = false;
                    self.current = util.getParams('currentVideoType');

                    if(!self.current){
                        self.current = 1
                    }
                    self.getTranscodeTaskList(self.current);
                }

                // 上传视频
                self.upload = function () {
                    $scope.index.showUploadHideMask(true);
                    $scope.index.maskParams = {'type':self.current}

                }

                self.add = function (task) {
                    console.log(task);
                    if(self.current == 1){
                        //$scope.video.maskUrl = "pages/addMovieInfo.html";
                        $scope.app.showHideMask(true, "pages/addMovieInfo.html");
                    }else if(self.current == 2){
                        $scope.app.showHideMask(true, "pages/addVideoInfo.html");
                    }

                    $scope.app.maskParams = task;
                }
                // 获取转码完成的列表
                self.getTranscodeTaskList = function (id) {
                    self.current = id;
                    self.loading = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTranscodeTaskList",
                        "status": "Completed",
                        "Type": id
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('tanscodetask', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            if (msg.data.taskList.length == 0) {
                                self.noData = true;
                            }
                            self.taskList = msg.data.taskList;
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }

                // 删除待入库电影
                self.delMovie = function (id) {
                    var flag = confirm('确定删除？');
                    if (!flag) {
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delTranscodeTask",
                        "lang": "zh-CN",
                        "taskID": id
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('删除成功');
                            self.getTranscodeTaskList(self.current);
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                    });


                }
            }
        ])

        //已入库
        .controller('editedListController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                console.log('editedListController')
                var self = this;
                self.init = function () {

                    self.defaultLang = util.getDefaultLangCode();

                    $scope.arr = {};
                    $scope.arr.catrgoryArr = [];
                    $scope.arr.LocationArr = [];
                    self.getTags();
                    self.getSection();
                    self.getVideoLittelType();
                }

                // 上传视频
                self.upload = function () {
                    $scope.index.showUploadHideMask(true);
                    $scope.index.maskParams = {'type':self.current}

                }

                self.edit = function (movieID) {
                    // $scope.video.maskUrl = "pages/editMovieInfo.html";
                    $scope.app.showHideMask(true, "pages/editMovieInfo.html");

                    $scope.app.maskParams = {movieID: movieID};
                }

                // 获取 电影的 分类 产地
                self.getTags = function () {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTags"
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            if (msg.CategoryList.length == 0) {
                                self.noCategotyData = true;
                            } else {
                                self.categoryList = msg.CategoryList;
                            }
                            if (msg.LocationList.length == 0) {
                                self.noLocationData = true;
                            } else {
                                self.locationList = msg.LocationList;
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }
                // 搜索条件 电影分类
                self.chooseCateory = function (id, value) {
                    if (value == true) {
                        $scope.arr.catrgoryArr.push(id);
                    } else {
                        var index = $scope.arr.catrgoryArr.indexOf(id);
                        $scope.arr.catrgoryArr.splice(index, 1);
                    }
                }

                // 搜索条件 产地分类
                self.chooseLocation = function (id, value) {
                    if (value == true) {
                        $scope.arr.LocationArr.push(id);
                    } else {
                        var index = $scope.arr.LocationArr.indexOf(id);
                        $scope.arr.LocationArr.splice(index, 1);
                    }
                }

                // 监听 分类 产地 的变化
                $scope.$watch('arr', function (value) {
                    self.getMovieList(1);
                }, true)

                self.getMovieList = function (id) {
                    self.current = id;
                    self.loading = true;
                    self.noData = false;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var data = {
                                "action": "getMovieList",
                                "token": util.getParams("token"),
                                "keywords": self.keywords,
                                "locationID": $scope.arr.LocationArr,
                                "categoryID": $scope.arr.catrgoryArr
                            }
                            var paramsUrl = params.url();
                            data.per_page = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('movie', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.total == 0) {
                                    self.noData = true;
                                }
                                params.total(data.data.total);
                                return data.data.movieList;
                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });
                }

                self.addMoreMovie = function () {
                    // $scope.video.maskUrl = "pages/addMoreMovie.html";
                    $scope.app.showHideMask(true, "pages/addMoreMovie.html");
                }

                // 删除已入库电影
                self.delMovie = function (id) {
                    var flag = confirm('确定删除？');
                    if (!flag) {
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delMovie",
                        "lang": "zh-CN",
                        "movieID": id
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('删除成功');
                            $state.reload($state.current.name);
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                    });


                };

                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            self.sectionOriginal = (msg.data.Section).concat();
                            //self.sectionName = self.section[0];
                            /*-----第一项为空的科室分组-------*/
                          /*  var undef = {
                                'Name': {'zh-CN':''},
                                'ID': undefined
                            };
                            self.sectionOriginal.unshift(undef);*/
                            /*------第一项为全部的科室分组------*/
                            var hos = {
                                'Name': {'zh-CN':'全部'},
                                'ID': ''
                            };
                            self.section.unshift(hos);
                            self.sectionName = self.section[0];

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //转换科室
                self.changeSection = function () {

                    self.getVideos(2);
                }

                //获取宣教视频类型
                self.getVideoLittelType = function (ite) {
                    var datap = util.getObject('ajaxData');
                    datap.action = "GetLittleTypeList";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.littleType = msg.TypeList;
                            var all = {
                                "ID": '',
                                "Name":'全部'
                            };
                           // all.Name[self.defaultLang] = '全部';
                            self.littleType.unshift(all);
                            if(!ite){
                                self.typeBtnChoose = self.littleType[0].ID;
                            }


                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //获取宣教视频
                self.getVideos = function (id) {
                    self.current = id;
                    self.loading1 = true;
                    self.noVideo = false;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var paramsUrl = params.url();
                            var data = {
                                "action": "GetVideoList",
                                "token": util.getParams("token"),
                                "keywords": self.searName?self.searName:'',
                                "pager":{
                                    "total":-1,
                                    "per_page":paramsUrl.count - 0,
                                    "page":paramsUrl.page - 0,
                                    "orderby":"",
                                    "sortby":"desc"
                                },
                                "SectionID": self.sectionName.ID,
                                "LittleTypeID": self.typeBtnChoose

                            }

                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('educationalvideo', '', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                var page = data.data.Pager;
                                var list = data.data.VideoList;
                                if (page.total == 0) {
                                    self.noVideo = true;
                                    return;
                                }
                                params.total(data.data.total);
                                for(var i=0; i<list.length; i++){
                                    list[i].Name = JSON.parse(list[i].Name);
                                    list[i].SName = JSON.parse(list[i].SName);
                                    list[i].Lecturer = JSON.parse(list[i].Lecturer);
                                    list[i].Introduce = JSON.parse(list[i].Introduce);

                                }
                                console.log(list);
                                return list;
                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading1 = false;
                            })
                        }
                    });
                }

                //添加宣教视频种类
                self.addLiType = function () {
                    self.maskUrl = "pages/videoTypeAdd.html";
                }

                //编辑宣教视频种类
                self.editLiType = function () {
                    self.maskUrl = "pages/videoTypeEdit.html";
                };

                //删除宣教视频
                self.delVideo = function (id) {
                    var datap = util.getObject('ajaxData');
                    datap.action = "DelVideo";
                    datap.VideoID = id;
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert("删除成功！")
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.getVideos(2);
                    });
                };


                //转换选中的视频类型
                self.changeType = function (type) {
                    self.typeBtnChoose = type.ID;
                    self.typeName = type.Name;
                    self.getVideos(2);
                };

                //删除宣教视频种类
                self.delLiType = function () {
                    var s = confirm('确定删除该类型吗？');
                    if(s){
                        var datap = util.getObject('ajaxData');
                        datap.action = "DelType";
                        datap.LittleTypeID = self.typeBtnChoose
                        var data = JSON.stringify(datap);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('educationalvideo', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                alert("删除成功！");
                                self.getVideoLittelType();

                            } else if (msg.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert(msg.rescode + ' ' + msg.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function (value) {
                            self.loading = false;
                        });
                    }
                }

                //编辑宣教视频信息
                self.editVideo = function (item) {
                    self.maskUrl = "pages/editVideoInfo.html";
                    console.log(item);
                    self.video = item;
                }



                // // 监测电影分类，如果有，返回true
                // self.checkCategory = function(id, Category) {
                //     for (var i = 0; i < Category.length; i++) {
                //         if (Category[i] == id) {
                //             // 加入数组中
                //             self.chooseCateory(id, true);
                //             return true;
                //         }
                //     }
                // }


                // // 监测电影分类，如果有，返回true
                // self.checkLocation = function(id, Location) {
                //     for (var i = 0; i < Location.length; i++) {
                //         if (Location[i] == id) {
                //             // 加入数组中
                //             self.chooseLocation(id, true);
                //             return true;
                //         }
                //     }
                // }
            }
        ])

        //添加视频类型
        .controller('addVideoTypeController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', '$filter', 'md5',
            function ($http, $scope, $state, $stateParams, util, CONFIG, $filter, md5) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                };

                // 保存编辑
                self.saveForm = function () {
                    var datap = util.getObject('ajaxData');
                    datap.action = "AddType";
                    datap.Type = {
                        "Name": self.name
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert("保存成功！");
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errorInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;

                    });
                };

                self.cancel = function () {
                    $scope.editedList.maskUrl = "";
                    $scope.editedList.getVideoLittelType();


                };

            }
        ])

        //编辑视频类型
        .controller('editVideoTypeController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', '$filter', 'md5',
            function ($http, $scope, $state, $stateParams, util, CONFIG, $filter, md5) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.id = $scope.editedList.typeBtnChoose;
                    self.name = $scope.editedList.typeName;
                };

                // 保存编辑
                self.saveForm = function () {
                    var datap = util.getObject('ajaxData');
                    datap.action = "UpdateTypeName";
                    datap.LittleTypeID = self.id;
                    datap.Type = {
                        "Name": self.name
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert("保存成功！");
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errorInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;

                    });
                };

                self.cancel = function () {
                    $scope.editedList.maskUrl = "";
                    $scope.editedList.getVideoLittelType(true);


                };

            }
        ])

        //上传影片
        .controller('addMovieController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                console.log('addMovieController');
                console.log($scope.video.test);
                var self = this;
                self.init = function () {
                    console.log($scope.video.test);
                };

                self.cancel = function () {
                    // $scope.app.showHideMask(false);
                    $scope.video.maskUrl = "";
                };


                self.add = function () {
                    $scope.video.uploadList.uploadFile($scope.myFileMovie, $scope.myFileSubtitle, $scope.video.uploadList);
                    $scope.video.maskUrl = "";
                }
            }
        ])

        //编辑影片信息，将其入库
        .controller('addMovieInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addMovieInfoController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();

                    self.maskParams = $scope.app.maskParams;
                    // 电影分类 初始化 数组 电影产地 初始化 数组
                    self.catrgoryArr = [];
                    self.LocationArr = [];
                    // 提交的多语言
                    self.movieInfo = {};

                    self.uploadList = new UploadLists();
                    self.getTags();
                }

                self.cancel = function () {
                    // $scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);

                }

                // 上传图片
                self.addCoverImg = function () {
                    self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
                }

                function UploadLists() {
                    this.data = [];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                                self.movieInfo.PicSize = ret.size;
                                alert('图片上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id)
                                xhr.abort();
                            }
                        );
                    }
                }

                // 获取 电影的 分类 产地
                self.getTags = function () {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTags"
                        // "lang": "zh-CN"
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        // 字段 错误
                        if (msg.rescode == '200') {
                            if (msg.CategoryList.length == 0) {
                                self.noCategotyData = true;
                            } else {
                                self.categoryList = msg.CategoryList;
                            }
                            if (msg.LocationList.length == 0) {
                                self.noLocationData = true;
                            } else {
                                self.locationList = msg.LocationList;
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }
                // 编辑电影分类
                self.chooseCateory = function (id, value) {
                    if (value == true) {
                        self.catrgoryArr.push(id);
                    } else {
                        var index = self.catrgoryArr.indexOf(id);
                        self.catrgoryArr.splice(index, 1);
                    }
                }

                // 编辑产地分类
                self.chooseLocation = function (id, value) {
                    if (value == true) {
                        self.LocationArr.push(id);
                    } else {
                        var index = self.LocationArr.indexOf(id);
                        self.LocationArr.splice(index, 1);
                    }
                }


                // 添加电影入库
                self.addMovie = function () {
                    if (self.catrgoryArr.length == 0) {
                        alert('请选择类型');
                        return;
                    }
                    if (self.LocationArr.length == 0) {
                        alert('请选择产地');
                        return;
                    }
                    if (self.uploadList.data.length == 0) {
                        alert('请上传图片');
                        return;
                    }
                    self.saving = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "addMovie",
                        "lang": "zh-CN",
                        "taskID": self.maskParams.ID,
                        "Movie": {
                            "Seq": self.movieInfo.Seq,
                            "PicSize": self.movieInfo.PicSize - 0,
                            "Name": self.movieInfo.Name,
                            "Actor": self.movieInfo.Actor,
                            "Director": self.movieInfo.Director,
                            "URL_ABS": self.maskParams.URL,
                            "MovieSize": self.maskParams.Size,
                            "Duration": self.maskParams.Duration,
                            "Score": self.movieInfo.Score,
                            "SearchName": self.movieInfo.SearchName,
                            "Year": self.movieInfo.Year,
                            "Price": self.movieInfo.Price,
                            "Introduce": self.movieInfo.Introduce,
                            "PicURL_ABS": self.uploadList.data[0].img.src
                        },
                        "Category": self.catrgoryArr,
                        "Location": self.LocationArr
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {

                            alert('添加成功')
                            self.cancel();
                            util.setParams('currentVideoType',1);
                            $state.reload('app.video.notEditedList')
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }
            }
        ])

        //编辑视频信息，将其入库
        .controller('addVideoInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();

                    self.videoInfoT = $scope.app.maskParams;
                    // 电影分类 初始化 数组 电影产地 初始化 数组
                    self.videoInfo = {};
                    self.videoInfo.name = {};
                    self.videoInfo.name[self.defaultLang] = self.videoInfoT.FileOrigName;
                    self.uploadList = new $scope.app.uploadLists();

                    self.getSection();
                    self.getVideoLittelType();
                }

                self.cancel = function () {
                    // $scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                }

                // 上传图片
                self.addCoverImg = function () {
                    self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
                }


                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            var hos = {
                                'Name': {'zh-CN':'未分区'},
                                'ID': undefined
                            };
                            self.section.unshift(hos);
                            self.sectionOne = self.section[0];
                            console.log(self.section)

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //获取宣教视频类型
                self.getVideoLittelType = function () {
                    self.section = [];
                    var datap = util.getObject('ajaxData');
                    datap.action = "GetLittleTypeList";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                           self.littleType = msg.TypeList;
                            if(self.littleType){
                                self.liTypeOne = self.littleType[0]
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };


                // 添加电影入库
                self.addMovie = function () {
                    self.saving = true;
                    var datap = util.getObject('ajaxData');
                    datap.action = 'AddVideo';
                    datap.taskID = self.videoInfoT.ID;
                    datap.Video = {
                        "LittleTypeID": self.liTypeOne.ID,
                        "SectionID": self.sectionOne.ID?self.sectionOne.ID:{},
                        "Name": self.videoInfo.name,
                        "Lecturer": self.videoInfo.Lecturer?self.videoInfo.Lecturer:{},
                        "URL_ABS": self.videoInfoT.URL,
                        "Duration": self.videoInfoT.Duration,
                        "VideoSize": self.videoInfoT.Size,
                        "Introduce": self.videoInfo.Introduce?self.videoInfo.Introduce:{},
                        "PicURL_ABS":self.videoInfoT.PicURL_ABS?self.videoInfoT.PicURL_ABS:''
                    };




                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {

                            alert('添加成功');
                            util.setParams('currentVideoType',2);
                            $state.reload('app.video.notEditedList');
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }
            }
        ])

        //编辑视频信息（已经入库的）
        .controller('editVideoInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.videoInfo = $scope.editedList.video;
                    console.log(self.videoInfo);

                    self.getSection();
                    self.getVideoLittelType();
                }

                self.cancel = function () {
                     $scope.editedList.maskUrl = "";
                     $scope.editedList.getVideos(2);
                }

                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            var hos = {
                                'Name': {'zh-CN':'未分区'},
                                'ID': undefined
                            };
                            self.section.unshift(hos);
                            var len = self.section.length;
                            for(var i=0; i<len; i++){
                                if(self.section[i].ID == self.videoInfo.SectionID){
                                    self.sectionOne = self.section[i];
                                }
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //获取宣教视频类型
                self.getVideoLittelType = function () {
                    self.section = [];
                    var datap = util.getObject('ajaxData');
                    datap.action = "GetLittleTypeList";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.littleType = msg.TypeList;
                            var len = self.littleType.length;
                            for(var i=0; i<len; i++){
                                if(self.littleType[i].ID == self.videoInfo.LittleTypeID){
                                    self.liTypeOne = self.littleType[i]
                                }
                            }

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };


                // 添加电影入库
                self.addMovie = function () {
                    self.saving = true;
                    var datap = util.getObject('ajaxData');
                    datap.action = 'UpdateVideo';
                    datap.VideoID = self.videoInfo.ID;
                    datap.Video = {
                        "LittleTypeID": self.liTypeOne.ID,
                        "SectionID": self.sectionOne.ID,
                        "Name": self.videoInfo.Name,
                        "Lecturer": self.videoInfo.Lecturer,
                        "URL_ABS": self.videoInfo.URL,
                        "Duration": self.videoInfo.Duration,
                        "VideoSize": self.videoInfo.Size,
                        "Introduce": self.videoInfo.Introduce,
                        "PicURL_ABS":self.videoInfo.PicURL_ABS
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('educationalvideo', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {

                            alert('添加成功');
                            util.setParams('currentVideoType',2);
                            $state.reload('app.video.notEditedList');
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }
            }
        ])

        // 已入库页面的 添加 电影
        .controller('addMoreMovieController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addMoreMovieController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs')
                    self.defaultLang = util.getDefaultLangCode();

                    // 电影分类 初始化 数组 电影产地 初始化 数组
                    self.catrgoryArr = [];
                    self.LocationArr = [];
                    // 提交的多语言
                    self.movieInfo = {};

                    self.uploadList = new UploadLists();
                    self.getTags();
                }

                self.cancel = function () {
                    // $scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);

                }

                // 上传图片
                self.addCoverImg = function () {
                    self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
                }

                function UploadLists() {
                    this.data = [];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                                self.movieInfo.PicSize = ret.size;
                                alert('图片上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id)
                                xhr.abort();
                            }
                        );
                    }
                }

                // 获取 电影的 分类 产地
                self.getTags = function () {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTags"
                        // "lang": "zh-CN"
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        // 字段 错误
                        if (msg.rescode == '200') {
                            if (msg.CategoryList.length == 0) {
                                self.noCategotyData = true;
                            } else {
                                self.categoryList = msg.CategoryList;
                            }
                            if (msg.LocationList.length == 0) {
                                self.noLocationData = true;
                            } else {
                                self.locationList = msg.LocationList;
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }
                // 编辑电影分类
                self.chooseCateory = function (id, value) {
                    if (value == true) {
                        self.catrgoryArr.push(id);
                    } else {
                        var index = self.catrgoryArr.indexOf(id);
                        self.catrgoryArr.splice(index, 1);
                    }
                }

                // 编辑产地分类
                self.chooseLocation = function (id, value) {
                    if (value == true) {
                        self.LocationArr.push(id);
                    } else {
                        var index = self.LocationArr.indexOf(id);
                        self.LocationArr.splice(index, 1);
                    }
                }


                // 添加电影入库
                self.addMovie = function () {
                    if (self.catrgoryArr.length == 0) {
                        alert('请选择类型');
                        return;
                    }
                    if (self.LocationArr.length == 0) {
                        alert('请选择产地');
                        return;
                    }
                    if (self.uploadList.data.length == 0) {
                        alert('请上传图片');
                        return;
                    }
                    self.saving = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "addMovie",
                        "lang": "zh-CN",
                        "Movie": {
                            "Seq": self.movieInfo.Seq,
                            "PicSize": self.uploadList.data[0].img.size,
                            "Name": self.movieInfo.Name,
                            "Actor": self.movieInfo.Actor,
                            "Director": self.movieInfo.Director,
                            "URL_ABS": self.movieInfo.URL_ABS,
                            "MovieSize": self.movieInfo.MovieSize,
                            "Duration": self.movieInfo.Duration,
                            "Score": self.movieInfo.Score,
                            "SearchName": self.movieInfo.SearchName,
                            "Year": self.movieInfo.Year,
                            "Price": self.movieInfo.Price,
                            "Introduce": self.movieInfo.Introduce,
                            "PicURL_ABS": self.uploadList.data[0].img.src
                        },
                        "Category": self.catrgoryArr,
                        "Location": self.LocationArr
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {

                            alert('添加成功')
                            self.cancel();
                            $state.reload('app.video.notEditedList')
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }
            }
        ])

        //编辑影片信息
        .controller('editMovieInfoController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $filter, $stateParams, util, CONFIG) {
                console.log('editMovieInfoController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs')
                    self.defaultLang = util.getDefaultLangCode();
                    self.maskParams = $scope.app.maskParams;
                    // 电影分类 初始化 数组 电影产地 初始化 数组
                    self.catrgoryArr = [];
                    self.LocationArr = [];
                    // 提交的多语言
                    self.movieInfo = {};

                    self.uploadList = new UploadLists();
                    // 获取电影信息
                    self.getMovieInfo();
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);

                }

                // 上传图片
                self.addCoverImg = function () {
                    self.uploadList.uploadFile($scope.myCoverImg, self.uploadList);
                }

                function UploadLists() {
                    this.data = [];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }

                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                                alert('图片上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id)
                                xhr.abort();
                            }
                        );
                    }
                }


                // 获取 电影的 信息
                self.getMovieInfo = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getMovieInfoByID",
                        "movieID": self.maskParams.movieID
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {

                        var msg = response.data;
                        if (msg.rescode == '200') {
                            // // json字符串 -->对象
                            // msg.Actor =   eval('(' + msg.Actor + ')');
                            // msg.Director =   eval('(' + msg.Director + ')')
                            // msg.Introduce =   eval('(' + msg.Introduce + ')')
                            // msg.Name =   eval('(' + msg.Name + ')')
                            self.movieInfo = msg;
                            // 和上传 图片 的 数据 结构一致
                            var img = {};
                            img.img = {}, img.img.src = self.movieInfo.PicURL_ABS,
                                img.img.size = self.movieInfo.PicSize;
                            self.uploadList.data = [img];
                            // URL_ABS
                            self.maskParams.URL_ABS = msg.URL_ABS;
                            // Duration
                            self.maskParams.Duration = msg.Duration;
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }


                // 编辑电影分类
                self.chooseCateory = function (id, value) {
                    if (value == true) {
                        self.catrgoryArr.push(id);
                    } else {
                        var index = self.catrgoryArr.indexOf(id);
                        self.catrgoryArr.splice(index, 1);
                    }
                }

                // 编辑产地分类
                self.chooseLocation = function (id, value) {
                    if (value == true) {
                        self.LocationArr.push(id);
                    } else {
                        var index = self.LocationArr.indexOf(id);
                        self.LocationArr.splice(index, 1);
                    }
                }
                // 监测电影分类，如果有，返回true
                self.checkCategory = function (id, Category) {
                    for (var i = 0; i < Category.length; i++) {
                        if (Category[i] == id) {
                            // 加入数组中
                            self.chooseCateory(id, true);
                            return true;
                        }
                    }
                }


                // 监测电影分类，如果有，返回true
                self.checkLocation = function (id, Location) {
                    for (var i = 0; i < Location.length; i++) {
                        if (Location[i] == id) {
                            // 加入数组中
                            self.chooseLocation(id, true);
                            return true;
                        }
                    }
                }


                // 编辑电影入库
                self.editMovieInfo = function () {
                    self.saving = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "addMovie",
                        "lang": "zh-CN",
                        "movieID": self.maskParams.movieID,
                        // 假数据
                        // "movieID": 10,
                        "Movie": {
                            "Seq": self.movieInfo.Seq,
                            "Name": self.movieInfo.Name,
                            "PicSize": self.uploadList.data[0].img.size,
                            "Actor": self.movieInfo.Actor,
                            "Director": self.movieInfo.Director,
                            "URL_ABS": self.maskParams.URL_ABS,
                            "MovieSize": self.movieInfo.MovieSize,
                            "Duration": self.maskParams.Duration,
                            "Score": self.movieInfo.Score,
                            "SearchName": self.movieInfo.SearchName,
                            "Year": self.movieInfo.Year,
                            "Price": self.movieInfo.Price,
                            "Introduce": self.movieInfo.Introduce,
                            "PicURL_ABS": self.uploadList.data[0].img.src
                        },
                        "Category": self.catrgoryArr,
                        "Location": self.LocationArr
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('movie', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('编辑成功');
                            // 电影id 变化，重新刷新页面
                            $state.reload('app.video.editedList');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])

        // 音乐库
        .controller('musicLiarbryController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                console.log('musicLiarbryController')
                var self = this;
                self.init = function () {
                    self.defaultLang = util.getDefaultLangCode();
                    self.getMusicList();
                }


                // 查询音乐列表
                self.getMusicList = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getMusicList"
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('music', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            console.log(msg.musicList)
                            if (msg.musicList.length == 0) {
                                self.noData = true;
                                return;
                            }
                            self.musicList = msg.musicList;
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }

                // 删除音乐
                self.delMusic = function (id) {
                    var flag = confirm('确定删除？');
                    if (!flag) {
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delMusic",
                        "lang": "zh-CN",
                        "ID": id,
                        "Item": "Music"
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('music', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('删除成功');
                            $state.reload($state.current.name);
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                    });


                }

                self.addMusic = function () {
                    //$scope.video.maskUrl = "pages/addMusic.html";
                    $scope.app.showHideMask(true, "pages/addMusic.html");
                    // $scope.video.maskParams = { movieID: movieID };
                }

                self.editMusic = function (music) {
                    //$scope.video.maskUrl = "pages/editMusic.html";
                    $scope.app.showHideMask(true, "pages/editMusic.html");
                    $scope.app.maskParams = {music: music};
                }


            }
        ])

        //  添加音乐
        .controller('addMusicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addMusicController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs')
                    self.defaultLang = util.getDefaultLangCode();

                    self.maskParams = $scope.app.maskParams;

                    self.movieInfo = {};
                    // 提交的多语言

                    // 上传,音乐和图标实例化了两个对象
                    // self.uploadList = new UploadLists();
                    // 上传图标
                    self.imgUploadList = new UploadLists();
                    // 上传音乐
                    self.musicUploadList = new UploadLists();
                }

                // 添加音乐
                self.saveForm = function () {
                    console.log(self.imgUploadList)
                    console.log(self.musicUploadList)
                    if (self.musicUploadList.data.length == 0) {
                        alert('请上传音乐');
                        return;
                    }
                    if (self.imgUploadList.data.length == 0) {
                        alert('请上传音乐图标');
                        return;
                    }
                    if (self.imgUploadList.data[0].img.percentComplete != 100 || self.musicUploadList.data[0].img.percentComplete != 100) {
                        alert('上传中，请稍等');
                        return;
                    }

                    self.saving = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "addMusic",
                        "lang": "zh-CN",
                        "Music": {
                            "Seq": self.musicInfo.Seq,
                            "Name": self.musicInfo.Name,
                            "SingerName": self.musicInfo.SingerName,
                            "ColumnName": self.musicInfo.ColumnName,
                            "MusicIntro": self.musicInfo.MusicIntro,

                            "URL_ABS": self.musicUploadList.data[0].img.src,
                            "MusicSize": self.musicUploadList.data[0].img.size,
                            "PicURL_ABS": self.imgUploadList.data[0].img.src,
                            "PicSize": self.imgUploadList.data[0].img.size,

                            "Duration": self.musicInfo.Duration,
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('music', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {

                            alert('添加成功')
                            self.cancel();
                            $state.reload('app.video.musicLibrary', $stateParams, {reload: true})
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);

                }

                // 上传图标
                self.addCoverImg = function () {
                    if (!$scope.myCoverImg) {
                        alert('请先选择图标');
                        return;
                    }
                    self.imgUploadList.uploadFile($scope.myCoverImg, self.imgUploadList);
                }

                // 上传音乐，同一个上传的函数，没有改动
                self.addMusic = function () {
                    if (!$scope.myMusic) {
                        alert('请先选择音乐');
                        return;
                    }
                    self.musicUploadList.uploadFile($scope.myMusic, self.musicUploadList);
                }

                function UploadLists() {
                    this.data = [];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                                self.movieInfo.PicSize = ret.size;
                                // alert('上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id)
                                xhr.abort();
                            }
                        );
                    }
                }


            }
        ])

        //  编辑音乐
        .controller('editMusicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('editMusicController')
                console.log($scope.app.maskParams)
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs')
                    self.defaultLang = util.getDefaultLangCode();
                    self.musicInfo = $scope.app.maskParams.music;

                    // 上传,音乐和图标实例化了两个对象
                    // self.uploadList = new UploadLists();
                    // 上传图标
                    self.imgUploadList = new UploadLists();
                    // 上传音乐
                    self.musicUploadList = new UploadLists();

                    self.imgUploadList.data = [{img: {src: self.musicInfo.PicURL_ABS, size: self.musicInfo.PicSize}}];
                    self.musicUploadList.data = [{img: {src: self.musicInfo.URL_ABS, size: self.musicInfo.MusicSize}}];
                }

                // 保存编辑
                self.saveForm = function () {
                    if (self.musicUploadList.data.length == 0) {
                        alert('请上传音乐');
                        return;
                    }
                    if (self.imgUploadList.data.length == 0) {
                        alert('请上传音乐图标');
                        return;
                    }

                    self.saving = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "addMusic",
                        "musicID": self.musicInfo.musicID,
                        "lang": "zh-CN",
                        "Music": {
                            "Seq": self.musicInfo.Seq,

                            "Name": self.musicInfo.Name,
                            "SingerName": self.musicInfo.SingerName,
                            "ColumnName": self.musicInfo.ColumnName,
                            "MusicIntro": self.musicInfo.MusicIntro,

                            "URL_ABS": self.musicUploadList.data[0].img.src,
                            "MusicSize": self.musicUploadList.data[0].img.size,
                            "PicURL_ABS": self.imgUploadList.data[0].img.src,
                            "PicSize": self.imgUploadList.data[0].img.size,

                            "Duration": self.musicInfo.Duration,
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('music', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功')
                            self.cancel();
                            $state.reload('app.video.musicLibrary', $stateParams, {reload: true})
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);

                }

                // 上传图标
                self.addCoverImg = function () {
                    self.imgUploadList.uploadFile($scope.myCoverImg, self.imgUploadList);
                }

                // 上传音乐，同一个上传的函数，没有改动
                self.addMusic = function () {
                    self.musicUploadList.uploadFile($scope.myMusic, self.musicUploadList);
                }

                function UploadLists() {
                    this.data = [];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                                self.movieInfo.PicSize = ret.size;
                                alert('上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id)
                                xhr.abort();
                            }
                        );
                    }
                }


            }
        ])

        //用户main
        .controller('userController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    console.log($scope.app.data);
                    // 首页面加载页面url
                    self.userInfoUrl = '';

                    // 不显示首页面
                    self.showUserInfo = false;

                    // 显示首页面
                    self.gotoPage('userInfo');

                    //初始化数据
                    self.data =  $scope.app.data;
                    self.loading = true;
                    self.defaultLang = util.getDefaultLangCode();
                    self.current = 0;
                };

                //页面跳转
                self.gotoPage = function (pageName) {
                    if (pageName == 'userInfo') {
                        self.current = 0;
                        self.getUserInfo();
                        // 不是第一次加载
                        if (self.userInfoUrl !== '') {
                        }
                        // 第一次加载
                        else {
                            self.userInfoUrl = 'pages/userInformation.html';
                        }
                        self.showUserInfo = true;
                    }else {
                        if(pageName == 'app.user.section'){
                            self.current = 1
                        }else if(pageName == 'app.user.version'){
                            self.current = 2
                        }
                        self.showUserInfo = false;
                        $state.go(pageName);
                    }
                };

                // 获取用户信息
                self.getUserInfo = function () {
                    var datap = $scope.app.data;
                    datap.action = 'getUserInfoDetail';
                    datap.data = {
                        "Account": util.getParams('account')
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('user_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.userInfo = msg.data[0];

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //编辑个人信息
                self.edit = function () {
                    $scope.app.showHideMask(true,'pages/userInfoEdit.html');
                    $scope.app.maskParams = {user: self.userInfo, section: self.chooseSection};
                };

                self.UploadLists = function() {
                    this.data = [
                        /*{
                         "id":0,
                         "video":{
                         "name": "星际迷航", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         },
                         "subtitle":{
                         "name": "星际迷航－字幕", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         }
                         }*/
                    ];
                    this.maxId = 0;
                }

                self.UploadLists.prototype = {
                    add: function (video, subtitle) {
                        this.data.push({"video": video, "subtitle": subtitle, "id": this.maxId});
                        return this.maxId++;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 视频
                                if (l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 字幕
                                if (l[i].subtitle.percentComplete != undefined && l[i].subtitle.percentComplete < 100 && l[i].subtitle.percentComplete != '失败') {
                                    l[i].subtitle.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    judgeCompleted: function (id, o) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果视频和字幕都上传完毕
                                if ((l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete == undefined) ||
                                    (l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete >= 100)) {
                                    o.transcode(id, o);
                                }
                                break;
                            }
                        }
                    },
                    transcode: function (id, o) {
                        var o = o;
                        var id = id;
                        var l = this.data;
                        var source = {};
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                source = l[i];
                                break;
                            }
                        }
                        // 转码
                        var data = JSON.stringify({
                            "action": "submitTranscodeTask",
                            "token": util.getParams('token'),
                            "rescode": "200",
                            "data": {
                                "movie": {
                                    "oriFileName": source.video.name,
                                    "filePath": source.video.src
                                },
                                "subtitle": {
                                    "oriFileName": source.subtitle.name,
                                    "filePath": source.subtitle.src
                                }
                            }
                        })
                        console && console.log(data);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('tanscodetask', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                console && console.log('转码 ' + id);
                                // 从列表中删除
                                o.deleteById(id);
                            }
                            else if (msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            }
                            else {
                                // 转码申请失败后再次调用
                                console && console.log('转码申请失败后再次调用');
                                setTimeout(function () {
                                    o.transcode(id, o);
                                }, 5000);

                            }
                        }, function errorCallback(response) {
                            // 转码申请失败后再次调用
                            console && console.log('转码申请失败后再次调用');
                            console && console.log(response);
                            setTimeout(function () {
                                o.transcode(id, o);
                            }, 5000);
                        });
                    },
                    uploadFile: function (videoFile, subtitleFile, o) {
                        // 上传后台地址
                        var uploadUrl = CONFIG.uploadVideoUrl;

                        // 电影对象
                        var videoXhr = new XMLHttpRequest();
                        var video = {
                            "name": videoFile.name,
                            "size": videoFile.size,
                            "percentComplete": 0,
                            "xhr": videoXhr
                        };

                        // 字幕对象
                        var subtitle = {};
                        if (subtitleFile) {
                            var subtitleXhr = new XMLHttpRequest();
                            subtitle = {
                                "name": subtitleFile.name,
                                "size": subtitleFile.size,
                                "percentComplete": 0,
                                "xhr": subtitleXhr
                            };
                        }

                        // 添加data，并获取id
                        var id = this.add(video, subtitle);

                        // 上传视频
                        util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('video', id, percentComplete);
                                    }
                                });
                            },
                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('video', id, ret.filePath, ret.size);
                                    o.judgeCompleted(id, o);
                                });
                            },
                            // 上传失败
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.setPercentById('video', id, '失败');
                                });
                                xhr.abort();
                            }
                        );

                        // 上传字幕
                        if (subtitle.percentComplete != undefined) {
                            util.uploadFileToUrl(subtitle.xhr, subtitleFile, uploadUrl, 'normal',
                                // 上传中
                                function (evt) {
                                    $scope.$apply(function () {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                            // 更新上传进度
                                            o.setPercentById('subtitle', id, percentComplete);
                                        }
                                    });
                                },
                                // 上传成功
                                function (xhr) {
                                    var ret = JSON.parse(xhr.responseText);
                                    console && console.log(ret);
                                    $scope.$apply(function () {
                                        o.setSrcSizeById('subtitle', id, ret.filePath, ret.size);
                                        o.judgeCompleted(id, o);
                                    });
                                },
                                // 上传失败
                                function (xhr) {
                                    $scope.$apply(function () {
                                        o.setPercentById('subtitle', id, '失败');
                                    });
                                    xhr.abort();
                                }
                            );
                        }
                    }
                }

            }
        ])

        //个人信息编辑
        .controller('editUserInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', '$filter', 'md5',
            function ($http, $scope, $state, $stateParams, util, CONFIG, $filter, md5) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.user = $scope.app.maskParams.user;
                    self.secName = self.user.SName[self.defaultLang];
                    self.section = $scope.app.maskParams.section;
                };

                // 保存编辑
                self.saveForm = function () {

                    if(!self.passwordBefore && self.passwordAfter){
                        alert("请输入原密码！");
                        return;
                    }
                    if(self.passwordBefore && self.passwordAfter && !self.passwordSure){
                        alert("请确认新密码！")
                        return;
                    }
                    if(self.passwordBefore && !self.passwordAfter && self.passwordSure){
                        alert("请输入新密码！")
                        return;
                    }

                    var oldPwd, newPwd = undefined;
                    if(self.passwordBefore){
                       oldPwd = md5.createHash(self.passwordBefore);
                    }
                    if(self.passwordAfter){
                        newPwd = md5.createHash(self.passwordAfter);
                    }

                    var datap = $scope.app.data;
                    datap.action = "UpdateUserInfo";
                    datap.data = {
                        "Account": self.user.Account,
                        "Name": self.user.Name,
                        "OldPassword": oldPwd,
                        "Password": newPwd,
                        "SectionID": self.user.sectionID
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('user_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {

                            if(self.passwordAfter){
                                alert('保存成功,请重新登录！');
                                $state.go('login');
                            }else {
                                alert('保存成功！');
                                self.cancel();
                                //$state.reload('app.user.section', $stateParams, {reload: true})

                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errorInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;

                    });
                }

                //确认新密码
                self.testNewPwd = function () {
                    if(self.passwordAfter && self.passwordSure && self.passwordAfter != self.passwordSure){
                        alert('两遍新密码输入不同！');
                    }
                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);


                };

            }
        ])

        //用户创建
        .controller('userAddController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    $scope.user.showUserInfo = false;
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.getSection();
                };

                // 保存编辑
                self.saveForm = function () {
                    console.log(self.sectionId);
                    self.secId = '';

                    if(self.sectionId){
                        self.secId = self.sectionId.ID;
                    }
                    var datap = $scope.app.data;
                    datap.action = "addUser";
                    datap.data = {
                        "Name": self.name,
                        "Account": self.account,
                        "SectionID": self.secId
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('user_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('修改成功！')

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errorInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            var hos = {
                                'Name': {'zh-CN':''},
                                'ID': undefined
                            };
                            self.section.unshift(hos);
                            self.sectionOne = self.section[0];

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };
            }
        ])

        //用户管理
        .controller('userManageController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', 'NgTableParams',
            function ($http, $scope, $state, $stateParams, util, CONFIG, NgTableParams) {
                var self = this;
                self.init = function () {
                    $scope.user.showUserInfo = false;
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.sectionName = '医院';

                    self.getSection();
                    self.getUsers();
                };

                // 保存编辑
                self.getUsers = function (id) {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var datap = $scope.app.data;
                            datap.action = "getUserInfo";
                            var paramsUrl = params.url();
                            datap.data = {
                                "SectionID": id,
                                "total":-1,
                                "per_page": paramsUrl.count - 0,
                                "page": paramsUrl.page - 0,
                                "orderby":"",
                                "sortby":"desc",
                                "keyword":"",
                                "status":""
                            };
                            var data = JSON.stringify(datap);

                            return $http({
                                method: 'POST',
                                url: util.getApiUrl('user_info_original', '', 'server1'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.TotalCount == 0) {
                                        self.noData = true;
                                        return;
                                    }
                                    params.total(data.data.TotalCount);
                                    self.users = data.data.data;

                                    return data.data.data;
                                } else if (data.tata.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errorInfo);
                                }

                            }, function errorCallback(response) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });

                };

                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            self.sectionOriginal = (msg.data.Section).concat();
                            //self.sectionName = self.section[0];
                            var hos = {
                                'Name': {'zh-CN':'全部'},
                                'ID': undefined
                            };
                            self.section.unshift(hos);
                            self.sectionName = self.section[0]

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //转变科室
                self.changeSection = function () {
                    console.log(self.sectionName);
                    self.getUsers(self.sectionName.ID);
                };

                //编辑用户信息
                self.editUser = function (user) {
                    $scope.app.showHideMask(true,'pages/userEdit.html');
                    $scope.app.maskParams = {user : user, section: self.sectionOriginal};
                };

                //重置用户密码
                self.resetPwd = function (id) {
                    var datap = $scope.app.data;
                    datap.action = "resettingPassword";
                    datap.data = {
                        'ID': id
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('user_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert("重置密码成功！")
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errorInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });

                };

                //删除用户
                self.delUser = function (id) {
                    var datap = $scope.app.data;
                    datap.action = "removeUser";
                    datap.data = {
                        'ID': id
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('user_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                          alert("删除成功");
                            $state.reload();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errorInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });


                }
            }
        ])

        //用户编辑
        .controller('editUserController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.user = $scope.app.maskParams.user;
                    self.section = $scope.app.maskParams.section;
                    for(var i=0; i<self.section.length; i++){
                        if(self.user.SectionID == self.section[i].ID){
                            self.sectionName = self.section[i];
                        }
                    }
                };

                // 保存编辑
                self.saveForm = function () {
                    var datap = $scope.app.data;
                    datap.action = "editUser";
                    datap.data = {
                        "ID": self.user.ID,
                        "Name": self.user.Name,
                        "SectionID": self.sectionName?self.sectionName.ID:undefined
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('user_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功')
                            self.cancel();
                            $state.reload('app.user.section', $stateParams, {reload: true})
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                };


                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    $state.reload('app.user.list', $stateParams, {reload: true})

                };

            }
        ])

        //医院管理
        .controller('hospitalManageController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    //初始化数据
                    self.data =  $scope.app.data;
                    $scope.user.showUserInfo = false;
                    self.loading = true;
                    self.defaultLang = util.getDefaultLangCode();
                    self.showData();
                    self.chooseSection = {};
                }

                //获取大分区信息
                self.showData = function () {
                    self.data.action = "getHospitalInfo";
                    var data = JSON.stringify(self.data);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.hospitalData = msg.data;
                            console.log(self.hospitalData);
                            if (self.hospitalData.Section.length == 0) {
                                self.noData = true;
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //修改医院名称
                self.editHospital = function () {
                    $scope.app.showHideMask(true,'pages/hospitalEdit.html');
                    $scope.app.maskParams = {hospital : self.hospitalData};
                };

                //添加大分区
                self.addSection = function () {
                    $scope.app.showHideMask(true,'pages/sectionAdd.html');
                    $scope.app.maskParams = {hospital : self.hospitalData};
                };

                //修改大分区
                self.editSction = function (section) {
                    $scope.app.showHideMask(true,'pages/sectionEdit.html');
                    $scope.app.maskParams = {hospital : self.hospitalData, section: section};
                };
                //删除大分区
                self.deleteSection = function (id) {
                    var datap = $scope.app.data;
                    datap.action = "removeSection";
                    datap.data = {
                        'ID': id
                    };
                    var data = JSON.stringify(datap);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert("删除成功！");
                            self.showData();
                            $state.go('app.user.section');

                            //$state.reload('app.user.section', $stateParams, {reload: true})
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });

                };

                //显示小科室
                self.showSections = function (sec) {
                    util.setObject('session',sec);
                    $state.reload();
                    $state.go('app.user.section.small',{id:sec.ID});
                };

                
            }
        ])

        //医院编辑
        .controller('editHospitalController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('editHospitalController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs')
                    self.defaultLang = util.getDefaultLangCode();
                    self.hospital = $scope.app.maskParams.hospital;
                    self.data = $scope.app.data;
                };

                // 保存编辑
                self.saveForm = function () {
                    self.data.action = "editHospital";
                    self.data.data = {
                        "ID": self.hospital.ID,
                        "Name": self.hospital.Name
                    }
                    var data = JSON.stringify(self.data);

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功')
                            self.cancel();
                           // $state.reload('app.user.section', $stateParams, {reload: true})
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    $state.reload('app.user.section', $stateParams, {reload: true})

                };

            }
        ])

        //添加大分区
        .controller('addSectionController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addSectionController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.hospital = $scope.app.maskParams.hospital;
                    self.data = $scope.app.data;
                    //初始化
                    self.uploadList = new $scope.app.uploadLists();
                    self.uploadListHigh = new $scope.app.uploadLists();

                    self.sectionName = {};

                }

                // 保存编辑
                self.saveForm = function () {
                    if (self.uploadList.data.length == 0) {
                        alert('请上传分区图标');
                        return;
                    }
                    if (self.uploadListHigh.data.length == 0) {
                        alert('请上传分区高亮图标');
                        return;
                    }
                    if (self.uploadList.data[0].img.percentComplete != 100 || self.uploadListHigh.data[0].img.percentComplete != 100) {
                        alert('上传中，请稍等');
                        return;
                    }

                    self.data.action = "addSection";
                    self.data.data = {
                        'Name': self.sectionName,
                        "IconURL": self.uploadList.data[0].img.src,
                        "IconSize":self.uploadList.data[0].img.size,
                        "IconFocusURL": self.uploadListHigh.data[0].img.src,
                        "IconFocusSize": self.uploadListHigh.data[0].img.size,
                        "HospitalID": self.hospital.ID
                    };
                    var data = JSON.stringify(self.data);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('添加成功')
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    $state.reload('app.user.section', $stateParams, {reload: true})

                };

                // 上传图片
                self.addCoverImg = function (b, a) {

                    if(b == 1){
                        if (!$scope.myCoverImg) {
                            alert('请先选择图片');
                            return;
                        }
                        self.uploadList.uploadFile($scope.myCoverImg, a);
                    }else if(b ==2){
                        self.uploadListHigh.uploadFile($scope.myCoverImgHigh, a);

                    }
                }

            }
        ])

        //修改大分区
        .controller('editSectionController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addSectionController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.hospital = $scope.app.maskParams.hospital;
                    self.section = $scope.app.maskParams.section;
                    self.data = $scope.app.data;
                    //初始化
                    self.uploadList = new $scope.app.uploadLists();
                    self.uploadListHigh = new $scope.app.uploadLists();

                    self.uploadList.data = [{img: {src: self.section.IconURL, size: self.section.IconSize}}];
                    self.uploadListHigh.data = [{img: {src: self.section.IconFocusURL, size: self.section.IconFocusSize}}];
                    self.sectionName = self.section.Name;

                }

                // 保存编辑
                self.saveForm = function () {
                    if (self.uploadList.data.length == 0) {
                        alert('请上传分区图标');
                        return;
                    }
                    if (self.uploadListHigh.data.length == 0) {
                        alert('请上传分区高亮图标');
                        return;
                    }
                    if (self.uploadList.data[0].img.percentComplete != 100 || self.uploadListHigh.data[0].img.percentComplete != 100) {
                        alert('上传中，请稍等');
                        return;
                    }

                    self.data.action = "editSection";
                    self.data.data = {
                        'ID': self.section.ID,
                        'Name': self.sectionName,
                        "IconURL": self.uploadList.data[0].img.src,
                        "IconSize":self.uploadList.data[0].img.size,
                        "IconFocusURL": self.uploadListHigh.data[0].img.src,
                        "IconFocusSize": self.uploadListHigh.data[0].img.size,
                        "HospitalID": self.hospital.ID
                    };
                    var data = JSON.stringify(self.data);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('修改成功');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    $state.reload('app.user.section', $stateParams, {reload: true})

                };

                // 上传图片
                self.addCoverImg = function (b, a) {

                    if(b == 1){
                        if (!$scope.myCoverImg) {
                            alert('请先选择图片');
                            return;
                        }
                        self.uploadList.uploadFile($scope.myCoverImg, a);
                    }else if(b ==2){
                        self.uploadListHigh.uploadFile($scope.myCoverImgHigh, a);

                    }
                }

            }
        ])

        //子科室列表
        .controller('smallSectionController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addSectionController')
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.chooseSection = util.getObject('session');
                    //初始化
                    self.searchSmallSection();
                };

                // 保存编辑
                self.searchSmallSection = function () {
                    self.data1 = $scope.app.data;
                    self.data1.action = "getLittleSectionByID";
                    self.data1.data = {
                        "ID": self.chooseSection.ID
                    }

                    var data = JSON.stringify(self.data1);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.smallSctions = msg.data;
                            if (!self.smallSctions) {
                                self.noSmall = true;
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //添加子科室
                self.addSmallSection = function () {
                    $scope.app.showHideMask(true,'pages/smallSectionAdd.html');
                    $scope.app.maskParams = {section: self.chooseSection};
                };
                
                //删除子科室
                self.del = function (id) {
                    var datap = $scope.app.data;
                    datap.action = 'removeLittleSection';
                    datap.data = {
                        'ID': id
                    };
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('删除成功！');
                            $state.reload($state.current.name);
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {

                    });
                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    $state.reload('app.user.section', $stateParams, {reload: true})

                };

                // 上传图片
                self.addCoverImg = function (b, a) {

                    if(b == 1){
                        if (!$scope.myCoverImg) {
                            alert('请先选择图片');
                            return;
                        }
                        self.uploadList.uploadFile($scope.myCoverImg, a);
                    }else if(b ==2){
                        self.uploadListHigh.uploadFile($scope.myCoverImgHigh, a);

                    }
                }

            }
        ])

        //添加子科室
        .controller('addSmallSectionController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.section = $scope.app.maskParams.section;
                    self.getSmallSectionAvil();
                    self.chooseIdNumber = 0;

                };

                //获取
                self.getSmallSectionAvil = function () {
                    self.loading = true;
                    var datap = $scope.app.data;
                    datap.action = "getLittleSectionInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response){
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.smallAvil = msg.data;
                            if(self.smallAvil){
                                for(var i=0; i<self.smallAvil.length; i++){
                                    self.smallAvil[i].isChoosed = false;
                                }
                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    })
                };

                //改变子科室的选中状态
                self.changeSmallSecState = function (id) {
                  for(var i=0; i<self.smallAvil.length; i++){
                      if(self.smallAvil[i].ID == id){
                          self.smallAvil[i].isChoosed = self.smallAvil[i].isChoosed ? false : true;
                          if(self.smallAvil[i].isChoosed){
                              self.chooseIdNumber++;
                          }else {
                              self.chooseIdNumber--;
                          }
                      }
                  }
                };

                //保存选中子科室
                self.save = function () {
                    var chooseIDs = [];
                    if(self.smallAvil){
                        for(var i=0; i<self.smallAvil.length; i++){
                            if(self.smallAvil[i].isChoosed == true){
                                chooseIDs.push(self.smallAvil[i].ID);
                            }
                        }
                    }
                    var datap = $scope.app.data;
                    datap.action = "relateToSection";
                    datap.data = {
                        'SectionID': self.section.ID,
                        'IDs': chooseIDs
                    };
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response){
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('修改成功！');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    })
                }

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    $state.reload('app.user.section', $stateParams, {reload: true})

                };


            }
        ])

        //版本管理
        .controller('versionController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    //初始化数据
                    $scope.user.showUserInfo = false;
                    self.loading = true;
                    self.defaultLang = util.getDefaultLangCode();
                    self.showData();

                };

                //获取版本信息
                self.showData = function () {
                    var datap =$scope.app.data;
                    datap.action = "getVersionInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('version_control', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.version = msg.data;
                            if (self.version) {
                                if(self.version.local == 0){
                                    self.localstate = '更新中'
                                }else {
                                    self.localstate = '更新完成'
                                }

                                if(self.version.local == 0){
                                    self.mgtstate = '更新中'
                                }else {
                                    self.mgtstate = '更新完成'
                                }

                            }
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //修改医院名称
                self.commit = function () {
                    var datap =$scope.app.data;
                    datap.action = "submitVersion";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('version_control', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert("提交成功！")
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };




            }
        ])

        //插播main
        .controller('innerCutController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', 'NgTableParams',
            function ($http, $scope, $state, $stateParams, util, CONFIG, NgTableParams) {
                var self = this;
                self.init = function () {

                    // 上传页面加载页面url
                    self.resourceUrl = '';
                    // 不显示上传页面
                    self.showResource = false;
                    // 显示上传页面
                    self.gotoPage('innerCutResource');
                    self.defaultLang = util.getDefaultLangCode();
                    // 弹窗层
                    self.maskUrl = '';
                    self.maskParams = {};
                    // 初始化上传列表对象
                    self.uploadList = new UploadLists();
                    self.getSection();

                    self.getResBtn();
                    self.notEmpty = false;



                };

                self.gotoPage = function (pageName) {
                    // 上传列表页
                    if (pageName == 'innerCutResource') {
                        self.current = 0;
                        // 不是第一次加载
                        if (self.resourceUrl !== '') {
                            self.getResBtn();
                        }
                        // 第一次加载
                        else {
                            self.resourceUrl = 'pages/innerCutResource.html';
                        }
                        self.showResource = true;
                    }
                    //其他页
                    else {
                        self.current = 1;
                        self.showResource = false;
                        $state.go(pageName);
                    }
                };

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                };

                self.upload = function () {
                    // self.maskUrl = "pages/addMovie.html";
                    $scope.app.showHideMask(true, "pages/addMovie.html");
                };

                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            self.sectionOriginal = (msg.data.Section).concat();
                            //self.sectionName = self.section[0];
                            /*-----第一项为空的科室分组-------*/
                         /*   var undef = {
                                'Name': {'zh-CN':''},
                                'ID': undefined
                            };
                            self.sectionOriginal.unshift(undef);*/
                            /*------第一项为全部的科室分组------*/
                            var hos = {
                                'Name': {'zh-CN':'全部'},
                                'ID': -2
                            };
                            self.section.unshift(hos);
                            self.sectionName = self.section[0];
                            self.getResource();

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //获取资源信息
                self.getResource = function () {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 5,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var datap = $scope.app.data;
                            datap.action = "GetPage";
                            datap.type = self.resourceChoose.ID;
                            datap.category = self.sectionName.ID;
                            var paramsUrl = params.url();
                            datap.pager = {
                                "total":-1,
                                "per_page": paramsUrl.count - 0,
                                "page": paramsUrl.page - 0,
                                "orderby":"",
                                "sortby":"desc",
                                "keyword":self.resourceName?self.resourceName:'',
                                "status":""
                            };
                            var data = JSON.stringify(datap);

                            return $http({
                                method: 'POST',
                                url: util.getApiUrl('material', '', 'server2'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    var page = data.data.Pager;
                                    var res = data.data.Materials;
                                    if (page.total == 0) {
                                        self.noData = true;
                                        return;
                                    }
                                    params.total(page.total);
                                    for(var i=0; i<res.length; i++){
                                        res[i].section = JSON.parse(res[i].section)
                                    }
                                    return res;
                                } else if (data.tata.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errorInfo);
                                }

                            }, function errorCallback(response) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });

                };

                //转换科室
                self.changeSection = function () {
                    self.getResource();
                };

                //获取资源分类
                self.getResBtn = function () {
                    $http({
                        method: 'GET',
                        url: util.getApiUrl('', 'resourceButton.json', 'local')
                    }).then(function successCallback(data, status, headers, config) {
                        self.btns = data.data.resource;
                        self.resourceChoose = self.btns[0];
                    }, function errorCallback(data, status, headers, config) {

                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //添加资源
                self.addResource = function (id) {
                    switch (id){
                        case 2:
                           // $scope.app.showHideMask(true,'pages/innerCutResourcePicAdd.html');
                            self.maskUrl = 'pages/innerCutResourcePicAdd.html';
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 1:
                            //$scope.app.showHideMask(true,'pages/innerCutResourceVideoAdd.html');
                            self.maskUrl = 'pages/innerCutResourceVideoAdd.html';

                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 3:
                            //$scope.app.showHideMask(true,'pages/innerCutResourceLiveAdd.html');
                            self.maskUrl = 'pages/innerCutResourceLiveAdd.html';

                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 4:
                           // $scope.app.showHideMask(true,'pages/innerCutResourceTextAdd.html');
                            self.maskUrl = 'pages/innerCutResourceTextAdd.html';
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        default:
                            break;
                    }
                    self.resourceId = id;

                    //$scope.app.maskParams = {resourceId: id, section: self.sectionOriginal};

                };

                //编辑资源
                self.editResource = function (res) {
                    switch (self.resourceChoose.ID){
                        case 2:
                            //$scope.app.showHideMask(true,'pages/innerCutResourcePicEdit.html');
                            self.maskUrl = 'pages/innerCutResourcePicEdit.html';
                            break;
                        case 1:
                            //$scope.app.showHideMask(true,'pages/innerCutResourceVideoEdit.html');
                            self.maskUrl = 'pages/innerCutResourceVideoEdit.html';
                            break;
                        case 3:
                            //$scope.app.showHideMask(true,'pages/innerCutResourceLiveEdit.html');
                            self.maskUrl = 'pages/innerCutResourceLiveEdit.html';
                            break;
                        case 4:
                            //$scope.app.showHideMask(true,'pages/innerCutResourceTextEdit.html');
                            self.maskUrl = 'pages/innerCutResourceTextEdit.html';
                            break;
                        default:
                            break;

                    }
                    self.resource = res;
                };

                //删除资源
                self.delResource = function () {
                    if(!self.checkboxes || !self.notEmpty){
                        alert("请选择要删除的资源！");
                        return;
                    }
                    var s = confirm('确定删除资源吗？');
                    if(s){
                        self.ids = [];
                        var item = self.checkboxes.items;
                        for (var i in item){
                            if(item[i] == true){
                                self.ids.push(i);
                            }
                        }
                        var datap = util.getObject('ajaxData');
                        datap.action = "DelMaterial";
                        datap.type = self.resourceChoose.ID;
                        datap.ids = self.ids;

                        var data = JSON.stringify(datap);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('material', '', 'server2'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                alert('删除成功!');
                            } else if (msg.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert(msg.rescode + ' ' + msg.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function (value) {
                            self.getResource();
                        });

                    }

                };

                //选择资源
                self.changeCheckBox = function () {
                    var checks = self.checkboxes;
                    if(checks){
                        for(var j in checks.items){
                            if(checks.items[j] == true){
                                self.notEmpty = true;
                                return;
                            }
                        }
                        self.notEmpty = false;
                    }
                }
                
                //转换资源类型
                self.changeResource = function (res) {
                    self.checkboxes = undefined;
                    self.resourceChoose = res;
                    self.getResource();
                };

                //图片上传
                self.uploadLists = function() {
                    this.data = [];
                    this.maxId = 0;
                };

                self.uploadLists.prototype = {
                    add: function (img) {
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    changeImg: function (img) {
                        // 只允许 上传 一张图片
                        this.data = [];
                        this.data.push({"img": img, "id": this.maxId});
                        return this.maxId;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 图片
                                if (l[i].img.percentComplete < 100 && l[i].img.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    uploadFile: function (imgFile, o) {
                        // 图片上传后台地址
                        var uploadUrl = CONFIG.uploadImgUrl;

                        // 图片对象
                        var imgXhr = new XMLHttpRequest();
                        var img = {"name": imgFile.name, "size": imgFile.size, "percentComplete": 0, "xhr": imgXhr};

                        var id = this.changeImg(img);
                        // 上传视频
                        util.uploadFileToUrl(imgXhr, imgFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('img', id, percentComplete);
                                    }
                                });
                            },

                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('img', id, ret.upload_path, ret.size);
                                });
                                // self.movieInfo.PicSize = ret.size;
                                // alert('上传成功')
                            },
                            // 上传失败
                            function (xhr) {
                                alert('图片上传失败，请重新上传');
                                o.deleteById(id);
                                xhr.abort();
                            }
                        );
                    }
                };


                function UploadLists() {
                    this.data = [
                        /*{
                         "id":0,
                         "video":{
                         "name": "星际迷航", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         },
                         "subtitle":{
                         "name": "星际迷航－字幕", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         }
                         }*/
                    ];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function (video, subtitle) {
                        this.data.push({"video": video, "subtitle": subtitle, "id": this.maxId});
                        return this.maxId++;
                    },
                    setPercentById: function (type, id, percentComplete) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function (type, id, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 视频
                                if (l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 字幕
                                if (l[i].subtitle.percentComplete != undefined && l[i].subtitle.percentComplete < 100 && l[i].subtitle.percentComplete != '失败') {
                                    l[i].subtitle.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    judgeCompleted: function (id, o) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果视频和字幕都上传完毕
                                if ((l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete == undefined) ||
                                    (l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete >= 100)) {
                                    o.transcode(id, o);
                                }
                                break;
                            }
                        }
                    },
                    transcode: function (id, o) {
                        var o = o;
                        var id = id;
                        var l = this.data;
                        var source = {};
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                source = l[i];
                                break;
                            }
                        }
                        // 转码
                        var data = JSON.stringify({
                            "action": "submitTranscodeTask",
                            "token": util.getParams('token'),
                            "rescode": "200",
                            "data": {
                                "movie": {
                                    "oriFileName": source.video.name,
                                    "filePath": source.video.src
                                },
                                "subtitle": {
                                    "oriFileName": source.subtitle.name,
                                    "filePath": source.subtitle.src
                                }
                            }
                        })
                        console && console.log(data);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('tanscodetask', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                console && console.log('转码 ' + id);
                                // 从列表中删除
                                o.deleteById(id);
                            }
                            else if (msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            }
                            else {
                                // 转码申请失败后再次调用
                                console && console.log('转码申请失败后再次调用');
                                setTimeout(function () {
                                    o.transcode(id, o);
                                }, 5000);

                            }
                        }, function errorCallback(response) {
                            // 转码申请失败后再次调用
                            console && console.log('转码申请失败后再次调用');
                            console && console.log(response);
                            setTimeout(function () {
                                o.transcode(id, o);
                            }, 5000);
                        });
                    },
                    uploadFile: function (videoFile, subtitleFile, o) {
                        // 上传后台地址
                        var uploadUrl = CONFIG.uploadVideoUrl;

                        // 电影对象
                        var videoXhr = new XMLHttpRequest();
                        var video = {
                            "name": videoFile.name,
                            "size": videoFile.size,
                            "percentComplete": 0,
                            "xhr": videoXhr
                        };

                        // 字幕对象
                        var subtitle = {};
                        if (subtitleFile) {
                            var subtitleXhr = new XMLHttpRequest();
                            subtitle = {
                                "name": subtitleFile.name,
                                "size": subtitleFile.size,
                                "percentComplete": 0,
                                "xhr": subtitleXhr
                            };
                        }

                        // 添加data，并获取id
                        var id = this.add(video, subtitle);

                        // 上传视频
                        util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                            // 上传中
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('video', id, percentComplete);
                                    }
                                });
                            },
                            // 上传成功
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeById('video', id, ret.filePath, ret.size);
                                    o.judgeCompleted(id, o);
                                });
                            },
                            // 上传失败
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.setPercentById('video', id, '失败');
                                });
                                xhr.abort();
                            }
                        );

                        // 上传字幕
                        if (subtitle.percentComplete != undefined) {
                            util.uploadFileToUrl(subtitle.xhr, subtitleFile, uploadUrl, 'normal',
                                // 上传中
                                function (evt) {
                                    $scope.$apply(function () {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                            // 更新上传进度
                                            o.setPercentById('subtitle', id, percentComplete);
                                        }
                                    });
                                },
                                // 上传成功
                                function (xhr) {
                                    var ret = JSON.parse(xhr.responseText);
                                    console && console.log(ret);
                                    $scope.$apply(function () {
                                        o.setSrcSizeById('subtitle', id, ret.filePath, ret.size);
                                        o.judgeCompleted(id, o);
                                    });
                                },
                                // 上传失败
                                function (xhr) {
                                    $scope.$apply(function () {
                                        o.setPercentById('subtitle', id, '失败');
                                    });
                                    xhr.abort();
                                }
                            );
                        }
                    }
                }

            }
        ])

        //添加插播图片
        .controller('addInnerCutPicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addSectionController');
                var self = this;
                self.init = function () {
                    console.log($scope.app.data);
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.uploadList = new $scope.cut.uploadLists();
                    self.resId = $scope.cut.resourceId;
                    self.section = $scope.cut.sectionOriginal;

                    self.sectionName = self.section[0];

                };

                // 保存编辑
                self.saveForm = function () {

                    if (self.uploadList.data.length == 0) {
                        alert('请上传图片');
                        return;
                    }
                    if (self.uploadList.data[0].img.percentComplete != 100) {
                        alert('上传中，请稍等');
                        return;
                    }
                    var datap = util.getObject('ajaxData');
                    datap.action = "AddMateril";
                    datap.data = {
                        "name": self.PicName,
                        "path_abs": self.uploadList.data[0].img.src,
                        "size":self.uploadList.data[0].img.size,
                        "type": self.resId,
                        "category": self.sectionName.ID,
                        "md5": '',
                        'creator': util.getParams('account')
                    };
                    var data = JSON.stringify(datap);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('material', '', 'server2'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('添加成功!');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        //self.cancel();
                    });
                };

                self.cancel = function () {
                    $scope.cut.maskUrl = "";
                    $scope.cut.getResource();
                    //$scope.app.showHideMask(false);
                   // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                // 上传图片
                self.addCoverImg = function (a) {
                        if (!$scope.myCoverImg) {
                            alert('请先选择图片');
                            return;
                        }
                        self.uploadList.uploadFile($scope.myCoverImg, a);
                }

            }
        ])

        //编辑插播图片
        .controller('editInnerCutPicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addSectionController');
                var self = this;
                self.init = function () {
                    console.log($scope.app.data);
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.source = $scope.cut.resource;
                    self.type = $scope.cut.resourceChoose.ID;
                    var sec = $scope.cut.sectionOriginal;
                    var len = sec.length;
                    for(var i=0; i<len; i++){
                        if(sec[i].ID == self.source.category){
                            self.secName = sec[i].Name;
                        }
                    }

                };

                // 保存编辑
                self.saveForm = function () {
                    var datap = util.getObject('ajaxData');
                    datap.action = "UpdateMaterial";
                    datap.type = self.type;
                    datap.data = {
                        "name": self.source.name,
                        "id": self.source.id,
                        "content": ''
                    };
                    var data = JSON.stringify(datap);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('material', '', 'server2'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('修改成功!');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        //self.cancel();
                    });
                };

                self.cancel = function () {
                    $scope.cut.maskUrl = "";
                    $scope.cut.getResource();
                };
            }
        ])

        //添加插播直播频道
        .controller('addInnerCutLiveController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                };

                // 保存编辑
                self.saveForm = function () {
                    if (self.uploadList.data.length == 0) {
                        alert('请上传图片');
                        return;
                    }
                    if (self.uploadList.data[0].img.percentComplete != 100) {
                        alert('上传中，请稍等');
                        return;
                    }

                    self.data.action = "addSection";
                    self.data.data = {
                        'Name': self.sectionName,
                        "IconURL": self.uploadList.data[0].img.src,
                        "IconSize":self.uploadList.data[0].img.size,
                        "IconFocusURL": self.uploadListHigh.data[0].img.src,
                        "IconFocusSize": self.uploadListHigh.data[0].img.size,
                        "HospitalID": self.hospital.ID
                    };
                    var data = JSON.stringify(self.data);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('添加成功')
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        self.cancel();
                    });
                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})
                };

            }
        ])

        //添加插播文本
        .controller('addInnerCutTextController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();

                    self.resId = $scope.cut.resourceId;
                    self.section = $scope.cut.sectionOriginal;
                    self.sectionName = self.section[0];
                };

                // 保存编辑
                self.saveForm = function () {
                    var datap = util.getObject('ajaxData');
                    datap.action = "AddMateril";
                    datap.data = {
                        "name": self.name,
                        "path_abs": '',
                        "size":'',
                        "type": self.resId,
                        "category": self.sectionName.ID,
                        "md5": '',
                        'creator': util.getParams('account'),
                        "content": self.content
                    };
                    var data = JSON.stringify(datap);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('material', '', 'server2'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('添加成功!');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        //self.cancel();
                    });
                };

                self.cancel = function () {
                    $scope.cut.maskUrl = "";
                    $scope.cut.getResource();
                };

            }
        ])

        //编辑插播文本
        .controller('editInnerCutTextController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.source = $scope.cut.resource;
                    self.type = $scope.cut.resourceChoose.ID;
                    var sec = $scope.cut.sectionOriginal;
                    var len = sec.length;
                    for(var i=0; i<len; i++){
                        if(sec[i].ID == self.source.category){
                            self.secName = sec[i].Name;
                        }
                    }
                };

                // 保存编辑
                self.saveForm = function () {
                    var datap = util.getObject('ajaxData');
                    datap.action = "UpdateMaterial";
                    datap.type = self.type;
                    datap.data = {
                        "name": self.source.name,
                        "id": self.source.id,
                        "content": self.source.content
                    };
                    var data = JSON.stringify(datap);
                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('material', '', 'server2'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('修改成功!');
                            self.cancel();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                        //self.cancel();
                    });
                };

                self.cancel = function () {
                    $scope.cut.maskUrl = "";
                    $scope.cut.getResource();
                };

            }
        ])

        //插播计划
        .controller('innerCutPlanController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG', 'NgTableParams',
            function ($http, $scope, $state, $stateParams, util, CONFIG, NgTableParams) {
                var self = this;
                self.init = function () {
                    console.log($scope.app.data);
                    $scope.cut.showResource = false;
                    self.defaultLang = util.getDefaultLangCode();
                    self.getResBtn();
                    self.getPlanList();
                };

                //获取计划列表
                self.getPlanList = function () {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 1,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var datap = $scope.app.data;
                            datap.action = "getUserInfo";
                            var paramsUrl = params.url();
                            datap.data = {
                                "SectionID": '',
                                "total":-1,
                                "per_page": paramsUrl.count - 0,
                                "page": paramsUrl.page - 0,
                                "orderby":"",
                                "sortby":"desc",
                                "keyword":"",
                                "status":""
                            };
                            var data = JSON.stringify(datap);

                            return $http({
                                method: 'POST',
                                url: util.getApiUrl('', 'plans.json', 'local'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.TotalCount == 0) {
                                        self.noData = true;
                                        return;
                                    }
                                    params.total(data.data.TotalCount);
                                    self.users = data.data.data;

                                    return data.data.data;
                                } else if (data.tata.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errorInfo);
                                }

                            }, function errorCallback(response) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });

                };

                //添加计划
                self.addPlan = function (id) {
                    switch (id){
                        case 2:
                            $scope.app.showHideMask(true,'pages/innerCutPlanPicAdd.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 1:
                            $scope.app.showHideMask(true,'pages/innerCutPlanVideoAdd.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 3:
                            $scope.app.showHideMask(true,'pages/innerCutPlanLiveAdd.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 4:
                            $scope.app.showHideMask(true,'pages/innerCutPlanTextAdd.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        default:
                            break;
                    }

                };

                //修改计划
                self.editResource = function (res) {
                    switch (self.resourceChoose.ID){
                        case 2:
                            $scope.app.showHideMask(true,'pages/innerCutPlanPicEdit.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 1:
                            $scope.app.showHideMask(true,'pages/innerCutPlanVideoEdit.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 3:
                            $scope.app.showHideMask(true,'pages/innerCutPlanLiveEdit.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        case 4:
                            $scope.app.showHideMask(true,'pages/innerCutPlanTextEdit.html');
                            //$scope.app.maskParams = {section: self.chooseSection};
                            break;
                        default:
                            break;
                    }
                    $scope.app.maskParams = {resource: res};
                };

                //获取资源分类
                self.getResBtn = function () {
                    $http({
                        method: 'GET',
                        url: util.getApiUrl('', 'resourceButton.json', 'local')
                    }).then(function successCallback(data, status, headers, config) {
                        self.btns = data.data.resource;
                        self.resourceChoose = self.btns[0];
                    }, function errorCallback(data, status, headers, config) {

                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

                //转换资源类型
                self.changeResource = function (res) {
                    self.resourceChoose = res;
                };



            }
        ])

        //添加图片的插播计划
        .controller('addPlanPicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');
                    initTime();
                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Size': 11,
                            'Name': 'test1.jpg'
                        },
                        {
                            'ID': 2,
                            'Size': 12,
                            'Name': 'test2.jpg'
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                var initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    var t = currTime.getTime();
                    t += 3600000;  //结束时间设为1小时后
                    var afterTime = new Date(t);
                    self.stopTime = util.setFormatTime(afterTime);

                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
               /* self.chooseResource = function (ele) {
                    console.log(ele);
                    var box = ele.row.Status;
                    if(box){
                        self.resourceChoosen++;
                    }else {
                        self.resourceChoosen--;
                    }

                };*/

            }
        ])

        //编辑图片的插播计划
        .controller('editPlanPicController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');
                    self.resource = $scope.app.maskParams.resource;
                    console.log(self.resource);
                    initTime();
                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Size': 11,
                            'Name': 'test1.jpg'
                        },
                        {
                            'ID': 2,
                            'Size': 12,
                            'Name': 'test2.jpg'
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                var initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    var t = currTime.getTime();
                    t += 3600000;  //结束时间设为1小时后
                    var afterTime = new Date(t);
                    self.stopTime = util.setFormatTime(afterTime);

                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/

            }
        ])

        //添加视频的插播计划
        .controller('addPlanVideoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');

                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource.ID){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Name': 'test1.jpg',
                            'Size': 122345,
                            'Duration': 60
                        },
                        {
                            'ID': 2,
                            'Name': 'test2.jpg',
                            'Size': 1111,
                            'Duration': 224
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                self.initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    if(self.resource){
                        var duration = self.resource.Duration;
                        var t = currTime.getTime();
                        t += duration*1000;  //结束时间设为1小时后
                        var afterTime = new Date(t);
                        self.stopTime = util.setFormatTime(afterTime);
                    }
                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/
            }
        ])

        //编辑视频的插播计划
        .controller('editPlanVideoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');

                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource.ID){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Name': 'test1.jpg',
                            'Size': 122345,
                            'Duration': 60
                        },
                        {
                            'ID': 2,
                            'Name': 'test2.jpg',
                            'Size': 1111,
                            'Duration': 224
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                self.initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    if(self.resource){
                        var duration = self.resource.Duration;
                        var t = currTime.getTime();
                        t += duration*1000;  //结束时间设为1小时后
                        var afterTime = new Date(t);
                        self.stopTime = util.setFormatTime(afterTime);
                    }
                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/
            }
        ])

        //添加直播的插播计划
        .controller('addPlanLiveController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');
                    initTime();
                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Name': 'test1.jpg',
                            'Url': 'www'
                        },
                        {
                            'ID': 2,
                            'Name': 'test2.jpg',
                            'Url': 'www'
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                var initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    var t = currTime.getTime();
                    t += 3600000;  //结束时间设为1小时后
                    var afterTime = new Date(t);
                    self.stopTime = util.setFormatTime(afterTime);

                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/
            }
        ])

        //编辑直播的插播计划
        .controller('editPlanLiveController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');
                    initTime();
                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Name': 'test1.jpg',
                            'Url': 'www'
                        },
                        {
                            'ID': 2,
                            'Name': 'test2.jpg',
                            'Url': 'www'
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                var initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    var t = currTime.getTime();
                    t += 3600000;  //结束时间设为1小时后
                    var afterTime = new Date(t);
                    self.stopTime = util.setFormatTime(afterTime);

                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/
            }
        ])

        //添加文本的插播计划
        .controller('addPlanTextController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');
                    initTime();
                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Name': 'test1.jpg'
                        },
                        {
                            'ID': 2,
                            'Name': 'test2.jpg'
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                var initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    var t = currTime.getTime();
                    t += 3600000;  //结束时间设为1小时后
                    var afterTime = new Date(t);
                    self.stopTime = util.setFormatTime(afterTime);

                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/
            }
        ])

        //编辑文本的插播计划
        .controller('editPlanTextController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLang = util.getDefaultLangCode();
                    self.page = 0;
                    self.getResourceList();
                    //self.startTime = new Date('2017-07-11 12:30');
                    initTime();
                };

                // 保存编辑
                self.saveForm = function () {
                    var times = self.stopTime - self.startTime;
                    if(times <= 0){
                        alert('开始时间必须必须在结束时间之前！');
                        return;
                    }
                    console.log(times);

                };

                self.cancel = function () {
                    //$scope.video.maskUrl = "";
                    $scope.app.showHideMask(false);
                    // $state.reload('app.user.section', $stateParams, {reload: true})

                };

                //换页
                self.changePage = function () {
                    self.page = self.page?0:1;
                    if(self.page){
                        for(var i=0; i<self.resourceList.length; i++){
                            if(self.resourceList[i].ID == self.resource){
                                self.resChoosed = self.resourceList[i];
                            }
                        }
                    }
                };

                //获取资源
                self.getResourceList =function () {
                    //self.resourceChoosen = 0;  //用于选择多个资源时计数
                    self.resourceList = [
                        {
                            'ID': 1,
                            'Name': 'test1.jpg'
                        },
                        {
                            'ID': 2,
                            'Name': 'test2.jpg'
                        }
                    ]
                };

                self.chooseResource = function () {
                    console.log(self.resource);
                };

                //初始化时间
                var initTime = function () {
                    var currTime = new Date();
                    self.startTime = util.setFormatTime(currTime);
                    var t = currTime.getTime();
                    t += 3600000;  //结束时间设为1小时后
                    var afterTime = new Date(t);
                    self.stopTime = util.setFormatTime(afterTime);

                };


                //选取资源——针对多选的情况,Status为选中项的状态，值为true或false
                /* self.chooseResource = function (ele) {
                 console.log(ele);
                 var box = ele.row.Status;
                 if(box){
                 self.resourceChoosen++;
                 }else {
                 self.resourceChoosen--;
                 }

                 };*/
            }
        ])

        //终端main
        .controller('terminalController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;

                self.init = function () {
                    self.form = {};
                    self.data =  $scope.app.data;
                    self.loading = true;
                    self.defaultLang = util.getDefaultLangCode();
                    self.getSection();

                };

                //获取科室
                self.getSection = function () {
                    self.section = [];
                    var datap = $scope.app.data;
                    datap.action = "getHospitalInfo";
                    var data = JSON.stringify(datap);
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hospital_info_original', '', 'server1'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.section = msg.data.Section;
                            self.sectionOriginal = (msg.data.Section).concat();
                            //self.sectionName = self.section[0];
                            var hos = {
                                'Name': {'zh-CN':'全部'},
                                'ID': undefined
                            };
                            self.section.unshift(hos);
                            self.sectionName = self.section[0]

                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                };

              /*  // 获取某分区终端列表 带搜索和分页
                self.getSectionDevList = function () {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var data = {
                                "action": "getDevList",
                                "token": util.getParams("token"),
                                "lang": self.langStyle,
                                "Online": self.form.Online,
                                "SectionID": self.form.sectionID,
                                "RoomID": self.form.RoomID
                            }
                            var paramsUrl = params.url();
                            data.per_page = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('devinfo', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.total);
                                    return data.data.devlist;
                                } else if (msg.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errInfo);
                                }

                            }, function errorCallback(response) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });
                }

                // 获取某分区终端状态 总数目
                self.getSectionDevNum = function (ID) {
                    // self.form.HotelName = self.hotelList[index].Name[self.defaultLangCode];
                    self.form.sectionID = ID;

                    self.getSectionDevList();
                    var data = {
                        "action": "getDevNum",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "SectionID": self.form.sectionID
                    }

                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == '200') {
                            self.form.total = data.data.total;
                            self.form.online = data.data.online;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    })


                }*/


                self.delTerm = function (id) {
                    var conf = confirm('确认删除？');
                    if (!conf) {
                        return;
                    }
                    var data = {
                        "action": "delDev",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ID": id
                    }

                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == '200') {
                            self.getDevList();
                            self.getDevNum(self.form.HotelID, self.hotelListIndex);
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    })
                }

                // 授权操作
                // todo 未做批量操作
                self.validDev = function (ID, Registered) {
                    // return;
                    var data = {
                        "action": "validDev",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ID": [ID]
                    };
                    if (Registered) {
                        data.status = 0;
                    } else {
                        data.status = 1;
                    }
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('操作成功');
                            $state.reload($state.current.name, $stateParams, true)
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('操作失败， ' + data.data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert('操作失败， ' + data.data.errInfo);
                    }).finally(function (value) {
                    });
                }

                self.addDev = function () {
                    $scope.app.maskParams = {'HotelID': self.form.HotelID};
                    $scope.app.showHideMask(true, 'pages/addDev.html');
                }




            }
        ])



})();
