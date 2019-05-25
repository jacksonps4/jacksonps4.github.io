require.config({
    'paths': {
        'angular': '/common/js/angular.min',
        'jquery': '/common/js/jquery-2.1.0',
        'bootstrap': '/common/js/bootstrap',
        'common': '/common/js',
    },
    'shim': {
        'angular': {
            'exports': 'angular'
        }
    },
    'deps': ['angular', 'app-module'],
    'callback': function(angular, module) {
        angular.bootstrap(document, [module.name]);
    }
});
