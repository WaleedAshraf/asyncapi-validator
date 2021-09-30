declare module 'asyncapi-validator' {
  type Validator = {
    validate: (
      key: string,
      payload: unknown,
      channel: string,
      operation: 'publish' | 'subscribe',
    ) => void;
  };

  const fromSource: (
    path: string | Record<string, unknown>,
    options: { msgIdentifier: string; ignoreArray?: boolean },
  ) => Promise<Validator>;
}
