import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ComponentsUiModule, AddHeadersInterceptor } from '@all41/ui-components';

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
  },],  bootstrap: [AppComponent]
})
export class AppModule { }
