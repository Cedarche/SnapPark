import React, { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { PostHogProvider } from 'posthog-js/react';

const options = {
  api_host: import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST,
};

export const TestWrapper = ({ children }: { children: ReactNode }) => {
  return (
    // <PostHogProvider
    //   apiKey={import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_KEY}
    //   options={options}
    // >
      <RecoilRoot>{children}</RecoilRoot>
    // </PostHogProvider>
  );
};
