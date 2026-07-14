import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./support.html', import.meta.url), 'utf8');
const handlerSource = html.match(/async function handleSubmit\(event\) \{[\s\S]*?\n            \}\n\n            const fieldStyle/)?.[0]
    .replace(/\n\n            const fieldStyle[\s\S]*/, '');

assert.match(html, /action="https:\/\/api\.web3forms\.com\/submit"/);
assert.match(html, /name="access_key" value="eb1d144d-15d8-4ff2-8625-d8561cc5a33a"/);
assert.match(html, /name="botcheck"/);
assert.match(html, /setSelectedFiles\(\[valid\[0\]\]\)/);
assert.doesNotMatch(html, /formsubmit\.co/);
assert.ok(handlerSource, 'Support submit handler should exist');

async function runSubmission(response) {
    const attachment = { name: 'issue.png' };
    const calls = { alerts: [], submitting: [], files: [], success: [] };
    const form = { resetCalled: false, reset() { this.resetCalled = true; } };

    class TestFormData {
        constructor(source) { this.source = source; this.fields = new Map(); }
        set(name, value) { this.fields.set(name, value); }
    }

    let request;
    const handleSubmit = Function(
        'selectedFiles', 't', 'setSubmitting', 'setSelectedFiles', 'setShowSuccess',
        'FormData', 'fetch', 'alert', `return ${handlerSource}`
    )(
        [attachment], { submitError: 'Localized error' },
        value => calls.submitting.push(value), value => calls.files.push(value),
        value => calls.success.push(value), TestFormData,
        async (url, options) => { request = { url, options }; return response; },
        message => calls.alerts.push(message)
    );

    await handleSubmit({ preventDefault() {}, currentTarget: form });
    return { attachment, calls, form, request };
}

const success = await runSubmission({ ok: true, json: async () => ({ success: true }) });
assert.equal(success.request.url, 'https://api.web3forms.com/submit');
assert.equal(success.request.options.method, 'POST');
assert.equal(success.request.options.body.fields.get('attachment'), success.attachment);
assert.equal(success.form.resetCalled, true);
assert.deepEqual(success.calls.success, [true]);
assert.deepEqual(success.calls.submitting, [true, false]);

const rejected = await runSubmission({ ok: false, json: async () => ({ success: false, message: 'Rejected' }) });
assert.deepEqual(rejected.calls.alerts, ['Rejected']);
assert.equal(rejected.form.resetCalled, false);

const malformed = await runSubmission({ ok: false, json: async () => { throw new Error('Parser detail'); } });
assert.deepEqual(malformed.calls.alerts, ['Localized error']);
