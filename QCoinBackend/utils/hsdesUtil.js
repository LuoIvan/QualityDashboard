const json2csv = require('json2csv').parse;
const fields = ['id', 'title', 'submitted_by','submitted_date','updated_date', 'owner', 'component', 'status', 'regression', 'regression_commit_id', 'fix_commit_id', 'fix_description', 'valid', 'invalid_reason'];
const opts = {fields};
const fs = require("fs");

var request = require("request");
request = request.defaults({
    forever: true,
    headers: {
        'connection': 'keep-alive'
    }
});//enable cookie

/**
 * @class JiraUtil
 */
class hsdesUtil {
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

    static get SUB_COMPONENT_MISSING() {
        return 32;
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
        
        if ((validNum & 32) === 32)
            o.validity.push("SUB_COMPONENT_MISSING");        
        return o;
    }

    static get fullFields() {
        return [
            'id',
            'title',
            'component',
            'submitted_by',
            'owner',
            'submitted_date',
            'updated_date',
            'status_reason',
            'ip_sw_graphics.bug.regression',
            'ip_sw_graphics.bug.regression_commit_id',
            'ip_sw_graphics.bug.fix_commit_id',
            'ip_sw_graphics.bug.fix_description',
            'ip_sw_graphics.bug.sub_component'

        ]
    }

    static get briefFields() {
        let fullFields = [];
        this.fullFields.forEach(field => {
                if (field.startsWith("ip_sw_graphics.bug."))
                    field = field.split('.')[2];
                else if (field === "status_reason")
                    field = "status";
                fullFields.push(field) 
            }
        );
        return fullFields
    }

    /**
     *
     * @param {number} dayStart --
     * @param {number} dayEnd --
     * @param {boolean} isCsv -- whether return csv
     * @param {function(Array)} callback
     */
    static query(dayStart, dayEnd, isCsv = false, callback) {
        console.log(dayStart,dayEnd);
        let eql = "";
        this.fullFields.forEach(field => {
            eql += field + ","
        });
        eql = `select ${eql.slice(0, -1)} where tenant='ip_sw_graphics' AND subject='bug' AND component contains 'ip.graphics_driver.media' AND (ip_sw_graphics.bug.gfx_branch ='gfx-driver__comp_media' OR ip_sw_graphics.bug.gfx_branch ='gfx-driver__master') AND submitted_date GREATER_THAN_OR_EQUAL_TO DaysAgo(${dayStart}) AND submitted_date LESS_THAN_OR_EQUAL_TO DaysAgo(${dayEnd}) SORTBY submitted_date DESC`;
        let that = this;
        //console.log(`http://qcoin.sh.intel.com:2345/api/hsdes/query?eql=${eql}`);
        request.get(`http://qcoin.sh.intel.com:2345/api/hsdes/query?eql=${eql}`,
            function (err, resp, body) {
                let returns = [];
                let results = JSON.parse(body).data;
                //console.log(results);
                results.forEach(result => {
                    Object.keys(result).forEach(key => {
                        if (key.startsWith("ip_sw_graphics.bug."))
                            result[key.split('.')[2]] = result[key];
                        if (key === 'status_reason')
                            result['status'] = result['status_reason'];
                        if (result['submitted_by'] === 'sys_gkvpgci')
                            result['submitted_by'] = 'hanlong1';
                        if (key === 'ip_sw_graphics.bug.sub_component')
                            result['sub_component']==result[key];
                        if (!that.briefFields.includes(key))
                            delete result[key];
                    });
                    console.log(result);
                    //if (result['regression'] === "yes") {
                    let f = true;
                    let o;
                    if (result['status'].includes('open.new'))
                        f=false;
                    else if (result['status'].includes('open')){
                        o = that.getValidity(that.checkOpen(result['regression'], result['regression_commit_id'], result['component'], result['sub_component']));
                    }
                    else if (result['status'].includes('implemented')) {
                        o = that.getValidity(that.checkImplemented(result['regression'], result['regression_commit_id'], result['component'], result['sub_component'],result['fix_description']));
                    }
                    else if (result['status'].includes('verified')) {
                        o = that.getValidity(that.checkVerified(result['regression'], result['regression_commit_id'], result['component'], result['sub_component'],result['fix_description']));
                    }
                    else if (result['status'].includes('rejected')) {
                        o = that.getValidity(that.checkRejected(result['regression'], result['regression_commit_id'], result['component'], result['sub_component'],result['fix_description']));
                    }
                    else if (result['status'].includes('closed')) {
                        o = that.getValidity(that.checkClosed(result['regression'], result['regression_commit_id'], result['component'], result['sub_component'],result['fix_description'], result['fix_commit_id']));
                    }
                    else
                        f = false;
                    if (result['status'].includes('duplicate'))
                        f=false;
                    if (f) {
                        result['valid'] = o.sum === 0;
                        result['invalid_reason'] = o.validity;
                        result = {
                            id: result.id,
                            title: result.title,
                            component: result.component,
                            submitted_by: result.submitted_by,
                            submitted_date:result.submitted_date,
                            updated_date: result.updated_date,
                            owner: result.owner,
                            status: result.status,
                            regression: result.regression,
                            regression_commit_id: result.regression_commit_id,
                            fix_commit_id: result.fix_commit_id,
                            fix_description: result.fix_description,
                            valid: result.valid,
                            invalid_reason: result.invalid_reason,
                            validity: o.sum
                        };
                        returns.push(result)
                    }
                    //}
                    //else
                    //{
                    //    console.log("not_regression");
                    //}


                });
                //console.log(returns)
                if (isCsv)
                    callback(json2csv(returns, opts));
                else
                    callback(returns)
            })
    }

    static getAllRegressions(){
        let eql = "";
        this.fullFields.forEach(field => {
            eql += field + ","
        });
        eql = `select ${eql.slice(0, -1)} where tenant='ip_sw_graphics' AND subject='bug' AND component contains 'ip.graphics_driver.media' AND ip_sw_graphics.bug.gfx_branch ='gfx-driver__comp_media' AND ip_sw_graphics.bug.regression_commit_id IS_NOT_EMPTY SORTBY updated_date DESC`;
        let that = this;
        //console.log(`http://qcoin.sh.intel.com:2345/api/hsdes/query?eql=${eql}`);
        return new Promise(resolve => {
            request.get(`http://qcoin.sh.intel.com:2345/api/hsdes/query?eql=${eql}`,
                function (err, resp, body) {
                    let returns = [];
                    let results = JSON.parse(body).data;
                    results.forEach(result => {
                        Object.keys(result).forEach(key => {
                            if (key.startsWith("ip_sw_graphics.bug."))
                                result[key.split('.')[2]] = result[key];
                            if (key === 'status_reason')
                                result['status'] = result['status_reason'];
                            if (result['submitted_by'] === 'sys_gkvpgci')
                                result['submitted_by'] = 'hanlong1';
                            if (!that.briefFields.includes(key))
                                delete result[key];
                        });
                        if (result['regression'] === "yes") {
                            let f = true;
                            let o;
                            if (result['status'].includes('open')) {
                                o = that.getValidity(that.checkOpen(result['regression'], result['regression_commit_id']));
                            }
                            else if (result['status'].includes('implemented')) {
                                o = that.getValidity(that.checkImplemented(result['regression'], result['regression_commit_id'], result['fix_description']));
                            }
                            else if (result['status'].includes('rejected')) {
                                o = that.getValidity(that.checkRejected(result['regression'], result['regression_commit_id'], result['fix_description']));
                            }
                            else if (['complete', 'verified'].includes(result['status'])) {
                                o = that.getValidity(that.checkClosed(result['regression'], result['regression_commit_id'], result['fix_description'], result['fix_commit_id']));
                            }
                            else
                                f = false;
                            if (f) {
                                result['valid'] = o.sum === 0;
                                result['invalid_reason'] = o.validity;
                                result = {
                                    id: result.id,
                                    title: result.title,
                                    component: result.component,
                                    submitted_by: result.submitted_by,
                                    submitted_date:result.submitted_date,
                                    updated_date: result.updated_date,
                                    owner: result.owner,
                                    status: result.status,
                                    regression: result.regression,
                                    regression_commit_id: result.regression_commit_id,
                                    fix_commit_id: result.fix_commit_id,
                                    fix_description: result.fix_description,
                                    valid: result.valid,
                                    invalid_reason: result.invalid_reason,
                                    validity: o.sum
                                };
                                returns.push(result)
                            }
                        }
                        else
                        {
                            console.log("NOT_REGRESSION")
                        }


                    });
                    resolve(results)
                })
        })
    }

    /**
     * checkOpen
     * @param {string} regression
     * @param {string} regression_commit_id
     * @returns {number}
     */
    static checkOpen(regression, regression_commit_id,component,sub_component) {
        if (component=='ip.graphics_driver.media_encode')
            if (regression != 'yes' && regression != 'no' && regression != 'unknown')
                return (this.INVALID_REGRESSION) |
                    (sub_component!=''?0: this.SUB_COMPONENT_MISSING);
            else if (regression === 'yes')
                return (regression === 'yes' ? 0 : this.INVALID_REGRESSION) |
                    (/[0-9]+/g.test(regression_commit_id) ? 0 : this.INVALID_REGRESSION_COMMIT_ID)|
                    (sub_component!=''?0: this.SUB_COMPONENT_MISSING);
            else return 0;
        else
            if (regression != 'yes' && regression != 'no' && regression != 'unknown')
                return this.INVALID_REGRESSION;
            else if (regression === 'yes')
                return (regression === 'yes' ? 0 : this.INVALID_REGRESSION) |
                    (/[0-9]+/g.test(regression_commit_id) ? 0 : this.INVALID_REGRESSION_COMMIT_ID);
            else return 0;
    }

    /**
     * checkImplemented
     * @param {string} regression
     * @param {string} regression_commit_id
     * @param {string} fix_description
     * @returns {number}
     */
    static checkImplemented(regression, regression_commit_id,component,sub_component,fix_description) {
        return this.checkOpen(regression, regression_commit_id,component,sub_component) |
            (/\[Root Cause](\S|\s)*/g.test(fix_description) ? 0 : this.INVALID_ROOT_CAUSE)
    }

    static checkVerified(regression, regression_commit_id,component,sub_component,fix_description) {
        return this.checkOpen(regression, regression_commit_id,component,sub_component) |
            (/\[Root Cause](\S|\s)*/g.test(fix_description) ? 0 : this.INVALID_ROOT_CAUSE)
    }

    static checkRejected(regression, regression_commit_id,component,sub_component,fix_description) {
        return this.checkOpen(regression, regression_commit_id,component,sub_component) |
            (/\[Rejected Reason](\S|\s)*/g.test(fix_description) ? 0 : this.INVALID_REJECTED_REASON)
    }

    /**
     * checkClosed
     * @param {string} regression
     * @param {string} regression_commit_id
     * @param {string} fix_description
     * @param {string} fix_commit_id
     * @returns {number}
     */
    static checkClosed(regression, regression_commit_id,component,sub_component,fix_description, fix_commit_id) {
        return this.checkImplemented(regression, regression_commit_id,component,sub_component,fix_description) |
            (/[0-9]+/g.test(fix_commit_id) ? 0 : this.INVALID_FIX_COMMIT_ID)
    }

    /**
     * checkRejected
     * @param {string} regression
     * @param {string} regression_commit_id
     * @param {string} fix_description
     * @returns {boolean}
     */


    static fetchRegression(hours){
        let url = "http://qcoin.sh.intel.com:2345/api/hsdes/query?eql=" +
            "select tenant,subject,submitted_by,id,ip_sw_graphics.bug.gfx_branch,updated_date,ip_sw_graphics.bug.regression_commit_id " +
            "where tenant='ip_sw_graphics' " +
            "AND subject='bug' " +
            "AND component contains 'ip.graphics_driver.media' " +
            "AND ip_sw_graphics.bug.gfx_branch contains 'gfx-driver__comp_media' " +
            `AND update
            d_date GREATER_THAN_OR_EQUAL_TO HoursAgo(${hours}) `+
            "SORTBY updated_date DESC"
    }
}


//console.log(hsdesUtil.getValidity(hsdesUtil.checkRejected("no", "[Culprait] CL 123 ", "[Rejected Reason] root cause description.")))
module.exports = hsdesUtil;
//hsdesUtil.query(1,0)