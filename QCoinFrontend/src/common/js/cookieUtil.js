export function getCookie(cookieStr, key) {
  let cookies = cookieStr.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].indexOf(key) !== -1) {
      return cookies[i].split('=')[1]
    }
  }

}
