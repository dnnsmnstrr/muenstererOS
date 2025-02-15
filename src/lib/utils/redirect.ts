import { DEFAULT_URL } from "../config";

export type Redirect = {
  name: string;
  description?: string;
  url?: string;
  aliases?: string[]
}


type RedirectOptions = {
  log?: (...inputs: any) => void;
  returnObject?: boolean;
  noReturn?: boolean;
}
export function getRedirect (query: string, redirects: Redirect[], options?: RedirectOptions) {
  if (options && options.log) {
    options.log('query', query)
  }
  let redirect: Redirect = { name: '' }
  switch (query) {
    // special cases
    case 'random':
      redirect = redirects[Math.floor(Math.random() * redirects.length)]
      break
    default:
      // search for redirect
      const foundRedirect = redirects.find(({name = '', aliases = [], url}) => {
        if (!name) {
          console.log('missing name for', url, aliases)
          return false
        }
        return name === query.toLowerCase() || aliases.includes(query.toLowerCase())
      })
      if (foundRedirect) {
        redirect = foundRedirect
      }
  }

  return options?.returnObject ? redirect : getRedirectURL(redirect, {query, ...options})
}

export const getRedirectURL = ({url, name}: Redirect, { query, noReturn }: { query?: string } & RedirectOptions = {}) => {
  let path = ''
  if (url) {
    path = `${url}${path}`
  } else if (name) {
    path = `${DEFAULT_URL}/${name}${path}`
  } else {
    // a failed redirect will end up back here, therefore the 'noReturn' parameter is used to avoid endless loops on redirect attempts
    path = `${DEFAULT_URL}/${!noReturn ? query : ''}`
  }

  return path
}