cat-mvc
=======

The best nodejs MVC web framework in .NET MVC style. It's fully implemented the main features of .NET MVC. And will include more and more features step by step. I first build this project for personal practicing purpose. But I was moved when this project going more and more better. I think it's now good enough to open out for community. I will be very pleased if this project is help to you.

Features
---------

+ **Classical MVC structure**, controllers + models + views + areas.
+ **Intuitive routes**, be the benefit from the separated controller files. It's much more graciously than define serials of url pattern.
+ **Dynamic component inject**, any components what you want can be injected into controller function. We already defined some common used components. You can also inject your components by config simply injection.
+ **Dynamic request data inject**, we can get the request parameters directly from the action function (also support object inject). Again, it's awesame graciously than get string data from req.body/req.params.
+ **Data annotation**, modelling the models in javascript to declare strong type data models. Annotations on data type and data validation.
+ **Multiple MVC instance support**, you can create multiple MVC instance and listen to different http ports.
+ **Multiple view engines**, allows multiple view engines run together in one site. Now supports [ejs](https://github.com/visionmedia/ejs) + [vash](https://github.com/kirbysayshi/vash). Will add the support to other engines step by step.
+ **Highly customizable platform**, all the main functions are costomizable. Not only controller/action/model/view but also area/attribute/modelling/view engine/action filter/action result/data binder etc. Just like .NET MVC.
+ **All object-oriented code structure**, zero code invasion to nodejs. Good for study or maintenance.

Installation
-------------

```shell
$ npm install cat-mvc
```

Simple usage
------------
```javascript
// global.js
var http = require('http');
var mvc = require('cat-mvc');
//
var app = mvc({ appPath: __dirname });
var server = http.createServer(mvc.handler()); // handler all request here
server.listen(8000, function() { console.log('Server Start!'); });
```

Sample site
------------
Clone the [sample site repo](https://github.com/jszoo/cat-mvc-sample-site.git), then install the dev dependencies and run start.
```shell
$ git clone https://github.com/jszoo/cat-mvc-sample-site.git
$ npm install
$ npm start
```

Site structure
--------------------
If you are familiar with .NET MVC, you might already known well about the site file structure.

```
|-- areas
|   |-- account
|   |   |-- controllers
|   |   |   |-- auth.js    // assume contains actions: login/logon
|   |   |-- models
|   |   |   |-- loginModel.js
|   |   |-- views
|   |   |   |-- auth
|   |   |   |   |-- login.html
|   |   |   |   |-- logon.html
|   |   |   |-- shared
|   |   |   |   |-- layout.html
|   |   |-- area.js        // area events subscription
|-- controllers
|   |-- home.js            // assume contains action: index
|   |-- user.js            // assume contains actions: list/item
|-- models
|   |-- userModel.js
|-- views
|   |-- home
|   |   |-- index.html
|   |-- user
|   |   |-- list.html
|   |   |-- item.html
|   |-- shared
|   |   |-- layout.html
|-- global.js
```

Area
--------
In the classical .NET MVC site files structure, you don't need to care the area registration. The only one you need to do is to supply the root site path as application path for cat-mvc.

```javascript
// global.js
var mvc = require('cat-mvc');
// supply the appPath and the "app.areas.discover()" will be called by default
var app = mvc({ appPath: __dirname });
```

We recommend to use the classical style structure as it's already be familiar to all .NET MVC fans. But you also can customize the areas as you want.

```javascript
var mvc = require('cat-mvc');
var app = mvc();

// the main register api
// areaRouteExpression: rule of path-to-regexp module "/:controller?/:action?"
// defaultRouteValues: object as format "{ controller: 'home', action: 'index' }"
app.areas.register(areaPath, areaName, areaRouteExpression, defaultRouteValues);

// a sugar api to "app.areas.register"
// only the root controllers/views etc will be loaded. we recognize this as RootArea
app.areas.registerRoot(rootPath);

// a sugar api to "app.areas.register"
// register one area by the specified areaPath + areaName
app.areas.registerArea(areaPath, areaName);

// a sugar api to "app.areas.registerArea"
// all the area folders under specified areasPath will be registered
app.areas.registerAreas(areasPath);

// to unload area
app.areas.unload(areaName);

// to unload root area
app.areas.unloadRoot();

// to customize default folder names
app.set('folderNames.areas', 'areas');
app.set('folderNames.views', 'views');
app.set('folderNames.shared', 'shared');
app.set('folderNames.models', 'models');
app.set('folderNames.controllers', 'controllers');
```

Controller
-----------
Let's take auth.js controller for one impression.

```javascript
// areas/account/controllers/auth.js
var mvc = require('cat-mvc');
mvc.controller(function(session, end) {

    // GET /account/auth/login
    this.action('login', function() {
        if (session.loggedin) {
            //end.redirectToAction('admin');
        } else {
            end.view();
        }
    });

    // POST /account/auth/login
    this.action('login', 'httpPost, loginModel(user)', function(user) {
        if (user.UserName === 'admin' && user.Password === 'admin') {
            session.loggedin = true;
            //end.redirectToAction('admin');
        } else {
            end.redirectToAction('login');
        }
    });

    // it's also support the way below to define GET action
    // GET /account/auth/logout
    this.logout = function() {
        session.destroy();
        end.redirectToAction('login');
    };

    //.... more actions
});
```

The full signature of define a controller is:

```javascript
// specify attributes
// for attributes please see to attribute section
mvc.controller('attributes', function() {
    // actions here
});

// specify controller name manually
// this name will replace the controller file name as controller name
mvc.controller('name', 'attributes', function() {
    // actions here
});
```

**Controller Attribute**
A series events inside controller can be subscribed via adding controller attributes. You will see the other attribute on Action api signature in the following document. They are almost the same, but all the Action Attribute events will bubble to Controller Attribute. For more details please see the attribute section.

**Injection of controller**   
There we can see some parameters in the controller handler function. The parameters will injected automatically base on parameter names (case insensitive). We alreay have some common used component objects builtin. Case the component names are confused to you action variables, you can add a prefix "$" to the component name. For example: model -> $model

| **Name**     | **Prefixed Name** | **Description**                         | **Useage**          |
|:-------------|:------------------|:----------------------------------------|:--------------------|
| req          | $req              | raw nodejs request object               |                     |
| res          | $res              | raw nodejs response object              |                     |
| context      | $context          | httpContext object                      |                     |
| session      | $session          | plain object session data               | session['logged']   |
| query        | $query            | plain object query data                 | query['PageIndx']   |
| form         | $form             | plain object form data                  | form['UserName']    |
| tempData     | $tempData         | temp data                               | tempData.set('title', 'xxx')        |
| viewData     | $viewData         | view data                               | viewData.model(obj)                 |
| modelState   | $modelState       | request model state                     | modelState.isValid()                |
| model        | $model            | model APIs                              | model.new('UserModel')              |
| url          | $url              | url generator                           | url.action('index', 'home')         |
| end          | $end              | response functions for ending request   | end.json({ success: true })         |
| actionResult | $actionResult     | same api as "end" for create result     | actionResult.json({ success: true}) |

It's very cooool, isn't it? But we think further more. We made the awesome injection customizable.

```javascript
var mvc = require('cat-mvc');
var app = mvc({ appPath: __dirname });

// global.js | this make the "mongo" inject to all controllers under app instance
app.on('injectController', function(app, injectionContext) {
    injectionContext.inject['mongo'] = 'mongo api';
});

// area.js | or inject in area events subscription for all controllers under area
mvc.area(function() {
    this.onInjectController = function(area, injectionContext) {
        injectionContext.inject['mongo'] = 'mongo api';
    };
});

// controller.js | simple and easy using the mongo object
mvc.controller(attributes, function(end, mongo) {
    this.index = function() {
        end.json(mongo.query('select * from table'));
    };
});
```

Action
-----------
Action is the main work area of the user. Do whatever to process your business and end with a result. Both sync and async are allow. 

The full signature of define a action is:

```javascript
var mvc = require('cat-mvc');
mvc.controller(function(end) {
    // 1. basic
    this.action('action name', function(param1, param2, ...) { });
    // 2. full signature
    this.action('action name', 'attributes', function(param1, param2, ...) { });
    // 3. minimal
    this.index = function(param1, param2, ...) { };
});
```
+ Definition 1, the basic action with action name and user work area handle function.
+ Definition 2, this with the support of Action Attribute. For more details please see the attribute section.
+ Definition 3, 'index' will be recognized as action name. No attributes, it's the same as Definition 1, just alias.

**Injection of action**   
The action handle funciton you can see that parameters. They are injected with current request data. FormData/QueryString/RouteData will the request data source. Only one thing you need to do is to specify a correct parameter name (case insensitive), then you can get the value you want directly. With the help of attributes, the parameters even can be strong types. You can define your own model, then attribute the model to your parameter. System will deserialize the values into your model. It's much more cooool then parse the values one by one from string type. We really love this feature.

**Sample Action**   
```javascript
// login action
this.action('login', 'httpPost, loginModel(user), bool(rem)', function(user, rem) {
    // string type with the required validation
    user.UserName; user.Password;
    // boolean type, a primitive type attribute
    rem;
});
```

**1. Action selector attribute**   
The *httpPost* attribute in the sample action. Just like its name, it's a filter to make only POST request to enter this action. If you want multiple methods allowed, you can specify multiple attributes or use *acceptVerbs* attribute. For example: "acceptVerbs(POST,PUT)". There are some more related attributes.

| httpPost | httpHead | httpTrace | httpPut | httpDelete | httpOptions | httpConnect |
|:---------|:---------|:----------|:--------|:-----------|:------------|:------------|

**2. Primitive types attribute**   
The *bool(rem)* attribute in the sample action. We already builtin attributes for primitive data types.

| string | bool | int | float | date | array |
|:-------|:-----|:----|:------|:-----|:------|

**3. Customized model attribute**   
The *loginModel(user)* attribute in the sample action. *loginModel* is a customized model file that put in the *models* folder. We automatically generate a model binder attribute with the same name for each models.
```javascript
// loginModel.js
module.exports = {
    UserName: {
        type: 'string',
        required: true
    },
    Password: {
        type: 'string',
        required: true
    }
};
```

Action result
---------------
Instead of calling the raw nodejs response.write function to end a request. Here we provide some useful wrappers for write response content. We also combine the result types into a component called "end". Please always inject the "end" component in your controller, then use it to write your response content.
```javascript
mvc.controller(function(end) {
    this.index = function() {
        end.empty();
    };
});
```

| Type                    | Useage                                                     |
|:------------------------|:-----------------------------------------------------------|
| *                       | end.with(whatever);                                        |
| emptyResult             | end.empty();                                               |
| jsonResult              | end.json({ title: 'hello'});                               |
| jsonpResult             | end.jsonp({ title: 'hello'}, 'callback');                  |
| viewResult              | end.view('viewName', { title: 'hello'});                   |
| fileResult              | end.file('filePath', 'fileDownloadName');                  |
| contentResult           | end.content('stringContent');                              |
| httpNotFoundResult      | end.httpNotFound();                                        |
| redirectResult          | end.redirect('url', isPermanent);                          |
| redirectToRouteResult   | end.redirectToAction('action', 'controller', routeValues); |

**Custom action result**   
Except the builtin result types, you can custom your action result to meet all the requirements. Implement your logic in "executeResult" and when done call the callback function. That's very easy. Below is a custom json result for example:

```javascript
var myJsonResult = function(data) {
    this.data = data;
};
myJsonResult.prototype = {
    data: null, constructor: myJsonResult,
    executeResult: function(controllerContext, callback) {
        var json = JSON.stringify(this.data);
        controllerContext.zoo.response.contentType('application/json');
        controllerContext.zoo.response.send(json);
        callback();
    }
};
// global.js
app.on('init', function() {
    app.actionResults.register('myJson', myJsonResult);
});
// controller.js
mvc.controller(function(end) {
    this.index = function() {
        end.myJson({ id: 1 });
    };
});
```

Attribute
-----------------
Now the attribute is available for controller,action,model. Just as we mentioned in the document above. The controllers and action declare api has an argument for specifying attributes. And for the models, we automatically generate a model binder attribute with the same name for each models. Attributes also use for handling MVC events, such as: onActionExecuting, onActionExecuted, onResultExecuting, onResultExecuted (we call them filters). Any attribute can has one or more of the following functions:

| Function Name             | Function Signature                                   |
|:--------------------------|:-----------------------------------------------------|
| onControllerInitialized   | function(controller) { }                             |
| onControllerDestroy       | function(controller) { }                             |
| onAuthorization           | function(authorizationContext) { }                   |
| onActionExecuting         | function(actionExecutingContext, next) { next(); }   |
| onActionExecuted          | function(actionExecutedContext, next) { next(); }    |
| onResultExecuting         | function(resultExecutingContext, next) { next(); }   |
| onResultExecuted          | function(resultExecutedContext, next) { next(); }    |
| onException               | function(exceptionContext) { }                       |
| isValidActionName         | function(controllerContext, actionName) { }          |
| isValidActionRequest      | function(controllerContext) { }                      |
| getParamName + getBinder  | function() { return (paramName or binder); }         |

Attribute feature is a low level interposition to MVC, it's powerful but please use it carefully. We already builtin some useful attributes:

| Attribute Name             | Description                                        |
|:---------------------------|:---------------------------------------------------|
| actionNameAttribute        | Specify a alias name for action                    |
| nonActionAttribute         | Prevent a function be recognized as action         |
| acceptVerbsAttribute       | Specify multiple accept http methods for action    |
| handleErrorAttribute       | Handle errors for controllers or actions           |
| requireHttpsAttribute      | Indicate action accept HTTPS request only          |
| httpGetAttribute           | Indicate action accept GET request                 |
| httpPostAttribute          | Indicate action accpet POST request                |
| httpHeadAttribute          | Indicate action accpet HEAD request                |
| httpTraceAttribute         | Indicate action accpet TRACE request               |
| httpPutAttribute           | Indicate action accpet PUT request                 |
| httpDeleteAttribute        | Indicate action accpet DELETE request              |
| httpOptionsAttribute       | Indicate action accpet OPTIONS request             |
| httpConnectAttribute       | Indicate action accpet CONNECT request             |
| stringAttribute            | Indicate action parameter is STRING type           |
| boolAttribute              | Indicate action parameter is BOOLEAN type          |
| intAttribute               | Indicate action parameter is INT type              |
| floatAttribute             | Indicate action parameter is FLOAT type            |
| dateAttribute              | Indicate action parameter is DATE type             |
| arrayAttribute             | Indicate action parameter is ARRAY type            |

**Attribute sample**   
This is a sample for declaring a model binder (and) attribute. The binder add a test property to the default binding result. You can do any operation to the binding value to achieve your need. Register attribute class to MVC by using attribute manager **app.attributes**.

```javascript
// custom model binder
app.on('init', function() {
    // binder
    var customBinder = function() {
        this.bindModel = function(controllerContext, bindingContext) {
            bindingContext.value.test = 1;
            return bindingContext.value;
        };
    };
    // attribute
    var customBinderAttribute = function(paramName) {
        this.getParamName = function() { return paramName; };
        this.getBinder = function() { return new customBinder(); }
    };
    // register
    app.attributes.register('customBinder', customBinderAttribute);
});
```

* [ ] Model
* [ ] Model binder
* [ ] Data annotation
* [ ] View engine

License 
--------
[MIT](LICENSE)
