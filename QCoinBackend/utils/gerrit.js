var request = require("request");
request = request.defaults({
    jar: true, forever: true, headers: {
        'connection': 'keep-alive'
    }
});//enable cookie

/**
 * @class GerritUtil
 * @classdesc the Gerrit Util
 */
class GerritUtil {
    /**
     * @method
     * @param {string} jsonStr - json string return from gerrit response
     * @returns {Object} the object
     */
    static parseJson(jsonStr) {
        //console.log(jsonStr.substr(5));
        return JSON.parse(jsonStr.substr(5))
    }

    /**
     * @method
     * @param {string} userCookie - the user's cookie
     * @param {function(Object)} callback
     * @desc get the user's gerrit info by his gerrit cookie
     */
    static getUserInfo(userCookie, callback) {
        let j = request.jar();
        let cookie = request.cookie(userCookie);
        let url = "https://gerrit-gfx.intel.com/accounts/self";
        j.setCookie(cookie, url);
        request.get({
            url: url,
            jar: j,
            forever: true
        }, function (err, resp, body) {
            if (err)//network connection error
                callback(undefined);
            else {
                try {//vaild cookie
                    console.log("1111"+body);
                    callback(GerritUtil.parseJson(body));
                } catch (e) {//wrong cookie
                    callback(null);
                }
            }
        });
    }

    /**
     * @method
     * @param {string} userCookie - the user's cookie
     * @param {string} startDay -
     * @param {string} endDay -
     * @param {function(Object)} callback
     * @desc get all merged list from gerrit
     */
    static getAllMergedList(userCookie, startDay, endDay, callback) {
        let j = request.jar();
        let cookie = request.cookie(userCookie);
        let url = `https://gerrit-gfx.intel.com/changes/?q=status:merged+project:gfx/products/gfx-driver+branch:comp/media+after:"${startDay}"+before:"${endDay}"`;
        j.setCookie(cookie, url);
        request.get({
            url: url,
            jar: j,
            forever: true
        }, function (err, resp, body) {
            console.log("2222"+body);
            let list = GerritUtil.parseJson(body);
            callback(list.length === 0 ? null : list);//return null if cookie is wrong

        });
    }

    /**
     * @method
     * @param {string} userCookie - the user's cookie
     * @param {number} changeId
     * @param {function(Object)} callback
     * @desc get the change detail from change id
     */
    static getChangeDetail(userCookie, changeId, callback) {
        let j = request.jar();
        let cookie = request.cookie(userCookie);
        let url = "https://gerrit-gfx.intel.com/a/changes/" + changeId + "/detail/?o=ALL_REVISIONS&o=ALL_FILES";
        j.setCookie(cookie, url);
        request.get({
            url: url,
            jar: j,
            forever: true
        }, function (err, resp, body) {
            try {
                console.log("3333"+body);
                callback(GerritUtil.parseJson(body))

            } catch (e) {
                callback(null);
            }
        });
    }

    /**
     * @method
     * @param {string} userCookie - the user's cookie
     * @param {string} dayStart -
     * @param {string} dayEnd -
     * @param {function(Object)} callback
     * @desc get the user's code-review history by his cookie
     */
    static getHistory(userCookie, dayStart, dayEnd, callback) {
        let j = request.jar();
        let cookie = request.cookie(userCookie);
        let url = `https://gerrit-gfx.intel.com/a/changes/?q=NOT label:Code-Review=0,user=self+status:merged+after:"${dayStart}"+before:"${dayEnd}"&o=DETAILED_LABELS`;
        j.setCookie(cookie, url);
        request.get({
            url: url,
            jar: j,
            forever: true
        }, function (err, resp, body) {
            try {//cookie is correct
                console.log("4444"+body);
                callback(GerritUtil.parseJson(body))
            } catch (e) {//cookie is wrong
                callback(null);
            }
        });
    }

    /**
     * @method
     * @param {array<number>} changeIds - the array change id
     * @param {function(Object)} callback
     * @desc change details by given change ids, only pass the valid ones and remove duplicates
     */
    static getChanges(changeIds, callback) {
        let changeIds_ = Array.from(new Set(changeIds));//remove duplicates
        let count = 0;
        let changes = [];
        changeIds_.forEach(async (changeId) => {
            GerritUtil.getChangeDetail("GerritAccount=aOusfmo39iG.SvSziXhqelKlrzY4e-9L", changeId, function (change) {
                if (change) {//only valid ones
                    let reviews = [];
                    change['labels']['Code-Review']['all'].forEach(review => {
                        if (review['value'] !== 0) {
                            reviews.push({value: review.value, userId: review._account_id})
                        }
                    });
                    if (reviews.length > 0)
                        changes.push({changeId: changeId, reviews: reviews});
                }
                count++;
                if (count === changeIds_.length)
                    callback(changes)

            })
        })
    }

    /**
     * @method
     * @param {number} timeBefore - time before in seconds
     * @param {function(array)} callback - pass the recent changes
     * @desc fetch recent changes on gerrit  {timeBefore} seconds ago
     */
    static fetchRecent(timeBefore, callback) {
        let now = new Date();
        now.setSeconds(now.getSeconds() - timeBefore);
        let startTimeStr = now.toISOString().slice(0, -1).replace('T', ' ');
        let j = request.jar();
        let cookie = request.cookie("GerritAccount=aOusfmo39iG.SvSziXhqelKlrzY4e-9L");
        let url = `https://gerrit-gfx.intel.com/a/changes/?q=status:merged+project:gfx/products/gfx-driver+branch:comp/media+after:"${startTimeStr}"&o=DETAILED_LABELS`;
        console.log(url);
        j.setCookie(cookie, url);
        request.get({
            url: url,
            jar: j,
            forever: true
        }, function (err, resp, body) {
            console.log("5555"+body+cookie);
            let bodyList =[];
            if (body!="Unauthorized" && body!=undefined)
                bodyList = GerritUtil.parseJson(body);
            else bodyList = [];
            let changes = [];
            bodyList.forEach(change => {
                let changeId = change._number;
                let reviews = [];
                change['labels']['Code-Review']['all'].forEach(review => {
                    if (review['value'] !== 0) {
                        reviews.push({value: review.value, userId: review._account_id})
                    }
                });
                if (reviews.length > 0)
                    changes.push({changeId: changeId, reviews: reviews})
            });
            callback(changes);
        });
    }

    /**
     *
     * @param {string} commitHash - the sha1 commit hash of git commit
     */
    static getChangeByCommitHash(commitHash) {
        let j = request.jar();
        let cookie = request.cookie("GerritAccount=aOusfmo39iG.SvSziXhqelKlrzY4e-9L");
        //let cookie = request.cookie("GerritAccount=aOusfmxWLJbHP8f6VzjIPDnXDggWVv4W");
        let url = `https://gerrit-gfx.intel.com/a/changes/?q=commit:${commitHash}&o=DETAILED_LABELS`;
        j.setCookie(cookie, url);
        return new Promise(function (resolve, reject) {
            request.get({
                url: url,
                jar: j,
                forever: true
            }, function (err, resp, body) {
                try {
                    console.log("6666"+body);
                    resolve(GerritUtil.parseJson(body))
                } catch (e) {
                    
                    reject(e);
                }
            });
        });

    }
}
/*
GerritUtil.getChangeByCommitHash("26c2a2ac65917a46558c00370c9fd451a597df6a", result => {
    console.log(result);
})*/
/*
request.post({
    url: "https://gerrit-gfx.intel.com/login/%23%2Fq%2Fstatus%3Aopen",
    form: {username: 'nluo', password: 'pass@890'}
}, function (err, resp, body) {
    try {
        let codeReviews = JSON.parse(body.substr(5)).labels['Code-Review'].all;
        let l = [];
        codeReviews.forEach(codeReview => {
            if (codeReview.value !== 0)
                l.push(codeReview)
        });
        if (l.length > 1)
            console.log(i, l)
    } catch (e) {

    }


})
*/
/*
var j = request.jar();
var cookie = request.cookie('GerritAccount=aTOeff7WwWJQJd051eTt8kF60SMjGTYj; XSRF_TOKEN=aTOefa-MfHN8258E88bCh7nc2RMxUilZ');
j.setCookie(cookie, "https://gerrit-gfx.intel.com/changes/?q=reviewer:self");
console.log(j);
request.get({
    url: "https://gerrit-gfx.intel.com/changes/?q=reviewer:self",
    jar: j,
}, function (err, resp, body) {
    console.log(body)
});*/
/*
request.get("https://gerrit-gfx.intel.com/a/changes/?q=reviewer:self", function (err, resp, body) {
    console.log(resp.headers)
}).auth("nluo", "pass@890", true);*/
/*
request.post({
    url: "https://gerrit-gfx.intel.com/login/%23%2Fq%2Fstatus%3Aopen",
    form: {username: 'nluo', password: 'pass@890'}
}, function (err, resp, body) {
    let cookieLogin = resp.headers['set-cookie'][0].split(';')[0];
    var j = request.jar();
    var cookie = request.cookie(cookieLogin);
    j.setCookie(cookie, "https://gerrit-gfx.intel.com/accounts/self");
    let url = "https://gerrit-gfx.intel.com/accounts/self";//"https://gerrit-gfx.intel.com/changes/?q=reviewer:self",
    request.get({
        url: url,
        jar: j,
    }, function (err, resp, body) {
        console.log(body)
    });

});*/


module.exports = GerritUtil;
