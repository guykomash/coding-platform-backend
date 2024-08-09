import { Schema, model } from 'mongoose';

import { CodeBlockInterface } from '../types';

const codeblockSchema = new Schema<CodeBlockInterface>({
  codeBlockId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  templateCode: { type: String, required: true },
  solution: { type: String, required: true },
});

export const CodeBlock = model<CodeBlockInterface>(
  'CodeBlock',
  codeblockSchema
);
