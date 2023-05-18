# typescript-express-api-scaffold
Ever wanted to get started with a new Express API project, but didn't want to spend the time setting up the project structure? Or, tired of writing the same boilerplate code over and over again? Well, this project is for you!

## Inspiration
For last one year, I have been working on 2-3 small nodejs projects every month. They are too small to go with a full blown framework like NestJS. Still I needed to maintain a good project structure and write the same boilerplate code over and over again. So, I decided to write my own library. I love typescript, so I used it to write this library.

So, first I tried to identify what are the most common things that I need to do in every project. I came up with the following list:
- Routing to different controllers
- Controllers to handle business logic
- Input data validation
- Sending response in a structured way
- Unexpected errors handling (preventing the server from crashing)

In express projects, we usually use separte files for routes, controllers, validation, etc. But, I found it would be more useful if we can group all these things in a single file. It would have nice if I could define all 3 things in a single file, namely in controller file. 

Another problem was to decide the response format. Without proper response format, it was getting harder to integrate the API with the frontend. Also, form validation was getting harder. 


## __Caution:__ 
This library is still in its early stage, aimed at building REST APIs. It is not meant for building full blown web applications. 

I din't want to overwhelm the library with too many features like including commonly used middlewares, etc. I wanted to make it as simple as possible. Its upto the user to decide which middlewares to use.


## Components
The library has 4 main components:
- A wrapper around core express app
- Controllers to handle business logic
- Decorators to define routes, validation, etc.
- A response formatter to format the response in a structured way

## Installation
```bash
npm install @theobaidur/typescript-express-api-scaffold
```
or
```bash
yarn add @theobaidur/typescript-express-api-scaffold
```

## Usage
There are mainly 4 steps to use this library:
- Define Controllers
- Instantiate the app
- Register the controllers with the app
- Start the app

### Defining Controller
```typescript
import {ControllerResponse, Decorators} from '@theobaidur/typescript-express-api-scaffold';

@Decorators.Controller('/example') 
export class ExampleController {
  @Decorators.Get('/')
  public async example(req: express.Request, res: express.Response) {
      const data = await Promise.resolve({message: 'Hello World'});
      const response = new ControllerResponse();
      response.data = data;
      return response;
  }

  @Decorators.Get('/error')
  public async error(req: express.Request, res: express.Response) {
      const response = new ControllerResponse();
      response.code = 500;
      response.message = 'Internal Server Error';
      response.error = ['Something went wrong'];
      return response;
  }

  @Decorators.Get('/success')
  public async withSuccess(req: express.Request, res: express.Response) {
      return ControllerResponse.success({data: 'Hello World'}, 'Addinional data like pagination, etc. goes here', 'Any friendly message goes here');
  }

  @Decorators.Get('/error')
  public async withError(req: express.Request, res: express.Response) {
      return ControllerResponse.error()
  }

  @Decorators.Get('/stream')
  public async stream(req: express.Request, res: express.Response) {
      const response = new ControllerResponse();
      response.is_stream = true;
      response.file_name = 'test.txt';
      response.file_type = 'text/plain';
      response.data = 'Hello World';
      return response;
  }

  @Decorators.Get('/redirect')
  public async redirect(req: express.Request, res: express.Response) {
      const response = new ControllerResponse();
      response.is_redirect = true;
      response.redirect_url = 'http://localhost:3000/example';      
      return response;
  }
}
```

### Instantiate the app
```typescript
import {App} from '@theobaidur/typescript-express-api-scaffold';
const Api = new App();
```

### Register the controllers with the app
```typescript
import {ExampleController} from './controllers/example.controller';
Api.useController(ExampleController);
```

### Start the app
```typescript
Api.listen(3000, () => {
    console.log('Listening on port 3000');
});
```

You should see the following output in the console:
```bash
┌─────────┬─────────┬─────────────────────┐
│ (index) │ methods │        path         │
├─────────┼─────────┼─────────────────────┤
│    0    │  'GET'  │     '/example/'     │
│    1    │  'GET'  │  '/example/error'   │
│    2    │  'GET'  │ '/example/success'  │
│    3    │  'GET'  │  '/example/stream'  │
│    4    │  'GET'  │ '/example/redirect' │
└─────────┴─────────┴─────────────────────┘
Listening on port 3000
```

## APIs
### Decorators
Decorators are the key to this library. There are mainly 2 types of decorators:
- Controller decorators
- Method decorators
#### Controller decorator
- `@Controller(path?: string)` - This decorator is used to define the path of the controller. It should be used on the class definition. Path is optional. If not provided, the path will be the name of the class in lowercase. This `path` serves as the base path for all the methods in the controller. For example, if the path is `/example`, then the method path will be `/example/hello`. If the path is not provided, then the method path will be `/examplecontroller/hello`.
```typescript
@Decorators.Controller() // path will be /ExampleController
export class ExampleController {
  // ...
}

@Decorators.Controller('/example') // path will be /example
export class ExampleController {
  // ...
}

```

#### Method decorators
There are several method decorators, each for a different HTTP method. They are:
- `@Get(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Post(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Put(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Patch(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Delete(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Options(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Head(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@All(path?: string, schema?: Schema, handlers: RequestHandler[])`
- `@Route(method: string, path?: string, schema?: Schema, handlers: RequestHandler[])`

As you can see, they all are similar. The only difference is the HTTP method. 

The `path` is optional. If not provided, the path will be the name of the method in lowercase. 

The `schema` is also optional. It is used to validate the input data. I uses [express-validator](https://express-validator.github.io/docs/)'s [schema](https://express-validator.github.io/docs/schema-validation) to validate the input data. If you provide the schema, then the input data will be validated before the method is called.

The `handlers` is also optional. It is used to add additional [middlewares](https://expressjs.com/en/guide/writing-middleware.html) to the method. 

```typescript
@Decorators.Controller('/example')
export class ExampleController {
  @Decorators.Get() // path will be /example/hello
  public async hello(req: express.Request, res: express.Response): Promise<ControllerResponse> {
    // ...
  }

  @Decorators.Get('/hello') // path will be /example/hello
  public async hello(req: express.Request, res: express.Response): Promise<ControllerResponse> {
    // ...
  }

  @Decorators.Get('/hello/:id') // path will be /example/hello/:id
  public async hello(req: express.Request, res: express.Response): Promise<ControllerResponse> {
    // ...
  }
  

  @Decorators.Get('/hello', {name: {in: ['body'], isString: true}}) // path will be /example/hello
  public async hello(req: express.Request, res: express.Response): Promise<ControllerResponse> {
    // ...
  }

  @Decorators.Get('/hello', {name: {in: ['body'], isString: true}}, [middleware1, middleware2]) // path will be /example/hello
  public async hello(req: express.Request, res: express.Response): Promise<ControllerResponse> {
    // ...
  }
}
```

Each method decorator passes 2 parameters to the method:
- `req` - The request object which is an instance of `express.Request`
- `res` - The response object which is an instance of `express.Response`

Each controller method must return a `Promise<ControllerResponse>`. The `ControllerResponse` is a class that is used to format the response. See below for more details.

### ControllerResponse
Another aim of the library is to standardize the response format so that the client can easily handle the response. The `ControllerResponse` is a class that is used to format the response. There's a `toJSON` method that returns the response in the following format:
```typescript
{
  success: boolean; // whether the request was successful
  message: string | undefined; // optional message to be sent to the client
  code: number; // status code of the response
  data: any; // data to be sent to the client
  meta: any; // meta data to be sent to the client, for example, pagination data
  error: any; // error to be sent to the client
}
``` 

`ControllerResponse` has following structure:
```typescript
class ControllerResponse {
  public message?: string; // optional message to be sent to the client
  public data?: any; // data to be sent to the client
  public meta?: any; // meta data to be sent to the client, for example, pagination data
  public error: any; // error to be sent to the client
  public is_stream: boolean; // whether the response is a stream i.e. file download
  public file_name: string; // name of the file to be downloaded, if the response is a stream
  public file_type: string; // type of the file to be downloaded, if the response is a stream
  public is_redirect: boolean; // whether the response is a redirect
  public redirect_url: string; // url to redirect to, if the response is a redirect
  public code: number; // status code of the response

  constructor(message?: string, code?: number, data?: any, meta?: any, error?: any); // constructor

  public toJSON(): {success: boolean; message: string | undefined; code: number; data: any; meta: any;error: any;}; // returns the response in the above format

  static success(data?: any, meta?: any, message?: string, code?: number): ControllerResponse; // returns a success response
  static error(errors?: any, code?: number, message?: string): ControllerResponse; // returns an error response
  static stream(file_name: string, data: any, file_type?: string, message?: string): ControllerResponse; // returns a stream response
  static redirect(url: string, code?: number): ControllerResponse; // returns a redirect response
}
```

### ExpressApp
The `ExpressApp` class is used to create an express app. It has following methods:
- `useMiddleware(...middlewareList: express.RequestHandler[])` - used to add middlewares to all the routes/end-points
- `useRoute(method: string, path: string, ...handlers: RequestHandler[])` - used to add additional routes
- `useController(...controllers: any[])` - used to add a controller to the app. It takes a list of controllers as parameters. Each controller must be a class that has methods decorated with the `@Decorators.Controller` decorator. See below for more details.
- `listen(port: number, callback?: () => void)` - used to start the server. It takes the port number as parameter. It also takes an optional callback function that will be called when the server starts.
- `app()` - returns the instance of the express app. Its a getter method. So, you don't need to call it as a function. For example, `App.app` will return the instance of the express app.



## FAQs

### _How do I add additional middlewares?_
You can add middlewares in two different ways:
- Using the `handlers` parameter of the method decorator to add middlewares to a specific method/route/end-point

  ```typescript
  @Decorators.Get('/hello', {name: {in: ['body'], isString: true}}, [middleware1, middleware2]) // path will be /example/hello 
  public async hello(req: express.Request, res: express.Response): Promise<ControllerResponse> {
    // ...
  }
  ```
- Using the `App.useMiddleware(...middlewareList: express.RequestHandler[])` method to add middlewares to all the routes/end-points

  ```typescript
  App.useMiddleware(middleware1, middleware2);
  ```

### _How do I add additional routes?_
`App` class has a `useRoute(method: string, path: string, ...handlers: RequestHandler[])` method that can be used to add additional routes. For example:

```typescript
App.useRoute('get', '/hello', middleware1, middleware2);
```

Infact, you can use `useRoute` method to serve your index.html file for your SPA application. For example:
```typescript
App.useRoute('get', '*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

But remember, like all express routes, the order is important. The routes are matched in the order they are added.

### _I already have an express app. Can I use it with this library?_

Yes, you can. The constructor of the `App` class accepts an optional parameter of type `express.Application`. If you pass your express app to the constructor, then the library will use that app instead of creating a new one. For example:
```typescript
const myExpressApp = express();
const app = new App(myExpressApp);
```


