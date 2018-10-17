var app = angular.module('trumpMeltdown', ['ngSanitize']);
app.controller('meltdownCtrl', function($scope, $http, $interval, Page, $window) {
    getNewTweet();

    $scope.gotoTweet = function(tweetID) {
        $window.open('https://twitter.com/realDonaldTrump/status/' + tweetID, '_blank');
    };

    $scope.formatNumber = function(i) {
        return i;
    };

    function getNewTweet() {
        console.log("Getting new tweet...");
        $http({
            method: 'GET',
            url: 'https://us-central1-ajnhosting-163818.cloudfunctions.net/get-tweet-to-vote'
        }).then(function successCallback(response) {
            console.log(response);
            $scope.tweet = response.data[0];
            $scope.tweet.embedHTML = String.fromCharCode.apply(null, new Uint16Array(response.data[0].html.data));
            console.log($scope.tweet);
            twttr.widgets.load();
            $scope.loading = false;

            setTimeout(function() {
                twttr.widgets.load();
            }, 1);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    function getNewTweetExclude(exclude) {
        console.log("Getting new tweet...");
        $http({
            method: 'GET',
            url: 'https://us-central1-ajnhosting-163818.cloudfunctions.net/get-tweet-to-vote?exclude=' + exclude
        }).then(function successCallback(response) {
            console.log(response);
            $scope.tweet = response.data[0];
            $scope.tweet.embedHTML = String.fromCharCode.apply(null, new Uint16Array(response.data[0].html.data));
            console.log($scope.tweet);
            twttr.widgets.load();
            $scope.loading = false;

            setTimeout(function() {
                twttr.widgets.load();
            }, 1);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    // $scope.$watch('tweet', function(){
    //     console.log("yo");
    //     twttr.widgets.load();
    // }, true)
    var voteURL = "https://us-central1-ajnhosting-163818.cloudfunctions.net/vote-on-tweet";
    $scope.voteYes = function() {
        $scope.loading = true;
        var voteData = {};
        voteData.id = $scope.tweet.id;
        voteData.vote = "meltdown";
        getNewTweetExclude(voteData.id);
        $http.post(voteURL, voteData)
            .then(
                function(response){
                    console.log("Vote Submitted. ", response)
                },
                function(response){
                    console.log("Vote failed. ", response)
                }
            );
    };

    $scope.voteNo = function() {
        $scope.loading = true;
        var voteData = {};
        voteData.id = $scope.tweet.id;
        voteData.vote = "not-meltdown";
        getNewTweetExclude(voteData.id);
        $http.post(voteURL, voteData)
            .then(
                function(response){
                    console.log("Vote Submitted. ", response)
                },
                function(response){
                    console.log("Vote failed. ", response)
                }
            );
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