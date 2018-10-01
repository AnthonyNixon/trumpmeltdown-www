var app = angular.module('trumpMeltdown', ['ngSanitize']);
app.controller('meltdownCtrl', function($scope, $http, $interval, Page, $window) {
    var needle;
    $scope.notMeltdownColor = "#00a900";
    $scope.meltdownColor = "#d90000";

    $scope.tweets = [];

    $scope.isMeltingDown = false;
    $scope.meltdownStatus = "not melting down";
    $scope.background = $scope.notMeltdownColor;
    $http({
        method: 'GET',
        url: 'https://storage.googleapis.com/trumpmeltdown-sentiments/latest'
    }).then(function successCallback(response) {
        console.log(response);
        data = response.data;
        console.log(data);

        var meltdownLevel = (1-(data.Average + 1.0)/2);
        $scope.meltdownLevel = meltdownLevel;

        if ($scope.meltdownLevel >= .5) {
            $scope.background = $scope.meltdownColor;
            $scope.meltdownStatus = "MELTING DOWN!!";
            $scope.isMeltingDown = true;
            Page.setTitle("Yes")
        } else {
            $scope.meltdownStatus = "not melting down";
            $scope.background = $scope.notMeltdownColor;
            $scope.isMeltingDown = false;
            Page.setTitle("Nope")
        }

        for (i = 0; i < data.NumTweets; i++) {
            console.log("yo");
            data.Tweets[i].visible = false;
            data.Tweets[i].Percent = (100 - ((data.Tweets[i].Sentiment + 1) * 50)).toFixed(0);
            $scope.tweets.push(data.Tweets[i]);
        }

        console.log("hi");
        console.log($scope.tweets);



        gtag('event', 'meltdown', {
            'event_category': 'meltdown-status',
            'event_label': $scope.isMeltingDown
        });

        updateGraph(data);
        needle.moveTo(meltdownLevel);

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    function updateGraph(data) {
        var numTweets = data.NumTweets - 1;
        var i = 0;
        // var total = 0;

        var animationInterval = $interval(function(){
            // Unshift will go in reverse order (Newest last)
            $scope.tweets[i].visible = true;
            // debugger;
            twttr.widgets.load();

            i++;
            if (i > numTweets) {
                $interval.cancel(animationInterval);
            }
        }, 250);
    }

    (function(){

        var barWidth, chart, chartInset, degToRad, repaintGauge,
            height, margin, numSections, padRad, percToDeg, percToRad,
            percent, radius, sectionIndx, svg, totalPercent, width;

        percent = 0.0;
        numSections = 1;
        sectionPerc = 1 / numSections / 2;
        padRad = 0.025;
        chartInset = 10;

        // Orientation of gauge:
        totalPercent = .75;

        el = d3.select('.chart-gauge');

        margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 20
        };

        width = el[0][0].offsetWidth - margin.left - margin.right;
        height = width;
        radius = Math.min(width, height) / 2;
        barWidth = 40 * width / 300;


        /*
         Utility methods
         */
        percToDeg = function(perc) {
            return perc * 360;
        };

        percToRad = function(perc) {
            return degToRad(percToDeg(perc));
        };

        degToRad = function(deg) {
            return deg * Math.PI / 180;
        };

        // Create SVG element
        svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

        // Add layer for the panel
        chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + ((height + margin.top) / 2) + ")");
        chart.append('path').attr('class', "arc chart-filled");
        chart.append('path').attr('class', "arc chart-empty");

        arc2 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
        arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

        repaintGauge = function (perc)
        {
            var next_start = totalPercent;
            arcStartRad = percToRad(next_start);
            arcEndRad = arcStartRad + percToRad(perc / 2);
            next_start += perc / 2;


            arc1.startAngle(arcStartRad).endAngle(arcEndRad);

            arcStartRad = percToRad(next_start);
            arcEndRad = arcStartRad + percToRad((1 - perc) / 2);

            arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);


            chart.select(".chart-filled").attr('d', arc1);
            chart.select(".chart-filled").attr('fill', 'black');
            chart.select(".chart-empty").attr('d', arc2);

        };


        var Needle = (function() {

            /**
             * Helper function that returns the `d` value
             * for moving the needle
             **/
            var recalcPointerPos = function(perc) {
                var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
                thetaRad = percToRad(perc / 2);
                centerX = 0;
                centerY = 0;
                topX = centerX - this.len * Math.cos(thetaRad);
                topY = centerY - this.len * Math.sin(thetaRad);
                leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
                leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
                rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
                rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
                return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
            };

            function Needle(el) {
                this.el = el;
                this.len = width / 3;
                this.radius = this.len / 6;
            }

            Needle.prototype.render = function() {
                this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
                return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0));
            };

            Needle.prototype.moveTo = function(perc) {
                var self,
                    oldValue = (this.perc) ? this.perc : 0;

                this.perc = perc;
                self = this;


                this.el.transition().ease('bounce').duration(1500).select('.needle').tween('progress', function() {
                    return function(percentOfPercent) {
                        var progress = oldValue + (percentOfPercent * (perc - oldValue));

                        repaintGauge(progress);
                        return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                    };
                });

            };

            return Needle;

        })();

        needle = new Needle(chart);
        needle.render();

        needle.moveTo(percent);

    })();

    $scope.gotoTweet = function(tweetID) {
        $window.open('https://twitter.com/realDonaldTrump/status/' + tweetID, '_blank');
    };

    $scope.formatNumber = function(i) {
        return i;
    };
});

app.controller('titleCtrl', function($scope, Page) {
    $scope.Page = Page;
    Page.setTitle("maybe")
});

app.factory('Page', function() {
    var title = 'default';
    return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle }
    };
});