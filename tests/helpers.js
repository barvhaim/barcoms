const AxeBuilder = require('@axe-core/playwright').default;

// WCAG 2.0 A/AA is the SI 5568 baseline; 2.1 and 2.2 AA rules are the additional target.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function scan(page, { include } = {}) {
    let builder = new AxeBuilder({ page }).withTags([...WCAG_TAGS, 'best-practice']);
    if (include) builder = builder.include(include);
    const { violations } = await builder.analyze();
    return violations.map(v => ({
        rule: v.id,
        impact: v.impact,
        help: v.help,
        targets: v.nodes.map(n => n.target.join(' ')),
    }));
}

// Freeze animations so contrast is measured on the final rendered colours.
async function settle(page) {
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
}

// Stop the contact form from opening a mail client; records what would have been sent.
async function stubMailto(page) {
    await page.addInitScript(() => {
        window.__sentMail = [];
        window.barcomsContact = { send: url => window.__sentMail.push(url) };
    });
}

module.exports = { scan, settle, stubMailto, WCAG_TAGS };
