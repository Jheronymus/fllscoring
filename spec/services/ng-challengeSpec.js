describe('ng-challenge',function() {
    var ngServices = factory('services/ng-services');
    var challenge, q;

    var dummyChallenge = {foo:'bar'};

    var fsMock, settingsMock, remotehostMock,$q,$rootScope;
    fsMock = createFsMock({'foo': JSON.stringify(dummyChallenge)});

    var module = factory('services/ng-challenge',{
        'services/ng-services': ngServices,
        'services/log': logMock,
        'services/fs': fsMock
    });

    beforeEach(function() {
        angular.mock.module(module.name);
        angular.mock.module(function($provide) {
            $provide.service('$settings', function($q) {
                settingsMock = createSettingsMock($q, {});
                return settingsMock;
            });
            $provide.service('$remotehost', function($q) {
                remotehostMock = createRemotehostMock($q);
                return remotehostMock;
            });
        });
        angular.mock.inject(function($challenge,_$q_,_$rootScope_) {
            challenge = $challenge;
            $q = _$q_;
            $rootScope = _$rootScope_;
        });
    });

    describe('getDependencies',function() {
        it('should resolve the arguments of a function',function() {
            var deps = challenge.getDependencies(function(foo,bar,baz) {});
            expect(deps).toEqual(['foo','bar','baz']);
        });

        it('should resolve the arguments of a function with no arguments',function() {
            var deps = challenge.getDependencies(function() {});
            expect(deps).toEqual([]);
        });
    });

    describe('load',function() {
        it('should load, then init',function(done) {
            challenge.init = jasmine.createSpy('init').andReturn(42);
            challenge.load('foo').then(function() {
                expect(challenge.init).toHaveBeenCalledWith(dummyChallenge);
                done();
            });
            $rootScope.$digest();
        });

        it('when failing, it should load from remote, then init',function() {
            fsMock.read.andReturn($q.reject());
            remotehostMock.readChallenge.andReturn($q.when(dummyChallenge));
            challenge.init = jasmine.createSpy('init').andReturn(42);
            challenge.load('bar').then(function() {
                expect(remotehostMock.readChallenge).toHaveBeenCalled();
                expect(challenge.init).toHaveBeenCalledWith(dummyChallenge);
            });
            $rootScope.$digest();
        });

        it('when failing from remote, it should log an error',function() {
            fsMock.read.andReturn($q.reject());
            remotehostMock.readChallenge.andReturn($q.reject('aargh'));
            challenge.load('bar').then(function() {
                expect(logMock).toHaveBeenCalledWith('error getting field');
            });
            $rootScope.$digest();
        });
    });

    describe('init',function() {
        it('should prepare the challenge',function() {
            var field = {
                missions: [{
                    id: 'test',
                    objectives: [{
                        id: 'moo',
                    }]
                }]
            };
            var res = challenge.init(field);

            expect(res.field).toEqual(field);
            expect(res.missions).toEqual([{objectives:[{id:'moo'}],id:'test'}]);
            expect(res.objectiveIndex).toEqual({moo: {id:'moo'}});
        });
    });
});
