import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ComponentsUiModule, AddHeadersInterceptor, Config } from '@all41-dev/ui-components';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ComponentsUiModule,
    OAuthModule.forRoot()
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AddHeadersInterceptor,
    multi: true,
  }, Config],  bootstrap: [AppComponent]
})
export class AppModule { }
