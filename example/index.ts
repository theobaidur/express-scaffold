import {App, ControllerResponse, Decorators} from '@theobaidur/typescript-express-api-scaffold/dist';

@Decorators.Controller()
class ExampleController{
    @Decorators.Get('/')
    public async example(req: any) {
        const data = await Promise.resolve({message: 'Hello World'});
        const response = new ControllerResponse();
        response.data = data;
        return response;
    }

    @Decorators.Get('/error')
    public async error(req: any) {
        const response = new ControllerResponse();
        response.code = 500;
        response.message = 'Internal Server Error';
        response.error = ['Something went wrong'];
        return response;
    }

    @Decorators.Get('/success')
    public async withSuccess(req: any) {
        return ControllerResponse.success({data: 'Hello World'}, 'Addinional data like pagination, etc. goes here', 'Any friendly message goes here');
    }

    @Decorators.Get('/error')
    public async withError(req: any) {
        return ControllerResponse.error()
    }

    @Decorators.Get('/stream')
    public async stream(req: any) {
        const response = new ControllerResponse();
        response.is_stream = true;
        response.file_name = 'test.txt';
        response.file_type = 'text/plain';
        response.data = 'Hello World';
        return response;
    }

    @Decorators.Get('/redirect')
    public async redirect(req: any, res: any) {
        const response = new ControllerResponse();
        response.is_redirect = true;
        response.redirect_url = 'http://localhost:3000/example';      
        return response;
    }
} 

const Api = new App();
Api.useController(ExampleController);


Api.listen(3000, () => {
    console.log('Listening on port 3000');
});