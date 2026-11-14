// Mockup previews. Each preview is a sandboxed frame: no scripts, no forms, no access to the Studio.
import { deriveTokens, renderSmallBusiness, wireframeParams, type A11yProfile, type DesignParams, type FontId, type MeasuredPair, type MockupFocus, type Project, type TokenIssue } from '@refraction/core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fontFaceCss } from './fonts';

export interface MockupOptions {
  /** Show the layout only, in gray (for Structure Steps). */
  wireframe: boolean;
  focus: MockupFocus;
  /** A still preview skips the entrance animation. Every preview is still except the one that demonstrates motion. */
  still: boolean;
}

export interface MockupResult {
  html: string;
  issues: TokenIssue[];
  pairs: MeasuredPair[];
}

/**
 * Mockup documents that were built already, by what they were built from. A Step shows up to fourteen cards, and a slider
 * step changes one of them; without this memory every card was built again on every step, which cost 61 to 92 milliseconds
 * of work per step and made the preview run behind the hand (code review of 2026-11-13, finding "screen 0").
 * The memory holds a bounded number of documents; the oldest go first.
 */
const built = new Map<string, MockupResult>();
const BUILT_MAX = 96;
type Derived = ReturnType<typeof deriveTokens>;
const derived = new Map<string, Derived>();

/** The colors and sizes of a design, worked out once and remembered. The cards' color chips and the Mockup share them. */
export function tokensFor(params: DesignParams, profile: A11yProfile): Derived {
  const key = JSON.stringify([params, profile]);
  let tokens = derived.get(key);
  if (!tokens) {
    tokens = deriveTokens(params, profile);
    derived.set(key, tokens);
    if (derived.size > BUILT_MAX * 2) derived.delete(derived.keys().next().value as string);
  }
  return tokens;
}

/** Build the Mockup document for a set of design parameters. Links inside a preview are inert (they lead nowhere). */
export function mockupHtml(project: Project, params: DesignParams, options: MockupOptions): MockupResult {
  const shown = options.wireframe ? wireframeParams(params) : params;
  const key = JSON.stringify([shown, project.a11y, project.content, options.focus, options.still]);
  const known = built.get(key);
  if (known) {
    // Used again: move it to the young end.
    built.delete(key);
    built.set(key, known);
    return known;
  }
  const tokens = tokensFor(shown, project.a11y);
  const fonts: FontId[] = [shown.fontHeading, shown.fontBody];
  if (shown.numerals === 'mono') fonts.push('jetbrains-mono');
  const html = renderSmallBusiness({ params: shown, tokens: tokens.css, content: project.content, focus: options.focus, still: options.still, fontFaceCss: fontFaceCss(fonts), links: 'inert' });
  const result: MockupResult = { html, issues: tokens.issues, pairs: tokens.pairs };
  built.set(key, result);
  if (built.size > BUILT_MAX) built.delete(built.keys().next().value as string);
  return result;
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

let frameSerial = 0;
/**
 * A key that changes whenever the document changes. A frame with a new key is a new frame, so the browser adds
 * no entry to its history. Changing the document of an existing frame would add one entry per comparison,
 * and the browser's Back button would then appear dead (finding FTU-16).
 */
function useFrameKey(html: string, replay = 0): number {
  const ref = useRef<{ html: string; replay: number; key: number } | null>(null);
  if (!ref.current || ref.current.html !== html || ref.current.replay !== replay) ref.current = { html, replay, key: ++frameSerial };
  return ref.current.key;
}

interface ThumbnailProps {
  html: string;
  /** The width the Mockup is rendered at before it is scaled down to the card. */
  width: number;
  /** Height of the picture as a share of its width. */
  ratio?: number;
  lazy?: boolean;
}

/** A small, scaled-down picture with a fixed shape. It is inert: keyboard focus and clicks pass over it. */
export function Thumbnail({ html, width, lazy = true, ratio = 0.62 }: ThumbnailProps): React.JSX.Element {
  const [ref, size] = useSize();
  const key = useFrameKey(html);
  const scale = size.width > 0 ? size.width / width : 0;
  const height = Math.round(width * ratio);
  return (
    <div ref={ref} className="thumb" inert style={{ height: size.width > 0 ? Math.round(height * scale) : undefined, aspectRatio: size.width > 0 ? undefined : `1 / ${ratio}` }}>
      {scale > 0 && (
        <iframe
          key={key}
          title=""
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

interface LargePreviewProps {
  html: string;
  /** The width the Mockup is rendered at: 375, 768, or 1280. */
  width: number;
  title: string;
  /** Raise this number to load the page again, which replays its entrance. */
  replay?: number;
}

/**
 * The large preview. It fills its pane; the page inside scrolls and responds to hover.
 * The pane must get its height from the layout around it (a fixed height, or a share of a container of known height), never from its content.
 */
export function LargePreview({ html, width, title, replay = 0 }: LargePreviewProps): React.JSX.Element {
  const [ref, size] = useSize();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [inside, setInside] = useState(false);
  const key = useFrameKey(html, replay);
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
      <span className="sample-tag" aria-hidden="true">Sample website</span>
      {scale > 0 && (
        <iframe
          key={key}
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
