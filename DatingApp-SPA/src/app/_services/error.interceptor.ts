import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                return throwError(err.statusText);
            }

            if (err instanceof HttpErrorResponse){
                const applicationError = err.headers.get('Application-Error');
                if (applicationError){
                    return throwError(applicationError);
                }
                const serverError = err.error;
                let modelStateErrors = '';
                if (serverError.errors && typeof serverError.errors === 'object'){
                    for (const key in serverError.errors){
                        if (serverError.errors[key]){
                            modelStateErrors += serverError.errors[key] + '\n';
                        }
                    }
                }
                return throwError(modelStateErrors || serverError || 'Server Error');
            }
        })
        );
    }
}
