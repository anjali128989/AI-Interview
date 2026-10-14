const fs = require('fs');

async function test() {
  try {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\n'),
      Buffer.from('Content-Disposition: form-data; name="resume"; filename="test.pdf"\r\n'),
      Buffer.from('Content-Type: application/pdf\r\n\r\n'),
      Buffer.from('PDF-1.4...fake content...\r\n'),
      Buffer.from('--' + boundary + '--\r\n')
    ]);

    const res = await fetch('https://ai-interview-backend-tan.vercel.app/api/resume/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary },
      body: body
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
