

export class MyClass {

    constructor() {
        this.message = "Hello World from MyClass";
    }

    getMessage(){
        return this.message;
    }
    sendMessage(){
        console.log(this.getMessage());
    }
}