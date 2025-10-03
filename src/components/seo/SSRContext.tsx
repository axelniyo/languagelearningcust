import { createContext } from 'react';

export interface SSRContextType {
  title?: string;
  metaDescription?: string;
  [key: string]: any;
}

// Default context value
const defaultContext: SSRContextType = {};

// Create the context with a default value
export const SSRContext = createContext<SSRContextType>(defaultContext);

// Context provider component
export const SSRProvider: React.FC<{ value?: SSRContextType; children: React.ReactNode }> = ({
  value = {},
  children,
}) => {
  return (
    <SSRContext.Provider value={value}>
      {children}
    </SSRContext.Provider>
  );
};

// Higher-order component to provide SSR context
export const withSSRContext = (WrappedComponent: React.ComponentType<any>) => {
  const WithSSRContext: React.FC<any> = (props) => {
    return (
      <SSRContext.Consumer>
        {(context) => <WrappedComponent {...props} ssrContext={context} />}
      </SSRContext.Consumer>
    );
  };

  // Set a display name for the HOC for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithSSRContext.displayName = `withSSRContext(${displayName})`;

  return WithSSRContext;
}


