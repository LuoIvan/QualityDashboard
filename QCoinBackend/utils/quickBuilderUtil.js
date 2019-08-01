var request = require("request");
request = request.defaults({
    jar: true, forever: true, headers: {
        'connection': 'keep-alive'
    }
});//enable cookie
var parseString = require('xml2js').parseString;

/**
 * @class QuickBuildUtil
 * @classdesc
 */
class QuickBuildUtil {
    /**
     * getBuilds
     * @param {object} params
     * @param {number} params.count count of builds to fetch
     * @param {string} [params.from_date] YYYY-MM-DD
     * @param {function(Object)} callback
     */
    static getBuilds(params, callback) {
        let returnValues = [];
        let queryString = "";
        Object.keys(params).forEach(key => {
            queryString += `${key}=${params[key]}&`
        });
        queryString = queryString.slice(0, -1)

        request.get(`http://ubit-gfx.intel.com/rest/builds?configuration_id=17188&${queryString}`,
            function (err, resp, body) {
                parseString(body, {explicitArray: false}, function (err, results) {
                    results.list['com.pmease.quickbuild.model.Build'].forEach(result => {
                        returnValues.push({
                            id: result.id,
                            version: result.version,
                            status: result.status,
                            beginDate: result.beginDate
                        })
                    })
                    callback(returnValues)

                });

            }).auth("nluo", "pass@890")
    }

    /**
     * getBuild
     * @param id
     */
    static getBuild(id) {
        request.get(`http://ubit-gfx.intel.com/rest/builds/${id}`,
            function (err, resp, body) {
                //console.log(body);
            }).auth("nluo", "pass@890")
    }
}

//QuickBuildUtil.getBuild(5743818);
module.exports = QuickBuildUtil;
