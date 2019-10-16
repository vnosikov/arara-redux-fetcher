export default (state = {}, action) => {
  switch (action.type) {
    case 'ARARA_FETCH':
      return {
        ...state,
        [action.key]: {
          isReady: false,
          error: false,
          data: null,
        },
      };

    case 'ARARA_FETCH_SUCCESS':
      return {
        ...state,
        [action.key]: {
          isReady: true,
          error: false,
          data: action.payload,
        },
      };

    case 'ARARA_FETCH_FAILURE':
      return {
        ...state,
        [action.key]: {
          isReady: true,
          error: true,
          data: null,
        },
      };

    default:
      return state;
  }
};
