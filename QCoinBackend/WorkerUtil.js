var request = require("request");
request = request.defaults({
    strictSSL: false,
    forever: true,
    headers: {
        'connection': 'keep-alive'
    },
    auth: {
        username: "taoxinyi",
        password: "Txy850804004."
    }
});//enable cookie

/**
 * @class WorkerUtil
 * @classdesc the Worker Util
 */
class WorkerUtil {
    /**
     * @method
     * @param {object} params - the user's params
     * @param {string} [params.Idsid] - the user's Idsid
     * @param {string} [params.WWID] - the user's WWID
     */
    static async getWorkerInfo(params) {
        let that = this;
        let filter = "";
        let key = Object.keys(params)[0];
        filter = `&${key}=${params[key]}`;
        return new Promise(function (resolve, reject) {
            request.get("https://edvp.intel.com/server/worker/Workers/views/WorkerSnapshotPublicV4?$format=JSON" + filter,
                function (error, res, body) {
                    if (!error && res.statusCode === 200) {
                        resolve(that.parseWorkerInfo(JSON.parse(body).elements[0]));
                    } else {
                        reject(error);
                    }
                });
        });
    }

    /**
     * @method
     * @param {object} params - the user's params
     * @param {array} [params.Idsid] - the users' Idsid array
     * @param {array} [params.WWID] - the users' WWID array
     */
    static async getWorkersInfo(params) {
        let key = Object.keys(params)[0];
        let f = "";
        params[key].forEach(param => {
            f += `'${param}',`
        });
        let filter = `"${key}" IN (${f.slice(0, -1)})`;

        return new Promise(function (resolve, reject) {
            request.get("https://edvp.intel.com/server/worker/Workers/views/WorkerSnapshotPublicV4?$format=JSON&$filter=" + filter,
                function (error, res, body) {
                    if (!error && res.statusCode === 200) {
                        let returnValues = {};
                        let workers = JSON.parse(body).elements;
                        workers.forEach(worker => {
                            returnValues[worker[key]] = worker
                        });
                        resolve(returnValues)
                    } else {
                        reject(error);
                    }
                });
        });
    }

    /**
     * @method
     * @param {object} worker - the users' WWID array
     */
    static parseWorkerInfo(worker) {
        return {
            name: worker.FullNm,
            department: worker.DepartmentNm,
            WWID: worker.WWID,
            Idsid: worker.Idsid,
            email: worker.CorporateEmailTxt,
            managerName: worker.NextLevelNm,
            managerWWID: worker.NextLevelWwid,
            managerEmail: worker.NextLevelCorporateEmailTxt,

        }
    }
}


/*
WorkerUtil.getWorkersInfo({Idsid: ["nluo", "taoxinyi"]}).then(o => {
    console.log(o)
});
*/
module.exports = WorkerUtil;
