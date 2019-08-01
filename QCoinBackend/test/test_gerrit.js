var assert = require('assert');
var gerrit = require("../utils/gerrit");

describe('GerritUtil', function () {
    describe('# getUserInfo', function () {
        it('when the cookie provided is correct', function (done) {
            gerrit.getUserInfo("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG", function (userInfo) {
                if (userInfo)
                    done();
            })
        });
        it('when the cookie provided is false', function (done) {
            gerrit.getUserInfo("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-Y1", function (userInfo) {
                if (userInfo === null)
                    done();
            })
        });

    });
    describe('# getAllMergedList', function () {
        it('when the cookie provided is correct', function (done) {
            gerrit.getAllMergedList("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG", function (list) {
                if (list)
                    done();
            })
        });
        it('when the cookie provided is false', function (done) {
            gerrit.getAllMergedList("GerritAccount=aQ4bfeivdnTJq5u21313pYJ-Y1", function (list) {
                if (list === null)
                    done();
            })
        });

    });
    describe('# getChangeDetail', function () {
        it('when the cookie provided is correct', function (done) {
            gerrit.getChangeDetail("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG", 503014, function (detail) {
                if (detail)
                    done();
            })
        });
        it('when the cookie provided is false', function (done) {
            gerrit.getChangeDetail("GerritAccount=aQ4bfeivdnTJq5u21313pYJ-Y1", 503014, function (detail) {
                if (detail === null)
                    done();
            })
        });
        it('when the change Id is invaild', function (done) {
            gerrit.getChangeDetail("GerritAccount=aQ4bfeivdnTJq5u21313pYJ-Y1", 5030140, function (detail) {
                if (detail === null)
                    done();
            })
        });


    });
    describe('# getHistory', function () {
        it('when the cookie provided is correct', function (done) {
            this.timeout(15000);
            gerrit.getHistory("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG", function (detail) {
                if (detail)
                    done();
            })
        });
        it('when the cookie provided is false', function (done) {
            gerrit.getHistory("GerritAccount=aQ4bfeivdnTJq5u21313pYJ-Y1", function (detail) {
                if (detail === null)
                    done();
            })
        });


    });
    describe('# getChanges', function () {
        it('all the change ids are correct', function (done) {
            gerrit.getChanges([503014, 503013], function (detail) {
                assert(detail.length === 2);
                done();
            })
        });
        it('change Ids with duplicates', function (done) {
            gerrit.getChanges([503014, 503013,503014], function (detail) {
                assert(detail.length === 2);
                done();
            })
        });
        it('change Ids with wrong ids', function (done) {
            gerrit.getChanges([503014, 503013,5011111111,2233231,503014], function (detail) {
                assert(detail.length === 2);
                done();
            })
        });

    });


});