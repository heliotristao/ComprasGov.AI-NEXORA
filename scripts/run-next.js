#!/usr/bin/env node
process.env.NEXT_DISABLE_ESLINT_PROMPT = process.env.NEXT_DISABLE_ESLINT_PROMPT || '1';
require('next/dist/bin/next');
