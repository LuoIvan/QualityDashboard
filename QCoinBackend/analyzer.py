from tools import *
from config import is_keep
from tools import *
from classify import *
import json
import copy
from pymongo import MongoClient, collection, ASCENDING, DESCENDING


class GitAnalyzer:
    def __init__(self, config_file: str, commit_collection: collection.Collection):
        self.commit = commit_collection
        self.common = 'Source/media/'
        self.all_folder = 'Source/media/media_driver/'
        self.default_folders = [
            'Source/media/media_driver/', 'Source/media/media_embargo/']
        with open(config_file, "r") as conf:
            self.config = json.loads(conf.read())

    def reload_config(self, config_file: str):
        """reload the config file

        Args:
            config_file (str): the config file name
        """

        self.config = logfile_to_list(config_file)

    def get_tmp_config(self, tmp_folders: list):
        folders = []
        for tmp_folder in tmp_folders:
            if tmp_folder.endswith('/'):
                absolute_folder = self.common+tmp_folder
            else:
                absolute_folder = self.common+tmp_folder+'/'
            folders.append(absolute_folder)
        tmp_config = copy.deepcopy(self.config)
        tmp_config['focus']['fullname'] = []
        tmp_config['focus']['folder'] = folders if folders else self.default_folders
        return tmp_config

    def config_add_file(self, config: dict, filename: str):
        config['focus']['fullname'].append(filename)

    def update_fileset(self, total_file_set: FileSet, filename: str):
        if is_rename(filename):
            old, new = get_old_new_from_rename(filename)
            return total_file_set.update_rename(old, new)
        return total_file_set.add_file(filename)

    def analyze_group_total_code_churn(self, date_range: list, groups: list) -> dict:
        """return group code churn analysis in date_range, classfied by category_list from give groups

        Args:
            date_range (list): [dayStart, dayEnd] yyyy-MM-DD inclusive
            groups (list): nested arrays indicating groups [[folder1,folder2],[folder3],[folder4,folder5]...]


        Returns:
            dict: {group1:count1, group1:count2, ...}
        """
        after, before = date_range
        total_file_set = FileSet()  # record all files latest name
        file_sets = []
        d = {}
        configs = []
        for group in groups:
            configs.append(self.get_tmp_config(group))
            file_sets.append(set())
        for index in range(len(groups)):
            d['Group'+str(index+1)] = {'loc': 0,
                                       'files': 0, 'commit': 0, 'regression': 0}
        commits = self.commit.find(
            {
                "commitDate": {"$gte": after},
            },
            {'_id': False, 'files': True, 'regressions': True, 'commitDate': True}
        ).sort('commitDate', DESCENDING)
        for commit in commits:
            commit_date = commit['commitDate']
            files = commit['files']
            if commit_date > before:
                for f in files:
                    filename = f['filename']
                    self.update_fileset(total_file_set, filename)
                continue
            commit_comps = set()  # indicates all the compoents in this commit

            for f in files:
                filename = f['filename']
                add = f['add']
                delete = f['delete']
                filename = self.update_fileset(total_file_set, filename)
                if add == 0 and delete == 0:  # this file is not changed at all
                    continue
                for (index, config) in enumerate(configs):
                    file_set = file_sets[index]
                    if is_keep(filename, config):
                        is_add_regression = 0
                        comp = 'Group'+str(index+1)
                        if filename in file_set:
                            is_add_file = 0
                        else:
                            file_set.add(filename)
                            is_add_file = 1
                        if comp in commit_comps:
                            is_add_comp = 0
                        else:
                            commit_comps.add(comp)
                            is_add_comp = 1
                            if 'regressions' in commit:
                                is_add_regression = 1
                        d[comp]['loc'] += add+delete
                        d[comp]['files'] += is_add_file
                        d[comp]['commit'] += is_add_comp
                        d[comp]['regression'] += is_add_regression

        return d

    def analyze_group_code_churn_by_period(self, period: str, date_range: list,  groups: list) -> dict:
        """return code churn analysis by period, in date_range, classfied by category_list

        Args:
            period (str): 'daily','weekly','monthly'
            date_range (list): [start,end] yyyy-MM-DD, yyyy-WW, yyyy-MM for daily,weekly,monthly respectively
            groups (list): list of groups
        Returns:
            dict:  {'group1':{date:{add,delete,files},...},
                    'group2':{date:{add,delete,files},...},...}
        """
        d = {}
        for (index, group) in enumerate(groups):
            d['Group'+str(index+1)] = self.analyze_code_churn_by_period(period,
                                                                        date_range, [], None, group)['All']

        return d

    def analyze_total_code_churn(self, date_range: list, category_list: list, classify_func, tmp_folders: list) -> dict:
        """return code churn analysis in date_range, classfied by category_list

        Args:
            commits (list): output of `logfile_to_list`
            date_range (list): [dayStart, dayEnd] yyyy-MM-DD inclusive
            category_list (list): all the components in the category
            classify_func ([type]): the function to classify each component

        Returns:
            dict: {component1:count1, component2:count2, ...}
        """
        after, before = date_range
        total_file_set = FileSet()  # record all files latest name
        file_set = set()  # record files satisfy the result
        d = {}
        config = self.get_tmp_config(tmp_folders)
        for category in category_list:
            d[category] = {'loc': 0, 'files': 0, 'commit': 0, 'regression': 0}
        commits = self.commit.find(
            {
                "commitDate": {"$gte": after},
            },
            {'_id': False, 'files': True, 'commitDate': True, 'regressions': True}
        ).sort('commitDate', DESCENDING)
        for commit in commits:
            commit_date = commit['commitDate']
            files = commit['files']
            if commit_date > before:
                for f in files:
                    filename = f['filename']
                    self.update_fileset(total_file_set, filename)
                continue
            commit_comps = set()  # indicates all the compoents in this commit
            for f in files:
                filename = f['filename']
                add = f['add']
                delete = f['delete']
                filename = self.update_fileset(total_file_set, filename)
                if not is_keep(filename, config) or (add == 0 and delete == 0):
                    continue
                is_add_regression = 0
                comp = classify_func(filename)
                if filename in file_set:
                    is_add_file = 0
                else:
                    file_set.add(filename)
                    is_add_file = 1
                if comp in commit_comps:
                    is_add_comp = 0
                else:
                    commit_comps.add(comp)
                    is_add_comp = 1
                    if 'regressions' in commit:
                        is_add_regression = 1
                d[comp]['loc'] += add+delete
                d[comp]['files'] += is_add_file
                d[comp]['commit'] += is_add_comp
                d[comp]['regression'] += is_add_regression

        return d

    def analyze_code_churn_by_period(self, period: str, date_range: list, category_list: list, classify_func, tmp_folders: list) -> dict:
        """return code churn analysis by period, in date_range, classfied by category_list

        Args:
            period (str): 'daily','weekly','monthly'
            date_range (list): [start,end] yyyy-MM-DD, yyyy-WW, yyyy-MM for daily,weekly,monthly respectively
            category_list (list): all the components in the category
            classify_func ([function]): the function to classify each component

        Returns:
            dict:  {component1:{date:{add,delete,files},...},
                    component2:{date:{add,delete,files},...},...}
        """

        after, before = get_start_end(period, date_range)
        total_file_set = FileSet()  # record all files latest name
        dict_fileset = {}  # {date:set(file1,file2),...}
        d = {}  # return result
        config = self.get_tmp_config(tmp_folders)
        is_classify = True
        is_subfolder = False
        if classify_func == 'subfolder':
            is_subfolder = True
        else:
            if len(category_list) == 0:
                category_list = ['All']
                is_classify = False

            for category in category_list:
                d[category] = {}
        commits = self.commit.find(
            {
                "commitDate": {"$gte": after},
            },
            {'_id': False, 'files': True, 'regressions': True, 'commitDate': True}
        ).sort('commitDate', DESCENDING)
        for commit in commits:
            commit_date = commit['commitDate']
            files = commit['files']
            if commit_date > before:
                for f in files:
                    filename = f['filename']
                    self.update_fileset(total_file_set, filename)
                continue
            commit_comps = set()
            date_param = get_date_param(period, commit_date)
            if date_param not in dict_fileset:
                dict_fileset[date_param] = set()

            if not is_subfolder:
                for category in category_list:
                    if date_param not in d[category]:
                        d[category][date_param] = {
                            'loc': 0, 'files': 0, 'commit': 0, 'regression': 0}

            for f in files:
                filename = f['filename']
                add = f['add']
                delete = f['delete']
                filename = self.update_fileset(total_file_set, filename)
                # filename not satisfy config whitelist or not changed
                if not is_keep(filename, config) or (add == 0 and delete == 0):
                    continue
                is_add_regression = 0
                if is_subfolder:
                    comp = get_folder(filename)
                    if comp not in d:
                        d[comp] = {}
                    if date_param not in d[comp]:
                        d[comp][date_param] = {
                            'loc': 0, 'files': 0, 'commit': 0, 'regression': 0}

                elif is_classify:
                    comp = classify_func(filename)
                else:
                    comp = 'All'

                if filename in dict_fileset[date_param]:
                    is_add_file = 0
                else:
                    dict_fileset[date_param].add(filename)
                    is_add_file = 1
                if comp in commit_comps:
                    is_add_comp = 0
                else:
                    commit_comps.add(comp)
                    is_add_comp = 1
                    if 'regressions' in commit:
                        is_add_regression = 1

                d[comp][date_param]['loc'] += add+delete
                d[comp][date_param]['files'] += is_add_file
                d[comp][date_param]['commit'] += is_add_comp
                d[comp][date_param]['regression'] += is_add_regression

        return d

client = MongoClient('10.239.141.130', 53337)
gla = GitAnalyzer( 'config.json', client['git']['commit'])

"""
print(gla.analyze_total_code_churn(
  ['2018-10-10', '2018-11-28'], Oss, os_classify, ['media_embargo']))
print(gla.analyze_group_code_churn_by_period(
   'weekly', ['2018-49', '2018-51'], [['media_embargo/windows']]))
print(
 gla.analyze_group_total_code_churn(['2018-10-29','2018-12-05'],[['media_driver'],['media_embargo']])
 )
 """