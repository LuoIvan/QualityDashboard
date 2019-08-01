import re
import csv
from datetime import datetime, timedelta, date
import os


def logfile_to_list(logfile: str) -> list:
    with open(logfile, 'r') as f:
        data = f.read()
    r = re.findall("(^--[\s|\S]+?(?=(\n--)|\Z))", data, re.M)
    return [i[0] for i in r]


def padding_list(l: list, padding, padding_count: int) -> list:
    new_list = []
    for i in l:
        new_list.append(i)
        new_list.extend([padding] * padding_count)
    return new_list


def get_info_and_files(commit: str)->(str, str, str, str, list):
    lines = commit.splitlines()
    info, files = lines[0][2:], lines[1:]
    commit_id, commit_date, author_date, author = info.split("--")
    return (commit_id, commit_date, author_date, author, files)


def get_file_info(f: str) -> (str, int, int):
    add, delete, filename = re.findall(
        "(\d+|-+)\s+(\d+|-+)\s+([^\n]+)", f)[0]
    add = 0 if add == '-' else int(add)
    delete = 0 if delete == '-' else int(delete)
    return (filename, add, delete)


def get_isodate(d: str) -> list:
    year, month, day = list(map(int, d.split("-")))
    isodate = (date(year, month, day)+timedelta(days=1)).isocalendar()
    return (isodate[0], isodate[1])


def iso_to_gregorian(iso_year: int, iso_week: int, iso_day: int)->datetime.date:
    jan4 = date(iso_year, 1, 4)
    start = jan4 - timedelta(days=jan4.isoweekday()-1)
    return start + timedelta(weeks=iso_week-1, days=iso_day-1)


def get_default_per_week(catgories: list, col_num: int) -> dict:
    d = {}
    for category in catgories:
        d[category] = {}
        d[category]['detail'] = [0] * col_num
        d[category]['commit'] = 0
    return d


def list_add(list1: list, list2: list) -> list:
    return [x + y for x, y in zip(list1, list2)]


def get_date_param(period: str, commit_date: str) -> str:
    """return data_param by period and commit_date

    Args:
        period (str): daily,weekly or monthly
        commit_date (str): git commit_date

    Returns:
        str: yyyy-MM-DD, yyyy-WW, yyyy-MM for daily,weekly,monthly respectively
    """

    if period == 'daily':
        return commit_date
    if period == 'weekly':
        year, week = get_isodate(commit_date)
        return "%d-WW%02d" % (year, week)
    if period == 'monthly':
        return commit_date[:-3]


def get_start_end(period: str, date_range: list) -> list:
    """return start and end date  by period and date_range

    Args:
        period (str): daily,weekly,monthly
        date_range (list): [start,end] yyyy-MM-DD, yyyy-WW, yyyy-MM for daily,weekly,monthly respectively

    Returns:
        list: [start,end] yyyy-MM-DD
    """

    if period == 'daily':
        return date_range
    if period == 'weekly':
        after, before = date_range
        after_year, after_week = after.split('-')
        before_year, before_week = before.split('-')
        after = iso_to_gregorian(int(after_year), int(
            after_week), 0).strftime("%Y-%m-%d")
        before = iso_to_gregorian(int(before_year), int(
            before_week), 6).strftime("%Y-%m-%d")
        return [after, before]
    if period == 'monthly':
        after, before = date_range
        after += "-01"
        before += "-31"
        return [after, before]


def get_folder(path: str) -> str:
    for i in range(len(path) - 1, -1, -1):
        if path[i] == '/':
            return path[:i+1]


def get_all_folders(path: str, common_len: int) -> list:
    folders = next(os.walk(path))[1]
    folders.sort()
    c = []
    if len(folders) > 0:
        for folder in folders:
            absolute_path = os.path.join(path, folder)
            c.append({
                'label': folder,
                'absolute': absolute_path[common_len:],
                'children': get_all_folders(absolute_path, common_len)
            })
    return c


def get_old_new_from_rename(path: str)->list:
    s = re.match('(.*){(.*) => (.*)}(.*)', path)
    old = (s.group(1)+s.group(2)+s.group(4)).replace('//', '/')
    new = (s.group(1)+s.group(3)+s.group(4))
    return old, new


def is_rename(path: str)->bool:
    return '=>' in path


class FileSet:
    def __init__(self):
        self.file_dict = {}

    def add_file(self, filename: str)->str:
        if filename in self.file_dict:
            return self.file_dict[filename]
        self.file_dict[filename] = filename
        return filename

    def update_rename(self, old: str, new: str):
        if new not in self.file_dict:
            self.file_dict[old] = new
            return new
        self.file_dict[old] = self.file_dict[new]
        del self.file_dict[new]
        return self.file_dict[old]

    def __getitem__(self, key):
        return self.file_dict[key]

    def __contains__(self, x):
        return x in self.file_dict

    def __len__(self):
        return len(self.file_dict)

    def __str__(self):
        return str(self.file_dict)


"""
a= FileSet()
a.add_file('1')
a.add_file('2')
a.update_rename('10','2')
a.add_file('10')
a.update_rename('13','10')
a.add_file('13')

print (a)
print (len(a))
print ('10' in a)
"""
