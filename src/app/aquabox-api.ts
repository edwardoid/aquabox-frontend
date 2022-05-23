import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Aquabox, ConnectionMethods } from "./aquabox";
import { timeout } from 'rxjs/operators';

export class AquaboxAPI {
    constructor(private box: Aquabox, private localUrl: string,
        private cloudUrl: string,
        private http: HttpClient) {

    }

    private urls(url: string) {
        switch (this.box.connected) {
            case ConnectionMethods.Both: {
                return [this.cloudUrl + url, this.localUrl + url]    
            }
            case ConnectionMethods.CloudOnly: {
                return [this.cloudUrl + url, this.cloudUrl + url]
            }
            case ConnectionMethods.LocalOnly: {
                return [this.localUrl + url, this.localUrl + url]
            }
            default: {
                
            }
        }
        return [this.localUrl + url, this.cloudUrl + url]
    }

    public get(url: string,
        request: HttpHeaders,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.get<Object>(this.urls(url)[0], { headers: request })
            .pipe(timeout(5000))
            .subscribe((data) => {
                response(this.box, data)
            }, (error) => {
                console.error("Local GET request to " + this.urls(url)[0] + " failed with " + error);
                this.http.get<Object>(this.urls(url)[1], { headers: request })
                    .subscribe((data) => {
                        response(this.box, data)
                    }, (error) => {
                        fail(this.box, error)
                    });
            });
    }

    public delete(url: string,
        request: HttpHeaders,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.delete<Object>(this.urls(url)[0], { headers: request })
            .pipe(timeout(30000))
            .subscribe((data) => {
                response(this.box, data)
            }, (error) => {
                console.error("Local request DELETE to " + this.urls(url)[0] + " failed with " + error);
                this.http.delete<Object>(this.urls(url)[1], { headers: request })
                    .subscribe((data) => {
                        response(this.box, data)
                    }, (error) => {
                        fail(this.box, error)
                    });
            });
    }

    public post(url: string,
        data: any,
        request: HttpHeaders,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.post<Object>(this.urls(url)[0], data, { headers: request })
            .pipe(timeout(30000))
            .subscribe((data) => {
                response(this.box, data)
            }, (error) => {
                console.error("Local request POST to " + this.urls(url)[0] + " failed with " + error);
                this.http.post<Object>(this.urls(url)[1], data, { headers: request })
                    .subscribe((data) => {
                        response(this.box, data)
                    }, (error) => {
                        fail(this.box, error)
                    });
            });
    }

    public put(url: string,
        data: any,
        request: HttpHeaders,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.put<Object>(this.urls(url)[0], data, { headers: request })
            .pipe(timeout(5000))
            .subscribe((data) => {
                response(this.box, data)
            }, (error) => {
                console.error("Local request PUT to " + this.urls(url)[0] + " failed with " + error);
                this.http.put<Object>(this.urls(url)[1], data, { headers: request })
                    .subscribe((data) => {
                        response(this.box, data)
                    }, (error) => {
                        fail(this.box, error)
                    });
            });
    }
}