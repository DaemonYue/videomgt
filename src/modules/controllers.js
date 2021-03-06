'use strict';

(function () {
    var app = angular.module('app.controllers', [])

        .controller('indexController', ['$scope',
            function ($scope) {
                var self = this;
                self.init = function () {
                    this.maskUrl = '';
                }
            }
        ])

        .controller('loginController', ['$scope', '$http', '$state', '$filter', 'md5', 'util',
            function ($scope, $http, $state, $filter, md5, util) {
                console.log('loginController')
                var self = this;
                self.init = function () {

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

        .controller('appController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                var self = this;
                self.init = function () {
                    /*if (util.getParams("projectDes")) {
                     this.projectDes = util.getParams("projectDes")
                     } else {
                     alert("访问超时，请重新登录")
                     $state.go('login')
                     }
                     // app 页面展开desktop*/
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
                            self.activeAppIcon = l[i].icon;
                            self.activeAppBgColor = l[i].bgColor;
                            self.activeAppThemeColor = l[i].themeColor;

                            break;
                        }
                    }
                }

                // 1:酒店客房，2:酒店客房订单 3:移动商城，4:商城订单，5:tv界面, 6:终端管理，7:微信用户，9：字幕
                self.switchApp = function (n) {
                    // 收起桌面
                    self.appPhase = 2;

                    // 缩小导航栏
                    self.appFramePhase = 1;
                    self.setFocusApp(n);

                    switch (n) {
                        case 1:
                            if (!$state.includes('app.hotelRoom')) {
                                $state.go('app.hotelRoom', {'appId': n});
                            }
                            break;
                        case 2:
                            $state.go('app.hotelOrderList', {'appId': n});
                            break;
                        case 3:
                            if ($state.current.name !== 'app.shop.goods.goodsList') {
                                $state.go('app.shop', {'appId': n});
                            }
                            break;
                        case 4:
                            if(!$state.includes('app.video')){
                                $state.go('app.video', {'appId': n});
                            }
                            break;
                        case 5:
                            if (!$state.includes("app.user")) {
                                $state.go('app.user', {'appId': n});
                            }
                            break;
                        case 6:
                            $state.go('app.terminal', {'appId': n});
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
                            break;
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
                        $scope.app.maskUrl = url;
                        $scope.app.showMaskClass = true;
                    } else {
                        $scope.app.maskUrl = '';
                        $scope.app.showMaskClass = false;
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
                    self.gotoPage('uploadList');

                    // 弹窗层
                    self.maskUrl = '';
                    self.maskParams = {};

                    // 初始化上传列表对象
                    self.uploadList = new UploadLists();


                }

                self.gotoPage = function (pageName) {
                    // 上传列表页
                    if (pageName == 'uploadList') {
                        // 上传页面不是第一次加载
                        if (self.uploadListUrl !== '') {

                        }
                        // 第一次加载上传页面
                        else {
                            self.uploadListUrl = 'pages/uploadList.html';
                        }
                        self.showUploadList = true;
                    }

                    //其他页
                    else {
                        self.showUploadList = false;
                        $state.go(pageName);
                    }


                }

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                }

                self.upload = function () {
                    self.maskUrl = "pages/addMovie.html";
                }

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

        .controller('transcodingListController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                console.log('transcodingListController')
                var self = this;
                self.init = function () {
                    // 隐藏上传列表
                    $scope.app.showUploadList = false;
                    self.getTranscodeTaskList();
                }

                //  获取正在转码的列表
                self.getTranscodeTaskList = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTranscodeTaskList",
                        "status": "working"
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
                    $state.reload('app.video.transcodingList');
                }
            }
        ])

        .controller('notEditedListController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                console.log('notEditedListController')
                var self = this;
                self.init = function () {
                    // 隐藏上传列表
                    $scope.app.showUploadList = false;
                    self.getTranscodeTaskList();
                }

                self.add = function (task) {
                    $scope.app.maskUrl = "pages/addMovieInfo.html";
                    $scope.app.maskParams = task;
                }
                // 获取转码完成的列表
                self.getTranscodeTaskList = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getTranscodeTaskList",
                        "status": "Completed"
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
            }
        ])

        .controller('editedListController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                console.log('editedListController')
                var self = this;
                self.init = function () {
                    // 选中分类
                    $scope.arr = {};

                    $scope.arr.catrgoryArr = [];
                    $scope.arr.LocationArr = [];

                    self.defaultLang = util.getDefaultLangCode();
                    self.getTags();
                }

                self.edit = function (movieID) {
                    $scope.app.maskUrl = "pages/editMovieInfo.html";
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
                    self.getMovieList();
                }, true)

                self.getMovieList = function () {
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
                    $scope.app.maskUrl = "pages/addMoreMovie.html";
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

        .controller('addMovieController', ['$http', '$scope', '$state', '$stateParams', 'util',
            function ($http, $scope, $state, $stateParams, util) {
                console.log('addMovieController')
                var self = this;
                self.init = function () {

                }

                self.cancel = function () {
                    $scope.app.maskUrl = "";
                }


                self.add = function () {
                    $scope.app.uploadList.uploadFile($scope.myFileMovie, $scope.myFileSubtitle, $scope.app.uploadList);
                    $scope.app.maskUrl = "";
                }
            }
        ])

        .controller('addMovieInfoController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                console.log('addMovieInfoController')
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
                    self.getTags();
                }

                self.cancel = function () {
                    $scope.app.maskUrl = "";
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
                    $scope.app.maskUrl = "";
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
                    $scope.app.maskUrl = "";
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
                    $scope.app.maskUrl = "pages/addMusic.html";
                    // $scope.app.maskParams = { movieID: movieID };
                }

                self.editMusic = function (music) {
                    $scope.app.maskUrl = "pages/editMusic.html";
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
                    $scope.app.maskUrl = "";
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
                    $scope.app.maskUrl = "";
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

                    // 上传页面加载页面url
                    self.uploadListUrl = '';

                    // 不显示上传页面
                    self.showUploadList = false;

                    // 显示上传页面
                    self.gotoPage('uploadList');

                    // 弹窗层
                    self.maskUrl = '';
                    self.maskParams = {};

                    // 初始化上传列表对象
                    self.uploadList = new UploadLists();


                }

                self.gotoPage = function (pageName) {
                    // 上传列表页
                    if (pageName == 'uploadList') {
                        // 上传页面不是第一次加载
                        if (self.uploadListUrl !== '') {

                        }
                        // 第一次加载上传页面
                        else {
                            self.uploadListUrl = 'pages/uploadList.html';
                        }
                        self.showUploadList = true;
                    }

                    //其他页
                    else {
                        self.showUploadList = false;
                        $state.go(pageName);
                    }


                }

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                }

                self.upload = function () {
                    self.maskUrl = "pages/addMovie.html";
                }

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


})();
