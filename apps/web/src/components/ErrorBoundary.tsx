import React from 'react';
import { Button } from './ui/button';
import { withTranslation, WithTranslation } from 'react-i18next';

interface State { error: Error | null }

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}> & WithTranslation, State> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error(error, info);
  }
  handleRetry = () => {
    this.setState({ error: null });
  };
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-center space-y-4">
          <p>{this.props.t('messages.unexpectedError')}</p>
          <Button onClick={this.handleRetry}>{this.props.t('buttons.retry')}</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);