var request = require("request");
request = request.defaults({
    forever: true,
    headers: {
        'connection': 'keep-alive'
    }
});//enable cookie

/**
 * @class gitAnalysisUtil
 */
class gitAnalysisUtil {

    /**
     *
     * @param {string} category --
     * @param {string} type --
     * @param {string} period --
     * @param {number} dayStart --
     * @param {number} dayEnd --
     * @param {str} path --
     * @param {str} compare --
     * @param {function(Object)} callback
     */
    static queryCommit(category, type, period, dayStart, dayEnd, path, compare, callback) {
        request.get(`http://qcoin.sh.intel.com:2345/api/git/commit?compare=${compare}&path=${path}&category=${category}&type=${type}&period=${period}&start=${dayStart}&end=${dayEnd}`,
            function (err, resp, body) {
                callback(body)
            })
    }

    static queryCodeChurn(category, type, period, dayStart, dayEnd, path, compare, callback) {
        request.get(`http://qcoin.sh.intel.com:2345/api/git/codechurn?compare=${compare}&path=${path}&category=${category}&type=${type}&period=${period}&start=${dayStart}&end=${dayEnd}`,
            function (err, resp, body) {
                callback(body)
            })
    }

    static async queryCompLoc(path, date) {
        return new Promise(resolve => {
            request.get(`http://qcoin.sh.intel.com:2345/api/comploc?path=${path}&date=${date}`, (err, resp, body) => {
                resolve(body);
            })

        })
    }

    static loc(category, week, callback) {

        request.get(`http://qcoin.sh.intel.com:2345/api/git/loc?category=${category}&week=${week}`,
            function (err, resp, body) {
                callback(body)
            })
    }

    static complexity(category, week, callback) {

        request.get(`http://qcoin.sh.intel.com:2345/api/git/complexity?category=${category}&week=${week}`,
            function (err, resp, body) {
                callback(body)
            })
    }

    static folder(path, callback) {

        request.get(`http://qcoin.sh.intel.com:2345/api/git/folder?path=${path}`,
            function (err, resp, body) {
                callback(body)
            })
    }

}


module.exports = gitAnalysisUtil;
