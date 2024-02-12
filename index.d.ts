declare module 'asyncapi-validator' {
  type Validator = {
    validate: (
      key: string,
      payload: unknown,
      channel: string,
      operation: 'publish' | 'subscribe',
      messageField: 'payload' | 'x-ack'
    ) => boolean;

    validateByMessageId: (
      key: string,
      payload: unknown,
      messageField: 'payload' | 'x-ack'
    ) => boolean;
  };

  const fromSource: (
    path: string | Record<string, unknown>,
    options?: { msgIdentifier?: string; ignoreArray?: boolean, path?: string },
  ) => Promise<Validator>;
}
