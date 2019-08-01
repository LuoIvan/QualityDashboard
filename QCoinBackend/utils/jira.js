var request = require("request");
const json2csv = require('json2csv').parse;
const fields = ['id', 'title', 'type', 'reported', 'created', 'updated', 'status', 'description', 'priority', 'security', 'valid', 'invalid_reason'];
const opts = {fields};
var qcoinConfig = require('../qcoinConfig');

request = request.defaults({
    strictSSL: false,
    jar: true,
    forever: true,
    headers: {
        'connection': 'keep-alive'
    }
});//enable cookie

/**
 * @class JiraUtil
 */
class JiraUtil {
    static get VALID() {
        return 0;
    }

    static get INVALID_REGRESSION() {
        return 1;
    }

    static get INVALID_REGRESSION_COMMIT_ID() {
        return 2;
    }

    static get INVALID_ROOT_CAUSE() {
        return 4;
    }

    static get INVALID_FIX_COMMIT_ID() {
        return 8;
    }

    static get INVALID_REJECTED_REASON() {
        return 16;
    }

    static getValidity(validNum) {
        if (validNum === 0)
            return {validity: ['VALID'], sum: 0};
        let o = {validity: [], sum: validNum};
        if ((validNum & 1) === 1)
            o.validity.push("INVALID_REGRESSION");

        if ((validNum & 2) === 2)
            o.validity.push("INVALID_REGRESSION_COMMIT_ID");

        if ((validNum & 4) === 4)
            o.validity.push("INVALID_ROOT_CAUSE");

        if ((validNum & 8) === 8)
            o.validity.push("INVALID_FIX_COMMIT_ID");

        if ((validNum & 16) === 16)
            o.validity.push("INVALID_REJECTED_REASON");

        return o;
    }

    /**
     * @method
     * @param {number} dayStart -
     * @param {number} dayEnd -
     * @param {boolean} isCsv -
     * @param {function(Object)} callback - callback function
     * @description fetch recent {timeDeltaMinute} minute bugs on jira
     */
    static getRecent(dayStart, dayEnd, isCsv = false, callback) {
        //let url = `https://jira01.devtools.intel.com/rest/api/2/search?jql=project=VSMGWL AND (type=bug OR type=sub-task OR type=task) AND updated >= -${dayStart}d AND updated <= -${dayEnd}d order by updated DESC&maxResults=1000`;
        let url = `https://jira.devtools.intel.com/rest/api/2/search?jql= ((project = MDP AND Product = "Game Streaming")  OR project=VSMGWL) AND (type=bug) AND created >= -${dayStart}d AND created <= -${dayEnd}d order by created DESC&maxResults=1000`;
        //let url = `https://jira.devtools.intel.com/rest/api/2/issue/VSMGWL-19053`;
        //let url = `https://jira.devtools.intel.com/rest/api/2/myself`;
        console.log(url);
        console.log(qcoinConfig.username, qcoinConfig.password)
        let that = this;
        request.get(url,
            function (err, resp, body) {
                //console.log(body)

                let results = JSON.parse(body).issues;
                
                let outputs = [];
                if (results!=undefined)
                results.forEach(result => {
                    let fields = result.fields;
                    let root_cause=undefined;
                    Object.keys(fields).forEach(key => {
                        if (key.startsWith("customfield_"))
                        {
                            if (key=="customfield_13803")
                                root_cause=fields["customfield_13803"];
                            delete fields[key];
                        }
                    });
                    let f = true;
                    let o;
                    //console.log(fields['status']['name']);
                    if (fields['status']['name'].includes('Open.new'))
                        f=false;
                    else if (fields['status']['name'].includes('Open')){
                        o = that.getValidity(that.checkOpen(fields['description']));
                    }
                    else if (fields['status']['name'].includes('Implemented')) {
                        o = that.getValidity(that.checkImplemented(fields['description']),root_cause);
                    }
                    else if (fields['status']['name'].includes('Verified')) {
                        o = that.getValidity(that.checkVerified(fields['description']),root_cause);
                    }
                    else if (fields['status']['name'].includes('Rejected')) {
                        o = that.getValidity(that.checkRejected(fields['description']));
                    }
                    else if (fields['status']['name'].includes('Closed')) {
                        o = that.getValidity(that.checkClosed(fields['description']),root_cause);
                    }
                    else
                        f = false;
                    var comp=undefined;
                    if (fields['components'][0]!=undefined)
                        comp=fields['components'][0]['name'];
                    if (f) {
                        result['valid'] = o.sum === 0;
                        result['invalid_reason'] = o.validity;
                        outputs.push({
                            id: result.key,
                            title: fields['summary'],
                            project:fields['project']['name'],
                            component:comp,
                            type: fields['issuetype']['name'],
                            reporter: fields['reporter']['name'],
                            created: fields['created'],
                            updated: fields['updated'],
                            status: fields['status']['name'],
                            rootcause:root_cause,
                            description: fields['description'],
                            priority: fields['priority']['name'],
                            security: fields['security'] ? fields['security']['name'] : null,
                            valid: result.valid,
                            invalid_reason: result.invalid_reason,
                            validity: o.sum
                        })
                    }
                });
                //console.log(outputs);
                if (isCsv)
                    callback(json2csv(outputs, opts));
                else
                    callback(outputs)
            }).auth(qcoinConfig.username, qcoinConfig.password)
    }

    /**
     * checkOpen
     * @param {string} description
     * @returns {number}
     */
    static checkOpen(description) {
        var retval=0;
        if (!(/\[regression](\s)*no/g.test(description)) && !(/\[regression](\s)*yes/g.test(description)))
            retval=retval+this.INVALID_REGRESSION;
        if (/\[regression](\s)*yes/g.test(description))
            if (!(/\[Culprit](\s)*[0-9]+/g.test(description)))
                retval=retval+this.INVALID_REGRESSION_COMMIT_ID;
        return retval;
    }

    /**
     * checkImplemented
     * @param {string} description
     * @returns {number}
     */
    static checkImplemented(description,root_cause) {
        return this.checkOpen(description) |
            (((root_cause!=undefined) || (/\[Root Cause](\S|\s)*/g.test(description))) ? 0 : this.INVALID_ROOT_CAUSE)
    }

    static checkVerified(description,root_cause) {
        return this.checkOpen(description) |
            (((root_cause!=undefined) || (/\[Root Cause](\S|\s)*/g.test(description))) ? 0 : this.INVALID_ROOT_CAUSE)
    }

    /**
     * checkClosed
     * @param {string} description
     * @returns {number}
     */
    static checkClosed(description,root_cause) {
        if (root_cause!=undefined)
            return this.checkImplemented(description) |
                (/(\[Rejected Reason] [App issue])|(\[Fixed Commit ID](\S|\s)*CL(\S|\s)*[0-9]+)/g.test(description) ? 0 : this.INVALID_FIX_COMMIT_ID)
        else
                return this.checkImplemented(description) |
                (/(\[Rejected Reason] [App issue])|(\[Root Cause](\S|\s)*)|(\[Fixed Commit ID](\S|\s)*CL(\S|\s)*[0-9]+)/g.test(description) ? 0 : this.INVALID_FIX_COMMIT_ID)
    }

    /**
     * checkRejected
     * @param {string} description
     * @returns {number}
     */
    static checkRejected(description) {
        return this.checkOpen(description) |
            (/\[Rejected Reason](\S|\s)*/g.test(description) ? 0 : this.INVALID_REJECTED_REASON)
    }
}

//console.log(JiraUtil.checkOpen("[regression] no [Culprit] CL 12345"))
module.exports = JiraUtil;
//JiraUtil.getRecent(3,0)