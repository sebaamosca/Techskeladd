declare module 'odoo-xmlrpc' {
  interface OdooConfig {
    url: string;
    port: number;
    db: string;
    username: string;
    password: string;
    protocol?: string;
  }

  class Odoo {
    constructor(config: OdooConfig);
    connect(callback: (err: Error, value: any) => void): void;
    execute_kw(
      model: string,
      method: string,
      params: any[],
      callback: (err: Error, value: any) => void,
    ): void;
  }

  export = Odoo;
}
