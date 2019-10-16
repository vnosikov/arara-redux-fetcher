// import withAraraFetcher from './simple';
import withComplexAraraFetcher from './complex';
import fetcherReducer from './fetcherReducer';


const withAraraFetcher = (
  Component,
  path,
  reduxDataKey,
  fetchParamNames = [],
  options = {},
) => withComplexAraraFetcher(
  Component,
  [path],
  [reduxDataKey],
  ['data'],
  [fetchParamNames],
  options,
);

export {
  withAraraFetcher,
  withComplexAraraFetcher,
  fetcherReducer,
};
