let storage = {
  set(key, data) {
    localStorage[key] = data;
  },
  get(key) {
    return localStorage[key];
  },
  remove(key){
    localStorage.removeItem(key);
  },
  clearAll(){
    localStorage.clear();
  }
}

export default storage;



