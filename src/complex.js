import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { equals, uniq, flatten } from 'ramda';

import araraFetch from './fetcherAction';


const withComplexAraraFetcher = (
  Component,
  pathes,
  reduxDataKeys,
  forwardPropNames,
  fetchParamNames,
) => {
  if (
    pathes.length !== reduxDataKeys.length ||
    reduxDataKeys.length !== forwardPropNames.length ||
    forwardPropNames.length !== fetchParamNames.length
  ) {
    throw Error('Wrong parameters of complex fetcher');
  }

  const uniqParamNames = uniq(flatten(fetchParamNames));

  class AraraComplexFetcher extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showIndicator: false,
        needsAFetch: false,
        current: uniqParamNames.reduce(
          (acc, name) => ({
            ...acc,
            [name]: props[name],
          }),
          {},
        ),
      };
    }

    static getDerivedStateFromProps(props, state) {
      const significantPropChanged = uniqParamNames.some(
        propName => !equals(props[propName], state.current[propName]),
      );
      if (significantPropChanged) {
        return {
          showIndicator: true,
          needsAFetch: true,
          current: uniqParamNames.reduce(
            (acc, name) => ({
              ...acc,
              [name]: props[name],
            }),
            {},
          ),
        };
      }

      if (props.isReady && state.showIndicator) {
        return {
          showIndicator: false,
          needsAFetch: false,
        };
      }

      return null;
    }

    componentDidMount() {
      this.setState({
        needsAFetch: true,
      });
      this.checkAndFetch();
    }

    componentDidUpdate() {
      this.checkAndFetch();
    }

    checkAndFetch = () => {
      const { doFetch } = this.props;
      const { needsAFetch } = this.state;
      if (needsAFetch) {
        doFetch();
        this.setState({
          showIndicator: true, 
          needsAFetch: false
        });
      }
    }

    render() {
      const { data, error, ...otherProps } = this.props;
      const { showIndicator } = this.state;

      if (showIndicator) {
        return <div>Loading</div>;
      }

      if (error) {
        return <div>Error</div>;
      }

      return <Component {...data} {...otherProps} />;
    }
  }

  AraraComplexFetcher.defaultProps = {
    data: null,
  };

  AraraComplexFetcher.propTypes = {
    isReady: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    data: PropTypes.any,
    doFetch: PropTypes.func.isRequired,
  };

  return connect(
    state => {
      const defaultValue = { isReady: true, error: false };
      const beforeReduce = reduxDataKeys.map(key => {
        if (!state.pages[key]) {
          return {
            isReady: false,
            error: false,
            data: null,
          };
        }

        return {
          isReady: state.pages[key].isReady,
          error: state.pages[key].error,
          data: state.pages[key].data,
        };
      });

      const fetchStatus = beforeReduce.reduce((acc, val, i) => ({
        ...acc,
        isReady: acc.isReady && val.isReady,
        error: acc.error || val.error,
        [forwardPropNames[i]]: val.data,
      }), defaultValue);

      const { isReady, error, ...data } = fetchStatus;

      return {
        isReady,
        error,
        data,
      };
    },
    (dispatch, ownProps) => ({
      doFetch: () => {
        pathes.forEach((path, i) => {
          dispatch(araraFetch(
            path,
            reduxDataKeys[i],
            fetchParamNames[i].reduce(
              (acc, name) => ({
                ...acc,
                [name]: ownProps[name],
              }),
              {},
            ),
          ));
        });
      },
    }),
  )(AraraComplexFetcher);
};

export default withComplexAraraFetcher;
