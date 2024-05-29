    // const fs = require("fs"); // required at the top of your module
    // var posts = []; 	
    // var categories= [] ;

    // var localFunction = function () {
    //     // a function local to this module
    //   }
      
    //   var localMessage = "";
      
    const Sequelize = require('sequelize');

    var sequelize = new Sequelize('d9mgehlndp5sjr', 'mpdyasuhermspy', '041ca95e92ac449192023238b8668d03f15d08e8d36270e7b2107c182f9151f3', {
        host: 'ec2-3-225-213-67.compute-1.amazonaws.com',
        dialect: 'postgres',
        port: 5432,
        dialectOptions: {
            ssl: { rejectUnauthorized: false }
        },
        query: { raw: true }
    });
    var Post = sequelize.define('Post', {
        body: Sequelize.TEXT, // the user's full name (ie: "Jason Bourne")
        title: Sequelize.STRING, // the user's title within the project (ie, developer)
        postDate: Sequelize.DATE, // the user's title within the project (ie, developer)
        featureImage: Sequelize.STRING, // the user's title within the project (ie, developer)
        published: Sequelize.BOOLEAN // the user's title within the project (ie, developer)
    });

    var Category = sequelize.define('Category', {
        category: Sequelize.TEXT, // the user's full name (ie: "Jason Bourne")
    });

    Post.belongsTo(Category, {foreignKey: 'category'});

    const Op = Sequelize.Op

      module.exports.initialize = function(){
        return new Promise( (resolve,reject)=>{
            
           sequelize.sync().then(function () {
            resolve("the operation was a success");
            }).catch(function (error) {
                reject("unable to sync the database");
            }) 
       })
    }   
   
      module.exports.readMessage = function () {
        console.log(localMessage + " from " +  __filename);
      }

      module.exports.getAllPosts = function(){
        return new Promise((resolve,reject)=>{
            Post.findAll({ 
            }).then(function(data){
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        })
      }

      module.exports.getPostsByCategory = function(category){
        return new Promise((resolve,reject)=>{
           
            Post.findAll({ 
                where:{category:category}
            }).then(function(data){
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        })
      }
      module.exports.getPostsByMinDate = function(minDateStr){
        return new Promise((resolve,reject)=>{
            Post.findAll({ 
                where:{postDate:{
                    [Op.gte]:new Date(minDateStr) //date gte?
                }}
            }).then(function(data){
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 

        })
      }
      module.exports.getPostById = function(id){ // user element position in the array to mimic id
        return new Promise((resolve,reject)=>{
            Post.findAll({ 
                where:{id:id} //do we have id???
            }).then(function(data){
                resolve(data[0]);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        })
      }


      module.exports.getPublishedPosts = function(){
        return new Promise((resolve,reject)=>{
            Post.findAll({ 
                where:{published:true} //do we have id???
            }).then(function(data){
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        })
      }


      module.exports.getCategories = function(){
        return new Promise((resolve,reject)=>{
            Category.findAll({ 
            }).then(function(data){
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
           })
      }

      module.exports.addPost = function(postData){
    
        return new Promise((resolve,reject)=>{
            postData.published = (postData.published) ? true : false;
            let today = new Date();
            const yyyy = today.getFullYear();
            let mm = today.getMonth() + 1; // Months start at 0!
            let dd = today.getDate();

            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

            today = yyyy + '-' + mm + '-' + dd;

            postData.postDate = new Date();
            console.log(postData);
            console.log("::::::::::::::::");
            
        
            for(const prop in postData){
                if(postData.prop = ""){
                    postData.prop = null;
                }
            }
            console.log(postData);
            if(postData.category){
                Post.create({
                    body:postData.body,
                    title:postData.title,
                    postDate:postData.postDate,
                    published:postData.published,
                    category:postData.category,
                    featureImage:postData.featureImage
                }).then(function () {
                    // you can now access the newly created Project via the variable project
                    resolve("success");
                }).catch(function (error) {
                    reject(error);
                });
            }else{
                Post.create({
                    body:postData.body,
                    title:postData.title,
                    postDate:postData.postDate,
                    published:postData.published,
                    featureImage:postData.featureImage
                }).then(function () {
                    // you can now access the newly created Project via the variable project
                    resolve("success");
                }).catch(function (error) {
                    reject(error);
                });
            }
           
            
        })
    }

    module.exports.getPublishedPostsByCategory = function(category){
        return new Promise((resolve,reject)=>{
          
            Post.findAll({ 
                where:{published:true,category:category} 
            }).then(function(data){
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        })
      }

      module.exports.addCategory = function(categoryData){
        return new Promise((resolve,reject)=>{
            for(const prop in categoryData){
                if(categoryData.prop = ""){
                    categoryData.prop = null;
                }
            }
            
            Category.create({
                category: categoryData.Category
            }).then(function () {
                // you can now access the newly created Project via the variable project
                resolve("success");
            }).catch(function (error) {
                reject("unable to create category");
            });
        })
      }

      module.exports.deleteCategoryById = function(id){
        return new Promise((resolve,reject)=>{
            Category.destroy({
                where: { id: id } 
            }).then(function(data){
                resolve();  //data ?????????
            }).catch(function (error) {
                reject("delete was rejected");
            }); 
        })
      }

      module.exports.deletePostById = function(id){
        return new Promise((resolve,reject)=>{
            Post.destroy({
                where: { id: id } 
            }).then(function(data){
                resolve();  //data ?????????
            }).catch(function (error) {
                reject("delete was rejected");
            }); 
        })
      }