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
        .directive('stepper', function ($document) {
            return {
                restrict: 'AE',
                template: '<style>.stepper-box{width:500px;height:10px;background:#f5f5f5;text-align:left;border-radius: 3px}.step-progress{float:left;height:10px;background:#198ad1;border-radius: 3px 0 0 3px}.step-progress ~ button{padding:10px 10px;margin-top:-5px;position:absolute; border-radius: 50%;border:none;margin-left: -3px;background:radial-gradient(#fff 0%, #198ad1 50%)}</style><div class="stepper-box">' +
                '<div class="step-progress" ng-style="currentPos()"></div><button ng-click="currentPos()"><span>'+''+'</span></button></div>',
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

                    })
                    scope.currentPos = function (val) {
                        return {width: scope.currentStep * 100 / scope.maxStep + '%'};
                    }
                    scope.currentStep = 2;
                    ele.on('click', function (evt) {
                        var targer = evt.target;
                        if (targer.nodeName.toLowerCase() == 'button') return;
                        var clickL = evt.offsetX || evt.layerX;

                        scope.$apply(function () {
                            scope.changePos(Math.round(clickL / allWidth * scope.maxStep))
                        })

                    })
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
                        })
                        evt.preventDefault();
                    })
                }
            }
        })

})();