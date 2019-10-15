import fetch from 'cross-fetch'

function fetchRequest(key) {
  return {
    type: 'ARARA_FETCH',
    key,
  };
}

function fetchSuccess(key, payload) {
  return {
    type: 'ARARA_FETCH_SUCCESS',
    key,
    payload,
  }
}

function fetchFailure(key) {
  return {
    type: 'ARARA_FETCH_FAILURE',
    key,
  };
}

/* ********************** */

function araraFetch(path, key, params) {
  return dispatch => {
    dispatch(fetchRequest(key));
    const paramKeys = Object.keys(params);
    const paramsQuery = paramKeys.length === 0 ? '' :
      `?${paramKeys.map(key => `${key}=${params[key]}`).join('&')}`;

    const requestPath = `${path}${paramsQuery}`;
    return fetch(requestPath)
      .then(response => response.json())
      .then(json => dispatch(fetchSuccess(key, json)))
      .catch(() => dispatch(fetchFailure(key)))
  }
}

/* ********************** */

export default araraFetch;