var request = require("request");
const json2csv = require('json2csv').parse;
const fields = ['id', 'title', 'owner', 'submitted_by','submitted_date', 'closed_date', 'duration'];
const opts = {fields};
request = request.defaults({
    forever: true,
    headers: {
        'connection': 'keep-alive'
    }
});//enable cookie
let url = `http://qcoin.sh.intel.com:2345/api/hsdes/query?eql=select owner,submitted_by,component,closed_date,submitted_date, id,title where tenant='ip_sw_graphics' AND component contains 'ip.graphics_driver.media' AND title contains 'GDHM' AND closed_date IS_NOT_EMPTY   SORTBY closed_date DESC`
request.get(url, (err, resp, body) => {
    let d = JSON.parse(body).data
    d.forEach(each => {
        each['closed_date'] = new Date(each['closed_date'])
        each['submitted_date'] = new Date(each['submitted_date']);
        each['duration'] = (each['closed_date'] - each['submitted_date']) / 86400000;
    })
    //console.log(json2csv(d, opts))

});
