import { HttpClient } from "@angular/common/http";
import { Aquabox, ConnectionMethods } from "./aquabox";


export class AquaboxAPI {
    constructor(private box: Aquabox, private localUrl: string,
        private cloudUrl: string,
        private http: HttpClient) {

    }

    private urls(url: string) {
        if (this.box.connected == ConnectionMethods.CloudOnly) {
            return [this.cloudUrl + url, this.localUrl + url]
        }
        return [this.localUrl + url, this.cloudUrl + url]
    }

    public get(url: string,
        request: any,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.get<Object>(this.urls(url)[0], { headers: request })
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
        request: any,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.delete<Object>(this.urls(url)[0], { headers: request })
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
        request: any,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.post<Object>(this.urls(url)[0], data, { headers: request })
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
        request: any,
        response: (box: Aquabox, data: Object) => void,
        fail: (box: Aquabox, error: any) => void) {
        this.http.put<Object>(this.urls(url)[0], data, { headers: request })
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