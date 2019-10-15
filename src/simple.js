import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { equals } from 'ramda';

import araraFetch from './fetcherAction';


const withAraraFetcher = (
  Component,
  path,
  reduxDataKey,
  fetchParamNames = []
) => {
  class AraraFetcher extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showIndicator: false,
        needsAFetch: false,
        current: fetchParamNames.reduce(
          (acc, name) => ({
            ...acc,
            [name]: props[name],
          }),
          {},
        ),
      };
    }

    static getDerivedStateFromProps(props, state) {
      const significantPropChanged = fetchParamNames.some(
        propName => !equals(props[propName], state.current[propName]),
      );
      if (significantPropChanged) {
        return {
          showIndicator: true,
          needsAFetch: true,
          current: fetchParamNames.reduce(
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

      return <Component data={data} {...otherProps} />;
    }
  }

  AraraFetcher.defaultProps = {
    data: null,
  };

  AraraFetcher.propTypes = {
    isReady: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    data: PropTypes.any,
    doFetch: PropTypes.func.isRequired,
  };

  return connect(
    state => {
      if (!state.pages[reduxDataKey]) {
        return {
          isReady: false,
          error: false,
          data: null,
        };
      }
      return {
        isReady: state.pages[reduxDataKey].isReady,
        error: state.pages[reduxDataKey].error,
        data: state.pages[reduxDataKey].data,
      };
    },

    (dispatch, ownProps) => ({
      doFetch: () => {
        dispatch(araraFetch(
          path,
          reduxDataKey,
          fetchParamNames.reduce(
            (acc, name) => ({
              ...acc,
              [name]: ownProps[name],
            }),
            {},
          ),
        ));
      },
    }),
  )(AraraFetcher);
};

export default withAraraFetcher;
