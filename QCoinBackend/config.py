import fnmatch


def satisify_wildcard(filename: str, wildcards: list, default: bool) -> bool:
    """return whether the filename satisfy the wildcard rules

    Arguments:
        filename {str} -- the filename to be tested
        wildcards {list} -- the wildcard rules to be used
        default {bool} -- default return value when wildcard rules is empty


    Returns:
        bool -- whether the filename satisfy the wildcard rules
    """
    if wildcards:
        for wildcard in wildcards:
            if fnmatch.fnmatch(filename, wildcard):
                return True
        return False
    return default


def is_match(filename: str, rules: dict, default: bool)->bool:

    """return whether the filename satisfy the config rules

    Arguments:
        filename {str} -- the filename to be tested
        rules {dict} -- the config rules to be used
        default {bool} -- default return value when folder in config is empty

    Returns:
        bool -- whether the filename satisfy the config rules
    """
    if satisify_wildcard(filename, rules['fullname'], False):
        return True
    if not rules['folder']:
        return default
    for folder in rules['folder']:
        if filename.startswith(folder) or fnmatch.fnmatch(filename,folder):
            if satisify_wildcard(filename, rules['extension'], True):
                return True
    return False


def is_keep(filename: str, config: dict)->bool:

    """return whether the file should be kept by given focus and ignore rules

    Arguments:
        filename {str} -- the filename to be tested
        config {dict} -- the config json(dict) from config.json

    Returns:
        bool -- whether the file with filename should be kept
    """
    if is_match(filename, config['ignore'], False):
        return False
    elif is_match(filename, config['focus'], True):
        return True
    else:
        return False
