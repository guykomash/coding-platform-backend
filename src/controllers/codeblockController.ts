import { Request, Response } from 'express';

import { CodeBlock } from '../models/codeblock';

export async function getAll(req: Request, res: Response) {
  try {
    const CodeBlocks = await CodeBlock.find()
      .select(`-solution -templateCode`)
      .exec();
    if (!CodeBlocks) {
      res.status(204).json({ message: 'No code blocks found.' }).end();
    } else {
      res.status(200).send({ CodeBlocks }).end();
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Server fecthing all code blocks.' });
  }
}

export async function getCodeBlockData(codeBlockId: string) {
  try {
    if (!codeBlockId) {
      console.error('getCodeBlockData() : No codeBlockId');
      return;
    }

    // Implement later with db
    // get the code block (from db) => should be awaited
    const codeBlock = await CodeBlock.findOne({
      codeBlockId: codeBlockId,
    }).exec();
    if (!codeBlock) {
      console.error(
        `getCodeBlockData(): No code block with codeBlockId=${codeBlockId}`
      );
      return;
    }
    // All good. return codeBlock
    return codeBlock;
  } catch (err) {
    console.error(err);
    return;
  }
}
