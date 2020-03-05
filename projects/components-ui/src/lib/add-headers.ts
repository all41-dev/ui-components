import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import {Observable} from 'rxjs';

export class AddHeadersInterceptor implements HttpInterceptor {
  public static idToken: string = undefined;
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request to add the new header
    if ( req.headers.has('Authorization') || AddHeadersInterceptor.idToken === undefined) {
      return next.handle(req);
    }

    const clonedRequest = req.clone({ headers: req.headers.set('Authorization', `Bearer ${AddHeadersInterceptor.idToken}`) });

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest);
  }
}
