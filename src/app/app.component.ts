import {Component, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {NgTemplateOutlet} from "@angular/common";
import { FormsModule }   from "@angular/forms";
import { HttpClientModule }   from "@angular/common/http";
import {User} from "./user";
import {UserService} from "./user.service";
     
@Component({ 
    selector: "app-root", 
    standalone: true,
    imports: [FormsModule, HttpClientModule, NgTemplateOutlet],
    templateUrl: "./app.component.html",
    styles:`
    td, th {padding:3px;min-width:180px;max-width:200px;}
    input {width:100%}
    `,
    providers: [UserService]
}) 
export class AppComponent implements OnInit {
    //типы шаблонов
    @ViewChild("readOnlyTemplate", {static: false}) readOnlyTemplate!: TemplateRef<any>;
    @ViewChild("editTemplate", {static: false}) editTemplate!: TemplateRef<any>;
         
    editedUser: User|null = null;
    users: Array<User>;
    isNewRecord: boolean = false;
    statusMessage: string = "";
         
    constructor(private serv: UserService) {
        this.users = new Array<User>();
    }
         
    ngOnInit() {
        this.loadUsers();
    }
         
    //загрузка пользователей
    private loadUsers() {
        this.serv.getUsers().subscribe((data: Array<User>) => {
                this.users = data; 
            });
    }
    // добавление пользователя
    addUser() {
        this.editedUser = new User("","",0);
        this.users.push(this.editedUser);
        this.isNewRecord = true;
    }
      
    // редактирование пользователя
    editUser(user: User) {
        this.editedUser = new User(user._id, user.name, user.age);
    }
    // загружаем один из двух шаблонов
    loadTemplate(user: User) {
        if (this.editedUser && this.editedUser._id === user._id) {
            return this.editTemplate;
        } else {
            return this.readOnlyTemplate;
        }
    }
    // сохраняем пользователя
    saveUser() {
        if (this.isNewRecord) {
            // добавляем пользователя
            this.serv.createUser(this.editedUser as User).subscribe(_ => {
                this.statusMessage = "Данные успешно добавлены",
                this.loadUsers();
            });
            this.isNewRecord = false;
            this.editedUser = null;
        } else {
            // изменяем пользователя
            this.serv.updateUser(this.editedUser as User).subscribe(_ => {
                this.statusMessage = "Данные успешно обновлены",
                this.loadUsers();
            });
            this.editedUser = null;
        }
    }
    // отмена редактирования
    cancel() {
        // если отмена при добавлении, удаляем последнюю запись
        if (this.isNewRecord) {
            this.users.pop();
            this.isNewRecord = false;
        }
        this.editedUser = null;
    }
    // удаление пользователя
    deleteUser(user: User) {
        this.serv.deleteUser(user._id).subscribe(_ => {
            this.statusMessage = "Данные успешно удалены",
            this.loadUsers();
        });
    }
}