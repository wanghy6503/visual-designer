App.controller('AppCtrl', function ($rootScope, $location, $scope, Idle, keepAliveResource, authentication, notifications, $state, urlStateTracker) {
	$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
        //console.log('on $routeChangeError');
        if ( rejection == "AUTHENTICATION_ERROR" ) {
			console.log("AUTHENTICATION_ERROR");
			$location.path("/login");
		} else {
			$rootScope.rvdError = rejection;
		}
    });

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
	    //console.log("switching states: " + fromState.name + " -> " + toState.name);
	    $rootScope.rvdError = undefined;
	});

	$rootScope.$on('$stateChangeError',  function(event, toState, toParams, fromState, fromParams, error){
	    console.log("Error switching state: " + fromState.name + " -> " + toState.name);
	    // see AuthService.checkAccess() for error definitions
	    if (error == "NEED_LOGIN") {
    	    event.preventDefault();
    	    urlStateTracker.remember($location);
	        $state.go('root.public.login');
	    }
	    else
	    if (error == "RVD_ACCESS_OUT_OF_SYNC") {
		    event.preventDefault();
            notifications.put({type:'danger', message:'Internal error. RVD authentication is out of sync.'});
	        $state.go('root.public.login');
	    } else
	    if (error == "UNSUPPORTED_AUTH_TYPE") {
		    event.preventDefault();
            $state.go('root.public.login')
	    } else
	    if (error == "ProjectNotFound") {
	        notifications.put({type:'danger', message:'Project not found.'});
	    } else
	    if (error == "IncompatibleProjectVersion") {
	        notifications.put({type:'warning', message:'Incompatible project version'});
	    } else
	    if (error == "GenericServerError") {
	         notifications.put({type:'danger', message:'Unknown error occured'});
	    }
	});

	// --- ngIdle configuration

    $scope.events = [];
    // the user appears to have gone idle
    $scope.$on('IdleStart', function() {
    });
    // follows after the IdleStart event, but includes a countdown until the user is considered timed out
    // the countdown arg is the number of seconds remaining until then.
    // you can change the title or display a warning dialog from here.
    // you can let them resume their session by calling Idle.watch()
    $scope.$on('IdleWarn', function(e, countdown) {
        if (countdown == 15)
            notifications.put({type:"warning", message:"You appear idle. Your session will soon expire!"});
    });
    // the user has timed out (meaning idleDuration + timeout has passed without any activity)
    // this is where you'd log them
    $scope.$on('IdleTimeout', function() {
        authentication.doLogout();
        // store current url to return to after login
        urlStateTracker.remember($location);
        $state.go('root.public.login');
        notifications.put({type:"danger", message:"Your session has expired!", timeout:0});
    });
    // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
    $scope.$on('IdleEnd', function() {
    });
    $scope.$on('Keepalive', function() {
        keepAliveResource.get(null, function (response) {
            // do nothing
        }, function (response) {
            if (response.status == 401) {
                console.log("User not logged in. No more keepalives will be sent.");
                Idle.unwatch();
            }
        });
    });
});

angular.module('Rvd').controller('designerMainmenuCtrl', function ($scope, $stateParams, project,$rootScope, designerService, projectSettingsService) {
	$scope.projectName = $stateParams.projectName;
	$scope.applicationSid = $stateParams.applicationSid;
    $scope.project = project;
    $scope.showGraph = false;

	$scope.getProjectSettings = function () {
		return projectSettingsService.getProjectSettings(); // returns a $resource that will be filled up automatically
	}
	$scope.toggleShowGraph = function () {
	    $scope.showGraph = !$scope.showGraph;
	    $rootScope.$broadcast("show-graph",{status: $scope.showGraph});
	}

    $scope.signalSavePressed = function() {
        $rootScope.$broadcast("save-project-clicked");
    }
    $scope.signalDownloadZip = function () {
        $rootScope.$broadcast("download-project-clicked");
    }
    $scope.signalShowProjectSettings = function () {
        $rootScope.$broadcast("show-project-settings-clicked");
    }
    $scope.signalShowWebTrigger = function  () {
        $rootScope.$broadcast("show-web-trigger-clicked");
    }
    $scope.startupNodeSet = function () {
        return designerService.startupNodeSet(project);
    }
    $scope.getStartUrl = function () {
        return designerService.getStartUrl($scope.applicationSid);
    }

});

angular.module('Rvd').controller('headerCtrl', function ($scope, $modal) {

    function settingsModalCtrl ($scope, $timeout, $modalInstance, settings, rvdSettings) {
		$scope.settings = settings;
		$scope.rvdSettings = rvdSettings;
		$scope.defaultSettings = rvdSettings.getDefaultSettings();

		$scope.ok = function () {
			rvdSettings.saveSettings($scope.settings).then(function () {
				$modalInstance.close($scope.settings);
			}, function () {
				notifications.put("Cannot save settings");
			});
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		// watch form validation status and copy to outside scope so that the OK
		// button (which is outside the form's scope) status can be updated
		$scope.watchForm = function (formValid) {
			$scope.preventSubmit = !formValid;
		}
	};

    $scope.showSettingsModal = function (settings) {
    		var modalInstance = $modal.open({
    		  templateUrl: 'templates/designerSettingsModal.html',
    		  controller: settingsModalCtrl,
    		  size: 'lg',
    		  resolve: {
    			settings: function (rvdSettings) {	return rvdSettings.refresh();}
    		  }
    		});

    		modalInstance.result.then(function (rvdSettings) {
    			//console.log(settings);
    			// $scope.settings
    		}, function () {
    		  // $log.info('Modal dismissed at: ' + new Date());
    		});
    }

});

var loginCtrl = angular.module('Rvd')
.controller('loginCtrl', function (authentication, $scope, $http, notifications, $location, urlStateTracker) {

	$scope.doLogin = function (username, password) {
	    notifications.clear();
		authentication.doLogin(username,password).then(function () {
		    var oldUrl = urlStateTracker.recall();
			$location.url(oldUrl ? oldUrl : "/home");
		}, function () {
			notifications.put({message:"Login failed", type:"danger"});
		})
	}
});

angular.module('Rvd').controller('projectLogCtrl', ['$scope', '$stateParams', 'projectLogService', 'notifications', function ($scope, $stateParams, projectLogService, notifications) {
	//console.log('in projectLogCtrl');
	$scope.projectName = $stateParams.projectName;
	$scope.applicationSid = $stateParams.applicationSid;
	$scope.logData = '';

	function retrieveLog() {
		projectLogService.retrieve().then(
			function (logData) {$scope.logData = logData;},
			function (result) {
				notifications.put({message:"Application log not available.", type:"warning"});
			}
		)
	}
	$scope.retrieveLog = retrieveLog;

	function resetLog() {
		projectLogService.reset().then(
			function () {$scope.logData = "";},
			function () {
				notifications.put({message:"Application log not available.", type:"warning"});
			}
		);
	}
	$scope.resetLog = resetLog;

	retrieveLog($scope.applicationSid);
}]);

App.controller('authMenuCtrl', function ($scope, authentication, $location, $modal, $q, $http, $state) {
	//$scope.authInfo = authentication.getAuthInfo();
	//$scope.username = authentication.getTicket(); //"Testuser@test.com";

	function logout() {
		authentication.doLogout();
		$state.go('root.public.login');
	}
	$scope.logout = logout;

});

App.controller('containerCtrl', function ($scope, authentication) {
    $scope.authInfo = authentication.getAuthInfo();
});

App.controller('translateController', function($translate, $scope) {
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
  };
  $scope.getCurrentLanguage = function () {
	return $translate.use();
  }
});

angular.module('Rvd').controller('wavManagerController', function ($rootScope, $scope, $http, $upload, notifications) {
	$scope.deleteWav = function (wavItem) {
		$http({url: 'services/projects/' + $scope.applicationSid + '/wavs?filename=' + wavItem.filename, method: "DELETE"})
		.success(function (data, status, headers, config) {
			console.log("Deleted " + wavItem.filename);
			throwRemoveWavEvent(wavItem.filename);
		}).error(function (data, status, headers, config) {
			console.log("Error deleting " + wavItem.filename);
		});
	}

	// File upload stuff for play verbs
	$scope.onFileSelect = function($files) {
		    // $files: an array of files selected, each file has name, size, and
			// type.
		    for (var i = 0; i < $files.length; i++) {
		      var file = $files[i];
		      $scope.upload = $upload.upload({
		        url: 'services/projects/' + $scope.applicationSid + '/wavs',
		        file: file,
		      }).success(function(data, status, headers, config) {
		        // file is uploaded successfully
		    	  console.log('file uploaded successfully');
		    	  $rootScope.$broadcast("mediafile-uploaded");
		      })
		      .progress(function () {})
		      .error( function (data,status) {
		        if (status == 400 && data && data.error == "FILE_EXT_NOT_ALLOWED")
		            notifications.put({message:"Media file not supported", type:"danger"});
		        if (status == 400 && data && data.error == "FILE_TOO_BIG")
		            notifications.put({message:"Media file is too big! Only files up to " + data.maxSize + " bytes allowed :-(", type:"danger"});
		        else
		            notifications.put({message:"Error uploading media file", type:"danger"});
		      });
		      // .then(success, error, progress);
		    }
	};

	function throwRemoveWavEvent(wavname) {
		$rootScope.$broadcast("project-wav-removed", wavname);
	}
});

angular.module('Rvd').controller('playStepController', function ($scope) {
	$scope.$on('project-wav-removed', function (event, data) {
		if ( data == $scope.step.local.wavLocalFilename )
			$scope.step.local.wavLocalFilename = "";
	});
});

angular.module('Rvd').controller('homeCtrl', function ($scope, RvdConfiguration) {
    $scope.ussdSupport = RvdConfiguration.ussdSupport;
});
