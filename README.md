# Client Auth Mini

[Lecture video link](https://www.youtube.com/watch?v=sqf1bh7kD3I&feature=youtu.be)

## Topics
This Client Auth lab will be touching on the following topics:
 * Client-side authentication via sessions and JSON web tokens
 * [CORS (Cross Origin Resource Sharing)](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 * Using [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for client-side persistence
 * [React Higher Order Components](https://facebook.github.io/react/docs/higher-order-components.html)

## Description
In this mini lab, we'll be extending the server that we built in the Auth lab in order to prepare for the main lab.

### Todos
 * Navigate to your Auth sprint repository
 * Change the name of your `log-in` route to `login` 
 * Add a `logout` POST route that removes the user from the session
 * If you didn't get around to the extra credit of adding a `/restricted/users` route along with the appropriate middleware, now's your chance to add that
 * Change the port number that your server connects to in `app.js` to 5000
 * Run `npm install --save-dev cors` to install the node CORS middleware, then somewhere at the top of `server.js`, add  
```
 const corsOptions = {
     "origin": "http://localhost:3000",
     "credentials": true
 };
 server.use(cors(corsOptions));
 ```
 * Test your routes in Postman to ensure that they still work as expected

While typically we wouldn't want to add the CORS middleware to every single route in a production API, for the client auth lab, we'll be using most of the 
routes in our auth server, so it's easier to just add it to the entire server. Feel free to add the CORS middleware locally to each route if you'd like. 

---

Overall, not that much going on in this particular mini lab. It was kind of hard to come up with a mini lab exercise that could touch on all of the topics
that we'll be covering in this lab without bloating the scope of the exercise too much. 

If you finished that quickly and are just sitting around twiddling your thumbs now, here are a few good articles to read:

[https://scotch.io/tutorials/the-anatomy-of-a-json-web-token](https://scotch.io/tutorials/the-anatomy-of-a-json-web-token): Some cool analysis on what JWTs
_look_ like.

[https://ponyfoo.com/articles/json-web-tokens-vs-session-cookies](https://ponyfoo.com/articles/json-web-tokens-vs-session-cookies): This article does a pretty
good job of comparing and contrasting the usage of JSON web tokens and server-side sessions. 

[http://restlet.com/company/blog/2015/12/15/understanding-and-using-cors/](http://restlet.com/company/blog/2015/12/15/understanding-and-using-cors/): This one
is long and a bit dense, but is packed with lots of great info on the underlying mechanisms that power CORS.

[https://www.robinwieruch.de/gentle-introduction-higher-order-components/](https://www.robinwieruch.de/gentle-introduction-higher-order-components/): Another 
long and dense one, this one all about React higher-order components. Lots of good stuff in this one, though only about the first half (before he starts talking
about the `recompose` library) is most applicable to our use case.  
