import {System} from "systemjs";


System.config({
    baseURL: '/js',
    map: {
        jquery: 'vendors/jquery/jquery.js',

    }
});

System.import("index.js");