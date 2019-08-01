Comps = ['MDF', 'CODEC', 'MHW', 'MOS', 'VP', 'DDI', 'CP']
CompTags = {
    'cm': 'MDF',
    'codec': 'CODEC',
    'heap_manager': 'MHW',
    'hw': 'MHW',
    'media_interfaces': 'MHW',
    'os': 'MOS',
    'renderhal': 'MHW',
    'shared': 'HALCOMMON',
    'vp': 'VP',
    'ddi': 'DDI',
    'msdk': 'DDI',
    'ecdsa': 'DDI',
    'hdcp': 'CP',
    'cp': 'CP',
    'cm_fc_ld': 'CM'
}

Oss = ['Windows', 'Linux', 'Osx', 'Android', 'Agnostic']
Oss_lower = ['windows', 'linux', 'osx', 'android', 'agnostic']

Plts = ['Gen8', 'Gen9', 'Gen10', 'Gen11', 'Gen12', 'Common']


# ddi parent (codec,vp,cp) /cm mdf=>mdf/ halcommon codec => codec
def comp_classify(filepath):
    paths = filepath.split('/')
    comp = ''
    for i in paths:
        if i in CompTags:
            if i == 'ddi' and comp in ['CODEC', 'VP', 'CP']:
                return comp
            comp = CompTags[i]
    if comp == '' or comp == 'CM':
        return 'MDF'
    if comp == 'HALCOMMON':
        return 'CODEC'
    return comp


def os_classify(filepath):
    paths = filepath.split('/')
    os = ''
    for i in paths:
        if i in Oss_lower:
            os = i
    if os == '':
        os = 'agnostic'
    return os.capitalize()


def plt_classify(filepath):
    paths = filepath.split('/')
    plt = ''
    for i in paths:
        if i.startswith('gen'):
            if i.startswith('gen8'):
                plt = 'gen8'
            elif i.startswith('gen9'):
                plt = 'gen9'
            elif i.startswith('gen10'):
                plt = 'gen10'
            elif i.startswith('gen11'):
                plt = 'gen11'
            elif i.startswith('gen12'):
                plt = 'gen12'
        elif 'g8' in i:
            plt = 'gen8'
        elif 'g9' in i:
            plt = 'gen9'
        elif 'g10' in i:
            plt = 'gen10'
        elif 'g11' in i:
            plt = 'gen11'
        elif 'g12' in i:
            plt = 'gen12'
    if plt == '':
        plt = 'common'
    return plt.capitalize()
