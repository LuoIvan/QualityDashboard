import csv
import json
from config import is_keep


def static_analysis_by_folder(folders: list, date: str, stored_in: str) -> dict:
    """return the statistic analysis result for target folders in one day

    Arguments:
        folders {str} -- the target folders to be analysed
        date {str}
        stored_in {str}

    Returns:
        dict -- the analysis result
    """
    dataFile1 = stored_in + 'files_detail_' + date + '.csv'
    dataFile2 = stored_in + 'methods_detail_' + date + '.csv'

    total_complex_ave = 0
    total_complex_max = 0
    total_lines = 0
    total_files = 0
    total_range = {'1~10': 0, '11~20': 0, '21~50': 0, '>50': 0}

    for idx in range(len(folders)):
        folders[idx] = folders[idx].replace('/', '\\')

    with open(dataFile1, 'r') as fin:
        with open(dataFile2, 'r') as fin2:
            with open('config.json', 'r') as config_file:
                config = json.loads(config_file.read())
                data = csv.DictReader(fin)
                data2 = csv.DictReader(fin2)
                for i in data:
                    flag = False
                    for folder in folders:
                        if i['File Name'].startswith(folder):
                            flag = True
                            break
                    flag = flag and is_keep(
                        'Source/media/media_driver/' + i['File Name'], config)
                    if flag:
                        total_files += 1
                        lines_i = int(i['Lines'])
                        total_lines += lines_i
                        complex_ave_i = float(i['Average Complexity*'])
                        complex_max_i = int(i['Maximum Complexity*'])
                        total_complex_ave += complex_ave_i
                        if complex_max_i > total_complex_max:
                            total_complex_max = complex_max_i

                for i in data2:
                    flag = False
                    for folder in folders:
                        if i['File Name'].startswith(folder):
                            flag = True
                            break
                    flag = flag and is_keep(
                        'Source/media/media_driver/' + i['File Name'], config)
                    if flag:
                        complex_i = int(i['Complexity'])
                        if complex_i > 50:
                            total_range['>50'] += 1
                        elif complex_i > 20:
                            total_range['21~50'] += 1
                        elif complex_i > 10:
                            total_range['11~20'] += 1
                        else:
                            total_range['1~10'] += 1

    result = {'LOC': total_lines,
              'Average Complexity': round(total_complex_ave/total_files, 2),
              'Max Complexity': total_complex_max,
              '1~10': total_range['1~10'],
              '11~20': total_range['11~20'],
              '21~50': total_range['21~50'],
              '>50': total_range['>50']}
    return result


if __name__ == '__main__':
    folderFile = 'target_folders.txt'
    folds = []
    with open(folderFile, 'r') as fin:
        for line in fin:
            folds.append(line.strip())
    static_analysis_by_folder(folds, '')
