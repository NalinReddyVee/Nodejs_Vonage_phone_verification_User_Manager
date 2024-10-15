import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
    MatTableDataSource,
    MatTableDataSourcePaginator,
    MatTableModule,
} from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Role } from 'app/models/role.model';
import { UsersApiService } from 'app/core/users/users.api.service';
import { cloneDeep } from 'lodash';
import { User } from 'app/models/user.model';
import { UserService } from 'app/core/user/user.service';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import {
    trigger,
    state,
    style,
    transition,
    animate,
} from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        MatDividerModule,
    ],
    animations: [
        trigger('detailExpand', [
            state(
                'collapsed',
                style({ height: '0px', opacity: '0', display: 'none' })
            ),
            // state('expanded', style({ 'height': 'auto', 'opacity': '1' })),
            state(
                'expanded',
                style({ height: 'auto', opacity: '1', display: 'table-row' })
            ),

            transition('collapsed => expanded', [
                // style({ 'display': 'block' }),
                animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'), // animate('300ms ease-in')
            ]),

            transition('expanded => collapsed', [
                animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)'), // animate('200ms ease-in')
            ]),
        ]),
    ],
})
export class UsersComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = [
        'email',
        'title',
        'firstName',
        'lastName',
        'phone',
        'role',
        'lastLogin',
        'created'
    ];
    dataSource = new MatTableDataSource<User>([]);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    private primarySubscripton: Subscription = new Subscription();
    isLoggedInUserAdmin: boolean;
    isLoggedInUserSuperAdmin: boolean;
    appRoles = Role;
    loggedInUserId: string;

    constructor(
        private usersApiService: UsersApiService,
        private dialog: MatDialog,
        private userService: UserService
    ) {
        this.primarySubscripton.add(
            this.usersApiService.users.subscribe((data) => {
                this.dataSource.data = cloneDeep(data);
                this.dataSource.data.forEach((data) => (data.expanded = false));
            })
        );
    }

    ngOnDestroy(): void {
        this.primarySubscripton.unsubscribe();
    }

    ngOnInit(): void {
        this.primarySubscripton.add(
            this.userService.user$.subscribe((user) => {
                this.isLoggedInUserAdmin = user.role === this.appRoles.Admin;
                this.isLoggedInUserSuperAdmin =
                    user.role === this.appRoles.SuperAdmin;
                this.loggedInUserId = user.id;
                this.dataSource.paginator = this.paginator;
            })
        );

        this.usersApiService.getAllUsers();
    }
}
