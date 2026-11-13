// Mockup previews. Each preview is a sandboxed frame: no scripts, no access to the Studio.
import { deriveTokens, renderSmallBusiness, wireframeParams, type DesignParams, type FontId, type MockupFocus, type Project, type TokenIssue } from '@refraction/core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fontFaceCss } from './fonts';

export interface MockupOptions {
  wireframe: boolean;
  focus: MockupFocus;
  still: boolean;
}

/** Build the Mockup document for a set of design parameters. */
export function mockupHtml(project: Project, params: DesignParams, options: MockupOptions): { html: string; issues: TokenIssue[] } {
  const shown = options.wireframe ? wireframeParams(params) : params;
  const tokens = deriveTokens(shown, project.a11y);
  const fonts: FontId[] = [shown.fontHeading, shown.fontBody];
  if (shown.numerals === 'mono') fonts.push('jetbrains-mono');
  const html = renderSmallBusiness({
    params: shown,
    tokens: tokens.css,
    content: project.content,
    stage: options.wireframe ? 'structure' : 'feel',
    focus: options.focus,
    still: options.still,
    fontFaceCss: fontFaceCss(fonts),
  });
  return { html, issues: tokens.issues };
}

function useSize(): [React.RefObject<HTMLDivElement | null>, { width: number; height: number }] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = (): void => setSize({ width: el.clientWidth, height: el.clientHeight });
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}

interface FrameProps {
  html: string;
  /** The width the Mockup is rendered at: 375, 768, or 1280. */
  width: number;
  title: string;
  /** Thumbnails are still images: not focusable, not clickable. */
  interactive?: boolean;
  lazy?: boolean;
}

/** A small, scaled-down preview with a fixed shape. It is inert: keyboard focus and clicks pass over it. */
export function Thumbnail({ html, width, title, lazy = true, ratio = 0.62 }: FrameProps & { ratio?: number }): React.JSX.Element {
  const [ref, size] = useSize();
  const scale = size.width > 0 ? size.width / width : 0;
  const height = Math.round(width * ratio);
  return (
    <div ref={ref} className="thumb" inert style={{ height: size.width > 0 ? Math.round(height * scale) : undefined, aspectRatio: size.width > 0 ? undefined : `1 / ${ratio}` }}>
      {scale > 0 && (
        <iframe
          title={title}
          sandbox=""
          srcDoc={html}
          loading={lazy ? 'lazy' : 'eager'}
          tabIndex={-1}
          aria-hidden="true"
          style={{ width, height, transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none' }}
        />
      )}
    </div>
  );
}

/**
 * The large preview. It fills its pane; the page inside scrolls and responds to hover.
 * The pane must get its height from the layout around it (a fixed height, or a share of a container of known height), never from its content.
 */
export function LargePreview({ html, width, title }: FrameProps): React.JSX.Element {
  const [ref, size] = useSize();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [inside, setInside] = useState(false);
  const scale = size.width > 0 ? Math.min(1, size.width / width) : 0;
  const frameHeight = scale > 0 ? Math.max(200, Math.round(size.height / scale)) : 0;

  // When keyboard focus moves into the frame, the surrounding page only learns that its window lost focus.
  // The pane then shows a ring, so that a keyboard user can see that focus is inside the preview.
  useEffect(() => {
    const update = (): void => setInside(frameRef.current !== null && document.activeElement === frameRef.current);
    window.addEventListener('blur', update);
    window.addEventListener('focus', update);
    document.addEventListener('focusin', update);
    return () => {
      window.removeEventListener('blur', update);
      window.removeEventListener('focus', update);
      document.removeEventListener('focusin', update);
    };
  }, []);

  return (
    <div ref={ref} className="large-preview" data-focus-inside={inside || undefined}>
      {scale > 0 && (
        <iframe
          ref={frameRef}
          title={title}
          sandbox=""
          srcDoc={html}
          // The frame is taken out of the layout, so that the pane's height never depends on the page inside it.
          style={{ position: 'absolute', top: 0, left: Math.max(0, Math.round((size.width - width * scale) / 2)), width, height: frameHeight, transform: `scale(${scale})`, transformOrigin: '0 0' }}
        />
      )}
    </div>
  );
}
