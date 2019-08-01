class GitCategorize {
  static get Comps() {
    return ['MDF', 'CODEC', 'MHW', 'MOS', 'VP', 'DDI', 'CP']
  }

  static get CompTags() {
    return {
      cm: 'MDF',
      codec: 'CODEC',
      heap_manager: 'MHW',
      hw: 'MHW',
      media_interfaces: 'MHW',
      os: 'MOS',
      renderhal: 'MHW',
      shared: 'HALCOMMON',
      vp: 'VP',
      ddi: 'DDI',
      msdk: 'DDI',
      ecdsa: 'DDI',
      hdcp: 'CP',
      cp: 'CP',
      cm_fc_ld: 'CM'
    }
  }

  static component(path) {
    const paths = path.split('/').filter(x => x);
    let comp = '';
    for (let i of paths) {
      if (Object.keys(GitCategorize.CompTags).includes(i)) {
        if (i === 'ddi' && ['CODEC', 'VP', 'CP'].includes(comp))
          return comp;
        comp = GitCategorize.CompTags[i]
      }
    }
    if (comp === '' || comp === 'CM')
      return 'MDF';
    if (comp === 'HALCOMMON')
      return 'CODEC';
    return comp
  }
}


module.exports = GitCategorize;
