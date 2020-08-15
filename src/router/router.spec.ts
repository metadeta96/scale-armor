import {expect} from 'chai';
import { Method } from './methods';
import { Router, Route } from './router';


describe(Router.name, () => {
    let router: Router;
    let endpoints: Route[];

    beforeEach(() => {
        router = new Router();
        endpoints = [
            {
                method: Method.Get,
                path: '/'
            },
            {
                method: Method.Post,
                path: '/test'
            },
            {
                method: Method.Delete,
                path: '/'
            },
            {
                method: Method.Post,
                path: '/test/teasfd'
            },
        ];
    });

    it('should store routes', () => {
        endpoints.forEach(e => {
            router.add(e);
        });

        expect(router.size).to.equals(endpoints.length);

        endpoints.forEach(e => {
            const matched = router.match(e.method, e.path);
            
            expect(matched).to.not.null;
            expect((matched as Route).method).to.equals(e.method);
            expect((matched as Route).path).to.equals(e.path);
        });
    });

    it('should expose the routes', () => {
        endpoints.forEach(e => {
            router.add(e);
        });

        const endpointsSet = new Set(endpoints);
        for (const route of router.routes) {
            expect(endpointsSet).to.include(route);
            endpointsSet.delete(route);
        }

        expect(endpointsSet.size).to.equals(0);
    });
});