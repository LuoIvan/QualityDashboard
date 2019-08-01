var request = require("request");
request = request.defaults({
    jar: true, forever: true, 'proxy': 'http://proxy01.cd.intel.com:911', headers: {
        'User-Agent': 'Qcoin',
        'connection': 'keep-alive'

    }
});//enable cookie

/**
 * @class GithubUtil
 * @classdesc
 */
class GithubUtil {
    /**
     * getPullRequests
     * @param {object} params
     * @param {string} [params.state] state of pr, Either open, closed, or all to filter by state. Default: open
     * @param {number} [params.per_page] count of result
     * @param {function(Object)} callback
     */
    static getPullRequests(params, callback) {
        let returnValues = [];
        let queryString = "";
        Object.keys(params).forEach(key => {
            queryString += `${key}=${params[key]}&`
        });
        queryString = queryString.slice(0, -1);
        request.get("https://api.github.com/repos/intel/media-driver/pulls?" + queryString,
            function (err, resp, body) {

                let results = JSON.parse(body);
                results.forEach(result => {
                    returnValues.push({
                        title: result.title,
                        state: result.state,
                        created: result.created_at,
                        updated: result.updated_at,

                    })
                })
                callback(returnValues)

            }).auth('LuoIvan', 'pass@123')
    }
}

module.exports = GithubUtil;
