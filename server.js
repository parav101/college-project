/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Paravdeep Singh Student ID: psingh532 Date: 2022-04-09
*
*  Online (Heroku) Link: https://sleepy-reef-40133.herokuapp.com
*
********************************************************************************/ 

const express = require("express");
const app = express();
var path = require("path");
var blogsev = require("./blog-service.js");
const blogData = require("./blog-service");// for the given code
const fs = require("fs"); // required at the top of your blogsevule
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');
const authData = require("./auth-service.js");
const clientSessions = require('client-sessions');



const HTTP_PORT = process.env.PORT || 8080;
cloudinary.config({
  cloud_name: 'dfowfgnrv',
  api_key: '657881896445247',
  api_secret: 'ZaDsOOwkT53yxl9hTdxyR0Q6KWo',
  secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public\css"));

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "week10example_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(express.urlencoded({ extended: true })); // middleware as bodyParser


//setting up the hbs
app.engine(".hbs", exphbs.engine({ 
  extname: ".hbs" ,
  defaultLayout: 'main',
  helpers: { 
      navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
       },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
       },
      safeHTML: function(context){
        return stripJs(context);
       },
       formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
       }
    
    
    }   

}));
app.set("view engine", ".hbs");



app.get("/", function(req,res){
    res.redirect("/blog")
  });
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
}

  app.get("/about", function(req,res){
    // res.sendFile(path.join(__dirname, "/views/about.hbs"));
    res.render('about')
    });
    app.get("/posts/add",ensureLogin,function(req,res){
      //res.sendFile(path.join(__dirname, "/views/addPost.html"));
      return new Promise((resolve, reject) => {
        blogsev.getCategories().then((data)=>{
          res.render("addPost", {categories: data});
        }).catch((err)=>{
          res.render("addPost", {categories: []}); 
        })
      })
      
    });
    app.get("/categories/add", ensureLogin,function(req,res){
      //res.sendFile(path.join(__dirname, "/views/addPost.html"));
      res.render('addCategory')
    });
    

    // app.get("/blog", function(req,res){
    //   blogsev.getPublishedPosts().then((data)=>{
    //       res.json(data); 
    //   }).catch((err)=>{
    //       res.send(err);
    //   });
    // });
    app.get('/blog', async (req, res) => {
     
      // Declare an object to store properties for the view
      // let viewData = {};
      var viewData = { post: { }, posts: [ ],  categories: [ ] };

      try{

          // declare empty array to hold "post" objects
          let posts = [];

          // if there's a "category" query, filter the returned posts by category
          if(req.query.category){
              // Obtain the published "posts" by category
              posts = await blogData.getPublishedPostsByCategory(req.query.category);
          }else{
              // Obtain the published "posts"
              posts = await blogData.getPublishedPosts();
          }

          // sort the published posts by postDate
          posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

          // get the latest post from the front of the list (element 0)
          let post = posts[0]; 

          // store the "posts" and "post" data in the viewData object (to be passed to the view)
          viewData.posts = posts;
          viewData.post = post;

      }catch(err){
          viewData.message = "no results";
      }

      try{
          // Obtain the full list of "categories"
          let categories = await blogData.getCategories();

          // store the "categories" data in the viewData object (to be passed to the view)
          viewData.categories = categories;
      }catch(err){
          viewData.categoriesMessage = "no results"
      }

      // render the "blog" view with all of the data (viewData)
      res.render("blog", {data: viewData})

  });

    app.get('/blog/:id', async (req, res) => {

      // Declare an object to store properties for the view
      var viewData = { post: { }, posts: [ ],  categories: [ ] };
     
      try{

          // declare empty array to hold "post" objects
          let posts = [];

          // if there's a "category" query, filter the returned posts by category
          if(req.query.category){
           
              // Obtain the published "posts" by category
              posts = await blogData.getPublishedPostsByCategory(req.query.category);
            
          }else{
           
              // Obtain the published "posts"
              posts = await blogData.getPublishedPosts();
              

          }

          // sort the published posts by postDate
          posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

          // store the "posts" and "post" data in the viewData object (to be passed to the view)
          viewData.posts = posts;

      }catch(err){
          viewData.message = "no results";
      }

      try{
          // Obtain the post by "id"
          viewData.post = await blogData.getPostById(req.params.id);
      }catch(err){
          viewData.message = "no results"; 
      }

      try{
          // Obtain the full list of "categories"
          let categories = await blogData.getCategories();

          // store the "categories" data in the viewData object (to be passed to the view)
          viewData.categories = categories;
      }catch(err){
          viewData.categoriesMessage = "no results"
      }

      // render the "blog" view with all of the data (viewData)
      res.render("blog", {data: viewData})
  });

  app.get("/posts", ensureLogin,function(req,res){ //remeber this takes diffent parmas
    if(req.query.category){
      blogsev.getPostsByCategory(req.query.category).then((data)=>{
          if(data.length > 0){
            res.render("posts", {posts: data});
          }else{
            res.render("posts",{ message: "no results" });
          }
      }).catch((err)=>{
        res.render("posts", {message: "no results"});
      });
    }else if(req.query.minDate){
      blogsev.getPostsByMinDate(req.query.minDate).then((data)=>{
          if(data.length > 0){
            res.render("posts", {posts: data});
          }else{
            res.render("posts",{ message: "no results" });
          }
      }).catch((err)=>{
        res.render("posts", {message: "no results"});
      });
    }else{
      blogsev.getAllPosts().then((data)=>{
          if(data.length > 0){
            res.render("posts", {posts: data});
          }else{
            res.render("posts",{ message: "no results" });
          }
      }).catch((err)=>{
        res.render("posts", {message: "no results"});
      });
    
    }
    // blogsev.getAllPosts().then((data)=>{
    //   res.json(data); 
    // }).catch((err)=>{
    //   res.send(err);
    // });
       
  });

  app.get("/post/:id",ensureLogin,(req,res)=>{
    blogsev.getPostById(req.params.id).then((data)=>{
      res.send(data);
  }).catch((err)=>{
      res.send(err);
  });
  });

  app.get("/categories/delete/:id",ensureLogin,(req,res)=>{
      blogsev.deleteCategoryById(req.params.id).then((data)=>{
        res.redirect("/categories");
    }).catch((err)=>{
        res.sendStatus(500);
        res.send("Unable to Remove Category / Category not found");
    });
  });
  app.get("/posts/delete/:id",ensureLogin,(req,res)=>{
    blogsev.deletePostById(req.params.id).then((data)=>{
      res.redirect("/posts");
  }).catch((err)=>{
      res.sendStatus(500);
      res.send("Unable to Remove Post / Post not found");
  });
});

  app.get("/categories",ensureLogin, function(req,res){
    blogsev.getCategories().then((data)=>{
      if(data.length > 0){
        res.render("categories", {categories: data});
      }else{
        res.render("categories",{ message: "no results" });
      }
     
    }).catch((err)=>{
      res.render("categories", {message: "no results"});
    });
  });

  app.use(upload.single("featureImage"))

  app.post("/posts/add",ensureLogin,(req,res)=>{
      if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl){
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        var formData = req.body;
        blogsev.addPost(formData).then(()=>{
            res.redirect("/posts");
          }).catch((err)=>{
            res.send(err);
        });
    }
  })
  
  app.post("/categories/add",ensureLogin,(req,res)=>{
   
      // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
      var formData = req.body;
      blogsev.addCategory(formData).then(()=>{
          res.redirect("/categories");
        }).catch((err)=>{
          res.send(err);
      });
})
//session routes updates
app.get("/login",(req,res)=>{
  res.render("login");
})

app.get("/register",(req,res)=>{
  res.render("register");
})

app.post("/register",(req,res)=>{
  var userData = req.body;
  authData.registerUser(userData).then(()=>{
    res.render("register",{successMessage: "User created"});
    // res.render("posts",{ message: "no results" });
  }).catch((err)=>{
    res.render("register",{errorMessage: err, userName: req.body.userName});
});

})

app.post("/login",(req,res)=>{
  req.body.userAgent = req.get('User-Agent');
  // var userData = req.body;
  authData.checkUser(req.body).then((user) => {
    req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email,// authenticated user's email
        loginHistory: user.loginHistory// authenticated user's loginHistory
    }

    res.redirect('/posts');


  }).catch((err)=>{
    res.render("login",{errorMessage: err, userName: req.body.userName});
});

})

app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/login");
});

app.get("/userHistory", ensureLogin, function(req, res) {
  res.render("userHistory");
  
});
// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
  // res.status(404).send("Page Not Found");
  res.status(404).render("404");
});

// listen on port HTTP_PORT. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
// blogsev.initialize().then(()=>{
//     app.listen(HTTP_PORT, onHttpStart);
// })
// .catch(function(reason){
//     console.log(reason);
// });
blogData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

