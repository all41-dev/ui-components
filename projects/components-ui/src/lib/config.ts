import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Config {
  protected static _serverConfig = undefined;
  protected static _serverUser = undefined;
  protected static _serverToken = undefined;

  protected static _configPromise: Promise<void> = undefined;
  protected static _userPromise: Promise<void> = undefined;
  protected static _tokenPromise: Promise<void> = undefined;
  
  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(protected httpClient: HttpClient) {}

  public async init(configUri = `/_config`, userUri = '/user', tokenUri = '/token'): Promise<void> {
    console.trace(`Config.init() configUri: ${configUri}`);
    if (Config._serverConfig) {
      return;
    }

    if ( !Config._configPromise ) {
      console.trace(`Config.init() #2 configUri: ${configUri}`);
      Config._configPromise = this.httpClient.get(configUri).toPromise().then((config: any): void => {
        // console.debug(config);
        Config._serverConfig = config;
        if (config.authType && config.authType === 'server') {// 'client'|'server'|undefined
          if ( !Config._serverUser && !Config._userPromise ) {
            Config._userPromise = this.httpClient.get(userUri).toPromise().then((user): void => {
              Config._serverUser = user;
            }, (err): void => console.error(`Error while retriving ${userUri}: ${JSON.stringify(err)}`));
          }
          if ( !Config._serverToken && !Config._tokenPromise ) {
            Config._tokenPromise = this.httpClient.get(tokenUri).toPromise().then((token): void => {
              Config._serverToken = token;
            }, (err): void => console.error(`Error while retriving ${tokenUri}: ${JSON.stringify(err)}`));
          }    
        }
      }), (err): void => console.error(`Error while retriving ${configUri}: ${JSON.stringify(err)}`);
    }
    await Config._configPromise;

    if (Config._userPromise) { await Config._userPromise; }
    if (Config._tokenPromise) { await Config._tokenPromise; }
  }
  public get(prop: string): any {
    if (!Config._serverConfig) {
      throw new Error('Config has not been initialized, ensure init() has been invoked and finished successfully.');
    }
    if (prop === 'user') { return Config._serverUser; }
    if (prop === 'token') { return Config._serverToken; }
    // console.debug(`serving prop '${prop}' from:`);
    // console.debug(Config._serverConfig);
    // console.debug(`value: ${Config._serverConfig[prop]}`);
    return Config._serverConfig[prop];
  }
  public async getAsync(prop: string, configUrl?: string): Promise<any> {
    if (!Config._serverConfig) { await this.init(configUrl); }
    return this.get(prop);
  }
  public async getAuthConfig(configUrl?: string): Promise<any> {
    await this.init(configUrl);
    return {
      issuer: this.get('oAuthServerRootUrl'),
      redirectUri: window.location.href,
      clientId: this.get('clientId'),
      scope: this.get('scope'),
      requireHttps: false,
      strictDiscoveryDocumentValidation: false,
      disableAtHashCheck: true
    };
  }
}
