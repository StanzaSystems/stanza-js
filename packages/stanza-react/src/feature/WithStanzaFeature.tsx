import type React from 'react';
import { useStanzaContext } from '../hooks/useStanzaContext';

type FallbackFn = (props: { message: string }) => React.ReactNode | undefined;

type RenderChildrenFn = (options: {
  disabled: boolean;
  message: string;
}) => React.ReactNode;

interface WithStanzaFeatureProps {
  name: string;
  fallback?: FallbackFn;
  children: React.ReactNode | RenderChildrenFn;
}

export function WithStanzaFeature(props: {
  children: RenderChildrenFn;
  name: string;
  fallback?: never;
}): React.ReactNode;
export function WithStanzaFeature(props: {
  children: React.ReactNode;
  name: string;
  fallback?: FallbackFn;
}): React.ReactNode;
export function WithStanzaFeature({
  children,
  name,
  fallback,
}: WithStanzaFeatureProps): React.ReactNode {
  const stanzaContext = useStanzaContext();
  const feature = stanzaContext?.features[name];

  const { renderChildren, renderFallback } = (
    typeof children === 'function'
      ? {
          renderChildren: children,
          renderFallback: (props) => children({ ...props, disabled: true }),
        }
      : {
          renderChildren: () => children,
          renderFallback: fallback ?? (() => undefined),
        }
  ) satisfies { renderChildren: RenderChildrenFn; renderFallback: FallbackFn };

  const message = feature?.message ?? '';
  return feature?.disabled !== true
    ? renderChildren({ message, disabled: false })
    : renderFallback({ message });
}
