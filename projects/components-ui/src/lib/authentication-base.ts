import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { AddHeadersInterceptor } from './add-headers';
import { OnInit } from '@angular/core';
import { Config } from './config';

export abstract class AuthenticationBase implements OnInit {
  public user: any;
  public token: any;

  /** @description should be set in main html as:
   *  @example
   *    <script>
          (function() {
            window['_app_base'] = ('/' + window.location.pathname.split('/')[1] + '/').replace('//', '/');
          })();
        </script>
    * */
  public baseUrl: string;
  public scopes: string[] = [];

  private _authCompleted = false;
  public get isAuthCompleted(): boolean { return this._authCompleted; };
  protected setAuthCompleted(): void { this._authCompleted = true; }
  private _isIdTokenSet = false;
  public get isIdTokenSet(): boolean {
    return this._isIdTokenSet;
  }
  public set isIdTokenSet(val: boolean) {
    this._isIdTokenSet = val;

    if (val) {
      this.afterAuthInit();
    }
  }
  public get authUser(): string {
    const user = this.oauthService.getIdentityClaims() as any;
    return user === null ? undefined : user.username;
  }

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(protected oauthService: OAuthService, protected config: Config) {
    this.baseUrl = window['_app_base'] || '/';
    // console.debug(`AuthenticationBase.constructor() baseUrl: ${this.baseUrl}`);
  }
  public async ngOnInit(): Promise<void> {
    await this.config.init(this.baseUrl + '_config').then(() => {
      const authType = this.config.get('authType');
      // console.trace(`Auth type: ${authType}`)
      if (authType === 'server' || authType === undefined) {
        this.afterAuthInit();
      } else {
        // console.trace(`AuthenticationBase.ngOnInit() #2 baseUrl: ${this.baseUrl}`)
        this.config.getAuthConfig(this.baseUrl + '_config').then((authConfig): void => {
          this.authInit(authConfig);
          // this.afterAuthInit();
        });  
      }
    });
  }
  public login(): void {
    if (document.URL.indexOf('localhost') === -1 || confirm('start login process ?'))
    { this.oauthService.initImplicitFlow(); }
  }

  public logout(): void {
    this.oauthService.logOut();
  }
  protected authInit(config: AuthConfig): void {
    this.oauthService.setStorage(localStorage);
    this.oauthService.configure(config);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    this.oauthService.loadDiscoveryDocumentAndTryLogin().then((): void => {
      // console.debug('loadDiscoveryDocumentAndTryLogin success');
      const idToken = this.oauthService.getIdToken();
      if (idToken === null) {
        this.login();
      }
      AddHeadersInterceptor.idToken = idToken;
      this.isIdTokenSet = true;
    }, (/*_reason*/): void => {
      // console.error(`loadDiscoveryDocumentAndTryLogin error: ${_reason}`);
      this.login();
    });
  }

  protected afterAuthInit(): void | Promise<void> {
    this.user = this.config.get('user');

    this.token = this.config.get('token');
    if (this.token)
      this.scopes = this.token.scope.split(' ');
    this.setAuthCompleted();
  };
}
