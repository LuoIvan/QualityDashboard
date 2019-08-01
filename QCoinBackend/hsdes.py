import requests
import json
from requests_kerberos import HTTPKerberosAuth
import urllib3
import sys
from flask import Flask, jsonify
from flask_restful import Resource, Api
from flask_restful import reqparse
import pexpect
from collections import OrderedDict
from analyze_commit_times import *
from analyze_csv import *
import subprocess
import git
from classify import *
import time
import atexit
import datetime
from analyzer import GitAnalyzer
from analyze_comp_loc import *
from tools import get_all_folders
import os
from pymongo import MongoClient


client = MongoClient('localhost', 53337)
gla = GitAnalyzer('config.json',client['git']['commit'])



class HSDESUtil:
    def __init__(self):

        self.url = "https://hsdes.intel.com/rest/query/execution/eql"
        self.headers = {'Content-Type': 'application/json'}
        self.workerHeaders = {'Content-Type': 'application/json',
                              'AuthKey': "#$%*&#@@$%*&ASDF@#%^"}
        self.kerberosAuth = HTTPKerberosAuth()
        self.session = requests.session()
        self.session.auth = self.kerberosAuth

    def kerberos_retry_post_request(self, **kwargs):
        response = self.session.post(**kwargs)
        print(response.status_code)
        if response.status_code == 401:
            if sys.platform == 'linux':
                self.renew_ticket()
                print("renew")
                response = self.session.post(**kwargs)
        return response

    def kerberos_retry_get_request(self, **kwargs):
        response = self.session.get(**kwargs)
        if response.status_code == 401:
            if sys.platform == 'linux':
                self.renew_ticket()
                response = self.session.get(**kwargs)
        return response

    def renew_ticket(self):
        child = pexpect.spawn(
            '/usr/bin/kinit -l 1d -r 1000d %s@CCR.CORP.INTEL.COM' % config['developerUsername'])
        child.expect(".*")
        child.sendline(config['developerPassword'])
        child.expect(pexpect.EOF)

    def query(self, eql_json: dict, max_results: int = 1000)->dict:
        """query by eql

        Args:
          eql_json (dict): the Json of eql on HSDS
          max_results (int): maxium count of result

        Returns:
          dict: json of the result
        """
        params = {
            'max_results': max_results,
            'start_at': 1
        }
        response_str = self.kerberos_retry_post_request(url=self.url,
                                                        params=params,
                                                        data=json.dumps(
                                                            eql_json),
                                                        headers=self.headers,
                                                        verify=False).text
        return json.loads(response_str)

    def getArticleDetail(self, id: int)->dict:
        """get article detail by id

        Args:
          id (int): article id

        Returns:
          dict: json of the result
        """

        response_str = self.kerberos_retry_get_request(url="https://hsdes.intel.com/rest/article/"+str(id),
                                                       verify=False,
                                                       headers=self.headers).text
        return json.loads(response_str)

    def getUserbyIdsid(self, idsid: str):
        response_str = self.session.get(
            "https://workers.intel.com/Services/hrdataservices/api/Worker/GetWorkerByKeyword/"+idsid, verify=False, headers=self.workerHeaders).text
        workers = json.loads(response_str)
        for worker in workers:
            if worker['Idsid'] == idsid:
                return {
                    'workerName': worker['CcMailNm'],
                    'workderWwid': worker['WWID'],
                    'workerIdsid': idsid,
                    'managerName': worker['NextLevelNm'],
                    'managerEmail': worker['NextLevelCorporateEmailTxt'],
                    'managerWwid': worker['NextLevelWwid']
                }
        return None

    def getUserbyWwid(self, wwid: str):
        response_str = self.session.get(
            "https://workers.intel.com/Services/hrdataservices/api/Worker/GetWorkerByKeyword/"+wwid, verify=False, headers=self.workerHeaders).text
        #print(response_str)
        workers = json.loads(response_str)
        for worker in workers:
            if worker['WWID'] == wwid:
                return {
                    'workerName': worker['CcMailNm'],
                    'workderWwid': wwid,
                    'workerIdsid': worker['Idsid'],
                    'managerName': worker['NextLevelNm'],
                    'managerEmail': worker['NextLevelCorporateEmailTxt'],
                    'managerWwid': worker['NextLevelWwid']
                }
        return None



hsdes = HSDESUtil()
app = Flask(__name__)
api = Api(app)

app.config.from_object(Config())

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

parser = reqparse.RequestParser()
parser.add_argument('eql')
parser.add_argument('count')
parser.add_argument('id')
parser.add_argument('idsid')
parser.add_argument('wwid')
parser.add_argument('path')
parser.add_argument('start')
parser.add_argument('end')
parser.add_argument('category')
parser.add_argument('week')
parser.add_argument('type')
parser.add_argument('period')
parser.add_argument('compare')
parser.add_argument('date')


class HsdesQuery(Resource):
    def get(self):
        args = parser.parse_args()
        if args['count']:
            a = hsdes.query({"eql": args['eql']}, args['count'])
        else:
            a = hsdes.query({"eql": args['eql']})
        return jsonify(a)


class HsdesDetail(Resource):
    def get(self):
        args = parser.parse_args()
        a = hsdes.getArticleDetail(args['id'])
        return jsonify(a)

class GitCodeChurn(Resource):
    def __init__(self):
        self.category_dict = {"component": (Comps, comp_classify), "platform": (
            Plts, plt_classify), "os": (Oss, os_classify)}

    def get(self):
        args = parser.parse_args()
        path = json.loads(args['path'])
        if args['category'] in self.category_dict:
            cate, fuc = self.category_dict[args['category']]
        else:
            cate = []
            fuc = None
        if args['type'] == 'snapshot':
            if args['compare'] == 'group':
              a = gla.analyze_group_total_code_churn(
                [args['start'], args['end']], path)  
            else:
                a = gla.analyze_total_code_churn(
                [args['start'], args['end']], cate, fuc, path)
        elif args['type'] == 'trend':
            if args['compare'] == 'group':
              a = gla.analyze_group_code_churn_by_period(
                args['period'],[args['start'], args['end']], path)  
            else:
                a = gla.analyze_code_churn_by_period(
                args['period'], [args['start'], args['end']], cate, fuc, path)
        return app.response_class(
            response=json.dumps(a, indent=2),
            mimetype='application/json'
        )


class LOC(Resource):
    def get(self):
        args = parser.parse_args()
        a = get_loc_by_category(args['category'], args['week'])
        return app.response_class(
            response=json.dumps(a, indent=2),
            mimetype='application/json'
        )


class Complexity(Resource):
    def get(self):
        args = parser.parse_args()
        a = get_complexity_by_category(args['category'], args['week'])
        return app.response_class(
            response=json.dumps(a, indent=2),
            mimetype='application/json'
        )


class Folder(Resource):
    def get(self):
        args = parser.parse_args()
        a = get_all_folders(os.path.join('/home/intel/gfx-driver/Source/media/',
                                         args['path']), len('/home/intel/gfx-driver/Source/media/'))
        return app.response_class(
            response=json.dumps(a, indent=2),
            mimetype='application/json'
        )
class CompLoc(Resource):
    def get(self):
        args = parser.parse_args()
        paths = json.loads(args['path'])
        results=[]
        for path in paths:
            results.append(static_analysis_by_folder(path,args['date'],'/home/intel/test/'))
        return app.response_class(
            response=json.dumps(results, indent=2),
            mimetype='application/json'
        )


api.add_resource(HsdesQuery, '/api/hsdes/query')
api.add_resource(HsdesDetail, '/api/hsdes/detail')
api.add_resource(GitCodeChurn, '/api/git/codechurn')
api.add_resource(LOC, '/api/git/loc')
api.add_resource(Complexity, '/api/git/complexity')
api.add_resource(Folder, '/api/git/folder')
api.add_resource(CompLoc, '/api/comploc/')


if __name__ == '__main__':

    app.run(host='0.0.0.0')
