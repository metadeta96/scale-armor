import { App, AppProvider, JSONResponseBuilder, Method, Params, RequestReader, ResponseBuilder, SimpleApp, StatusCodes } from "../app";
import { PagingOptions } from "../utils";
import { CrudMethods, ModelController } from "./model-controller";
import { Model } from "./model-service";
import { Id, Query, QueryById } from "./query";

const enum CrudMethodsExtended {
    CountPost = 'count-post',
    FindPost = 'find-post',
    GetPost = 'get-post'
}

export type ModelAppOperations = CrudMethods | CrudMethodsExtended;

export class ModelAppProvider<TModel extends Model<TId>, TId extends Id<unknown> = unknown> extends AppProvider {
    private __modelController: ModelController<TModel, TId>;
    private __allowedOperations: ModelAppOperations[];

    constructor(modelController: ModelController<TModel, TId>, allowedOperations?: ModelAppOperations[]) {
        super();
        this.__modelController = modelController;
        this.__allowedOperations = allowedOperations || [];
    }

    protected getQuery(params: Params | any): Query<TModel, TId> {
        return params.where || {};
    }

    protected getQueryById(params: Params | any): QueryById<TId> {
        const where = this.getQuery(params);
        return "$id" in where ? where : ({} as any);
    }

    protected getPagingOptions(params: Params): Partial<PagingOptions> {
        const options: Partial<PagingOptions> = {};

        if ('page' in params) {
            options.page = params.page || undefined;
        }
        if ('pageSize' in params) {
            options.pageSize = params.pageSize || undefined;
        }
        if ('sortBy' in params) {
            options.sortBy = params.sortBy || undefined;
        }
        if ('sortType' in params) {
            options.sortType = params.sortType || undefined;
        }

        return options;
    }

    protected async count(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.params;
        const where = this.getQuery(params);

        const pagedData = await this.__modelController.count(where);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async countPost(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.json || {};
        const where = this.getQuery(params);

        const pagedData = await this.__modelController.count(where);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async find(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.params;
        const where = this.getQuery(params);
        const options = this.getPagingOptions(params);

        const pagedData = await this.__modelController.find(where, options);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async findPost(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.json || {};
        const where = this.getQuery(params);
        const options = this.getPagingOptions(params);

        const pagedData = await this.__modelController.find(where, options);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async get(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.params;
        const where = this.getQuery(params);

        const pagedData = await this.__modelController.get(where);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async getPost(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.json || {};
        const where = this.getQuery(params);

        const pagedData = await this.__modelController.get(where);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async create(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const data = request.json || {};

        const pagedData = await this.__modelController.create(data);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async put(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const data = request.json || {};

        const pagedData = await this.__modelController.put(data);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async patch(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const data = request.json || {};

        const pagedData = await this.__modelController.patch(data);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    protected async delete(requestReader: RequestReader): Promise<ResponseBuilder> {
        const request = await requestReader.read();
        const params = request.params;
        const where = this.getQueryById(params);

        const pagedData = await this.__modelController.delete(where.$id);
        return new JSONResponseBuilder(pagedData, StatusCodes.Ok);
    }

    build(name: string, allowedOperations?: ModelAppOperations[]): App {
        const app = new SimpleApp(name);
        allowedOperations = allowedOperations || this.__allowedOperations;
        const allowAll = allowedOperations.length == 0;
        const crudMethods = allowedOperations.reduce((obj, m) => {
            obj[m] = true;
            return obj;
        }, {} as { [key in ModelAppOperations]: true });

        if (allowAll || CrudMethods.Count in crudMethods) {
            app.endpoint(Method.Get, '/count', async requestReader => this.count(requestReader));
        }
        if (allowAll || CrudMethodsExtended.CountPost in crudMethods) {
            app.endpoint(Method.Post, '/count', async requestReader => this.countPost(requestReader));
        }

        if (allowAll || CrudMethods.Find in crudMethods) {
            app.endpoint(Method.Get, '/find', async requestReader => this.find(requestReader));
        }
        if (allowAll || CrudMethodsExtended.FindPost in crudMethods) {
            app.endpoint(Method.Post, '/find', async requestReader => this.findPost(requestReader));
        }

        if (allowAll || CrudMethods.Get in crudMethods) {
            app.endpoint(Method.Get, '/get', async requestReader => this.get(requestReader));
        }
        if (allowAll || CrudMethodsExtended.GetPost in crudMethods) {
            app.endpoint(Method.Post, '/get', async requestReader => this.getPost(requestReader));
        }

        if (allowAll || CrudMethods.Create in crudMethods) {
            app.endpoint(Method.Post, '/', async requestReader => this.create(requestReader));
        }
        if (allowAll || CrudMethods.Put in crudMethods) {
            app.endpoint(Method.Put, '/', async requestReader => this.put(requestReader));
        }
        if (allowAll || CrudMethods.Patch in crudMethods) {
            app.endpoint(Method.Patch, '/', async requestReader => this.patch(requestReader));
        }
        if (allowAll || CrudMethods.Delete in crudMethods) {
            app.endpoint(Method.Delete, '/', async requestReader => this.delete(requestReader));
        }

        return app;
    }

}
