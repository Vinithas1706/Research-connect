const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'ANTHROPIC_API_KEY not set in .env file. Add your key to enable real AI replies.'
      });
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: message }]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.content
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n');

    return res.json({ success: true, reply });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    return res.status(500).json({ success: false, message: 'Chat API error. Check your API key.' });
  }
});

module.exports = router;
