import { Injectable } from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class AccessFunctions {

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(private oauthService: OAuthService) {}

  public hasAccess(scope: (string|string[])[]): boolean {
    // Flatten imbricated array & clean empty values
    const scopes: string[] = [];
    scope.forEach((sc): void => {
      if(Array.isArray(sc)) {
        sc.forEach((subSc): void => { if (subSc) {scopes.push(subSc); }});
      } else { if (sc) {scopes.push(sc);} }
    });

    const token = this.oauthService.getIdentityClaims() as any;
    if (token === null) {
      return false;
    }
    const permissionsStr: string = token.scope;

    // concat flatten array of arrays to array
    const permissions: string[][] = ([] as string[][]).concat.apply([], permissionsStr.split(';')
      .map((p: string): string[] => {
        // functions for cartesian product, from -> https://stackoverflow.com/a/43053803/1073588
        const f = (a: any, b: any): any[] => [].concat(...a.map((d: any): any => b.map((e: any): any => [].concat(d, e))));
        const cartesian = (a: string[], b?: string[], ...c: string[][]): string[] => (b ? cartesian(f(a, b), ...c) : a);

        const permissionScopes = p.split('+')
          .map((sc: string): any[] => {
            // process permission scope
            if (sc.indexOf('|') === -1) {
              return [sc]
            }
            // the scope path contains '|', then build one scope by combination
            const optionsArr = sc.split('/')
              .map((slashPart): string[] => slashPart.split('|'));
            if (optionsArr === undefined){}
            const cart =  cartesian(optionsArr[0], ...optionsArr.slice(1)).map((sc: any): string => sc.join('/'));
            return cart;
          });
        const cart2 = cartesian(permissionScopes[0], ...permissionScopes.slice(1));
        // console.info(cart2);
        // console.info('---');
        return cart2;
      }));

    return permissions.some((p): boolean => {
      if (scopes.length !== p.length) {  return false; }
      let localScope: string[] = JSON.parse(JSON.stringify(scopes))
      let matches = 0;

      for(;localScope.length > 0;) {
        for(let i = 0;i < p.length; i++) {
          if (localScope[0].startsWith(p[i])) {
            matches++;
            // break;
          }
        }
        localScope = localScope.slice(1);
      }
      // console.debug(p);
      // console.debug(scopes);
      // console.debug(`matches: ${matches} scopes: ${scopes.length}`);
      return matches === scopes.length;
    });
  }
}
