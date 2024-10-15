import { Injectable } from '@angular/core';
import { User } from 'app/models/user.model';
import { environment } from 'environments/environment';
import { tap, map, BehaviorSubject, Observable } from 'rxjs';
import { DatafactoryService } from '../datafactory.service';

@Injectable({providedIn: 'root'})
export class UsersApiService
{
    private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
    private dataStore: {users: User[]} = {
        users: []
    }
    constructor(private dataFactory: DatafactoryService) {
        
    }

    /**
     * Returns an observable list of users. Accessible by administrative components only.
     */
    get users(): Observable<User[]> {
        return this._users.asObservable();
    }

    getAllUsers(query?) {

        // should create a datafactory methods so that can handle 401 and other errors globally.
        console.log(`UsersApiService.getAllUsers`);
        this.dataFactory.getMethod<User[]>(`${environment.apiUrl}/users`).subscribe(
            (data) => {
                this.dataStore.users = data;
                this._users.next(Object.assign({}, this.dataStore).users);
            },
            (error) => {
                console.error(`Failed to retrieve users. ${error}`);
            }
        );
    }


}