import { AccessibilityIssue, AccessibilityReport } from '@/types/accessibility';

export const sampleIssues: AccessibilityIssue[] = [
  {
    id: '1',
    title: 'Image missing alt text',
    description: 'An image element is missing the alt attribute, which provides alternative text for screen readers and when images fail to load.',
    wcagCriteria: '1.1.1',
    wcagLevel: 'A',
    severity: 'critical',
    element: '<img src="hero-banner.jpg" class="hero-image">',
    aiSuggestion: 'Add a descriptive alt attribute that conveys the meaning or purpose of the image. If the image is decorative, use alt="" to indicate it should be ignored by assistive technologies.',
    fixedCodeSnippet: '<img src="hero-banner.jpg" class="hero-image" alt="Team collaboration in a modern office space">',
  },
  {
    id: '2',
    title: 'Insufficient color contrast',
    description: 'The text color does not have sufficient contrast against its background color, making it difficult to read for users with low vision.',
    wcagCriteria: '1.4.3',
    wcagLevel: 'AA',
    severity: 'critical',
    element: '<p style="color: #999; background: #fff">Light gray text on white</p>',
    aiSuggestion: 'Increase the contrast ratio to at least 4.5:1 for normal text or 3:1 for large text. Use a darker text color like #666 or darker, or adjust the background.',
    fixedCodeSnippet: '<p style="color: #595959; background: #fff">Accessible gray text on white</p>',
  },
  {
    id: '3',
    title: 'Missing form label',
    description: 'A form input element is not associated with a label, making it unclear what information should be entered.',
    wcagCriteria: '1.3.1',
    wcagLevel: 'A',
    severity: 'critical',
    element: '<input type="email" placeholder="Enter email">',
    aiSuggestion: 'Associate a label element with the input using the for attribute matching the input\'s id, or wrap the input inside a label element.',
    fixedCodeSnippet: '<label for="email">Email Address</label>\n<input type="email" id="email" placeholder="Enter email">',
  },
  {
    id: '4',
    title: 'Skipped heading level',
    description: 'The page jumps from h1 to h3, skipping h2. This creates a confusing document structure for screen reader users.',
    wcagCriteria: '1.3.1',
    wcagLevel: 'A',
    severity: 'moderate',
    element: '<h1>Main Title</h1>\n<h3>Subsection</h3>',
    aiSuggestion: 'Maintain a logical heading hierarchy. Use h2 for main sections under h1, h3 for subsections under h2, and so on.',
    fixedCodeSnippet: '<h1>Main Title</h1>\n<h2>Subsection</h2>',
  },
  {
    id: '5',
    title: 'Link without discernible text',
    description: 'A link element contains no text content, making it impossible for screen reader users to understand its purpose.',
    wcagCriteria: '2.4.4',
    wcagLevel: 'A',
    severity: 'critical',
    element: '<a href="/profile"><img src="avatar.png"></a>',
    aiSuggestion: 'Add descriptive text to the link, either as visible text or using aria-label. If using an image, ensure it has meaningful alt text.',
    fixedCodeSnippet: '<a href="/profile" aria-label="View your profile">\n  <img src="avatar.png" alt="">\n</a>',
  },
  {
    id: '6',
    title: 'Missing ARIA label on interactive element',
    description: 'An interactive button element has no accessible name, making its purpose unclear to assistive technology users.',
    wcagCriteria: '4.1.2',
    wcagLevel: 'A',
    severity: 'moderate',
    element: '<button><svg><!-- menu icon --></svg></button>',
    aiSuggestion: 'Add an aria-label attribute to describe the button\'s purpose, or include visually hidden text inside the button.',
    fixedCodeSnippet: '<button aria-label="Open navigation menu">\n  <svg><!-- menu icon --></svg>\n</button>',
  },
  {
    id: '7',
    title: 'Focus indicator not visible',
    description: 'The focus indicator has been removed or is not visible, making keyboard navigation difficult.',
    wcagCriteria: '2.4.7',
    wcagLevel: 'AA',
    severity: 'moderate',
    element: 'a:focus { outline: none; }',
    aiSuggestion: 'Ensure all interactive elements have a visible focus indicator. If removing the default outline, provide a custom focus style.',
    fixedCodeSnippet: 'a:focus {\n  outline: 2px solid #0066cc;\n  outline-offset: 2px;\n}',
  },
  {
    id: '8',
    title: 'Auto-playing media without controls',
    description: 'Media content auto-plays without providing pause controls, which can be disorienting for some users.',
    wcagCriteria: '1.4.2',
    wcagLevel: 'A',
    severity: 'moderate',
    element: '<video autoplay><source src="promo.mp4"></video>',
    aiSuggestion: 'Either remove autoplay, limit auto-play to 5 seconds, or ensure pause/stop controls are immediately available.',
    fixedCodeSnippet: '<video autoplay muted controls>\n  <source src="promo.mp4">\n</video>',
  },
  {
    id: '9',
    title: 'Text cannot be resized',
    description: 'Text is set with fixed pixel sizes that prevent users from resizing text up to 200% without loss of content.',
    wcagCriteria: '1.4.4',
    wcagLevel: 'AA',
    severity: 'minor',
    element: 'body { font-size: 12px; }',
    aiSuggestion: 'Use relative units like rem or em instead of fixed px values for font sizes to allow proper scaling.',
    fixedCodeSnippet: 'body { font-size: 1rem; } /* 16px default */',
  },
  {
    id: '10',
    title: 'Language not specified',
    description: 'The page does not specify a language, which can affect how screen readers pronounce content.',
    wcagCriteria: '3.1.1',
    wcagLevel: 'A',
    severity: 'minor',
    element: '<html>',
    aiSuggestion: 'Add the lang attribute to the html element to specify the primary language of the page.',
    fixedCodeSnippet: '<html lang="en">',
  },
];

export const generateSampleReport = (url: string): AccessibilityReport => {
  const issues = sampleIssues;
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const moderate = issues.filter((i) => i.severity === 'moderate').length;
  const minor = issues.filter((i) => i.severity === 'minor').length;

  // Calculate score: start at 100, deduct points based on severity
  const score = Math.max(0, Math.round(
    100 - (critical * 12) - (moderate * 5) - (minor * 2)
  ));

  return {
    id: crypto.randomUUID(),
    url,
    scanDate: new Date(),
    score,
    issues,
    summary: {
      critical,
      moderate,
      minor,
      total: issues.length,
    },
  };
};
