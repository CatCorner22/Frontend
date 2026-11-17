// A reference build for the tests: the Mockup of a project, changed in the few places where the Vision says that a built page must
// differ from the Mockup (VISION.md section 7: "`mockup.html` is a reference for the design only"). The Mockup is a still page: its
// links lead nowhere, its form sends nothing, and its policy blocks files and forms. A built page has links, a form that posts, a
// policy with the rules of requirement S5, a referrer tag, a description, and length limits on its text fields.
export function built(mockup: string): string {
  const once = (text: string, from: string | RegExp, to: string): string => {
    const next = text.replace(from, to);
    if (next === text) throw new Error(`The Mockup has changed: the reference build could not replace ${String(from)}.`);
    return next;
  };
  let html = mockup.replaceAll('role="link" tabindex="0"', 'href="#main"');
  html = once(html, /<meta http-equiv="Content-Security-Policy" content="[^"]*">/, `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; object-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; form-action 'self'; base-uri 'none'">`);
  html = once(html, '</title>', '</title>\n<meta name="description" content="A small practice that explains each step before it begins.">\n<meta name="referrer" content="strict-origin-when-cross-origin">');
  html = once(html, '<form class="form card">', '<form class="form card" method="post" action="#contact">');
  html = html.replace(/<input (?![^>]*maxlength)/g, '<input maxlength="80" ').replace(/<textarea (?![^>]*maxlength)/g, '<textarea maxlength="600" ');
  return html;
}
