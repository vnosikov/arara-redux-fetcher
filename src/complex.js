import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { equals, uniq, flatten } from 'ramda';

import araraFetch from './fetcherAction';
import Loading from './indicators/Loading';
import Error from './indicators/Error';


const withComplexAraraFetcher = (
  Component,
  pathes,
  reduxDataKeys,
  forwardPropNames,
  fetchParamNames,
  reduxRoot = 'pages',
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
          needsAFetch: false,
        });
      }
    }

    render() {
      const { data, error, ...otherProps } = this.props;
      const { showIndicator } = this.state;

      const emptyData = Object.values(data).some(d => d === null);

      if (showIndicator) {
        return <Loading />;
      }

      if (error) {
        return <Error />;
      }

      if (emptyData) {
        return null;
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
      const curState = reduxRoot ? state[reduxRoot] : state;
      const defaultValue = { isReady: true, error: false };
      const beforeReduce = reduxDataKeys.map(key => {
        if (!curState[key]) {
          return {
            isReady: false,
            error: false,
            data: null,
          };
        }

        return {
          isReady: curState[key].isReady,
          error: curState[key].error,
          data: curState[key].data,
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
