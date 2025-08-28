import React from 'react';
import { Button } from './ui/button';

interface State { error: Error | null }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
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
          <p>Something went wrong.</p>
          <Button onClick={this.handleRetry}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}