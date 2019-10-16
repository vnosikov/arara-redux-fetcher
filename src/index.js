// import withAraraFetcher from './simple';
import withComplexAraraFetcher from './complex';
import fetcherReducer from './fetcherReducer';


const withAraraFetcher = (
  Component,
  path,
  reduxDataKey,
  fetchParamNames = [],
  reduxRoot = 'pages',
) => withComplexAraraFetcher(
  Component,
  [path],
  [reduxDataKey],
  ['data'],
  [fetchParamNames],
  reduxRoot,
);

export {
  withAraraFetcher,
  withComplexAraraFetcher,
  fetcherReducer,
};
