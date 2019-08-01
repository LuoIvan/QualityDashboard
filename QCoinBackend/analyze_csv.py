import csv
d = {}
for i in ['component', 'os', 'platform']:
    with open("%s.csv" % i, encoding="utf8") as c:
        reader = csv.reader(c)
        d[i] = list(reader)[1:]


def get_loc_by_category(category: str, week: str) -> dict:
    out = {}
    for line in d[category]:
        if line[1] != week:
            continue
        out[line[0]] = int(line[2])
    return out


def get_complexity_by_category(category: str, week: str) -> dict:
    out = {}
    for line in d[category]:
        if line[1] != week:
            continue
        out[line[0]] = [round(float(line[3]), 1), int(line[4])]
    return out
