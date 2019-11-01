import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable({
  providedIn: 'root'
})

export class WebserviceService {
	public  headers = new Headers({ 'Accept':'application/json','Content-Type': 'application/json; charset=utf-8' });
	private url_base = "http://192.168.100.8:3333/";

	constructor(public http: Http) { }

	header() {
		this.headers = new Headers({'Accept':'application/json', 'Authorization':'Bearer '+localStorage.getItem('token') });		
	}

	get(endpoint: string){
 		return this.http.get(this.url_base + endpoint, {headers: this.headers}).toPromise().then(res => res.json());
 	}

	put(endpoint: string, data: any, id: number){
		this.header();
		return this.http.put(this.url_base+endpoint+'/'+id, data, { headers: this.headers }); 
	}

	post(endpoint: string, data: any){
		this.header();
		return this.http.post(this.url_base+endpoint, data, { headers: this.headers });
	} 

}
