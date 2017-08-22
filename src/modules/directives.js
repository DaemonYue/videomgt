'use strict';

(function () {
    var app = angular.module('app.directives', [])

        .directive('fileModel', ['$parse', 'CONFIG', function ($parse, CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    // debugger;
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            // console.log(scope)
                            // console.log(element[0].files[0])
                            modelSetter(scope, element[0].files[0]);
                        });
                        if (attrs.e != 'none') {
                            // 自动点击id为该名称的按钮
                            document.getElementById(attrs.e).click();
                        }
                    });
                }
            };
        }])

        //音量的拖动框
        .directive('stepper', function ($document) {
            return {
                restrict: 'AE',
                template: '<style>.stepper-box{width:500px;height:10px;background:#f5f5f5;text-align:left;border-radius: 3px}.step-progress{float:left;height:10px;background:#198ad1;border-radius: 3px 0 0 3px}.step-progress ~ button{padding:10px 10px;margin-top:-5px;position:absolute; border-radius: 50%;border:none;margin-left: -3px;background:radial-gradient(#fff 0%, #198ad1 50%)}</style><div class="stepper-box">' +
                '<div class="step-progress" ng-style="currentPos()"></div><button ng-click="currentPos()"><span>' + '' + '</span></button></div>',
                controller: function ($scope) {
                    $scope.currentStep = 0;
                    $scope.maxStep = 0;

                    $scope.changePos = function (val) {
                        if (val >= 0 && val <= $scope.maxStep && val !== $scope.currentStep) {
                            $scope.currentStep = val;
                            $scope.$emit('changePos', val);
                        }
                    }
                },
                link: function (scope, ele, attrs) {

                    scope.maxStep = attrs['maxstep'] || 10;

                    var allWidth = ele.children()[1].offsetWidth;
                    attrs.$observe('currentstep', function (val) {
                        scope.currentStep = val || 10;

                    });
                    scope.currentPos = function (val) {
                        return {width: scope.currentStep * 100 / scope.maxStep + '%'};
                    };
                    scope.currentStep = 2;
                    ele.on('click', function (evt) {
                        var targer = evt.target;
                        if (targer.nodeName.toLowerCase() == 'button') return;
                        var clickL = evt.offsetX || evt.layerX;

                        scope.$apply(function () {
                            scope.changePos(Math.round(clickL / allWidth * scope.maxStep))
                        })

                    });
                    var oButton = ele.find('button');
                    var oProgress = ele.children().find('div');
                    var value;
                    var dragging;
                    oButton.on('mousedown', function (evt) {
                        dragging = true;
                        ele.on('mousemove', function (evt) {
                            if (dragging) {
                                var mouseL = evt.clientX - ele[0].getBoundingClientRect().left;
                                var temp = Math.round(mouseL / allWidth * scope.maxStep);

                                if (temp >= 0 && temp <= scope.maxStep) {
                                    oProgress.css('width', mouseL + 'px');
                                    value = temp;
                                }
                            }
                        });
                        $document.on('mouseup', function () {
                            if (dragging) {
                                scope.changePos(value);
                                scope.$digest();
                            }
                            dragging = false;
                        });
                        evt.preventDefault();
                    })
                }
            }
        })

        //发布时终端列表
        .directive('termList', function ($document) {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                template: '<ul ng-init="getTermList()">'
                + '<li><input type="checkbox" ng-model="checkall" ng-change="checkHospital(this)"><span></span><h4>{{hospital.SectionName[defaultLang]}}</h4></div>'
                + '<ul ng-repeat="sec in sections">'
                + '<li><input type="checkbox" ng-model="checksection[sec.SectionID]" ng-change="checkSection(sec, sec.SectionID)"><span></span><h4>{{sec.SectionName[defaultLang]}}</h4></div>'
                + '<ul>'
                + '<li ng-repeat="ter in term[sec.SectionID]"><input type="checkbox" ng-model="check[ter.ID]" ng-change="changeCheck(sec, ter)"><h4>{{ter.IP}}</h4></div>'
                + '</ul>'
                + '</ul>'
                + '</ul>',
                controller: function ($scope) {
                    $scope.conveyCheck = function (val) {
                        $scope.$emit('conveyCheck', val);
                    }
                },
                link: function (scope, element, attrs) {

                    //点击终端选择框
                    scope.changeCheck = function (sec, term) {
                        scope.checkbox = [];
                        var secId;
                        /*    if(a.check){
                         for(var q in a.check){
                         scope.checkbox.push(q);
                         }
                         }
                         scope.checkbox = [];
                         var exist = false;
                         for (var i in a.check) {   //获取当前的box 的key
                         for (var j in scope.checkbox) {
                         if (i == scope.checkbox[j]) {
                         if(a.check[i] == false){
                         scope.checkbox.pop(j);
                         scope.conveyCheck(scope.checkbox);
                         }
                         exist = true;
                         }
                         }
                         if(!exist){
                         scope.checkbox.push(i);
                         scope.conveyCheck(scope.checkbox);
                         }
                         }*/
                        for (var i in scope.check) {
                            if (scope.check[i] == true) {
                                scope.checkbox.push(i);
                            }
                        }
                        scope.conveyCheck(scope.checkbox);
                        if (!sec) {
                            return
                        }
                        ;
                        var lens = scope.sections.length;
                        for (var j = 0; j < lens; j++) {
                            if (sec.SectionID == scope.sections[j].SectionID) {
                                secId = j;
                            }
                        }
                        var lend = sec.Dev.length;
                        scope.sections[secId].termChooseNum = 0;
                        for (var q = 0; q < lend; q++) {
                            for (var w in scope.check) {
                                if (sec.Dev[q].ID == w) {
                                    if (scope.check[w] = true) {
                                        scope.sections[secId].termChooseNum++;
                                    }
                                }
                            }
                        }
                        check(scope.sections);


                    };

                    //点击医院选择框
                    scope.checkHospital = function (a) {
                        scope.checksection = {};
                        var len = a.sections.length;

                        if (a.checkall == true) {
                            for (var i = 0; i < len; i++) {
                                var s = a.sections[i].SectionID
                                scope.checksection[s] = true;
                                scope.checkSection(a.sections[i], a.sections[i].SectionID);
                            }
                        } else {
                            for (var j = 0; j < len; j++) {
                                var w = a.sections[j].SectionID
                                scope.checksection[w] = false;
                                scope.checkSection(a.sections[j], a.sections[j].SectionID);
                            }
                        }

                    };

                    //点击科室选择框
                    scope.checkSection = function (b, a) {
                        var term = scope.term[a];
                        var len = term.length;
                        if (!scope.checksection) {
                            return;
                        }
                        //var lens = scope.checksection.length;
                        for (var q in scope.checksection) {
                            if (q == b.SectionID) {
                                if (scope.checksection[q]) {
                                    for (var i = 0; i < len; i++) {
                                        var s = term[i].ID;
                                        scope.check[s] = true;
                                    }
                                    scope.changeCheck()
                                } else {
                                    for (var j = 0; j < len; j++) {
                                        var w = term[j].ID;
                                        scope.check[w] = false;
                                    }
                                    scope.changeCheck()
                                }
                            }
                        }
                    };

                    //获取选中的终端
                    scope.$on('sectionState', function (evt, val) {
                        check(val);
                    });

                    //判断全选
                    var check = function (val) {
                        scope.checksection = {};
                        scope.choosesection = 0;
                        var len = val.length;

                        for (var i = 0; i < len; i++) {
                            if (val[i].termChooseNum == val[i].Dev.length && val[i].termChooseNum != 0) {
                                var s = val[i].SectionID;
                                scope.checksection[s] = true;
                            }
                        }
                        for (var j in scope.checksection) {
                            scope.choosesection++;
                        }
                        if (scope.choosesection == len) {
                            scope.checkall = true;
                        }
                    }
                }
            }
        })

        //获得焦点事件
        .directive('ngFocus', ['$parse', 'CONFIG', function ($parse, CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var model = $parse(attrs.ngFocus);
                    var l = model.assign;

                }
            };
        }])
})();