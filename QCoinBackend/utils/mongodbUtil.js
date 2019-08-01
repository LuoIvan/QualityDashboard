const fs = require('fs');
const GitCategorize = require('./gitCategorize')
const GithubUtil=require('./gerrit')

class MongoUtil {

  async connect(url) {
    const MongoClient = require('mongodb').MongoClient;
    this.client = await MongoClient.connect(url, {useNewUrlParser: true});
    this.db = this.client.db('git');
    return this.db

  }

  async close() {
    await this.client.close();
  }

  async updateRegression(commitHash, regression) {
    const regex = new RegExp('^' + commitHash);
    let r = await this.db.collection('commit').findOne({commitHash: regex});
    if (r === null)
      return false;
    else {
      r = await this.db.collection('commit').findOne({
        commitHash: regex,
        regressions: {
          $elemMatch: {id: regression.id}
        }
      });
      if (r === null) {
        await this.db.collection('commit').updateOne(
          {commitHash: regex},
          {$push: {regressions: regression}}
        );
        return true
      }
      if (regression.fix_commit_id !== '') {
        const fixRegex = new RegExp('^' + regression.fix_commit_id);
        let fixCommit = await this.db.collection('commit').findOne({commitHash: fixRegex});
        if (fixCommit !== null &&
          (!fixCommit.fixed || (fixCommit.fixed && !fixCommit.fixed.find(x => x.commitHash === r.commitHash))))
          await this.db.collection('commit').updateOne(
            {commitHash: fixCommit.commitHash},
            {
              $push: {
                fixed: {
                  commitHash: r.commitHash,
                  component: regression.component
                }
              }
            }
          );
      }
      return false
    }
  }

  async updateFromLog(log = "gitlog.log") {
    const splitPattern = new RegExp(/(^--[\s|\S]+?(?=\n--))/, 'gm');
    const infoPattern = new RegExp(/(\d+|-+)\s+(\d+|-+)\s+([^\n]+)/);
    let that = this;
    let count = 0;
    //var change_id_get;
    return new Promise(resolve => {
      fs.readFile(log, 'utf8', function (err, data) {
        data += '\n--';
        let total = data.match(splitPattern);
        const len = total.length;
        total.forEach(async a => {
          //console.log(a)
          let lines = a.split('\n').filter(a => a.trim());
          let [commitHash, commitDate, authorDate, author] = lines[0].split('--').filter(a => a.trim());
          let files = [];
          let os_files=[];
          let os_contain=false;
          let components = new Set();
          lines.slice(1).forEach(line => {
            let matches = line.match(infoPattern);
            let [add, del, filename] = matches.slice(1, 4);
            add = add === '-' ? 0 : parseInt(add);
            del = del === '-' ? 0 : parseInt(del);
            let component = GitCategorize.component(filename);
            components.add(component);
            files.push({
              add: add,
              delete: del,
              filename: filename,
              component: component
            })
            if (filename.indexOf("/os/")!=-1 || filename.indexOf("dxvaumd.cpp")!=-1 || filename.indexOf("dxvaumd.h")!=-1 || filename.indexOf("dxvaumd_d3d12.cpp")!=-1 || filename.indexOf("dxvaumd_d3d12.h")!=-1 || filename.indexOf("media_libva.cpp")!=-1 || filename.indexOf(" media_libva.h")!=-1)
            {
              //console.log(commitDate)
              os_files.push({
                filename: filename
              })
              os_contain=true;
            }
          });
          let r = await that.db.collection('commit').findOne({
            commitHash: commitHash,
          });
          if (r === null)
            await that.db.collection('commit').insertOne({
              commitHash: commitHash,
              commitDate: commitDate,
              authorDate: authorDate,
              components: [...components],
              author: author,
              files: files
            });
            /*
            var change_id_get;
            await GithubUtil.getChangeByCommitHash(commitHash).then(data=>{
              if (data.length===1)
              {
                change_id_get=data[0].change_id;
                //console.log(count)
                //console.log(data[0].change_id);
                //count=count+1;
              }
              else
                os_contain=false;
              //let whole_change=data;
              //console.log(data.length);
              //console.log(data[0].change_id)  
            });
           */ 
          let l = await that.db.collection('OS_Record').findOne({
            commitHash: commitHash,
          })
          if (os_contain && l===null)
          {
            //if (whole_change!=undefined)
            await that.db.collection('OS_Record').insertOne({
                commitHash: commitHash,
                //changeID:change_id_get,
                commitDate: commitDate,
                author: author,
                files: os_files
            })
            await that.db.collection('OS_Record_Process').insertOne({
              commitHash: commitHash,
              //changeID:change_id_get,
              commitDate: commitDate,
              author: author,
              files: os_files
          })
          };
          count++;
          if (count === len) resolve()
        });

      });

    })
  }

}

module.exports = MongoUtil;
/*
var resp;
GithubUtil.getChangeByCommitHash("bb04296c6f82385460ad62a9ae8acb9156c0c13d").then(data=>{
  //let whole_change=data;
  console.log(data.length);
  resp=data[0].labels;
  resp=JSON.parse((JSON.stringify(resp).replace('-','_')))
  console.log(resp.Code_Review)
});
*/
/*
const url = 'mongodb://10.239.141.130:53337';
let mongoUtil = new MongoUtil();
mongoUtil.connect(url).then(
    mongoUtil.updateFromLog())*/
    /*
    hsdesUtil.getAllRegressions().then(results => {
        results.forEach(result => {
            mongoUtil.updateRegression(result['regression_commit_id'], result).then(r => {

            })
        })
    })*/



